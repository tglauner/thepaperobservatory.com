# The Risk Observatory

The first paper website in [The Paper Observatory](../../README.md). It explains **Managing Risks in a Risk-On/Risk-Off Environment** by Marcos López de Prado (SSRN 2150877), a 50-slide research presentation. Its central lesson is that portfolio risk size and risk concentration answer different questions.

This folder contains the complete original site: source PDF, React application, public reading copy, numerical/content tests, analysis and generated build. Shared dependencies, architecture, agent configuration, privacy rules and status lifecycle remain at the collection root.

## Open through the collection

From the collection root:

```bash
npm ci
npm start
```

Open **http://127.0.0.1:5173/risk-on-off/**. The root URL is now the library homepage. Installation is shared; run `npm ci` at the collection root, rather than maintaining a second paper-specific lockfile.

## Run this paper independently

From the collection root:

```bash
npm run dev --workspace papers/risk-on-off -- --open
```

Or, from this paper directory after the root installation:

```bash
npm run dev -- --open
```

The direct URL is **http://127.0.0.1:5174/risk-on-off/**. Control-C stops it. The collection launcher already uses this port while it is running, so stop that launcher before starting another direct instance.

## Explore the site

| Chapter | Experiment |
| --- | --- |
| The big picture | Rotate the covariance ellipsoid and compare portfolio risk stories. |
| Correlation geometry | Change correlation, asset volatilities and capital weights; inspect the risk-vector sum. |
| Find the hidden bets | Rotate one synthetic return cloud into principal-component coordinates and inspect both covariance matrices. |
| Measure concentration | Change signed exposures; compare equal capital with DRP, effective bets and normalized entropy. |
| Stress the system | Shock mode volatility, optionally rotate risk axes, and download a synthetic scenario JSON. |
| The evidence & limits | Read six source examples, compare balancing methods and inspect limitations. |
| Check your understanding | Answer eight source-linked questions with feedback and saved progress. |

Foundation develops undergraduate intuition. Advanced opens derivations and qualifications about covariance rank, eigenspace degeneracy, dependence, Rayleigh bounds and unconstrained DRP. The glossary has 16 concepts. Learning preferences and quiz answers use the `risk-observatory` browser namespace, independent from the second paper. Direct-port storage is separate from the collection origin.

## Source and mathematical boundaries

- `ssrn-2150877.pdf` is preserved in this folder. `public/paper.pdf` is a byte-identical reading copy. Source links use physical PDF pages matching the slide numbers.
- Reported futures examples are rounded illustrations, without a reproduced performance backtest.
- Interactive observations and covariance inputs are explicitly synthetic.
- Uncorrelated components need not be independent, and entropy depends on the declared basis and universe.
- A 2× mode-volatility multiplier is a 4× eigenvalue multiplier. The site is a covariance teaching experiment, without a live regime classifier.

See [the paper analysis](docs/paper-analysis.md). The [author-hosted balanced-baskets paper](https://www.davidhbailey.com/dhbpapers/trading-baskets.pdf) provides further reading.

## Validate and preview

From the collection root:

```bash
npm test --workspace papers/risk-on-off
npm run build --workspace papers/risk-on-off
npm run preview --workspace papers/risk-on-off
```

The native risk suite has **56 passing tests**. Direct built preview is **http://127.0.0.1:4174/risk-on-off/**. The same commands without workspace flags work from this paper folder. Root `npm run check` validates both papers and assembles the library; root `npm run preview` then serves this site at **http://127.0.0.1:4173/risk-on-off/**.

```bash
curl --fail --head http://127.0.0.1:4174/risk-on-off/
curl --fail --head http://127.0.0.1:4174/risk-on-off/paper.pdf
```

The retained [original QA report](docs/qa-report.md), JSON record and screenshots describe the first site's standalone implementation **before the collection migration**. Its old port-5173 root URLs are historical. Current prefixed-route and collection regression results belong to the [workspace QA report](../../docs/qa-report.md).

## Files and deployment

`src/lib/math.js` owns the deterministic numerical engine, `src/components/` the labs/charts/readings, and `src/data/content.js` the educational content. `tests/` validates models and provenance; `docs/` records analysis and historical architecture/QA context. Current shared architecture is [at collection root](../../docs/architecture/ARCHITECTURE.md).

For a future collection deployment, publish only assembled root `dist/` and preserve `/risk-on-off/`. The retained `infra/` references record the earlier standalone layout; use the current collection architecture for a release of both websites. Chapter links use hashes and assets use the configured base prefix.

If the collection launcher needs repair, the direct command above keeps the first site usable from its preserved folder. For missing packages use root `npm ci`; for a port conflict stop the earlier server; for stale output rebuild the relevant application or the collection. Keep the original PDF and this folder intact during any rollback. No deployment or remote Git operation was performed by this migration.

## The Paper Observatory publishing contract

This companion is part of `thepaperobservatory.com`. It shares the collection brand, source attribution, related-paper navigation and disclosed course pathway. Public builds exclude original PDFs and use canonical SSRN links; development previews retain the local reading copy. New design work uses the repository cloud workflow and `$design-ssrn-paper` skill. The root [README](../../README.md) and [cloud runbook](../../docs/cloud-publishing.md) govern current publishing behavior; earlier standalone QA and deployment examples are historical.
