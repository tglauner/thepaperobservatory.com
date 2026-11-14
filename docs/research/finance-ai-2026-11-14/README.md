# Finance + AI papers on SSRN: discovery and exhibit ranking

As of **2026-11-14**. The requested date window is inclusive: **2021-11-14 through 2026-11-14**, using the user's local date. Eligibility is based on the earliest public release; SSRN posting, later revisions and publication dates are kept distinct.

## What this run can and cannot claim

This is a **citation-ranked candidate search**, not a verified list of the 100 most-cited eligible SSRN papers. The OpenAlex query used an SSRN source location and AI/finance terminology, returned 2,079 unique works before lexical screening, and retained 1,280 candidates across 12 query pages. The search was bounded and explicitly marked non-exhaustive; it cannot establish a global top 100.

The attached [citation-ranked candidate register](./citation-ranked-candidates-top-100.csv) contains the first 100 records from the finance-title search, sorted by OpenAlex's all-time `cited_by_count` for each OpenAlex work record. It is useful as a screening queue, not as 100 confirmed in-window finance-and-AI papers:

- **52** have a primary SSRN posted date verified inside the requested window.
- **1** is confirmed to have been posted before the window and must be excluded.
- **47** do not yet have a verified SSRN posted date.
- An in-window SSRN date does not prove that the work was not released earlier as an author manuscript or preprint; that first-public-release check remains open for the queue.
- Topic screening is incomplete for records not represented in the editorial review. A title/abstract keyword match is not proof of substantive finance-and-AI relevance.
- Counts are citations indexed to a single OpenAlex work record, retrieved on 2026-11-14. They are **all-time**, not citations received during the five-year window, and are not SSRN download/view counts. Counts are not added across versions or providers.

OpenAlex's publication-date filter was used to find candidates; it does not prove when a work first appeared. The register keeps this index date beside the primary SSRN date evidence so an old preprint with a later publication date is not silently treated as new. Do not describe the candidate CSV as a final "top 100" until coverage, eligibility, first-release dates and version groups have been reviewed.

## What was actually reviewed

The editorial review covers **52** selected records:

| Evidence state | Count | Interpretation |
|---|---:|---|
| Selected full-text sections reviewed | 20 | Methods/results and relevant qualifications were inspected; this does not mean every page or appendix was read. |
| Abstract or metadata only | 29 | Paper-specific score is provisional; next action is full-text review. |
| Front matter only | 3 | Paper-specific score is provisional; next action is to obtain and inspect the substantive text. |

The [editorial applicability ranking](./editorial-applicability-ranking.csv) sorts these records by the six-part exhibit rubric, independently of citation count. It retains component scores, confidence evidence, reading status, page anchors, proposed experiment and caveat. The 32 records not reviewed in full text have provisional scores; do not treat them as ready-to-build recommendations.

Five developed, selected-section briefs live in [scout-deep-dives.md](./scout-deep-dives.md). Original PDFs and extracted text are private; the public research files contain no copied abstracts or full-text excerpts.

The normalized ranking marks selected-section reviews as **medium evidence confidence / needs reproduction work** and abstract- or front-matter-only reviews as **low confidence / needs full text**. These are conservative workflow states, not judgments of scientific quality. The existing source review does not record an actual model/reasoning setting, so none is claimed here.

## Best exhibit opportunities

1. **Can ChatGPT Decipher Fedspeak? — “The hawk, the dove, and the disagreement.”** Highest reviewed applicability score (98/100). Ask a visitor to predict policy stance, reveal the distribution of human labels rather than a fictitious perfect truth, then change context and class prevalence to expose disagreement and accuracy-versus-balanced-accuracy tradeoffs. The transfer question separates describing policy language from identifying a causal policy shock. See physical PDF pages 6–14, 20–21 and 28–30 in the reviewed version.
2. **Credit-card fraud detection — “The 96% detector and the overflowing review queue.”** Score 97/100. Turn the source confusion matrix into transaction tiles, then allocate finite investigator capacity and vary a clearly labeled synthetic prevalence. Preserve the paper's inconsistent reported recall values rather than smoothing them into a fabricated threshold curve.
3. **Can ChatGPT forecast stock price movements? — “You understood the news. Did you arrive in time?”** Score 96/100. Commit to a direction, place an execution marker on a price timeline, then vary delay and cost. Keep the initial reaction distinct from subsequent drift and from executable returns.
4. **Deep reinforcement learning for trading — “Teach the trading agent the wrong reward.”** Score 95/100. Let the visitor change profit, turnover and cost penalties in a deterministic toy environment, inspect the learned policy and then reveal a regime shift. A browser toy is not a reproduction of the paper's TD3 experiment.
5. **Federated risk prediction for supply-chain finance — “The invoice knows something the company rating misses.”** Score 95/100. Distribute synthetic invoices across firms, vary unequal local sample sizes, and compare firm-level, local and federated updates. State that federated learning alone is not a formal privacy guarantee.

These are not five variants of a prediction dashboard: they teach label uncertainty, rare-event decision costs, information timing, objective misspecification and distributed evidence. A broader collection sequence can add financial statement analysis, graph representations and sentiment benchmarks after the first focused exhibit.

### Creative design alternatives considered

- **Fedspeak:** a language microscope (toggle negation/conditional wording), a label jury (show annotator disagreement), or a policy-weather timeline (aggregate stance through time). Choose the label jury with a small context microscope: it makes measurement uncertainty visible without implying that one wording edit caused a market outcome.
- **Fraud:** a ROC/dashboard, a cost ledger, or a triage queue of individual transactions. Choose the queue: it connects an imbalanced confusion matrix to the operational constraint a visitor can feel, while avoiding a fabricated empirical threshold curve.
- **News timing:** a model leaderboard, a backtest terminal, or a price timeline with an execution gate. Choose the timeline: the locked-in pre-arrival price move makes the paper's key distinction immediately legible without inventing trading returns.

For each exhibit, start with a prediction, change only a few consequential controls, show a deterministic and accessible consequence, explain the source mechanism, and finish with a new transfer case. Label paper findings separately from synthetic teaching extensions. Provide a Foundation path, an Advanced path with assumptions and equations, visible reset, keyboard operation and reduced-motion behavior.

## Search and scoring method

- Discovery source: OpenAlex works with the SSRN source location (`S4210172589`), searched across four AI/finance query families and paginated three pages per query. The exact requested dates and retrieval timestamps are preserved in `candidates-targeted.json` and `candidates-merged.json`.
- Candidate screening: lexical AI and finance terms in titles/abstracts, followed by human checks for the 52 reviewed records. Lexical matches outside that review remain unverified.
- Citation order: `cited_by_count` descending; ties use OpenAlex work ID ascending. One OpenAlex ID is the counted entity. No citation counts are summed across versions.
- Editorial rubric: explainable mechanism (25%), meaningful interaction (20%), misconception and transfer (20%), source fidelity (15%), reproduction feasibility (10%) and collection value (10%). Each component is rated 0–5; the weighted total is out of 100. Citation count does not affect the score.
- Status: `candidate_search`. A paper becomes a definitive exhibit recommendation only after full-text review supports its mechanism, evidence anchors, limits and a feasible faithful reconstruction.

The reusable workspace process is [discover-research-papers](../../../.agents/skills/discover-research-papers/SKILL.md). It is designed to add future source adapters without blending incomparable citation metrics or losing SSRN version history.

Regenerate the two CSVs from the preserved JSON evidence with:

```bash
python3 scripts/research/build_ssrn_exhibit_register.py \
  --research-dir docs/research/finance-ai-2026-11-14 \
  --limit 100
```

### Follow-up lead outside the first 100

[(Generative) AI in Financial Economics, SSRN 5287110](https://ssrn.com/abstract=5287110) appears at candidate rank 173 with 33 OpenAlex citations in this search snapshot; the SSRN page reports posting on 2025-06-13 and revision on 2026-10-07. It is a potentially useful finance-field map, but it is not in the first-100 candidate excerpt and has not received a full-text review in this run.

## Next research pass

1. Verify first public release, SSRN posted date, substantive finance-and-AI scope and version family for candidates beyond this top-100 queue; exclude confirmed out-of-window and off-topic works.
2. Expand the verified candidate universe until at least 100 eligible records are supported, if the available index coverage permits it. Otherwise report the actual shortfall rather than relaxing the criteria.
3. Read source sections for the strongest remaining candidates and update provisional scores only when the evidence and caveats are inspected.
4. Re-run the citation snapshot from the same provider and metric, then record any rank movement separately from editorial applicability.
5. For future sources, implement source-specific adapters first; keep source-native ranks separate unless a documented normalization is justified.
