# Paper library verification

Verified 2026-11-08. The requested local collection and second-paper visualization are complete.

## Results

| Check | Result |
| --- | --- |
| Native tests | 116 passed: 12 collection/migration, 56 first-paper, 41 second-paper numerical, 7 second-paper content |
| Production builds | Library and both paper applications passed; assembled under root `dist/` |
| Browser checks | 70 passed, zero failures, against the assembled production build on port 4173 |
| Accessibility | 16 desktop/mobile views passed axe-core WCAG 2 A/AA rules; additional keyboard, focus, Escape and reduced-motion checks passed |
| Migration integrity | Both independent folders complete; all eight source/public/build PDF copies match their source hashes |
| Static artifacts | HTML, CSS and JavaScript resource references resolve; five HTTP routes match built files byte for byte |

Reproduce the native checks and all builds from the workspace root:

```bash
npm ci
npm run check
npm run preview
```

The browser results are preserved in [qa-browser-results.json](qa-browser-results.json). The independent [migration and artifact inspection](migration-qa.md) records hashes, response sizes, MIME types and resource checks. Automated accessibility checks and the targeted keyboard checks are useful coverage, rather than a complete manual accessibility audit.

## Interactive coverage

The second paper's five experiments were exercised with concrete expected responses: signed contributions and link removal; stable and persistent source impulses; discrete animation, additive accumulation and JSON export; complex eigenvalues, transient amplification and an unexcited explosive mode; second-lag echoes and boundary alternation; seeded uncertainty and collapse to a single outcome when innovation variance is zero. Source-page links, six evidence cases, glossary filtering and dismissal, quiz feedback/persistence/reset, advanced content, mobile navigation focus containment and back-navigation to the library passed.

The migrated first paper retains its own PDF, routes and numerical behavior. A browser regression confirmed three effective bets for the equal-mode-risk example. Desktop overview and mobile geometry screens passed accessibility and overflow checks. Both applications retain independent preference and quiz namespaces. No browser runtime exceptions were detected.

Corrections made during verification include accessible naming for the initial-shock selector, library-label contrast, quiz-reset-button contrast and mobile styling order. The collection preview explicitly disables the development proxy so production checks actually serve the assembled files. All reported results reflect the corrections; the earlier failed attempts are superseded by the final successful checks.

## Visual review

Screenshots were reviewed for text, chart-label placement, navigation and mobile overflow:

- [Library desktop](../output/playwright/library-desktop.png) and [mobile](../output/playwright/library-mobile.png).
- [Second-paper overview](../papers/stochastic-flow-diagrams/output/playwright/overview-desktop.png), [network](../papers/stochastic-flow-diagrams/output/playwright/network-desktop.png), [impulse](../papers/stochastic-flow-diagrams/output/playwright/impulse-desktop.png), [feedback](../papers/stochastic-flow-diagrams/output/playwright/feedback-desktop.png), [memory](../papers/stochastic-flow-diagrams/output/playwright/memory-desktop.png), [uncertainty](../papers/stochastic-flow-diagrams/output/playwright/uncertainty-desktop.png) and [quiz](../papers/stochastic-flow-diagrams/output/playwright/quiz-desktop.png).
- [Second-paper mobile network](../papers/stochastic-flow-diagrams/output/playwright/network-mobile.png), [feedback](../papers/stochastic-flow-diagrams/output/playwright/feedback-mobile.png) and [uncertainty](../papers/stochastic-flow-diagrams/output/playwright/uncertainty-mobile.png).

## Evidence and handoff

The source-preset matrices and shock reproduce the supplied article's declared examples. Custom coefficients, AR(2) settings and Gaussian simulation bands are explicitly labeled teaching extensions. The site distinguishes prediction from causal identification, outcome variation from parameter uncertainty, period changes from cumulative effects, and discrete-time stability from the paper's overly broad appendix wording. These are educational reconstructions; the application does not fit new empirical market models.

The user-facing local development collection remains available at http://127.0.0.1:5173/, including `/risk-on-off/` and `/stochastic-flow-diagrams/`. Restart with `npm start` from the workspace root. Temporary QA preview and automation browsers are closed after verification. No website was deployed and no remote Git operation was performed. The original first-paper QA documents remain historical inside its own folder.
