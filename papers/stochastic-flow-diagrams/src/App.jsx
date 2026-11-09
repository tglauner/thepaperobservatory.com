import { ObservatoryNav, PaperContinuation } from "../../../shared/ObservatoryShell.jsx";
import { sourceUrl } from "../../../shared/catalog.js";
import React, { useCallback, useEffect, useRef, useState } from "react";
import { Icon, Segmented } from "./components/ui.jsx";
import {
  Overview,
  NetworkLab,
  ImpulseLab,
  FeedbackLab,
  MemoryLab,
  UncertaintyLab,
} from "./components/Labs.jsx";
import {
  EvidencePage,
  QuizPage,
  GlossaryDialog,
} from "./components/Reading.jsx";

const navigation = [
  { id: "overview", title: "One shock, many echoes", icon: "home" },
  { id: "network", title: "Read the diagram", number: "01", icon: "pca" },
  { id: "impulse", title: "Follow a shock", number: "02", icon: "shock" },
  {
    id: "feedback",
    title: "Change the feedback",
    number: "03",
    icon: "entropy",
  },
  { id: "memory", title: "Add a memory", number: "04", icon: "reset" },
  {
    id: "uncertainty",
    title: "Let new shocks arrive",
    number: "05",
    icon: "sun",
  },
  {
    id: "evidence",
    title: "The paper & its limits",
    number: "06",
    icon: "paper",
  },
  { id: "quiz", title: "Check your understanding", icon: "quiz" },
];
const validPage = (hash) =>
  navigation.some((n) => n.id === hash.slice(1)) ? hash.slice(1) : "overview";
function readPreference(key, fallback) {
  try {
    return JSON.parse(localStorage.getItem(key)) ?? fallback;
  } catch {
    return fallback;
  }
}
function savePreference(key, value) {
  try {
    localStorage.setItem(key, JSON.stringify(value));
  } catch {
    /* Browsing without storage remains fully usable. */
  }
}

export default function App() {
  const [page, setPage] = useState(() => validPage(location.hash));
  const [advanced, setAdvanced] = useState(
    () => readPreference("flow-observatory.advanced", false) === true,
  );
  const [glossary, setGlossary] = useState(false);
  const [mobile, setMobile] = useState(false);
  const [visited, setVisited] = useState(() => {
    const v = readPreference("flow-observatory.visited", []);
    return Array.isArray(v)
      ? v.filter((id) => navigation.some((n) => n.id === id))
      : [];
  });
  const [quizStatus, setQuizStatus] = useState([0, 0]);
  const first = useRef(true);
  const go = useCallback((id) => {
    if (navigation.some((n) => n.id === id)) {
      if (location.hash !== `#${id}`) location.hash = id;
      setPage(id);
      setMobile(false);
    }
  }, []);
  useEffect(() => {
    const change = () => {
      setPage(validPage(location.hash));
      setMobile(false);
    };
    window.addEventListener("hashchange", change);
    return () => window.removeEventListener("hashchange", change);
  }, []);
  useEffect(() => {
    setVisited((previous) => {
      const next = previous.includes(page) ? previous : [...previous, page];
      savePreference("flow-observatory.visited", next);
      return next;
    });
    document.title = `${navigation.find((n) => n.id === page).title} — The Flow Observatory`;
    if (first.current) {
      first.current = false;
      return;
    }
    window.scrollTo({ top: 0, behavior: "instant" });
    document.getElementById("page-title")?.focus({ preventScroll: true });
  }, [page]);
  useEffect(() => {
    savePreference("flow-observatory.advanced", advanced);
  }, [advanced]);
  useEffect(() => {
    if (!mobile || !window.matchMedia("(max-width: 760px)").matches) return;
    const sidebar = document.getElementById("learning-navigation");
    sidebar?.querySelector('[aria-current="page"]')?.focus();
    const handleKey = (event) => {
      if (event.key === "Escape") {
        setMobile(false);
        document.querySelector(".menu-button")?.focus();
      }
      if (event.key !== "Tab") return;
      const controls = [...sidebar.querySelectorAll("a, button")];
      const firstControl = controls[0];
      const lastControl = controls.at(-1);
      if (event.shiftKey && document.activeElement === firstControl) {
        event.preventDefault();
        lastControl?.focus();
      } else if (!event.shiftKey && document.activeElement === lastControl) {
        event.preventDefault();
        firstControl?.focus();
      }
    };
    window.addEventListener("keydown", handleKey);
    return () => window.removeEventListener("keydown", handleKey);
  }, [mobile]);
  const quizProgress = useCallback(
    (score, answered) => setQuizStatus([score, answered]),
    [],
  );
  const pages = {
    overview: <Overview advanced={advanced} go={go} />,
    network: <NetworkLab advanced={advanced} onNext={() => go("impulse")} />,
    impulse: <ImpulseLab advanced={advanced} onNext={() => go("feedback")} />,
    feedback: <FeedbackLab advanced={advanced} onNext={() => go("memory")} />,
    memory: <MemoryLab advanced={advanced} onNext={() => go("uncertainty")} />,
    uncertainty: (
      <UncertaintyLab advanced={advanced} onNext={() => go("evidence")} />
    ),
    evidence: <EvidencePage advanced={advanced} onNext={() => go("quiz")} />,
    quiz: <QuizPage advanced={advanced} onProgress={quizProgress} />,
  };
  const visitedLabs = visited.filter((id) =>
    ["network", "impulse", "feedback", "memory", "uncertainty"].includes(id),
  ).length;
  return (
    <>
      <a
        className="skip-link"
        href="#main-content"
        onClick={(event) => {
          event.preventDefault();
          const main = document.getElementById("main-content");
          main?.focus();
          main?.scrollIntoView({ block: "start" });
        }}
      >
        Skip to content
      </a>
      <aside
        id="learning-navigation"
        className={`sidebar ${mobile ? "is-open" : ""}`}
        aria-label="Learning navigation"
      >
        <a href="#overview" className="brand" onClick={() => go("overview")}>
          <span className="brand-mark">
            <Icon name="home" size={27} />
          </span>
          <span>
            THE FLOW
            <br />
            <strong>OBSERVATORY</strong>
          </span>
        </a>
        <div className="sidebar-description">
          Follow the shock
          <br />
          through the system.
        </div>
        <div className="nav-group-title">YOUR FIELD GUIDE</div>
        <nav>
          {navigation.map((n, i) => (
            <a
              key={n.id}
              href={`#${n.id}`}
              onClick={() => go(n.id)}
              aria-current={page === n.id ? "page" : undefined}
              className={`nav-link ${page === n.id ? "active" : ""} ${i === 6 ? "quiz-link" : ""}`}
            >
              <Icon name={n.icon} size={18} />
              <span>{n.title}</span>
              {n.number && <small>{n.number}</small>}
              {!n.number && n.id === "quiz" && quizStatus[1] > 0 && (
                <small>
                  {quizStatus[0]}/{quizStatus[1]}
                </small>
              )}
            </a>
          ))}
        </nav>
        <div className="sidebar-bottom">
          <a className="glossary-button" href="/">
            ← Paper library
          </a>
          <div className="learning-progress">
            <div>
              <span>YOUR EXPLORATION</span>
              <strong>{visitedLabs}/5</strong>
            </div>
            <div className="progress-track">
              <span style={{ width: `${(visitedLabs / 5) * 100}%` }} />
            </div>
            <small>Experiments visited · saved on this device</small>
          </div>
          <button
            className="glossary-button"
            onClick={() => {
              setGlossary(true);
              setMobile(false);
            }}
          >
            <Icon name="book" size={19} />
            <span>Open the glossary</span>
            <span>↗</span>
          </button>
          <div className="sidebar-footer">
            <span className="tg-monogram">TG</span>
            <div>
              AN EDUCATIONAL EXPLORATION
              <br />
              <strong>TG Investments & Research</strong>
            </div>
          </div>
        </div>
      </aside>
      {mobile && (
        <button
          className="mobile-backdrop"
          aria-label="Close navigation"
          onClick={() => setMobile(false)}
        />
      )}
      <div className="app-main">
        <ObservatoryNav slug="stochastic-flow-diagrams" />
        <header className="topbar">
          <button
            className="menu-button"
            aria-label={mobile ? "Close navigation" : "Open navigation"}
            aria-expanded={mobile}
            aria-controls="learning-navigation"
            onClick={() => setMobile(!mobile)}
          >
            <Icon name={mobile ? "close" : "menu"} />
          </button>
          <div className="breadcrumb">
            <span>FIELD GUIDE</span>
            <span>/</span>
            <strong>{navigation.find((n) => n.id === page).title}</strong>
          </div>
          <div className="audience-control">
            <span>LEARNING DEPTH</span>
            <Segmented
              compact
              label="Learning depth"
              options={[
                { value: "foundation", label: "Foundation" },
                { value: "advanced", label: "Advanced" },
              ]}
              value={advanced ? "advanced" : "foundation"}
              onChange={(v) => setAdvanced(v === "advanced")}
            />
          </div>
          <a
            className="top-source"
            href={sourceUrl("stochastic-flow-diagrams", undefined, { local: import.meta.env.LOCAL_SOURCE_AVAILABLE === true })}
            target="_blank"
            rel="noreferrer"
          >
            Source paper
            <Icon name="external" size={14} />
          </a>
        </header>
        <main
          id="main-content"
          tabIndex="-1"
          className={`content page-${page}`}
          key={page}
        >
          {pages[page]}
        </main>
        <PaperContinuation slug="stochastic-flow-diagrams" />
        <footer className="site-footer">
          <span>
            THE FLOW OBSERVATORY <span className="footer-dot">·</span> A visual
            learning companion
          </span>
          <span>
            Dynamic models. Source-linked ideas.
            <button onClick={() => setGlossary(true)}>
              Glossary <Icon name="external" size={12} />
            </button>
          </span>
        </footer>
      </div>
      <GlossaryDialog
        open={glossary}
        onClose={() => setGlossary(false)}
        advanced={advanced}
      />
    </>
  );
}
