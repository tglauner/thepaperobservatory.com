import test from 'node:test';
import assert from 'node:assert/strict';
import {
  clamp, mulMatVec, dot, norm, normalize, portfolioVariance, riskShares,
  effectiveBets, normalizedEntropy, jacobiEigen, covarianceFromEigen,
  correlationMatrix, equicorrelation, factorCovariance, demoUniverse,
  weightsForEqualRisk, shockEigen, simulateReturns,
} from '../src/lib/math.js';

const close = (actual, expected, tolerance = 1e-10) => assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);
const matrixClose = (actual, expected, tolerance = 1e-10) => {
  assert.equal(actual.length, expected.length);
  actual.forEach((row, i) => row.forEach((x, j) => close(x, expected[i][j], tolerance)));
};
const identity = n => Array.from({ length: n }, (_, i) => Array.from({ length: n }, (_, j) => Number(i === j)));

test('dot products and matrix-vector products follow linear algebra', () => {
  close(dot([1, 2, 3], [4, -2, 1]), 3);
  assert.deepEqual(mulMatVec([[1, 2], [3, 4]], [5, 6]), [17, 39]);
});

test('normalization preserves direction and creates a unit vector', () => {
  close(norm([3, 4]), 5);
  assert.deepEqual(normalize([3, 4]), [0.6, 0.8]);
});

test('normalization rejects vectors without a direction', () => assert.throws(() => normalize([0, 0]), /zero vector/));
test('linear algebra rejects dimension mismatch and nonfinite numbers', () => {
  assert.throws(() => dot([1], [1, 2]), /dimensions/);
  assert.throws(() => mulMatVec([[1]], [1, 2]), /dimensions/);
  assert.throws(() => normalize([NaN, 1]), /finite/);
});

test('clamp handles boundaries and rejects reversed intervals', () => {
  close(clamp(-2, -1, 1), -1);
  close(clamp(2, -1, 1), 1);
  close(clamp(0.3, -1, 1), 0.3);
  assert.throws(() => clamp(1, 2, 0), /Minimum/);
});

test('two-asset risk follows the law of cosines covariance formula', () => {
  const weights = [0.5, 0.5];
  const cov = factorCovariance(2, 0.6, [0.2, 0.3]);
  close(portfolioVariance(weights, cov), 0.25 * (0.04 + 0.09 + 2 * 0.2 * 0.3 * 0.6));
});

test('perfect positive correlation removes diversification for equal volatilities', () => close(Math.sqrt(portfolioVariance([0.5, 0.5], factorCovariance(2, 1))), 0.2));
test('perfect negative correlation permits exact cancellation', () => close(portfolioVariance([0.5, 0.5], factorCovariance(2, -1)), 0));
test('independent equal-volatility assets reduce portfolio volatility by sqrt(n)', () => close(Math.sqrt(portfolioVariance([1/3, 1/3, 1/3], factorCovariance(3, 0))), 0.2 / Math.sqrt(3)));

test('variance is quadratic in portfolio size', () => {
  const { covariance } = demoUniverse();
  close(portfolioVariance([2, 4, -2], covariance), 4 * portfolioVariance([1, 2, -1], covariance));
});

test('variance handles zero weights and rejects asymmetric matrices', () => {
  close(portfolioVariance([0, 0], [[1, 0], [0, 1]]), 0);
  assert.throws(() => portfolioVariance([1, 1], [[1, 2], [0, 1]]), /symmetric/);
});

test('Jacobi eigenvalues solve a known correlated 2D example', () => {
  const result = jacobiEigen([[2, 1], [1, 2]]);
  close(result.values[0], 3);
  close(result.values[1], 1);
  matrixClose(covarianceFromEigen(result.values, result.vectors), [[2, 1], [1, 2]]);
});

test('Jacobi eigenvectors are orthonormal and satisfy Vz = lambda z', () => {
  const cov = [[4, 0.7, -1.1], [0.7, 2, 0.9], [-1.1, 0.9, 3]];
  const { values, vectors } = jacobiEigen(cov);
  for (let i = 0; i < 3; i++) {
    const zi = vectors.map(row => row[i]);
    for (let j = 0; j < 3; j++) close(dot(zi, vectors.map(row => row[j])), Number(i === j));
    mulMatVec(cov, zi).forEach((x, k) => close(x, values[i] * zi[k]));
  }
  matrixClose(covarianceFromEigen(values, vectors), cov);
});

test('Jacobi handles repeated eigenvalues without inventing variance', () => {
  const result = jacobiEigen(identity(3));
  assert.deepEqual(result.values, [1, 1, 1]);
  matrixClose(covarianceFromEigen(result.values, result.vectors), identity(3));
});

test('Jacobi handles 1D and very small covariance magnitudes', () => {
  assert.deepEqual(jacobiEigen([[0.3]]), { values: [0.3], vectors: [[1]] });
  const cov = [[2e-18, 1e-18], [1e-18, 2e-18]];
  const { values, vectors } = jacobiEigen(cov);
  close(values[0] / 1e-18, 3);
  matrixClose(covarianceFromEigen(values, vectors), cov, 1e-30);
});

test('synthetic universe has an exact positive-definite orthonormal decomposition', () => {
  const universe = demoUniverse();
  assert.equal(universe.synthetic, true);
  assert.deepEqual(universe.labels, ['Stocks', 'Credit', 'Treasuries']);
  const solved = jacobiEigen(universe.covariance);
  solved.values.forEach((x, i) => close(x, universe.values[i]));
});

test('risk shares conserve portfolio variance in the orthogonal basis', () => {
  const { values, vectors, covariance } = demoUniverse();
  const weights = [0.8, -0.2, 0.5];
  const shares = riskShares(weights, values, vectors);
  close(shares.reduce((a, b) => a + b), 1);
  const contributions = values.map((x, i) => x * dot(weights, vectors.map(row => row[i])) ** 2);
  close(contributions.reduce((a, b) => a + b), portfolioVariance(weights, covariance));
  shares.forEach((p, i) => close(p, contributions[i] / portfolioVariance(weights, covariance)));
});

test('a pure eigenvector puts all risk in one component', () => {
  const { values, vectors } = demoUniverse();
  for (let i = 0; i < 3; i++) {
    const shares = riskShares(vectors.map(row => row[i]), values, vectors);
    shares.forEach((x, j) => close(x, Number(i === j)));
  }
});

test('component risk shares ignore eigenvector sign choice and portfolio scale', () => {
  const { values, vectors } = demoUniverse();
  const a = riskShares([0.3, 0.4, -0.2], values, vectors);
  const b = riskShares([-3, -4, 2], values, vectors.map(row => row.map(x => -x)));
  a.forEach((x, i) => close(x, b[i]));
});

test('risk shares explicitly reject zero risk', () => {
  assert.throws(() => riskShares([0, 0], [2, 1], identity(2)), /zero-risk/);
  assert.throws(() => riskShares([1, 0], [0, 0], identity(2)), /zero-risk/);
});

test('effective bets handles concentrated, equal, and zero shares', () => {
  close(effectiveBets([1, 0, 0]), 1);
  close(effectiveBets([1/3, 1/3, 1/3]), 3);
  close(effectiveBets([0.5, 0.5, 0]), 2);
});

test('presentation normalized entropy equals (effective bets - 1)/(n - 1)', () => {
  close(normalizedEntropy([1, 0, 0]), 0);
  close(normalizedEntropy([1/3, 1/3, 1/3]), 1);
  close(normalizedEntropy([0.5, 0.5, 0]), 0.5);
  close(normalizedEntropy([1]), 0);
});

test('entropy is invariant to component order and increases with evenness', () => {
  close(normalizedEntropy([0.7, 0.2, 0.1]), normalizedEntropy([0.1, 0.7, 0.2]));
  assert.ok(normalizedEntropy([0.5, 0.3, 0.2]) > normalizedEntropy([0.8, 0.1, 0.1]));
});

test('entropy rejects signed contributions, missing mass, and invalid values', () => {
  assert.throws(() => normalizedEntropy([-0.2, 1.2]), /nonnegative/);
  assert.throws(() => effectiveBets([0.2, 0.2]), /sum to one/);
  assert.throws(() => effectiveBets([NaN, 1]), /finite/);
});

test('equal-risk weights actually equalize component variance shares', () => {
  const { values, vectors } = demoUniverse();
  const weights = weightsForEqualRisk(values, vectors);
  close(norm(weights), 1);
  riskShares(weights, values, vectors).forEach(x => close(x, 1/3));
  close(normalizedEntropy(riskShares(weights, values, vectors)), 1);
});

test('all sign choices of DRP equalize risk, exposing nonuniqueness', () => {
  const { values, vectors } = demoUniverse();
  const a = weightsForEqualRisk(values, vectors, [1, -1, 1]);
  const b = weightsForEqualRisk(values, vectors, [-1, 1, 1]);
  assert.notDeepEqual(a, b);
  riskShares(a, values, vectors).forEach(x => close(x, 1/3));
  riskShares(b, values, vectors).forEach(x => close(x, 1/3));
});

test('equal-risk construction rejects singular covariance and invalid signs', () => {
  assert.throws(() => weightsForEqualRisk([1, 0], identity(2)), /positive/);
  assert.throws(() => weightsForEqualRisk([1, 2], identity(2), [1, 0]), /sign/);
});

test('doubling first eigenvalue doubles pure-PC variance and multiplies volatility by sqrt(2)', () => {
  const { values, vectors, covariance } = demoUniverse();
  const weights = vectors.map(row => row[0]);
  const after = shockEigen(values, vectors, 2);
  close(portfolioVariance(weights, after.covariance) / portfolioVariance(weights, covariance), 2);
  close(Math.sqrt(portfolioVariance(weights, after.covariance) / portfolioVariance(weights, covariance)), Math.sqrt(2));
});

test('a doubled single eigenvalue raises equal-risk portfolio variance by 1/n', () => {
  const { values, vectors, covariance } = demoUniverse();
  const weights = weightsForEqualRisk(values, vectors);
  close(portfolioVariance(weights, shockEigen(values, vectors, 2).covariance) / portfolioVariance(weights, covariance), 4/3);
});

test('rotation shocks preserve orthogonality while changing the covariance basis', () => {
  const { values, vectors, covariance } = demoUniverse();
  const after = shockEigen(values, vectors, 1, 35);
  assert.notDeepEqual(after.covariance, covariance);
  jacobiEigen(after.covariance).values.forEach((x, i) => close(x, values[i]));
  matrixClose(covarianceFromEigen(after.values, after.vectors), after.covariance);
});

test('zero-angle unit shock reproduces the original covariance', () => {
  const { values, vectors, covariance } = demoUniverse();
  matrixClose(shockEigen(values, vectors, 1, 0).covariance, covariance);
});

test('shocks reject negative variance and nonfinite rotations', () => {
  assert.throws(() => shockEigen([2, 1], identity(2), -1), /negative/);
  assert.throws(() => shockEigen([2, 1], identity(2), 2, NaN), /finite/);
});

test('correlation matrix removes volatility units and has a unit diagonal', () => {
  const corr = correlationMatrix(factorCovariance(3, 0.4, [0.1, 0.2, 0.3]));
  matrixClose(corr, equicorrelation(3, 0.4));
});

test('invalid equicorrelations and undefined correlations are rejected', () => {
  assert.throws(() => equicorrelation(3, -0.6), /positive semidefinite/);
  assert.throws(() => equicorrelation(3, 1.1), /positive semidefinite/);
  assert.throws(() => correlationMatrix([[1, 0], [0, 0]]), /Positive variances/);
  assert.throws(() => correlationMatrix([[1, 2], [2, 1]]), /semidefinite/);
});

test('simulation is reproducible for a fixed seed and responsive to a different seed', () => {
  const cov = factorCovariance(2, 0.4);
  assert.deepEqual(simulateReturns(cov, 12, 42), simulateReturns(cov, 12, 42));
  assert.notDeepEqual(simulateReturns(cov, 12, 42), simulateReturns(cov, 12, 43));
});

test('large simulated Gaussian sample approaches supplied covariance', () => {
  const cov = [[0.04, 0.012], [0.012, 0.09]];
  const observations = simulateReturns(cov, 30000, 71);
  const mean = [0, 1].map(j => observations.reduce((sum, row) => sum + row[j], 0) / observations.length);
  const estimated = [0, 1].map(i => [0, 1].map(j => observations.reduce((sum, row) => sum + (row[i] - mean[i]) * (row[j] - mean[j]), 0) / observations.length));
  matrixClose(estimated, cov, 0.002);
});

test('simulation handles singular PSD covariance and rejects indefinite matrices', () => {
  const observations = simulateReturns([[1, 1], [1, 1]], 20, 4);
  observations.forEach(row => close(row[0], row[1]));
  assert.throws(() => simulateReturns([[1, 2], [2, 1]]), /semidefinite/);
  assert.throws(() => simulateReturns([[1]], 0), /Sample count/);
});

test('reconstruction rejects nonorthonormal bases and negative eigenvalues', () => {
  assert.throws(() => covarianceFromEigen([2, 1], [[1, 1], [0, 1]]), /orthonormal/);
  assert.throws(() => covarianceFromEigen([-2, 1], identity(2)), /negative/);
});
