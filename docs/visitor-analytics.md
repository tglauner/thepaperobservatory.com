# Visitor analytics

The shared TGIR tracker is installed once per HTML page through `shared/analytics.js`, including the library, supporting pages, 404 and both paper apps. Its site ID is **`paper-observatory`**. The script remains hosted by TGIR rather than copied into this project.

| Purpose | Address |
| --- | --- |
| Dashboard | https://tglauner.com/visitor_log/ — administrator login required |
| Shared script | https://tglauner.com/visitor_analytics/tracking/tracking.js |
| Production collector | https://tglauner.com/collect |
| Development collector | http://127.0.0.1:9000/collect |

It measures visits, sessions, returning browser identifiers, pages, referrals, outbound clicks and available location/device information. It does not identify people by name. The collector receives IP addresses; the shared tracker respects Do Not Track. Quiz answers stay local. The public privacy notice describes collection and cookies.

## Configuration

Root `.env.example` documents public build settings:

- `ANALYTICS_ENABLED=true`; `0`, `false`, `no` or `off` suppress all tracker tags.
- `ANALYTICS_APP_ID=paper-observatory`.
- `ANALYTICS_COLLECTOR_URL`: leave empty for loopback in development and TGIR HTTPS in production.
- `ANALYTICS_SCRIPT_URL`: shared script URL above.

Changing these settings requires rebuilding. A normal production preview uses the production collector; use a loopback override for local collection tests.

## Production operations

Deployment completed **2026-11-10**. The live DigitalOcean unit is **`visitor-analytics.service`**; the similarly named failed legacy units must not be used. The manual dashboard widget and allowed origins for the apex and exact `thepaperobservatory.pages.dev` hostname are installed. Existing sites and visitor data were preserved.

The service loads existing protected administrator credentials from `/etc/visitor-collector-admin.env`, plus `/etc/visitor-analytics-observatory.env` through its `90-observatory.conf` drop-in. Keep credentials off Git and logs. Chrome saves a login only after successful sign-in and an owner-approved save action.

Non-recording health checks:

```bash
curl -fsS https://tglauner.com/healthz
curl -s -o /dev/null -w '%{http_code}\n' https://tglauner.com/api/sites
curl -i -X OPTIONS https://tglauner.com/collect -H 'Origin: https://thepaperobservatory.com' -H 'Access-Control-Request-Method: POST' -H 'Access-Control-Request-Headers: content-type'
```

Expect health HTTP 200, anonymous reporting HTTP 401, and preflight HTTP 200 with the matching allowed-origin header. A tagged real-browser visit (`deployment-check` / `launch-2026-11-10`) was verified in production SQLite with the correct app ID and canonical host.

For configuration changes on the collector host, restart `visitor-analytics.service` and repeat health, authentication and existing-site CORS checks. No Apache reload is needed for these environment/widget changes. Preserve data, `.env`, administrator credentials and every other allowed origin/widget.

## Local checks and rollback

Run `node --test tests/analytics.test.js`, root `npm run check` and `npm run cloud:verify`. For isolated browser collection, install the sibling collector’s test dependencies into `.venv`, then run `.venv/bin/python scripts/analytics-local-collector.py` and `npm run dev` in separate terminals. The helper disables dotenv, uses disposable data and never replaces an occupied port. Wait at least five seconds for the tracker to flush.

To disable browser collection, rebuild with `ANALYTICS_ENABLED=0`. To restore collector configuration, use the manifest in `/var/backups/visitor_analytics/observatory-20261110T130722375568Z` (before launch) or `observatory-20261110T131007207250Z` (before the Pages-host addition); restore only the listed widget/origin/drop-in files and restart the live unit. Preserve all visitor data.
