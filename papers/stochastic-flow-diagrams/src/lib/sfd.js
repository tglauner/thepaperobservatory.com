/**
 * Small, deterministic teaching models for Stochastic Flow Diagrams.
 * Matrix entries use [target equation][source regressor] orientation.
 * Coefficients are signed regression weights, not transition probabilities.
 */

const MAX_STEPS = 200;
const MAX_MAGNITUDE = 1e12;
const STABILITY_TOLERANCE = 1e-9;

function finite(value, label) {
  if (!Number.isFinite(value)) throw new TypeError(`${label} must be finite.`);
}

function vector(values, label = "Vector", length = null) {
  if (!Array.isArray(values) || values.length === 0) {
    throw new TypeError(`${label} must be a nonempty array.`);
  }
  if (length !== null && values.length !== length) {
    throw new RangeError(`${label} must have ${length} entries.`);
  }
  values.forEach((value) => finite(value, `${label} entry`));
  return values.length;
}

function square(matrix, label = "Matrix", dimension = null) {
  if (!Array.isArray(matrix) || matrix.length === 0) {
    throw new TypeError(`${label} must be a nonempty square matrix.`);
  }
  const n = dimension ?? matrix.length;
  if (matrix.length !== n)
    throw new RangeError(`${label} must have ${n} rows.`);
  matrix.forEach((row) => vector(row, `${label} row`, n));
  return n;
}

function model(coefficients) {
  if (
    !Array.isArray(coefficients) ||
    coefficients.length === 0 ||
    coefficients.length > 20
  ) {
    throw new RangeError(
      "Supply between one and twenty lag coefficient matrices.",
    );
  }
  const n = square(coefficients[0], "First lag coefficient matrix");
  if (n > 20)
    throw new RangeError(
      "The teaching model supports at most twenty variables.",
    );
  coefficients.forEach((matrix, lag) =>
    square(matrix, `Lag ${lag + 1} coefficient matrix`, n),
  );
  return n;
}

function finiteResult(value, label) {
  if (!Number.isFinite(value))
    throw new RangeError(`${label} overflowed finite arithmetic.`);
  return value;
}

function safeSimulationVector(values, time, label) {
  values.forEach((value) => {
    if (!Number.isFinite(value) || Math.abs(value) > MAX_MAGNITUDE) {
      throw new RangeError(
        `${label} exceeded the ${MAX_MAGNITUDE} teaching-model limit at t=${time}. Reduce the horizon or coefficients; values are never clipped.`,
      );
    }
  });
}

export function dot(a, b) {
  const n = vector(a);
  vector(b, "Second vector", n);
  return finiteResult(
    a.reduce((sum, value, i) => sum + value * b[i], 0),
    "Dot product",
  );
}

export function matrixVector(matrix, values) {
  const n = vector(values);
  if (!Array.isArray(matrix) || matrix.length === 0)
    throw new TypeError("Matrix must have at least one row.");
  matrix.forEach((row) => vector(row, "Matrix row", n));
  return matrix.map((row) => dot(row, values));
}

function identity(n) {
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => Number(i === j)),
  );
}

function matrixMultiply(a, b) {
  const n = a.length;
  return a.map((row) =>
    Array.from({ length: n }, (_, j) =>
      finiteResult(
        row.reduce((sum, value, k) => sum + value * b[k][j], 0),
        "Matrix product",
      ),
    ),
  );
}

export function matrixPower(matrix, exponent) {
  const n = square(matrix);
  if (!Number.isSafeInteger(exponent) || exponent < 0) {
    throw new RangeError("Matrix exponent must be a nonnegative safe integer.");
  }
  let result = identity(n);
  let base = matrix.map((row) => [...row]);
  let remaining = exponent;
  while (remaining > 0) {
    if (remaining % 2 === 1) result = matrixMultiply(result, base);
    remaining = Math.floor(remaining / 2);
    if (remaining > 0) base = matrixMultiply(base, base);
  }
  return result;
}

export function cumulativeSeries(rates) {
  if (!Array.isArray(rates) || rates.length === 0)
    throw new TypeError("Rates must include at least t=0.");
  const n = vector(rates[0], "First rate observation");
  const running = Array(n).fill(0);
  return rates.map((row) => {
    vector(row, "Rate observation", n);
    return row.map((value, i) => {
      running[i] = finiteResult(running[i] + value, "Cumulative series");
      return running[i];
    });
  });
}

/**
 * y_0 is exactly `shock`, not a recursively generated observation.
 * history[0] = y_-1, history[1] = y_-2, etc.; missing history is zero.
 * innovations[t] is added at t >= 1; an optional entry at t=0 must be zero.
 * All time-indexed outputs include t=0 through t=steps, inclusive.
 * contributions[t][target][lagIndex][source] excludes the new innovation.
 * At t=0 contributions are zero because the initial shock is imposed directly.
 */
export function simulateVAR({
  coefficients,
  shock,
  steps = 30,
  innovations = null,
  history = null,
} = {}) {
  const n = model(coefficients);
  const lagCount = coefficients.length;
  vector(shock, "Initial shock", n);
  if (!Number.isInteger(steps) || steps < 0 || steps > MAX_STEPS)
    throw new RangeError(`Steps must be an integer from 0 to ${MAX_STEPS}.`);
  const prehistory = history ?? [];
  if (!Array.isArray(prehistory) || prehistory.length > lagCount)
    throw new RangeError(
      "History must be an array with at most one observation per lag.",
    );
  prehistory.forEach((row) => vector(row, "History observation", n));
  if (
    innovations !== null &&
    (!Array.isArray(innovations) || innovations.length > steps + 1)
  )
    throw new RangeError(
      "Innovations must be an array indexed from t=0 through the chosen horizon.",
    );
  innovations?.forEach((row) => vector(row, "Innovation observation", n));
  if (innovations?.[0]?.some((value) => value !== 0))
    throw new RangeError(
      "Innovations at t=0 must be zero; the initial shock already defines y_0.",
    );

  const zeroContributions = () =>
    Array.from({ length: n }, () =>
      Array.from({ length: lagCount }, () => Array(n).fill(0)),
    );
  const rates = [[...shock]];
  const contributions = [zeroContributions()];
  const innovationSeries = Array.from({ length: steps + 1 }, (_, t) => [
    ...(innovations?.[t] ?? Array(n).fill(0)),
  ]);
  safeSimulationVector(shock, 0, "Initial rate");

  for (let t = 1; t <= steps; t++) {
    const byTarget = Array.from({ length: n }, (_, target) =>
      coefficients.map((matrix, lagIndex) => {
        const previousTime = t - lagIndex - 1;
        const previous =
          previousTime >= 0
            ? rates[previousTime]
            : (prehistory[-previousTime - 1] ?? Array(n).fill(0));
        return matrix[target].map(
          (coefficient, source) => coefficient * previous[source],
        );
      }),
    );
    const next = byTarget.map((lags, target) =>
      lags
        .flat()
        .reduce((sum, value) => sum + value, innovationSeries[t][target]),
    );
    safeSimulationVector(next, t, "Rate");
    rates.push(next);
    contributions.push(byTarget);
  }

  const cumulative = cumulativeSeries(rates);
  cumulative.forEach((row, t) =>
    safeSimulationVector(row, t, "Cumulative level"),
  );
  return {
    times: rates.map((_, t) => t),
    rates,
    cumulative,
    contributions,
    innovations: innovationSeries,
    diagnostics: {
      truncated: false,
      finite: true,
      steps,
      magnitudeLimit: MAX_MAGNITUDE,
      maxAbsoluteRate: Math.max(...rates.flat().map(Math.abs)),
      maxAbsoluteCumulative: Math.max(...cumulative.flat().map(Math.abs)),
    },
  };
}

/** Eigenvalues use complex arithmetic; discrete-time stability uses modulus. */
export function eigenvalues2(matrix) {
  square(matrix, "Two-variable matrix", 2);
  const [[a, b], [c, d]] = matrix;
  const center = a / 2 + d / 2;
  const halfDifference = a / 2 - d / 2;
  const discriminant = finiteResult(
    halfDifference ** 2 + b * c,
    "Eigenvalue discriminant",
  );
  const offset = Math.sqrt(Math.abs(discriminant));
  return [1, -1].map((sign) => {
    const re = discriminant >= 0 ? center + sign * offset : center;
    const im = discriminant >= 0 ? 0 : sign * offset;
    return {
      re: finiteResult(re, "Eigenvalue"),
      im: finiteResult(im, "Eigenvalue"),
      modulus: finiteResult(Math.hypot(re, im), "Eigenvalue modulus"),
    };
  });
}

export function spectralRadius2(matrix) {
  return Math.max(...eigenvalues2(matrix).map((value) => value.modulus));
}

export function classifyStability2(matrix, tolerance = STABILITY_TOLERANCE) {
  finite(tolerance, "Stability tolerance");
  if (tolerance < 0 || tolerance >= 1)
    throw new RangeError("Stability tolerance must lie between zero and one.");
  const eigenvalues = eigenvalues2(matrix);
  const radius = Math.max(...eigenvalues.map((value) => value.modulus));
  const kind =
    radius < 1 - tolerance
      ? "stable"
      : radius > 1 + tolerance
        ? "explosive"
        : "boundary";
  const descriptions = {
    stable: [
      "Asymptotically stable",
      "Every mode decays asymptotically in this fixed linear model, although transient amplification can occur.",
    ],
    boundary: [
      "Unit-circle boundary",
      "Persistence, oscillation and possible polynomial growth require more information than spectral radius alone.",
    ],
    explosive: [
      "Explosive mode",
      "At least one mode grows for some initial conditions; a particular shock can fail to excite that mode.",
    ],
  };
  return {
    radius,
    kind,
    label: descriptions[kind][0],
    description: descriptions[kind][1],
    eigenvalues,
    margin: 1 - radius,
    tolerance,
  };
}

export function ar2Companion(phi1, phi2) {
  finite(phi1, "First-lag coefficient");
  finite(phi2, "Second-lag coefficient");
  return [
    [phi1, phi2],
    [1, 0],
  ];
}

/** Top block is [Phi_1 ... Phi_p]; lower blocks shift the lag memory. */
export function companionMatrix(coefficients) {
  const n = model(coefficients);
  const size = n * coefficients.length;
  return Array.from({ length: size }, (_, row) =>
    Array.from({ length: size }, (_, column) => {
      if (row < n) return coefficients[Math.floor(column / n)][row][column % n];
      return Number(column === row - n);
    }),
  );
}

export function inverse2(matrix) {
  square(matrix, "Two-variable matrix", 2);
  const scale = Math.max(...matrix.flat().map(Math.abs));
  if (scale === 0)
    throw new RangeError("The matrix is singular and cannot be inverted.");
  const [[a, b], [c, d]] = matrix.map((row) =>
    row.map((value) => value / scale),
  );
  const determinant = a * d - b * c;
  if (Math.abs(determinant) < 1e-12)
    throw new RangeError(
      "The matrix is singular or too ill-conditioned to invert reliably.",
    );
  const denominator = scale * determinant;
  return [
    [d, -b],
    [-c, a],
  ].map((row) =>
    row.map((value) =>
      value === 0 ? 0 : finiteResult(value / denominator, "Matrix inverse"),
    ),
  );
}

/** Algebraic (I-A)^-1. It equals sum A^t only when spectral radius is < 1. */
export function resolvent2(matrix) {
  square(matrix, "Two-variable matrix", 2);
  return inverse2(
    matrix.map((row, i) => row.map((value, j) => Number(i === j) - value)),
  );
}

export function longRunCumulative2(matrix, shock) {
  vector(shock, "Initial shock", 2);
  if (classifyStability2(matrix).kind !== "stable")
    throw new RangeError(
      "An infinite cumulative impulse response requires spectral radius strictly below one.",
    );
  return matrixVector(resolvent2(matrix), shock);
}

export function paperPresets() {
  return [
    [
      "stable",
      "Stable",
      1 / 4,
      "The source's two-market example: later rates decay and cumulative levels approach finite limits.",
    ],
    [
      "steady",
      "Persistent",
      1 / 2,
      "The source's steady example: this specific initial shock leaves a persistent rate and linearly drifting cumulative levels.",
    ],
    [
      "explosive",
      "Explosive",
      2 / 3,
      "The source's explosive example: the initial shock excites a mode with eigenvalue 4/3.",
    ],
  ].map(([id, title, value, description]) => ({
    id,
    title,
    matrix: [
      [value, -value],
      [-value, value],
    ],
    shock: [-0.5, 0],
    sourcePdfPage: id === "explosive" ? 15 : 14,
    printedPage: id === "explosive" ? 34 : 33,
    description,
  }));
}

function normalGenerator(seed) {
  if (!Number.isSafeInteger(seed))
    throw new TypeError("Random seed must be a safe integer.");
  let state = seed >>> 0;
  let spare = null;
  const uniform = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let value = state;
    value = Math.imul(value ^ (value >>> 15), value | 1);
    value ^= value + Math.imul(value ^ (value >>> 7), value | 61);
    return ((value ^ (value >>> 14)) >>> 0) / 4294967296;
  };
  return () => {
    if (spare !== null) {
      const result = spare;
      spare = null;
      return result;
    }
    const radius = Math.sqrt(
      -2 * Math.log(Math.max(uniform(), Number.MIN_VALUE)),
    );
    const angle = 2 * Math.PI * uniform();
    spare = radius * Math.sin(angle);
    return radius * Math.cos(angle);
  };
}

function quantile(sorted, probability) {
  const position = (sorted.length - 1) * probability;
  const lower = Math.floor(position);
  const fraction = position - lower;
  return (
    sorted[lower] +
    fraction * (sorted[Math.min(lower + 1, sorted.length - 1)] - sorted[lower])
  );
}

function summarizePaths(paths) {
  const steps = paths[0].length;
  const n = paths[0][0].length;
  const mean = Array.from({ length: steps }, (_, t) =>
    Array.from(
      { length: n },
      (_, variable) =>
        paths.reduce((sum, path) => sum + path[t][variable], 0) / paths.length,
    ),
  );
  const bands = Array.from({ length: steps }, (_, t) =>
    Array.from({ length: n }, (_, variable) => {
      const values = paths
        .map((path) => path[t][variable])
        .sort((a, b) => a - b);
      return {
        low: quantile(values, 0.1),
        median: quantile(values, 0.5),
        high: quantile(values, 0.9),
      };
    }),
  );
  return { mean, bands };
}

/** Independent, additive Gaussian innovations after t=0; coefficients stay fixed. */
export function simulateEnsemble({
  coefficients,
  shock,
  steps = 30,
  paths = 80,
  innovationSD = 0.06,
  seed = 42,
} = {}) {
  const n = model(coefficients);
  vector(shock, "Initial shock", n);
  if (!Number.isInteger(paths) || paths < 1 || paths > 500)
    throw new RangeError(
      "Choose between one and five hundred simulation paths.",
    );
  if (!Number.isInteger(steps) || steps < 0 || steps > MAX_STEPS)
    throw new RangeError(`Steps must be an integer from 0 to ${MAX_STEPS}.`);
  const deviations = Array.isArray(innovationSD)
    ? [...innovationSD]
    : Array(n).fill(innovationSD);
  vector(deviations, "Innovation standard deviations", n);
  if (deviations.some((value) => value < 0))
    throw new RangeError("Innovation standard deviations cannot be negative.");
  const normal = normalGenerator(seed);
  const simulations = Array.from({ length: paths }, (_, pathIndex) => {
    const innovations = Array.from({ length: steps + 1 }, (_, t) =>
      Array.from({ length: n }, (_, variable) =>
        t === 0 ? 0 : normal() * deviations[variable],
      ),
    );
    try {
      return simulateVAR({ coefficients, shock, steps, innovations });
    } catch (error) {
      throw new RangeError(`Ensemble path ${pathIndex + 1}: ${error.message}`);
    }
  });
  const ratePaths = simulations.map((simulation) => simulation.rates);
  const cumulativePaths = simulations.map(
    (simulation) => simulation.cumulative,
  );
  const rateSummary = summarizePaths(ratePaths);
  const cumulativeSummary = summarizePaths(cumulativePaths);
  return {
    paths: ratePaths,
    cumulativePaths,
    bands: rateSummary.bands,
    cumulativeBands: cumulativeSummary.bands,
    mean: rateSummary.mean,
    meanCumulative: cumulativeSummary.mean,
    times: simulations[0].times,
    seed,
    quantiles: [0.1, 0.5, 0.9],
    interpretation:
      "Pointwise 10th–90th percentiles of simulated outcomes with fixed coefficients, not parameter confidence intervals or simultaneous path coverage.",
  };
}
