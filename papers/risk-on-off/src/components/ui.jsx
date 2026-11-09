import { sourceUrl } from "../../../../shared/catalog.js";
import React, { useId } from "react";
import katex from "katex";

export const COLORS = ["#c67a39", "#3d8c83", "#8373a8"];

export function Icon({ name = "arrow", size = 20, ...props }) {
  const paths = {
    arrow: (
      <>
        <path d="M5 12h14M13 6l6 6-6 6" />
      </>
    ),
    external: (
      <>
        <path d="M14 4h6v6M20 4l-9 9M10 5H5v14h14v-5" />
      </>
    ),
    home: (
      <>
        <circle cx="12" cy="12" r="8" />
        <ellipse cx="12" cy="12" rx="4" ry="8" />
        <path d="M4 12h16" />
      </>
    ),
    geometry: (
      <>
        <path d="M4 19V5l16 14H4zM4 14h5v5" />
      </>
    ),
    pca: (
      <>
        <path d="M3 19L20 4M3 4l17 15M4 12h16" />
        <circle cx="12" cy="12" r="3" />
      </>
    ),
    entropy: (
      <>
        <path d="M5 20V12M12 20V4M19 20V8" />
        <path d="M3 20h19" />
      </>
    ),
    shock: (
      <>
        <path d="M2 13h5l3-8 4 15 3-9h5" />
      </>
    ),
    paper: (
      <>
        <path d="M5 3h10l4 4v14H5zM14 3v5h5M8 12h8M8 16h8" />
      </>
    ),
    quiz: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M8.5 8a3.5 3.5 0 016 2c0 2-2.5 2-2.5 4M12 17h.01" />
      </>
    ),
    book: (
      <>
        <path d="M12 5c-3-2-6-2-9-1v15c3-1 6-1 9 1 3-2 6-2 9-1V4c-3-1-6-1-9 1v15" />
      </>
    ),
    reset: (
      <>
        <path d="M4 10a8 8 0 111 8M4 4v6h6" />
      </>
    ),
    check: <path d="M5 12l4 4L19 6" />,
    close: <path d="M6 6l12 12M6 18L18 6" />,
    menu: <path d="M4 6h16M4 12h16M4 18h16" />,
    download: (
      <>
        <path d="M12 3v12m-5-5l5 5 5-5M4 17v4h16v-4" />
      </>
    ),
    info: (
      <>
        <circle cx="12" cy="12" r="9" />
        <path d="M12 11v6M12 7h.01" />
      </>
    ),
    rotate: (
      <>
        <path d="M4 8a9 9 0 0116 2M20 4v6h-6M20 16a9 9 0 01-16-2M4 20v-6h6" />
      </>
    ),
    sun: (
      <>
        <circle cx="12" cy="12" r="4" />
        <path d="M12 2v2M12 20v2M2 12h2M20 12h2M5 5l1 1M18 18l1 1M5 19l1-1M18 6l1-1" />
      </>
    ),
  };
  return (
    <svg
      width={size}
      height={size}
      viewBox="0 0 24 24"
      fill="none"
      stroke="currentColor"
      strokeWidth="1.5"
      strokeLinecap="round"
      strokeLinejoin="round"
      aria-hidden="true"
      {...props}
    >
      {paths[name] || paths.arrow}
    </svg>
  );
}

export function Formula({ children, block = false }) {
  return (
    <span
      className={block ? "formula formula-block" : "formula"}
      dangerouslySetInnerHTML={{
        __html: katex.renderToString(children, {
          throwOnError: false,
          displayMode: block,
          output: "htmlAndMathml",
        }),
      }}
    />
  );
}

export function Source({ page, children }) {
  return (
    <a
      className="source-link"
      href={sourceUrl("risk-on-off", page, { local: import.meta.env.LOCAL_SOURCE_AVAILABLE === true })}
      target="_blank"
      rel="noreferrer"
    >
      {children || `Source · slide ${page}`}
      <Icon name="external" size={12} />
    </a>
  );
}

export function Range({
  label,
  value,
  onChange,
  min = 0,
  max = 100,
  step = 1,
  format = (v) => v,
  hint,
  ...rest
}) {
  const id = useId();
  return (
    <div className="range-field">
      <div className="range-label">
        <label htmlFor={id}>{label}</label>
        <output htmlFor={id}>{format(value)}</output>
      </div>
      <input
        id={id}
        type="range"
        min={min}
        max={max}
        step={step}
        value={value}
        onChange={(e) => onChange(Number(e.target.value))}
        style={{ "--fill": `${((value - min) / (max - min)) * 100}%` }}
        {...rest}
      />
      {hint && <small>{hint}</small>}
    </div>
  );
}

export function Segmented({
  options,
  value,
  onChange,
  label = "View",
  compact = false,
}) {
  return (
    <div
      className={`segmented ${compact ? "compact" : ""}`}
      role="group"
      aria-label={label}
    >
      {options.map((o) => (
        <button
          key={o.value}
          type="button"
          aria-pressed={value === o.value}
          className={value === o.value ? "selected" : ""}
          onClick={() => onChange(o.value)}
        >
          {o.label}
        </button>
      ))}
    </div>
  );
}

export function DeepDive({
  advanced,
  title = "Under the mathematics",
  children,
}) {
  return (
    <details className="deep-dive" open={advanced || undefined}>
      <summary>
        <span>
          <Icon name="pca" size={17} />
          {title}
        </span>
        <span className="details-plus">+</span>
      </summary>
      <div className="deep-content">{children}</div>
    </details>
  );
}

export function Note({ title = "What to notice", children, tone = "" }) {
  return (
    <div className={`note ${tone}`}>
      <span className="note-icon">
        <Icon name="info" size={18} />
      </span>
      <div>
        <strong>{title}</strong>
        <div>{children}</div>
      </div>
    </div>
  );
}

export function PageHeader({ chapter, title, intro, page, children }) {
  return (
    <header className="page-header">
      <div className="eyebrow">
        {chapter}
        <span className="eyebrow-line" />
      </div>
      <h1 tabIndex="-1" id="page-title">
        {title}
      </h1>
      <p>{intro}</p>
      <div className="header-meta">
        {page && <Source page={page} />}
        <span className="synthetic-tag">INTERACTIVE · SYNTHETIC DATA</span>
        {children}
      </div>
    </header>
  );
}

export function RiskBars({
  shares,
  labels = [
    "Principal component 1",
    "Principal component 2",
    "Principal component 3",
  ],
  compact = false,
}) {
  return (
    <div
      className={`risk-bars ${compact ? "compact" : ""}`}
      aria-label="Variance contribution by principal component"
    >
      {shares.map((s, i) => (
        <div className="risk-bar-row" key={i}>
          <div className="risk-bar-title">
            <span>
              <i style={{ background: COLORS[i % 3] }} />
              {labels[i]}
            </span>
            <strong>
              {(s * 100).toFixed(1)}
              <small>%</small>
            </strong>
          </div>
          <div className="bar-track">
            <div style={{ width: `${s * 100}%`, background: COLORS[i % 3] }} />
          </div>
        </div>
      ))}
    </div>
  );
}

export function Stat({ label, value, suffix, caption, accent = false }) {
  return (
    <div className={`stat ${accent ? "accent" : ""}`}>
      <span className="stat-label">{label}</span>
      <div className="stat-value">
        {value}
        <span>{suffix}</span>
      </div>
      {caption && <small>{caption}</small>}
    </div>
  );
}

export function NextChapter({ onClick, label, number }) {
  return (
    <button className="next-chapter" onClick={onClick}>
      <span>
        <small>KEEP EXPLORING · {number}</small>
        <strong>{label}</strong>
      </span>
      <Icon size={25} />
    </button>
  );
}
