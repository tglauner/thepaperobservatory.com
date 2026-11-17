const ROOT_TWO_PI = Math.sqrt(2 * Math.PI);
export const FREQUENCIES = Object.freeze([4, 16, 64, 256]);

// Abramowitz-Stegun normal CDF; absolute CDF error below 7.5e-8.
export function normalCdf(x) {
  if (Number.isNaN(x)) throw new Error("Normal input must be a number.");
  if (x === Infinity) return 1;
  if (x === -Infinity) return 0;
  const z = Math.abs(x);
  const t = 1 / (1 + 0.2316419 * z);
  const tail = Math.exp(-z * z / 2) / ROOT_TWO_PI * t *
    (0.319381530 + t * (-0.356563782 + t * (1.781477937 + t * (-1.821255978 + t * 1.330274429))));
  return x >= 0 ? 1 - tail : tail;
}

function bounded(name, value, min, max) {
  if (!Number.isFinite(value) || value < min || value > max)
    throw new Error(`${name} must be finite and between ${min} and ${max}.`);
}

function validate({ spot, strike, rate, volatility, time }) {
  bounded("Spot", spot, 0, 1e9);
  bounded("Strike", strike, 1e-8, 1e9);
  bounded("Rate", rate, -1, 1);
  bounded("Volatility", volatility, 0, 3);
  bounded("Time", time, 0, 100);
}

export function blackScholes(parameters) {
  validate(parameters);
  const { spot, strike, rate, volatility, time } = parameters;
  const bond = strike * Math.exp(-rate * time);
  if (time === 0 || volatility === 0 || spot === 0) {
    const intrinsic = spot - bond;
    return {
      call: Math.max(intrinsic, 0), put: Math.max(-intrinsic, 0),
      delta: intrinsic > 0 ? 1 : intrinsic < 0 ? 0 : 0.5,
      gamma: intrinsic === 0 ? null : 0,
      vega: intrinsic === 0 && time > 0 ? spot * Math.sqrt(time) / ROOT_TWO_PI : 0,
      d1: null, d2: null,
      deltaAtKink: intrinsic === 0,
    };
  }
  const rootTime = Math.sqrt(time);
  const d1 = (Math.log(spot / strike) + (rate + volatility ** 2 / 2) * time) / (volatility * rootTime);
  const d2 = d1 - volatility * rootTime;
  const density = Math.exp(-d1 * d1 / 2) / ROOT_TWO_PI;
  return {
    call: Math.max(0, spot * normalCdf(d1) - bond * normalCdf(d2)),
    put: Math.max(0, bond * normalCdf(-d2) - spot * normalCdf(-d1)),
    delta: normalCdf(d1), gamma: density / (spot * volatility * rootTime),
    vega: spot * density * rootTime, d1, d2, deltaAtKink: false,
  };
}

export function corporatePayoffs(assets, face) {
  bounded("Assets", assets, 0, 1e9);
  bounded("Debt face value", face, 1e-8, 1e9);
  return { equity: Math.max(assets - face, 0), debt: Math.min(assets, face) };
}

function random(seed) {
  if (!Number.isInteger(seed) || seed < 0 || seed > 0xffffffff)
    throw new Error("Seed must be an unsigned 32-bit integer.");
  let state = seed;
  return () => {
    state = (state + 0x6D2B79F5) | 0;
    let t = Math.imul(state ^ state >>> 15, 1 | state);
    t ^= t + Math.imul(t ^ t >>> 7, 61 | t);
    return ((t ^ t >>> 14) >>> 0) / 4294967296;
  };
}

// Exact GBM transitions on one fixed grid; all hedge schedules sample this same path.
export function stockPath(parameters, { seed = 1973, drift = 0.08, grid = 1024 } = {}) {
  validate(parameters);
  bounded("Drift", drift, -1, 1);
  if (!Number.isInteger(grid) || grid < 1 || grid > 16384) throw new Error("Grid must be an integer from 1 to 16384.");
  const uniform = random(seed);
  const dt = parameters.time / grid;
  const values = [parameters.spot];
  for (let i = 0; i < grid; i++) {
    const z = Math.sqrt(-2 * Math.log(Math.max(uniform(), Number.EPSILON))) * Math.cos(2 * Math.PI * uniform());
    values.push(values.at(-1) * Math.exp((drift - parameters.volatility ** 2 / 2) * dt + parameters.volatility * Math.sqrt(dt) * z));
  }
  return values;
}

export function hedgePath(parameters, path, intervals) {
  validate(parameters);
  if (!Array.isArray(path) || path.length < 2 || path[0] !== parameters.spot || path.some(s => !Number.isFinite(s) || s < 0))
    throw new Error("Path must contain finite nonnegative prices and start at spot.");
  const grid = path.length - 1;
  if (!Number.isInteger(intervals) || intervals < 1 || grid % intervals !== 0)
    throw new Error("Hedge intervals must divide the common path grid.");
  const initial = blackScholes(parameters);
  let delta = initial.delta;
  let cash = initial.call - delta * parameters.spot;
  const records = [{ time: 0, spot: path[0], portfolio: initial.call, option: initial.call, error: 0, delta, cash }];
  const dt = parameters.time / intervals;
  for (let i = 1; i <= intervals; i++) {
    const spot = path[i * grid / intervals];
    cash *= Math.exp(parameters.rate * dt);
    const portfolio = delta * spot + cash;
    const option = blackScholes({ ...parameters, spot, time: i === intervals ? 0 : parameters.time - i * dt });
    if (i < intervals) {
      cash -= (option.delta - delta) * spot;
      delta = option.delta;
    }
    records.push({ time: i * dt, spot, portfolio, option: option.call, error: portfolio - option.call, delta, cash });
  }
  return { records, error: records.at(-1).error, payoff: records.at(-1).option, terminal: path.at(-1), initial: initial.call };
}

export function hedgeEnsemble(parameters, { seed = 1973, drift = 0.08, paths = 96 } = {}) {
  if (!Number.isInteger(paths) || paths < 1 || paths > 512) throw new Error("Path count must be an integer from 1 to 512.");
  const sums = FREQUENCIES.map(intervals => ({ intervals, squared: 0, total: 0 }));
  for (let i = 0; i < paths; i++) {
    const path = stockPath(parameters, { seed: (seed + i) >>> 0, drift });
    for (const row of sums) {
      const { error } = hedgePath(parameters, path, row.intervals);
      row.squared += error ** 2;
      row.total += error;
    }
  }
  return sums.map(({ intervals, squared, total }) => ({ intervals, rmse: Math.sqrt(squared / paths), mean: total / paths }));
}
