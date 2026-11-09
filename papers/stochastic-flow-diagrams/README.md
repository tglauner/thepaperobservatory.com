# The Flow Observatory

An educational companion to **Stochastic flow diagrams** by Neil J. Calkin and Marcos López de Prado, *Algorithmic Finance* 3 (2014), 21–42, DOI 10.3233/AF-140032, SSRN 2379314. It is the second independent website in [The Paper Observatory](../../README.md).

The article turns time-series equations into a graph of current variables, lag-memory cells and signed coefficient links. This website lets readers follow an imposed shock, change the feedback and distinguish a fading change from its accumulated effect.

## Open through the collection

From the collection root:

```bash
npm ci
npm start
```

Open **http://127.0.0.1:5173/stochastic-flow-diagrams/**. Root installation shares React, KaTeX and the workspace lockfile. No runtime keys, accounts, database, paid data feed or external font service are required.

## Run this paper independently

From collection root:

```bash
npm run dev --workspace papers/stochastic-flow-diagrams -- --open
```

Or, from this paper folder after the root installation:

```bash
npm run dev -- --open
```

The direct URL is **http://127.0.0.1:5175/stochastic-flow-diagrams/**. Control-C stops it. The collection launcher already occupies this port when running, so stop that launcher before starting another direct instance.

## Five experiments

| Experiment | What you can explore |
| --- | --- |
| Read the diagram | Select coefficient connections, trace source-to-target terms and distinguish a delay connection from a signed regression effect. |
| Follow a shock | Impose a Stocks shock at t=0, advance complete periods, compare changes with cumulative effects and export response JSON. |
| Change the feedback | Compare source regime presets, alter coefficients and inspect the eigenvalues relative to the unit circle. |
| Add a memory | Explore a two-lag autoregression and its stored history, with companion-system interpretation. |
| Let new shocks arrive | Compare an isolated response with seeded Gaussian paths and pointwise 10th–90th percentile outcome bands. |

The overview introduces the article's three declared regime examples. The reading page connects six source cases to the experiments, compares AR/VAR/SVAR architectures, and explains limitations. The glossary has 16 concepts and the quiz has nine source-linked questions with feedback and reset.

Foundation builds the intuition for strong undergraduate readers. Advanced includes matrix conventions, path gains, complex eigenvalues, unit-root qualifications, non-normal amplification and statistical/causal interpretation. Browser preferences and quiz answers use the independent `flow-observatory` namespace and gracefully fall back when storage is unavailable. Direct ports have separate storage from the collection origin.

## Source provenance and page links

`ssrn-2379314.pdf` is preserved in this folder. Its SHA-256 is:

```text
9d140b75c013124d8267d821412cd6ea7dc1a282d06d16e849f45ed452331e54
```

`public/paper.pdf` is a byte-identical reading copy. The PDF has 23 physical pages: a journal cover followed by the 22-page article. Printed journal page q maps to physical PDF page q − 19. Thus the source's regime matrices on printed pages 33–34 are PDF pages 14–15, and the stability appendix on printed page 41 is PDF page 22.

The [source analysis](docs/paper-analysis.md) records equations, orientation, exact source-parameter reconstructions, page references, interpretive qualifications and teaching design.

## Mathematical and evidence boundaries

- Matrix row means target equation; column means source variable. Compute all targets from the previous history before shifting memory.
- In the isolated impulse, r₀ equals the chosen shock and future innovations are zero. Cumulative effects are additive sums starting at t=0, in arbitrary units, without investment-return compounding.
- Source presets use the paper's declared symmetric matrices and shock. Their responses are explicit reconstructions, rather than fitted market estimates.
- Discrete-time stability depends on complex eigenvalue modulus. The unit-circle boundary can imply different behavior, and invertibility does not guarantee diagonalizability. Direct iteration avoids assuming a complete eigenbasis.
- An explosive matrix need not amplify every possible shock; a stable non-normal matrix can amplify an early response before decay.
- Custom settings, AR(2) examples and Gaussian outcome bands are teaching extensions. Bands hold coefficients fixed and do not represent parameter confidence intervals or crash probabilities.
- Signed SFD coefficients are not Markov transition probabilities and need not conserve flow. Directed predictive relationships do not by themselves identify intervention effects.

## Validate and preview

From collection root:

```bash
npm test --workspace papers/stochastic-flow-diagrams
npm run build --workspace papers/stochastic-flow-diagrams
npm run preview --workspace papers/stochastic-flow-diagrams
```

The native flow suite passes **48 tests**: 41 numerical checks and seven content/source-reference checks. Direct built preview is **http://127.0.0.1:4175/stochastic-flow-diagrams/**. The same commands without workspace flags work from this paper folder. Root `npm run check` validates both sites and assembles the library; root preview serves this site at **http://127.0.0.1:4173/stochastic-flow-diagrams/**.

```bash
curl --fail --head http://127.0.0.1:4175/stochastic-flow-diagrams/
curl --fail --head http://127.0.0.1:4175/stochastic-flow-diagrams/paper.pdf
```

Current browser and collection verification is documented in the [workspace QA record](../../docs/qa-report.md). Native tests and successful builds do not substitute for that browser pass.

## Files, troubleshooting and release

`src/lib/sfd.js` owns the numerical engine; `src/components/` owns the experiments, network/response charts, reading page, glossary and quiz; `src/data/content.js` owns source-grounded text. This folder's `tests/`, `docs/`, `public/` and generated `dist/` remain independent from the first paper. Shared agent/status/privacy configuration is at collection root.

For missing dependencies, run root `npm ci`. For a port conflict, stop the earlier direct server or collection launcher. For stale preview output, rebuild this workspace or run the root build. Use the displayed reset controls to restore an experiment, and Reset answers to clear the quiz.

Production builds use the shared Cloudflare publishing workflow and preserve `/stochastic-flow-diagrams/`. Source PDFs stay local and outside the public repository; production citations link to SSRN. Read the [cloud publishing runbook](../../docs/cloud-publishing.md) for deployment and rollback.

## The Paper Observatory publishing contract

This companion is part of `thepaperobservatory.com`. It shares the collection brand, source attribution, related-paper navigation and disclosed course pathway. Public builds exclude original PDFs and use canonical SSRN links; development previews retain the local reading copy. New design work uses the repository cloud workflow and `$design-ssrn-paper` skill. The root [README](../../README.md) and [cloud runbook](../../docs/cloud-publishing.md) govern current publishing behavior; earlier standalone QA and deployment examples are historical.
