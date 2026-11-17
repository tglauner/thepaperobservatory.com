# The Black-Scholes Observatory

Three interactive reconstructions of Black and Scholes (1973), *The Pricing of Options and Corporate Liabilities*: option price/delta and shares-plus-cash replication; self-financing discrete hedging on common seeded paths with a 96-path comparison; and corporate equity/debt terminal payouts. Foundation and Advanced views include source links, assumptions, a glossary and a knowledge check.

From the repository root:

```bash
npm ci
npm start
```

Open http://127.0.0.1:5173/black-scholes/. For an isolated exhibit:

```bash
npm run dev --workspace papers/black-scholes
```

Open http://127.0.0.1:5178/black-scholes/. For the complete built collection, with all cross-links available:

```bash
npm run check
npm run cloud:verify
npm run preview
```

Open http://127.0.0.1:4173/black-scholes/. Built preview avoids conflicts with existing exhibit development servers. Stop a server with Control-C in its terminal; preserve servers owned by other tasks.

Validation: `npm run test --workspace papers/black-scholes` tests the pricing and payoff identities, financing cash flows, common paths and limiting cases. Root `npm test` and `npm run build` include all five exhibits. Preview serves the assembled `dist/` with no development proxies. This work is prepared for local owner review; no commit, cloud CI or publication is implied.

The unchanged source PDF is ignored/private at `source/BlackScholes_73.pdf`. SHA-256: `5330ad899867327efd228ad4364a31f804ccdccb84527db29bc367859d6bce9f`. Nineteen physical pages include a cover: printed p. 637 = PDF page 2. No public PDF redistribution rights have been established. Read the [publisher record](https://doi.org/10.1086/260062) or [university-hosted copy](https://www.sfu.ca/~kkasa/BlackScholes_73.pdf), and see [the evidence map](docs/paper-analysis.md).

The labs use idealized European options with no dividends and no transaction costs. The seeded hedges are synthetic and retain discrete error. Finer rebalancing need not improve any particular path at every step. The corporate chart shows terminal payouts for a single zero-coupon debt issue. Storage key `black-scholes-observatory:depth` is independent of other papers; the quiz stays in component memory. No new services or dependencies are introduced.

To undo this addition, remove the Black-Scholes workspace, catalog/static library card, rates-course mapping, its social concept and workspace test registration; regenerate the lockfile and collection build. Preserve all unrelated pre-existing edits and other workspaces.

Local acceptance on 2026-11-17: all **194** root/workspace tests passed, including **22** new numerical checks; all five companions plus the library built successfully; publication scan passed **167** public files. Thirty browser checks passed at desktop and 390px width, including keyboard controls, reset, persistence, path invariance and the library search. The browser reported no console errors. QA images stay ignored under `output/playwright/`; [generation metadata](docs/generation.json) records execution/provenance without claiming cloud CI or publication.
Existing Risk, Flow, SABR and HJM controls also passed browser regressions at desktop and 390px width; the new reading guide works with JavaScript disabled. Final chart legend colors and replication units were checked after the last build.
