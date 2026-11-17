import React, { useMemo, useState } from "react";
import { createRoot } from "react-dom/client";
import { ObservatoryNav, PaperContinuation } from "../../../shared/ObservatoryShell.jsx";
import { blackScholes, corporatePayoffs, stockPath, hedgePath, hedgeEnsemble, FREQUENCIES } from "./lib/black-scholes.js";
import "./styles.css";

const DEFAULTS = { spot: 100, strike: 100, volatility: 0.2, time: 1, rate: 0.05 };
const HEDGE = { ...DEFAULTS };
const dollars = x => `${x < 0 ? '−' : ''}$${Math.abs(x).toFixed(2)}`;
const percent = x => `${(x * 100).toFixed(0)}%`;
const source = page => `https://www.sfu.ca/~kkasa/BlackScholes_73.pdf#page=${page}`;
const storageKey = "black-scholes-observatory:depth";
function readDepth() { try { return localStorage.getItem(storageKey) === "advanced"; } catch { return false; } }

function Slider({ id, label, value, min, max, step, display, onChange }) {
  return <div className="control"><label htmlFor={id}>{label}<output htmlFor={id}>{display(value)}</output></label><input id={id} type="range" min={min} max={max} step={step} value={value} aria-valuetext={display(value)} onChange={e => onChange(Number(e.target.value))} /></div>;
}
function Stat({ label, children, id }) { return <div className="stat"><span>{label}</span><strong id={id}>{children}</strong></div>; }
function Heading({ number, title, children }) { return <div className="section-heading"><div><p className="eyebrow">EXPERIMENT {number}</p><h2>{title}</h2></div><p>{children}</p></div>; }

function Chart({ id, title, description, lines, xMax, yMin = 0, yMax, xLabel, yLabel, marker, tangent }) {
  const box = { l: 58, r: 690, t: 28, b: 265 };
  const x = v => box.l + v / xMax * (box.r - box.l);
  const y = v => box.b - (v - yMin) / (yMax - yMin) * (box.b - box.t);
  return <figure className="chart"><svg viewBox="0 0 720 320" role="img" aria-labelledby={`${id}-title ${id}-desc`}>
    <title id={`${id}-title`}>{title}</title><desc id={`${id}-desc`}>{description}</desc>
    <defs><clipPath id={`${id}-clip`}><rect x={box.l} y={box.t} width={box.r - box.l} height={box.b - box.t} /></clipPath></defs>
    {[0, 1, 2, 3, 4].map(i => { const value = yMin + (yMax - yMin) * i / 4; return <g key={i}><line className="grid" x1={box.l} x2={box.r} y1={y(value)} y2={y(value)} /><text x={box.l - 10} y={y(value) + 4} textAnchor="end">{Math.abs(value) < 0.005 ? '0' : value.toFixed(yMax - yMin < 10 ? 1 : 0)}</text></g>; })}
    {[0, 1, 2, 3, 4].map(i => <text key={i} x={x(xMax * i / 4)} y="285" textAnchor="middle">{(xMax * i / 4).toFixed(xMax <= 5 ? 2 : 0)}</text>)}
    <text x={box.l} y="14">{yLabel}</text><text x="374" y="312" textAnchor="middle">{xLabel}</text>
    <g clipPath={`url(#${id}-clip)`}>
      {yMin < 0 && <line className="zero-line" x1={box.l} x2={box.r} y1={y(0)} y2={y(0)} />}
      {marker && <line className="marker" x1={x(marker.x)} x2={x(marker.x)} y1={box.t} y2={box.b} />}
      {lines.map(line => <path key={line.label} className={`plot ${line.className}`} d={line.values.map(([a, b], i) => `${i ? 'L' : 'M'}${x(a).toFixed(2)},${y(b).toFixed(2)}`).join(' ')} />)}
      {tangent && <path className="tangent" d={`M${x(tangent.x - 18)},${y(tangent.y - tangent.slope * 18)}L${x(tangent.x + 18)},${y(tangent.y + tangent.slope * 18)}`} />}
      {marker?.y !== undefined && <circle cx={x(marker.x)} cy={y(marker.y)} r="5" className="chart-dot" />}
    </g>
  </svg><figcaption><div className="legend">{lines.map(line => <span key={line.label}><i className={line.className} />{line.label}</span>)}{tangent && <span><i className="tangent" />Local slope = delta</span>}</div><p>{description}</p></figcaption></figure>;
}

function PriceLab({ advanced }) {
  const [parameters, setParameters] = useState({ ...DEFAULTS });
  const result = blackScholes(parameters);
  const bank = result.call - result.delta * parameters.spot;
  const xMax = Math.max(parameters.strike, parameters.spot) * 1.65;
  const spots = [...new Set([...Array.from({ length: 121 }, (_, i) => xMax * i / 120), parameters.strike, parameters.spot])].sort((a, b) => a - b);
  const lines = [
    { label: 'Call value today', className: 'teal', values: spots.map(spot => [spot, blackScholes({ ...parameters, spot }).call]) },
    { label: 'Payoff at expiry', className: 'rust dashed', values: spots.map(spot => [spot, Math.max(spot - parameters.strike, 0)]) },
  ];
  const update = key => value => setParameters(p => ({ ...p, [key]: value }));
  return <section id="pricing" className="lab"><Heading number="01" title="A price without a prediction.">Move the inputs. The curve is the option’s value today; the dashed line is what it pays at expiry. Its slope tells you how many shares replicate one call locally.</Heading>
    <div className="experiment"><aside className="controls">
      <p className="eyebrow">EUROPEAN CALL · NO DIVIDENDS</p>
      <Slider id="spot" label="Stock price S" value={parameters.spot} min={40} max={180} step={1} display={dollars} onChange={update('spot')} />
      <Slider id="strike" label="Strike K" value={parameters.strike} min={50} max={150} step={1} display={dollars} onChange={update('strike')} />
      <Slider id="volatility" label="Annual volatility σ" value={parameters.volatility} min={0} max={0.8} step={0.01} display={percent} onChange={update('volatility')} />
      <Slider id="time" label="Time remaining τ" value={parameters.time} min={0} max={3} step={0.05} display={x => `${x.toFixed(2)} years`} onChange={update('time')} />
      <Slider id="rate" label="Risk-free rate r" value={parameters.rate} min={0} max={0.1} step={0.005} display={x => `${(x * 100).toFixed(1)}%`} onChange={update('rate')} />
      <button onClick={() => setParameters({ ...DEFAULTS })}>Reset pricing</button><p className="small">Prices per share. Volatility is annual standard deviation; rates compound continuously.</p>
    </aside><div className="panel"><div className="stats" aria-live="polite"><Stat label="CALL VALUE" id="call-value">{dollars(result.call)}</Stat><Stat label="DELTA · SHARES / CALL" id="delta-value">{result.delta.toFixed(3)}</Stat><Stat label="CASH ACCOUNT" id="cash-value">{dollars(bank)}</Stat></div>
      <Chart id="pricing-chart" title="Call value and expiry payoff versus stock price" description={`At stock ${dollars(parameters.spot)}, the call is ${dollars(result.call)} and delta is ${result.delta.toFixed(3)} shares per call. The tangent describes a small move at fixed time.`} lines={lines} xMax={xMax} yMax={Math.max(10, lines[0].values.at(-1)[1] * 1.1)} xLabel="Stock price S ($ per share)" yLabel="Call value ($ per share)" marker={{ x: parameters.spot, y: result.call }} tangent={{ x: parameters.spot, y: result.call, slope: result.delta }} />
      <div className="replication"><span>BUILD ONE CALL</span><p><b>{result.delta.toFixed(4)} shares × {dollars(parameters.spot)}</b> + <b>({dollars(bank)} cash)</b> ≈ <b>{dollars(result.call)}</b></p><small>The stock position is worth {dollars(result.delta * parameters.spot)}. A negative cash balance means borrowing. Displayed values are rounded.</small></div>
      {result.deltaAtKink && <p className="caveat">At this kink, delta is undefined. The displayed 0.500 is a numerical convention; gamma is not defined there either.</p>}
    </div></div>
    <p className="interpretation">The stock can have any expected return consistent with the model. The call’s replication cost still uses only S, K, σ, τ and r. <a href={source(9)}>Black–Scholes, p. 644 (PDF 9) ↗</a></p>
    {advanced && <div className="advanced"><h3>The formula, in modern notation</h3><div className="equations"><p>C = S Φ(d₁) − K e<sup>−rτ</sup> Φ(d₂) &nbsp; · &nbsp; Δ = Φ(d₁)</p><p>d₁ = [ln(S/K) + (r + σ²/2)τ] / (σ√τ) &nbsp; · &nbsp; d₂ = d₁ − σ√τ</p></div><p>Φ is the standard normal CDF. Delta is a hedge ratio, not an exercise probability. Φ(d₂) is the model’s <em>risk-neutral</em> exercise probability, not a forecast. At zero volatility the call is max(S − K e<sup>−rτ</sup>, 0); at expiry it is max(S − K, 0). These limits are evaluated directly.</p><p>For these inputs: European put = {dollars(result.put)}; call − put = {dollars(result.call - result.put)} = S − K e<sup>−rτ</sup>. <a href={source(12)}>Put–call parity, p. 647 (PDF 12) ↗</a></p></div>}
  </section>;
}

function HedgeLab({ advanced }) {
  const [intervals, setIntervals] = useState(16);
  const [seed, setSeed] = useState(1973);
  const [drift, setDrift] = useState(0.08);
  const path = useMemo(() => stockPath(HEDGE, { seed, drift }), [seed, drift]);
  const hedge = useMemo(() => hedgePath(HEDGE, path, intervals), [path, intervals]);
  const ensemble = useMemo(() => hedgeEnsemble(HEDGE, { seed, drift }), [seed, drift]);
  const errorMax = Math.max(0.5, ...hedge.records.map(row => Math.abs(row.error))) * 1.2;
  const selected = ensemble.find(row => row.intervals === intervals);
  return <section id="hedging" className="lab"><Heading number="02" title="Keep rebuilding the same option.">A curve needs a moving hedge. Buy delta shares, borrow the rest, then rebalance. Compare coarse and fine schedules on exactly the same synthetic stock path.</Heading>
    <div className="experiment"><aside className="controls"><p className="eyebrow">SYNTHETIC · SELF-FINANCING</p><label className="select-label" htmlFor="frequency">Hedge intervals over one year</label><select id="frequency" value={intervals} onChange={e => setIntervals(Number(e.target.value))}>{FREQUENCIES.map(n => <option key={n} value={n}>{n} intervals</option>)}</select>
      <Slider id="drift" label="Simulated stock drift μ" value={drift} min={-0.2} max={0.3} step={0.01} display={percent} onChange={setDrift} />
      <p className="small">μ changes the stock paths, never the initial option price. This is physical-measure GBM with your chosen drift, not a forecast.</p>
      <div className="button-stack"><button onClick={() => setSeed(s => s + 1)}>New seeded paths</button><button onClick={() => { setSeed(1973); setIntervals(16); setDrift(0.08); }}>Reset hedging</button></div>
      <dl className="fixed-inputs"><div><dt>Stock / strike</dt><dd>$100 / $100</dd></div><div><dt>Volatility / rate</dt><dd>20% / 5%</dd></div><div><dt>Expiry / seed</dt><dd>1 year / {seed}</dd></div><div><dt>Initial option price</dt><dd>{dollars(hedge.initial)}</dd></div></dl>
    </aside><div className="panel"><div className="stats" aria-live="polite"><Stat label="TERMINAL STOCK" id="terminal-stock">{dollars(hedge.terminal)}</Stat><Stat label="HEDGE − PAYOFF" id="hedge-error">{dollars(hedge.error)}</Stat><Stat label="96-PATH RMS ERROR" id="rms-error">{dollars(selected.rmse)}</Stat></div>
      <Chart id="stock-chart" title="The common synthetic stock path" description="All hedge frequencies sample this same 1,024-step geometric Brownian path. The terminal stock stays fixed when only the hedge frequency changes." lines={[{ label: 'Stock price · same path', className: 'teal', values: path.map((s, i) => [i / 1024, s]) }]} xMax={1} yMin={Math.min(...path) * 0.9} yMax={Math.max(...path) * 1.1} xLabel="Elapsed time (years)" yLabel="Stock price ($)" />
      <Chart id="error-chart" title="Replication error at hedge dates" description={`Portfolio minus model option value at each hedge date. At expiry, portfolio ${dollars(hedge.records.at(-1).portfolio)} minus payoff ${dollars(hedge.payoff)} equals ${dollars(hedge.error)}.`} lines={[{ label: 'Hedge error at observations', className: 'rust', values: hedge.records.map(row => [row.time, row.error]) }]} xMax={1} yMin={-errorMax} yMax={errorMax} xLabel="Elapsed time (years)" yLabel="Portfolio − option ($)" />
    </div></div>
    <div className="ensemble"><div><p className="eyebrow">ZOOM OUT · 96 SHARED PATHS</p><h3>Replication improves across paths.</h3><p>RMS error is the square root of the mean squared terminal error. Each frequency uses the same 96 paths. This finite sample illustrates convergence; it is not a guarantee at every setting.</p></div><table><caption className="sr-only">Terminal replication error across 96 synthetic stock paths</caption><thead><tr><th scope="col">Intervals</th><th scope="col">RMS error ($)</th><th scope="col">Mean error ($)</th></tr></thead><tbody>{ensemble.map(row => <tr key={row.intervals} className={row.intervals === intervals ? 'selected' : ''}><th scope="row">{row.intervals}</th><td>{dollars(row.rmse)}</td><td>{dollars(row.mean)}</td></tr>)}</tbody></table></div>
    <p className="caveat"><b>One path can be untidy.</b> Its absolute hedge error need not shrink at every increase in frequency. Continuous replication is a limiting result under the model. These paths have no jumps, costs or volatility misspecification; real hedges do. <a href={source(6)}>Paper pp. 641–643 (PDF 6–8) ↗</a></p>
    {advanced && <div className="advanced"><h3>Where did the expected return go?</h3><div className="equations"><p>dS = μS dt + σS dW</p><p>dC = (C<sub>t</sub> + μS C<sub>S</sub> + ½σ²S² C<sub>SS</sub>) dt + σS C<sub>S</sub> dW</p><p>Choose Δ = C<sub>S</sub>. The diffusion and μ terms cancel against Δ dS.</p><p>C<sub>t</sub> + ½σ²S² C<sub>SS</sub> + rS C<sub>S</sub> − rC = 0, &nbsp; C(S,T) = max(S − K, 0).</p></div><p>Here t is calendar time; τ = T − t is time remaining. In the simulator, B₀ = C₀ − Δ₀S₀. Between dates, cash accrues at r. Each rebalance buys Δ<sub>new</sub> − Δ<sub>old</sub> shares using the cash account. No fresh money is injected; the hedge is never reset to the theoretical option value. The displayed error is undiscounted terminal dollars. Initial trading sets the hedge; the final observation settles the payoff without another stock rebalance.</p></div>}
  </section>;
}

function LiabilityLab({ advanced }) {
  const [assets, setAssets] = useState(120);
  const [face, setFace] = useState(100);
  const payout = corporatePayoffs(assets, face);
  const axisMax = 220;
  const values = [...new Set([...Array.from({ length: 111 }, (_, i) => i * 2), face])].sort((a, b) => a - b);
  return <section id="liabilities" className="lab"><Heading number="03" title="Equity is a call on the firm.">At the debt’s maturity, lenders get paid first. Shareholders receive the residual and can walk away when assets cannot cover the debt. Debt face value plays the role of the strike.</Heading>
    <div className="experiment"><aside className="controls"><p className="eyebrow">AT MATURITY · TOTAL DOLLARS</p><Slider id="assets" label="Terminal firm assets Aₜ" value={assets} min={0} max={220} step={1} display={dollars} onChange={setAssets} /><Slider id="face" label="Debt face value F" value={face} min={40} max={160} step={1} display={dollars} onChange={setFace} /><button onClick={() => { setAssets(120); setFace(100); }}>Reset liabilities</button><p className="small">One zero-coupon debt issue, one maturity, limited liability. No interim distributions, taxes or bankruptcy costs.</p></aside><div className="panel"><div className="stats" aria-live="polite"><Stat label="EQUITY PAYOUT" id="equity-payout">{dollars(payout.equity)}</Stat><Stat label="DEBT PAYOUT" id="debt-payout">{dollars(payout.debt)}</Stat><Stat label="TOTAL = ASSETS" id="total-payout">{dollars(payout.equity + payout.debt)}</Stat></div>
      <Chart id="liability-chart" title="Equity and debt payouts at maturity" description={`With ${dollars(assets)} of assets and ${dollars(face)} owed, shareholders receive ${dollars(payout.equity)} and lenders receive ${dollars(payout.debt)}. These payouts sum to firm assets.`} lines={[{ label: 'Equity · call payoff', className: 'teal', values: values.map(a => [a, corporatePayoffs(a, face).equity]) }, { label: 'Debt · capped claim', className: 'rust dashed', values: values.map(a => [a, corporatePayoffs(a, face).debt]) }]} xMax={axisMax} yMax={220} xLabel="Firm assets at debt maturity ($)" yLabel="Claim payout ($)" marker={{ x: assets }} />
      <p className="interpretation">{assets < face ? `Assets fall short by ${dollars(face - assets)}. Equity pays zero; lenders receive the assets that remain.` : assets === face ? 'Assets just repay debt. Equity pays zero, and lenders receive the full face value.' : `Debt is paid in full. The remaining ${dollars(assets - face)} belongs to equity.`}</p>
    </div></div><p className="caveat">These are <b>terminal payouts</b>, not today’s market values or a calibrated credit-risk estimate. The paper already contains the equity-as-call argument. <a href={source(14)}>Paper pp. 649–650 (PDF 14–15) ↗</a></p>
    {advanced && <div className="advanced"><h3>The same option structure</h3><div className="equations"><p>E<sub>T</sub> = max(A<sub>T</sub> − F, 0) &nbsp; · &nbsp; D<sub>T</sub> = min(A<sub>T</sub>, F)</p><p>E₀ = C(A₀, F, r, σ<sub>A</sub>, τ) &nbsp; · &nbsp; D₀ = A₀ − E₀</p></div><p>To value these claims before maturity, the optioned asset is the <em>firm’s assets</em>. Its volatility σ<sub>A</sub> is not equity volatility. This simple capital structure does not price every corporate liability: coupons, multiple seniorities and convertibility add further option features. <a href={source(17)}>Paper p. 652 (PDF 17) ↗</a></p></div>}
  </section>;
}

function App() {
  const [advanced, setAdvanced] = useState(readDepth);
  const [answer, setAnswer] = useState("");
  function depth(value) { setAdvanced(value); try { localStorage.setItem(storageKey, value ? 'advanced' : 'foundation'); } catch { /* Computation works without storage. */ } }
  return <><a className="skip-link" href="#pricing">Skip to the experiments</a><ObservatoryNav slug="black-scholes" /><main className="bs-main"><header className="hero"><div className="hero-top"><p className="eyebrow">THE BLACK–SCHOLES OBSERVATORY / 1973</p><span>THREE EXPERIMENTS · ONE BIG IDEA</span></div><h1>Replicate.<br /><em>Don’t predict.</em></h1><div className="hero-bottom"><div><p className="lede">What should an option cost if you don’t know which way the stock will go? Build the same payoff from shares and borrowing. Its price follows.</p><p className="source-line"><em>The Pricing of Options and Corporate Liabilities</em><br />Fischer Black &amp; Myron Scholes · Journal of Political Economy 81(3), 637–654<br /><a href="https://doi.org/10.1086/260062" target="_blank" rel="noreferrer">Publisher record ↗</a> <span aria-hidden="true"> / </span> <a href={source(2)} target="_blank" rel="noreferrer">Read the source PDF ↗</a></p></div><div className="hero-seal" aria-hidden="true"><span>PRICE COMES FROM</span><b>Δ</b><span>REPLICATION</span></div></div><div className="chapter-row"><nav aria-label="Exhibit chapters"><a href="#pricing">01 / Price &amp; delta</a><a href="#hedging">02 / Rebalance</a><a href="#liabilities">03 / The firm</a><a href="#evidence">Evidence</a></nav><div className="depth" role="group" aria-label="Learning depth"><button aria-pressed={!advanced} onClick={() => depth(false)}>Foundation</button><button aria-pressed={advanced} onClick={() => depth(true)}>Advanced</button></div></div></header>
    <aside className="assumptions"><b>The model’s world</b><span>European exercise · no dividends · constant volatility and rate · continuous prices · frictionless trading and borrowing. Unique replication prices apply under these assumptions.</span></aside>
    <PriceLab advanced={advanced} /><HedgeLab advanced={advanced} /><LiabilityLab advanced={advanced} />
    <section id="evidence" className="evidence"><div><p className="eyebrow">BACK TO THE PAPER</p><h2>A breakthrough with<br /><em>conditions attached.</em></h2><p>The pricing equation, hedge ratio and corporate-liability argument are paper results. These sliders, seeded paths and ensemble comparisons are original educational reconstructions, not the authors’ empirical data.</p><p>The source has a JSTOR cover: printed p. 637 is physical PDF page 2. References here give both numbers. The original PDF remains private in this workspace; the links open the university-hosted copy.</p><p>The paper’s historical empirical discussion reports systematic deviations and transaction costs (p. 653 / PDF 18). A model price is not a claim that markets always trade at that number.</p></div><div className="evidence-links"><a href={source(5)}>Market assumptions · p. 640 / PDF 5 ↗</a><a href={source(6)}>Continuous hedge and PDE · pp. 641–643 / PDF 6–8 ↗</a><a href={source(9)}>Call formula and absence of μ · p. 644 / PDF 9 ↗</a><a href={source(10)}>Delta · p. 645 / PDF 10 ↗</a><a href={source(14)}>Corporate liabilities · pp. 649–650 / PDF 14–15 ↗</a><a href={source(18)}>Empirical qualifications · p. 653 / PDF 18 ↗</a></div></section>
    {advanced && <section className="advanced"><h3>Beyond the flat-volatility world</h3><p>The paper credits Robert C. Merton for related results on option pricing and exercise. His separate 1973 paper, <a href="https://doi.org/10.2307/3003143">Theory of Rational Option Pricing</a>, develops the theory further. Our labs use the non-dividend Black–Scholes case; they do not implement all of Merton’s extensions. Corporate equity as a call is already present in the Black–Scholes article.</p><p>A single constant volatility produces a flat implied-volatility surface. Real smiles motivate richer models. Continue with <a href="/sabr-smile-risk/">the SABR Smile Observatory ↗</a>. Black’s later forward-option model connects this replication tradition to rate derivatives; the stock call here is not itself a swaption pricer.</p></section>}
    <section className="knowledge"><div><p className="eyebrow">CHECK THE IDEA</p><h2>Which input is absent from the call price?</h2></div><div><div className="answers">{['Expected stock return μ', 'Volatility σ', 'Time remaining τ'].map(item => <button key={item} aria-pressed={answer === item} onClick={() => setAnswer(item)}>{item}</button>)}</div>{answer && <p className="answer-feedback" role="status">{answer === 'Expected stock return μ' ? 'Correct. Replication removes the expected-return input under the model. Volatility and time remaining still affect the cost.' : 'Try again. Volatility and time remaining affect the replication cost. The expected stock return drops out.'}</p>}<button className="text-button" onClick={() => setAnswer('')}>Reset answer</button></div></section>
    <section className="glossary"><p className="eyebrow">POCKET GLOSSARY</p><dl><div><dt>Delta</dt><dd>Shares per option needed for a local hedge; the slope of its value curve.</dd></div><div><dt>Self-financing</dt><dd>Stock trades are paid for through the cash account, with no new cash injected.</dd></div><div><dt>Replication error</dt><dd>Hedge portfolio value minus the claim it is meant to replicate.</dd></div><div><dt>No arbitrage</dt><dd>No zero-cost strategy can avoid every loss and have a positive chance of a gain.</dd></div></dl></section>
  </main><PaperContinuation slug="black-scholes" /></>;
}

class ErrorBoundary extends React.Component {
  state = { error: false };
  static getDerivedStateFromError() { return { error: true }; }
  componentDidCatch(error) { console.error("Black–Scholes exhibit:", error.message); }
  render() { return this.state.error ? <main className="bs-main"><h1>The experiment could not load.</h1><p>Reload to restore valid defaults. The source reading guide below remains available.</p><button onClick={() => window.location.reload()}>Reload exhibit</button><p><a href="/">Back to the paper library</a></p></main> : this.props.children; }
}
createRoot(document.getElementById("root")).render(<ErrorBoundary><App /></ErrorBoundary>);
