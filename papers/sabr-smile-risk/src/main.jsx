import React from "react";
import { createRoot } from "react-dom/client";
import { ObservatoryNav, PaperContinuation } from "../../../shared/ObservatoryShell.jsx";
import { sourceUrl } from "../../../shared/catalog.js";
import { applySabrShock, sampleSmile, sabrSmileVol } from "./lib/sabr.js";
import "./styles.css";

const initial = Object.freeze({ forward: 0.04, maturity: 2, alpha: 0.03, beta: 0.5, rho: -0.35, nu: 0.55 });
const SOURCE_PAGE = Object.freeze({ abstract: 2, localVol: 6, model: 10, dynamics: 11, applications: 19, derivation: 24 });
const number = (value, digits = 2) => Number(value).toFixed(digits);
const percent = (value) => `${(value * 100).toFixed(1)}%`;
const xOf = (index, count, left, width) => left + (index / (count - 1)) * width;

function Curve({ values, x, y, color, dash = false }) {
  const path = values
    .map((value, index) => `${index ? "L" : "M"}${xOf(index, values.length, 72, 636).toFixed(2)},${y(value).toFixed(2)}`)
    .join(" ");
  return <path d={path} fill="none" stroke={color} strokeWidth={dash ? 2 : 3} strokeDasharray={dash ? "7 6" : undefined} strokeLinecap="round" strokeLinejoin="round" />;
}

function SmileChart({ parameters, shock }) {
  let state = parameters;
  if (shock) state = applySabrShock(parameters, shock);
  const initialStrikes = Array.from({ length: 49 }, (_, index) => parameters.forward * (0.72 + index * 0.012));
  const base = sampleSmile(parameters, initialStrikes);
  const sabr = sampleSmile(state, initialStrikes);
  const localVol = initialStrikes.map((strike) =>
    sabrSmileVol(parameters, strike + state.forward - parameters.forward),
  );
  const values = [...base, ...sabr, ...localVol];
  const maximum = Math.max(...values) * 1.14;
  const x = (index) => xOf(index, initialStrikes.length, 72, 636);
  const y = (value) => 272 - (value / maximum) * 214;
  const unit = parameters.beta === 0 ? "normal rate volatility" : "Black implied volatility";
  const formatted = (value) => parameters.beta === 0 ? `${(value * 10000).toFixed(0)} bp` : percent(value);
  const strikeMove = state.forward - parameters.forward;
  return (
    <figure className="smile-chart">
      <svg viewBox="0 0 760 330" role="img" aria-labelledby="smile-chart-title smile-chart-description">
        <title id="smile-chart-title">SABR and local-volatility smile dynamics</title>
        <desc id="smile-chart-description">
          The curves share the same starting smile. After a {shock > 0 ? "positive" : shock < 0 ? "negative" : "zero"} synthetic forward shock, the local-volatility curve is sketched moving opposite the forward; SABR is recalculated from its correlated forward and volatility factors. The local-volatility line is qualitative, not a Dupire repricing.
        </desc>
        {[0, 0.25, 0.5, 0.75, 1].map((fraction) => {
          const value = maximum * fraction;
          const yy = y(value);
          return <g key={fraction}><line className="chart-gridline" x1="72" x2="708" y1={yy} y2={yy} /><text className="chart-tick" x="62" y={yy + 4} textAnchor="end">{formatted(value)}</text></g>;
        })}
        <line className="chart-axis" x1="72" x2="708" y1="272" y2="272" />
        {["0.72", "0.84", "0.96", "1.08", "1.20", "1.296"].map((label, index) => {
          const xx = 72 + (index / 5) * 636;
          return <g key={label}><line className="chart-axis" x1={xx} x2={xx} y1="272" y2="277" /><text className="chart-tick" x={xx} y="294" textAnchor="middle">{label}×</text></g>;
        })}
        <Curve values={base} x={x} y={y} color="#7b8986" dash />
        <Curve values={localVol} x={x} y={y} color="#bd7141" />
        <Curve values={sabr} x={x} y={y} color="#236d71" />
        <text className="chart-axis-label" x="390" y="322" textAnchor="middle">Strike K / starting forward F₀</text>
      </svg>
      <figcaption className="chart-caption">
        <span><i className="key-base" /> Starting smile</span>
        <span><i className="key-local" /> Local vol: opposite shift, qualitative sketch</span>
        <span><i className="key-sabr" /> SABR: correlated-factor repricing</span>
        <small>Forward: {percent(parameters.forward)} → {percent(state.forward)} · {unit}: {formatted(sabr[Math.floor(sabr.length / 2)])} near the center</small>
        <small>Local-vol curve translates the starting smile in the paper’s reported opposite direction; it is not a Dupire PDE solution or market calibration.</small>
      </figcaption>
      <output className="sr-only" aria-live="polite">
        Forward changed by {(strikeMove * 10000).toFixed(0)} basis points. The SABR smile recalculates with the correlated volatility factor.
      </output>
    </figure>
  );
}

function Parameter({ id, label, min, max, step, value, display, onChange, help }) {
  return (
    <div className="parameter">
      <div className="parameter-heading"><label htmlFor={id}>{label}</label><output htmlFor={id}>{display}</output></div>
      <input id={id} type="range" min={min} max={max} step={step} value={value}
        aria-valuetext={display} aria-describedby={`${id}-help`}
        onChange={(event) => onChange(Number(event.target.value))} />
      <small id={`${id}-help`}>{help}</small>
    </div>
  );
}

function App() {
  const [parameters, setParameters] = React.useState({ ...initial });
  const [shock, setShock] = React.useState(0);
  const [advanced, setAdvanced] = React.useState(false);
  const [answer, setAnswer] = React.useState("");
  const [shockMessage, setShockMessage] = React.useState("");
  function change(name, value) {
    setParameters((current) => ({ ...current, [name]: value }));
    setShock(0);
    setShockMessage("");
  }
  function sendShock(direction) {
    try {
      applySabrShock(parameters, direction);
      setShock(direction);
      setShockMessage("");
    } catch (error) {
      setShockMessage(error.message);
    }
  }
  const localSource = import.meta.env.LOCAL_SOURCE_AVAILABLE === true;
  const readSource = (page) => sourceUrl("sabr-smile-risk", page, { local: localSource });
  return (
    <>
      <a className="skip-link" href="#main-content">Skip to content</a>
      <ObservatoryNav slug="sabr-smile-risk" />
      <main id="main-content" className="smile-main">
        <header className="smile-hero">
          <p className="smile-eyebrow">THE SMILE OBSERVATORY · PAPER 003</p>
          <h1>One smile.<br /><em>Two very different moves.</em></h1>
          <p className="smile-lede">Black’s model gives one volatility. Markets quote a different one for each strike. SABR asks the more revealing question: when the forward rate moves, how should that whole curve move with it?</p>
          <p className="smile-source-line"><strong>Managing Smile Risk</strong> · Patrick S. Hagan, Deep Kumar, Andrew S. Lesniewski &amp; Diana E. Woodward · Wilmott Magazine, 2002</p>
          <div className="learning-toggle" role="group" aria-label="Learning depth">
            <span>LEARNING DEPTH</span>
            <button type="button" aria-pressed={!advanced} onClick={() => setAdvanced(false)}>Foundation</button>
            <button type="button" aria-pressed={advanced} onClick={() => setAdvanced(true)}>Advanced</button>
          </div>
        </header>

        <section id="experiment" className="smile-lab" aria-labelledby="lab-title">
          <div className="lab-heading">
            <div><p className="smile-eyebrow">THE INTERACTIVE EXPERIMENT</p><h2 id="lab-title">Give the smile four knobs.</h2></div>
            <p>Change one ingredient, then send the forward rate one synthetic quarter-year shock. The chart keeps the original strike axis so you can see which way the smile travels.</p>
          </div>
          <div className="lab-layout">
            <div className="parameter-panel" aria-label="SABR parameters">
              <Parameter id="alpha" label="α · starting volatility" min="0.005" max="0.05" step="0.001" value={parameters.alpha}
                display={number(parameters.alpha, 3)} onChange={(value) => change("alpha", value)}
                help="Sets the volatility scale. Units depend on β." />
              <Parameter id="beta" label="β · backbone" min="0" max="1" step="0.05" value={parameters.beta}
                display={number(parameters.beta, 2)} onChange={(value) => change("beta", value)}
                help="How strongly rate volatility scales with the forward level. At β = 0, the quote switches to normal volatility." />
              <Parameter id="rho" label="ρ · forward / volatility link" min="-0.9" max="0.9" step="0.05" value={parameters.rho}
                display={number(parameters.rho, 2)} onChange={(value) => change("rho", value)}
                help="Correlation bends the skew and determines the direction of the paired volatility shock." />
              <Parameter id="nu" label="ν · volatility of volatility" min="0" max="1.2" step="0.05" value={parameters.nu}
                display={number(parameters.nu, 2)} onChange={(value) => change("nu", value)}
                help="How quickly the volatility factor itself wanders." />
              <div className="shock-controls">
                <span>Send a forward shock</span>
                <div>
                  <button type="button" onClick={() => sendShock(-1)} aria-label="Send a negative one-standard-deviation forward shock">↓ Down 1σ</button>
                  <button type="button" onClick={() => sendShock(1)} aria-label="Send a positive one-standard-deviation forward shock">↑ Up 1σ</button>
                  <button type="button" className="reset-button" onClick={() => { setParameters({ ...initial }); setShock(0); setAnswer(""); setShockMessage(""); }}>Reset</button>
                </div>
                <small>One model step of 0.25 years; the independent volatility shock is held at zero. This is a teaching path, not a forecast.</small>
              </div>
              <p className="feedback" role="status">{shockMessage}</p>
            </div>
            <div className="chart-panel">
              <div className="chart-heading"><div><span className="smile-eyebrow">SAME STARTING SMILE · SHOCKED FORWARD</span><h3>Watch the shape move.</h3></div><span className="model-badge">SYNTHETIC TEACHING MODEL</span></div>
              <SmileChart parameters={parameters} shock={shock} />
            </div>
          </div>
          <p className="interpretation"><strong>What to notice:</strong> both stories can begin at the same smile. The difference appears after the rate moves. In the paper’s qualitative comparison, local volatility predicts a shift opposite to observed market behavior; SABR’s correlated stochastic volatility is designed to reproduce the observed direction.</p>
        </section>

        <section className="mechanism-grid" aria-label="The model in a sentence">
          <article><span>01 / BLACK</span><h2>One number</h2><p>A flat volatility is convenient, but it cannot describe why options at different strikes trade at different implied volatilities.</p></article>
          <article><span>02 / SABR</span><h2>Volatility can move</h2><p>SABR gives the forward its own random motion and lets its volatility factor wander too. Correlation makes the smile lean.</p></article>
          <article><span>03 / NO ARBITRAGE</span><h2>Price the claim</h2><p>The paper derives an approximate implied-volatility formula from the model. It is an asymptotic approximation, not an exact solution for every parameter.</p></article>
        </section>

        {advanced && <section className="advanced-note" aria-labelledby="advanced-title">
          <p className="smile-eyebrow">ADVANCED PATH</p>
          <h2 id="advanced-title">The stochastic engine behind the picture</h2>
          <div className="equation-block">
            <p>dF̂ = α̂ F̂<sup>β</sup> dW₁ &nbsp;&nbsp; dα̂ = ν α̂ dW₂ &nbsp;&nbsp; dW₁ dW₂ = ρ dt</p>
            <p>σ<sub>Black</sub>(K,F) ≈ <span>α / ((FK)<sup>(1−β)/2</sup></span> × <span>z / x(z)</span> × [time correction]</p>
            <small>For β = 0, the app uses the paper’s normal-volatility limit. For β &gt; 0, it displays the lognormal implied-volatility approximation. The shock holds the orthogonal Brownian component at zero.</small>
          </div>
          <p>The closed-form approximation comes from singular perturbation methods. Its accuracy is best understood as an expansion in time and volatility, and the paper notes that higher-order terms can improve precision. The curve here is not a fitted market surface.</p>
        </section>}

        <section className="evidence-section" id="source" aria-labelledby="source-title">
          <div><p className="smile-eyebrow">BACK TO THE PAPER</p><h2 id="source-title">A model of smile risk, not just smile fit.</h2><p>The paper applies SABR to USD interest-rate options and argues that a plausible smile dynamic matters for delta and vega hedging. Its figures use market observations; this companion’s sliders and shock are educational reconstructions, not those data.</p></div>
          <div className="evidence-links">
            <a href={readSource(SOURCE_PAGE.abstract)} target="_blank" rel="noreferrer">Abstract &amp; setup · PDF p. 2 ↗</a>
            <a href={readSource(SOURCE_PAGE.localVol)} target="_blank" rel="noreferrer">Local-volatility problem · PDF p. 6 ↗</a>
            <a href={readSource(SOURCE_PAGE.model)} target="_blank" rel="noreferrer">SABR dynamics · PDF p. 10 ↗</a>
            <a href={readSource(SOURCE_PAGE.dynamics)} target="_blank" rel="noreferrer">Smile dynamics · PDF p. 11 ↗</a>
            <a href={readSource(SOURCE_PAGE.applications)} target="_blank" rel="noreferrer">Rate-option examples · PDF p. 19 ↗</a>
            <a href={readSource(SOURCE_PAGE.derivation)} target="_blank" rel="noreferrer">Singular-perturbation derivation · PDF p. 24 ↗</a>
          </div>
        </section>

        <section className="qualification" aria-labelledby="limits-title">
          <p className="smile-eyebrow">WHAT THIS DOES NOT SHOW</p>
          <h2 id="limits-title">A shape is not a market calibration.</h2>
          <p>The parameters here are illustrative. No live rates, option quotes, calibration, hedge P&amp;L, forecast, or investment recommendation is included. The local-volatility comparison is deliberately a directional sketch based on the paper’s reported result—not a Dupire surface repricing. The Hagan approximation is not reliable for every strike, maturity, or extreme parameter combination.</p>
        </section>

        <section className="self-check" aria-labelledby="check-title">
          <p className="smile-eyebrow">A QUICK CHECK</p>
          <h2 id="check-title">Why add randomness to volatility?</h2>
          <p>Choose an answer to reveal the reasoning.</p>
          <div className="answer-buttons">
            <button type="button" aria-pressed={answer === "fit"} onClick={() => setAnswer("fit")}>To fit today’s smile only</button>
            <button type="button" aria-pressed={answer === "move"} onClick={() => setAnswer("move")}>To model how the smile moves with the forward</button>
          </div>
          {answer === "fit" && <p className="answer-feedback" role="status">Not quite. A single snapshot can be fit by different models. Hagan et al. emphasize smile dynamics and hedge behavior as the extra reason for stochastic volatility.</p>}
          {answer === "move" && <p className="answer-feedback" role="status">Exactly. The paper argues that a model should get both the current smile and its movement under a forward-rate change plausibly right.</p>}
        </section>
      </main>
      <PaperContinuation slug="sabr-smile-risk" />
      <footer className="smile-footer"><a href="/">← The Paper Observatory library</a><span>AI-generated · Source-linked · Educational only</span></footer>
    </>
  );
}

createRoot(document.getElementById("root")).render(
  <React.StrictMode>
    <App />
  </React.StrictMode>,
);
