import React, { useEffect, useId, useRef, useState } from "react";
import {
  evidence,
  glossary,
  limitations,
  quiz,
  readingList,
} from "../data/content.js";
import { DeepDive, Formula, Icon, NextChapter, Note, Source } from "./ui.jsx";

const QUIZ_STORAGE_KEY = "risk-observatory.quiz.v1";

function ReadingHeader({ chapter, title, intro, children }) {
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
      {children && <div className="header-meta">{children}</div>}
    </header>
  );
}

export function EvidencePage({ advanced = false, onNext }) {
  return (
    <>
      <ReadingHeader
        chapter="05 / READING THE SOURCE"
        title="What the presentation tells us."
        intro="Read the original examples alongside the model. The central insight is that the amount of risk and the concentration of that risk answer different questions."
      >
        <Source page={2}>The central argument · slide 2</Source>
        <span className="synthetic-tag">SOURCE-REPORTED EXAMPLES</span>
      </ReadingHeader>

      <section
        className="panel reading-intro"
        aria-labelledby="source-context-title"
      >
        <div className="panel-header">
          <div>
            <div className="eyebrow">THE RESEARCH CONTEXT</div>
            <h2 id="source-context-title">
              Many holdings can share one exposure.
            </h2>
          </div>
          <Icon name="paper" size={26} />
        </div>
        <p>
          <em>Managing Risks in a Risk-On/Risk-Off Environment</em> is a
          50-slide presentation by Marcos López de Prado. It connects
          correlation geometry, principal components and information-theoretic
          measures of diversification.
        </p>
        <p>
          The idea is to express a portfolio as uncorrelated principal
          directions, then ask how evenly those directions contribute variance.
          A common-mode shock matters more when that mode already accounts for
          most of the portfolio’s risk.
        </p>
        <Note title="How to read this page">
          The figures below are rounded values reported in the presentation. The
          interactive chapters use synthetic inputs to explain the mechanism.
          Neither is a historical performance backtest.
        </Note>
      </section>

      <section aria-labelledby="evidence-cases-title">
        <div className="section-heading">
          <div>
            <div className="eyebrow">SIX SOURCE EXAMPLES</div>
            <h2 id="evidence-cases-title">
              Look past the headline correlation.
            </h2>
          </div>
          <span className="muted">Open a case for its context.</span>
        </div>
        <div className="reading-grid evidence-grid">
          {evidence.map((item, index) => (
            <article className="panel evidence-card" key={item.slide}>
              <div className="evidence-card-top">
                <span className="eyebrow">
                  CASE {String(index + 1).padStart(2, "0")}
                </span>
                <Source page={item.slide} />
              </div>
              <h3>{item.title}</h3>
              <p className="evidence-summary">{item.summary}</p>
              <details className="evidence-detail">
                <summary>
                  Read the example
                  <Icon name="arrow" size={15} />
                </summary>
                <p>{item.detail}</p>
              </details>
            </article>
          ))}
        </div>
      </section>

      <section className="panel" aria-labelledby="basket-methods-title">
        <div className="panel-header">
          <div>
            <div className="eyebrow">DIFFERENT BALANCING QUESTIONS</div>
            <h2 id="basket-methods-title">Four ways to build a basket.</h2>
          </div>
          <Source page={36}>Slides 36–40</Source>
        </div>
        <p>
          A balancing rule needs an object to balance. Equal contribution from
          assets does not automatically mean equal contribution from principal
          components.
        </p>
        <div
          className="table-scroll"
          tabIndex="0"
          role="region"
          aria-label="Comparison of portfolio balancing methods"
        >
          <table className="method-table">
            <caption className="sr-only">
              Balancing methods discussed in the source presentation
            </caption>
            <thead>
              <tr>
                <th scope="col">Method</th>
                <th scope="col">What it balances or optimizes</th>
                <th scope="col">Question to ask</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">
                  ERC <small>Equal Risk Contribution</small>
                </th>
                <td>
                  Equalizes Euler risk contributions from the original
                  instruments.
                </td>
                <td>
                  Do the assets contribute equally, and which common modes
                  remain?
                </td>
              </tr>
              <tr>
                <th scope="row">
                  MDR <small>Maximum Diversification Ratio</small>
                </th>
                <td>
                  Maximizes weighted standalone volatility divided by portfolio
                  volatility, under chosen constraints.
                </td>
                <td>
                  How much diversification does the covariance structure
                  provide?
                </td>
              </tr>
              <tr>
                <th scope="row">
                  DRP <small>Diversified Risk Parity</small>
                </th>
                <td>
                  Equalizes variance contributions from covariance principal
                  components.
                </td>
                <td>
                  Is modeled risk spread equally across the chosen eigenbasis?
                </td>
              </tr>
              <tr>
                <th scope="row">
                  MMSC <small>Mini-Max Subset Correlation</small>
                </th>
                <td>
                  In its hedging formulation, minimizes the worst correlation
                  with a leg or subset of legs.
                </td>
                <td>
                  Can a group of constituents dominate the basket’s exposure?
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <DeepDive advanced={advanced} title="Why these rules need not agree">
          <p>
            Asset contribution is{" "}
            <Formula>{String.raw`a_i=\frac{w_i(Vw)_i}{w^\top Vw}`}</Formula>;
            component contribution is{" "}
            <Formula>{String.raw`p_i=\frac{\lambda_i f_i^2}{\sum_j\lambda_j f_j^2}`}</Formula>
            . The first can be negative because instruments hedge one another.
            The second is nonnegative and supports the entropy calculation.
          </p>
          <p>
            For positive eigenvalues, DRP loadings satisfy{" "}
            <Formula>{String.raw`f_i\propto \frac{s_i}{\sqrt{\lambda_i}},\quad s_i\in\{-1,+1\}`}</Formula>
            . Signs, scale and portfolio constraints still require choices. The
            source also presents a trading version of subset balancing as a
            maximin problem. These methods are different design choices rather
            than a universal ranking.
          </p>
        </DeepDive>
      </section>

      <section
        className="panel limitations-panel"
        aria-labelledby="limitations-title"
      >
        <div className="panel-header">
          <div>
            <div className="eyebrow">READ WITH A RESEARCHER’S EYE</div>
            <h2 id="limitations-title">What the model leaves open.</h2>
          </div>
          <Icon name="info" size={25} />
        </div>
        <p>
          The framework makes concentration visible. Its interpretation still
          depends on the covariance estimate, the investment universe and the
          question being asked.
        </p>
        <div className="limitations-list">
          {limitations.map((item) => (
            <details key={item.title} className="limitation-item">
              <summary>
                {item.title}
                <span className="details-plus">+</span>
              </summary>
              <p>{item.text}</p>
            </details>
          ))}
        </div>
      </section>

      <section aria-labelledby="further-reading-title">
        <div className="section-heading">
          <div>
            <div className="eyebrow">GO TO THE ORIGINAL</div>
            <h2 id="further-reading-title">Continue the reading.</h2>
          </div>
        </div>
        <div className="source-list reading-grid">
          {readingList.map((item) => (
            <article className="panel source-card" key={item.url}>
              <div className="eyebrow">{item.author}</div>
              <h3>
                <a href={item.url} target="_blank" rel="noreferrer">
                  {item.title}
                  <Icon name="external" size={17} />
                </a>
              </h3>
              <p>{item.note}</p>
            </article>
          ))}
        </div>
      </section>
      {onNext && (
        <NextChapter
          onClick={onNext}
          number="06"
          label="Check your understanding"
        />
      )}
    </>
  );
}

function readAnswers() {
  try {
    const saved = JSON.parse(
      window.localStorage.getItem(QUIZ_STORAGE_KEY) || "{}",
    );
    if (!saved || typeof saved !== "object" || Array.isArray(saved)) return {};
    return Object.fromEntries(
      quiz
        .filter(
          (q) =>
            Number.isInteger(saved[q.id]) &&
            saved[q.id] >= 0 &&
            saved[q.id] < q.options.length,
        )
        .map((q) => [q.id, saved[q.id]]),
    );
  } catch {
    return {};
  }
}

export function QuizPage({ advanced = false, onProgress }) {
  const [answers, setAnswers] = useState(readAnswers);
  const progressCallback = useRef(onProgress);
  const answered = quiz.filter((q) => Number.isInteger(answers[q.id])).length;
  const score = quiz.filter((q) => answers[q.id] === q.correct).length;
  const finished = answered === quiz.length;

  useEffect(() => {
    progressCallback.current = onProgress;
  }, [onProgress]);
  useEffect(() => {
    progressCallback.current?.(score, answered);
  }, [score, answered]);
  useEffect(() => {
    try {
      window.localStorage.setItem(QUIZ_STORAGE_KEY, JSON.stringify(answers));
    } catch {
      /* The quiz also works without local storage. */
    }
  }, [answers]);

  function answer(id, index) {
    setAnswers((current) =>
      Number.isInteger(current[id]) ? current : { ...current, [id]: index },
    );
  }

  return (
    <>
      <ReadingHeader
        chapter="06 / CHECK YOUR UNDERSTANDING"
        title="Can you see the hidden bet?"
        intro="Eight questions connect the pictures to the mathematics. Choose an answer to reveal an explanation and a link back to the source."
      />

      <section
        className="panel quiz-summary"
        aria-labelledby="quiz-progress-title"
      >
        <div>
          <div className="eyebrow">YOUR PROGRESS</div>
          <h2 id="quiz-progress-title">
            {score} <span className="muted">/ {quiz.length} correct</span>
          </h2>
          <p aria-live="polite">
            {finished
              ? "All questions answered. Review the explanations or reset for another attempt."
              : `${answered} of ${quiz.length} questions answered. Your progress is saved in this browser when storage is available.`}
          </p>
          <progress
            max={quiz.length}
            value={answered}
            aria-label={`${answered} of ${quiz.length} questions answered`}
          />
        </div>
        <button
          className="button secondary-button"
          type="button"
          onClick={() => setAnswers({})}
          disabled={answered === 0}
        >
          <Icon name="reset" size={17} />
          Reset answers
        </button>
      </section>

      <div className="quiz-list">
        {quiz.map((item, questionIndex) => {
          const selected = answers[item.id];
          const hasAnswer = Number.isInteger(selected);
          const correct = selected === item.correct;
          return (
            <section
              className={`panel quiz-card ${hasAnswer ? "answered" : ""}`}
              key={item.id}
            >
              <div className="eyebrow">
                QUESTION {String(questionIndex + 1).padStart(2, "0")} /{" "}
                {String(quiz.length).padStart(2, "0")}
              </div>
              <fieldset
                aria-describedby={hasAnswer ? `${item.id}-feedback` : undefined}
              >
                <legend>{item.question}</legend>
                <div className="quiz-options">
                  {item.options.map((option, index) => {
                    const isSelected = selected === index;
                    const isCorrectOption = hasAnswer && item.correct === index;
                    return (
                      <button
                        className={`quiz-option ${isSelected ? "selected" : ""} ${isCorrectOption ? "correct" : ""} ${isSelected && !correct ? "incorrect" : ""}`}
                        type="button"
                        key={option}
                        disabled={hasAnswer}
                        aria-pressed={isSelected}
                        onClick={() => answer(item.id, index)}
                      >
                        <span className="option-letter" aria-hidden="true">
                          {String.fromCharCode(65 + index)}
                        </span>
                        <span>{option}</span>
                        {isCorrectOption && (
                          <span className="option-status">
                            <Icon name="check" size={17} />
                            <span className="sr-only">Correct answer</span>
                          </span>
                        )}
                        {isSelected && !correct && (
                          <span className="option-status">Your answer</span>
                        )}
                      </button>
                    );
                  })}
                </div>
              </fieldset>
              <div
                className="quiz-feedback-region"
                aria-live="polite"
                aria-atomic="true"
              >
                {hasAnswer && (
                  <div
                    className={`quiz-feedback ${correct ? "correct" : "incorrect"}`}
                    id={`${item.id}-feedback`}
                  >
                    <strong>
                      {correct ? "Correct." : "Review this idea."}
                    </strong>
                    <p>{item.explanation}</p>
                    <Source page={item.source} />
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
      <DeepDive advanced={advanced} title="One last research question">
        <p>
          Suppose two eigenvalues are exactly equal. You can rotate their
          eigenvectors within the shared subspace while leaving the covariance
          matrix unchanged. Would entropy computed from the individual component
          shares remain the same? In general, no. A diversification measure
          needs its basis and universe declared alongside it.
        </p>
        <p>
          For a practical extension, compare estimates across rolling windows,
          inspect eigenvalue gaps, and examine how leverage and portfolio
          constraints change the equal-component-risk solution.
        </p>
      </DeepDive>
    </>
  );
}

export function GlossaryDialog({ open, onClose, advanced = false }) {
  const dialogRef = useRef(null);
  const inputRef = useRef(null);
  const titleId = useId();
  const searchId = useId();
  const [query, setQuery] = useState("");

  useEffect(() => {
    const dialog = dialogRef.current;
    if (!dialog) return;
    if (open && !dialog.open) {
      setQuery("");
      dialog.showModal();
      inputRef.current?.focus();
    } else if (!open && dialog.open) dialog.close();
  }, [open]);

  const normalized = query.trim().toLocaleLowerCase();
  const terms = glossary.filter((item) =>
    `${item.term} ${item.definition} ${advanced ? item.advanced || "" : ""}`
      .toLocaleLowerCase()
      .includes(normalized),
  );

  function closeOnBackdrop(event) {
    if (event.target !== event.currentTarget) return;
    const bounds = event.currentTarget.getBoundingClientRect();
    if (
      event.clientX < bounds.left ||
      event.clientX > bounds.right ||
      event.clientY < bounds.top ||
      event.clientY > bounds.bottom
    )
      onClose?.();
  }

  return (
    <dialog
      ref={dialogRef}
      className="glossary-dialog"
      aria-labelledby={titleId}
      onKeyDownCapture={(event) => {
        if (event.key === "Escape") {
          event.preventDefault();
          event.stopPropagation();
          onClose?.();
        }
      }}
      onCancel={(event) => {
        event.preventDefault();
        onClose?.();
      }}
      onClose={() => {
        if (open) onClose?.();
      }}
      onClick={closeOnBackdrop}
    >
      <div className="glossary-header">
        <div>
          <div className="eyebrow">A WORKING VOCABULARY</div>
          <h2 id={titleId}>The language of risk.</h2>
        </div>
        <button
          type="button"
          className="icon-button"
          aria-label="Close glossary"
          onClick={() => onClose?.()}
        >
          <Icon name="close" size={23} />
        </button>
      </div>
      <div className="glossary-search">
        <label htmlFor={searchId}>Find a concept</label>
        <div className="glossary-search-field">
          <input
            id={searchId}
            ref={inputRef}
            type="search"
            value={query}
            onChange={(event) => setQuery(event.target.value)}
            placeholder="Try entropy, covariance or eigenvector"
            autoComplete="off"
          />
          {query && (
            <button
              type="button"
              className="text-button"
              onClick={() => {
                setQuery("");
                inputRef.current?.focus();
              }}
            >
              Clear
            </button>
          )}
        </div>
        <small role="status">
          {terms.length} of {glossary.length} concepts
          {advanced ? " · Includes graduate notes" : ""}
        </small>
      </div>
      <div className="glossary-body">
        {terms.length ? (
          <dl className="glossary-terms">
            {terms.map((item) => (
              <div key={item.term} className="glossary-term">
                <dt>{item.term}</dt>
                <dd>
                  <p>{item.definition}</p>
                  {advanced && item.advanced && (
                    <p className="glossary-advanced">
                      <span className="eyebrow">GRADUATE NOTE</span>
                      {item.advanced}
                    </p>
                  )}
                </dd>
              </div>
            ))}
          </dl>
        ) : (
          <div className="glossary-empty">
            <h3>No matching concepts.</h3>
            <p>
              Try a shorter term or clear the search to see all{" "}
              {glossary.length} definitions.
            </p>
          </div>
        )}
      </div>
    </dialog>
  );
}
