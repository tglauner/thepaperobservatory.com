import React, { useId, useMemo, useRef, useState } from "react";
import { jacobiEigen, simulateReturns } from "../lib/math.js";
import { COLORS, Icon } from "./ui.jsx";

const pathFrom = (points, close = false) =>
  points
    .map((p, i) => `${i ? "L" : "M"}${p[0].toFixed(2)},${p[1].toFixed(2)}`)
    .join(" ") + (close ? " Z" : "");

export function Ellipsoid({ values, vectors, dark = false, compact = false }) {
  const [rotation, setRotation] = useState([-0.52, 0.5]);
  const drag = useRef(null);
  const id = useId().replaceAll(":", "");
  const radius = values.map((v) => Math.sqrt(v / Math.max(...values)) * 165);
  function project(p) {
    const world = vectors.map((row) =>
      row.reduce((a, v, i) => a + v * p[i], 0),
    );
    const [az, el] = rotation;
    const x = world[0] * Math.cos(az) - world[1] * Math.sin(az);
    const yy = world[0] * Math.sin(az) + world[1] * Math.cos(az);
    return [260 + x, 188 - (yy * Math.sin(el) + world[2] * Math.cos(el))];
  }
  const curves = [];
  for (let j = 0; j < 14; j++) {
    const a = (j / 14) * Math.PI * 2;
    curves.push(
      Array.from({ length: 81 }, (_, i) => {
        const b = (i / 80) * Math.PI * 2;
        return project([
          radius[0] * Math.cos(b),
          radius[1] * Math.sin(b) * Math.cos(a),
          radius[2] * Math.sin(b) * Math.sin(a),
        ]);
      }),
    );
  }
  for (let j = 1; j < 11; j++) {
    const a = -Math.PI / 2 + (j / 11) * Math.PI;
    curves.push(
      Array.from({ length: 81 }, (_, i) => {
        const b = (i / 80) * Math.PI * 2;
        return project([
          radius[0] * Math.sin(a),
          radius[1] * Math.cos(a) * Math.cos(b),
          radius[2] * Math.cos(a) * Math.sin(b),
        ]);
      }),
    );
  }
  const origin = project([0, 0, 0]);
  return (
    <div
      className={`ellipsoid ${dark ? "dark" : ""} ${compact ? "compact" : ""}`}
    >
      <svg
        viewBox="0 0 520 380"
        role="img"
        aria-label="Rotatable covariance ellipsoid. Its long axis represents the principal component with the most variance."
        onPointerDown={(e) => {
          drag.current = [e.clientX, e.clientY, ...rotation];
          e.currentTarget.setPointerCapture(e.pointerId);
        }}
        onPointerMove={(e) => {
          if (drag.current)
            setRotation([
              drag.current[2] + (e.clientX - drag.current[0]) / 160,
              Math.max(
                -1.4,
                Math.min(
                  1.4,
                  drag.current[3] + (e.clientY - drag.current[1]) / 160,
                ),
              ),
            ]);
        }}
        onPointerUp={() => (drag.current = null)}
        onPointerCancel={() => (drag.current = null)}
      >
        <defs>
          <radialGradient id={`glow-${id}`}>
            <stop
              offset="0%"
              stopColor={dark ? "#84cdb2" : "#4d9589"}
              stopOpacity=".13"
            />
            <stop
              offset="100%"
              stopColor={dark ? "#84cdb2" : "#4d9589"}
              stopOpacity="0"
            />
          </radialGradient>
        </defs>
        <ellipse
          cx="260"
          cy="195"
          rx="230"
          ry="175"
          fill={`url(#glow-${id})`}
        />
        {[0, 1, 2].map((i) => {
          const p = [0, 0, 0];
          p[i] = radius[i] * 1.4;
          const q = p.map((v) => -v);
          const to = project(p);
          const color = dark
            ? ["#e4aa74", "#a2d5cb", "#c5b6e0"][i]
            : ["#9e5b23", "#2b7067", "#6e5996"][i];
          return (
            <g key={i}>
              <path
                d={pathFrom([project(q), to])}
                stroke={color}
                strokeWidth="1.4"
                strokeDasharray="4 4"
                opacity=".7"
              />
              <circle cx={to[0]} cy={to[1]} r="3" fill={color} />
              <text
                x={to[0] + 8}
                y={to[1] - 8}
                fill={color}
                fontSize="12"
                fontFamily="monospace"
              >
                PC {i + 1}
              </text>
            </g>
          );
        })}
        {curves.map((p, i) => (
          <path
            key={i}
            d={pathFrom(p, true)}
            fill="none"
            stroke={dark ? "#9bc6b4" : "#397b6e"}
            strokeWidth=".7"
            opacity={i % 3 === 0 ? ".65" : ".28"}
          />
        ))}
        <circle
          cx={origin[0]}
          cy={origin[1]}
          r="4"
          fill={dark ? "#e1edcf" : "#194e40"}
        />
      </svg>
      <div className="orbit-caption">
        <span>
          <Icon name="rotate" size={13} /> Drag to rotate
        </span>
        <div>
          <button
            aria-label="Rotate ellipsoid left"
            onClick={() => setRotation((r) => [r[0] - 0.2, r[1]])}
          >
            ←
          </button>
          <button
            aria-label="Rotate ellipsoid right"
            onClick={() => setRotation((r) => [r[0] + 0.2, r[1]])}
          >
            →
          </button>
          <button
            aria-label="Reset ellipsoid view"
            onClick={() => setRotation([-0.52, 0.5])}
          >
            <Icon name="reset" size={13} />
          </button>
        </div>
      </div>
    </div>
  );
}

export function Scatter({ covariance, rotated = false, showAxes = true }) {
  const id = useId().replaceAll(":", "");
  const eig = useMemo(() => jacobiEigen(covariance), [covariance]);
  const data = useMemo(
    () => simulateReturns(covariance, 230, 42),
    [covariance],
  );
  const points = rotated
    ? data.map((p) =>
        eig.vectors[0].map((_, i) =>
          p.reduce((sum, v, j) => sum + v * eig.vectors[j][i], 0),
        ),
      )
    : data;
  // A shared radial bound keeps every observation visible in either basis.
  const radialBound = Math.max(
    2 * Math.sqrt(eig.values[0]),
    ...data.map((p) => Math.hypot(...p)),
    3,
  );
  const scale = 137 / radialBound;
  const project = (p) => [240 + p[0] * scale, 175 - p[1] * scale];
  const ellipse = Array.from({ length: 81 }, (_, i) => {
    const t = (i / 80) * 2 * Math.PI;
    const f = [
      2 * Math.sqrt(eig.values[0]) * Math.cos(t),
      2 * Math.sqrt(Math.max(0, eig.values[1])) * Math.sin(t),
    ];
    return project(
      rotated ? f : eig.vectors.map((row) => row[0] * f[0] + row[1] * f[1]),
    );
  });
  return (
    <svg
      className="scatter-chart"
      viewBox="0 0 480 360"
      role="img"
      aria-label={`Synthetic return scatter in ${rotated ? "principal component" : "asset"} coordinates. Orange is the first principal component; teal is the second.`}
    >
      <defs>
        <clipPath id={id}>
          <rect x="40" y="25" width="400" height="300" />
        </clipPath>
      </defs>
      {[-3, -2, -1, 0, 1, 2, 3].map((i) => {
        const v = (i * radialBound) / 3;
        return (
          <g key={i}>
            <path
              d={`M${240 + v * scale} 25V325 M40 ${175 + v * scale}H440`}
              stroke="var(--line)"
              strokeWidth={i === 0 ? 1.3 : 0.65}
            />
            {i !== 0 && (
              <>
                <text
                  x={240 + v * scale}
                  y="341"
                  textAnchor="middle"
                  className="tick"
                >
                  {v.toFixed(1)}
                </text>
                <text
                  x="28"
                  y={179 - v * scale}
                  textAnchor="middle"
                  className="tick"
                >
                  {v.toFixed(1)}
                </text>
              </>
            )}
          </g>
        );
      })}
      <g clipPath={`url(#${id})`}>
        <path
          d={pathFrom(ellipse, true)}
          fill="#4d948a0b"
          stroke="#7ba79b"
          strokeDasharray="4 4"
        />
        {points.map((p, i) => {
          const q = project(p);
          return (
            <circle
              key={i}
              cx={q[0]}
              cy={q[1]}
              r="2.5"
              fill="#397e72"
              opacity=".48"
            />
          );
        })}
        {showAxes &&
          [0, 1].map((i) => {
            const v = rotated
              ? [i === 0 ? 1 : 0, i === 1 ? 1 : 0]
              : [eig.vectors[0][i], eig.vectors[1][i]];
            const length = 2.5 * Math.sqrt(eig.values[i]);
            return (
              <path
                key={i}
                d={pathFrom([
                  project(v.map((x) => -x * length)),
                  project(v.map((x) => x * length)),
                ])}
                stroke={COLORS[i]}
                strokeWidth="2.5"
              />
            );
          })}
      </g>
      <text x="240" y="358" textAnchor="middle" className="axis-label">
        {rotated ? "Principal component 1" : "Asset A return"} · Asset A
        volatility units
      </text>
      <text
        transform="translate(12 175) rotate(-90)"
        textAnchor="middle"
        className="axis-label"
      >
        {rotated ? "Principal component 2" : "Asset B return"}
      </text>
    </svg>
  );
}

export function GeometryChart({ rho, a, b }) {
  const id = useId().replaceAll(":", "");
  const phi = Math.acos(rho);
  const minX = Math.min(0, a, b * rho, a + b * rho),
    maxX = Math.max(0, a, b * rho, a + b * rho);
  const scale = Math.min(
    9,
    315 / Math.max(1, maxX - minX),
    195 / Math.max(1, b * Math.sin(phi)),
  );
  const origin = [70 - minX * scale + (315 - (maxX - minX) * scale) / 2, 270];
  const A = [origin[0] + a * scale, origin[1]];
  const B = [
    origin[0] + b * scale * Math.cos(phi),
    origin[1] - b * scale * Math.sin(phi),
  ];
  const total = [A[0] + B[0] - origin[0], B[1]];
  const arc = [origin[0] + 40 * Math.cos(phi), origin[1] - 40 * Math.sin(phi)];
  return (
    <svg
      className="geometry-chart"
      viewBox="0 0 480 360"
      role="img"
      aria-label={`Two weighted risk vectors with angle ${((phi * 180) / Math.PI).toFixed(1)} degrees. Their sum is portfolio risk.`}
    >
      <defs>
        {["a", "b", "c"].map((x, i) => (
          <marker
            key={x}
            id={`${id}-${x}`}
            viewBox="0 0 10 10"
            refX="8"
            refY="5"
            markerWidth="5"
            markerHeight="5"
            orient="auto-start-reverse"
          >
            <path
              d="M0 0L10 5L0 10z"
              fill={[COLORS[0], COLORS[1], "#193e35"][i]}
            />
          </marker>
        ))}
      </defs>
      <pattern
        id={`${id}-grid`}
        width="28"
        height="28"
        patternUnits="userSpaceOnUse"
      >
        <circle cx="1" cy="1" r=".7" fill="#ccd3c9" />
      </pattern>
      <rect x="20" y="20" width="440" height="300" fill={`url(#${id}-grid)`} />
      <path
        d={pathFrom([A, total, B])}
        fill="none"
        stroke="#aeb9ae"
        strokeDasharray="4 5"
      />
      {[
        [A, "a", COLORS[0]],
        [B, "b", COLORS[1]],
        [total, "c", "#193e35"],
      ].map(([to, key, color]) => (
        <path
          key={key}
          d={pathFrom([origin, to])}
          stroke={color}
          strokeWidth={key === "c" ? 3 : 2.5}
          markerEnd={`url(#${id}-${key})`}
        />
      ))}
      {phi > 0.03 && phi < Math.PI - 0.03 && (
        <path
          d={`M${origin[0] + 40},${origin[1]} A40 40 0 ${phi > Math.PI ? 1 : 0} 0 ${arc[0]},${arc[1]}`}
          fill="none"
          stroke="#8c968c"
        />
      )}
      <circle cx={origin[0]} cy={origin[1]} r="4" fill="#193e35" />
      <text x={A[0] + 5} y={A[1] + 23} fill="#9e5b23" className="vector-label">
        wₐσₐ
      </text>
      <text x={B[0] - 12} y={B[1] - 12} fill="#2b7067" className="vector-label">
        wᵦσᵦ
      </text>
      <text
        x={total[0] + 8}
        y={total[1] - 15}
        fill="#193e35"
        className="vector-label"
      >
        σ portfolio
      </text>
      <text x="28" y="345" className="axis-label">
        Vector lengths represent weighted volatility. Angle φ = arccos(ρ).
      </text>
    </svg>
  );
}

export function Donut({ shares, center, subtitle }) {
  let offset = 0;
  return (
    <div className="donut-wrap">
      <svg
        viewBox="0 0 220 220"
        role="img"
        aria-label={`Effective uncorrelated bets: ${center}. Mode variance shares: ${shares.map((s) => (s * 100).toFixed(1) + "%").join(", ")}.`}
      >
        <circle
          cx="110"
          cy="110"
          r="83"
          fill="none"
          stroke="var(--line)"
          strokeWidth="20"
        />
        {shares.map((s, i) => {
          const start = offset;
          offset += s;
          return (
            <circle
              key={i}
              cx="110"
              cy="110"
              r="83"
              fill="none"
              stroke={COLORS[i % 3]}
              strokeWidth="20"
              pathLength="1"
              strokeDasharray={`${Math.max(0, s - 0.008)} 1`}
              strokeDashoffset={-start}
              transform="rotate(-90 110 110)"
            />
          );
        })}
        <text x="110" y="110" textAnchor="middle" className="donut-number">
          {center}
        </text>
        <text x="110" y="134" textAnchor="middle" className="donut-subtitle">
          {subtitle}
        </text>
      </svg>
    </div>
  );
}

export function LineChart({
  series,
  labels = ["Concentrated", "Equal mode risk"],
  xLabel = "PC1 volatility multiplier",
  yLabel = "Portfolio volatility / baseline",
  formatX = (x) => `${x.toFixed(1)}×`,
}) {
  const colors = ["#c67a39", "#3d8c83", "#8373a8"];
  const all = series.flat();
  const xmin = Math.min(...all.map((p) => p[0]));
  const xmax = Math.max(...all.map((p) => p[0]));
  const ymax = Math.max(1.1, ...all.map((p) => p[1])) * 1.08;
  const xy = (p) => [
    55 + ((p[0] - xmin) / (xmax - xmin || 1)) * 430,
    300 - (p[1] / ymax) * 250,
  ];
  return (
    <div className="line-chart">
      <svg
        viewBox="0 0 520 355"
        role="img"
        aria-label={labels
          .map(
            (name, i) =>
              `${name}: ${series[i][0][1].toFixed(2)} to ${series[i].at(-1)[1].toFixed(2)} times baseline volatility`,
          )
          .join("; ")}
      >
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <path d={`M55 ${300 - t * 250}H485`} stroke="var(--line)" />
            <text x="43" y={304 - t * 250} textAnchor="end" className="tick">
              {(ymax * t).toFixed(1)}×
            </text>
          </g>
        ))}
        {[0, 0.25, 0.5, 0.75, 1].map((t) => (
          <g key={t}>
            <text x={55 + 430 * t} y="321" textAnchor="middle" className="tick">
              {formatX(xmin + t * (xmax - xmin))}
            </text>
          </g>
        ))}
        {series.map((points, i) => (
          <path
            key={i}
            d={pathFrom(points.map(xy))}
            fill="none"
            stroke={colors[i]}
            strokeWidth="2.8"
          />
        ))}
        <text x="270" y="350" textAnchor="middle" className="axis-label">
          {xLabel}
        </text>
        <text
          transform="translate(14 170) rotate(-90)"
          textAnchor="middle"
          className="axis-label"
        >
          {yLabel}
        </text>
      </svg>
      <div className="chart-legend">
        {labels.map((l, i) => (
          <span key={l}>
            <i style={{ background: colors[i] }} />
            {l}
          </span>
        ))}
      </div>
    </div>
  );
}

export function Heatmap({ matrix, labels = ["A", "B"], title = "Covariance" }) {
  return (
    <div className="heatmap">
      <span className="overline">{title}</span>
      <table>
        <caption className="sr-only">{title} matrix</caption>
        <thead>
          <tr>
            <th />
            <>
              {labels.map((l) => (
                <th scope="col" key={l}>
                  {l}
                </th>
              ))}
            </>
          </tr>
        </thead>
        <tbody>
          {matrix.map((row, i) => (
            <tr key={i}>
              <th scope="row">{labels[i]}</th>
              {row.map((v, j) => (
                <td
                  key={j}
                  style={{
                    background:
                      v < 0
                        ? `rgba(198,122,57,${Math.min(0.55, Math.abs(v) * 0.35 + 0.03)})`
                        : `rgba(61,140,131,${Math.min(0.55, Math.abs(v) * 0.35 + 0.03)})`,
                  }}
                >
                  {Math.abs(v) < 0.00001 ? "0.000" : v.toFixed(3)}
                </td>
              ))}
            </tr>
          ))}
        </tbody>
      </table>
    </div>
  );
}
