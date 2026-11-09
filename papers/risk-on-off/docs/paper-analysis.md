# Source analysis: Managing Risks in a Risk-On/Risk-Off Environment

## Bibliographic and source status

- Author: Marcos López de Prado; the cover identifies Lawrence Berkeley National Laboratory, Computational Research Division.
- Title: *Managing Risks in a Risk-On/Risk-Off Environment*.
- Local source: `ssrn-2150877.pdf`, 50 pages, each a presentation slide. The PDF creation/modification metadata is May 25, 2014. This establishes the file generation date, **not** the original SSRN publication date.
- Persistent source landing page: <https://ssrn.com/abstract=2150877>.
- This is a conceptual presentation, not a self-contained empirical research article. Slide 49 identifies the fuller paper as Bailey and López de Prado, *Balanced Hedging and Trading Baskets*, <https://ssrn.com/abstract=2066170>.
- The author-hosted full text at <https://www.davidhbailey.com/dhbpapers/trading-baskets.pdf> was checked separately. Its actual cover title is *Balanced Baskets: A New Approach to Trading and Hedging Risks*, by David H. Bailey and Marcos López de Prado, Journal of Investment Strategies, Fall 2012. It compares basket algorithms; its introduction explicitly leaves an empirical performance study outside its scope.
- All page numbers below refer to the 1-based PDF page/slide number; the printed slide numbers match the PDF pages where present.
- The source PDF includes an all-rights-reserved notice (p. 50). The educational site should use original explanations and illustrations, with source attribution and page links, rather than reproduce entire slides.

## Central argument

Controlling a portfolio's overall estimated variance is different from controlling where that variance comes from. Many instruments can amount to one common exposure. Rotate the covariance matrix into its orthonormal eigenbasis, express the portfolio in that basis, and measure the distribution of variance contributions. A portfolio concentrated in one component is particularly sensitive when that component's variance changes. Equalizing contributions in this basis produces the presentation's Diversified Risk Parity (DRP) construction.

This is a framework for **second-moment risk decomposition** and scenario analysis. The presentation does not supply a regime detector, return forecasts, live prices, an out-of-sample backtest, performance guarantee, or a causal model of risk-on/risk-off transitions.

## Teaching sequence and equations

### 1. Correlation as geometry (pp. 4–9)

For two weighted asset exposures with nonnegative lengths `a = |w_A| σ_A` and `b = |w_B| σ_B`, use the effective correlation of those exposures. For positive holdings the familiar formula is:

`σ_p² = w_A² σ_A² + w_B² σ_B² + 2 w_A w_B σ_A σ_B ρ_AB`.

If representing asset-return vectors with a shared origin, the angle is `φ = arccos(ρ_AB)` and the variance is the squared length of the vector sum. The triangle's internal supplementary angle `θ` gives `ρ = -cos θ`; do not confuse these conventions. With equal positive vol exposures, `ρ = 1, 0, -1` give volatility `2σ`, `sqrt(2)σ`, and `0`, respectively.

For signed holdings, draw the weighted vectors or keep the signed cross term explicitly. Anticorrelation plus a short position can amplify risk.

### 2. Covariance eigendecomposition (pp. 11–16)

For a symmetric positive semidefinite covariance matrix:

`V = Z Λ Zᵀ`, `Zᵀ Z = I`, `V z_i = λ_i z_i`, `λ_1 ≥ ... ≥ λ_n ≥ 0`.

The columns `z_i` are orthonormal principal-component portfolio directions. Their return/price-change projections have covariance `Λ` and are therefore uncorrelated under `V`.

For portfolio holdings `w`, factor loadings are `f = Zᵀ w`, reconstruction is `w = Z f`, and:

`σ_p² = wᵀ V w = fᵀ Λ f = Σ_i λ_i f_i²`.

Undergraduate reading: rotate the coordinate axes until covariance cross terms disappear. Early PhD reading: this is the spectral theorem for a symmetric matrix, and the variance identity follows by substitution.

Original illustration: covariance ellipsoid plus principal axes and a transformed scatter cloud. Explain that an ellipse is a chosen probability contour under an elliptical model, not a hard boundary that contains every sample point.

### 3. Asset contribution versus component contribution (pp. 18–20)

Normalized Euler asset contributions to variance (equivalently normalized contributions to volatility) are:

`a_i = w_i (Vw)_i / (wᵀVw)`.

They sum to 1 but may be negative because individual instruments can hedge each other. They should not be used as entropy probabilities.

Component variance shares are:

`p_i = λ_i f_i² / Σ_j λ_j f_j²`.

They are nonnegative and sum to 1 whenever total variance is positive. They are suitable for an entropy calculation. They describe variance attribution, not probabilities of profit or loss.

### 4. Rayleigh quotient and scenario shocks (pp. 22–25)

`R(w,V) = (wᵀ V w)/(wᵀ w)` for nonzero `w`.

The leading eigenvector maximizes this quotient, the final eigenvector minimizes it, and intermediate eigenvectors are stationary directions (generally saddle points on the unit sphere). The slides' broad language suggesting that every eigenvector maximizes risk should be taught with this mathematical qualification.

If a fixed basis is retained and eigenvalue `λ_k` is multiplied by `m ≥ 0`:

`σ_new²/σ_old² = 1 + (m - 1) p_k`.

Consequently `σ_new/σ_old = sqrt(1 + (m - 1) p_k)`.

If the control is instead a **mode-volatility multiplier** `q`, then `m = q²` and the ratio is `sqrt(1 + (q² - 1)p_k)`.

**Important source-reading correction:** the PDF text extractor drops some square-root symbols. Visual inspection of p. 25 shows a 100% increase in `sqrt(Λ_11)`, **not** a 100% increase in `Λ_11`. The slide doubles the first mode's volatility, which quadruples its eigenvalue. Its claim that pure-PC1 portfolio risk doubles is therefore internally consistent. For equal risk across three modes, that same scenario changes volatility by `sqrt(2) ≈ 1.414`, while pure-PC1 changes by `2`. The author calls the before and after curves “risk-off” and “risk-on”; a website should prefer “baseline” and “PC1 volatility shock” because real-world regime labels are not defined by this one parameter.

Compare portfolios at equal baseline volatility if the educational question is sensitivity at the same initial risk. Compare at equal Euclidean holdings norm if illustrating the Rayleigh quotient. State which normalization is used; they answer different questions.

### 5. Entropy and effective number of bets (pp. 28–30)

Shannon entropy of component shares: `S = -Σ_i p_i ln(p_i)`, with `0 ln 0 := 0`.

Effective number of component bets: `N_eff = exp(S)`.

The presentation's normalized portfolio entropy is:

`H_Ent = (N_eff - 1)/(n - 1)` for `n > 1`.

Thus a single positive share gives `(N_eff, H) = (1, 0)` and equal positive shares over all `n` modes gives `(n, 1)`. This normalized exponential entropy is **not** `S/ln(n)`. Show both `N_eff` and `H` to make the scale interpretable.

Scaling all holdings by a nonzero constant leaves `p`, `N_eff`, and `H` unchanged; volatility changes by the absolute scale. High entropy does not imply low volatility.

Zero-total-variance portfolios have undefined normalized shares and should show a clear “no modeled variance” state, not fake maximum diversification. For one mode the normalized formula has a zero denominator; show `N_eff = 1` and mark normalized entropy not applicable.

### 6. DRP and alternative baskets (pp. 34–40)

Equal component variance contributions satisfy `λ_i f_i² = c²`. Thus:

`f_i = s_i c/sqrt(λ_i)` for positive eigenvalues and signs `s_i ∈ {-1,+1}`; `w = Z f`.

The displayed p. 39 formula uses the particular normalization `f_i = sqrt(λ_1/λ_i)` and then transforms back. Visual inspection confirms the square root.

DRP is not a unique investable portfolio without choices of signs, scale and portfolio constraints. It can require short positions or large offsetting holdings. A nearly zero eigenvalue requires very large mode loading; a zero eigenvalue cannot carry a positive variance contribution at finite holdings. In the site use a positive-definite toy covariance matrix and explain this condition.

ERC equalizes **asset** contributions, DRP equalizes **component** contributions. They answer different balancing questions and need not coincide. The presentation also discusses Maximum Diversification Ratio (MDR, p. 38) and Mini-Max Subset Correlation (MMSC, p. 40). These can be an advanced comparison rather than unimplemented optimization controls.

If blending an original portfolio with DRP, blend the actual holdings and then recompute loadings and shares. Component shares are quadratic and generally do not interpolate linearly.

## Source-reported numerical examples

These are **reported illustrative futures portfolios**. The presentation provides rounded values and does not supply the underlying observations, exact covariance matrices, timestamps, sampling intervals or a reproducible empirical dataset. Do not label them backtests or claim an exact replication from their rounded tables.

| PDF pages | Example | Reported results | Teaching use |
|---|---|---|---|
| 19–20 | US 2y, 5y, 10y Treasury note futures, holdings `(90, -448, 206)` | Asset shares `(-0.38, 2.98, -1.60)`; component shares each `0.33`; eigenvalues `(315699, 9569, 1347)` | Large and negative asset contributions can coexist with equal component risk. Rounded asset shares sum to 1. |
| 30 | Same rates portfolio, and then an expanded universe including EUR/USD futures | Rates-only entropy `1.00`; expanded-universe entropy `0.76`; implied correlation `0.98` in both; expanded component shares approximately `(0.03, 0.31, 0.33, 0.33)` | Diversification is relative to the specified universe, not a property of holdings alone. The newly available instrument need not be held to change the benchmark basis. |
| 32 | E-mini S&P 500, copper and Italian government bond futures, holdings `(50, 500, 150)` | Component shares `(0.98, 0.02, 0.00)`; entropy `0.05`; implied correlation `0.00`; asset shares `(0.02, 0.99, -0.01)` | Low reported implied correlation can coexist with substantial component concentration. |
| 33 | Four US Treasury futures, holdings `(-39, 974, -576, 57)` | Component shares each `0.25`; entropy `1.00`; implied correlation `0.98`; asset shares `(-0.07, 2.72, -1.91, 0.26)` | High implied correlation does not preclude equal component contributions. |
| 34 | A reported 50% blend of the p. 32 concentrated portfolio with DRP | Holdings `(307, 362, 664)`; component shares `(0.74, 0.15, 0.11)`; entropy `0.56`; implied correlation `-0.01` | Rebalancing component exposures improves this concentration measure; mixing holdings does not linearly mix shares. |
| 37 | ERC basket of S&P 500, Dow and US Treasury futures | Asset shares each `0.33`; component shares `(0.15, 0.85, 0.00)`; entropy `0.27`; implied correlation `-0.20` | Asset risk parity need not equal component risk parity. |

The p. 32 normalized entropy calculated from rounded `(0.98, 0.02, 0)` is approximately `0.0515`, consistent with the displayed `0.05`. The p. 37 rounded shares give approximately `0.263`, close to the displayed `0.27`; attribute small differences to rounding rather than force exact reconstruction.

## Critical qualifications for the website

1. **Uncorrelated is not independent.** PCA removes covariance cross terms under the chosen model. Nonlinear dependence and common tail events can remain; joint Gaussian variables are a special case where uncorrelatedness implies independence.
2. **The full covariance matrix contains the information used here.** The reasonable criticism is that a single average/implied correlation or a short regression summary does not reveal all directions of concentration. Avoid teaching that all correlation analysis is inherently incapable of describing multivariate second moments: the covariance matrix is precisely what PCA decomposes.
3. **Basis and units matter.** Changing the investable universe, instrument scaling/units, covariance estimation window or covariance-versus-correlation PCA changes the decomposition. The futures examples are holdings in contracts and covariance of changes, not automatically fully invested dollar weights.
4. **Entropy depends on the chosen basis.** Eigenvector signs do not affect squared shares. With repeated eigenvalues, eigenvectors within the degenerate subspace can rotate without changing `V`; component entropy is therefore not invariant to every valid eigenbasis. Near-tied eigenvalues can make estimated individual directions unstable.
5. **Estimated covariance is uncertain.** Sample error, nonstationarity and small eigenvalues can materially affect DRP holdings. The presentation is not evidence that this balancing rule produces superior realized returns.
6. **Covariance risk is only one dimension.** Volatility and entropy do not summarize liquidity, transaction costs, leverage, margin calls, jumps, skewness, drawdowns or tail dependence.
7. **The bridge is an analogy.** The presentation refers to Tacoma Narrows and aeroelastic flutter (p. 26). Do not recast the collapse as a simplistic proof of resonance or imply that a covariance matrix generates physical feedback dynamics in portfolios. An original mode illustration can explain eigenvectors without historical engineering claims.
8. **Risk-on/risk-off is an interpretive context.** The site models a selected covariance shock with fixed holdings and, for clarity, fixed eigenvectors. Real structural changes may rotate the eigenvectors as well as change the eigenvalues.

## Recommended educational exhibits

All new charts should say **“Illustrative model — synthetic inputs”**, except static cards explicitly identified as values reported in the source.

1. **Geometry bench:** correlation slider `[-1,1]`, fixed or adjustable asset volatilities, weighted vector sum, ellipse/scatter, numerical covariance term and portfolio volatility. Show endpoints and signed holdings correctly.
2. **Rotate the lens:** animate or scrub from asset axes into principal-component axes, with a seeded synthetic cloud; show the covariance before and diagonal covariance after. Keep “uncorrelated” language.
3. **Portfolio mixer:** holdings or principal-loading controls, asset contribution bars (can go negative), component variance-share bars, volatility and entropy. Presets for one mode, equal component risk, and mixed concentration. Clearly distinguish factor holdings from asset holdings.
4. **Regime stress lab:** control first-mode volatility multiplier `q`, compare equal-baseline-volatility concentrated and DRP portfolios; show `sqrt(1+(q²-1)p_1)`. Baseline `q=1`, source-inspired scenario `q=2`, use fixed basis and holdings. No fabricated market history.
5. **Information lens:** use adjustable normalized component shares to illustrate Shannon entropy, effective bets and normalized entropy. Add an unused independent mode to show relative-universe effects: `(1/3,1/3,1/3)` has `N_eff=3,H=1`; `(1/3,1/3,1/3,0)` has `N_eff=3,H=2/3`. Label this as a simplified model, distinct from the correlated expanded-universe source example (`H=0.76`).
6. **Source evidence cards:** pp. 32, 33 and 37 are the most effective juxtaposition. Show the reported implied correlation and entropy together, without estimating new correlations from rounded eigenvectors.
7. **Graduate notes:** optional derivations for the variance identity, Rayleigh extrema, Euler asset contributions, normalized entropy and DRP; discuss basis instability and estimation. Undergraduate pathway should work without opening these notes.
8. **Checks for understanding:** meaningful questions with explanations: many holdings versus many bets; uncorrelated versus independent; variance versus volatility shock; asset ERC versus DRP; what leverage changes and what entropy leaves unchanged.

## Selected references as cited by the presentation

- Bailey, D. and M. López de Prado (2012). *Balanced Hedging and Trading Baskets*. Journal of Investment Strategies 1(4). <https://ssrn.com/abstract=2066170>.
- Choueifaty, Y. and Y. Coignard (2008). *Toward Maximum Diversification*. Journal of Portfolio Management 34(4), 40–51.
- Demey, P., S. Maillard and T. Roncalli (2010). *Risk-based indexation*.
- Kritzman, M., Y. Li, S. Page and R. Rigobón (2010). *Principal Components as a Measure of Systemic Risk*. MIT Sloan Working Paper 4785-10.
- Litterman, R. and J. Scheinkman (1991). *Common Factors Affecting Bond Returns*. Journal of Fixed Income.
- Lohre, H., U. Neugebauer and C. Zimmer (2012). *Diversifying Risk Parity*.
- López de Prado, M. and D. Leinweber (2012). *Advances in Cointegration and Subset Correlation Hedging Methods*. Journal of Investment Strategies 1(2), 67–115. <https://ssrn.com/abstract=1906489>.
- Meucci, A. (2005). *Risk and Asset Allocation*. Springer.
- Meucci, A. (2010). *Managing Diversification*. Risk (April), 74–79.
