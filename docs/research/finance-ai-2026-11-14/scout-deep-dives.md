# Five exhibit concepts grounded in selected full-text review

As of 2026-11-14. These are **selected-section full-text reviews**, not claims that every appendix of each paper has been read. Original PDFs and extracted text are private under `confidential/research/finance-ai-2026-11-14/`; `.source.json` files preserve URL, hash, page count and acquisition date. Page references below are **physical PDF pages, starting at 1**. Concepts are original educational proposals, not reported experimental findings. Citation rank is outside this scout's scope.

## 1. Can ChatGPT Forecast Stock Price Movements? — SSRN 4412788

**Read source:** [arXiv PDF](https://arxiv.org/pdf/2304.07619), acquired as v6 dated 2025-10-28, draft 2025-10-30, 142 pages. SHA-256 `a410e809cfffc39badcfb46bad31021aad3573f7f1800365507fb3fa6f8c3ca8`. Selected sections 3, 6, 8–9 and Tables 1–4; physical pp. 9–12, 17–24, 33–36, 51–55. SSRN metadata currently describes a later revision. The arXiv v5 HTML has inconsistent displayed dates/body; do not mix it with the acquired v6 PDF.

**Source finding and limits:** The paper separates recognition of an initial price reaction from prediction of later drift. Table 1, physical p.51, defines the reported hit rate as profitable **portfolio days**, not correct individual-stock guesses. High initial-reaction accuracy is not an executable post-news trading result. Section 6.2, physical pp.19–20, makes timing, turnover and transaction costs consequential; Section 8 treats adoption-related decline as suggestive rather than causal proof.

**Proposed experience: “You understood the news. Did you arrive in time?”** Begin with a sealed news card and a timeline. The visitor predicts direction and places an execution flag. Reveal the announcement and price jump; every part of the move before the flag is visibly locked away. A second strip shows only the residual drift. The emotional turn is realizing that correct interpretation and a successful trade are different achievements.

Then give three controlled levers: processing delay, trading cost, and the fraction of other investors with equal information-processing ability. A synchronized cumulative-value chart and an information-in-price gauge answer two different questions. Use fixed, clearly labeled synthetic paths for this lab; if reconstructed empirical portfolio statistics are shown, display them separately with the exact version and definitions. Avoid inventing latency-level empirical returns not estimated in the paper.

**Learning check:** Present two strategies: one with a 90% reaction-alignment statistic and one with much lower post-news accuracy. Ask which statistic answers an executable trading question and what additional information is missing. Transfer to earnings announcements: a prediction can be correct and already priced.

**Implementation feasibility:** High. Browser-local timelines, predefined signals, deterministic costs and a small information-diffusion model suffice. No live headlines or external model calls required. Do not reproduce commercial RavenPack/CRSP data without rights.

## 2. AI-Powered Trading, Algorithmic Collusion, and Price Efficiency — SSRN 4452704

**Read source:** [NYU-hosted author PDF](https://pages.stern.nyu.edu/~jhasbrou/SternMicroMtg/Old/SternMicroMtg2024/Papers/AI-powered%20trading%2C%20collusion%20and%20efficiency%2097.pdf), draft 2024-03-10, 84 pages. SHA-256 `30e3368370828be6bdf9e8a3775e868ce7c27748bca7d184c13fdf153dbc02d3`. Selected sections 2, 4–7, including physical pp.10–13, 24–35, 39, 44–50, 52, 57, 60–64. Figure 7, physical p.51, visually inspected. This precedes the 2025 SSRN/NBER revision.

**Source finding and limits:** The simulated informed traders can sustain supra-competitive outcomes through price-trigger responses or through similar learning biases. Section 5 and Figure 7 separate these mechanisms; the noise relationship is nonmonotonic. This is a modeled possibility, not empirical evidence of actual market misconduct. Section 4.8, physical pp.31–32, reports extremely long training runs and no general convergence guarantee.

**Proposed experience: “Two trading bots, no conversation.”** Open with two silent desks, each seeing private value and public price but not the other's order. Ask whether competition must eliminate excess profits. Show orders as separate streams meeting a market maker; reveal profits alongside price informativeness so that private success can coexist with poorer public information.

The central visual is a **two-mechanism landscape**. Move a noise dial from quiet to chaotic. At low noise, inject a one-period profitable deviation and watch the partner's next-period response. At high noise, open the Q-value ledger: an aggressive action had a bad streak, stopped being tried, and retained a pessimistic estimate. Add a “force a new experiment” button to test the belief. The visitor discovers that similar outcomes can arise from strategic discipline or from mistaken beliefs.

A second exercise gives one bot better memory while the other stays unchanged, then improves both. Ask for the direction of each bot's profit before revealing the comparison. This teaches an equilibrium effect, not “smarter AI always earns more.” Use a precomputed, version-verified policy set for exact demonstrations, or an explicitly labeled reduced teaching game. Never call a few seconds of browser training a replication of the paper's converged experiments.

**Learning check:** Given only high profits and low order aggressiveness, ask whether the mechanism is identified. Require the visitor to choose a deviation/forced-exploration experiment that distinguishes the explanations.

**Implementation feasibility:** Medium. Mechanism storytelling is exceptional; exact numerical replication is expensive. A staged deterministic reconstruction is affordable, while a claim to reproduce all results is not.

## 3. Accuracy of Explanations of Machine Learning Models for Credit Decisions — SSRN 4144780

**Read source:** [Banco de España Working Paper 2222 PDF](https://www.bde.es/f/webbde/SES/Secciones/Publicaciones/PublicacionesSeriadas/DocumentosTrabajo/22/Files/dt2222e.pdf), June 2022, 45 pages. SHA-256 `eec17f16cff4b8030753594d6ae9d7db7bcff1bb044deb0f9fce7d544daf2b7b`. Selected introduction, sections 4–7, physical pp.7–9, 15–34; Figure 3/Table 5, physical p.28, visually inspected. Internal article numbering and institutional page footer differ; cite physical pages explicitly. Extraction contains overlapping duplicated text, so inspect formulas and tables visually.

**Source finding and limits:** The authors generate synthetic credit-style datasets with controlled feature importance and compare global explanations with that benchmark. They evaluate SHAP and permutation importance for XGBoost and neural nets. Section 6/Table 5 distinguishes whole-ranking performance from top-feature performance; section 7 limits generalization, particularly for more correlated features. The constructed importance benchmark is not proof of causality in real lending data.

**Proposed experience: “Can you audit an explanation?”** Visitors first act as the data-generating “oracle,” setting overlap, noise, missingness and contamination for five unnamed applicant features. They then hide the controls and inspect a model's prediction quality and a confident explanation. Before revealing the oracle settings, they rank the features and place a confidence token beside their answer.

A **ranking conveyor** aligns the true ordering with the explanation's ordering. A whole-ranking meter may look reassuring while a spotlight on the top two features reveals a consequential swap. Move the spotlight depth to make the difference tangible. Beside it, keep prediction accuracy and explanation agreement as independent instruments; neither is allowed to impersonate the other.

Introduce a correlated proxy only in a separately labeled extension. Let users watch importance move between two near-substitutes while the prediction barely changes. Explain which attribution definition is being used. For a lean implementation, use a small model with an exact, inspectable coalition calculation; do not label a generic feature-weight chart as SHAP or claim it reproduces XGBoost results.

**Learning check:** Present an excellent classifier whose explanation misidentifies its strongest feature. Ask which property has failed, and what ground truth would be needed to establish that failure in a real dataset. Transfer to model governance and adverse-action explanations without prescribing a lending decision.

**Implementation feasibility:** Very high for a five-feature teaching reconstruction. No personal borrower data, live lending system or expensive model required. This paper naturally supplies an experiment where the learner can know the answer and test the explanation.

## 4. Can ChatGPT Decipher Fedspeak? — SSRN 4399406

**Read source:** [Federal Reserve conference PDF](https://resources.newyorkfed.org/medialibrary/media/research/conference/2023/FinTech/400pm_Hansen_Paper_Kazinnik_2023.pdf?hash=9B1647BD6876D0F3959C6919BA3F82DE&sc_lang=en), Anne Lundgaard Hansen and Sophia Kazinnik, 2023-08-05, 41 pages. SHA-256 `5f12dfdf463538ad1e8c8e744f70a4b1326329aa2bc058d3f730b7822edabade`. Selected sections 3–5 and Tables 1–4; physical pp.6–14, 20–21, 28–30. Current SSRN author name appears as Anne Artrip; preserve the identity on the reviewed version. Historical assertions about model release dates/parameter counts in this draft should not be reused as current facts.

**Source finding and limits:** The study labels sentences on a five-level policy-stance scale, using multiple human reviewers. Table 2 makes disagreement and class imbalance visible. Tables 3–4 report that stronger relative NLP performance need not mean near-perfect absolute classification. The narrative-identification exercise requires careful human problem definition; policy stance and an identified exogenous policy shock are different objects.

**Proposed experience: “The hawk, the dove, and the disagreement.”** Put a short, verified FOMC sentence on a card. The visitor chooses a stance and confidence before seeing three human labels and the historical model label. Instead of a single green/red truth stamp, display the label distribution. The reveal makes “ground truth” itself a subject of inquiry.

Next, let users rewrite only a negation or conditional phrase while a transparent dictionary counter and a curated context-aware interpretation respond. Label invented sentences as teaching examples and prerecorded model outputs as historical outputs. A compact confusion matrix updates as users choose the class distribution: overall accuracy and balanced accuracy diverge when hawkish examples are rare.

The advanced panel lays two paths side by side: **describe policy language** and **identify a policy shock**. Ask which information is needed to distinguish a response to bad economic news from an independent policy tightening. This prevents a sentiment classifier from becoming a causal-inference machine through attractive animation.

**Learning check:** Give two statements with the same negative words but different conditional structure, then a high-accuracy majority-class classifier. Ask what each fails to understand.

**Implementation feasibility:** Very high. Curated federal statements, human-label distributions and deterministic metrics make a static interactive exhibit feasible. Exact historic model outputs require the original sample/labels or a separately identified reconstruction.

## 5. Financial Statement Analysis with Large Language Models — SSRN 4835311

**Read source:** [arXiv v1 PDF](https://arxiv.org/pdf/2407.17866v1), draft 2024-05-20, posted arXiv 2024-07-25, 54 pages. SHA-256 `6d420c56ded67ea9d246901ca60e010ba7253dd3d682c043c806d1cec6f09cd9`. Selected methodology, benchmark, leakage, portfolio sections and tables: physical pp.11–25, 28–29, 48–54. Read the reviewed version, not a press summary. This is an early paper version; later scrutiny/revisions should be checked before exhibit implementation.

**Source finding and limits:** The authors compare earnings-direction predictions from anonymized statements, human consensus and ML benchmarks. Table 2 separates simple prompting from structured analysis; Table 4 makes specialized neural-net benchmarks essential. Sections 6.1 and Table 6 report memory and out-of-training-window checks, which are evidence for the study's design, not a universal guarantee against leakage. Table 8 shows that portfolio weighting changes benchmark comparisons.

**Proposed experience: “The nameless company.”** Visitors see a balanced, synthetic income statement and balance sheet, with years labeled t−2, t−1 and t. They pick whether next year's earnings rise and justify the choice with one ratio. A second round introduces stepwise analysis cards: trend, ratio, economic interpretation, prediction. Only after a commitment does the exhibit reveal a predefined outcome and the benchmark panel.

Make a **bridge from arithmetic to judgment**: clicking a ratio highlights its exact numerator and denominator. The visitor can alter receivables or margins while the balance-sheet identity stays enforced; cash generation and reported earnings separate visibly. These are original synthetic exercises, not paper-estimated counterfactual causal effects.

Then unmask the brand name and ask whether confidence changes despite identical numbers. Finally show how changing equal weights to value weights alters the apparent winner in portfolio comparisons. Do not reproduce a “GPT beats all analysts” headline or treat a fluent rationale as verified internal reasoning. No live LLM calls are needed: curate contrasting analyses with traceable numerical correctness, and separately show historical study metrics.

**Learning check:** Ask why a model can outperform a human benchmark in one target/sample yet fail to dominate a specialized model, and why one-year earnings-direction accuracy is not the same as a return forecast.

**Implementation feasibility:** High for synthetic statements and benchmark exploration; real Compustat/IBES examples need data rights. The small financial-statement engine must maintain accounting identities and separate any teaching extension from the paper's estimates.

## Cross-paper editorial choice

For the first new exhibit, **credit explanation auditing** offers the cleanest knowable mechanism and inexpensive exact interaction; **news timing** offers the strongest immediate surprise and broad appeal. **Two silent trading bots** is the most distinctive centerpiece, with a larger reconstruction burden. **Fedspeak** is an accessible introduction to noisy labels and context. **The nameless company** connects numerical judgment to AI while creating a natural bridge to accounting and earnings quality.

A coherent mini-series could be: **read a signal → test its explanation → see what competition does to it**. End each exhibit with a fresh transfer question that changes the surface details while preserving the mechanism, and record the learner's revised prediction locally. Enjoyment should come from a resolved misconception and a new ability to explain, not a simulated profit counter.
