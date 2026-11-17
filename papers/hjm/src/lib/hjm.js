function assertFinite(name, value) {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite.`);
}

function assertIncreasing(values, name, minimumLength = 1) {
  if (!Array.isArray(values) || values.length < minimumLength)
    throw new TypeError(`${name} must contain at least ${minimumLength} values.`);
  values.forEach((value, index) => {
    assertFinite(`${name}[${index}]`, value);
    if (index && value <= values[index - 1])
      throw new RangeError(`${name} must be strictly increasing.`);
  });
}

function volatilityAt(factor, time, maturity) {
  const value = factor(time, maturity);
  assertFinite("Volatility", value);
  return value;
}

export function interpolateForwardCurve(knots, maturities) {
  if (!Array.isArray(knots) || knots.length < 2)
    throw new TypeError("At least two forward-curve knots are required.");
  assertIncreasing(knots.map((point) => point.maturity), "Knot maturities", 2);
  if (knots[0].maturity <= 0) throw new RangeError("Knot maturities must be positive.");
  knots.forEach((point, index) => assertFinite(`Knot rate ${index}`, point.rate));
  assertIncreasing(maturities, "Maturities");
  if (maturities[0] <= 0) throw new RangeError("Maturities must be positive.");

  return maturities.map((maturity) => {
    if (maturity <= knots[0].maturity) return knots[0].rate;
    for (let index = 1; index < knots.length; index += 1) {
      const right = knots[index];
      if (maturity <= right.maturity) {
        const left = knots[index - 1];
        const weight = (maturity - left.maturity) / (right.maturity - left.maturity);
        return left.rate + weight * (right.rate - left.rate);
      }
    }
    return knots.at(-1).rate;
  });
}

export function hjmRiskNeutralDrift(time, maturity, volatilityFactors, integrationSteps = 96) {
  assertFinite("Time", time);
  assertFinite("Maturity", maturity);
  if (time < 0 || maturity < time) throw new RangeError("Maturity must be at or after nonnegative time.");
  if (!Array.isArray(volatilityFactors) || volatilityFactors.some((factor) => typeof factor !== "function"))
    throw new TypeError("Volatility factors must be functions of time and maturity.");
  if (!Number.isInteger(integrationSteps) || integrationSteps < 1)
    throw new RangeError("Integration steps must be a positive integer.");
  if (maturity === time) return 0;

  const width = (maturity - time) / integrationSteps;
  return volatilityFactors.reduce((drift, factor) => {
    let integral = 0;
    let previous = volatilityAt(factor, time, time);
    for (let index = 1; index <= integrationSteps; index += 1) {
      const current = volatilityAt(factor, time, time + index * width);
      integral += ((previous + current) / 2) * width;
      previous = current;
    }
    return drift + volatilityAt(factor, time, maturity) * integral;
  }, 0);
}

export function evolveForwardCurve(rates, maturities, time, timeStep, volatilityFactors, brownianIncrements) {
  assertIncreasing(maturities, "Maturities");
  if (!Array.isArray(rates) || rates.length !== maturities.length)
    throw new RangeError("Rates and maturities must have the same length.");
  rates.forEach((rate, index) => assertFinite(`Rate ${index}`, rate));
  assertFinite("Time", time);
  assertFinite("Time step", timeStep);
  if (time < 0 || timeStep <= 0) throw new RangeError("Time must be nonnegative and the time step positive.");
  if (!Array.isArray(volatilityFactors) || !Array.isArray(brownianIncrements) ||
      volatilityFactors.length !== brownianIncrements.length)
    throw new RangeError("Each volatility factor needs one Brownian increment.");
  brownianIncrements.forEach((increment, index) => assertFinite(`Brownian increment ${index}`, increment));

  return rates.map((rate, index) => {
    const maturity = maturities[index];
    if (maturity <= time) throw new RangeError("Every simulated maturity must be later than current time.");
    const drift = hjmRiskNeutralDrift(time, maturity, volatilityFactors);
    const diffusion = volatilityFactors.reduce(
      (sum, factor, factorIndex) => sum + volatilityAt(factor, time, maturity) * brownianIncrements[factorIndex],
      0,
    );
    return rate + drift * timeStep + diffusion;
  });
}

export function conditionFactorShockAtMaturity({
  time,
  timeStep,
  maturity,
  volatilityFactors,
  factorIndex,
  targetMove,
  otherIncrements = [],
}) {
  assertFinite("Target move", targetMove);
  assertFinite("Time step", timeStep);
  if (timeStep <= 0) throw new RangeError("Time step must be positive.");
  if (!Array.isArray(volatilityFactors) || volatilityFactors.some((factor) => typeof factor !== "function"))
    throw new TypeError("Volatility factors must be functions of time and maturity.");
  if (!Number.isInteger(factorIndex) || factorIndex < 0 || factorIndex >= volatilityFactors.length)
    throw new RangeError("Shock factor index is outside the factor set.");
  if (!Array.isArray(otherIncrements) || otherIncrements.length !== volatilityFactors.length)
    throw new RangeError("Provide one starting increment per volatility factor.");
  const increments = [...otherIncrements];
  increments.forEach((increment, index) => assertFinite(`Brownian increment ${index}`, increment));

  const drift = hjmRiskNeutralDrift(time, maturity, volatilityFactors);
  const otherFactorMove = volatilityFactors.reduce(
    (sum, factor, index) => index === factorIndex
      ? sum
      : sum + volatilityAt(factor, time, maturity) * increments[index],
    0,
  );
  const shockVolatility = volatilityAt(volatilityFactors[factorIndex], time, maturity);
  if (shockVolatility === 0) throw new RangeError("The selected factor has no loading at the shock maturity.");
  increments[factorIndex] = (targetMove - drift * timeStep - otherFactorMove) / shockVolatility;
  return increments;
}
