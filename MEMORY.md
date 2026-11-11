# Project memory — The Paper Observatory

## Product and architecture

- Live website: https://thepaperobservatory.com; fallback: https://thepaperobservatory.pages.dev. Public repository: https://github.com/tglauner/thepaperobservatory.com (`main`, MVP tag `v0.1.0`). Initial setup completed **2026-11-10**.
- AI-generated SSRN companions for strong undergraduates and early PhD readers, with Foundation/Advanced paths. Finance is primary. Findings, reconstructions and toy simulations must be distinguished and sourced.
- `collection/` is the library; `papers/risk-on-off/` and `papers/stochastic-flow-diagrams/` remain independent Vite/npm workspaces. Root `shared/`, scripts, dependencies, privacy configuration and `status/` stay shared. Never flatten a paper into the root.
- Static Cloudflare Pages is the owner-selected production target. No Cloudflare backend, database, Worker or runtime model call is needed. Existing TGIR analytics runs separately on DigitalOcean. The current release fits Pages Free; domain renewal and optional generation are separate costs.
- Architecture baseline: sibling `../app_architecture`, profile `tgir-app`, adoption revision `73db307deded2c1cba0ce0b58fd761216b3d470b`; static/cloud adaptations are in `docs/architecture/adoption-2026-11-09.md`. Inherited Apache/systemd samples do not deploy this website.

## Commands

From the root:

```bash
npm ci
npm start
npm run check
npm run cloud:self-check
npm run cloud:verify
npm run preview
```

Development is http://127.0.0.1:5173/ with paper prefixes `/risk-on-off/` and `/stochastic-flow-diagrams/`, direct ports 5174/5175. Control-C stops the supervisor. Preview serves the assembled `dist/` on 4173, with proxies explicitly empty. Reload the full document after rebuilding. `npm run dev:risk` and `npm run dev:flows` support separate development; do not overlap occupied ports. The user authorized keeping the collection dev server available; stop only temporary processes owned by the task.

## Publication and operations

- Canonical operational docs: `docs/cloud-publishing.md` and `docs/visitor-analytics.md`. Use Wrangler **4.158.0**, project `thepaperobservatory`, branch `main`; publish only a verified CI artifact. MCP is not needed or configured.
- First release: website commit `9d6bede3c11b4f54231c6fe633456c9830e322c3`, CI run `42747011869`, deployment `cc9f9890-d2e9-4abe-b7f2-082f8948182b`. Domain was Active with SSL enabled; library/paper controls, exact release HTML and production collection passed. Keep prior Cloudflare releases for rollback.
- CI tests/builds every PR and main push. Automatic deployment is off; a later opt-in needs GitHub `production` secrets and `CLOUDFLARE_DEPLOY_ENABLED=true`. Model generation is a separate manual workflow; no billable generation was exercised during setup.
- Shared analytics uses `appId=paper-observatory`. `shared/analytics.js` injects one shared tracker into all eight HTML pages. Root `ANALYTICS_*` settings use loopback collection in dev and `https://tglauner.com/collect` in production; false/0/no/off removes tags. Quiz answers stay local. Advertising and external notifications remain disabled.
- Dashboard: https://tglauner.com/visitor_log/. Live collector unit: **`visitor-analytics.service`**. Failed legacy `visitor-collector.service` and `collector.service` are not deployment targets. The sibling generic deploy helper needs correction before a future full collector release.
- Collector’s apex/Pages origins and manual widget are deployed. Existing protected admin settings are attached to the correct live unit. Health/preflight returned 200 and anonymous reporting 401. Credentials, database, application source and Apache settings were preserved.
- Collector backups: `/var/backups/visitor_analytics/observatory-20261110T130722375568Z` (pre-launch), `observatory-20261110T131007207250Z` (Pages-host addition). Restore only manifest-listed configuration and restart the live unit; preserve data and unrelated sites.
- A real production verification visit is tagged `deployment-check` / `launch-2026-11-10`; it is not organic traffic. Latest setup validation: 137 native tests, all three builds and a 149-file publication scan; analytics consent fixtures and 16 collector widget tests also passed.

## Source and mathematical safeguards

- Original PDFs stay byte-identical and private unless redistribution rights are recorded. Public checkouts must build without them. Production source links use SSRN. Keep `.env`, `confidential/`, temporary `.cloud-input/`, generated builds and screenshots out of Git/public output.
- Risk source: SSRN 2150877, 50-slide presentation by Marcos López de Prado. SHA256 `e7a4b30973d60ccdf3a99143ce362cd202afff75d435cb3f87d3994afed1c5de`. Distinguish variance size from component concentration; a 2× mode-volatility shock is 4× eigenvalue variance.
- Flow source: SSRN 2379314, Neil J. Calkin and Marcos López de Prado (2014), printed pp.21–42. SHA256 `9d140b75c013124d8267d821412cd6ea7dc1a282d06d16e849f45ed452331e54`; physical PDF page = printed page −19 because of the cover.
- Flow convention: row=target, column=source; synchronous updates; initial r0 is the impulse, later innovations zero. Cumulative effects are additive. Stability uses complex eigenvalue modulus and companion matrices for multiple lags. Unit-circle behavior varies; invertibility does not imply diagonalizability. Gaussian bands with fixed coefficients are outcome bands, not fitted confidence intervals.
- Preserve independent `risk-observatory` and `flow-observatory` storage namespaces. Research analysis and historical QA remain with each paper and root `docs/`.

## Working conventions

- Use `.agents/skills/design-ssrn-paper/SKILL.md` for another paper. Initial design preference is `gpt-6.1-sol` / `ultra`; record actual runtime and fail visibly if unavailable. New work belongs under `papers/<slug>/`, with evidence, tests, catalog registration and cloud preview.
- Course links must be real. Advertising activation, social posting and paid services require actual configuration and authorization. Architecture integration requires at least 20 named checks in addition to native/browser validation.
- Monetization plan: `docs/monetization-plan.md` (2026-11-10), course-first experiment with attribution and cost measurement. The owner excludes VaR; scope is Interest Rate Derivatives, MBS/ABS and FRTB. Risk → FRTB and Flow → no course are live in release https://575361ab.thepaperobservatory.pages.dev (source `892c0def3a1a4e8b43669c19c903cc0c4b1fd8c7`, CI `42937071048`); 141 tests, all builds, publication guards and live Chrome checks passed. Preserve previous releases.
- The owner requested independent execution and one daily status email (2026-11-10). `.agents/skills/observatory-growth-agent/SKILL.md`, `content/growth/backlog.json` and `docs/growth-agent.md` define the routine. **Paper Observatory growth agent** is verified active in ChatGPT Scheduled at 09:00 America/New_York, first scheduled run 2026-11-11. Its saved prompt and skill use the approved $10/calendar-month additional model/automation ceiling. Prefer included access; unverifiable spend blocks new billable work. This is not a provider billing cap and does not authorize new paid services or credential export. First setup email was confirmed sent/received; future cloud deployment/protected reporting access remains unconfigured. Do not confuse setup-email success with a completed cloud run.
- Tim treats initial setup as complete and prefers concise operations docs. The approved four-permission API token is stored only in macOS Keychain as `codex-cloudflare-mcp`; active-token and Pages-project reads passed. Do not print it or broaden its scope. The optional MCP attempt was abandoned because it additionally requires identity-read access; its server entry and setup helpers were removed. Wrangler remains authenticated independently. Cloudflare skills remain installed.
- Root status lifecycle uses `status/status_slide.py`; final status uses `--no-notify`. Cloud jobs use run IDs, logs and artifacts instead of local PDF/VS Code requirements. Follow current `AGENTS.md` and keep durable memory concise.
