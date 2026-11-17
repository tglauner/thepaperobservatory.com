# Source analysis: Bond Pricing and the Term Structure of Interest Rates

## Bibliographic identity and source custody

- Authors: David Heath, Robert Jarrow, and Andrew Morton.
- Title: *Bond Pricing and the Term Structure of Interest Rates: A New Methodology for Contingent Claims Valuation*.
- Publication: *Econometrica*, Vol. 60, No. 1, January 1992, pp. 77–105.
- Source file: `Bond Pricing and the Term Structure of Interest Rates A New Methodology for Contingent Claims Valuation1992.pdf`, 2,181,301 bytes, 30 physical PDF pages.
- SHA-256: `164ba6d32b06f482b41bbe5829ca18344175bd004e9c8ad426ece659ab75b7ab`.
- The owner supplied the local source PDF. Its canonical bibliographic record is [RePEc](https://ideas.repec.org/a/ecm/emetrp/v60y1992i1p77-105.html).
- The JSTOR cover permits a personal copy but does not establish redistribution rights. The source remains local and ignored by Git; it is not copied into public assets or production output. The public companion links to the canonical record.
- Physical PDF page 1 is the JSTOR cover. Physical page 2 is printed page 77; physical page 30 is printed page 105. Evidence below uses physical PDF page numbers.
- This initial companion was implemented in a local Copilot SDK session. The runtime did not expose exact model or reasoning identifiers, so this record makes no GPT-6.1 Sol/Ultra claim. Cloud job ID: none.

## Why this paper and the reader's task

The central change is where a term-structure model begins. Rather than choose one short rate and derive a curve that may not match the observed market curve, HJM models the entire instantaneous forward-rate curve. Under an equivalent martingale measure, no-arbitrage links the curve's drift to its volatility loadings. Given those loadings and the paper's assumptions, the drift is constrained rather than independently selected.

The lab lets a reader edit an illustrative initial curve, choose simple volatility shapes, compare one and two independent factors, and impose a synthetic move at the five-year maturity. It exposes the risk-neutral drift alongside the response. These are deterministic teaching scenarios, not a market calibration, a statistical forecast, or results reported by the authors.

## Evidence map

| Claim or mechanism | Source location |
| --- | --- |
| A zero-coupon bond price is the exponential of the negative integral of instantaneous forward rates, `P(t,T) = exp(-∫_t^T f(t,u) du)` | Physical PDF p. 5 |
| The paper derives forward-rate dynamics and relates the risk-neutral drift to the volatility structure | Physical PDF p. 15 |
| Market-price-of-risk terms appear in the physical-measure dynamics; the equivalent martingale measure is used for contingent-claim valuation | Physical PDF p. 15 |
| Constant-volatility Ho–Lee example | Physical PDF p. 16 |
| Two-factor example | Physical PDF p. 17 |
| The paper presents a unifying forward-rate framework while also discussing other routes, including equilibrium and short-rate models | Abstract and physical PDF pp. 2, 15–17 |
| The later LIBOR Market Model is explicitly formulated within the general HJM framework | Brace, Gatarek & Musiela (1997), *The Market Model of Interest Rate Dynamics*, DOI `10.1111/1467-9965.00028` |

Page references above are physical pages in the supplied 30-page PDF. Physical p. 1 is a cover and must not be confused with the paper's printed page numbering.

## Model and interpretation

For independent Brownian factors under the risk-neutral measure, the HJM condition is

`df(t,T) = alpha^Q(t,T) dt + sum_i sigma_i(t,T) dW_i^Q(t)`

`alpha^Q(t,T) = sum_i sigma_i(t,T) * integral_t^T sigma_i(t,u) du`.

The displayed equation is the independent-factor form used in the paper's derivation and in the exhibit. A one-factor constant loading reduces to `alpha^Q(t,T) = sigma^2 (T-t)`. With multiple independent factors, each factor contributes its own loading times its maturity-integrated loading.

This is a risk-neutral drift condition for contingent-claim pricing, not a statement that physical expected returns contain no risk premium. The paper's physical-measure drift includes market-price-of-risk terms; changing to the equivalent martingale measure absorbs these into the measure change. Nor does no-arbitrage choose the volatility surface or uniquely calibrate the market.

The lab interpolates the user's piecewise-linear starting curve across maturities. Its volatility functions are deterministic parallel, short-end, or five-year-hump loadings. The one-step update uses the HJM drift and a single Brownian-increment scenario over one quarter year. The five-year shock is conditioned to land at the selected move after including drift; the two-factor path includes an additional fixed parallel-factor increment. Nothing is estimated from rates data.

The early 1990s HJM framework is foundational to the modern arbitrage-free forward-rate-model family. The late-1990s LIBOR Market Model (also known as BGM) is a direct descendant explicitly studied within HJM. This does not mean that every stochastic interest-rate model derives from HJM: equilibrium and short-rate model traditions are distinct.

## Accuracy checks and limitations

- Constant one-factor volatility matches the analytic drift `sigma^2 * (T-t)`.
- Independent constant-factor contributions add to the drift.
- Exponentially decaying volatility matches its analytic integral within numerical integration tolerance.
- A conditioned five-year factor shock reaches its chosen forward-rate move after drift.
- Curve interpolation preserves knot values and linearly fills the maturity grid.
- No historical curve or market calibration is reproduced. Parameter values, factor shapes, factor shocks, and all displayed paths are synthetic.
- The Euler update is a single educational step, not a production pricing engine. The HJM condition constrains drift conditional on chosen volatility and measure; it does not make the volatility assumption empirically correct.

## Growth path

The verified recommendation is *Mastering Interest Rate Derivatives*, selected in the shared project configuration. The course is optional and presented through the shared commercial-course continuation pattern.
