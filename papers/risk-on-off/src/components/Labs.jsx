import React, { useMemo, useState } from "react";
import {
  demoUniverse,
  mulMatVec,
  dot,
  norm,
  normalize,
  portfolioVariance,
  riskShares,
  effectiveBets,
  normalizedEntropy,
  weightsForEqualRisk,
  jacobiEigen,
  shockEigen,
} from "../lib/math.js";
import {
  Formula,
  Source,
  Range,
  Segmented,
  DeepDive,
  Note,
  PageHeader,
  RiskBars,
  Stat,
  NextChapter,
  Icon,
  COLORS,
} from "./ui.jsx";
import {
  GeometryChart,
  Scatter,
  Ellipsoid,
  Donut,
  Heatmap,
  LineChart,
} from "./charts.jsx";

const universe = demoUniverse();
const pct = (n) => `${(100 * n).toFixed(1)}%`;
const column = (matrix, i) => matrix.map((row) => row[i]);
const eigLoad = (w) =>
  universe.values.map((_, i) => dot(column(universe.vectors, i), w));
const presets = {
  capital: [1 / 3, 1 / 3, 1 / 3],
  single: column(universe.vectors, 0),
  balanced: weightsForEqualRisk(universe.values, universe.vectors),
};

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

export function Overview({ advanced, go }) {
  const [preset, setPreset] = useState("single");
  const shares = riskShares(presets[preset], universe.values, universe.vectors);
  return (
    <>
      <div className="overview-heading">
        <div className="eyebrow">
          <span className="live-dot" /> THE RISK OBSERVATORY{" "}
          <span className="edition">RESEARCH FIELD GUIDE / 01</span>
        </div>
      </div>
      <section className="hero">
        <div className="hero-copy">
          <span className="hero-kicker">LOOK BENEATH THE PORTFOLIO</span>
          <h1 id="page-title" tabIndex="-1">
            Many assets.
            <br />
            One hidden <em>bet.</em>
          </h1>
          <p>
            Owning more assets doesn’t always mean taking different risks.
            Discover the geometry that reveals what your portfolio is really
            exposed to.
          </p>
          <button className="button light" onClick={() => go("geometry")}>
            Explore the first experiment
            <Icon size={18} />
          </button>
          <div className="hero-source">
            A visual companion to research by
            <br />
            <strong>Marcos López de Prado</strong>{" "}
            <Source page={1}>Read the presentation</Source>
          </div>
        </div>
        <div className="hero-visual">
          <div className="visual-topline">
            <span>THE SHAPE OF RISK</span>
            <span>3 ASSETS · 3 DIRECTIONS</span>
          </div>
          <Ellipsoid values={universe.values} vectors={universe.vectors} dark />
          <div className="visual-bottomline">
            <i />
            The longest axis reveals the dominant risk direction.
          </div>
        </div>
      </section>
      <div className="overview-intro">
        <div>
          <span className="eyebrow">THE CENTRAL QUESTION</span>
          <h2>
            How many bets are you <em>actually</em> making?
          </h2>
        </div>
        <p>
          Count sources of risk, not names on a holdings sheet. Rotate the
          portfolio into its principal components, then measure how evenly those
          components contribute.
        </p>
      </div>
      <section className="overview-experiment panel">
        <div className="overview-switch">
          <div className="panel-header">
            <h2>Three assets. Different risk stories.</h2>
            <span className="synthetic-tag">ILLUSTRATIVE MODEL</span>
          </div>
          <p>Compare portfolios in the same synthetic investment universe.</p>
          <Segmented
            label="Portfolio example"
            options={[
              { value: "single", label: "One shared bet" },
              { value: "capital", label: "Equal capital" },
              { value: "balanced", label: "Equal mode risk" },
            ]}
            value={preset}
            onChange={setPreset}
          />
          <div className="overview-result">
            <strong>
              {effectiveBets(shares).toFixed(2)}
              <small> / 3</small>
            </strong>
            <span>
              effective uncorrelated bets
              <small>Derived from the distribution of variance</small>
            </span>
          </div>
        </div>
        <div className="overview-bars">
          <RiskBars
            shares={shares}
            labels={[
              "PC1 · common direction",
              "PC2 · relative direction",
              "PC3 · remaining direction",
            ]}
            compact
          />
          <p className="chart-footnote">
            Shares of modeled portfolio variance. The axes and asset names are
            synthetic.
          </p>
        </div>
      </section>
      <div className="section-heading">
        <div>
          <span className="eyebrow">THE LEARNING PATH</span>
          <h2>From intuition to insight.</h2>
        </div>
        <span className="subtle">Four experiments, one connected argument</span>
      </div>
      <div className="path-grid">
        {[
          [
            "geometry",
            "01",
            "geometry",
            "Correlation has a shape",
            "See why risk vectors add differently when assets move together.",
            "5 MIN",
          ],
          [
            "components",
            "02",
            "pca",
            "Find the hidden bets",
            "Rotate the data and uncover uncorrelated principal components.",
            "7 MIN",
          ],
          [
            "concentration",
            "03",
            "entropy",
            "Count meaningful bets",
            "Turn component risk shares into entropy and an effective count.",
            "8 MIN",
          ],
          [
            "stress",
            "04",
            "shock",
            "Stress the system",
            "Discover what happens when a shared risk direction gets louder.",
            "6 MIN",
          ],
        ].map(([key, n, icon, title, desc, time]) => (
          <button className="path-card" key={key} onClick={() => go(key)}>
            <div className="path-card-top">
              <span>{n}</span>
              <Icon name={icon} size={25} />
            </div>
            <h3>{title}</h3>
            <p>{desc}</p>
            <div className="path-card-bottom">
              <small>{time} · INTERACTIVE</small>
              <Icon size={17} />
            </div>
          </button>
        ))}
      </div>
      <section className="panel context-note">
        <div className="eyebrow">WHY RISK-ON / RISK-OFF?</div>
        <h2>When different markets share the same story.</h2>
        <p>
          In a risk-on environment, investors are more willing to bear risk; in
          a risk-off environment, they seek safety. Stocks, credit, currencies
          and rates can respond together to that broad change. A portfolio with
          many positions may therefore be heavily exposed to one shared
          direction.
        </p>
        <p>
          The presentation asks us to monitor both{" "}
          <strong>how much risk we take</strong> and{" "}
          <strong>where that risk is concentrated</strong>. Principal components
          make the shared directions visible. Entropy describes how evenly a
          particular portfolio uses them.
        </p>
        <div className="context-details">
          <div>
            <h3>What you need</h3>
            <p>
              Comfort with standard deviation and correlation. The first
              experiment builds the geometry from scratch; the glossary
              introduces every main term.
            </p>
          </div>
          <div>
            <h3>What you will be able to do</h3>
            <p>
              Distinguish asset count from risk diversity, interpret component
              risk shares, and explain why covariance estimation matters for a
              stress test.
            </p>
          </div>
        </div>
        <div style={{ marginTop: 20 }}>
          <Source page={2}>The presentation’s starting point</Source>
        </div>
      </section>
      <div className="bottom-pair">
        <Note title="Choose your depth">
          <p>
            The <strong>Foundation</strong> path builds the intuition. Switch to{" "}
            <strong>Advanced</strong> for derivations, assumptions, and
            questions to take into a seminar.
          </p>
        </Note>
        <Note title="A research companion">
          <p>
            Based on a 50-slide presentation, with numbered source links.
            Interactive models use synthetic inputs; source examples preserve
            reported figures.
          </p>
        </Note>
      </div>
      {advanced && (
        <DeepDive
          advanced={advanced}
          title="The entire argument in three equations"
        >
          <Formula
            block
          >{String.raw`V=Z\Lambda Z^\top,\qquad f=Z^\top w,\qquad \sigma_p^2=\sum_i \lambda_i f_i^2`}</Formula>
          <p>
            The covariance matrix defines the modes. Holdings determine their
            loadings. Risk shares tell us how much each mode matters to this
            particular portfolio.
          </p>
        </DeepDive>
      )}
    </>
  );
}

export function GeometryLab({ advanced, onNext }) {
  const [rho, setRho] = useState(0.5);
  const [volA, setVolA] = useState(20);
  const [volB, setVolB] = useState(20);
  const [weight, setWeight] = useState(50);
  const a = (volA * weight) / 100,
    b = volB * (1 - weight / 100);
  const variance = a * a + b * b + 2 * a * b * rho;
  const sigma = Math.sqrt(Math.max(0, variance));
  const reset = () => {
    setRho(0.5);
    setVolA(20);
    setVolB(20);
    setWeight(50);
  };
  return (
    <>
      <PageHeader
        chapter="EXPERIMENT 01 / CORRELATION GEOMETRY"
        title={
          <>
            Risk adds. But at an <em>angle.</em>
          </>
        }
        intro="Two assets moving together offer less diversification than two assets moving apart. Correlation determines the angle between their risk vectors."
        page={7}
      />
      <div className="lab-grid">
        <Panel title="Build a two-asset portfolio" tag="YOUR INPUTS">
          <Range
            label="Correlation ρ"
            value={rho}
            min={-1}
            max={1}
            step={0.01}
            onChange={setRho}
            format={(v) => v.toFixed(2)}
          />
          <div className="range-endpoints">
            <button onClick={() => setRho(-1)}>Opposite −1</button>
            <button onClick={() => setRho(0)}>Uncorrelated 0</button>
            <button onClick={() => setRho(1)}>Together +1</button>
          </div>
          <hr />
          <Range
            label="Asset A volatility"
            value={volA}
            min={5}
            max={40}
            onChange={setVolA}
            format={(v) => `${v}%`}
          />
          <Range
            label="Asset B volatility"
            value={volB}
            min={5}
            max={40}
            onChange={setVolB}
            format={(v) => `${v}%`}
          />
          <Range
            label="Capital in asset A"
            value={weight}
            min={0}
            max={100}
            onChange={setWeight}
            format={(v) => `${v}%`}
            hint={`The remaining ${100 - weight}% is invested in asset B. Long-only, fully invested.`}
          />
          <button className="text-button" onClick={reset}>
            <Icon name="reset" size={15} />
            Reset experiment
          </button>
        </Panel>
        <Panel
          title="The geometry of diversification"
          tag="LIVE MODEL"
          className="chart-panel"
        >
          <GeometryChart rho={rho} a={a} b={b} />
          <div className="chart-metrics">
            <Stat
              label="Portfolio volatility"
              value={sigma.toFixed(1)}
              suffix="%"
            />
            <Stat
              label="Angle between vectors"
              value={((Math.acos(rho) * 180) / Math.PI).toFixed(1)}
              suffix="°"
            />
            <Stat
              label="Weighted standalone vol."
              value={(a + b).toFixed(1)}
              suffix="%"
            />
          </div>
        </Panel>
      </div>
      <Note
        title={
          rho > 0.8
            ? "When the vectors align"
            : rho < -0.8
              ? "When the vectors oppose"
              : "The shorter diagonal is diversification"
        }
      >
        <p>
          {rho > 0.8
            ? "At +1 correlation, both exposures move in the same direction. Portfolio volatility equals their weighted standalone volatilities."
            : rho < -0.8
              ? "At −1 correlation, equal weighted volatilities can cancel in this idealized two-asset model. This perfect hedge is a limiting case, not a stable market assumption."
              : "The portfolio is the vector sum. Lowering correlation opens the angle and shortens that sum, even though neither asset’s own volatility changes."}
        </p>
      </Note>
      <div className="explanation-grid">
        <div>
          <h2>The Pythagorean starting point</h2>
          <p>
            If returns are uncorrelated, the vectors meet at a right angle.
            Variances add like squared triangle sides. Correlation adds a cross
            term that makes the portfolio vector longer or shorter.
          </p>
          <Formula
            block
          >{String.raw`\sigma_p^2=w_A^2\sigma_A^2+w_B^2\sigma_B^2+2w_Aw_B\sigma_A\sigma_B\rho`}</Formula>
        </div>
        <div className="small-lesson">
          <span className="eyebrow">TRY THIS</span>
          <h3>Make the risk disappear.</h3>
          <p>
            Set both asset volatilities to 20%, split capital 50/50, and move
            correlation to −1. Then increase one asset’s volatility. Why does
            the cancellation break?
          </p>
          <Source page={6} />
        </div>
      </div>
      <DeepDive advanced={advanced} title="Covariance as an inner product">
        <p>
          For centered return variables, covariance acts as an inner product and
          volatility as a norm. The correlation is the cosine of the angle
          between vectors drawn from the same origin.
        </p>
        <Formula
          block
        >{String.raw`\rho_{AB}=\frac{\operatorname{Cov}(r_A,r_B)}{\sigma_A\sigma_B}=\cos\varphi`}</Formula>
        <p>
          The presentation also uses an internal triangle angle θ, giving ρ =
          −cos θ. Since φ = π − θ, these are the same convention. All
          volatilities here refer to the same arbitrary period; inputs are
          percentage points. No time scaling or return forecast is applied.
        </p>
        <p>
          <strong>Seminar question:</strong> Pairwise correlations summarize all
          second moments once individual variances are known. Why does averaging
          those correlations discard information about a particular holdings
          vector?
        </p>
      </DeepDive>
      <NextChapter onClick={onNext} number="02" label="Find the hidden bets" />
    </>
  );
}

export function ComponentsLab({ advanced, onNext }) {
  const [rho, setRho] = useState(0.75);
  const [relative, setRelative] = useState(1);
  const [view, setView] = useState("assets");
  const cov = useMemo(
    () => [
      [1, rho * relative],
      [rho * relative, relative ** 2],
    ],
    [rho, relative],
  );
  const eig = useMemo(() => jacobiEigen(cov), [cov]);
  const total = eig.values.reduce((a, b) => a + b, 0);
  const shares = eig.values.map((v) => v / total);
  return (
    <>
      <PageHeader
        chapter="EXPERIMENT 02 / PRINCIPAL COMPONENTS"
        title={
          <>
            Change the coordinates.
            <br />
            See the <em>structure.</em>
          </>
        }
        intro="A cloud of correlated returns has a natural orientation. Principal component analysis finds those directions and rotates the axes to match them."
        page={13}
      />
      <div className="lab-grid">
        <Panel title="Shape the return cloud" tag="YOUR INPUTS">
          <Range
            label="Asset correlation"
            value={rho}
            min={-0.95}
            max={0.95}
            step={0.01}
            onChange={setRho}
            format={(v) => v.toFixed(2)}
          />
          <Range
            label="Asset B / Asset A volatility"
            value={relative}
            min={0.4}
            max={1.8}
            step={0.05}
            onChange={setRelative}
            format={(v) => `${v.toFixed(2)}×`}
          />
          <Segmented
            options={[
              { value: "assets", label: "Asset coordinates" },
              { value: "pcs", label: "PC coordinates" },
            ]}
            value={view}
            onChange={setView}
            label="Coordinate system"
          />
          <div className="mode-explanation">
            <h3>
              {view === "assets" ? "The original view" : "The rotated view"}
            </h3>
            <p>
              {view === "assets"
                ? "The assets share variation. The orange line is the largest-variance direction; the teal line is perpendicular to it."
                : "The same observations now sit along uncorrelated axes. We changed their coordinates, not the information or total variance."}
            </p>
          </div>
          <Heatmap
            matrix={
              view === "assets"
                ? cov
                : [
                    [eig.values[0], 0],
                    [0, eig.values[1]],
                  ]
            }
            labels={view === "assets" ? ["A", "B"] : ["PC1", "PC2"]}
            title={
              view === "assets" ? "Asset covariance V" : "Mode covariance Λ"
            }
          />
          <button
            className="text-button"
            onClick={() => {
              setRho(0.75);
              setRelative(1);
              setView("assets");
            }}
          >
            <Icon name="reset" size={15} />
            Reset experiment
          </button>
        </Panel>
        <Panel
          title={
            view === "assets" ? "Correlated assets" : "Uncorrelated components"
          }
          tag="230 SYNTHETIC OBSERVATIONS"
          className="chart-panel"
        >
          <Scatter covariance={cov} rotated={view === "pcs"} />
          <div className="chart-legend">
            <span>
              <i style={{ background: COLORS[0] }} />
              First principal direction
            </span>
            <span>
              <i style={{ background: COLORS[1] }} />
              Second principal direction
            </span>
          </div>
          <div className="chart-metrics">
            <Stat
              label="PC1 universe variance"
              value={(shares[0] * 100).toFixed(1)}
              suffix="%"
            />
            <Stat
              label="PC2 universe variance"
              value={(shares[1] * 100).toFixed(1)}
              suffix="%"
            />
          </div>
        </Panel>
      </div>
      <Note title="The covariance is diagonal; the sample is finite">
        <p>
          The transformed <em>population model</em> has zero cross-covariance. A
          finite simulated sample will not have exactly zero measured
          covariance. The dashed contour marks two mode standard deviations,
          without claiming a universal probability boundary.
        </p>
      </Note>
      <div className="explanation-grid">
        <div>
          <h2>A rotation with no missing pieces</h2>
          <p>
            Each principal component is a linear combination of the original
            assets. Together, the components span the whole universe. Unlike an
            incomplete factor regression, this decomposition leaves no residual
            variance.
          </p>
          <Formula
            block
          >{String.raw`V=Z\Lambda Z^\top \quad\Longrightarrow\quad Z^\top VZ=\Lambda`}</Formula>
          <p>
            <strong>Z</strong> holds the directions as columns.{" "}
            <strong>Λ</strong> holds their variances on its diagonal.
          </p>
        </div>
        <div className="small-lesson">
          <span className="eyebrow">TRY THIS</span>
          <h3>Stretch without tilting?</h3>
          <p>
            Set correlation to zero and increase asset B’s relative volatility.
            The cloud stays axis-aligned, but the largest principal direction
            switches to B. High variance and high correlation are different
            ideas.
          </p>
        </div>
      </div>
      <DeepDive
        advanced={advanced}
        title="The spectral theorem, and what it does not say"
      >
        <p>
          A symmetric positive semidefinite covariance matrix admits real
          nonnegative eigenvalues and an orthonormal eigenbasis. For centered
          returns x, define y = Zᵀx. Then Cov(y) = Λ. The total universe
          variance is the trace, and the rotation preserves it.
        </p>
        <Formula
          block
        >{String.raw`\operatorname{tr}(V)=\sum_i\lambda_i,\qquad Z^\top Z=I,\qquad Vz_i=\lambda_i z_i`}</Formula>
        <p>
          <strong>Uncorrelated is weaker than independent.</strong> Joint
          Gaussianity would make this rotation produce independent coordinates;
          general return distributions can retain nonlinear and tail dependence.
          A principal component is a statistical direction, not necessarily an
          identified economic cause.
        </p>
        <p>
          <strong>Degeneracy:</strong> equal variances and zero correlation
          produce repeated eigenvalues. No unique preferred orientation exists
          then. Small data changes near that point can rotate the estimated
          eigenvectors substantially.
        </p>
        <p>
          <strong>Estimation:</strong> a sample covariance estimated from T
          centered observations in n dimensions has rank at most min(n, T − 1).
          With n ≥ T it must be singular. Shrinkage, regularization, or
          dimensional reduction changes the eigenvalues and often the modes, so
          it also changes the risk decomposition you are measuring.
        </p>
        <p>
          <strong>Units:</strong> this experiment fixes Var(A) = 1 and changes
          B’s relative scale. It performs covariance PCA, not a fresh
          standardization to correlation PCA at each setting.
        </p>
      </DeepDive>
      <NextChapter
        onClick={onNext}
        number="03"
        label="Measure the concentration"
      />
    </>
  );
}

export function ConcentrationLab({ advanced, onNext }) {
  const [weights, setWeights] = useState(presets.capital);
  const [scale, setScale] = useState(1);
  const [extra, setExtra] = useState(false);
  const actual = weights.map((w) => w * scale);
  const variance = portfolioVariance(actual, universe.covariance);
  const valid = variance > 1e-14;
  const shares = valid
    ? riskShares(actual, universe.values, universe.vectors)
    : [0, 0, 0];
  const betCount = valid ? effectiveBets(shares) : null;
  const allShares = extra ? [...shares, 0] : shares;
  const H = valid ? normalizedEntropy(allShares) : null;
  const loadings = eigLoad(actual);
  const marginal = mulMatVec(universe.covariance, actual);
  const assetShares = valid
    ? actual.map((w, i) => (w * marginal[i]) / variance)
    : [0, 0, 0];
  const update = (i, v) =>
    setWeights((ws) => ws.map((x, j) => (i === j ? v : x)));
  const selectPreset = (key) => {
    setWeights([...presets[key]]);
    setScale(1);
  };
  return (
    <>
      <PageHeader
        chapter="EXPERIMENT 03 / RISK CONCENTRATION"
        title={
          <>
            Names are not <em>bets.</em>
          </>
        }
        intro="Translate holdings into principal components. Then ask how many of those components meaningfully contribute to portfolio variance."
        page={29}
      />
      <div className="preset-row">
        <span className="overline">START WITH A PORTFOLIO</span>
        <div className="button-group">
          <button onClick={() => selectPreset("capital")}>Equal capital</button>
          <button onClick={() => selectPreset("single")}>
            One principal bet
          </button>
          <button onClick={() => selectPreset("balanced")}>
            Equal mode risk (DRP)
          </button>
        </div>
      </div>
      <div className="concentration-layout">
        <Panel title="Holdings in asset space" tag="SIGNED EXPOSURE UNITS">
          {universe.labels.map((label, i) => (
            <Range
              key={label}
              label={label}
              value={weights[i]}
              min={-1}
              max={1}
              step={0.01}
              onChange={(v) => update(i, v)}
              format={(v) => `${v >= 0 ? "+" : ""}${v.toFixed(2)}`}
            />
          ))}
          <Range
            label="Overall exposure scale"
            value={scale}
            min={0.25}
            max={3}
            step={0.05}
            onChange={setScale}
            format={(v) => `${v.toFixed(2)}×`}
          />
          <p className="chart-footnote">
            Synthetic annual return covariance. Signed units allow hedges;
            holdings need not sum to one. Scale changes risk size, not its
            composition.
          </p>
          <div className="mini-stat">
            <span>Modeled annual volatility</span>
            <strong>{pct(Math.sqrt(variance))}</strong>
          </div>
          <button
            className="text-button"
            onClick={() => {
              selectPreset("capital");
              setExtra(false);
            }}
          >
            <Icon name="reset" size={15} />
            Reset experiment
          </button>
        </Panel>
        <Panel
          title="Risk in component space"
          tag="SHARE OF TOTAL VARIANCE"
          className="risk-panel"
        >
          {valid ? (
            <>
              <div className="concentration-top">
                <Donut
                  shares={shares}
                  center={betCount.toFixed(2)}
                  subtitle="effective bets"
                />
                <div>
                  <span className="overline">NORMALIZED ENTROPY</span>
                  <div className="entropy-value">
                    {H.toFixed(2)}
                    <span>/ 1</span>
                  </div>
                  <p>
                    {H > 0.95
                      ? "Risk is spread evenly across the available modeled directions."
                      : H < 0.2
                        ? "Most modeled risk comes from a single direction."
                        : "Several components matter, with an uneven distribution of modeled risk."}
                  </p>
                </div>
              </div>
              <RiskBars shares={shares} />
            </>
          ) : (
            <div className="empty-state">
              <Icon name="info" size={32} />
              <h3>No exposure, no risk shares.</h3>
              <p>
                All holdings are zero. Add an exposure to define component risk
                shares and entropy.
              </p>
            </div>
          )}
        </Panel>
      </div>
      <div className="universe-note">
        <div>
          <span className="eyebrow">THE DENOMINATOR MATTERS</span>
          <h3>What if another independent bet were available?</h3>
          <p>
            Add a fourth independent synthetic mode with zero exposure. Existing
            risk and effective bets stay the same; normalized entropy falls
            because the opportunity set is larger. This controlled extension
            keeps the original three axes fixed.
          </p>
        </div>
        <label className="toggle">
          <input
            type="checkbox"
            checked={extra}
            onChange={(e) => setExtra(e.target.checked)}
          />
          <span className="toggle-track" />
          <span>Include unused fourth mode</span>
        </label>
        {extra && valid && (
          <div className="universe-result">
            Same {betCount.toFixed(2)} effective bets, now out of 4.
            <strong>H = {H.toFixed(2)}</strong>
          </div>
        )}
      </div>
      <div className="explanation-grid">
        <div>
          <h2>From risk shares to an effective count</h2>
          <p>
            One component with all the risk gives one effective bet. Equal risk
            across three components gives three. Entropy smoothly fills the
            space between those endpoints.
          </p>
          <Formula
            block
          >{String.raw`p_i=\frac{\lambda_i f_i^2}{\sum_j\lambda_j f_j^2},\qquad N_{\mathrm{eff}}=\exp\!\left(-\sum_i p_i\ln p_i\right)`}</Formula>
          <Formula
            block
          >{String.raw`H=\frac{N_{\mathrm{eff}}-1}{n-1}`}</Formula>
          <p>
            This is the presentation’s normalized exponential entropy, rather
            than Shannon entropy divided by ln(n). Adopt 0 ln(0) = 0.
          </p>
        </div>
        <div className="small-lesson">
          <span className="eyebrow">TRY THIS</span>
          <h3>Double the size. Keep the bets.</h3>
          <p>
            Choose equal mode risk, then set exposure scale to 2×. Volatility
            doubles; effective bets and entropy stay constant. Concentration
            measures the distribution of risk, not its amount.
          </p>
          <Source page={30} />
        </div>
      </div>
      <DeepDive advanced={advanced} title="Inspect the full decomposition">
        <Formula
          block
        >{String.raw`f=Z^\top w,\qquad \sigma_p^2=w^\top Vw=f^\top\Lambda f`}</Formula>
        <div className="table-scroll">
          <table className="data-table">
            <caption>
              Current portfolio decomposition (synthetic annual covariance)
            </caption>
            <thead>
              <tr>
                <th>Component / asset</th>
                <th>λ</th>
                <th>Loading f</th>
                <th>Mode share</th>
                <th>Asset share</th>
              </tr>
            </thead>
            <tbody>
              {universe.values.map((lambda, i) => (
                <tr key={i}>
                  <th>
                    PC{i + 1} / {universe.labels[i]}
                  </th>
                  <td>{lambda.toFixed(3)}</td>
                  <td>{loadings[i].toFixed(3)}</td>
                  <td>{valid ? pct(shares[i]) : "Undefined"}</td>
                  <td>{valid ? pct(assetShares[i]) : "Undefined"}</td>
                </tr>
              ))}
            </tbody>
          </table>
        </div>
        <p>
          Mode and asset columns are separate attributions; pairing them by row
          does not identify PC1 with Stocks. The asset Euler share is wᵢ(Vw)ᵢ/σ²
          and can be negative for a hedge. Component shares λᵢfᵢ²/σ² are
          nonnegative, so they can be used as entropy weights.
        </p>
        <h3>Constructing equal component risk</h3>
        <Formula
          block
        >{String.raw`\lambda_i f_i^2=c\quad\Longrightarrow\quad f_i=\pm\sqrt{c/\lambda_i},\quad w=Zf`}</Formula>
        <p>
          The DRP preset selects positive mode loadings, then fixes the
          Euclidean holdings length to one. Different signs and scales give
          different portfolios with the same risk shares. This is unconstrained;
          small eigenvalues can imply large offsetting positions in other
          normalizations. There is no long-only or full-investment guarantee.
        </p>
        <Heatmap
          matrix={universe.covariance.map((row) => row.map((v) => v * 100))}
          labels={["Stock", "Credit", "Treasury"]}
          title="Annual covariance × 100"
        />
      </DeepDive>
      <NextChapter onClick={onNext} number="04" label="Stress the system" />
    </>
  );
}

export function StressLab({ advanced, onNext }) {
  const [mult, setMult] = useState(2);
  const [rotation, setRotation] = useState(0);
  const [exposure, setExposure] = useState("single");
  const w = presets[exposure];
  const shocked = shockEigen(
    universe.values,
    universe.vectors,
    mult * mult,
    rotation,
  );
  const baseline = portfolioVariance(w, universe.covariance);
  const after = portfolioVariance(w, shocked.covariance);
  const ratio = Math.sqrt(after / baseline);
  const shares = riskShares(w, universe.values, universe.vectors);
  const series = ["single", "balanced"].map((p) =>
    Array.from({ length: 51 }, (_, i) => {
      const m = 1 + (i / 50) * 2;
      const scenario = shockEigen(
        universe.values,
        universe.vectors,
        m * m,
        rotation,
      );
      return [
        m,
        Math.sqrt(
          portfolioVariance(presets[p], scenario.covariance) /
            portfolioVariance(presets[p], universe.covariance),
        ),
      ];
    }),
  );
  function exportScenario() {
    const json = {
      title: "Risk Observatory synthetic covariance scenario",
      synthetic: true,
      modeVolatilityMultiplier: mult,
      modeVarianceMultiplier: mult * mult,
      rotationDegrees: rotation,
      portfolio: exposure,
      holdings: w,
      baselineCovariance: universe.covariance,
      scenarioCovariance: shocked.covariance,
      baselineVolatility: Math.sqrt(baseline),
      scenarioVolatility: Math.sqrt(after),
      volatilityRatio: ratio,
      assumptions:
        "Fixed holdings, synthetic annual covariance; no live data or prediction.",
    };
    const url = URL.createObjectURL(
      new Blob([JSON.stringify(json, null, 2)], { type: "application/json" }),
    );
    const a = document.createElement("a");
    a.href = url;
    a.download = "risk-observatory-scenario.json";
    a.click();
    setTimeout(() => URL.revokeObjectURL(url), 1000);
  }
  return (
    <>
      <PageHeader
        chapter="EXPERIMENT 04 / REGIME STRESS"
        title={
          <>
            Turn up one mode.
            <br />
            Feel the <em>difference.</em>
          </>
        }
        intro="If a shared risk direction becomes more volatile, a portfolio concentrated in that direction receives more of the shock. Compare the proportional change with holdings fixed."
        page={25}
      />
      <div className="lab-grid">
        <Panel title="Design a covariance shock" tag="SCENARIO INPUTS">
          <Segmented
            label="Stress portfolio"
            value={exposure}
            onChange={setExposure}
            options={[
              { value: "single", label: "One principal bet" },
              { value: "balanced", label: "Equal mode risk" },
            ]}
          />
          <Range
            label="PC1 volatility multiplier"
            value={mult}
            min={1}
            max={3}
            step={0.05}
            onChange={setMult}
            format={(v) => `${v.toFixed(2)}×`}
            hint={`Mode variance is multiplied by ${(mult * mult).toFixed(2)}. All other eigenvalues remain fixed.`}
          />
          <Range
            label="Rotation of first two risk axes"
            value={rotation}
            min={0}
            max={60}
            step={1}
            onChange={setRotation}
            format={(v) => `${v}°`}
            hint="An educational extension: rotate the basis as well as changing one eigenvalue."
          />
          <div className="mini-stat">
            <span>Initial PC1 variance share</span>
            <strong>{pct(shares[0])}</strong>
          </div>
          <div className="mini-stat">
            <span>Portfolio volatility / baseline</span>
            <strong className="stress-ratio">{ratio.toFixed(2)}×</strong>
          </div>
          <button
            className="text-button"
            onClick={() => {
              setMult(2);
              setRotation(0);
              setExposure("single");
            }}
          >
            <Icon name="reset" size={15} />
            Reset experiment
          </button>
          <button className="text-button" onClick={exportScenario}>
            <Icon name="download" size={15} />
            Download scenario JSON
          </button>
        </Panel>
        <Panel
          title="Same shock, different sensitivity"
          tag="RELATIVE TO EACH BASELINE"
          className="chart-panel"
        >
          <LineChart series={series} />
          <div className="stress-summary">
            <div>
              <span className="overline">YOUR SELECTED SCENARIO</span>
              <strong>
                {mult.toFixed(2)}× mode volatility → {ratio.toFixed(2)}×
                portfolio volatility
              </strong>
            </div>
            <span className="scenario-badge">
              {rotation === 0 ? "AXES FIXED" : `${rotation}° ROTATION`}
            </span>
          </div>
        </Panel>
      </div>
      <Note
        title={
          rotation === 0
            ? "At 2× mode volatility, the distinction is clear"
            : "When the axes rotate, yesterday’s balance can change"
        }
      >
        <p>
          {rotation === 0
            ? "Doubling PC1 volatility quadruples its variance. A pure-PC1 portfolio doubles in volatility. An equal-three-mode portfolio rises by √2 ≈ 1.41× because only one third of its initial variance is exposed to that shock."
            : "The simple fixed-axis formula no longer applies. Yesterday’s holdings are projected onto a new basis, so both the component risk shares and shock sensitivity can change. Equal mode risk under one covariance estimate is not permanent protection."}
        </p>
      </Note>
      <div className="explanation-grid">
        <div>
          <h2>Concentration amplifies sensitivity</h2>
          <p>
            With fixed axes, initial PC1 variance share p₁, and a
            mode-volatility multiplier m, the proportional increase follows
            directly from the variance decomposition.
          </p>
          <Formula
            block
          >{String.raw`\frac{\sigma_{\mathrm{after}}}{\sigma_{\mathrm{before}}}=\sqrt{1+p_1(m^2-1)}`}</Formula>
          <p>
            The comparison uses each portfolio’s own baseline volatility.
            Equivalent volatility normalization would give the same ratios; raw
            holdings size and capital requirements can differ.
          </p>
        </div>
        <div className="small-lesson">
          <span className="eyebrow">TRY THIS</span>
          <h3>Break the stable-basis assumption.</h3>
          <p>
            Choose equal mode risk, keep the volatility shock at 2×, and rotate
            the axes. What did your “balanced” portfolio actually balance: an
            enduring economic truth, or one estimated covariance matrix?
          </p>
        </div>
      </div>
      <DeepDive
        advanced={advanced}
        title="Structural changes and the Rayleigh quotient"
      >
        <p>
          The presentation motivates eigenmode stress using a mechanical
          analogy. The financial experiment here is a covariance scenario. It
          does not model mechanical resonance, detect market regimes, or apply
          powers of V through time.
        </p>
        <Formula
          block
        >{String.raw`R(w,V)=\frac{w^\top Vw}{w^\top w},\qquad \lambda_{\min}\le R(w,V)\le\lambda_{\max}`}</Formula>
        <p>
          At fixed Euclidean holdings length, the leading eigenvector attains
          the global maximum variance. If the largest eigenvalue is repeated,
          every direction in its eigenspace also attains that maximum.
          Intermediate eigenvectors with distinct eigenvalues are stationary
          directions, generally saddle points, and the smallest eigenvector
          minimizes variance. This qualifies the presentation’s broad language
          about eigenvectors maximizing risk.
        </p>
        <p>
          The advanced rotation uses Z′ = ZQ for an orthogonal rotation Q in the
          first two dimensions and V′ = Z′Λ′Z′ᵀ. The covariance stays positive
          semidefinite. No expected returns, trading costs, non-Gaussian tails,
          margin effects, or portfolio rebalancing enter this scenario.
        </p>
        <p>
          <strong>Research prompt:</strong> How would you test the out-of-sample
          stability of component risk shares when the covariance estimate and
          the investment universe both change?
        </p>
      </DeepDive>
      <NextChapter
        onClick={onNext}
        number="05"
        label="Read the evidence and its limits"
      />
    </>
  );
}
