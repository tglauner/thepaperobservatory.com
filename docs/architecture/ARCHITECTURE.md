# The Paper Observatory architecture

## Purpose and audiences

The Paper Observatory is a fully AI-generated SSRN visualization website, intended for `thepaperobservatory.com`. Finance is the editorial center, with exceptional non-finance papers selected for particular visual and learning value. Every source paper has a separate application folder, with a common library homepage and shared navigation/course/channel pathways. Foundation explanations support strong undergraduate students; Advanced notes cover derivations, assumptions, source qualifications and seminar questions for early PhD readers.

The source PDFs are the authority for claims about each paper. Interactive reconstructions and new teaching models are labeled at the point of use. Generation runs in cloud workspaces/agents, source is maintained in an open GitHub repository, CI builds reproducible static output and Cloudflare hosts the site. Local preview is a verification tool. Actual repository, deployment and domain status are recorded in the cloud publishing runbook rather than inferred from this architecture.

## Ownership and layout

- `papers/risk-on-off/` owns the original SSRN 2150877 presentation, its four-lab React application, public assets, analysis, tests, README, memory, generated build and screenshots.
- `papers/stochastic-flow-diagrams/` owns the original SSRN 2379314 article, its five-lab React application, public assets, analysis, tests, README and generated build.
- `collection/` owns the library homepage and the collection Vite configuration.
- Root `scripts/serve.mjs` launches local servers; `scripts/build.mjs` assembles the deployable collection.
- Root `tests/` validates workspace registration, routing, migration and source provenance. Each paper's numerical and content tests remain in its own folder.
- Shared architecture/workflow guidance, npm lockfile/dependencies, agent configuration and privacy controls stay at the root.
- Root `status/` contains the entire status subsystem. Its generated files never become website content.
- Root `confidential/` and environment files stay private. Retain only `.env.example`; dependencies, `.venv/`, builds and generated screenshots remain ignored.

The first site's movement into a paper folder preserves its original PDF and mathematical behavior. Paper source, tests and public assets must not be flattened back into collection root paths.

## Runtime and dependencies

Both applications use React and Vite, with deterministic browser-side numerical functions independent of rendering. Responsive SVG charts expose values and descriptions in accessible HTML. Controls support keyboard use and reduced motion. KaTeX typesets mathematical detail from local assets.

The root npm workspace (`papers/*`) shares compatible dependency installations and one lockfile. Install once with root `npm ci`. Each application still has an explicit package manifest, base URL, tests and independent build.

All current features are read-only educational computation. The website has no API, mutable server data, admin login, database, job queue or worker. Visitor analytics sends events to the existing external TGIR collector; see `docs/visitor-analytics.md`. A FastAPI server and persistence layer would add operations without supporting a current requirement. Jobs and artifact tables become relevant if a future server pipeline is requested. If a database is later needed, use the user's PostgreSQL-on-the-existing-droplet preference.

Browser learning depth, visited chapters and quiz answers may use local storage with a safe fallback. The two sites use independent `risk-observatory` and `flow-observatory` namespaces. Direct development ports are different origins from the collection proxy, so their saved browser state is separate.

## Local routing

| Entry point | Development | Built collection preview |
| --- | --- | --- |
| Library | `http://127.0.0.1:5173/` | `http://127.0.0.1:4173/` |
| Risk site | Collection prefix `/risk-on-off/`, proxied to direct port 5174 | `/risk-on-off/` on port 4173 |
| Flow site | Collection prefix `/stochastic-flow-diagrams/`, proxied to direct port 5175 | `/stochastic-flow-diagrams/` on port 4173 |

The development launcher checks all required ports, starts the two child Vite processes and the library proxy, waits for successful responses, and stops its children when interrupted. It reports startup failures with the affected component or port. Root `npm start` opens the library; `npm run dev` leaves browser opening optional.

Each paper's Vite base prefix must agree with its proxy, catalog link and built subdirectory. Public paper links use `import.meta.env.BASE_URL`. Local reading copies can be available under the corresponding prefix as `paper.pdf`; production availability is rights-gated. Chapters use hashes within each site's URL.

## Build and public boundary

Root `npm run build` builds both applications and the collection homepage, then copies the child builds into root `dist/risk-on-off/` and `dist/stochastic-flow-diagrams/`. Root `dist/index.html` is the library. Rebuilding assembles this generated output again from the owned source folders.

Only root `dist/` is the complete publication artifact. It contains intended public assets without private files, agent configuration, source trees, dependencies or status output. Source PDFs are excluded from public Git and production artifacts by default; include a reading copy only when redistribution rights have been recorded. Local development may use the private/local reading copy; production source links use canonical SSRN pages when no cleared reading copy is published. Child `dist/` directories support independent paper previews and must retain their configured base prefixes.

## Accuracy and source provenance

Preserve each original PDF byte for byte and record its hash. A cleared reading copy must remain identical, but public availability on SSRN does not itself authorize republication. SSRN 2150877 is a 50-slide presentation whose physical pages match the numbered slides. SSRN 2379314 has 23 physical PDF pages: a journal cover followed by printed article pages 21–42, so physical PDF page equals printed page minus 19.

The first site's risk model distinguishes volatility from variance, component from asset contributions, and uncorrelated from independent risks. The second site's matrix convention is row = target and column = source; updates are synchronous. It distinguishes per-period changes from additive cumulative effects, tests complex eigenvalue modulus for discrete-time stability, and treats unit-circle and diagonalization caveats explicitly. Gaussian outcome bands are teaching extensions, not fitted confidence intervals or crash probabilities.

## Validation

From collection root:

```bash
npm ci
npm run check
npm run build
npm run preview
```

The pre-rebrand native suites contained 116 passing checks: 12 workspace checks, 56 risk-site checks and 48 flow-site checks. Three builds cover the library and both applications. Browser verification covers current prefixed links, source PDFs, primary controls, audience modes, quiz/glossary persistence, keyboard focus, reduced motion and narrow layouts. The current workspace QA record owns the browser results; the retained first-site QA describes the earlier standalone version.

The Architecture Library's `tgir-app` guidance remains the baseline, with explicit static multi-site and Cloudflare/cloud-first adaptations selected by the owner. The 20-check integration floor supplements native and browser validation rather than replacing it. The adoption record explains managed-file differences and the unused server samples.

## Cloud generation, publishing and rollback

Initial design prefers GPT-6.1 Sol with Ultra reasoning (`gpt-6.1-sol`, `ultra`), as requested by the owner. Record actual model/reasoning and never pretend a skill changed its host runtime. `.agents/skills/design-ssrn-paper/SKILL.md` defines source intake, evidence analysis, layout, validation and cloud handoff.

The owner-selected production target is Cloudflare, superseding the earlier DigitalOcean/Apache plan. Publish only root `dist/`, using the cloud workflow and commands in [cloud publishing](../cloud-publishing.md). Keep tokens in the cloud platform's secret store, grant minimal repository/deployment permissions and retain the previous verified deployment for rollback. No server daemon, PostgreSQL instance or extra host is required for the current static site.

Cloud generation retries preserve a stable paper slug and job identity. Provenance should record job ID/type/status, start/finish/error, logs/artifact reference, source hash, actual model/reasoning and commit. Keep private source inputs out of a public checkout and make the normal cloud build work without them.

## Commercial and distribution boundaries

Relevant course recommendations and a shared `/learn/` destination support the lesson. Advertising is separate from experimental controls and disabled until actual publisher approval/configuration and consent requirements are met. Channel links use verified accounts; social derivative packs remain drafts until posting is authorized. No login, mailing-list form, paid purchase or tracking backend is implied by the site layout. See [monetization](../monetization.md) for the activation sequence and official platform references.
