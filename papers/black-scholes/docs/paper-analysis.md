# Black-Scholes source and exhibit contract

## Source

Fischer Black and Myron Scholes, **The Pricing of Options and Corporate Liabilities**, *Journal of Political Economy* 81(3), May-June 1973, pp. 637-654. DOI: https://doi.org/10.1086/260062. This is the journal article supplied by the owner, not an SSRN version; no SSRN identifier is invented.

- Authorized reading source: https://www.sfu.ca/~kkasa/BlackScholes_73.pdf
- Original, unchanged local file: `source/BlackScholes_73.pdf` (400,716 bytes).
- SHA-256: `5330ad899867327efd228ad4364a31f804ccdccb84527db29bc367859d6bce9f`.
- 19 physical PDF pages: one JSTOR cover, followed by printed pp. 637-654. Physical PDF page = printed page - 635.
- All article text was extracted and read; the formula on physical page 9 was rendered to check equation (13). The document contains equations, Figure 1, discussion of other claims, empirical qualifications and references; no separate appendix.
- Redistribution rights have not been established. The original remains ignored/private. No copy lives in `public/` or the assembled build; public links use the DOI or the externally hosted reading copy. University hosting is not treated as a republication license.

## Design decisions

| Decision | Record |
| --- | --- |
| Why this paper | Foundational finance mechanism that is unusually clear under manipulation: the option price is a replication cost, independent of the stock's expected return under the model. |
| Reader task | Change price inputs; explain delta as shares per call; change hedge frequency on an unchanged path; split firm assets between equity and debt. |
| Central visual | Call-value curve, expiry payoff and local tangent, with shares-plus-cash identity. Teal marks claims/stock; rust and dashes distinguish payoffs/errors. |
| Foundation | Plain-language replication, live dollar values, assumptions, three labs and one knowledge check. |
| Advanced | Formula, PDE cancellation of physical drift, put-call parity, self-financing bookkeeping, liability valuation and attribution to related Merton work. |
| Mobile/accessibility | Responsive SVG plus live HTML values; native labeled sliders/select; keyboard focus; reduced motion; separate local-storage namespace with fallback. |
| Growth path | Existing verified publisher course Mastering Interest Rate Derivatives, with publisher disclosure through the shared shell. Black's later forward model is related but not implemented here. VaR promotions remain excluded. |
| Related exhibit | SABR makes the flat-volatility limitation concrete. |

Initial design review was explicitly configured through a delegated agent as `gpt-6.1-sol` / `ultra`; the spawn request succeeded. The agent could not independently attest its runtime identifier. Root implementation used the current Codex session (exact host model/reasoning not exposed). Source inspection, implementation and verification ran in the shared Mac workspace for the owner's requested local review, not in a GitHub Actions/cloud generation job. No cloud CI, PR, publication or paid model API call is claimed. The existing SSRN-specific cloud intake requires a numeric SSRN ID and is not applicable to this DOI-only source without a separate workflow change.

## Claim-to-page evidence

| Claim used | Printed page(s) | Physical PDF page(s) | Exhibit treatment |
| --- | --- | --- | --- |
| Idealized market assumptions: constant rate/variance, no dividends, European exercise, frictionless trading, borrowing and shorts | 640 | 5 | Assumptions remain visible above labs. |
| Continuously adjusted local hedge removes diffusion risk under the model | 641-643 | 6-8 | Reconstructed shares/cash identity; discrete hedge explicitly retains error. |
| PDE and terminal condition | 643 | 8 | Advanced derivation, modern notation; calendar t distinguished from remaining tau. |
| Closed-form equation (13), expected stock return absent | 644 | 9 | Pricing lab; mu affects simulated paths only. |
| Delta equation (14) | 645 | 10 | Shares per call; never mislabeled a real-world exercise probability. |
| European put and put-call parity | 647 | 12 | Advanced identity and numerical tests. |
| Equity as call on firm assets; debt as residual | 649-650 | 14-15 | Terminal payoff lab, simple one-debt structure. This insight is already in Black-Scholes. |
| More complicated liabilities require further methods | 651-652 | 16-17 | Explicit limit on simple corporate model. |
| Historical empirical discrepancies and transaction costs | 653 | 18 | Evidence qualification; no current empirical calibration claimed. |
| Merton (1973) is a related contribution | 644, 646-647, references 653 | 9, 11-12, 18 | Contextual link, not a claim to implement all extensions. |

## Numerical/model contract

`S` is stock dollars per share; `K` is strike dollars per share; `tau` is years remaining; `r` is a continuously compounded annual rate; `sigma` is annual volatility (standard deviation). The call and put are European and the stock pays no dividends.

```
d1 = [ln(S/K) + (r + sigma^2/2) tau] / (sigma sqrt(tau))
d2 = d1 - sigma sqrt(tau)
C = S Phi(d1) - K exp(-r tau) Phi(d2)
delta = Phi(d1)
B = C - delta S
```

Pricing defaults: S=K=100, sigma=20%, tau=1, r=5%. UI ranges: S 40-180; K 50-150; sigma 0-80%; tau 0-3 years; r 0-10%. The numerical API also accepts negative rates with discounted-strike bounds. Claims about increasing maturity are restricted to the nonnegative-rate UI. No American exercise claim is made. Sigma=0 and tau=0 use deterministic branches. At a zero-variance or expiry payoff kink, delta is undefined; 0.5 is a flagged display convention and gamma is not defined there. Strike zero is deliberately rejected because all UI contracts require positive strike. Normal CDF uses an Abramowitz-Stegun approximation (CDF error below approximately 7.5e-8; dollar benchmarks tested within 2e-5 at baseline).

The hedge lab fixes the pricing defaults and varies synthetic physical drift mu (-20% to 30%), seed (1973 initially), and 4/16/64/256 equal hedge intervals. Every path has 1,024 exact lognormal GBM transitions. All frequencies sample the same path; no resimulation occurs on frequency change. The 96-path ensemble shares each path across frequencies. There are no jumps, costs, dividends or volatility misspecification.

For a long replicating portfolio, initially buy delta shares with bank balance C - delta*S. At each observation, grow cash at exp(r*dt), mark the existing stock position, then pay for changes in delta from cash. No external cash is injected and the portfolio is not reset to the option price. At expiry settle against the payoff without rebalancing again. Error is undiscounted hedge value minus call payoff. RMS error is sqrt(mean(error^2)) across paths; mean error is signed. Continuous-model convergence does not imply monotonically smaller absolute single-path errors or monotonically improving every finite-sample statistic.

Corporate lab uses terminal total firm assets A_T (0-220), debt face F (40-160), defaults 120 and 100. Equity=max(A_T-F,0); debt=min(A_T,F); both sum to A_T. These are total terminal payouts, not per-share option prices, pre-maturity market prices or calibrated default probabilities. Pre-maturity Advanced equations use **asset** volatility, not equity volatility. Capital structure: one zero-coupon issue, limited liability, no distributions, taxes or bankruptcy costs.

## Reconstruction status and verification

All diagrams, prices and paths are new educational reconstructions. No source figure's illustrative coordinates are presented as observed market data. No historical option prices, company accounts or market forecasts are used.

Analytical checks include independent call/put/delta/vega benchmarks, put-call parity over parameter grids, bounds, expiry/zero-volatility cases, numerical derivatives, cash replication identity, seed reproducibility, nested observations, drift invariance of initial price, one-step financing identity, portfolio conservation at each rebalance, exact deterministic hedging and liability conservation. The ensemble check tests a fixed broad coarse/fine improvement, never single-path monotonicity.

Run `npm run check` at root, followed by `npm run cloud:verify`. Browser verification covers sliders, frequency/path invariance, reset, Foundation/Advanced, quiz, keyboard focus, narrow layout, source routes and library/existing-exhibit regressions. Verification details and artifact references belong in `generation.json` and the paper README.
