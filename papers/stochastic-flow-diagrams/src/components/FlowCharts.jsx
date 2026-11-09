import React, { useId } from "react";
import { eigenvalues2 } from "../lib/sfd.js";

const INK = "#183d50";
const POSITIVE = "#b56832";
const NEGATIVE = "#287da2";
const MUTED = "#46606e";
const LINE = "#d8e1e3";
const COLORS = [POSITIVE, NEGATIVE, "#56745c", "#816092"];
const TEXT_COLORS = ["#985021", "#1b6688", "#3f6047", "#694b7b"];
const DASHES = [undefined, "8 4", "2 4", "9 3 2 3"];

function number(value, signed = false) {
  if (!Number.isFinite(value)) return "—";
  const clean = Object.is(value, -0) ? 0 : value;
  const magnitude = Math.abs(clean);
  const formatted =
    magnitude !== 0 && (magnitude < 0.001 || magnitude >= 10000)
      ? clean.toExponential(2).replace("e+", "e")
      : new Intl.NumberFormat("en", { maximumFractionDigits: 3 }).format(clean);
  return signed && clean > 0 ? `+${formatted}` : formatted.replace("-", "−");
}

function validMatrix(matrix) {
  return (
    Array.isArray(matrix) &&
    matrix.length === 2 &&
    matrix.every(
      (row) =>
        Array.isArray(row) && row.length === 2 && row.every(Number.isFinite),
    )
  );
}

function validVector(vector, length) {
  return (
    Array.isArray(vector) &&
    vector.length >= length &&
    vector.slice(0, length).every(Number.isFinite)
  );
}

function DiagramError({ children }) {
  return (
    <p className="diagram-caption" role="alert">
      {children}
    </p>
  );
}

function ArrowDefinitions({ id }) {
  return (
    <defs>
      {[
        [POSITIVE, "positive"],
        [NEGATIVE, "negative"],
        [MUTED, "delay"],
      ].map(([color, name]) => (
        <marker
          key={name}
          id={`${id}-${name}`}
          viewBox="0 0 10 10"
          refX="9"
          refY="5"
          markerWidth="7"
          markerHeight="7"
          orient="auto-start-reverse"
        >
          <path d="M 0 1 L 9 5 L 0 9 Z" fill={color} />
        </marker>
      ))}
    </defs>
  );
}

function CurrentNode({ x, y, name, value, compact = false }) {
  return (
    <g>
      <ellipse
        cx={x}
        cy={y}
        rx="60"
        ry="35"
        fill="var(--panel, #fbfcf8)"
        stroke={INK}
        strokeWidth="2"
      />
      <text
        x={x}
        y={y - 4}
        textAnchor="middle"
        fill={INK}
        fontSize="20"
        fontWeight="600"
      >
        {name}
      </text>
      {!compact && (
        <text x={x} y={y + 19} textAnchor="middle" fill={MUTED} fontSize="13">
          {number(value, true)}
        </text>
      )}
    </g>
  );
}

function MemoryNode({ x, y, name, value, compact = false }) {
  return (
    <g>
      <path
        d={`M${x},${y - 45} L${x + 48},${y} L${x},${y + 45} L${x - 48},${y} Z`}
        fill="#eef3f4"
        stroke={INK}
        strokeWidth="1.7"
      />
      <text
        x={x}
        y={y - 4}
        textAnchor="middle"
        fill={INK}
        fontSize="19"
        fontWeight="600"
      >
        {name}
      </text>
      {!compact && (
        <text x={x} y={y + 18} textAnchor="middle" fill={MUTED} fontSize="13">
          {number(value, true)}
        </text>
      )}
    </g>
  );
}

function CoefficientLabel({
  x,
  y,
  coefficient,
  contribution,
  name,
  selected = false,
  compact = false,
}) {
  const color = coefficient > 0 ? POSITIVE : coefficient < 0 ? NEGATIVE : MUTED;
  const textColor =
    coefficient > 0 ? TEXT_COLORS[0] : coefficient < 0 ? TEXT_COLORS[1] : MUTED;
  return (
    <g>
      <rect
        x={x - 80}
        y={y - 17}
        width="160"
        height={compact ? 29 : 47}
        rx="7"
        fill="var(--panel, #fbfcf8)"
        stroke={selected ? color : "none"}
        strokeWidth="1"
      />
      <text
        x={x}
        y={y + 2}
        textAnchor="middle"
        fill={textColor}
        fontSize="15"
        fontWeight="650"
      >
        {name} = {number(coefficient, true)}
      </text>
      {!compact && (
        <text x={x} y={y + 21} textAnchor="middle" fill={MUTED} fontSize="12">
          contribution {number(contribution, true)}
        </text>
      )}
    </g>
  );
}

/** Matrix rows are targets; columns are lagged sources. No instantaneous arrows. */
export function FlowNetwork({
  matrix = [
    [0.25, -0.25],
    [-0.25, 0.25],
  ],
  state = [-0.5, 0],
  previous = [0, 0],
  selectedEdge = "0-0",
  onSelectEdge,
  activeStep = 0,
  compact = false,
}) {
  const id = `flow-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  if (
    !validMatrix(matrix) ||
    !validVector(state, 2) ||
    !validVector(previous, 2)
  ) {
    return (
      <DiagramError>
        The flow diagram needs a finite 2 × 2 matrix and two finite state
        values.
      </DiagramError>
    );
  }
  const names = ["Stocks", "Bonds"];
  const edges = [
    {
      target: 0,
      source: 0,
      path: "M510 104 C445 35 245 35 184 102",
      x: 345,
      y: 49,
      name: "ΦSS",
    },
    {
      target: 0,
      source: 1,
      path: "M510 294 C450 265 250 184 202 148",
      x: 300,
      y: 184,
      name: "ΦSB",
    },
    {
      target: 1,
      source: 0,
      path: "M510 156 C450 185 250 266 202 302",
      x: 420,
      y: 276,
      name: "ΦBS",
    },
    {
      target: 1,
      source: 1,
      path: "M510 346 C445 415 245 415 184 348",
      x: 345,
      y: 403,
      name: "ΦBB",
    },
  ];
  const edgeDescription = edges
    .map(
      ({ target, source }) =>
        `${names[source]} at the previous step to ${names[target]} now: coefficient ${number(matrix[target][source], true)}, contribution ${number(matrix[target][source] * previous[source], true)}`,
    )
    .join(". ");

  return (
    <figure className={`flow-network${compact ? " compact" : ""}`}>
      <svg
        viewBox="0 0 680 450"
        role="img"
        aria-labelledby={`${id}-title ${id}-description`}
        style={{ display: "block", width: "100%", height: "auto" }}
      >
        <title
          id={`${id}-title`}
        >{`A two-variable stochastic flow diagram at step ${activeStep}`}</title>
        <desc id={`${id}-description`}>
          Ellipses are current values and diamonds are lag memory. Solid
          weighted arrows run from a lagged source on the right to a current
          target on the left. Dashed arrows store current values for the next
          step. {edgeDescription}.
        </desc>
        <ArrowDefinitions id={id} />
        <text
          x="150"
          y="24"
          textAnchor="middle"
          fill={MUTED}
          fontSize="12"
          letterSpacing="1.5"
        >
          CURRENT RESPONSE
        </text>
        <text
          x="530"
          y="24"
          textAnchor="middle"
          fill={MUTED}
          fontSize="12"
          letterSpacing="1.5"
        >
          LAGGED MEMORY
        </text>
        {[130, 320].map((y) => (
          <g key={y}>
            <path
              d={`M211 ${y} L481 ${y}`}
              fill="none"
              stroke={MUTED}
              strokeWidth="1.5"
              strokeDasharray="6 6"
              markerEnd={`url(#${id}-delay)`}
            />
            <text
              x="345"
              y={y - 10}
              textAnchor="middle"
              fill={MUTED}
              fontSize="11"
            >
              one-step delay →
            </text>
          </g>
        ))}
        {edges.map(({ target, source, path }) => {
          const coefficient = matrix[target][source];
          const key = `${target}-${source}`;
          const selected = selectedEdge === key;
          const color =
            coefficient > 0 ? POSITIVE : coefficient < 0 ? NEGATIVE : LINE;
          return (
            <g key={key}>
              {selected && (
                <path
                  d={path}
                  fill="none"
                  stroke={color}
                  strokeWidth="10"
                  opacity="0.13"
                />
              )}
              <path
                d={path}
                fill="none"
                stroke={color}
                strokeWidth={selected ? "3.6" : "2.3"}
                strokeDasharray={coefficient === 0 ? "2 6" : undefined}
                markerEnd={
                  coefficient === 0
                    ? undefined
                    : `url(#${id}-${coefficient > 0 ? "positive" : "negative"})`
                }
              />
            </g>
          );
        })}
        <CurrentNode
          x={150}
          y={130}
          name="Sₜ"
          value={state[0]}
          compact={compact}
        />
        <CurrentNode
          x={150}
          y={320}
          name="Bₜ"
          value={state[1]}
          compact={compact}
        />
        <MemoryNode
          x={530}
          y={130}
          name="Sₜ₋₁"
          value={previous[0]}
          compact={compact}
        />
        <MemoryNode
          x={530}
          y={320}
          name="Bₜ₋₁"
          value={previous[1]}
          compact={compact}
        />
        {edges.map((edge) => (
          <CoefficientLabel
            key={`${edge.target}-${edge.source}`}
            {...edge}
            coefficient={matrix[edge.target][edge.source]}
            contribution={
              matrix[edge.target][edge.source] * previous[edge.source]
            }
            selected={selectedEdge === `${edge.target}-${edge.source}`}
            compact={compact}
          />
        ))}
      </svg>
      {!compact && (
        <div className="edge-legend" aria-label="Weighted lag links">
          {edges.map(({ target, source }) => {
            const key = `${target}-${source}`;
            const coefficient = matrix[target][source];
            const content = (
              <>
                <strong>
                  {names[source]}
                  <sub>t−1</sub> → {names[target]}
                  <sub>t</sub>
                </strong>
                <span>
                  {number(coefficient, true)} × {number(previous[source], true)}{" "}
                  = {number(coefficient * previous[source], true)}
                  {coefficient === 0 ? " · absent link" : ""}
                </span>
              </>
            );
            return onSelectEdge ? (
              <button
                key={key}
                type="button"
                aria-pressed={selectedEdge === key}
                onClick={() => onSelectEdge(key)}
                style={{
                  "--edge-color": coefficient < 0 ? NEGATIVE : POSITIVE,
                }}
              >
                {content}
              </button>
            ) : (
              <div
                key={key}
                style={{
                  "--edge-color": coefficient < 0 ? NEGATIVE : POSITIVE,
                }}
              >
                {content}
              </div>
            );
          })}
        </div>
      )}
      <figcaption className="diagram-caption">
        Solid arrows multiply a previous value by a coefficient. Dashed arrows
        record a one-step delay; they do not represent instantaneous causal
        effects.
        {compact ? "" : " The initial shock at t = 0 is imposed separately."}
      </figcaption>
    </figure>
  );
}

export function ARMemoryNetwork({
  phi1 = 0.8,
  phi2 = -0.3,
  values = [0, 0, 0],
}) {
  const id = `memory-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  if (![phi1, phi2].every(Number.isFinite) || !validVector(values, 3)) {
    return (
      <DiagramError>
        The memory diagram needs finite coefficients and three finite values.
      </DiagramError>
    );
  }
  return (
    <figure className="flow-network ar-memory-network">
      <svg
        viewBox="0 0 680 290"
        role="img"
        aria-labelledby={`${id}-title ${id}-description`}
        style={{ display: "block", width: "100%", height: "auto" }}
      >
        <title id={`${id}-title`}>
          A second-order autoregressive model with two memory cells
        </title>
        <desc id={`${id}-description`}>
          The current value equals {number(phi1, true)} times the value one step
          ago plus {number(phi2, true)} times the value two steps ago, plus the
          current innovation. Dashed unit-delay arrows lead from the current
          ellipse to the first memory diamond, then to the second diamond. Solid
          coefficient arrows return from both diamonds to the current ellipse.
        </desc>
        <ArrowDefinitions id={id} />
        <path
          d="M196 200 L301 200"
          fill="none"
          stroke={MUTED}
          strokeWidth="1.5"
          strokeDasharray="6 6"
          markerEnd={`url(#${id}-delay)`}
        />
        <path
          d="M399 200 L521 200"
          fill="none"
          stroke={MUTED}
          strokeWidth="1.5"
          strokeDasharray="6 6"
          markerEnd={`url(#${id}-delay)`}
        />
        <text x="249" y="223" textAnchor="middle" fill={MUTED} fontSize="11">
          one-step delay
        </text>
        <text x="460" y="223" textAnchor="middle" fill={MUTED} fontSize="11">
          one-step delay
        </text>
        {[
          { coefficient: phi1, path: "M326 178 C280 101 200 101 163 170" },
          { coefficient: phi2, path: "M570 155 C550 2 149 2 131 165" },
        ].map(({ coefficient, path }, index) => (
          <path
            key={index}
            d={path}
            fill="none"
            stroke={
              coefficient > 0 ? POSITIVE : coefficient < 0 ? NEGATIVE : LINE
            }
            strokeWidth="2.5"
            strokeDasharray={coefficient === 0 ? "2 6" : undefined}
            markerEnd={
              coefficient === 0
                ? undefined
                : `url(#${id}-${coefficient > 0 ? "positive" : "negative"})`
            }
          />
        ))}
        <CurrentNode x={135} y={200} name="yₜ" value={values[0]} />
        <MemoryNode x={350} y={200} name="yₜ₋₁" value={values[1]} />
        <MemoryNode x={570} y={200} name="yₜ₋₂" value={values[2]} />
        <CoefficientLabel
          x={246}
          y={105}
          name="φ₁"
          coefficient={phi1}
          contribution={phi1 * values[1]}
        />
        <CoefficientLabel
          x={395}
          y={37}
          name="φ₂"
          coefficient={phi2}
          contribution={phi2 * values[2]}
        />
      </svg>
      <figcaption className="diagram-caption">
        Two lag diamonds retain two different past values. The dashed chain
        shifts memory by exactly one step; φ₁ and φ₂ weight separate return
        paths.
      </figcaption>
    </figure>
  );
}

function linePath(values, x, y) {
  return values
    .map(
      (value, index) =>
        `${index ? "L" : "M"}${x(index).toFixed(2)} ${y(value).toFixed(2)}`,
    )
    .join(" ");
}

function niceStep(range, ticks = 5) {
  const raw = range / ticks;
  const power = 10 ** Math.floor(Math.log10(raw || 1));
  const fraction = raw / power;
  return (
    (fraction <= 1
      ? 1
      : fraction <= 2
        ? 2
        : fraction <= 2.5
          ? 2.5
          : fraction <= 5
            ? 5
            : 10) * power
  );
}

/** Each optional band is {low, median, high} for one variable at a time index. */
export function TimeSeriesChart({
  series = [],
  time = 0,
  mode = "rates",
  yLabel = "Response (arbitrary units)",
  bands,
  height = 330,
}) {
  const id = `series-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  const cleanSeries = Array.isArray(series)
    ? series
        .filter(
          (item) =>
            item &&
            typeof item.name === "string" &&
            Array.isArray(item.values) &&
            item.values.length > 0 &&
            item.values.every(Number.isFinite),
        )
        .map((item, index) => ({
          ...item,
          values: item.values.slice(0, 201),
          color: item.color || COLORS[index % COLORS.length],
        }))
    : [];
  if (!cleanSeries.length)
    return (
      <DiagramError>
        No finite response series is available to plot.
      </DiagramError>
    );
  const length = Math.max(...cleanSeries.map((item) => item.values.length));
  const cleanBands =
    Array.isArray(bands) &&
    bands.length >= length &&
    bands
      .slice(0, length)
      .every(
        (item) =>
          item &&
          [item.low, item.median, item.high].every(Number.isFinite) &&
          item.low <= item.median &&
          item.median <= item.high,
      )
      ? bands.slice(0, length)
      : null;
  const values = cleanSeries.flatMap((item) => item.values);
  if (cleanBands)
    values.push(...cleanBands.flatMap((item) => [item.low, item.high]));
  let low = Math.min(0, ...values);
  let high = Math.max(0, ...values);
  if (high === low) {
    low = -1;
    high = 1;
  } else {
    const padding = (high - low) * 0.09;
    low -= padding;
    high += padding;
  }
  const step = niceStep(high - low);
  low = Math.floor(low / step) * step;
  high = Math.ceil(high / step) * step;
  const yTicks = Array.from(
    { length: Math.min(12, Math.round((high - low) / step) + 1) },
    (_, index) => low + index * step,
  );
  const left = 88;
  const right = 652;
  const top = 32;
  const bottom = 262;
  const x = (index) =>
    left + (index / Math.max(1, length - 1)) * (right - left);
  const y = (value) => bottom - ((value - low) / (high - low)) * (bottom - top);
  const selected = Math.max(
    0,
    Math.min(length - 1, Math.round(Number.isFinite(time) ? time : 0)),
  );
  const xTickCount = Math.min(5, Math.max(1, length - 1));
  const xTicks = [
    ...new Set(
      Array.from({ length: xTickCount + 1 }, (_, index) =>
        Math.round((index * (length - 1)) / xTickCount),
      ),
    ),
  ];
  const bandPath = cleanBands
    ? `${linePath(
        cleanBands.map((item) => item.high),
        x,
        y,
      )} ${cleanBands
        .map((item, index) => [index, item.low])
        .reverse()
        .map(
          ([index, value]) => `L${x(index).toFixed(2)} ${y(value).toFixed(2)}`,
        )
        .join(" ")} Z`
    : "";
  const description = cleanSeries
    .map(
      (item) =>
        `${item.name} at t = ${selected}: ${number(item.values[Math.min(selected, item.values.length - 1)], true)}`,
    )
    .join(". ");

  return (
    <figure className="time-series-chart">
      <div className="chart-legend" aria-label="Series key">
        {cleanSeries.map((item, index) => (
          <span key={`${item.name}-${index}`}>
            <svg width="29" height="12" viewBox="0 0 29 12" aria-hidden="true">
              <line
                x1="1"
                x2="28"
                y1="6"
                y2="6"
                stroke={item.color}
                strokeWidth="2.7"
                strokeDasharray={DASHES[index % DASHES.length]}
              />
            </svg>
            {item.name}
          </span>
        ))}
        {cleanBands && (
          <span>
            <svg width="29" height="12" aria-hidden="true">
              <rect
                x="1"
                y="1"
                width="27"
                height="10"
                fill={cleanSeries[0].color}
                opacity="0.16"
              />
            </svg>
            10th–90th percentile band
          </span>
        )}
      </div>
      <svg
        viewBox="0 0 680 330"
        width="680"
        height={height}
        role="img"
        aria-labelledby={`${id}-title ${id}-description`}
        style={{ display: "block", width: "100%", height: "auto" }}
      >
        <title id={`${id}-title`}>
          {mode === "cumulative"
            ? "Cumulative additive responses"
            : "Response over time"}
        </title>
        <desc id={`${id}-description`}>
          {yLabel}. Time runs from 0 through {length - 1}. {description}.{" "}
          {cleanBands
            ? "The shaded band is a pointwise range of simulated outcomes, not a parameter confidence interval."
            : ""}
        </desc>
        <defs>
          <clipPath id={`${id}-clip`}>
            <rect
              x={left - 1}
              y={top - 1}
              width={right - left + 2}
              height={bottom - top + 2}
            />
          </clipPath>
        </defs>
        {yTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={left}
              x2={right}
              y1={y(tick)}
              y2={y(tick)}
              stroke={Math.abs(tick) < step * 1e-7 ? INK : LINE}
              strokeWidth={Math.abs(tick) < step * 1e-7 ? "1.2" : "1"}
              strokeDasharray={Math.abs(tick) < step * 1e-7 ? undefined : "2 5"}
            />
            <text
              x={left - 12}
              y={y(tick) + 4}
              textAnchor="end"
              fill={MUTED}
              fontSize="11"
              className="plot-tick"
            >
              {number(Math.abs(tick) < step * 1e-7 ? 0 : tick)}
            </text>
          </g>
        ))}
        {xTicks.map((tick) => (
          <g key={tick}>
            <line
              x1={x(tick)}
              x2={x(tick)}
              y1={bottom}
              y2={bottom + 5}
              stroke={MUTED}
            />
            <text
              x={x(tick)}
              y={bottom + 22}
              textAnchor="middle"
              fill={MUTED}
              fontSize="12"
              className="plot-tick"
            >
              {tick}
            </text>
          </g>
        ))}
        <line x1={left} x2={left} y1={top} y2={bottom} stroke={LINE} />
        <text
          x="20"
          y={(top + bottom) / 2}
          transform={`rotate(-90 20 ${(top + bottom) / 2})`}
          textAnchor="middle"
          fill={INK}
          fontSize="12"
          className="plot-label"
        >
          {yLabel}
        </text>
        <text
          x={(left + right) / 2}
          y="316"
          textAnchor="middle"
          fill={INK}
          fontSize="12"
          className="plot-label"
        >
          Time step t
        </text>
        <g clipPath={`url(#${id}-clip)`}>
          {cleanBands && (
            <path d={bandPath} fill={cleanSeries[0].color} fillOpacity="0.13" />
          )}
          {cleanSeries.map((item, index) => (
            <path
              key={`${item.name}-${index}`}
              d={linePath(item.values, x, y)}
              fill="none"
              stroke={item.color}
              strokeWidth="2.6"
              strokeDasharray={DASHES[index % DASHES.length]}
              strokeLinecap="round"
              strokeLinejoin="round"
            />
          ))}
          <line
            x1={x(selected)}
            x2={x(selected)}
            y1={top}
            y2={bottom}
            stroke={INK}
            strokeWidth="1"
            strokeDasharray="3 4"
            opacity="0.6"
          />
          {cleanSeries.map(
            (item, index) =>
              selected < item.values.length && (
                <circle
                  key={`${item.name}-${index}`}
                  cx={x(selected)}
                  cy={y(item.values[selected])}
                  r="4.5"
                  fill="var(--panel, #fbfcf8)"
                  stroke={item.color}
                  strokeWidth="2.5"
                />
              ),
          )}
        </g>
        <rect
          x={Math.max(left, Math.min(right - 52, x(selected) - 26))}
          y="7"
          width="52"
          height="19"
          rx="4"
          fill={INK}
        />
        <text
          x={Math.max(left + 26, Math.min(right - 26, x(selected)))}
          y="21"
          textAnchor="middle"
          fill="#ffffff"
          fontSize="11"
        >
          t = {selected}
        </text>
      </svg>
      <div className="chart-readout" aria-live="off">
        <strong>At t = {selected}</strong>
        {cleanSeries.map((item, index) => (
          <span key={`${item.name}-${index}`}>
            {item.name}:{" "}
            <b>
              {selected < item.values.length
                ? number(item.values[selected], true)
                : "no observation"}
            </b>
          </span>
        ))}
        {cleanBands && (
          <span>
            Pointwise band:{" "}
            <b>
              {number(cleanBands[selected].low)} to{" "}
              {number(cleanBands[selected].high)}
            </b>
          </span>
        )}
      </div>
      <figcaption className="diagram-caption">
        {mode === "cumulative"
          ? "Cumulative values add responses from t = 0 through the selected horizon; they are not compounded returns."
          : "The initial shock occurs at t = 0. The vertical cursor marks the selected time step."}
        {cleanBands
          ? " Shading shows the 10th–90th percentile across simulated paths, conditional on fixed parameters."
          : ""}
      </figcaption>
    </figure>
  );
}

export function StabilityPlane({
  matrix = [
    [0.25, -0.25],
    [-0.25, 0.25],
  ],
}) {
  const id = `stability-${useId().replace(/[^a-zA-Z0-9_-]/g, "")}`;
  if (!validMatrix(matrix))
    return (
      <DiagramError>
        The stability plane needs a finite 2 × 2 update matrix.
      </DiagramError>
    );
  const roots = eigenvalues2(matrix);
  const radius = Math.max(...roots.map((root) => root.modulus));
  const extent = Math.max(1.3, radius * 1.18);
  const scale = 125 / extent;
  const x = (re) => 200 + re * scale;
  const y = (im) => 160 - im * scale;
  const status =
    radius < 1 - 1e-9
      ? "All eigenvalues are inside the unit circle: asymptotically stable."
      : radius > 1 + 1e-9
        ? "An eigenvalue is outside the unit circle: the system has an unstable direction."
        : "An eigenvalue lies on the unit circle: boundary behavior needs a separate check.";
  const sameRoots =
    Math.hypot(roots[0].re - roots[1].re, roots[0].im - roots[1].im) < 1e-8;
  const closeRoots =
    Math.hypot(x(roots[0].re) - x(roots[1].re), y(roots[0].im) - y(roots[1].im)) < 55;
  const rootLabels = roots.map((root, index) => ({
    x: Math.max(35, Math.min(358, x(root.re) + 14)),
    y: Math.max(32, Math.min(298, closeRoots
      ? index === 0
        ? Math.min(...roots.map((value) => y(value.im))) - 18
        : Math.max(...roots.map((value) => y(value.im))) + 28
      : y(root.im) + (root.im < 0 ? 23 : -12))),
  }));
  return (
    <figure className="stability-plane">
      <svg
        viewBox="0 0 400 335"
        role="img"
        aria-labelledby={`${id}-title ${id}-description`}
        style={{ display: "block", width: "100%", height: "auto" }}
      >
        <title id={`${id}-title`}>Eigenvalues in the complex plane</title>
        <desc id={`${id}-description`}>
          {status} The spectral radius is {number(radius)}. The horizontal axis
          is the real part and the vertical axis is the imaginary part. The
          shaded disk has radius one.
        </desc>
        <circle
          cx="200"
          cy="160"
          r={scale}
          fill="#eaf0ed"
          stroke="#7b998b"
          strokeWidth="1.5"
          strokeDasharray="5 5"
        />
        <line
          x1="44"
          x2="356"
          y1="160"
          y2="160"
          stroke={MUTED}
          strokeWidth="1"
        />
        <line
          x1="200"
          x2="200"
          y1="19"
          y2="302"
          stroke={MUTED}
          strokeWidth="1"
        />
        {[-1, 1].map((tick) => (
          <g key={tick}>
            <line x1={x(tick)} x2={x(tick)} y1="156" y2="164" stroke={MUTED} />
            <text
              x={x(tick)}
              y="179"
              textAnchor="middle"
              fill={MUTED}
              fontSize="11"
              className="plot-tick"
            >
              {tick}
            </text>
            <line x1="196" x2="204" y1={y(tick)} y2={y(tick)} stroke={MUTED} />
            <text
              x="189"
              y={y(tick) + 4}
              textAnchor="end"
              fill={MUTED}
              fontSize="11"
              className="plot-tick"
            >
              {tick}i
            </text>
          </g>
        ))}
        <text x="363" y="164" fill={INK} fontSize="13" className="plot-label">
          Re
        </text>
        <text x="211" y="23" fill={INK} fontSize="13" className="plot-label">
          Im
        </text>
        <text x="191" y="178" textAnchor="end" fill={MUTED} fontSize="11">
          0
        </text>
        <text x="200" y="326" textAnchor="middle" fill={MUTED} fontSize="11">
          Dashed boundary: |λ| = 1
        </text>
        {roots.map((root, index) => (
          <g key={index}>
            {closeRoots && (
              <line
                x1={x(root.re) + 5}
                y1={y(root.im) + (index === 0 ? -7 : 7)}
                x2={rootLabels[index].x - 3}
                y2={rootLabels[index].y + (index === 0 ? 3 : -13)}
                stroke={TEXT_COLORS[index]}
                strokeWidth="1"
                opacity="0.7"
              />
            )}
            <circle
              cx={x(root.re)}
              cy={y(root.im)}
              r={sameRoots && index === 1 ? 11 : 6}
              fill={sameRoots && index === 1 ? "none" : COLORS[index]}
              stroke={sameRoots && index === 1 ? COLORS[index] : "#fff"}
              strokeWidth="2"
            />
            <text
              x={rootLabels[index].x}
              y={rootLabels[index].y}
              fill={TEXT_COLORS[index]}
              fontSize="14"
              fontWeight="600"
            >
              λ{index + 1}
            </text>
          </g>
        ))}
      </svg>
      <div className="stability-readings">
        {roots.map((root, index) => (
          <p key={index}>
            <strong>λ{index + 1}</strong> = {number(root.re)}
            {Math.abs(root.im) > 1e-10
              ? ` ${root.im < 0 ? "−" : "+"} ${number(Math.abs(root.im))}i`
              : ""}
            <span>
              {" "}
              · |λ{index + 1}| = {number(root.modulus)}
            </span>
          </p>
        ))}
        <p>
          <strong>Spectral radius ρ = {number(radius)}</strong>
        </p>
      </div>
      <figcaption className="diagram-caption">
        {status} Discrete-time stability depends on eigenvalue modulus,
        including both real and imaginary parts.
      </figcaption>
    </figure>
  );
}

export function MatrixDisplay({ matrix, labels = ["Stocks", "Bonds"] }) {
  if (!validMatrix(matrix))
    return (
      <DiagramError>
        A finite 2 × 2 coefficient matrix is required.
      </DiagramError>
    );
  return (
    <div className="matrix-display">
      <table className="matrix-table">
        <caption>
          Φ: rows are current targets; columns are lagged sources.
        </caption>
        <thead>
          <tr>
            <th scope="col">Target ↓ / source →</th>
            {labels.slice(0, 2).map((label) => (
              <th key={label} scope="col">
                {label}
                <sub>t−1</sub>
              </th>
            ))}
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, target) => (
            <tr key={target}>
              <th scope="row">
                {labels[target]}
                <sub>t</sub>
              </th>
              {row.map((value, source) => (
                <td key={source}>{number(value, true)}</td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
