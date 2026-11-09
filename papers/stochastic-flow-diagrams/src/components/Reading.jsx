import React, { useEffect, useId, useRef, useState } from "react";
import {
  evidence,
  glossary,
  limitations,
  quiz,
  readingList,
} from "../data/content.js";
import { DeepDive, Formula, Icon, NextChapter, Note, Source } from "./ui.jsx";

const QUIZ_STORAGE_KEY = "flow-observatory.quiz.v1";

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
        title="Read the paper, question the model."
        intro="Stochastic flow diagrams turn specified dynamic equations into a readable network. The graph helps us follow a shock; the equations and assumptions still determine what it means."
      >
        <Source page={2}>Article opening · journal p. 21</Source>
        <span className="synthetic-tag">
          SOURCE MODELS · EXPLICIT RECONSTRUCTIONS
        </span>
      </ReadingHeader>

      <section
        className="panel reading-intro"
        aria-labelledby="source-context-title"
      >
        <div className="panel-header">
          <div>
            <div className="eyebrow">THE RESEARCH CONTEXT</div>
            <h2 id="source-context-title">
              A language for memory and feedback.
            </h2>
          </div>
          <Icon name="paper" size={26} />
        </div>
        <p>
          <em>Stochastic flow diagrams</em>, by Neil J. Calkin and Marcos López
          de Prado, appeared in <em>Algorithmic Finance</em> in 2014, on journal
          pages 21–42. The supplied PDF includes a journal cover before the
          22-page article.
        </p>
        <p>
          The contribution is a way to represent time-series systems: current
          variables become ellipses, lagged values become memory diamonds, and
          signed weighted arrows show the terms of the equations. This makes
          delayed propagation and repeated reverberation easier to discuss.
        </p>
        <Note title="How to read the evidence">
          The source supplies stylized Stocks/Bonds coefficient matrices. The
          lab reconstructs their responses with an explicit time-zero
          convention, and labels other examples as synthetic. These examples are
          not fitted market data or a historical performance backtest.
        </Note>
      </section>

      <section aria-labelledby="evidence-cases-title">
        <div className="section-heading">
          <div>
            <div className="eyebrow">SIX SOURCE CONNECTIONS</div>
            <h2 id="evidence-cases-title">From the page to the experiment.</h2>
          </div>
          <span className="muted">Open a case for its context.</span>
        </div>
        <div className="reading-grid evidence-grid">
          {evidence.map((item, index) => (
            <article className="panel evidence-card" key={item.title}>
              <div className="evidence-card-top">
                <span className="eyebrow">
                  CASE {String(index + 1).padStart(2, "0")}
                </span>
                <Source page={item.page}>Journal p. {item.printed}</Source>
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

      <section className="panel" aria-labelledby="model-families-title">
        <div className="panel-header">
          <div>
            <div className="eyebrow">READ THE ARCHITECTURE</div>
            <h2 id="model-families-title">Four views of a dynamic model.</h2>
          </div>
          <Source page={8}>Journal pp. 27–31</Source>
        </div>
        <p>
          The number of current variables, the number of memory slots and the
          presence of same-period effects tell you which kind of model the graph
          represents.
        </p>
        <div
          className="table-scroll"
          tabIndex="0"
          role="region"
          aria-label="Comparison of autoregressive and structural model families"
        >
          <table className="method-table">
            <caption className="sr-only">
              Time-series model families and their diagram features
            </caption>
            <thead>
              <tr>
                <th scope="col">Model</th>
                <th scope="col">What the diagram shows</th>
                <th scope="col">What the calculation needs</th>
              </tr>
            </thead>
            <tbody>
              <tr>
                <th scope="row">
                  AR(p)<small>One variable, p lags</small>
                </th>
                <td>
                  One current ellipse, p memory diamonds and coefficient links
                  returning to the current variable.
                </td>
                <td>
                  Add the effects of all p stored values and the new innovation.
                </td>
              </tr>
              <tr>
                <th scope="row">
                  VAR(1)<small>Several variables, one lag</small>
                </th>
                <td>
                  Several current ellipses, one lag diamond per variable, and
                  possible cross-variable lag links.
                </td>
                <td>
                  Compute every target from the old state with one coefficient
                  matrix.
                </td>
              </tr>
              <tr>
                <th scope="row">
                  VAR(p)<small>Several variables, p lags</small>
                </th>
                <td>
                  A memory chain for every variable, with coefficient links from
                  the required lag to each target.
                </td>
                <td>
                  Sum one matrix contribution per lag; use the companion system
                  for stability.
                </td>
              </tr>
              <tr>
                <th scope="row">
                  SVAR<small>Same-period effects included</small>
                </th>
                <td>
                  Additional connections between current ellipses, shown with
                  flat arrowheads in the paper.
                </td>
                <td>
                  Solve the simultaneous system and state the identifying
                  assumptions.
                </td>
              </tr>
            </tbody>
          </table>
        </div>
        <DeepDive
          advanced={advanced}
          title="The graph and the algebra must agree"
        >
          <Formula
            block
          >{String.raw`y_t=\sum_{k=1}^{p}\Phi_k y_{t-k}+\varepsilon_t`}</Formula>
          <p>
            Use column state vectors. Entry{" "}
            <Formula>{String.raw`(\Phi_k)_{ij}`}</Formula> links source variable
            j at lag k to target equation i. An arrow’s coefficient is separate
            from the contribution it carries: multiply the coefficient by the
            stored source value, then add the incoming contributions.
          </p>
          <p>
            For VAR(1), <Formula>{String.raw`r_h=\Phi^h s`}</Formula>. The entry{" "}
            <Formula>{String.raw`(\Phi^h)_{ij}`}</Formula> sums coefficient
            products across all length-h walks from j to i. Multiple routes can
            reinforce or cancel. This is a signed linear propagation rule,
            rather than a probability transition rule.
          </p>
          <p>
            A contemporaneous specification needs{" "}
            <Formula>{String.raw`(I-B_0)y_t=\sum_k A_k y_{t-k}+u_t`}</Formula>{" "}
            solved jointly when <Formula>{String.raw`I-B_0`}</Formula> is
            invertible. Drawing an arrow does not supply the structural
            assumptions needed for a causal interpretation.
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
            <h2 id="limitations-title">What the network leaves open.</h2>
          </div>
          <Icon name="info" size={25} />
        </div>
        <p>
          A diagram makes a specified system easier to inspect. Data,
          estimation, identification and the choice of model remain essential
          parts of the argument.
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
        title="Can you follow the shock?"
        intro={`${quiz.length} questions connect the network, its memory and its response. Choose an answer to reveal an explanation and the relevant journal page.`}
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
                    <Source page={item.source}>
                      Journal p. {item.source + 19}
                    </Source>
                  </div>
                )}
              </div>
            </section>
          );
        })}
      </div>
      <DeepDive advanced={advanced} title="One last research question">
        <p>
          Can an asymptotically stable system amplify a shock before it fades?
          Yes. Consider the synthetic matrix{" "}
          <Formula>{String.raw`\Phi=\begin{pmatrix}0.5&2\\0&0.5\end{pmatrix}`}</Formula>{" "}
          and shock <Formula>{String.raw`s=(0,1)^\top`}</Formula>. Its first
          response is <Formula>{String.raw`\Phi s=(2,0.5)^\top`}</Formula>, even
          though both eigenvalues equal 0.5 and every response eventually
          decays. Asymptotic stability and short-horizon amplification are
          different questions.
        </p>
        <p>
          For a research extension, compare impulse responses across estimated
          windows, inspect coefficient uncertainty and innovation covariance,
          and ask what assumptions would turn predictive links into identified
          intervention effects. A well-drawn network does not settle those
          questions on its own.
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
          <h2 id={titleId}>The language of dynamic systems.</h2>
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
            placeholder="Try shock, memory or stability"
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
