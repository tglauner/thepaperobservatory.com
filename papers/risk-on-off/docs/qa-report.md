# Risk Observatory validation

Date: November 8, 2026. Environment: macOS, Node 22.22.1, Chrome 156 via Playwright CLI. Browser checks use the built static site on loopback, rather than relying only on the development server.

## Native tests and build

```bash
npm run check
```

**56 tests passed; zero failed or skipped.** The suite contains 38 mathematical checks and 18 content, privacy and architecture checks. It covers covariance reconstruction, orthonormality, eigenvalue ordering, variance conservation, entropy boundaries, DRP sign choices, volatility-versus-variance stress, basis rotation, simulation reproducibility, invalid inputs, source provenance and publication boundaries.

The final `npm run build` succeeded. The approximately 3.1 MB static output includes the 1.4 MB source PDF, local mathematical fonts and application assets. The application, React runtime and KaTeX typesetting code are separate chunks. No chunk-size warning remains.

## Artifact and architecture checks

The final independent artifact review passed **11 named checks**. All seven HTML resource references, 59 CSS font/image references and four relative JavaScript chunk references resolve locally. The output contains no private project files, source workspace files or symlinks. The original, public and built copies of the paper have the same SHA-256:

```text
e7a4b30973d60ccdf3a99143ce362cd202afff75d435cb3f87d3994afed1c5de
```

The static homepage and `/paper.pdf` returned HTTP 200 with appropriate content types. The architecture audit completed with 12 identical files, 15 intentionally adapted files, one intentionally omitted systemd service, no missing directories, and no symlink or type conflicts. See [the architecture assessment](architecture-assessment.md) for individual checks and the rationale for each adaptation.

## Browser coverage

**53 named browser checks passed; zero failed.** This comprises the 47-check interaction/layout/accessibility procedure, with its contrast findings corrected and retested, plus six final keyboard and wording checks. All ten representative axe-core WCAG 2 A/AA views reported zero violations, and all ten fit without horizontal page overflow. Mobile tests also verified that closed navigation stays out of the tab order, opening moves focus inside, Tab and Shift-Tab wrap within the menu, and Escape closes it and restores focus.

The browser procedure exercises the following behavior:

- Overview presets and keyboard-controlled ellipsoid rotation.
- A perfect two-asset hedge, range-keyboard boundaries, reset and skip-link focus without changing chapters.
- PCA coordinate changes, diagonal covariance, extreme correlation/volatility settings, and visibility of every simulated point.
- Advanced detail disclosure; equal-mode risk, entropy 1, unused fourth-mode normalization, scale invariance and single-mode concentration.
- Pure-PC and equal-mode volatility stress ratios, rotated axes and a JSON scenario download.
- All six source cases and expandable explanations.
- Glossary filtering and closing a populated search with a single Escape press.
- Quiz feedback, persistence across reload and reset.
- Mobile menu operation, chapter navigation, narrow layouts and reduced motion.
- Browser runtime errors and automated WCAG 2 A/AA checks in representative desktop/mobile states.

Final machine-readable per-view results are in [qa-browser-results.json](qa-browser-results.json). Text-color findings from the first scan were corrected and the affected views were rescanned. The last changes after the interaction run were text-color adjustments and a wording correction clarifying that correlation *determines* an angle. No numerical behavior changed.

A separate browser realm with storage deliberately disabled passed four checks: the application loads, quiz feedback works, no runtime error occurs, and every observed runtime request stays on the local origin. Eight local requests were observed in that isolated check. No external feed or font service is needed for normal operation.

## Visual inspection

Desktop layouts were inspected at 1440 × 1050, and mobile layouts at 390 × 844. The inspected pages show no content overlap or clipping. Representative screenshots are saved under the ignored `output/playwright/` directory:

- `overview-desktop.png` and `overview-mobile.png`
- `geometry-desktop.png`
- `components-desktop.png`
- `concentration-desktop.png` and `concentration-mobile.png`
- `stress-desktop.png`
- `glossary-desktop.png`

The verification repaired diagram fitting at parameter extremes, search-field Escape handling, the fourth-mode switch hit area, skip-link routing, mobile focus behavior, and text contrast on pale backgrounds and heatmap cells.

## Interpretation and limits

The mathematical models are synthetic educational examples. Source cards report rounded presentation figures; this is not a reproduction of a market dataset, backtest, or live regime estimator. Component entropy describes variance allocation within a declared covariance basis and universe, without establishing statistical independence or protection from tail losses.

Automated accessibility checks and keyboard/visual checks do not amount to exhaustive testing of every browser and assistive-technology combination. Safari, Firefox and a full VoiceOver reading session were not separately tested.

No production deployment, remote repository creation, commit or push was performed. Local QA servers and automation browsers are stopped after verification. Restart the local application with `npm run dev -- --open`.
