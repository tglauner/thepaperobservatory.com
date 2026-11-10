# Project memory — thepaperobservatory.com

## Purpose and scope

The workspace folder is `thepaperobservatory.com`, renamed from `test_risk_on_off_visualization` on 2026-11-09. The Paper Observatory is a fully AI-generated website that turns SSRN papers into interactive explanations for strong undergraduate and early PhD readers. Finance is primary; other papers qualify when unusually suitable for visualization and learning. Each companion offers Foundation and Advanced views.

The owner requested cloud generation, an open GitHub repository and Cloudflare hosting. Initial design preference is GPT-6.1 Sol with Ultra reasoning (`gpt-6.1-sol`, `ultra`); record the actual runtime rather than assuming instructions switch models. Training links, Google advertising after activation, and TikTok/Instagram/YouTube discovery are commercial priorities. `.agents/skills/design-ssrn-paper/SKILL.md` is the reusable initial-design workflow.

## Layout and architecture

- `collection/`: plain HTML/CSS/SVG paper-library landing page.
- `papers/risk-on-off/`: complete first site, The Risk Observatory, SSRN 2150877, a 50-slide presentation by Marcos López de Prado. Its source, public PDF copy, app, tests, builds, analysis, earlier QA and screenshots live here.
- `papers/stochastic-flow-diagrams/`: complete second site, The Flow Observatory, SSRN 2379314, *Stochastic Flow Diagrams* by Neil J. Calkin and Marcos López de Prado, Algorithmic Finance 3 (2014), pp.21–42. The PDF includes a cover: physical page = printed page −19.
- Root npm workspaces share React 19.3.1, KaTeX 0.19.1 and Vite 8.3.6 dependencies. Shared architecture/agent guidance, privacy configuration, `confidential/`, scripts and the single `status/` subsystem stay at the root.
- Each paper is a separate Vite application with a fixed base prefix. Root build assembles only public static output into `dist/`, with paper sites in matching subdirectories. No API, database, admin, jobs or external runtime services are required.
- Architecture guidance remains based on sibling `../app_architecture`, `tgir-app` revision `73db307deded2c1cba0ce0b58fd761216b3d470b` (clean fast-forward-only refresh on 2026-11-09 was already current). Static frontend, public GitHub/cloud generation and Cloudflare are explicit owner-selected adaptations; Apache/systemd samples are inapplicable. See `docs/architecture/adoption-2026-11-09.md` and `docs/cloud-publishing.md`.
- Original PDFs remain private/local inputs and retain their hashes. Public Git and production output exclude them by default until redistribution rights are recorded; production source links use canonical SSRN URLs. A cloud checkout must remain buildable without private source PDFs.

## Commands and URLs

Run from the workspace root:

```bash
npm ci
npm start
npm test
npm run build
npm run check
npm run preview
```

`npm start` opens the browser; `npm run dev` starts the same collection without opening unless `-- --open` is supplied. Collection development is http://127.0.0.1:5173/; paper URLs are `/risk-on-off/` and `/stochastic-flow-diagrams/`. The supervisor starts direct site servers on ports 5174 and 5175 with the same prefixes. Control-C stops the supervised process group.

Built preview is http://127.0.0.1:4173/ and needs only the assembled `dist/`. Its proxy configuration is explicitly empty: Vite preview otherwise inherits development proxies and can accidentally test the development applications. Use full document navigation/reload after a rebuild rather than changing only a hash, to avoid retaining old CSS in a browser tab.

The user authorized running the local site and opening the browser. Leave the collection development server available after this task; temporary QA servers and automation browsers may be stopped.

## Verified model and provenance facts

- Historical pre-rebrand native suite: 116 passing checks (12 collection/migration, 56 first-site, 41 second-site numerical and 7 second-site content). Root build produces the landing page and both standalone sites.
- Pre-rebrand collection browser QA (2026-11-08): 70 passing checks, including 16 accessibility views, against the assembled production preview. See root `docs/qa-report.md`, `docs/qa-browser-results.json` and `docs/migration-qa.md`. First-paper regression and mobile/focus/reduced-motion behavior passed.
- Both original PDFs are preserved byte for byte. First SHA256 `e7a4b30973d60ccdf3a99143ce362cd202afff75d435cb3f87d3994afed1c5de`; second SHA256 `9d140b75c013124d8267d821412cd6ea7dc1a282d06d16e849f45ed452331e54`. At the 2026-11-08 local migration, source/public/child-build/assembled-build copies agreed. Production publishing now excludes uncleared PDFs.
- First site: distinguish portfolio variance size from component concentration. A 2× mode-volatility shock is a 4× eigenvalue shock. Its earlier 53-browser-check report is historical in that paper's docs.
- Second site: row=target, column=source; all targets read the same old state. Initial r0 is the imposed shock; later innovations are zero for an isolated impulse. Cumulative effects are additive sums from 0, not compounded returns. Stability uses complex eigenvalue modulus and the companion matrix for multiple lags. A unit spectral radius has multiple possible behaviors; invertibility does not imply diagonalizability. Gaussian outcome bands hold coefficients fixed and are not confidence intervals for estimated parameters.
- Keep independent `risk-observatory` and `flow-observatory` preference/quiz namespaces. External notifications are disabled. Visitor analytics is now integrated as described below; production activation is pending.

## Skill installation

The canonical skill is `.agents/skills/design-ssrn-paper/`. A personal discovery link at `~/.codex/skills/design-ssrn-paper` points to it on this Mac. Cloud agents use the versioned repository copy. Headless cloud jobs use job/run logs and final status rather than requiring local VS Code/LaTeX status slides. Temporary intake belongs in ignored `.cloud-input/`, never public output or Git.

## Maintenance

- Public MVP repository: https://github.com/tglauner/thepaperobservatory.com (owner `tglauner`, public visibility verified 2026-11-09; initially empty before MVP publication). Use `main` and preserve release tag `v0.1.0` as the MVP baseline.
- Cloudflare Pages Free is sufficient for the current static MVP: 149 files, 3,576,389 bytes total, largest file 259,112 bytes. Official free-plan limits/pricing were checked 2026-11-09; see `docs/cloud-publishing.md`. The artifact scanner enforces 20,000 files and 25 MiB per file and rejects Functions/Worker entry points. Domain renewal and optional generation are separate costs.
- First website deployment and DigitalOcean analytics activation occurred on 2026-11-10; see the first-release record below. Unattended GitHub deployment remains disabled until `production` secrets are configured. The site build needs no credentials.
- MVP isolated staged-checkout validation passed `npm ci --ignore-scripts`, all 128 native tests, all three production builds, 10 cloud-source checks, 13 publication/free-plan checks and the 149-file artifact scan without private PDFs or local dependencies.

Read the selected paper's `docs/paper-analysis.md` and shared architecture before changing model claims. Run workspace tests/builds and targeted browser regression checks after structural changes. Current migration and QA evidence belongs in root `docs/`; paper-specific evidence belongs in its paper folder. Public GitHub and Cloudflare publishing are owner requirements; report actual verified repository/deployment state and operate within session authorization. No social posting or external messages are implied. Keep secrets and private content out of public assets and durable memory. The complete status lifecycle stays under root `status/`, and final commands use `--no-notify`.

## Visitor analytics

- Shared TGIR tracker is installed once per HTML page by `shared/analytics.js`, including library/support/404 and both paper apps, with app ID `paper-observatory`. Runtime code is loaded from TGIR, never vendored. Root `ANALYTICS_*` build settings select loopback collection in development and `https://tglauner.com/collect` in production; false/0/no/off suppress all tags.
- Production collector activation completed on 2026-11-10: the apex and exact Pages hostname are allowed, the dashboard widget is deployed, and the live service uses protected administrator settings. See `docs/visitor-analytics.md` and the first-release record below.
- Analytics verification passed 137 native tests, all three builds, the 149-file public scanner, shared tracker consent fixtures and 16 collector widget tests. Real browser visits to the library, both paper routes and privacy page produced HTTP 200 collection responses and matching `paper-observatory` page views in isolated SQLite. The local helper smoke check passed. No synthetic production visit was sent.

## Coordinated first deployment

- Tim explicitly authorized deploying the website to Cloudflare and the required DigitalOcean visitor analytics changes together. This authorization persists after owner account setup; no repeat deployment permission is required. Owner account/domain setup and deployment OAuth are now complete. Instructions and rollout/rollback details are in `docs/first-launch.md`.
- Read-only rollout preflight: SSH works, collector health passes, source module hashes match local code. Live unit is `visitor-analytics.service`; `visitor-collector.service` and `collector.service` are failed legacy units. Do not use the old generic deploy script for this rollout.
- Attach and verify reporting protection during rollout. Existing protected `/etc/visitor-collector-admin.env` must be attached to the actual live unit without reading/regenerating its credentials. Preserve all current origins, widgets and visitor data.
- Verified CI artifact for `9d6bede` is staged in ignored `.cloud-output/launch-9d6bede/dist/` (149 static files, scanner passed). That earlier preflight made no production changes and found DNS NXDOMAIN. Domain ownership and Cloudflare registration were subsequently confirmed for the 2026-11-10 launch.

## First release — 2026-11-10

- Cloudflare account/domain registration and deployment OAuth were completed. Pages project `thepaperobservatory` now serves the verified CI artifact from website commit `9d6bede3c11b4f54231c6fe633456c9830e322c3`. First deployment is `cc9f9890-d2e9-4abe-b7f2-082f8948182b`, URL `https://cc9f9890.thepaperobservatory.pages.dev`; production alias `https://thepaperobservatory.pages.dev/` returned HTTP 200 for the library and both paper routes.
- Apex domain was added through the Pages dashboard; Cloudflare created its CNAME to the project. Authoritative nameservers are Cloudflare-managed. Cloudflare dashboard shows the apex Active with SSL enabled. A real Chrome visit loaded the canonical HTTPS site, and exact release HTML was verified over TLS for the library, both papers and privacy page. Some local command-line DNS negative caching persisted during propagation.
- DigitalOcean rollout succeeded on `visitor-analytics.service`: appended the apex and exact Pages project hostname to existing allowed origins, merged the manual widget, and attached existing protected admin settings. Health and all preserved-origin preflights passed. Public origin preflight returned 200 with the matching header; anonymous reporting API returned 401. No database, app source, Apache settings or existing credential values were changed.
- Pre-launch backup is `/var/backups/visitor_analytics/observatory-20261110T130722375568Z`; subsequent origin update backup is `/var/backups/visitor_analytics/observatory-20261110T131007207250Z`. Restore only backed-up widget/origin/drop-in files when needed, then restart the same live service. The first Pages release has no previous site release to roll back to.
- At Tim’s request, fetched the official Cloudflare agent-setup prompt, installed 22 missing Cloudflare skills under `~/.codex/skills/` through the standard installer, and registered `cloudflare` MCP at `https://mcp.cloudflare.com/mcp`. MCP OAuth is pending user approval for limited account/Pages/DNS scopes. The global `codex` npm command lacks its platform executable; the official bundled CLI at `/Applications/ChatGPT.app/Contents/Resources/codex-cli/bin/codex` works for MCP registration/login. Existing project Wrangler remains the deployment CLI.
- Wrangler 4.158.0 tried to delegate new Pages creation to Workers and rejected the workspace root. Its documented tool-output recovery `pages project create ... --force` created the existing Pages target directly. Subsequent deployments need no force flag.
- Production browser checks passed the correlation slider (0.65 → 0.66, variance share 82.5% → 83.0%), risk comparison (equal mode risk gives 3.00 effective bets and equal thirds) and flow comparison (explosive spectral radius 1.333 and changed responses). A genuine visit tagged `deployment-check` / `launch-2026-11-10` reached production SQLite with the canonical host and `app_id=paper-observatory`. Verification traffic is not organic traffic. Screenshots remain ignored under `output/playwright/`.
