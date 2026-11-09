import React, { useEffect, useMemo, useState } from "react";
import {
  simulateVAR,
  matrixVector,
  paperPresets,
  classifyStability2,
  ar2Companion,
  simulateEnsemble,
  longRunCumulative2,
} from "../lib/sfd.js";
import {
  Icon,
  Formula,
  Source,
  Range,
  Segmented,
  DeepDive,
  Note,
  PageHeader,
  Stat,
  NextChapter,
} from "./ui.jsx";
import {
  FlowNetwork,
  ARMemoryNetwork,
  TimeSeriesChart,
  StabilityPlane,
  MatrixDisplay,
} from "./FlowCharts.jsx";

const presets = paperPresets();
const colors = ["#a85f2b", "#246f94", "#5e7a66"];
const names = ["Stocks", "Bonds"];
const number = (value) => {
  const x = Math.abs(value) < 1e-13 ? 0 : value;
  return x !== 0 && (Math.abs(x) < 0.001 || Math.abs(x) >= 10000)
    ? x.toExponential(2)
    : x.toFixed(3);
};
const signed = (value) => `${value > 0 ? "+" : ""}${number(value)}`;
const copy = (m) => m.map((row) => [...row]);
const chartSeries = (values) =>
  names.map((name, i) => ({
    name,
    color: colors[i],
    values: values.map((row) => row[i]),
  }));
function Panel({ title, tag, children, className = "" }) {
  return (
    <section className={`panel ${className}`}>
      <div className="panel-header">
        <h2>{title}</h2>
        {tag && <span className="overline">{tag}</span>}
      </div>
      {children}
    </section>
  );
}
function Status({ matrix }) {
  const info = classifyStability2(matrix);
  return (
    <div className={`model-status ${info.kind}`}>
      <span className="status-dot" />
      <div>
        <strong>{info.label}</strong>
        <small>Spectral radius ρ = {info.radius.toFixed(3)}</small>
      </div>
    </div>
  );
}
function ModeSwitch({ value, onChange }) {
  return (
    <Segmented
      label="Response quantity"
      value={value}
      onChange={onChange}
      options={[
        { value: "rates", label: "Per-period change" },
        { value: "cumulative", label: "Cumulative response" },
      ]}
    />
  );
}
function downloadJSON(filename, data) {
  const url = URL.createObjectURL(
    new Blob([JSON.stringify(data, null, 2)], { type: "application/json" }),
  );
  const a = document.createElement("a");
  a.href = url;
  a.download = filename;
  a.click();
  setTimeout(() => URL.revokeObjectURL(url), 1000);
}
function useReducedMotion() {
  const [reduced, setReduced] = useState(
    () => window.matchMedia("(prefers-reduced-motion: reduce)").matches,
  );
  useEffect(() => {
    const media = window.matchMedia("(prefers-reduced-motion: reduce)");
    const update = () => setReduced(media.matches);
    media.addEventListener("change", update);
    return () => media.removeEventListener("change", update);
  }, []);
  return reduced;
}

export function Overview({ advanced, go }) {
  const [preview, setPreview] = useState("stable");
  const selected = presets.find((p) => p.id === preview);
  const response = simulateVAR({
    coefficients: [selected.matrix],
    shock: selected.shock,
    steps: 10,
  });
  return (
    <>
      <div className="overview-heading">
        <div className="eyebrow">
          <span className="live-dot" /> THE FLOW OBSERVATORY{" "}
          <span className="edition">RESEARCH FIELD GUIDE / 02</span>
        </div>
      </div>
      <section className="hero flow-hero">
        <div className="hero-copy">
          <span className="hero-kicker">THE ANATOMY OF AN AFTERSHOCK</span>
          <h1 id="page-title" tabIndex="-1">
            One shock.
            <br />
            Many <em>echoes.</em>
          </h1>
          <p>
            A shock can end long before its effects do. Turn a system of
            equations into a map, then follow the feedback that carries a
            disturbance into the future.
          </p>
          <button className="button light" onClick={() => go("network")}>
            Learn to read the diagram
            <Icon size={18} />
          </button>
          <div className="hero-source">
            An interactive companion to
            <br />
            <strong>Stochastic Flow Diagrams</strong>
            <br />
            Neil J. Calkin & Marcos López de Prado{" "}
            <Source page={2}>Read the paper</Source>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-topline">
            <span>A SYSTEM WITH MEMORY</span>
            <span>TWO VARIABLES · ONE LAG</span>
          </div>
          <div className="hero-network">
            <FlowNetwork
              matrix={presets[0].matrix}
              state={[-0.125, 0.125]}
              previous={[-0.5, 0]}
              compact
              activeStep={1}
            />
          </div>
        </div>
      </section>
      <div className="overview-intro">
        <div>
          <span className="eyebrow">THE CENTRAL QUESTION</span>
          <h2>
            Where does a disturbance <em>go next?</em>
          </h2>
        </div>
        <p>
          A network is more than a picture of connections. Add direction, signed
          coefficients and explicit memory, and it becomes a model you can step
          through.
        </p>
      </div>
      <section className="panel preview-system">
        <div>
          <span className="eyebrow">SAME SHOCK. THREE POSSIBLE FUTURES.</span>
          <h2>Does the echo fade, persist, or grow?</h2>
          <p>
            Compare the paper’s two-market coefficient matrices. The initial
            Stocks shock is −0.5; later innovations are zero.
          </p>
          <Segmented
            value={preview}
            onChange={setPreview}
            label="Overview response regime"
            options={presets.map((p) => ({ value: p.id, label: p.title }))}
          />
          <Status matrix={selected.matrix} />
          <Source page={14}>Source parameters · paper pp. 33–34</Source>
        </div>
        <div>
          <TimeSeriesChart series={chartSeries(response.rates)} time={10} />
        </div>
      </section>
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE LEARNING PATH</span>
          <h2>Make the equations move.</h2>
        </div>
        <span className="subtle">Five connected experiments</span>
      </div>
      <div className="path-grid flow-paths">
        {[
          [
            "network",
            "01",
            "pca",
            "Read the diagram",
            "Translate each arrow into one term of an equation.",
            "5 MIN",
          ],
          [
            "impulse",
            "02",
            "shock",
            "Follow a shock",
            "Step through the echoes and separate changes from cumulative effects.",
            "7 MIN",
          ],
          [
            "feedback",
            "03",
            "entropy",
            "Change the feedback",
            "Move eigenvalues around the unit circle and test what stability means.",
            "8 MIN",
          ],
          [
            "memory",
            "04",
            "reset",
            "Add a memory",
            "Let a second lag turn a simple response into an oscillating echo.",
            "7 MIN",
          ],
          [
            "uncertainty",
            "05",
            "sun",
            "Let new shocks arrive",
            "Compare an isolated response with many possible noisy futures.",
            "8 MIN",
          ],
        ].map(([id, n, icon, title, description, time]) => (
          <button className="path-card" key={id} onClick={() => go(id)}>
            <div className="path-card-top">
              <span>{n}</span>
              <Icon name={icon} size={25} />
            </div>
            <h3>{title}</h3>
            <p>{description}</p>
            <div className="path-card-bottom">
              <small>{time} · INTERACTIVE</small>
              <Icon size={17} />
            </div>
          </button>
        ))}
      </div>
      <section className="panel context-note">
        <div className="eyebrow">WHY A FLOW DIAGRAM?</div>
        <h2>A visible architecture for dynamic equations.</h2>
        <p>
          The 2014 paper combines graph theory with time-series models. Current
          variables become ellipses, earlier values become diamond-shaped memory
          cells, and weighted arrows show the terms that transmit a response.
          The graph helps us discuss a model; the equations still determine its
          behavior.
        </p>
        <div className="context-details">
          <div>
            <h3>For strong undergraduates</h3>
            <p>
              Start with multiplication, addition and the idea of a lag. The
              diagrams introduce the notation, and the glossary explains each
              term.
            </p>
          </div>
          <div>
            <h3>For early PhD readers</h3>
            <p>
              Open Advanced for companion matrices, complex roots, non-normal
              amplification, innovation assumptions and qualifications to the
              source’s appendix.
            </p>
          </div>
        </div>
      </section>
      <div className="bottom-pair">
        <Note title="A model, rather than a probability graph">
          <p>
            Coefficients can be negative and need not sum to one. Arrows
            represent signed linear effects, not probabilities or conserved
            quantities of money.
          </p>
        </Note>
        <Note title="Keep the evidence visible">
          <p>
            The source uses stylized numerical examples. This site reconstructs
            their parameters and labels the additional experiments as teaching
            extensions.
          </p>
        </Note>
      </div>
      {advanced && (
        <DeepDive advanced title="The model behind the map">
          <Formula
            block
          >{String.raw`y_t=\sum_{k=1}^{p}\Phi_k y_{t-k}+\varepsilon_t,\qquad r_h=\Phi^h s\quad\text{for VAR(1)}`}</Formula>
          <p>
            The first equation describes the stochastic model. The second
            describes its isolated impulse response with a specified initial
            state and no later innovations.
          </p>
        </DeepDive>
      )}
    </>
  );
}

export function NetworkLab({ advanced, onNext }) {
  const [matrix, setMatrix] = useState(() => copy(presets[0].matrix));
  const [edge, setEdge] = useState("0-0");
  const [source, setSource] = useState(0);
  const [shock, setShock] = useState(-0.5);
  const previous = source === 0 ? [shock, 0] : [0, shock];
  const current = matrixVector(matrix, previous);
  const [target, from] = edge.split("-").map(Number);
  const coefficient = matrix[target][from];
  const amount = coefficient * previous[from];
  const change = (v) =>
    setMatrix((old) =>
      old.map((row, i) =>
        row.map((x, j) => (i === target && j === from ? v : x)),
      ),
    );
  return (
    <>
      <PageHeader
        chapter="EXPERIMENT 01 / READ THE DIAGRAM"
        title={
          <>
            An equation becomes a <em>map.</em>
          </>
        }
        intro="Read the memory values, multiply each by its arrow coefficient, and add the incoming contributions. Every current node is one equation."
        page={7}
      />
      <div className="lab-grid network-grid">
        <Panel title="Inspect a connection" tag="YOUR MODEL">
          <p className="control-intro">
            Select an arrow in the list below the diagram. Matrix rows are
            targets; columns are sources.
          </p>
          <div className="selected-link">
            <span className="overline">SELECTED WEIGHTED LINK</span>
            <strong>
              {names[from]}
              <sub>t−1</sub> → {names[target]}
              <sub>t</sub>
            </strong>
          </div>
          <Range
            label="Selected coefficient"
            value={coefficient}
            min={-1}
            max={1}
            step={0.05}
            onChange={change}
            format={(v) => signed(v)}
          />
          <Segmented
            value={source}
            onChange={setSource}
            label="Shock source"
            options={[
              { value: 0, label: "Stocks shock" },
              { value: 1, label: "Bonds shock" },
            ]}
          />
          <Range
            label="Previous-period shock"
            value={shock}
            min={-1}
            max={1}
            step={0.05}
            onChange={setShock}
            format={(v) => signed(v)}
          />
          <div className="formula-receipt">
            <span>Coefficient × source state</span>
            <strong>
              {signed(coefficient)} × {signed(previous[from])} ={" "}
              {signed(amount)}
            </strong>
            <small>
              This is one contribution to {names[target]}. The other incoming
              contribution must be added.
            </small>
          </div>
          <button className="text-button" onClick={() => change(0)}>
            <Icon name="close" size={15} />
            Remove this hypothetical link
          </button>
          <button
            className="text-button"
            onClick={() => {
              setMatrix(copy(presets[0].matrix));
              setEdge("0-0");
              setSource(0);
              setShock(-0.5);
            }}
          >
            <Icon name="reset" size={15} />
            Reset diagram
          </button>
        </Panel>
        <Panel
          title="Read all terms from the old state"
          tag="ONE SYNCHRONOUS UPDATE"
          className="chart-panel"
        >
          <FlowNetwork
            matrix={matrix}
            state={current}
            previous={previous}
            selectedEdge={edge}
            onSelectEdge={setEdge}
            activeStep={1}
          />
          <div className="chart-metrics">
            <Stat label="Stocks now" value={signed(current[0])} />
            <Stat label="Bonds now" value={signed(current[1])} />
          </div>
        </Panel>
      </div>
      <Note title="A coefficient is not the amount that flows">
        <p>
          A coefficient of −0.25 applied to a source value of −0.5 contributes
          +0.125. A nonzero coefficient can contribute zero if its source value
          is zero. The dashed arrows have coefficient 1: they store values for
          the next period.
        </p>
      </Note>
      <div className="explanation-grid">
        <div>
          <h2>Rows receive. Columns send.</h2>
          <Formula
            block
          >{String.raw`\begin{pmatrix}r_{S,t}\\r_{B,t}\end{pmatrix}=\underbrace{\begin{pmatrix}\phi_{SS}&\phi_{SB}\\\phi_{BS}&\phi_{BB}\end{pmatrix}}_{\text{row = target, column = source}}\begin{pmatrix}r_{S,t-1}\\r_{B,t-1}\end{pmatrix}`}</Formula>
          <p>
            Both current values use the same old memory. Updating Stocks first
            and immediately feeding that new value into Bonds would create a
            different model.
          </p>
          <MatrixDisplay matrix={matrix} />
        </div>
        <div className="small-lesson">
          <span className="eyebrow">TRY THIS</span>
          <h3>Reverse the sign twice.</h3>
          <p>
            Choose a negative Stocks shock and select Stocks → Bonds. Why does a
            negative coefficient create a positive Bonds response? Then switch
            the shock to Bonds and inspect which links carry a nonzero amount.
          </p>
        </div>
      </div>
      <DeepDive
        advanced={advanced}
        title="Weighted walks, estimation, and causality"
      >
        <Formula
          block
        >{String.raw`(\Phi^h)_{ij}=\sum_{\substack{\text{length-}h\text{ walks}\\j\to i}}\ \prod_{e\in\text{walk}}\phi_e`}</Formula>
        <p>
          Repeated propagation sums products of signed coefficients along all
          directed walks of the right length. Routes can reinforce or cancel. A
          graph’s connectivity alone therefore does not determine the response
          magnitude.
        </p>
        <p>
          The paper discusses retaining statistically significant estimated
          coefficients. These controls edit a hypothetical model; they do not
          fit data or compute p-values. Line emphasis marks the selected link,
          not statistical significance or equation fit.
        </p>
        <p>
          A lagged predictive coefficient is not automatically a causal
          intervention effect. Contemporaneous effects require a simultaneous
          system, such as (I − B₀)yₜ = ΣAₖyₜ₋ₖ + uₜ, with identification
          assumptions and a solution for the current state.
        </p>
        <Source page={11}>VAR and contemporaneous extensions</Source>
      </DeepDive>
      <NextChapter onClick={onNext} number="02" label="Follow the aftershock" />
    </>
  );
}

export function ImpulseLab({ advanced, onNext }) {
  const [regime, setRegime] = useState("stable");
  const [time, setTime] = useState(1);
  const [mode, setMode] = useState("rates");
  const [playing, setPlaying] = useState(false);
  const reduced = useReducedMotion();
  const preset = presets.find((p) => p.id === regime);
  const result = useMemo(
    () =>
      simulateVAR({
        coefficients: [preset.matrix],
        shock: preset.shock,
        steps: 20,
      }),
    [preset],
  );
  useEffect(() => {
    if (!playing) return;
    if (reduced || time >= 20) {
      setPlaying(false);
      return;
    }
    const timer = setTimeout(() => setTime((t) => t + 1), 800);
    return () => clearTimeout(timer);
  }, [playing, time, reduced]);
  const select = (value) => {
    setRegime(value);
    setTime(1);
    setPlaying(false);
  };
  const previous = time === 0 ? [0, 0] : result.rates[time - 1];
  return (
    <>
      <PageHeader
        chapter="EXPERIMENT 02 / IMPULSE RESPONSES"
        title={
          <>
            The shock ends.
            <br />
            The system <em>remembers.</em>
          </>
        }
        intro="Apply one Stocks shock at t = 0, then set every later innovation to zero. Advance whole periods to see what the network continues to do."
        page={14}
      />
      <div className="lab-grid">
        <Panel title="Reconstruct the source examples" tag="SOURCE PARAMETERS">
          <Segmented
            label="Impulse regime"
            value={regime}
            onChange={select}
            options={presets.map((p) => ({ value: p.id, label: p.title }))}
          />
          <Status matrix={preset.matrix} />
          <MatrixDisplay matrix={preset.matrix} />
          <Range
            label="Time step"
            min={0}
            max={20}
            value={time}
            onChange={(t) => {
              setTime(t);
              setPlaying(false);
            }}
            format={(v) => `t = ${v}`}
          />
          <div className="step-controls">
            <button
              aria-label="Previous time step"
              disabled={time === 0}
              onClick={() => {
                setTime((t) => t - 1);
                setPlaying(false);
              }}
            >
              ←
            </button>
            <button
              className="button"
              disabled={reduced}
              onClick={() => setPlaying((p) => !p)}
            >
              {playing ? "Pause" : "Play response"}
            </button>
            <button
              aria-label="Next time step"
              disabled={time === 20}
              onClick={() => {
                setTime((t) => t + 1);
                setPlaying(false);
              }}
            >
              →
            </button>
          </div>
          {reduced && (
            <p className="chart-footnote">
              Reduced motion is enabled. Use the step buttons or time slider.
            </p>
          )}
          <div className="button-group horizon-shortcuts">
            {[0, 1, 5, 10].map((t) => (
              <button
                key={t}
                onClick={() => {
                  setTime(t);
                  setPlaying(false);
                }}
              >
                t = {t}
              </button>
            ))}
          </div>
          <button
            className="text-button"
            onClick={() => {
              select("stable");
              setMode("rates");
            }}
          >
            <Icon name="reset" size={15} />
            Reset experiment
          </button>
          <button
            className="text-button"
            onClick={() =>
              downloadJSON("stochastic-flow-response.json", {
                source: "SSRN 2379314; paper pp.33–34",
                kind: "source-parameter reconstruction",
                regime,
                coefficients: [preset.matrix],
                initialShock: preset.shock,
                timing:
                  "r0=shock; pre-zero history and later innovations zero; cumulative=sum from0",
                ...result,
              })
            }
          >
            <Icon name="download" size={15} />
            Download response JSON
          </button>
        </Panel>
        <Panel
          title={`A complete update at t = ${time}`}
          tag="COEFFICIENTS × MEMORY"
          className="chart-panel"
        >
          <FlowNetwork
            matrix={preset.matrix}
            state={result.rates[time]}
            previous={previous}
            activeStep={time}
          />
        </Panel>
      </div>
      <section className="panel response-panel">
        <div className="panel-header">
          <h2>Two quantities. Two different stories.</h2>
          <ModeSwitch value={mode} onChange={setMode} />
        </div>
        <TimeSeriesChart
          series={chartSeries(result[mode])}
          time={time}
          mode={mode}
          yLabel={
            mode === "rates"
              ? "Per-period change (units)"
              : "Cumulative additive change (units)"
          }
        />
        <div className="response-numbers">
          {names.map((name, i) => (
            <div key={name}>
              <span>
                {name} at t = {time}
              </span>
              <strong>
                {signed(result.rates[time][i])}
                <small>current change</small>
              </strong>
              <strong>
                {signed(result.cumulative[time][i])}
                <small>cumulative response</small>
              </strong>
            </div>
          ))}
        </div>
      </section>
      <Note
        title={
          regime === "stable"
            ? "A fading change can leave a permanent displacement"
            : regime === "steady"
              ? "Constant changes accumulate into drifting levels"
              : "The selected shock excites a growing mode"
        }
      >
        <p>
          {regime === "stable"
            ? "Here, current changes tend to zero. The cumulative Stocks response instead approaches −0.75, and Bonds approaches +0.25. Returning to a zero rate does not undo the earlier accumulated effect."
            : regime === "steady"
              ? "For this particular source matrix, each change after t = 0 is (−0.25, +0.25). Adding those changes creates linear drift. Other unit-circle systems can oscillate or behave differently."
              : "The opposing-move mode has eigenvalue 4/3. Its response grows geometrically; this is a stylized specified system, not a market-crash probability or empirical forecast."}
        </p>
      </Note>
      <div className="explanation-grid">
        <div>
          <h2>One impulse, many updates</h2>
          <Formula
            block
          >{String.raw`r_0=s,\qquad r_h=\Phi^h s,\qquad C_h=\sum_{j=0}^{h}r_j`}</Formula>
          <p>
            These are additive arbitrary-unit changes, not compounded investment
            returns. We include the initial shock once at t = 0 and start the
            cumulative total from a zero pre-shock baseline.
          </p>
          <p>
            The paper supplies the coefficient matrices and illustrative shock.
            The curves here reconstruct those parameters with an explicit timing
            convention, rather than reproduce every original snapshot-rendering
            choice.
          </p>
          <Source page={15}>Steady and explosive examples</Source>
        </div>
        <div className="small-lesson">
          <span className="eyebrow">TRY THIS</span>
          <h3>Find the lasting effect.</h3>
          <p>
            Choose Stable and jump to t = 10. Compare the very small current
            change with the cumulative response. Switch to Persistent. What
            changes about the long-run total?
          </p>
        </div>
      </div>
      <DeepDive
        advanced={advanced}
        title="The cumulative multiplier and its convergence condition"
      >
        <Formula
          block
        >{String.raw`\rho(\Phi)<1\quad\Longrightarrow\quad C_\infty=(I-\Phi)^{-1}s`}</Formula>
        <p>
          The inverse only represents the infinite sum when the matrix powers
          decay. An algebraically invertible I − Φ alone is not a sufficient
          convergence condition. The stable source example has limiting
          cumulative response{" "}
          {longRunCumulative2(presets[0].matrix, [-0.5, 0])
            .map(number)
            .join(", ")}
          .
        </p>
        <p>
          A zero-future-innovation impulse experiment is deterministic. Under an
          appropriate zero-conditional-mean innovation assumption it is also the
          conditional mean response; the uncertainty lab makes its stronger
          independent-Gaussian assumptions explicit.
        </p>
      </DeepDive>
      <NextChapter onClick={onNext} number="03" label="Change the feedback" />
    </>
  );
}

const feedbackExamples = [
  ...presets.map((p) => ({ id: p.id, label: p.title, matrix: p.matrix })),
  {
    id: "spiral",
    label: "Growing spiral",
    matrix: [
      [0.8, -0.8],
      [0.8, 0.8],
    ],
  },
  {
    id: "transient",
    label: "Transient amplifier",
    matrix: [
      [0.5, 2],
      [0, 0.5],
    ],
  },
  {
    id: "oneway",
    label: "One-way link",
    matrix: [
      [0, 0],
      [0.8, 0],
    ],
  },
];
const shockOptions = {
  stocks: [-0.5, 0],
  bonds: [0, -0.5],
  same: [-0.5, -0.5],
  opposing: [-0.5, 0.5],
};
export function FeedbackLab({ advanced, onNext }) {
  const [matrix, setMatrix] = useState(() => copy(presets[0].matrix));
  const [example, setExample] = useState("stable");
  const [shockType, setShockType] = useState("stocks");
  const [time, setTime] = useState(10);
  const result = useMemo(
    () =>
      simulateVAR({
        coefficients: [matrix],
        shock: shockOptions[shockType],
        steps: 18,
      }),
    [matrix, shockType],
  );
  const stability = classifyStability2(matrix);
  const select = (id) => {
    const p = feedbackExamples.find((p) => p.id === id);
    setMatrix(copy(p.matrix));
    setExample(id);
    setShockType(id === "transient" ? "bonds" : "stocks");
  };
  const update = (i, j, value) => {
    setMatrix((old) =>
      old.map((row, r) => row.map((x, c) => (r === i && c === j ? value : x))),
    );
    setExample("custom");
  };
  return (
    <>
      <PageHeader
        chapter="EXPERIMENT 03 / FEEDBACK & STABILITY"
        title={
          <>
            A small loop.
            <br />A different <em>future.</em>
          </>
        }
        intro="The full coefficient matrix determines whether every disturbance eventually fades. Change the links, then inspect the eigenvalues and the response to a particular shock."
        page={22}
      />
      <div className="preset-row">
        <span className="overline">COMPARE A SYSTEM</span>
        <div className="button-group">
          {feedbackExamples.map((p) => (
            <button
              key={p.id}
              aria-pressed={example === p.id}
              className={example === p.id ? "active-preset" : ""}
              onClick={() => select(p.id)}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="lab-grid">
        <Panel
          title="Edit the feedback coefficients"
          tag={
            example === "custom"
              ? "SYNTHETIC CUSTOM MODEL"
              : "SOURCE / TEACHING PRESET"
          }
        >
          {matrix.map((row, i) =>
            row.map((value, j) => (
              <Range
                key={`${i}-${j}`}
                label={`${names[j]} → ${names[i]}`}
                value={value}
                min={-1.5}
                max={2}
                step={0.05}
                onChange={(v) => update(i, j, v)}
                format={(v) => signed(v)}
              />
            )),
          )}
          <label className="select-field">
            Initial shock
            <select
              aria-label="Initial shock"
              value={shockType}
              onChange={(e) => setShockType(e.target.value)}
            >
              <option value="stocks">Stocks only (−0.5, 0)</option>
              <option value="bonds">Bonds only (0, −0.5)</option>
              <option value="same">Equal move (−0.5, −0.5)</option>
              <option value="opposing">Opposing move (−0.5, +0.5)</option>
            </select>
          </label>
          <Range
            label="Readout time"
            min={0}
            max={18}
            value={time}
            onChange={setTime}
            format={(v) => `t = ${v}`}
          />
          <button
            className="text-button"
            onClick={() => {
              select("stable");
              setTime(10);
            }}
          >
            <Icon name="reset" size={15} />
            Reset feedback
          </button>
        </Panel>
        <div className="stacked-panels">
          <Panel title="The eigenvalue test" tag="COMPLEX PLANE">
            <Status matrix={matrix} />
            <StabilityPlane matrix={matrix} />
          </Panel>
          <Panel title="The response to your chosen shock" tag="18 PERIODS">
            <TimeSeriesChart series={chartSeries(result.rates)} time={time} />
          </Panel>
        </div>
      </div>
      <Note
        title={
          stability.kind === "stable"
            ? "Stable describes the eventual outcome"
            : stability.kind === "boundary"
              ? "The unit circle is a boundary, not one behavior"
              : "An unstable direction need not be excited by every shock"
        }
      >
        <p>
          {stability.kind === "stable"
            ? "Every initial response eventually tends to zero in this fixed linear system. That does not prevent early amplification: try the Transient amplifier with a Bonds shock."
            : stability.kind === "boundary"
              ? "The paper’s Persistent example has an eigenvalue +1 and a constant nonzero rate. An eigenvalue −1 instead alternates; complex unit roots oscillate; defective unit-root systems can grow polynomially."
              : "The matrix has at least one eigenvalue outside the unit circle. For the source Explosive preset, choose Equal move: that shock lies entirely in the zero-eigenvalue direction and vanishes after one step."}
        </p>
      </Note>
      <div className="explanation-grid">
        <div>
          <h2>Measure distance from the origin.</h2>
          <Formula
            block
          >{String.raw`\rho(\Phi)=\max_i|\lambda_i|,\qquad \text{all impulses decay}\ \Longleftrightarrow\ \rho(\Phi)<1`}</Formula>
          <p>
            The eigenvalue’s modulus includes its real and imaginary parts. For
            the Growing spiral, λ = 0.8 ± 0.8i has modulus about 1.131, so its
            mode grows even though the real part is below one.
          </p>
        </div>
        <div className="small-lesson">
          <span className="eyebrow">TRY THIS</span>
          <h3>A stable system that hits hard.</h3>
          <p>
            Select Transient amplifier. Both eigenvalues are 0.5, but a Bonds
            shock produces a larger first-period Stocks response before the
            echoes fade. The spectral radius describes long-run decay, not the
            largest short-run gain.
          </p>
        </div>
      </div>
      <DeepDive advanced={advanced} title="Read Appendix A.6 critically">
        <p>
          For a discrete-time system, the correct complex-eigenvalue test uses{" "}
          <strong>modulus</strong>. The source appendix’s wording about real
          parts should be qualified. It also suggests that invertibility implies
          diagonalizability; invertible matrices can be defective, and singular
          matrices can be diagonalizable.
        </p>
        <p>
          Direct matrix-power iteration needs no eigenvector basis. The
          non-normal amplifier is an example where repeated eigenvalues and a
          Jordan structure matter for transient behavior. For multiple lags,
          apply this test to the entire companion matrix, not to each lag matrix
          separately or to their sum.
        </p>
        <Formula
          block
        >{String.raw`\lambda_\pm=\frac{\operatorname{tr}\Phi\pm\sqrt{(\operatorname{tr}\Phi)^2-4\det\Phi}}{2}`}</Formula>
        <p>
          The custom model is not fitted. A changed coefficient represents a
          hypothetical specification, without a significance level, estimated
          uncertainty, or causal interpretation.
        </p>
        <Source page={22}>Source appendix · paper p. 41</Source>
      </DeepDive>
      <NextChapter
        onClick={onNext}
        number="04"
        label="Add another memory cell"
      />
    </>
  );
}

const memoryExamples = [
  { id: "fading", label: "Fading oscillation", phi1: 0.8, phi2: -0.5 },
  { id: "echo", label: "Two-period echo", phi1: 0, phi2: 0.64 },
  { id: "alternate", label: "Persistent alternation", phi1: -1, phi2: 0 },
  { id: "growing", label: "Growing echo", phi1: 1.2, phi2: 0.4 },
];
export function MemoryLab({ advanced, onNext }) {
  const [phi1, setPhi1] = useState(0.8);
  const [phi2, setPhi2] = useState(-0.5);
  const [time, setTime] = useState(5);
  const [mode, setMode] = useState("rates");
  const coefficients = useMemo(() => [[[phi1]], [[phi2]]], [phi1, phi2]);
  const result = useMemo(
    () => simulateVAR({ coefficients, shock: [1], steps: 24 }),
    [coefficients],
  );
  const companion = ar2Companion(phi1, phi2);
  const values = [
    result.rates[time][0],
    time > 0 ? result.rates[time - 1][0] : 0,
    time > 1 ? result.rates[time - 2][0] : 0,
  ];
  return (
    <>
      <PageHeader
        chapter="EXPERIMENT 04 / LAG MEMORY"
        title={
          <>
            Yesterday has a <em>history.</em>
          </>
        }
        intro="A second lag stores a different past value. Its return path can create delayed echoes, reversals and oscillation, even with only one variable."
        page={7}
      />
      <div className="preset-row">
        <span className="overline">SYNTHETIC TEACHING CASES</span>
        <div className="button-group">
          {memoryExamples.map((p) => (
            <button
              key={p.id}
              onClick={() => {
                setPhi1(p.phi1);
                setPhi2(p.phi2);
                setTime(5);
              }}
            >
              {p.label}
            </button>
          ))}
        </div>
      </div>
      <div className="lab-grid">
        <Panel title="Build a two-lag response" tag="AR(2)">
          <Range
            label="One-period coefficient φ₁"
            value={phi1}
            min={-1.5}
            max={1.5}
            step={0.05}
            onChange={setPhi1}
            format={(v) => signed(v)}
          />
          <Range
            label="Two-period coefficient φ₂"
            value={phi2}
            min={-0.95}
            max={0.95}
            step={0.01}
            onChange={setPhi2}
            format={(v) => signed(v)}
          />
          <Range
            label="Memory readout time"
            value={time}
            min={0}
            max={24}
            onChange={setTime}
            format={(v) => `t = ${v}`}
          />
          <Status matrix={companion} />
          <div className="formula-receipt">
            <span>For t ≥ 1, without new innovations</span>
            <strong>
              {signed(phi1)} × {signed(values[1])}
              <br />+ {signed(phi2)} × {signed(values[2])}
            </strong>
            <small>
              At t = 0, the initial shock +1 is imposed directly; it is not
              computed from earlier zero memory.
            </small>
          </div>
          <button
            className="text-button"
            onClick={() => {
              setPhi1(0.8);
              setPhi2(-0.5);
              setTime(5);
              setMode("rates");
            }}
          >
            <Icon name="reset" size={15} />
            Reset memory
          </button>
        </Panel>
        <div className="stacked-panels">
          <Panel
            title="One current value, two distinct memories"
            tag="UNIT-DELAY CHAIN"
          >
            <ARMemoryNetwork phi1={phi1} phi2={phi2} values={values} />
          </Panel>
          <Panel title="The echo across time" tag="INITIAL SHOCK +1">
            <ModeSwitch value={mode} onChange={setMode} />
            <TimeSeriesChart
              series={[
                {
                  name: "Response",
                  color: colors[0],
                  values: result[mode].map((row) => row[0]),
                },
              ]}
              time={time}
              mode={mode}
            />
          </Panel>
        </div>
      </div>
      <Note title="A second memory is not a second current variable">
        <p>
          The two diamonds store yₜ₋₁ and yₜ₋₂. Compute the new value using both
          old slots, then shift the whole history. Setting φ₂ to zero removes
          that lag’s influence while leaving the first-lag behavior intact.
        </p>
      </Note>
      <div className="explanation-grid">
        <div>
          <h2>Different paths, different arrival times.</h2>
          <Formula
            block
          >{String.raw`y_t=\phi_1 y_{t-1}+\phi_2 y_{t-2}+\varepsilon_t`}</Formula>
          <p>
            Choose Two-period echo: the first lag has no influence, so the
            initial shock returns at t = 2, 4, 6, and so on. A graph of
            contemporaneous correlations would not display these explicit
            delays.
          </p>
        </div>
        <div className="small-lesson">
          <span className="eyebrow">TRY THIS</span>
          <h3>At the boundary, alternate.</h3>
          <p>
            Select Persistent alternation and inspect both views. Changes flip
            between +1 and −1. Their cumulative sum alternates between 1 and 0,
            rather than drifting as in the paper’s +1 eigenvalue example.
          </p>
        </div>
      </div>
      <DeepDive
        advanced={advanced}
        title="From two lags to one companion state"
      >
        <Formula
          block
        >{String.raw`\underbrace{\begin{pmatrix}y_t\\y_{t-1}\end{pmatrix}}_{z_t}=\underbrace{\begin{pmatrix}\phi_1&\phi_2\\1&0\end{pmatrix}}_{F}\begin{pmatrix}y_{t-1}\\y_{t-2}\end{pmatrix}+\begin{pmatrix}\varepsilon_t\\0\end{pmatrix}`}</Formula>
        <p>
          Test the eigenvalues of F. Testing |φ₁| and |φ₂| separately is not
          sufficient. For a VAR(p), the companion matrix has a top block row [Φ₁
          … Φₚ] and lower identity blocks that shift the stored state.
        </p>
        <div className="companion-grid">
          <MatrixDisplay
            matrix={companion}
            labels={["Current slot", "Previous slot"]}
          />
          <StabilityPlane matrix={companion} />
        </div>
        <p>
          These AR(2) presets extend the paper’s diagram grammar. They are
          declared teaching examples, rather than coefficient estimates from a
          particular time series.
        </p>
      </DeepDive>
      <NextChapter onClick={onNext} number="05" label="Let new shocks arrive" />
    </>
  );
}

export function UncertaintyLab({ advanced, onNext }) {
  const [noise, setNoise] = useState(0.06);
  const [a, setA] = useState(0.25);
  const [seed, setSeed] = useState(42);
  const [variable, setVariable] = useState(0);
  const [mode, setMode] = useState("rates");
  const [time, setTime] = useState(15);
  const matrix = useMemo(
    () => [
      [a, -a],
      [-a, a],
    ],
    [a],
  );
  const result = useMemo(
    () => simulateVAR({ coefficients: [matrix], shock: [-0.5, 0], steps: 30 }),
    [matrix],
  );
  const ensemble = useMemo(
    () =>
      simulateEnsemble({
        coefficients: [matrix],
        shock: [-0.5, 0],
        steps: 30,
        paths: 100,
        innovationSD: noise,
        seed,
      }),
    [matrix, noise, seed],
  );
  const bands = (
    mode === "rates" ? ensemble.bands : ensemble.cumulativeBands
  ).map((row) => row[variable]);
  const paths = mode === "rates" ? ensemble.paths : ensemble.cumulativePaths;
  const series = [
    {
      name: "No later shocks",
      color: "#a85f2b",
      values: result[mode].map((row) => row[variable]),
    },
    ...paths.slice(0, 2).map((path, i) => ({
      name: `Noisy path ${i + 1}`,
      color: i === 0 ? "#2f718f" : "#607b69",
      values: path.map((row) => row[variable]),
    })),
  ];
  return (
    <>
      <PageHeader
        chapter="EXPERIMENT 05 / STOCHASTIC INNOVATIONS"
        title={
          <>
            One response.
            <br />
            Many possible <em>paths.</em>
          </>
        }
        intro="The isolated impulse holds later innovations at zero. Add new random disturbances to see how observed outcomes can differ from that clean reference."
        page={8}
      />
      <div className="lab-grid">
        <Panel title="Add independent innovations" tag="TEACHING EXTENSION">
          <Range
            label="New-shock standard deviation"
            value={noise}
            min={0}
            max={0.2}
            step={0.01}
            onChange={setNoise}
            format={(v) => v.toFixed(2)}
          />
          <Range
            label="Symmetric feedback coefficient a"
            value={a}
            min={0.05}
            max={0.48}
            step={0.01}
            onChange={setA}
            format={(v) => v.toFixed(2)}
            hint="The stable source family has diagonal +a and cross-links −a; ρ = 2a < 1 here."
          />
          <Segmented
            label="Displayed variable"
            value={variable}
            onChange={setVariable}
            options={[
              { value: 0, label: "Stocks" },
              { value: 1, label: "Bonds" },
            ]}
          />
          <Range
            label="Uncertainty readout time"
            min={0}
            max={30}
            value={time}
            onChange={setTime}
            format={(v) => `t = ${v}`}
          />
          <div className="mini-stat">
            <span>Simulation seed</span>
            <strong>{seed}</strong>
          </div>
          <button className="text-button" onClick={() => setSeed((s) => s + 1)}>
            <Icon name="reset" size={15} />
            Draw another 100 paths
          </button>
          <button
            className="text-button"
            onClick={() => {
              setNoise(0.06);
              setA(0.25);
              setSeed(42);
              setVariable(0);
              setMode("rates");
              setTime(15);
            }}
          >
            <Icon name="reset" size={15} />
            Restore default experiment
          </button>
        </Panel>
        <Panel
          title={`${names[variable]}: fixed parameters, uncertain outcomes`}
          tag="100 SIMULATED PATHS"
          className="chart-panel"
        >
          <ModeSwitch value={mode} onChange={setMode} />
          <TimeSeriesChart
            series={series}
            bands={bands}
            time={time}
            mode={mode}
          />
          <div className="chart-metrics">
            <Stat label="10th percentile" value={signed(bands[time].low)} />
            <Stat label="Median" value={signed(bands[time].median)} />
            <Stat label="90th percentile" value={signed(bands[time].high)} />
          </div>
        </Panel>
      </div>
      <Note title="The shaded band is an outcome band, not a confidence interval">
        <p>
          At each period, the band spans the 10th to 90th percentiles of 100
          simulated paths. It holds every coefficient fixed. It does not account
          for uncertainty in estimated parameters or give a probability that the
          model itself is correct.
        </p>
      </Note>
      <div className="explanation-grid">
        <div>
          <h2>Keep the model and the experiment distinct.</h2>
          <Formula
            block
          >{String.raw`y_t=\Phi y_{t-1}+\varepsilon_t,\qquad \varepsilon_t\overset{\mathrm{iid}}{\sim}\mathcal N(0,\sigma_\varepsilon^2 I)`}</Formula>
          <p>
            The initial shock stays fixed at (−0.5, 0). New innovations arrive
            only from t = 1. This extension assumes independent Gaussian
            disturbances across time and across the two variables. The source’s
            general framework permits a broader contemporaneous covariance.
          </p>
        </div>
        <div className="small-lesson">
          <span className="eyebrow">TRY THIS</span>
          <h3>Turn the later shocks off.</h3>
          <p>
            Set the new-shock standard deviation to zero. Every path collapses
            onto the isolated response. Then bring the feedback closer to its
            stability boundary and compare current changes with cumulative
            uncertainty.
          </p>
        </div>
      </div>
      <DeepDive
        advanced={advanced}
        title="What kind of uncertainty is visible here?"
      >
        <p>
          With independent zero-mean future innovations, the isolated response
          is the conditional mean given the imposed initial state. A finite
          ensemble median or sample mean will not exactly equal it. The band is
          pointwise: it does not claim that 80% of complete paths remain inside
          the band at every period.
        </p>
        <p>
          Zero covariance across time is weaker than independence. This
          simulation explicitly makes the stronger iid Gaussian assumption, with
          known fixed coefficients and innovation variance. It omits parameter
          estimation, omitted variables, structural identification, regime
          changes, fat tails and nonlinearities.
        </p>
        <p>
          Increasing feedback near the unit circle makes disturbances persist
          longer. Even when change dynamics are stable, the cumulative sum can
          retain and accumulate uncertainty. That is a different question from
          whether the impulse itself eventually decays.
        </p>
      </DeepDive>
      <NextChapter
        onClick={onNext}
        number="06"
        label="Read the paper and its limits"
      />
    </>
  );
}
