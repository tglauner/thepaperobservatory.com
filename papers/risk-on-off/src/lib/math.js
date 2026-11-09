/** Small, deterministic teaching models. No numbers in this file are market estimates. */
const EPS = 1e-12;

function finite(value, name) {
  if (!Number.isFinite(value)) throw new TypeError(`${name} must be finite.`);
}

function vector(value, name = "Vector") {
  if (
    !Array.isArray(value) ||
    value.length === 0 ||
    value.some((x) => !Number.isFinite(x))
  ) {
    throw new TypeError(`${name} must be a nonempty array of finite numbers.`);
  }
  return value.length;
}

function square(matrix, name = "Matrix") {
  if (
    !Array.isArray(matrix) ||
    matrix.length === 0 ||
    matrix.some(
      (row) =>
        !Array.isArray(row) ||
        row.length !== matrix.length ||
        row.some((x) => !Number.isFinite(x)),
    )
  ) {
    throw new TypeError(`${name} must be a finite, nonempty square matrix.`);
  }
  return matrix.length;
}

function symmetric(matrix) {
  const n = square(matrix);
  const scale = Math.max(...matrix.flat().map(Math.abs), Number.MIN_VALUE);
  for (let i = 0; i < n; i++)
    for (let j = 0; j < i; j++) {
      if (Math.abs(matrix[i][j] - matrix[j][i]) > 1e-10 * scale)
        throw new RangeError("Matrix must be symmetric.");
    }
  return n;
}

function eigensystem(values, vectors, { positive = false } = {}) {
  const n = vector(values, "Eigenvalues");
  if (square(vectors, "Eigenvectors") !== n)
    throw new RangeError("Eigenvalue and eigenvector dimensions must match.");
  if (values.some((x) => (positive ? x <= 0 : x < 0)))
    throw new RangeError(
      positive
        ? "Eigenvalues must be positive."
        : "Eigenvalues cannot be negative.",
    );
  for (let i = 0; i < n; i++)
    for (let j = 0; j <= i; j++) {
      let inner = 0;
      for (let k = 0; k < n; k++) inner += vectors[k][i] * vectors[k][j];
      if (Math.abs(inner - (i === j ? 1 : 0)) > 1e-8)
        throw new RangeError("Eigenvector columns must be orthonormal.");
    }
  return n;
}

export function clamp(value, min, max) {
  [value, min, max].forEach((x) => finite(x, "Clamp argument"));
  if (min > max) throw new RangeError("Minimum cannot exceed maximum.");
  return Math.max(min, Math.min(max, value));
}

export function dot(a, b) {
  if (vector(a) !== vector(b))
    throw new RangeError("Vector dimensions must match.");
  return a.reduce((sum, x, i) => sum + x * b[i], 0);
}

export function norm(a) {
  vector(a);
  return Math.hypot(...a);
}

export function normalize(a) {
  const length = norm(a);
  if (length === 0) throw new RangeError("A zero vector has no direction.");
  return a.map((x) => x / length);
}

export function mulMatVec(matrix, values) {
  const n = vector(values);
  if (
    !Array.isArray(matrix) ||
    matrix.length === 0 ||
    matrix.some((row) => !Array.isArray(row) || row.length !== n)
  )
    throw new RangeError("Matrix and vector dimensions must match.");
  return matrix.map((row) => dot(row, values));
}

export function portfolioVariance(weights, covariance) {
  if (symmetric(covariance) !== vector(weights))
    throw new RangeError("Weight and covariance dimensions must match.");
  const result = dot(weights, mulMatVec(covariance, weights));
  const scale =
    Math.max(...covariance.flat().map(Math.abs), Number.MIN_VALUE) *
    dot(weights, weights);
  if (result < -1e-10 * scale)
    throw new RangeError("Portfolio variance cannot be negative.");
  return Math.max(0, result);
}

export function riskShares(weights, values, vectors) {
  const n = eigensystem(values, vectors);
  if (vector(weights, "Weights") !== n)
    throw new RangeError("Weight and eigenvalue dimensions must match.");
  const contributions = values.map(
    (lambda, i) =>
      lambda *
      vectors.reduce((sum, row, j) => sum + row[i] * weights[j], 0) ** 2,
  );
  const total = contributions.reduce((sum, x) => sum + x, 0);
  if (!(total > 0))
    throw new RangeError(
      "Risk shares are undefined for a zero-risk portfolio.",
    );
  return contributions.map((x) => x / total);
}

function probabilityShares(shares) {
  vector(shares, "Risk shares");
  if (
    shares.some((x) => x < 0) ||
    Math.abs(shares.reduce((a, b) => a + b, 0) - 1) > 1e-8
  )
    throw new RangeError("Risk shares must be nonnegative and sum to one.");
}

export function effectiveBets(shares) {
  probabilityShares(shares);
  return Math.exp(
    -shares.reduce((sum, p) => sum + (p === 0 ? 0 : p * Math.log(p)), 0),
  );
}

export function normalizedEntropy(shares) {
  const bets = effectiveBets(shares);
  // With one available bet there is no diversification to measure.
  if (shares.length === 1) return 0;
  return clamp((bets - 1) / (shares.length - 1), 0, 1);
}

/** Symmetric Jacobi eigensolver. Columns of vectors correspond to descending values. */
export function jacobiEigen(matrix) {
  const n = symmetric(matrix);
  const a = matrix.map((row) => [...row]);
  const z = Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => Number(i === j)),
  );
  const scale = Math.max(...a.flat().map(Math.abs), Number.MIN_VALUE);
  const tolerance = scale * 1e-13;
  let converged = n === 1;
  for (let iteration = 0; iteration < 100 * n * n; iteration++) {
    let p = 0,
      q = n > 1 ? 1 : 0,
      largest = 0;
    for (let i = 0; i < n; i++)
      for (let j = i + 1; j < n; j++) {
        if (Math.abs(a[i][j]) > largest) {
          largest = Math.abs(a[i][j]);
          p = i;
          q = j;
        }
      }
    if (largest <= tolerance) {
      converged = true;
      break;
    }
    const angle = 0.5 * Math.atan2(2 * a[p][q], a[q][q] - a[p][p]);
    const c = Math.cos(angle),
      s = Math.sin(angle);
    const app = a[p][p],
      aqq = a[q][q],
      apq = a[p][q];
    for (let k = 0; k < n; k++)
      if (k !== p && k !== q) {
        const akp = a[k][p],
          akq = a[k][q];
        a[k][p] = a[p][k] = c * akp - s * akq;
        a[k][q] = a[q][k] = s * akp + c * akq;
      }
    a[p][p] = c * c * app - 2 * s * c * apq + s * s * aqq;
    a[q][q] = s * s * app + 2 * s * c * apq + c * c * aqq;
    a[p][q] = a[q][p] = 0;
    for (let k = 0; k < n; k++) {
      const zkp = z[k][p],
        zkq = z[k][q];
      z[k][p] = c * zkp - s * zkq;
      z[k][q] = s * zkp + c * zkq;
    }
  }
  if (!converged) throw new Error("Symmetric eigensolver did not converge.");
  const order = Array.from({ length: n }, (_, i) => i).sort(
    (i, j) => a[j][j] - a[i][i],
  );
  const values = order.map((i) => a[i][i]);
  const vectors = z.map((row) => order.map((i) => row[i]));
  // Fix arbitrary signs for reproducible diagrams: largest absolute entry is positive.
  for (let col = 0; col < n; col++) {
    let pivot = 0;
    for (let row = 1; row < n; row++)
      if (Math.abs(vectors[row][col]) > Math.abs(vectors[pivot][col]))
        pivot = row;
    if (vectors[pivot][col] < 0)
      for (let row = 0; row < n; row++) vectors[row][col] *= -1;
  }
  return { values, vectors };
}

export function covarianceFromEigen(values, vectors) {
  const n = eigensystem(values, vectors);
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      values.reduce(
        (sum, lambda, k) => sum + lambda * vectors[i][k] * vectors[j][k],
        0,
      ),
    ),
  );
}

export function correlationMatrix(covariance) {
  const n = symmetric(covariance);
  if (covariance.some((row, i) => row[i] <= 0))
    throw new RangeError(
      "Positive variances are needed to define correlation.",
    );
  if (
    jacobiEigen(covariance).values.some(
      (x) => x < -1e-10 * Math.max(...covariance.map((row, i) => row[i])),
    )
  )
    throw new RangeError("Covariance must be positive semidefinite.");
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) =>
      clamp(
        covariance[i][j] / Math.sqrt(covariance[i][i] * covariance[j][j]),
        -1,
        1,
      ),
    ),
  );
}

export function equicorrelation(n, rho) {
  if (!Number.isInteger(n) || n < 1)
    throw new RangeError("Asset count must be a positive integer.");
  finite(rho, "Correlation");
  if (rho > 1 || rho < (n === 1 ? -1 : -1 / (n - 1)))
    throw new RangeError(
      "Correlation would not produce a positive semidefinite matrix.",
    );
  return Array.from({ length: n }, (_, i) =>
    Array.from({ length: n }, (_, j) => (i === j ? 1 : rho)),
  );
}

export function factorCovariance(n, correlation, vols = null) {
  const matrix = equicorrelation(n, correlation);
  const deviations = vols ?? Array(n).fill(0.2);
  if (
    vector(deviations, "Volatilities") !== n ||
    deviations.some((x) => x <= 0)
  )
    throw new RangeError("Each asset must have a positive volatility.");
  return matrix.map((row, i) =>
    row.map((x, j) => x * deviations[i] * deviations[j]),
  );
}

export function demoUniverse() {
  const values = [0.075, 0.018, 0.006];
  const vectors = [
    [1 / Math.sqrt(3), 1 / Math.sqrt(2), 1 / Math.sqrt(6)],
    [1 / Math.sqrt(3), -1 / Math.sqrt(2), 1 / Math.sqrt(6)],
    [-1 / Math.sqrt(3), 0, 2 / Math.sqrt(6)],
  ];
  return {
    labels: ["Stocks", "Credit", "Treasuries"],
    values,
    vectors,
    covariance: covarianceFromEigen(values, vectors),
    synthetic: true,
  };
}

export function weightsForEqualRisk(values, vectors, signs = null) {
  const n = eigensystem(values, vectors, { positive: true });
  const directions = signs ?? Array(n).fill(1);
  if (
    vector(directions, "Signs") !== n ||
    directions.some((x) => Math.abs(x) !== 1)
  )
    throw new RangeError("Each sign must be +1 or -1.");
  return normalize(
    mulMatVec(
      vectors,
      values.map((lambda, i) => directions[i] / Math.sqrt(lambda)),
    ),
  );
}

export function shockEigen(values, vectors, multiplier, angleDegrees = 0) {
  const n = eigensystem(values, vectors);
  finite(multiplier, "Shock multiplier");
  finite(angleDegrees, "Rotation angle");
  if (multiplier < 0)
    throw new RangeError("Variance multiplier cannot be negative.");
  if (n < 2 && angleDegrees !== 0)
    throw new RangeError("Rotation needs at least two components.");
  const rotated = vectors.map((row) => [...row]);
  const angle = (angleDegrees * Math.PI) / 180,
    c = Math.cos(angle),
    s = Math.sin(angle);
  if (n >= 2)
    for (let i = 0; i < n; i++) {
      rotated[i][0] = vectors[i][0] * c + vectors[i][1] * s;
      rotated[i][1] = -vectors[i][0] * s + vectors[i][1] * c;
    }
  const shocked = values.map((lambda, i) =>
    i === 0 ? lambda * multiplier : lambda,
  );
  return {
    values: shocked,
    vectors: rotated,
    covariance: covarianceFromEigen(shocked, rotated),
  };
}

/** Seeded Gaussian points with population covariance `covariance`; samples are illustrative. */
export function simulateReturns(covariance, count = 180, seed = 42) {
  const n = symmetric(covariance);
  if (!Number.isInteger(count) || count < 1 || count > 100000)
    throw new RangeError("Sample count must be between 1 and 100000.");
  if (!Number.isInteger(seed)) throw new TypeError("Seed must be an integer.");
  const { values, vectors } = jacobiEigen(covariance);
  const scale = Math.max(...values.map(Math.abs), Number.MIN_VALUE);
  if (values.some((x) => x < -1e-10 * scale))
    throw new RangeError("Covariance must be positive semidefinite.");
  let state = seed >>> 0;
  const random = () => {
    state = (state + 0x6d2b79f5) >>> 0;
    let t = state;
    t = Math.imul(t ^ (t >>> 15), t | 1);
    t ^= t + Math.imul(t ^ (t >>> 7), t | 61);
    return ((t ^ (t >>> 14)) >>> 0) / 4294967296;
  };
  const gaussian = () =>
    Math.sqrt(-2 * Math.log(Math.max(random(), Number.MIN_VALUE))) *
    Math.cos(2 * Math.PI * random());
  return Array.from({ length: count }, () =>
    mulMatVec(
      vectors,
      Array.from(
        { length: n },
        (_, i) => gaussian() * Math.sqrt(Math.max(0, values[i])),
      ),
    ),
  );
}
