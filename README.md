# The Paper Observatory · thepaperobservatory.com

A fully AI-generated website that turns SSRN papers into interactive learning experiences. Finance is the main focus, with exceptional papers from other fields selected when visualization makes their ideas particularly useful to understand.

Each paper has its own analysis, application, tests and build under `papers/<slug>/`. The common entrance, navigation, course pathways and channel links make them one coherent website. Foundation explanations support strong undergraduates; Advanced views serve early PhD readers. Original research is attributed to its authors; educational reconstructions and synthetic extensions are labeled explicitly.

The publishing model is **cloud generation → open GitHub source → cloud verification/build → Cloudflare hosting**. Local preview remains available. See the [cloud publishing runbook](docs/cloud-publishing.md) for verified deployment state, setup and rollback; a configured target is not a claim that the domain is live.

MVP source: [public GitHub repository](https://github.com/tglauner/thepaperobservatory.com). The current static site fits Cloudflare Pages Free; see the runbook's measured [free hosting assessment](docs/cloud-publishing.md#free-hosting-assessment--2026-11-09). Deployment is prepared and remains disabled until account setup.

| Website | Source | Collection URL |
| --- | --- | --- |
| The Risk Observatory | Marcos López de Prado, *Managing Risks in a Risk-On/Risk-Off Environment*, SSRN 2150877 | http://127.0.0.1:5173/risk-on-off/ |
| The Flow Observatory | Neil J. Calkin and Marcos López de Prado, *Stochastic flow diagrams* (2014), SSRN 2379314 | http://127.0.0.1:5173/stochastic-flow-diagrams/ |

Both sites have Foundation explanations for strong undergraduate students and Advanced mathematics and qualifications for early PhD readers. The first site retains its four risk experiments; the second adds five experiments on dynamic networks, impulses, feedback, memory and uncertainty.

## Install once and open the collection

Node.js 22.12 or newer is required. Run these commands from the workspace root:

```bash
npm ci
npm start
```

`npm start` launches the local servers and opens **http://127.0.0.1:5173/** in the default browser. After installation, `npm start` is enough to reopen it. **Control-C** stops the launcher and its servers.

For the same collection without automatically opening a browser:

```bash
npm run dev
```

`npm run dev -- --open` also opens the browser. The development launcher owns the library on port 5173 and two child Vite servers on ports 5174 and 5175. The library proxies each paper's prefix to its child server, so visitors can stay on port 5173.

The local preview runs on loopback. The educational calculations run in the browser and require no runtime model key, database or paid market feed. Cloud generation credentials and deployment secrets belong in their platform secret stores, never in browser assets or public Git.

## Workspace layout

```text
collection/                         Library homepage and Vite configuration
papers/
  risk-on-off/                      Complete first-paper website
    ssrn-2150877.pdf                 Preserved original presentation
    src/ public/ tests/ docs/        Application, reading copy, tests, analysis
    README.md MEMORY.md dist/        Paper guide, context and generated build
  stochastic-flow-diagrams/          Complete second-paper website
    ssrn-2379314.pdf                 Preserved original article
    src/ public/ tests/ docs/        Application, reading copy, tests, analysis
    README.md dist/                  Paper guide and generated build
scripts/                            Collection launcher and build assembly
tests/                              Workspace and migration checks
docs/architecture/                  Shared architecture guidance
status/                             Shared local status lifecycle
confidential/                       Private local material, excluded from Git
dist/                               Generated collection with both sites
```

The root npm workspace installs shared dependencies through one lockfile. React and KaTeX are shared through npm's dependency hoisting; each paper remains a separate Vite application with its own base URL. Common agent configuration under `.agents/`, `.codex/`, `.github/` and `.vscode/`, privacy rules, and the status subsystem stay at the collection root.

The original PDFs remain byte-identical to the supplied files in local/private storage. They are excluded from public Git and production artifacts by default unless redistribution rights are recorded. Local development can use each site's reading copy; production source links fall back to the canonical SSRN page. Source references distinguish physical PDF pages from printed journal pages: in the second article, printed page q corresponds to PDF page q − 19 because the PDF begins with a cover.

## Test and build the whole website

```bash
npm run check
```

The pre-rebrand local migration passed **116 native tests**: 12 workspace checks, 56 first-paper checks and 48 second-paper checks. Current expansion results are recorded in the latest QA report; cloud checks also verify a checkout without private PDFs. The build command builds each paper and the library, then assembles all public output into root `dist/`:

```text
dist/index.html
dist/risk-on-off/index.html
dist/stochastic-flow-diagrams/index.html
```

To test or build separately:

```bash
npm test
npm run build
```

Browser verification is recorded separately in the workspace [QA report](docs/qa-report.md). The first paper's retained QA files describe its earlier standalone version; their old root URLs are historical.

## Preview the assembled static build

```bash
npm run build
npm run preview
```

Open **http://127.0.0.1:4173/**. Preview uses one server for the complete built collection. The two sites are at `/risk-on-off/` and `/stochastic-flow-diagrams/` on that port. Check the three entry points in another terminal:

```bash
curl --fail --head http://127.0.0.1:4173/
curl --fail --head http://127.0.0.1:4173/risk-on-off/
curl --fail --head http://127.0.0.1:4173/stochastic-flow-diagrams/
```

## Run one paper independently

From the collection root:

```bash
npm run dev:risk
npm run dev:flows
```

Run one command per terminal. The direct URLs are **http://127.0.0.1:5174/risk-on-off/** and **http://127.0.0.1:5175/stochastic-flow-diagrams/**. These ports must be free; the collection launcher already uses them when running.

The paper guides provide direct build/preview commands: [Risk Observatory](papers/risk-on-off/README.md) and [Flow Observatory](papers/stochastic-flow-diagrams/README.md). Browser preferences and quiz answers use separate namespaces for the two papers. Direct ports and the collection origin have separate browser storage.

## Research notes

- [First-paper analysis](papers/risk-on-off/docs/paper-analysis.md): risk decomposition, component entropy and the interpretation of regime shocks.
- [Second-paper analysis](papers/stochastic-flow-diagrams/docs/paper-analysis.md): graph conventions, synchronous updates, exact source parameters, rate/cumulative distinctions and stability qualifications.
- [Shared architecture](docs/architecture/ARCHITECTURE.md): ownership, runtime and deployment boundaries.

Source examples and synthetic teaching extensions are labeled separately. Neither website estimates current financial conditions, fits market coefficients or reproduces a historical performance backtest.

To extend the collection, invoke the reusable skill in the cloud workspace with an authorized SSRN document or canonical source URL:

```text
Use $design-ssrn-paper to analyze this SSRN paper and design its initial
Paper Observatory companion, with Foundation and Advanced learning paths.
```

The skill is versioned at [.agents/skills/design-ssrn-paper/SKILL.md](.agents/skills/design-ssrn-paper/SKILL.md). Initial design prefers GPT-6.1 Sol with Ultra reasoning; generation records the actual model and setting. New work belongs in another `papers/<slug>/` folder, with registration, source evidence, tests and cloud preview completed together. Tim supplies a document or a request rather than hand-writing application code.

## Cloud publication and monetization

Cloudflare is the production target, replacing this project's earlier DigitalOcean/Apache plan. Publish only assembled root `dist/`. Keep an open GitHub repository for the generated code and evidence metadata, with source PDFs and private inputs excluded unless cleared. Cloud generation and release commands, required platform configuration and rollback are documented in [cloud publishing](docs/cloud-publishing.md).

Training recommendations are an important part of the learning path. Use genuine course destinations and verified offers. Google advertising remains disabled until the site/publisher configuration and appropriate consent integration are ready. TikTok, Instagram and YouTube content should demonstrate one mechanism, cite the source and bring learners to the corresponding exhibit. Account links and posting require verified ownership and actual authorization. See [monetization and distribution](docs/monetization.md) and [product direction](docs/product-strategy.md).

The Architecture Library's `tgir-app` standards remain the baseline for agent behavior, privacy, source handling, documentation and verification. The static frontend, cloud-first generation and Cloudflare are documented owner-selected adaptations; see [the adoption record](docs/architecture/adoption-2026-11-09.md).

## Troubleshooting and migration fallback

- **Port in use:** stop the earlier launcher or standalone site with Control-C. Development needs 5173, 5174 and 5175; built preview needs 4173. The launcher reports which port is occupied.
- **Missing packages:** run `npm ci` at the collection root. Keep installation under the root workspace lockfile.
- **Old first-paper bookmark:** the first site now starts at `/risk-on-off/`; the root URL is the library. A chapter bookmark can use `/risk-on-off/#geometry`.
- **Stale built content:** rerun root `npm run build`, then reload the preview. Rebuilding assembles both paper outputs again.
- **Old quiz answers or depth:** reset answers in the relevant quiz, or clear site data for the origin being used.
- **Unexpected rendering:** reload the page and inspect the browser console for its failure message. Node version can be checked with `node --version`.

If the collection launcher needs repair, `npm run dev:risk` still runs the preserved first site independently from its new folder. Keep both paper directories and source PDFs intact while repairing collection configuration. A full structural reversal would also have to restore the earlier base paths and package configuration; copying files into the root alone would not restore the old routing. For a published change, use a Git revert and Cloudflare rollback as described in the cloud runbook.
