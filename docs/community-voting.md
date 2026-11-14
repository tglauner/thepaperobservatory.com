# Community paper selection

The public voting page is **https://thepaperobservatory.com/next/**. It links from the library navigation and invitation panel. Share the page or an individual `#paper-<ssrn-id>` link; posting to external sites remains a separate owner action.

## Product and evidence

- Browse the 100-record finance/AI citation-candidate excerpt, with search, review filters and 20-row pagination. The page labels incomplete eligibility and date evidence rather than calling it a verified global top 100.
- Vote on 20 editorially selected papers. The shortlist includes source-section-reviewed leads outside the archive excerpt. Five editorial picks introduce policy-language measurement, rare-event fraud detection, news timing, credit explanations and simulated trading-agent interaction.
- Choose zero to three distinct paper IDs. Choices have equal weight, not ranked positions. Zero choices withdraws a previous ballot. Saving replaces the same browser's earlier choices; it does not add another ballot.
- Editorial picks are suggestions for future educational exhibits, not promises of author endorsement, completed reproductions or financial recommendations.

`content/research-poll.json` is the frozen public round definition and drives both browser presentation and the API's ID allowlist. It contains original teaching concepts and metadata only, not PDFs, copied abstracts or private source text. The archive derives from `docs/research/finance-ai-2026-11-14/citation-ranked-candidates-top-100.csv`. The shortlist derives from the documented selected-section review and `scout-deep-dives.md`; preserve exact reviewed versions when implementing an exhibit.

## Minimal runtime exception

The website and paper companions remain static Cloudflare Pages artifacts. Anonymous shared voting is the explicitly authorized exception: a separate Cloudflare Worker and D1 database. It does not add an application server, login, third-party poll vendor or runtime model call.

| Resource | Configuration |
|---|---|
| Worker | `paper-observatory-voting` |
| API | `https://paper-observatory-voting.glaunertim.workers.dev` |
| Database | `paper-observatory-votes` |
| Binding | `DB`, configured in `services/voting/wrangler.jsonc` |
| Round ID | `finance-ai-2026-11` |
| Worker secret | `RATE_SALT`; value belongs only in Cloudflare's secret store |

`GET /results` returns the round ID, nonempty ballot count and aggregate per-paper counts. `GET /ballot` and `PUT /ballot` require a random UUID-v4 bearer key. The browser stores this key under `observatory-ballot:finance-ai-2026-11`; the database stores a round-specific SHA-256 hash, selected IDs and update timestamp. Do not copy ballot keys into logs, URLs, analytics or screenshots.

The API validates membership, uniqueness, maximum choice count, JSON content type, request size (2 KiB) and origin. SQL is parameterized. Results use a D1 batch for a consistent snapshot; ballot replacement and expired-rate-record cleanup are transactional. Responses are not cached. Production origins include the canonical domain, project Pages domain and project preview deployments.

Writes are limited to 60 updates per network address per hour using a secret-salted hash; the database does not store raw IP addresses. Limit records expire after two hours and are removed on later writes. Anonymous browser keys and network limits **cannot establish one person per ballot**; multiple devices, cleared storage and deliberate automation remain limitations. Use the results as indicative preferences, not a verified election. No paid plan was activated for this feature; existing provider limits and infrastructure request processing still apply.

An empty saved ballot retains the hash and timestamp but contributes no votes. Clear choices and save to withdraw before clearing browser storage. Clearing site data alone loses access to the prior ballot rather than deleting it. Retire a round deliberately and review retained ballot data at that point. Public privacy text is generated from `scripts/render-pages.mjs`.

## Validation and release

```bash
npm test
npm run build
npm run cloud:self-check
npm run cloud:verify
node --test tests/voting.test.js
```

Voting tests exercise a real in-memory SQLite schema and API handler, including replacement, withdrawal, separate browsers, maximum choices, disallowed origins, oversized requests, network limits and round isolation. Browser checks additionally cover actual Worker/D1 requests, saved-ballot restoration, keyboard input, filtering, sorting, deep links, archive pagination and mobile cards.

For the already-created production database, do not recreate or overwrite it. For a new environment only, initialize its empty schema:

```bash
npx --yes wrangler@4.158.0 d1 execute paper-observatory-votes \
  --remote --config services/voting/wrangler.jsonc \
  --file services/voting/schema.sql
```

Set `RATE_SALT` using `wrangler secret put` with secure interactive input; never put the value in tracked configuration or a browser build variable. Production was provisioned with a randomly generated secret passed via stdin without printing its value.

Deploy API changes separately:

```bash
npx --yes wrangler@4.158.0 deploy --config services/voting/wrangler.jsonc
curl -fsS https://paper-observatory-voting.glaunertim.workers.dev/results
```

The static website must still be released from a successful cloud CI `public-site` artifact using [the publishing runbook](cloud-publishing.md). Do not copy the Worker, schema, source data folder, credentials or local D1 state into the Pages artifact. `VITE_VOTING_API` is an optional **public** development endpoint override; no private credential belongs in it.

For isolated local verification, use a local D1 database, run Wrangler dev with `ALLOWED_ORIGINS` set to the chosen loopback frontend origin and a nonproduction `RATE_SALT`, then start Vite with `VITE_VOTING_API` pointing at the local Worker. Local tests never mutate production ballots.

## Rollback and future rounds

Keep the previous Pages release **575361ab-bbad-4762-9a9b-ddceafd49b79** available. Restore it through Cloudflare Pages rollback if the new website fails. The voting API is additive and independent; rolling back the static website does not require deleting ballots or the database. Use Worker deployment/version rollback for an API regression and preserve D1 data. Never "roll back" by dropping the database.

For a new round, deliberately change the round ID, browser namespace and curated IDs in the shared definition, deploy the API and matching static artifact together, and retain or retire the previous round according to the stated retention policy. Do not silently change the meaning of an existing paper ID while retaining its votes.
