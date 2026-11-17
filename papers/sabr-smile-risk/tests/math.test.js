import test from "node:test";
import assert from "node:assert/strict";
import { applySabrShock, sabrBlackVol, sabrNormalVol, sabrSmileVol } from "../src/lib/sabr.js";

const close = (actual, expected, tolerance = 1e-10) =>
  assert.ok(Math.abs(actual - expected) <= tolerance, `${actual} differs from ${expected}`);

const base = { forward: 0.04, strike: 0.04, maturity: 2, alpha: 0.03, beta: 0.5, rho: -0.35, nu: 0.55 };

test("the beta-one, zero-vol-of-vol limit is a flat lognormal smile", () => {
  for (const strike of [0.025, 0.04, 0.06])
    close(sabrBlackVol({ ...base, beta: 1, nu: 0, alpha: 0.18, strike }), 0.18);
});

test("the ATM SABR approximation is finite and matches its closed ATM correction", () => {
  const actual = sabrBlackVol(base);
  const expected =
    (base.alpha / base.forward ** (1 - base.beta)) *
    (1 +
      (
        ((1 - base.beta) ** 2 * base.alpha ** 2) / (24 * base.forward ** (2 - 2 * base.beta)) +
        (base.rho * base.beta * base.nu * base.alpha) / (4 * base.forward ** (1 - base.beta)) +
        ((2 - 3 * base.rho ** 2) * base.nu ** 2) / 24
      ) *
        base.maturity);
  close(actual, expected);
  assert.ok(Number.isFinite(actual) && actual > 0);
});

test("the normal beta-zero limit returns a finite rate-volatility quote at ATM", () => {
  const parameters = { ...base, beta: 0, alpha: 0.01 };
  const expected = parameters.alpha *
    (1 + ((2 - 3 * parameters.rho ** 2) * parameters.nu ** 2 * parameters.maturity) / 24);
  close(sabrNormalVol(parameters), expected);
  assert.equal(sabrSmileVol(parameters, parameters.forward), expected);
});

test("zero vol-of-vol removes the beta-one smile and the ATM z/x singularity", () => {
  const parameters = { ...base, beta: 1, nu: 0 };
  close(sabrBlackVol(parameters), 0.03);
  close(sabrBlackVol({ ...parameters, strike: 0.035 }), 0.03);
});

test("a symmetric beta-one, zero-correlation smile is symmetric in log moneyness", () => {
  const parameters = { ...base, beta: 1, rho: 0 };
  close(
    sabrBlackVol({ ...parameters, strike: parameters.forward * Math.exp(-0.2) }),
    sabrBlackVol({ ...parameters, strike: parameters.forward * Math.exp(0.2) }),
  );
});

test("a one-standard-deviation shock changes forward and volatility in the correlation direction", () => {
  const down = applySabrShock({ ...base, rho: -0.5 }, -1);
  const up = applySabrShock({ ...base, rho: -0.5 }, 1);
  assert.ok(down.forward < base.forward && up.forward > base.forward);
  assert.ok(down.alpha > base.alpha && up.alpha < base.alpha);
  close(applySabrShock({ ...base, nu: 0 }, 1).alpha, base.alpha);
});

test("the forward shock rejects a lognormal path through zero and oversized inputs", () => {
  assert.throws(() => applySabrShock({ ...base, forward: 0.001, alpha: 0.5, beta: 0.5 }, -1), /cross zero/);
  assert.throws(() => applySabrShock(base, 4), RangeError);
  assert.throws(() => applySabrShock(base, 1, 0), RangeError);
});

test("SABR functions reject invalid parameters and nonfinite inputs", () => {
  assert.throws(() => sabrBlackVol({ ...base, forward: 0 }), RangeError);
  assert.throws(() => sabrBlackVol({ ...base, rho: 1 }), RangeError);
  assert.throws(() => sabrBlackVol({ ...base, nu: -0.1 }), RangeError);
  assert.throws(() => sabrBlackVol({ ...base, strike: Infinity }), TypeError);
  assert.throws(() => sabrNormalVol({ ...base, beta: 0.5 }), /beta = 0/);
});
