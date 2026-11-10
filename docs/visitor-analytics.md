# Visitor analytics

The website uses the existing TGIR service rather than hosting a collector on Cloudflare. The shared tracker is loaded once on every HTML page (library, supporting pages, 404 and both paper apps) by `shared/analytics.js`. It is not copied into this repository. The site identifier is `paper-observatory`; section/hash navigation is recorded by the shared tracker.

- Shared script: https://tglauner.com/visitor_analytics/tracking/tracking.js
- Development collector: http://127.0.0.1:9000/collect
- Production collector: https://tglauner.com/collect
- Existing authenticated dashboard: https://tglauner.com/visitor_log/

The dashboard counts visits, sessions, returning browser identifiers, pages, referrals, outbound clicks and available device/geographic information. It does not identify visitors by name. The shared service receives IP addresses. Do Not Track is respected. The privacy page describes identifiers and collection; quiz answers stay local. Ad consent and analytics configuration are separate.

## Configuration

The public settings in `.env.example` are read from the root environment by all three Vite configurations. Values are baked into production HTML; changing them requires a rebuild. No analytics credential belongs in browser assets.

| Setting | Default |
| --- | --- |
| `ANALYTICS_ENABLED` | `true`; `0`, `false`, `no`, `off` disable all analytics tags |
| `ANALYTICS_APP_ID` | `paper-observatory` |
| `ANALYTICS_COLLECTOR_URL` | Local collector for development, TGIR HTTPS collector for builds |
| `ANALYTICS_SCRIPT_URL` | Shared script URL above |

A preview of a normal production build uses the production collector. For local preview testing, explicitly build with a local collector override. Never send synthetic test visits to production.

```bash
node --test tests/analytics.test.js
npm test
PAPER_PUBLIC_BUILD=true npm run build
npm run cloud:verify
```

Disable collection for a build with:

```bash
ANALYTICS_ENABLED=0 npm run build
```

## Production activation

The coordinated rollout on 2026-11-10 installed the manual widget and added `thepaperobservatory.com` plus `thepaperobservatory.pages.dev` to the existing collector’s allowed origins, preserving every previous entry. It attached the existing protected administrator settings to the verified live `visitor-analytics.service` unit. The collector health and allowed-origin checks passed, and anonymous reporting API access returned HTTP 401. Existing analytics data and credentials were preserved.

The website is deployed to Cloudflare Pages. The apex domain is Active with SSL enabled, and real-browser collection on the canonical host was verified in production SQLite using the explicit `deployment-check` / `launch-2026-11-10` tag. The dashboard remains at the existing TGIR URL and requires its existing administrator login.

```bash
curl -i -X OPTIONS https://tglauner.com/collect \
  -H 'Origin: https://thepaperobservatory.com' \
  -H 'Access-Control-Request-Method: POST' \
  -H 'Access-Control-Request-Headers: content-type'
```

Expect HTTP 200 and `access-control-allow-origin: https://thepaperobservatory.com` after configuration. This request writes no visitor event.

Cloudflare still serves static files on its free plan; analytics uses the already-running TGIR collector. There is no added Cloudflare Worker, database or paid analytics service. Existing collector capacity and operations remain separate from Cloudflare hosting.

## Local browser check

Use Python 3.12 or newer for local QA. The following dependencies are test tools only; Cloudflare and visitors do not need Python. Create `.venv` only if it does not already exist, then run from the website root:

```bash
[ -d .venv ] || python3 -m venv .venv
.venv/bin/python -m pip install fastapi==0.115.0 uvicorn==0.30.6 user-agents==2.2.0 python-dotenv==1.0.1
.venv/bin/python scripts/analytics-local-collector.py
```

The helper never loads the private collector `.env`, binds only to loopback, isolates SQLite/reporting/agent paths, and removes its temporary files on exit. It prints the test database path. A busy port causes startup to fail; it does not replace an existing service. Use `--port 19000` and `ANALYTICS_COLLECTOR_URL=http://127.0.0.1:19000/collect npm run dev` if needed.

In another terminal:

```bash
npm run dev
```

Open a fresh automated browser on http://127.0.0.1:5173/, and wait at least five seconds. The shared script must return 200, and `POST http://127.0.0.1:9000/collect` must return 200. Inspect only the isolated database for a `page_view`, `app_id=paper-observatory` and the loopback `page_url`. Check both paper routes and a supporting page the same way. Stop only the test collector and remove its temporary database afterward.

Rollback: revert the analytics integration changes, or rebuild with `ANALYTICS_ENABLED=0`. Remove only the new manual widget if rolling back its registration; preserve all existing widgets and allowed origins. Use the normal Cloudflare release rollback if an already-published build needs restoring.

## Verified integration

137 website tests and all three builds passed, as did the 149-file publication scan, an actual disabled Vite HTML transformation, the shared tracker consent/revocation fixture and 16 widget tests. All eight built HTML pages contain one correctly ordered production tracker. Real-browser local visits to the library, both paper apps and privacy page received tracker HTTP 200 and collection HTTP 200; isolated SQLite contained the expected app ID and page URLs. The local helper also passed its health check. No synthetic production traffic was sent.
