import test from 'node:test';
import assert from 'node:assert/strict';
import { blackScholes, normalCdf, corporatePayoffs, stockPath, hedgePath, hedgeEnsemble } from '../src/lib/black-scholes.js';
const base = { spot: 100, strike: 100, rate: .05, volatility: .2, time: 1 };
const near = (a, b, tolerance = 1e-9) => assert.ok(Math.abs(a - b) <= tolerance, `${a} differs from ${b} by more than ${tolerance}`);

test('standard call, put, delta and vega agree with independent benchmarks', () => {
  const value = blackScholes(base);
  near(value.call, 10.4505835722, 2e-5);
  near(value.put, 5.5735260223, 2e-5);
  near(value.delta, .6368306512, 1e-7);
  near(value.vega, 37.5240346917, 1e-8);
});
test('normal CDF is symmetric and has correct central and tail values', () => {
  near(normalCdf(0), .5, 1e-9);
  near(normalCdf(1.96), .97500210485, 1e-7);
  for (const z of [.01, .5, 2, 6, 10]) near(normalCdf(z) + normalCdf(-z), 1);
  assert.equal(normalCdf(-Infinity), 0);
  assert.equal(normalCdf(Infinity), 1);
});
test('put-call parity holds across moneyness, volatility, maturity and rates', () => {
  for (const spot of [0, 50, 100, 180]) for (const volatility of [0, .05, .8]) for (const time of [0, .01, 3]) for (const rate of [-.03, 0, .1]) {
    const value = blackScholes({ ...base, spot, volatility, time, rate });
    near(value.call - value.put, spot - base.strike * Math.exp(-rate * time), 1e-10);
  }
});
test('call respects discounted-strike bounds including negative rates', () => {
  for (const spot of [0, 30, 100, 250]) for (const volatility of [.01, .2, .8]) for (const rate of [-.05, .05]) {
    const value = blackScholes({ ...base, spot, volatility, rate });
    assert.ok(value.call >= Math.max(spot - 100 * Math.exp(-rate), 0) - 2e-5);
    assert.ok(value.call <= spot + 1e-10);
  }
});
test('expiry returns the exact payoff and explicitly flags its delta kink', () => {
  for (const spot of [50, 100, 150]) {
    const value = blackScholes({ ...base, spot, time: 0 });
    assert.equal(value.call, Math.max(spot - 100, 0));
    assert.equal(value.deltaAtKink, spot === 100);
    if (spot === 100) assert.equal(value.gamma, null);
  }
});
test('zero volatility uses the deterministic discounted-strike payoff', () => {
  for (const spot of [50, 100, 150]) {
    const value = blackScholes({ ...base, spot, volatility: 0 });
    near(value.call, Math.max(spot - 100 * Math.exp(-.05), 0));
  }
});
test('zero stock has a worthless call and a discounted-strike put', () => {
  const value = blackScholes({ ...base, spot: 0 });
  assert.equal(value.call, 0);
  assert.equal(value.delta, 0);
  near(value.put, 100 * Math.exp(-.05));
});
test('nonfinite and out-of-domain pricing inputs fail explicitly', () => {
  for (const [key, value] of [['spot', -1], ['spot', NaN], ['strike', 0], ['rate', Infinity], ['volatility', -.1], ['time', -1]])
    assert.throws(() => blackScholes({ ...base, [key]: value }), /must be finite/);
});
test('delta and gamma agree with numerical price derivatives away from kinks', () => {
  const h = .05;
  const value = blackScholes(base);
  const up = blackScholes({ ...base, spot: 100 + h }).call;
  const down = blackScholes({ ...base, spot: 100 - h }).call;
  near((up - down) / (2 * h), value.delta, 1e-5);
  near((up - 2 * value.call + down) / h ** 2, value.gamma, 1e-5);
});
test('increasing stock, volatility and positive-rate maturity raises call value', () => {
  const start = blackScholes(base).call;
  for (const change of [{ spot: 110 }, { volatility: .3 }, { time: 2 }, { rate: .08 }])
    assert.ok(blackScholes({ ...base, ...change }).call > start);
});
test('replication cash equals the discounted strike-weighted normal term', () => {
  const value = blackScholes(base);
  near(value.call - value.delta * base.spot, -100 * Math.exp(-.05) * normalCdf(value.d2));
});
test('same seed repeats a path and different seeds produce distinct paths', () => {
  assert.deepEqual(stockPath(base), stockPath(base));
  assert.notDeepEqual(stockPath(base), stockPath(base, { seed: 1974 }));
});
test('changing simulated drift changes paths while keeping the initial call price', () => {
  const low = stockPath(base, { drift: -.2 });
  const high = stockPath(base, { drift: .3 });
  near(high.at(-1) / low.at(-1), Math.exp(.5));
  near(hedgePath(base, low, 16).initial, hedgePath(base, high, 16).initial);
});
test('all hedge frequencies preserve the same terminal stock and exact nested observations', () => {
  const path = stockPath(base);
  const coarse = hedgePath(base, path, 4);
  for (const n of [16, 64, 256]) {
    const fine = hedgePath(base, path, n);
    assert.equal(fine.terminal, coarse.terminal);
    for (let i = 0; i <= 4; i++) assert.equal(coarse.records[i].spot, fine.records[i * n / 4].spot);
  }
});
test('one-period hedge agrees with shares plus accrued borrowing', () => {
  const path = [100, 120];
  const value = blackScholes(base);
  const expectedPortfolio = value.delta * 120 + (value.call - value.delta * 100) * Math.exp(.05);
  const hedge = hedgePath(base, path, 1);
  near(hedge.error, expectedPortfolio - 20);
});
test('each rebalance is self-financing and cash accrues between observations', () => {
  const hedge = hedgePath(base, stockPath(base), 16);
  for (let i = 1; i < hedge.records.length; i++) {
    const previous = hedge.records[i - 1], row = hedge.records[i];
    near(row.portfolio, previous.delta * row.spot + previous.cash * Math.exp(.05 / 16), 1e-10);
    near(row.delta * row.spot + row.cash, row.portfolio, 1e-10);
  }
});
test('terminal error settles the call payoff with no final stock rebalance', () => {
  const hedge = hedgePath(base, stockPath(base), 64);
  near(hedge.error, hedge.records.at(-1).portfolio - Math.max(hedge.terminal - 100, 0));
  assert.equal(hedge.records.at(-1).delta, hedge.records.at(-2).delta);
});
test('deterministic zero-volatility stock paths are replicated exactly', () => {
  const parameters = { ...base, volatility: 0 };
  const path = stockPath(parameters, { drift: .05 });
  for (const n of [4, 16, 64, 256]) near(hedgePath(parameters, path, n).error, 0, 1e-9);
});
test('invalid paths, schedules and random-generator inputs fail clearly', () => {
  assert.throws(() => stockPath(base, { seed: -1 }), /Seed/);
  assert.throws(() => stockPath(base, { grid: 0 }), /Grid/);
  assert.throws(() => stockPath(base, { drift: NaN }), /Drift/);
  assert.throws(() => hedgePath(base, [101, 120], 1), /Path/);
  assert.throws(() => hedgePath(base, [100, NaN], 1), /Path/);
  assert.throws(() => hedgePath(base, stockPath(base), 7), /divide/);
});
test('fixed-seed ensemble illustrates convergence in RMS error without requiring single-path monotonicity', () => {
  const rows = hedgeEnsemble(base);
  assert.equal(rows.length, 4);
  assert.ok(rows.at(-1).rmse < rows[0].rmse / 4);
  assert.ok(rows.every(row => Number.isFinite(row.rmse) && Number.isFinite(row.mean)));
  assert.throws(() => hedgeEnsemble(base, { paths: 0 }), /Path count/);
});
test('limited-liability equity and debt conserve assets on either side of default', () => {
  for (const assets of [0, 40, 100, 120, 220]) for (const face of [40, 100, 160]) {
    const result = corporatePayoffs(assets, face);
    near(result.equity + result.debt, assets);
    assert.ok(result.equity >= 0 && result.debt >= 0 && result.debt <= face);
    if (assets <= face) assert.equal(result.equity, 0);
    else assert.equal(result.debt, face);
  }
});
test('invalid corporate claims are rejected', () => {
  assert.throws(() => corporatePayoffs(-1, 100), /Assets/);
  assert.throws(() => corporatePayoffs(100, 0), /Debt face/);
});
