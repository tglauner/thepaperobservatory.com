# Risk Observatory paper memory

## Scope

This folder owns the first paper's complete website within the Paper Observatory collection. Shared operating rules and current collection context are in `../../AGENTS.md` and `../../MEMORY.md`; shared architecture is `../../docs/architecture/ARCHITECTURE.md`.

## Durable decisions

- Source: Marcos López de Prado, *Managing Risks in a Risk-On/Risk-Off Environment*, SSRN 2150877, a 50-slide presentation.
- The original is `ssrn-2150877.pdf` in this folder; `public/paper.pdf` is its reading copy. SHA-256: `e7a4b30973d60ccdf3a99143ce362cd202afff75d435cb3f87d3994afed1c5de`.
- React/Vite, browser-side numerical functions and local assets. Four risk labs, overview, evidence, 16-term glossary and eight-question quiz. Foundation is the fresh-browser default.
- The application base is `/risk-on-off/`. Source/public links use `import.meta.env.BASE_URL`. The collection proxies this prefix on port 5173 to the direct development server on 5174; direct preview uses 4174. Assembled collection preview uses 4173.
- Root npm workspaces share dependencies and one lockfile. Run installation at the collection root. Paper source, content, tests, analysis, generated build and screenshots stay in this folder; common status/agent/privacy configuration stays at the workspace root.
- Preferences retain the `risk-observatory` namespace. Direct ports and collection origin have separate browser storage.
- Source-reported futures cases are rounded illustrations; interactive returns and covariance inputs are synthetic. This is not a market backtest or live regime signal.
- A 2× mode-volatility shock means a 4× eigenvalue shock. Preserve the distinction between asset/component risk contributions, between variance/volatility, and between uncorrelated/independent risks. Entropy requires a declared basis and investment universe.
- The shared Architecture Library baseline is `tgir-app` at revision `73db307deded2c1cba0ce0b58fd761216b3d470b`, adopted on 2026-11-08. The library was clean and already up to date. The current collection is an explicit static multi-site adaptation.

## Verified commands

From collection root:

```bash
npm ci
npm start
npm test --workspace papers/risk-on-off
npm run build --workspace papers/risk-on-off
npm run preview --workspace papers/risk-on-off
```

From this folder, use `npm run dev -- --open`, `npm test`, `npm run build` or `npm run preview`. The direct site URL is `http://127.0.0.1:5174/risk-on-off/`.

## Verification and maintenance

The native risk suite passes 56 checks: 38 mathematical and 18 architecture/content/privacy checks. The move preserves source hashes and mathematical behavior; collection-root checks validate routing and folder boundaries.

Historical QA before the collection migration passed 53 browser checks and ten representative accessibility views, plus four disabled-storage/local-network checks. Its report/JSON and screenshots remain under this folder's `docs/` and `output/playwright/`. Treat its old root URLs as historical; current migration/regression results are recorded in `../../docs/qa-report.md`.

The glossary's Escape handling must intercept the search field's default Escape behavior. Mobile navigation keeps closed links out of the tab order and contains focus when open. Preserve keyboard focus and reduced-motion behavior when extending the UI.

The entire status lifecycle and private `confidential/` area remain at workspace root. External notifications are disabled; do not create another paper-local status subsystem. No deployment, remote repository creation, commit or push accompanied this move.
