function assertFinite(name, value) {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite.`);
}

function validate({ forward, strike, maturity, alpha, beta, rho, nu }, { normal = false } = {}) {
  for (const [name, value] of Object.entries({ forward, strike, maturity, alpha, beta, rho, nu }))
    assertFinite(name, value);
  if ((!normal && (forward <= 0 || strike <= 0)) || maturity <= 0 || alpha <= 0 || nu < 0)
    throw new RangeError("Forward, strike, maturity, and alpha must be positive; nu cannot be negative.");
  if (beta < 0 || beta > 1 || rho <= -1 || rho >= 1)
    throw new RangeError("Beta must be in [0, 1] and rho strictly between -1 and 1.");
}

function zOverX(z, rho) {
  if (Math.abs(z) < 1e-6)
    return 1 + (rho * z) / 2 + ((2 - 3 * rho ** 2) * z ** 2) / 12;
  const root = Math.sqrt(1 - 2 * rho * z + z ** 2);
  const x = Math.log((root + z - rho) / (1 - rho));
  if (!Number.isFinite(x) || x === 0) throw new RangeError("SABR z/x(z) is outside the stable numerical range.");
  return z / x;
}

export function sabrBlackVol({ forward, strike, maturity, alpha, beta, rho, nu }) {
  validate({ forward, strike, maturity, alpha, beta, rho, nu });
  const oneMinusBeta = 1 - beta;
  const logMoneyness = Math.log(forward / strike);
  const geometricForward = Math.sqrt(forward * strike);
  const scale = geometricForward ** oneMinusBeta;
  const z = (nu / alpha) * scale * logMoneyness;
  const logCorrection =
    1 +
    (oneMinusBeta ** 2 * logMoneyness ** 2) / 24 +
    (oneMinusBeta ** 4 * logMoneyness ** 4) / 1920;
  const timeCorrection =
    1 +
    (
      (oneMinusBeta ** 2 * alpha ** 2) / (24 * scale ** 2) +
      (rho * beta * nu * alpha) / (4 * scale) +
      ((2 - 3 * rho ** 2) * nu ** 2) / 24
    ) *
      maturity;
  const volatility = (alpha / scale) * (zOverX(z, rho) / logCorrection) * timeCorrection;
  if (!Number.isFinite(volatility) || volatility <= 0)
    throw new RangeError("SABR approximation produced a nonpositive or nonfinite volatility.");
  return volatility;
}

export function sabrNormalVol({ forward, strike, maturity, alpha, beta, rho, nu }) {
  if (beta !== 0) throw new RangeError("The normal SABR quote is defined here for beta = 0.");
  validate({ forward, strike, maturity, alpha, beta, rho, nu }, { normal: true });
  const z = (nu / alpha) * (forward - strike);
  const timeCorrection = 1 + ((2 - 3 * rho ** 2) * nu ** 2 * maturity) / 24;
  const volatility = alpha * zOverX(z, rho) * timeCorrection;
  if (!Number.isFinite(volatility) || volatility <= 0)
    throw new RangeError("Normal SABR approximation produced a nonpositive or nonfinite volatility.");
  return volatility;
}

export function sabrSmileVol(parameters, strike) {
  return parameters.beta === 0
    ? sabrNormalVol({ ...parameters, strike })
    : sabrBlackVol({ ...parameters, strike });
}

export function applySabrShock(parameters, standardDeviations, maturityStep = 0.25) {
  assertFinite("standardDeviations", standardDeviations);
  assertFinite("maturityStep", maturityStep);
  if (Math.abs(standardDeviations) > 3 || maturityStep <= 0 || maturityStep > 1)
    throw new RangeError("Shock must be within three standard deviations and the time step in (0, 1].");
  const brownianForwardMove = standardDeviations * Math.sqrt(maturityStep);
  const forward = parameters.forward + parameters.alpha * parameters.forward ** parameters.beta * brownianForwardMove;
  if (parameters.beta !== 0 && forward <= 0)
    throw new RangeError("This lognormal-forward shock would cross zero.");
  const alpha =
    parameters.alpha *
    Math.exp(parameters.nu * parameters.rho * brownianForwardMove - 0.5 * parameters.nu ** 2 * maturityStep);
  if (!Number.isFinite(alpha) || alpha <= 0)
    throw new RangeError("The correlated volatility shock is outside the stable numerical range.");
  return { ...parameters, forward, alpha };
}

export function sampleSmile(parameters, strikes) {
  if (!Array.isArray(strikes) || strikes.length < 2)
    throw new RangeError("At least two strikes are required.");
  return strikes.map((strike) => sabrSmileVol(parameters, strike));
}
