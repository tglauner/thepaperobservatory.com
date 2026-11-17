import test from "node:test";
import assert from "node:assert/strict";
import {
  conditionFactorShockAtMaturity,
  evolveForwardCurve,
  hjmRiskNeutralDrift,
  interpolateForwardCurve,
} from "../src/lib/hjm.js";

const close = (actual, expected, tolerance = 1e-8) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);

const flat = (value) => () => value;

test("the one-factor HJM drift reduces to sigma squared times time to maturity", () => {
  close(hjmRiskNeutralDrift(1, 5, [flat(0.02)]), 0.02 ** 2 * 4);
  assert.equal(hjmRiskNeutralDrift(2, 2, [flat(0.02)]), 0);
});

test("independent factors add their covariance contributions to the drift", () => {
  const actual = hjmRiskNeutralDrift(0.5, 6, [flat(0.01), flat(0.015)]);
  close(actual, (0.01 ** 2 + 0.015 ** 2) * 5.5);
});

test("an exponentially decaying volatility has the analytic HJM drift limit", () => {
  const scale = 0.02;
  const decay = 0.3;
  const factor = (time, maturity) => scale * Math.exp(-decay * (maturity - time));
  const distance = 4;
  const expected = (scale ** 2 / decay) *
    Math.exp(-decay * distance) * (1 - Math.exp(-decay * distance));
  close(hjmRiskNeutralDrift(1, 5, [factor]), expected, 2e-7);
});

test("forward interpolation preserves knots and linearly fills the maturity grid", () => {
  const knots = [{ maturity: 1, rate: 0.03 }, { maturity: 3, rate: 0.05 }];
  assert.deepEqual(interpolateForwardCurve(knots, [0.5, 1, 2, 3, 5]), [0.03, 0.03, 0.04, 0.05, 0.05]);
});

test("a curve step applies shared Brownian shocks and the maturity-dependent drift", () => {
  const rates = evolveForwardCurve([0.03, 0.04], [1, 5], 0, 0.25, [flat(0.01)], [0.1]);
  close(rates[0], 0.03 + 0.01 ** 2 * 1 * 0.25 + 0.01 * 0.1);
  close(rates[1], 0.04 + 0.01 ** 2 * 5 * 0.25 + 0.01 * 0.1);
});

test("a conditioned factor shock reaches its chosen forward move after drift", () => {
  const factors = [flat(0.01), (time, maturity) => 0.02 * Math.exp(-0.2 * (maturity - time))];
  const time = 0;
  const step = 0.25;
  const target = 0.0015;
  const increments = conditionFactorShockAtMaturity({
    time, timeStep: step, maturity: 5, volatilityFactors: factors,
    factorIndex: 1, targetMove: target, otherIncrements: [0.03, 0],
  });
  const after = evolveForwardCurve([0.04], [5], time, step, factors, increments)[0];
  close(after - 0.04, target);
});

test("invalid knots, maturity order, and zero-loading shock factors fail explicitly", () => {
  assert.throws(() => interpolateForwardCurve([{ maturity: 2, rate: 0.03 }, { maturity: 1, rate: 0.04 }], [1]), /strictly increasing/);
  assert.throws(() => interpolateForwardCurve([{ maturity: 0, rate: 0.03 }, { maturity: 1, rate: 0.04 }], [1]), /positive/);
  assert.throws(() => hjmRiskNeutralDrift(2, 1, [flat(0.01)]), /at or after/);
  assert.throws(() => evolveForwardCurve([0.03], [1], 1, 0.25, [flat(0.01)], [0]), /later than/);
  assert.throws(() => conditionFactorShockAtMaturity({
    time: 0, timeStep: 0.25, maturity: 5, volatilityFactors: [flat(0)],
    factorIndex: 0, targetMove: 0.001, otherIncrements: [0],
  }), /no loading/);
});
