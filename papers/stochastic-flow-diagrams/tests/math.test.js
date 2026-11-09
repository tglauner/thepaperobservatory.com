import test from "node:test";
import assert from "node:assert/strict";
import {
  dot,
  matrixVector,
  matrixPower,
  cumulativeSeries,
  simulateVAR,
  eigenvalues2,
  spectralRadius2,
  classifyStability2,
  ar2Companion,
  companionMatrix,
  inverse2,
  resolvent2,
  longRunCumulative2,
  paperPresets,
  simulateEnsemble,
} from "../src/lib/sfd.js";

const close = (actual, expected, tolerance = 1e-10) =>
  assert.ok(
    Math.abs(actual - expected) <= tolerance,
    `${actual} differs from ${expected}`,
  );
const closeVector = (actual, expected, tolerance = 1e-10) => {
  assert.equal(actual.length, expected.length);
  actual.forEach((value, i) => close(value, expected[i], tolerance));
};
const closeMatrix = (actual, expected, tolerance = 1e-10) => {
  assert.equal(actual.length, expected.length);
  actual.forEach((row, i) => closeVector(row, expected[i], tolerance));
};
const stable = [
  [0.25, -0.25],
  [-0.25, 0.25],
];
const shock = [-0.5, 0];

test("matrix-vector multiplication uses target rows and source columns", () => {
  assert.equal(dot([2, -1], [3, 4]), 2);
  assert.deepEqual(
    matrixVector(
      [
        [1, 2],
        [3, 4],
      ],
      [1, 0],
    ),
    [1, 3],
  );
  assert.deepEqual(
    matrixVector(
      [
        [1, 2],
        [3, 4],
      ],
      [0, 1],
    ),
    [2, 4],
  );
});

test("linear algebra rejects nonfinite entries and incompatible dimensions", () => {
  assert.throws(() => dot([1], [1, 2]), RangeError);
  assert.throws(() => matrixVector([[1, 2]], [1]), RangeError);
  assert.throws(() => matrixVector([[NaN]], [1]), TypeError);
  assert.throws(() => dot([], []), TypeError);
});

test("matrix power zero returns identity without changing the input", () => {
  const matrix = [
    [0.2, 0.3],
    [0.4, 0.5],
  ];
  const identity = matrixPower(matrix, 0);
  assert.deepEqual(identity, [
    [1, 0],
    [0, 1],
  ]);
  identity[0][0] = 8;
  assert.deepEqual(matrix, [
    [0.2, 0.3],
    [0.4, 0.5],
  ]);
});

test("matrix powers add products over all weighted two-step walks", () => {
  closeMatrix(
    matrixPower(
      [
        [0.4, 0.3],
        [-0.2, 0.5],
      ],
      2,
    ),
    [
      [0.1, 0.27],
      [-0.18, 0.19],
    ],
  );
});

test("matrix powers match the recursively computed VAR(1) impulse response", () => {
  const response = simulateVAR({ coefficients: [stable], shock, steps: 12 });
  response.rates.forEach((rate, t) =>
    closeVector(rate, matrixVector(matrixPower(stable, t), shock)),
  );
});

test("matrix power rejects invalid exponents and arithmetic overflow", () => {
  for (const exponent of [-1, 0.5, Infinity, Number.MAX_SAFE_INTEGER + 1])
    assert.throws(() => matrixPower([[1]], exponent), RangeError);
  assert.throws(() => matrixPower([[1e308]], 2), /overflowed/);
});

test("t0 is the imposed initial shock and the horizon includes both endpoints", () => {
  const response = simulateVAR({
    coefficients: [[[0.8]]],
    shock: [2],
    steps: 0,
  });
  assert.deepEqual(response.times, [0]);
  assert.deepEqual(response.rates, [[2]]);
  assert.deepEqual(response.cumulative, [[2]]);
  assert.deepEqual(response.contributions, [[[[0]]]]);
  assert.equal(response.diagnostics.truncated, false);
});

test("the paper stable preset gives the stated first three post-shock rates", () => {
  const response = simulateVAR({ coefficients: [stable], shock, steps: 3 });
  closeMatrix(response.rates, [
    [-0.5, 0],
    [-0.125, 0.125],
    [-0.0625, 0.0625],
    [-0.03125, 0.03125],
  ]);
});

test("stable rates decay while cumulative levels retain a finite displacement", () => {
  const response = simulateVAR({ coefficients: [stable], shock, steps: 80 });
  closeVector(response.rates.at(-1), [0, 0], 1e-20);
  closeVector(response.cumulative.at(-1), [-0.75, 0.25], 1e-12);
});

test("the paper steady example has persistent rates and linearly drifting levels", () => {
  const matrix = [
    [0.5, -0.5],
    [-0.5, 0.5],
  ];
  const response = simulateVAR({ coefficients: [matrix], shock, steps: 10 });
  response.rates.slice(1).forEach((rate) => closeVector(rate, [-0.25, 0.25]));
  closeVector(response.cumulative[10], [-3, 2.5]);
});

test("the paper explosive example grows at its 4/3 eigenvalue after the first step", () => {
  const matrix = [
    [2 / 3, -2 / 3],
    [-2 / 3, 2 / 3],
  ];
  const response = simulateVAR({ coefficients: [matrix], shock, steps: 10 });
  for (let t = 1; t <= 10; t++)
    closeVector(response.rates[t], [-0.25 * (4 / 3) ** t, 0.25 * (4 / 3) ** t]);
});

test("paper presets preserve source numbers, shock timing and page attribution", () => {
  const presets = paperPresets();
  assert.deepEqual(
    presets.map((p) => p.id),
    ["stable", "steady", "explosive"],
  );
  closeVector(
    presets.map((p) => spectralRadius2(p.matrix)),
    [0.5, 1, 4 / 3],
  );
  assert.deepEqual(
    presets.map((preset) => [preset.sourcePdfPage, preset.printedPage]),
    [
      [14, 33],
      [14, 33],
      [15, 34],
    ],
  );
  presets.forEach((preset) => assert.deepEqual(preset.shock, shock));
  presets[0].matrix[0][0] = 10;
  assert.equal(paperPresets()[0].matrix[0][0], 0.25);
});

test("VAR(2) preserves second-lag memory instead of summing lag matrices", () => {
  const response = simulateVAR({
    coefficients: [[[0.5]], [[0.2]]],
    shock: [1],
    steps: 3,
  });
  closeMatrix(response.rates, [[1], [0.5], [0.45], [0.325]]);
});

test("presample history is indexed y_minus1 then y_minus2 and does not replace y0", () => {
  const response = simulateVAR({
    coefficients: [[[0.5]], [[0.2]]],
    shock: [1],
    history: [[2]],
    steps: 2,
  });
  closeMatrix(response.rates, [[1], [0.9], [0.65]]);
});

test("edge contributions reconcile target equations, with innovations accounted separately", () => {
  const coefficients = [
    [
      [0.5, 0.2],
      [-0.3, 0.4],
    ],
    [
      [0.1, -0.1],
      [0.2, 0.3],
    ],
  ];
  const response = simulateVAR({
    coefficients,
    shock: [1, 2],
    history: [[3, 4]],
    innovations: [
      [0, 0],
      [0.1, -0.2],
    ],
    steps: 2,
  });
  closeVector(response.contributions[1][0][0], [0.5, 0.4]);
  closeVector(response.contributions[1][0][1], [0.3, -0.4]);
  response.rates.slice(1).forEach((rate, index) =>
    rate.forEach((value, target) => {
      const t = index + 1;
      close(
        value,
        response.contributions[t][target]
          .flat()
          .reduce((sum, term) => sum + term, 0) +
          response.innovations[t][target],
      );
    }),
  );
});

test("innovations after t0 add new disturbances rather than changing the initial shock", () => {
  const response = simulateVAR({
    coefficients: [[[0.5]]],
    shock: [1],
    innovations: [[0], [0.1], [0.3]],
    steps: 3,
  });
  closeMatrix(response.rates, [[1], [0.6], [0.6], [0.3]]);
  assert.throws(
    () =>
      simulateVAR({
        coefficients: [[[0.5]]],
        shock: [1],
        innovations: [[0.1]],
        steps: 2,
      }),
    /t=0/,
  );
});

test("cumulative series uses a running sum, not an exponential price transformation", () => {
  assert.deepEqual(
    cumulativeSeries([
      [0.1, -0.2],
      [0.2, 0.3],
      [-0.1, 0],
    ]),
    [
      [0.1, -0.2],
      [0.30000000000000004, 0.09999999999999998],
      [0.20000000000000004, 0.09999999999999998],
    ],
  );
  assert.throws(() => cumulativeSeries([[1], [1, 2]]), RangeError);
});

test("simulation does not mutate coefficients, shocks, history or innovations", () => {
  const input = {
    coefficients: [[[0.5]], [[0.2]]],
    shock: [1],
    history: [[0.3]],
    innovations: [[0], [0.1]],
    steps: 4,
  };
  const copy = JSON.parse(JSON.stringify(input));
  simulateVAR(input);
  assert.deepEqual(input, copy);
});

test("simulation rejects malformed models, horizons and histories", () => {
  assert.throws(
    () => simulateVAR({ coefficients: [], shock: [1] }),
    RangeError,
  );
  assert.throws(
    () =>
      simulateVAR({
        coefficients: [
          [[0.2]],
          [
            [0.1, 0],
            [0, 0.1],
          ],
        ],
        shock: [1],
      }),
    RangeError,
  );
  assert.throws(
    () => simulateVAR({ coefficients: [[[0.2]]], shock: [Infinity] }),
    TypeError,
  );
  for (const steps of [-1, 201, 2.5])
    assert.throws(
      () => simulateVAR({ coefficients: [[[0.2]]], shock: [1], steps }),
      RangeError,
    );
  assert.throws(
    () =>
      simulateVAR({ coefficients: [[[0.2]]], shock: [1], history: [[0], [0]] }),
    RangeError,
  );
  assert.throws(
    () =>
      simulateVAR({
        coefficients: [[[0.2]]],
        shock: [1],
        innovations: [[0, 0]],
      }),
    RangeError,
  );
});

test("explosive arithmetic fails explicitly instead of clipping a curve", () => {
  assert.throws(
    () => simulateVAR({ coefficients: [[[2]]], shock: [1], steps: 60 }),
    /limit at t=.*never clipped/,
  );
  assert.throws(
    () => simulateVAR({ coefficients: [[[1]]], shock: [1e12], steps: 1 }),
    /Cumulative level/,
  );
});

test("real eigenvalues match a known asymmetric two-variable system", () => {
  const eigenvalues = eigenvalues2([
    [0.5, 0.4],
    [0, 0.2],
  ]);
  closeVector(
    eigenvalues.map((value) => value.re),
    [0.5, 0.2],
  );
  assert.deepEqual(
    eigenvalues.map((value) => value.im),
    [0, 0],
  );
  close(spectralRadius2(stable), 0.5);
});

test("complex stability uses modulus and can be explosive despite real parts below one", () => {
  const matrix = [
    [0.8, -0.8],
    [0.8, 0.8],
  ];
  const eigenvalues = eigenvalues2(matrix);
  closeVector(
    eigenvalues.map((value) => value.re),
    [0.8, 0.8],
  );
  closeVector(
    eigenvalues.map((value) => value.im),
    [0.8, -0.8],
  );
  close(spectralRadius2(matrix), Math.sqrt(1.28));
  assert.equal(classifyStability2(matrix).kind, "explosive");
});

test("complex roots inside the unit circle describe decaying oscillations", () => {
  const matrix = [
    [0.6, -0.6],
    [0.6, 0.6],
  ];
  assert.equal(classifyStability2(matrix).kind, "stable");
  close(spectralRadius2(matrix), Math.sqrt(0.72));
  const response = simulateVAR({
    coefficients: [matrix],
    shock: [1, 0],
    steps: 150,
  });
  closeVector(response.rates.at(-1), [0, 0], 1e-9);
});

test("negative unit eigenvalues alternate rather than giving the paper steady trajectory", () => {
  const matrix = [
    [-1, 0],
    [0, 0.5],
  ];
  assert.equal(classifyStability2(matrix).kind, "boundary");
  const response = simulateVAR({
    coefficients: [matrix],
    shock: [1, 0],
    steps: 4,
  });
  assert.deepEqual(
    response.rates.map((rate) => rate[0]),
    [1, -1, 1, -1, 1],
  );
});

test("a defective unit-root block can grow polynomially on the stability boundary", () => {
  const matrix = [
    [1, 1],
    [0, 1],
  ];
  assert.equal(classifyStability2(matrix).kind, "boundary");
  const response = simulateVAR({
    coefficients: [matrix],
    shock: [0, 1],
    steps: 10,
  });
  assert.deepEqual(response.rates[10], [10, 1]);
  assert.match(classifyStability2(matrix).description, /polynomial/);
});

test("an unstable system need not amplify a shock confined to a stable invariant subspace", () => {
  const matrix = [
    [2, 0],
    [0, 0.5],
  ];
  assert.equal(classifyStability2(matrix).kind, "explosive");
  const response = simulateVAR({
    coefficients: [matrix],
    shock: [0, 1],
    steps: 30,
  });
  closeVector(response.rates.at(-1), [0, 2 ** -30]);
});

test("non-normal systems can amplify temporarily even with spectral radius below one", () => {
  const matrix = [
    [0.5, 2],
    [0, 0.5],
  ];
  assert.equal(classifyStability2(matrix).kind, "stable");
  const response = simulateVAR({
    coefficients: [matrix],
    shock: [0, 1],
    steps: 40,
  });
  assert.ok(
    Math.hypot(...response.rates[1]) > Math.hypot(...response.rates[0]),
  );
  closeVector(response.rates.at(-1), [0, 0], 1e-8);
});

test("stability classification exposes its numerical tolerance", () => {
  const result = classifyStability2([
    [1 - 1e-10, 0],
    [0, 0.5],
  ]);
  assert.equal(result.kind, "boundary");
  assert.equal(result.tolerance, 1e-9);
  assert.equal(
    classifyStability2([
      [0.99, 0],
      [0, 0.5],
    ]).kind,
    "stable",
  );
  assert.throws(() => classifyStability2(stable, -0.1), RangeError);
});

test("eigenvalue API rejects wrong dimensions and nonfinite entries", () => {
  assert.throws(() => eigenvalues2([[1]]), RangeError);
  assert.throws(
    () =>
      eigenvalues2([
        [1, 0],
        [0, Infinity],
      ]),
    TypeError,
  );
  assert.throws(
    () =>
      eigenvalues2([
        [1e308, 1e308],
        [1e308, 1e308],
      ]),
    /overflowed/,
  );
});

test("VAR(2) companion matrix shifts memory with unit weights in the lower block", () => {
  const coefficients = [
    [
      [0.5, 0.2],
      [-0.3, 0.4],
    ],
    [
      [0.1, -0.1],
      [0.2, 0.3],
    ],
  ];
  const companion = companionMatrix(coefficients);
  assert.deepEqual(companion, [
    [0.5, 0.2, 0.1, -0.1],
    [-0.3, 0.4, 0.2, 0.3],
    [1, 0, 0, 0],
    [0, 1, 0, 0],
  ]);
  const response = simulateVAR({
    coefficients,
    shock: [1, 2],
    history: [[3, 4]],
    steps: 1,
  });
  closeVector(matrixVector(companion, [1, 2, 3, 4]), [
    ...response.rates[1],
    1,
    2,
  ]);
});

test("AR(2) is a two-state companion and cannot be classified from either coefficient alone", () => {
  assert.deepEqual(ar2Companion(1.1, -0.3), [
    [1.1, -0.3],
    [1, 0],
  ]);
  assert.equal(classifyStability2(ar2Companion(1.1, -0.3)).kind, "stable");
  assert.equal(classifyStability2(ar2Companion(0.8, 0.8)).kind, "explosive");
  closeVector(
    eigenvalues2(ar2Companion(1.1, -0.3)).map((value) => value.re),
    [0.6, 0.5],
  );
});

test("VAR(1) companion is an independent copy of the coefficient matrix", () => {
  const companion = companionMatrix([stable]);
  assert.deepEqual(companion, stable);
  companion[0][0] = 9;
  assert.equal(stable[0][0], 0.25);
});

test("stable infinite cumulative response agrees with its geometric resolvent", () => {
  closeVector(longRunCumulative2(stable, shock), [-0.75, 0.25]);
  const response = simulateVAR({ coefficients: [stable], shock, steps: 80 });
  closeVector(
    matrixVector(resolvent2(stable), shock),
    response.cumulative.at(-1),
  );
});

test("an algebraic inverse is not treated as a convergent infinite sum for unstable systems", () => {
  assert.deepEqual(
    resolvent2([
      [2, 0],
      [0, 2],
    ]),
    [
      [-1, 0],
      [0, -1],
    ],
  );
  assert.throws(
    () =>
      longRunCumulative2(
        [
          [2, 0],
          [0, 2],
        ],
        [1, 0],
      ),
    /strictly below one/,
  );
  assert.throws(
    () =>
      resolvent2([
        [1, 0],
        [0, 0.5],
      ]),
    /singular/,
  );
});

test("two-variable inversion is scale-aware and rejects singular or ill-conditioned matrices", () => {
  closeMatrix(
    inverse2([
      [2, 1],
      [0, 4],
    ]),
    [
      [0.5, -0.125],
      [0, 0.25],
    ],
  );
  closeMatrix(
    inverse2([
      [1e-20, 0],
      [0, 1e-20],
    ]),
    [
      [1e20, 0],
      [0, 1e20],
    ],
    1e5,
  );
  assert.throws(
    () =>
      inverse2([
        [1, 2],
        [2, 4],
      ]),
    /singular/,
  );
  assert.throws(
    () =>
      inverse2([
        [1, 1],
        [1, 1 + 1e-14],
      ]),
    /ill-conditioned/,
  );
});

test("zero innovation variance makes every ensemble path equal the deterministic response", () => {
  const deterministic = simulateVAR({
    coefficients: [stable],
    shock,
    steps: 8,
  });
  const ensemble = simulateEnsemble({
    coefficients: [stable],
    shock,
    steps: 8,
    paths: 6,
    innovationSD: 0,
  });
  ensemble.paths.forEach((path) => assert.deepEqual(path, deterministic.rates));
  ensemble.cumulativePaths.forEach((path) =>
    assert.deepEqual(path, deterministic.cumulative),
  );
  ensemble.bands.forEach((row, t) =>
    row.forEach((band, i) =>
      assert.deepEqual(band, {
        low: deterministic.rates[t][i],
        median: deterministic.rates[t][i],
        high: deterministic.rates[t][i],
      }),
    ),
  );
});

test("ensemble simulation is reproducible with one seed and changes with a different seed", () => {
  const options = {
    coefficients: [stable],
    shock,
    steps: 6,
    paths: 20,
    innovationSD: 0.06,
  };
  assert.deepEqual(
    simulateEnsemble({ ...options, seed: 42 }),
    simulateEnsemble({ ...options, seed: 42 }),
  );
  assert.notDeepEqual(
    simulateEnsemble({ ...options, seed: 42 }).paths,
    simulateEnsemble({ ...options, seed: 43 }).paths,
  );
});

test("ensemble innovations begin after t0 and pointwise quantiles remain ordered", () => {
  const ensemble = simulateEnsemble({
    coefficients: [stable],
    shock,
    steps: 12,
    paths: 80,
    seed: 42,
  });
  ensemble.paths.forEach((path) => assert.deepEqual(path[0], shock));
  ensemble.bands.forEach((row) =>
    row.forEach((band) =>
      assert.ok(band.low <= band.median && band.median <= band.high),
    ),
  );
  assert.match(ensemble.interpretation, /not parameter confidence/);
});

test("an innovation-only model has approximately Gaussian pointwise 10th and 90th percentiles", () => {
  const ensemble = simulateEnsemble({
    coefficients: [[[0]]],
    shock: [0.3],
    steps: 2,
    paths: 500,
    innovationSD: 0.2,
    seed: 7,
  });
  close(ensemble.mean[1][0], 0, 0.025);
  close(ensemble.bands[1][0].low, -0.2563, 0.05);
  close(ensemble.bands[1][0].high, 0.2563, 0.05);
  assert.deepEqual(ensemble.bands[0][0], { low: 0.3, median: 0.3, high: 0.3 });
});

test("per-variable innovation scales can leave one independent variable noiseless", () => {
  const ensemble = simulateEnsemble({
    coefficients: [
      [
        [0, 0],
        [0, 0],
      ],
    ],
    shock: [0, 0],
    steps: 2,
    paths: 10,
    innovationSD: [0, 0.2],
    seed: 8,
  });
  ensemble.paths.forEach((path) =>
    path.forEach((rate) => assert.equal(rate[0], 0)),
  );
  assert.ok(ensemble.paths.some((path) => path[1][1] !== 0));
});

test("ensemble rejects invalid seeds, path counts, noise scales and dimensions", () => {
  const options = { coefficients: [stable], shock, steps: 4 };
  for (const paths of [0, 501, 2.5])
    assert.throws(() => simulateEnsemble({ ...options, paths }), RangeError);
  assert.throws(
    () => simulateEnsemble({ ...options, innovationSD: -0.1 }),
    RangeError,
  );
  assert.throws(
    () => simulateEnsemble({ ...options, innovationSD: [0.1] }),
    RangeError,
  );
  assert.throws(
    () => simulateEnsemble({ ...options, innovationSD: NaN }),
    TypeError,
  );
  assert.throws(() => simulateEnsemble({ ...options, seed: 0.5 }), TypeError);
});
