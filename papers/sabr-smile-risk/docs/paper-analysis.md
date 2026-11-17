# Source analysis: Managing Smile Risk

## Bibliographic identity and source custody

- Authors: Patrick S. Hagan, Deep Kumar, Andrew S. Lesniewski, and Diana E. Woodward.
- Title: *Managing Smile Risk*.
- Publication: *Wilmott Magazine*, 2002, Vol. 1, pp. 84–108.
- Source file: `Managing_Smile_Risk.pdf`, 599,747 bytes, 45 physical PDF pages.
- SHA-256: `6b177fe35f1f5f403ea2ce49e476bd00c08253d1c01d5659664032353e3e686e`.
- Authorized intake URL supplied by the owner: `https://raw.githubusercontent.com/yuba316/SABR_Volatility_Arbitrage/f41582981616ffc0689f46f4ab542b85e7abcf4d/reference/Managing_Smile_Risk.pdf` (pinned Git commit).
- The source copy is retained locally and ignored by Git. No redistribution rights were established. Public builds remove all PDFs and link to the supplied source URL.
- Physical page 1 is a publication/repository cover; the article starts on physical PDF page 2. The article's internal page numbering begins at 1. The source copy also includes appendices after the main article; website links use physical PDF pages.
- Initial design and implementation were completed in this local Copilot SDK session because the owner asked for local testing. The runtime's exact model/reasoning identifiers were not exposed to this workspace; this work does not claim GPT-6.1 Sol/Ultra or cloud generation. Cloud job ID: none.

## Why this paper and the reader's task

The article's teachable mechanism is the difference between fitting an implied-volatility smile at one instant and predicting how it moves when the forward changes. A reader adjusts alpha, beta, rho, and nu, then applies a one-standard-deviation forward shock and observes the resulting SABR smile alongside a directional local-volatility sketch.

## Evidence map

| Claim or mechanism | Source location |
| --- | --- |
| Local volatility can fit option prices at a snapshot but its predicted smile movement conflicts with the behavior described by the authors | Physical PDF pp. 2, 5–7 (abstract and local-volatility discussion) |
| SABR gives the forward and its volatility factor stochastic dynamics, with correlation rho | Physical PDF p. 10, equations 2.15a–2.15c |
| The paper derives an implied-volatility approximation using singular perturbation techniques | Physical PDF pp. 10–11, equations 2.17a–2.17c and accompanying discussion |
| Forward changes move the smile along the backbone; correlation and vol-of-vol shape the skew | Physical PDF pp. 11–14, section 3 and figures |
| Application to USD interest-rate options and market-surface examples | Physical PDF pp. 14–20 |
| Interest-rate options, swaptions, caps and floors are framed in the pricing appendix | Physical PDF pp. 20–23 |
| Detailed singular-perturbation analysis and normal/lognormal special cases | Physical PDF pp. 24–45, appendices |

Page references above are physical pages in the supplied 45-page PDF; they are not claims about the magazine's pagination.

## Model and interpretation

Under the forward measure, the paper specifies

`dF_hat = alpha_hat * F_hat^beta * dW1`

`dalpha_hat = nu * alpha_hat * dW2`, with `dW1*dW2 = rho*dt`.

The alpha, beta, rho, and nu controls are illustrative. The smile uses the Hagan et al. asymptotic implied-volatility approximation for beta greater than zero, and its normal-volatility beta-zero limit when beta equals zero. The shock advances a synthetic quarter-year step, sets the orthogonal Brownian component to zero, uses an Euler forward update, and advances alpha with its exact conditional geometric-Brownian update. This is one teaching path, not a forecast or fitted scenario.

Both curves start from the same SABR-generated smile. To make the central directional contrast immediately visible, the local-volatility curve is translated in the opposite direction described in the paper. It is explicitly a qualitative sketch, not a recalibration of a Dupire local-volatility surface, a solution of its pricing PDE, or a claim that every calibrated local-volatility model is inaccurate for all uses.

For beta greater than zero, the chart reports Black implied volatility and requires positive forwards and strikes. At beta zero, it switches to the normal-volatility limit, quoted in basis points per square-root year. The asymptotic formula can degrade for extreme strikes, long maturities, or parameter combinations outside its small-expansion regime.

## Accuracy checks and limitations

- Beta one with zero vol-of-vol gives a flat lognormal smile at alpha.
- The ATM formula matches its closed form, including the time correction.
- Beta zero gives the normal-volatility ATM limit.
- The beta-one, zero-correlation smile is symmetric in log-moneyness.
- Correlated forward/volatility shocks move alpha in the rho direction; zero nu leaves alpha unchanged.
- Source market figures are not reproduced as data. The paper's USD interest-rate examples, the interactive shock, and all slider values remain distinct.
- The article's local-volatility claim is stated as the authors' reported qualitative comparison, not as a universal theorem about all local-volatility applications.

## Growth path

The related course is the verified *Mastering Interest Rate Derivatives* offer in the shared project configuration. The course is optional and labeled as a commercial relationship in the shared continuation component.
