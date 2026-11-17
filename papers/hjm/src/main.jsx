import React from "react";
import { createRoot } from "react-dom/client";
import { ObservatoryNav, PaperContinuation } from "../../../shared/ObservatoryShell.jsx";
import { sourceUrl } from "../../../shared/catalog.js";
import { campaignUrl, recommendedCourseForPaper } from "../../../shared/site-config.js";
import {
  conditionFactorShockAtMaturity,
  evolveForwardCurve,
  hjmRiskNeutralDrift,
  interpolateForwardCurve,
} from "./lib/hjm.js";
import "./styles.css";

const INITIAL_KNOTS = Object.freeze([
  { maturity: 0.25, rate: 0.032 },
  { maturity: 1, rate: 0.034 },
  { maturity: 3, rate: 0.038 },
  { maturity: 5, rate: 0.04 },
  { maturity: 10, rate: 0.043 },
  { maturity: 20, rate: 0.046 },
  { maturity: 30, rate: 0.045 },
]);
const CURRENT_TIME = 0;
const TIME_STEP = 0.25;
const SHOCK_MATURITY = 5;
const MATURITIES = Array.from({ length: 120 }, (_, index) => 0.25 + index * 0.25);
const RATE_MIN = -0.02;
const RATE_MAX = 0.08;
const number = (value, digits = 2) => Number(value).toFixed(digits);
const percent = (value, digits = 2) => `${(value * 100).toFixed(digits)}%`;
const clamp = (value, minimum, maximum) => Math.min(maximum, Math.max(minimum, value));

function makeVolatilityFactors(scale, shape, factorCount) {
  const distance = (time, maturity) => Math.max(0, maturity - time);
  const shapeLoading = (time, maturity) => {
    const years = distance(time, maturity);
    if (shape === "short") return Math.exp(-years / 8);
    if (shape === "hump") return Math.exp(-0.5 * ((maturity - 5) / 2.5) ** 2);
    return 1;
  };
  if (factorCount === 1) return [(time, maturity) => scale * shapeLoading(time, maturity)];
  return [
    () => scale * 0.65,
    (time, maturity) => scale * 0.76 * shapeLoading(time, maturity),
  ];
}

function pathForStep(rates, factors, factorIndex, direction, moveBps) {
  let increments = factors.map(() => 0);
  if (direction !== 0) {
    const otherIncrements = factors.map((_, index) =>
      index === factorIndex ? 0 : direction * 0.25 * Math.sqrt(TIME_STEP),
    );
    increments = conditionFactorShockAtMaturity({
      time: CURRENT_TIME,
      timeStep: TIME_STEP,
      maturity: SHOCK_MATURITY,
      volatilityFactors: factors,
      factorIndex,
      targetMove: direction * moveBps / 10_000,
      otherIncrements,
    });
  }
  return evolveForwardCurve(rates, MATURITIES, CURRENT_TIME, TIME_STEP, factors, increments);
}

function ForwardCurveChart({ knots, initialRates, oneFactorPath, twoFactorPath, onKnotChange }) {
  const plot = { left: 66, right: 722, top: 26, bottom: 262 };
  const x = (maturity) => plot.left +
    ((maturity - MATURITIES[0]) / (MATURITIES.at(-1) - MATURITIES[0])) * (plot.right - plot.left);
  const y = (rate) => plot.bottom - ((rate - RATE_MIN) / (RATE_MAX - RATE_MIN)) * (plot.bottom - plot.top);
  const line = (values) => values.map((rate, index) =>
    `${index ? "L" : "M"}${x(MATURITIES[index]).toFixed(1)},${y(rate).toFixed(1)}`,
  ).join(" ");
  const dragIndex = React.useRef(null);

  function setRateFromPointer(event, index) {
    const svg = event.currentTarget.ownerSVGElement;
    if (!svg) return;
    const point = svg.createSVGPoint();
    point.x = event.clientX;
    point.y = event.clientY;
    const local = point.matrixTransform(svg.getScreenCTM().inverse());
    const fraction = clamp((local.y - plot.top) / (plot.bottom - plot.top), 0, 1);
    onKnotChange(index, RATE_MAX - fraction * (RATE_MAX - RATE_MIN));
  }

  function handleKey(event, index) {
    const amount = event.shiftKey ? 0.001 : 0.00025;
    let value;
    if (event.key === "ArrowUp" || event.key === "ArrowRight") value = knots[index].rate + amount;
    else if (event.key === "ArrowDown" || event.key === "ArrowLeft") value = knots[index].rate - amount;
    else if (event.key === "Home") value = RATE_MIN;
    else if (event.key === "End") value = RATE_MAX;
    else return;
    event.preventDefault();
    onKnotChange(index, clamp(value, -0.015, RATE_MAX));
  }

  return (
    <figure className="curve-chart">
      <svg viewBox="0 0 760 322" role="group" aria-labelledby="curve-title curve-description">
        <title id="curve-title">Initial forward curve and one-step HJM evolution</title>
        <desc id="curve-description">Drag a marked maturity to edit the initial forward curve. The other curves show a synthetic quarter-year evolution under one or two volatility factors, including the risk-neutral HJM drift.</desc>
        {[-0.02, 0, 0.02, 0.04, 0.06, 0.08].map((rate) => (
          <g key={rate}>
            <line className="curve-grid" x1={plot.left} x2={plot.right} y1={y(rate)} y2={y(rate)} />
            <text className="curve-tick" x={plot.left - 10} y={y(rate) + 4} textAnchor="end">{percent(rate, 0)}</text>
          </g>
        ))}
        {[1, 5, 10, 15, 20, 25, 30].map((maturity) => (
          <g key={maturity}>
            <line className="curve-grid curve-grid-vertical" x1={x(maturity)} x2={x(maturity)} y1={plot.top} y2={plot.bottom} />
            <text className="curve-tick" x={x(maturity)} y={plot.bottom + 18} textAnchor="middle">{maturity}y</text>
          </g>
        ))}
        <line className="curve-axis" x1={plot.left} x2={plot.right} y1={plot.bottom} y2={plot.bottom} />
        <path className="curve-path curve-one-factor" d={line(oneFactorPath)} />
        <path className="curve-path curve-two-factor" d={line(twoFactorPath)} />
        <path className="curve-path curve-initial" d={line(initialRates)} />
        {knots.map((point, index) => (
          <g key={point.maturity}>
            <circle
              className="curve-handle"
              cx={x(point.maturity)}
              cy={y(point.rate)}
              r="15"
              role="slider"
              tabIndex="0"
              aria-label={`${point.maturity}-year initial forward rate`}
              aria-valuemin="-1.5"
              aria-valuemax="8"
              aria-valuenow={Number((point.rate * 100).toFixed(2))}
              aria-valuetext={`${percent(point.rate, 2)} at ${point.maturity} years`}
              onKeyDown={(event) => handleKey(event, index)}
              onPointerDown={(event) => {
                dragIndex.current = index;
                event.currentTarget.setPointerCapture(event.pointerId);
              }}
              onPointerMove={(event) => {
                if (dragIndex.current === index && event.buttons === 1) setRateFromPointer(event, index);
              }}
              onPointerUp={() => { dragIndex.current = null; }}
              onPointerCancel={() => { dragIndex.current = null; }}
            />
            <circle className="curve-handle-visual" cx={x(point.maturity)} cy={y(point.rate)} r="5" aria-hidden="true" />
          </g>
        ))}
        <text className="curve-axis-title" x={(plot.left + plot.right) / 2} y="315" textAnchor="middle">Maturity T (years)</text>
      </svg>
      <figcaption className="curve-legend">
        <span><i className="legend-initial" /> Editable initial curve</span>
        <span><i className="legend-one" /> One-factor evolution</span>
        <span><i className="legend-two" /> Two-factor evolution</span>
        <small>Rate f(t,T) · synthetic fixed-volatility teaching paths, not a calibrated forecast</small>
      </figcaption>
    </figure>
  );
}

function App() {
  const [knots, setKnots] = React.useState(() => INITIAL_KNOTS.map((point) => ({ ...point })));
  const [volatility, setVolatility] = React.useState(0.012);
  const [shape, setShape] = React.useState("hump");
  const [moveBps, setMoveBps] = React.useState(25);
  const [direction, setDirection] = React.useState(0);
  const [advanced, setAdvanced] = React.useState(false);
  const [shockMessage, setShockMessage] = React.useState("");
  const [answer, setAnswer] = React.useState("");

  const rates = React.useMemo(() => interpolateForwardCurve(knots, MATURITIES), [knots]);
  const oneFactorVols = React.useMemo(() => makeVolatilityFactors(volatility, shape, 1), [volatility, shape]);
  const twoFactorVols = React.useMemo(() => makeVolatilityFactors(volatility, shape, 2), [volatility, shape]);
  const oneFactorPath = React.useMemo(
    () => pathForStep(rates, oneFactorVols, 0, direction, moveBps),
    [rates, oneFactorVols, direction, moveBps],
  );
  const twoFactorPath = React.useMemo(
    () => pathForStep(rates, twoFactorVols, 1, direction, moveBps),
    [rates, twoFactorVols, direction, moveBps],
  );
  const initialFiveYear = interpolateForwardCurve(knots, [SHOCK_MATURITY])[0];
  const oneFactorDrift = hjmRiskNeutralDrift(CURRENT_TIME, SHOCK_MATURITY, oneFactorVols);
  const twoFactorDrift = hjmRiskNeutralDrift(CURRENT_TIME, SHOCK_MATURITY, twoFactorVols);
  const localSource = import.meta.env.LOCAL_SOURCE_AVAILABLE === true;
  const course = recommendedCourseForPaper("hjm");

  function changeKnot(index, rate) {
    setKnots((current) => current.map((point, pointIndex) =>
      pointIndex === index ? { ...point, rate: clamp(rate, -0.015, RATE_MAX) } : point,
    ));
    setDirection(0);
  }

  function sendShock(nextDirection) {
    try {
      pathForStep(rates, oneFactorVols, 0, nextDirection, moveBps);
      setDirection(nextDirection);
      setShockMessage("");
    } catch (error) {
      setShockMessage(error.message);
    }
  }

  function reset() {
    setKnots(INITIAL_KNOTS.map((point) => ({ ...point })));
    setVolatility(0.012);
    setShape("hump");
    setMoveBps(25);
    setDirection(0);
    setAnswer("");
    setShockMessage("");
  }

  const readSource = (page) => sourceUrl("hjm", page, { local: localSource });
  const afterOneFactor = oneFactorPath[MATURITIES.indexOf(SHOCK_MATURITY)];
  const afterTwoFactor = twoFactorPath[MATURITIES.indexOf(SHOCK_MATURITY)];

  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <ObservatoryNav slug="hjm" />
      <main id="main-content" className="hjm-main">
        <header className="hjm-hero">
          <p className="hjm-eyebrow">THE HJM OBSERVATORY · PAPER 004</p>
          <h1>The whole curve moves.<br /><em>No-arbitrage sets the drift.</em></h1>
          <p className="hjm-lede">Before HJM, a model often began with one short rate and tried to build the yield curve outward. Heath, Jarrow, and Morton start with the market’s entire forward curve. Choose how that curve’s volatility moves, and no-arbitrage forces the drift that keeps bond prices in line.</p>
          <p className="hjm-source-line"><strong>Bond Pricing and the Term Structure of Interest Rates: A New Methodology for Contingent Claims Valuation</strong> · David Heath, Robert Jarrow &amp; Andrew Morton · <em>Econometrica</em> 60(1), 1992</p>
          <div className="learning-toggle" role="group" aria-label="Learning depth">
            <span>LEARNING DEPTH</span>
            <button type="button" aria-pressed={!advanced} onClick={() => setAdvanced(false)}>Foundation</button>
            <button type="button" aria-pressed={advanced} onClick={() => setAdvanced(true)}>Advanced</button>
          </div>
          <p className="lineage"><strong>HJM is foundational to the modern arbitrage-free forward-rate framework.</strong> The late-1990s LIBOR Market Model (also called BGM) is a direct descendant formulated within HJM. Not every stochastic interest-rate model is derived from HJM; equilibrium and short-rate approaches remain distinct.</p>
        </header>

        <section id="experiment" className="hjm-lab" aria-labelledby="lab-title">
          <div className="lab-heading">
            <div><p className="hjm-eyebrow">THE INTERACTIVE EXPERIMENT</p><h2 id="lab-title">Start with the curve.</h2></div>
            <p>Drag any marked point, or focus it and use the arrow keys. Choose the volatility factors, then send a 5-year forward a synthetic shock and compare the maturities’ response.</p>
          </div>
          <div className="experiment-card">
            <div className="experiment-controls">
              <div className="control-block">
                <label htmlFor="volatility">Volatility scale <output htmlFor="volatility">{(volatility * 100).toFixed(2)}%</output></label>
                <input id="volatility" type="range" min="0.002" max="0.03" step="0.001" value={volatility}
                  aria-valuetext={`${(volatility * 100).toFixed(2)} percent`} onChange={(event) => { setVolatility(Number(event.target.value)); setDirection(0); }} />
                <small>Annualized, fixed loading scale. The displayed shapes are synthetic—not fitted to market data.</small>
              </div>
              <div className="control-block">
                <label htmlFor="vol-shape">Volatility shape</label>
                <select id="vol-shape" value={shape} onChange={(event) => { setShape(event.target.value); setDirection(0); }}>
                  <option value="parallel">Parallel</option>
                  <option value="short">Short-end concentrated</option>
                  <option value="hump">Five-year hump</option>
                </select>
                <small>Sets how the factor loading changes with maturity.</small>
              </div>
              <div className="control-block">
                <label htmlFor="factor-count">Factor comparison</label>
                <p id="factor-count" className="fixed-comparison">One independent Brownian factor vs. two independent factors</p>
                <small>Both curves use the same starting curve and volatility-shape setting.</small>
              </div>
              <div className="control-block">
                <label htmlFor="shock-size">Target 5-year move <output htmlFor="shock-size">{moveBps} bp</output></label>
                <input id="shock-size" type="range" min="5" max="75" step="5" value={moveBps}
                  aria-valuetext={`${moveBps} basis points`} onChange={(event) => { setMoveBps(Number(event.target.value)); setDirection(0); }} />
                <small>The selected factor increment is conditioned to produce this move after the risk-neutral drift.</small>
              </div>
              <div className="shock-controls">
                <span>Shock the 5-year forward</span>
                <div>
                  <button type="button" onClick={() => sendShock(-1)} aria-label={`Send a negative ${moveBps} basis point five-year forward shock`}>↓ Down</button>
                  <button type="button" onClick={() => sendShock(1)} aria-label={`Send a positive ${moveBps} basis point five-year forward shock`}>↑ Up</button>
                  <button type="button" className="reset-button" onClick={reset}>Reset</button>
                </div>
                <small>One synthetic quarter-year step. The two-factor path also includes a shared parallel-factor increment.</small>
              </div>
              <p className="feedback" role="status">{shockMessage}</p>
            </div>
            <div className="curve-panel">
              <div className="curve-heading">
                <div><span className="hjm-eyebrow">ONE STARTING CURVE · TWO FACTOR SETUPS</span><h3>Watch every maturity respond.</h3></div>
                <span className="model-badge">SYNTHETIC TEACHING MODEL</span>
              </div>
              <ForwardCurveChart knots={knots} initialRates={rates} oneFactorPath={oneFactorPath}
                twoFactorPath={twoFactorPath} onKnotChange={changeKnot} />
              <div className="curve-readout" aria-live="polite">
                <span>Initial 5y forward <strong>{percent(initialFiveYear, 2)}</strong></span>
                <span>After one factor <strong>{percent(afterOneFactor, 2)}</strong></span>
                <span>After two factors <strong>{percent(afterTwoFactor, 2)}</strong></span>
                <span>{direction === 0 ? "No extra shock" : `${direction > 0 ? "+" : "−"}${moveBps} bp target shock`}</span>
              </div>
              <p className="chart-caveat">The simulation applies the HJM risk-neutral drift and a single deterministic Brownian-increment scenario. It does not estimate a probability distribution, calibrate to traded instruments, or reproduce a market forecast.</p>
            </div>
          </div>
          <p className="interpretation"><strong>The idea to carry away:</strong> the volatility is your modeling input; the risk-neutral drift is no longer an independent choice. Under the paper’s assumptions, a single condition ties each maturity’s drift to volatility loadings across the curve.</p>
        </section>

        <section className="mechanism-grid" aria-label="The model in a sentence">
          <article><span>01 / START WITH THE MARKET</span><h2>Every forward rate</h2><p>A curve gives today’s implied forward rates across maturities. HJM models that whole curve as a stochastic object instead of asking a single short rate to generate the initial shape.</p></article>
          <article><span>02 / CHOOSE THE WIGGLES</span><h2>Volatility moves the curve</h2><p>One or more volatility factors determine which maturities move together and which move differently. This exhibit uses simple deterministic factor shapes.</p></article>
          <article><span>03 / IMPOSE NO-ARBITRAGE</span><h2>The drift is constrained</h2><p>For pricing under the equivalent martingale measure, the forward-rate drift is linked to the volatility and its maturity integral. It is not a second freely chosen curve.</p></article>
        </section>

        {advanced && <section className="advanced-note" aria-labelledby="advanced-title">
          <p className="hjm-eyebrow">ADVANCED PATH</p>
          <h2 id="advanced-title">The drift condition—and the measure</h2>
          <div className="equation-block">
            <p>d f(t,T) = α<sup>Q</sup>(t,T) dt + Σ<sub>i</sub> σ<sub>i</sub>(t,T) dW<sub>i</sub><sup>Q</sup>(t)</p>
            <p>α<sup>Q</sup>(t,T) = Σ<sub>i</sub> σ<sub>i</sub>(t,T) ∫<sub>t</sub><sup>T</sup> σ<sub>i</sub>(t,u) du</p>
            <small>Independent Brownian factors; f(t,T) is the instantaneous forward rate and σᵢ(t,T) its factor loading. This is the risk-neutral drift under the equivalent martingale measure used for contingent-claim valuation.</small>
          </div>
          <p>For pricing under Q, no separate market-price-of-risk input appears in this drift condition. The paper’s physical-measure dynamics do include risk-premium terms; the change to the pricing measure absorbs them, rather than implying those risks do not exist. The simulation’s fixed, deterministic loadings and Euler step are a teaching extension, not an estimated model.</p>
          <p>For one factor with constant loading σ, the condition reduces to α<sup>Q</sup>(t,T) = σ²(T − t). Independent factors contribute additively. A two-factor setup can therefore change both the drift and the shape of the shock response.</p>
        </section>}

        <section className="evidence-section" id="source" aria-labelledby="source-title">
          <div>
            <p className="hjm-eyebrow">BACK TO THE PAPER</p>
            <h2 id="source-title">A framework, not one calibrated rate model.</h2>
            <p>HJM presents a general no-arbitrage framework and shows how several forward-rate models fit within it. It is foundational to later arbitrage-free market models, including the LIBOR Market Model, but it does not subsume every equilibrium or short-rate model.</p>
            <p>The drag controls, volatility shapes, shock size, and numerical paths here are synthetic teaching devices. The starting curve is illustrative; none of the values are market data or findings reported by the authors.</p>
          </div>
          <nav className="evidence-links" aria-label="Source pages and related literature">
            <a href={readSource(5)} target="_blank" rel="noreferrer">PDF p. 5 · Bond price as the integral of forward rates ↗</a>
            <a href={readSource(15)} target="_blank" rel="noreferrer">PDF p. 15 · Risk-neutral drift and market-price-of-risk terms ↗</a>
            <a href={readSource(16)} target="_blank" rel="noreferrer">PDF p. 16 · Constant-volatility Ho–Lee example ↗</a>
            <a href={readSource(17)} target="_blank" rel="noreferrer">PDF p. 17 · Two-factor example ↗</a>
            <a href="https://doi.org/10.1111/1467-9965.00028" target="_blank" rel="noreferrer">Brace, Gatarek &amp; Musiela (1997) · LIBOR market model within HJM ↗</a>
            <a href={readSource()} target="_blank" rel="noreferrer">Open the canonical HJM source record ↗</a>
          </nav>
        </section>

        <section className="qualification">
          <p className="hjm-eyebrow">A NECESSARY QUALIFICATION</p>
          <h2>“The drift is forced” is a pricing-measure statement.</h2>
          <p>No-arbitrage constrains drift after specifying volatility and the equivalent martingale measure, subject to the paper’s assumptions. In the physical measure, risk premia appear. The model still requires choices about volatility factors, and the HJM condition alone does not calibrate them or guarantee a unique market model.</p>
        </section>

        <section className="self-check" aria-labelledby="check-title">
          <p className="hjm-eyebrow">A QUICK CHECK</p>
          <h2 id="check-title">In the risk-neutral HJM setup, what fixes the forward-rate drift?</h2>
          <div className="answer-buttons" role="group" aria-label="Choose an answer">
            <button type="button" aria-pressed={answer === "short"} onClick={() => setAnswer("short")}>The short rate alone</button>
            <button type="button" aria-pressed={answer === "vol"} onClick={() => setAnswer("vol")}>The volatility loadings across maturities</button>
            <button type="button" aria-pressed={answer === "free"} onClick={() => setAnswer("free")}>A second freely chosen curve</button>
          </div>
          {answer && <p className="answer-feedback" role="status">{answer === "vol"
            ? "Exactly. The risk-neutral drift is the sum of each volatility loading times that factor’s integrated loading from t to T."
            : "Not in this framework. Under the equivalent martingale measure, no-arbitrage links the drift to the volatility factors and their maturity integrals."}</p>}
        </section>

        <section className="course-note" aria-labelledby="course-title">
          <div><p className="hjm-eyebrow">KEEP LEARNING</p><h2 id="course-title">From the framework to rates practice.</h2><p>HJM is the conceptual foundation for modern arbitrage-free forward-rate modeling. Continue with the verified course on interest-rate derivatives.</p></div>
          {course && <a className="course-link" href={campaignUrl(course.url, { campaign: "hjm-observatory", content: "hjm-companion" })} target="_blank" rel="noreferrer">{course.title} <span aria-hidden="true">↗</span><small>Course recommendation · opens on TG Investments &amp; Research</small></a>}
        </section>

        <PaperContinuation slug="hjm" />
      </main>
      <footer className="hjm-footer"><span>THE PAPER OBSERVATORY · AN AI-GENERATED EDUCATIONAL COMPANION</span><a href="/">← Back to the library</a></footer>
    </>
  );
}

createRoot(document.getElementById("root")).render(<App />);
