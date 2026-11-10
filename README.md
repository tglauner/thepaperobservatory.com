# The Paper Observatory

AI-generated, source-grounded interactive companions to SSRN research for strong undergraduate and early PhD readers. Finance is the main focus. Each companion offers Foundation and Advanced paths and distinguishes paper findings, educational reconstructions and synthetic simulations.

- **Website:** https://thepaperobservatory.com
- **Fallback:** https://thepaperobservatory.pages.dev
- **Source:** https://github.com/tglauner/thepaperobservatory.com
- **Visitor dashboard:** https://tglauner.com/visitor_log/ — administrator login required

Initial setup and the first production release were completed on **2026-11-10**. Cloudflare Pages serves the static website; the existing DigitalOcean service collects visitor events. Advertising is disabled.

## Local development

Use Node.js **22.12+** and run from the workspace root:

```bash
npm ci
npm start
```

Open http://127.0.0.1:5173/. Control-C stops the collection and its child servers. `npm run dev` starts the same servers without opening a browser.

| Entry | Collection path | Direct development port |
| --- | --- | --- |
| Library | `/` | 5173 |
| Risk Observatory | `/risk-on-off/` | 5174 |
| Flow Observatory | `/stochastic-flow-diagrams/` | 5175 |

Install dependencies once at the root. Each paper remains an independent npm workspace with its own source, tests, base URL and documentation.

## Verify and preview

```bash
npm run check
npm run cloud:self-check
npm run cloud:verify
npm run preview
```

`check` runs all tests and builds the complete public website into `dist/`. Preview serves that artifact at http://127.0.0.1:4173/. Run `npm test` and `npm run build` separately when needed. The initial release passed 137 native tests, all three builds and the 149-file publication scan.

## Project layout

```text
collection/                     Library and supporting pages
papers/risk-on-off/              SSRN 2150877 companion: four risk experiments
papers/stochastic-flow-diagrams/ SSRN 2379314 companion: five dynamic-system experiments
shared/                         Catalog, navigation, analytics and common styling
scripts/                        Development, build and cloud helpers
tests/                          Collection and integration tests
docs/                           Architecture, operations, research and QA
status/                         Local agent status helper; generated output is ignored
```

Original PDFs remain byte-identical in private/local storage. Public Git and production output exclude PDFs unless redistribution rights are recorded. Public source links use SSRN. Secrets, `confidential/`, dependencies, generated builds and QA files remain ignored.

## Operations and further papers

- [Publishing and rollback](docs/cloud-publishing.md)
- [Visitor analytics and local checks](docs/visitor-analytics.md)
- [Architecture](docs/architecture/ARCHITECTURE.md)
- [Monetization and distribution](docs/monetization.md)
- [Risk paper analysis](papers/risk-on-off/docs/paper-analysis.md)
- [Flow paper analysis](papers/stochastic-flow-diagrams/docs/paper-analysis.md)

For another paper, use [.agents/skills/design-ssrn-paper/SKILL.md](.agents/skills/design-ssrn-paper/SKILL.md). New exhibits belong under `papers/<slug>/` with evidence, tests and cloud preview. Initial design prefers GPT-6.1 Sol / Ultra; record the actual runtime. Social posting, advertising activation and paid generation require their own configured access and authorization.

## Troubleshooting

- **Port occupied:** stop the earlier launcher with Control-C; development needs 5173–5175 and preview needs 4173.
- **Missing packages:** run root `npm ci`.
- **Stale preview:** run `npm run build`, then reload the full page.
- **Saved learning state:** use the paper’s quiz reset or clear site data. Each paper has independent storage keys.
- **One-site development:** use `npm run dev:risk` or `npm run dev:flows`; don’t run these alongside the collection launcher on the same ports.
