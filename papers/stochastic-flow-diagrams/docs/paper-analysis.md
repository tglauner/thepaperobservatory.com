# Source analysis: Stochastic flow diagrams

## Bibliographic and file identity

- Authors: Neil J. Calkin and Marcos López de Prado.
- Title: *Stochastic flow diagrams*.
- Journal: *Algorithmic Finance* 3 (2014), 21–42, IOS Press.
- DOI: 10.3233/AF-140032.
- SSRN: https://ssrn.com/abstract=2379314.
- Supplied file: `ssrn-2379314.pdf`, 2,328,727 bytes, 23 physical PDF pages.
- Original SHA-256: `9d140b75c013124d8267d821412cd6ea7dc1a282d06d16e849f45ed452331e54`.
- The first physical page is a journal information/cover sheet whose embedded text is badly encoded. The readable article begins at physical PDF page 2, printed page 21. Physical PDF page = printed article page − 19. Link with physical pages, not printed numbers.
- PDF metadata creation/modification: May 27, 2014. This is file metadata, not a separate publication-date claim.

## The central argument

Dynamic equations can be difficult to reason about as a long table of coefficients. An SFD makes their architecture visible: variables are vertices, regression effects are signed weighted arrows, and explicit lag vertices serve as memory cells. This representation makes shock propagation, feedback loops, delays and reverberation easier to follow.

The paper does not replace the underlying equations or estimate real-time financial flows by drawing a graph. It is primarily a visualization framework for specified time-series models. Its worked shock examples are stylized two-variable systems, rather than an empirical market dataset, backtest, fitted causal network, or crash prediction result. The concluding discussion suggests possible applications; the website should distinguish these ambitions from demonstrated evidence.

## Page map for local source links

| Topic | Printed page | Physical PDF page |
| --- | ---: | ---: |
| Abstract and article identity | 21 | 2 |
| Motivation: topology, memory, communication | 22–23 | 3–4 |
| Graph definitions | 23–25 | 4–6 |
| AR(1), lag nodes and outbound/inbound arcs | 25–26 | 6–7 |
| AR(p), VAR(1), coefficient notation | 27 | 8 |
| VAR topology, general lag models | 28–30 | 9–11 |
| SVAR contemporaneous terms | 30–31, 35 | 11–12, 16 |
| Shock propagation and reverberation | 31 | 12 |
| Stable and steady source matrices | 33 | 14 |
| Steady and explosive source matrices | 34 | 15 |
| Conclusions and SVAR diagram | 35 | 16 |
| Stable/steady snapshots | 36 | 17 |
| Explosive snapshots and code appendix start | 37 | 18 |
| Diagram construction snippets | 37–39 | 18–20 |
| Diagram legend; start of eigenvalue appendix | 40 | 21 |
| Eigenvalue formulas, closed form, stability discussion | 41 | 22 |
| Bibliography continuation | 42 | 23 |

## Model and coefficient orientation

The AR(p) equation is

`y_t = sum(k=1…p) φ_k y_{t−k} + ε_t`.

The VAR(p) equation is

`y_t = sum(k=1…p) Φ_k y_{t−k} + ε_t`.

Use column state vectors. Define `Φ_k[i][j]` to mean the effect of **source variable j, lag k**, on **target equation i**. Thus `y_i,t = Σ_j Σ_k φ_i,j,k y_j,t−k + ε_i,t`. This agrees with the paper's scalar equations (6) and (10). A coefficient arrow runs from source-lag vertex `(j,k)` to target-current vertex `(i,0)` and carries coefficient `φ_i,j,k`.

The paper's arc index convention is different from its parameter convention: `a_i,k,j` means source i at lag k → target j now, so its coefficient is `φ_j,i,k`. Keep this transpose explicit in implementation. Some displayed matrices/index labels in the paper vary in presentation; the symmetric numerical examples conceal a possible transposition error. The educational site should commit to row = target, column = source and print that convention next to the matrix.

### Innovations

For the VAR, the stated generalized-white-noise assumptions are zero mean, a positive-definite contemporaneous covariance matrix Σ, and zero cross-time covariance. Innovations can therefore be contemporaneously correlated across equations. The word “stochastic” refers to these random disturbances and the random variables in the system.

An isolated impulse-response experiment can condition on a chosen initial shock and set all future innovations to zero. That produces a deterministic conditional response; it is still a response of a stochastic model, rather than a random walk or an estimated forecast distribution. If the site adds Monte Carlo noise, label its covariance and Gaussian assumption as an educational extension. Do not silently equate a coordinate shock in correlated reduced-form residuals with an identified structural shock.

## How to read an SFD

The paper's legend is printed page 40 / PDF 21.

- **Ellipse:** one current variable. AR has one; a VAR has several.
- **Diamond:** a variable at a specified lag. It is a memory cell, not a different economic asset.
- **Dashed arrow, unfilled arrowhead:** a unit-weight delay connection, current → lag 1 → lag 2, etc. It copies a past state into the next memory slot.
- **Solid pointed arrow:** a signed coefficient effect from a lagged variable into a current equation.
- **Solid flat-ended arrow:** a contemporaneous effect between current variables in the paper's SVAR representation.
- **Red/green signed coloring:** negative/positive values or coefficients. For accessibility, always include numeric signs and labels, rather than using color alone.
- **Split current vertex:** left half = change/rate; right half = cumulative level when the variable is modeled in differences. This is a valuable teaching distinction.
- **Arrow width in the source implementation:** equation goodness of fit. A website without fitted data must not invent R² values or imply that thicker arcs are more statistically significant. It can instead use a declared thickness mapping to coefficient magnitude, explicitly different from the source's fit encoding.

The prose and Definitions 11–12 sometimes mix a coefficient weight with the current transmitted amount. A clean implementation should keep these separate: a delay arc has coefficient 1 and transmits the source state; a coefficient arc has coefficient φ and transmits `φ × source state`. Their contributions add to the target equation, then the target innovation is added.

## A complete synchronous update

Given current lag history `[y_t, y_{t−1}, …, y_{t−p+1}]`, compute every coordinate of

`next = Φ_1 y_t + … + Φ_p y_{t−p+1} + ε_{t+1}`

from the **old** history. Only after all targets have been computed should the history shift to `[next, y_t, …]`. Updating one node in place and using it immediately in another equation would change a lagged VAR into a different, order-dependent model.

A good animation can show three explanatory stages without treating them as three time steps: read memory → sum coefficient contributions → shift the complete state. The display should label the actual model period separately from animation phases.

## The paper's three numerical regimes

Printed pages 33–34 / PDF 14–15 use a symmetric two-variable VAR(1):

`Φ(a) = [[a, −a], [−a, a]]`.

This family has an equal-move eigenvector `(1,1)` with eigenvalue 0 and an opposing-move eigenvector `(1,−1)` with eigenvalue `2a`. Use Stocks and Bonds as the source's illustrative names, not as fitted market estimates.

| Source regime | a | Matrix eigenvalues | Spectral radius |
| --- | ---: | --- | ---: |
| Stable | 1/4 | 1/2, 0 | 1/2 |
| Steady | 1/2 | 1, 0 | 1 |
| Explosive | 2/3 | 4/3, 0 | 4/3 |

The source applies a Stocks innovation of −1/2 at time 0, with the other innovation zero, and shows diagrams at horizons 1, 5 and 10. For a transparent reconstruction define:

- `r_0 = s = (−1/2,0)`; no earlier history.
- `r_h = Φ^h s` for h ≥ 1; future innovations are zero.
- `C_h = Σ_{j=0}^h r_j`, with cumulative baseline zero before the shock.
- Units are arbitrary additive changes; these are not percentage compounded investment returns.

The paper's diagrams motivate this reconstruction, but the prose does not give every rendering or snapshot-indexing convention. Label the site “reconstruction of the source parameters, with explicit t=0 convention” rather than claiming pixel-identical reproduction of the figures.

### Checkable values

| Regime | Horizon | Stocks change | Bonds change | Cumulative Stocks | Cumulative Bonds |
| --- | ---: | ---: | ---: | ---: | ---: |
| Stable | 0 | −0.5 | 0 | −0.5 | 0 |
| Stable | 1 | −0.125 | 0.125 | −0.625 | 0.125 |
| Stable | 5 | −0.0078125 | 0.0078125 | −0.7421875 | 0.2421875 |
| Stable | 10 | −0.000244141 | 0.000244141 | −0.749755859 | 0.249755859 |
| Steady | 1 | −0.25 | 0.25 | −0.75 | 0.25 |
| Steady | 5 | −0.25 | 0.25 | −1.75 | 1.25 |
| Steady | 10 | −0.25 | 0.25 | −3 | 2.5 |
| Explosive | 1 | −0.333333333 | 0.333333333 | −0.833333333 | 0.333333333 |
| Explosive | 5 | −1.053497942 | 1.053497942 | −3.713991770 | 3.213991770 |
| Explosive | 10 | −4.439431658 | 4.439431658 | −17.257726634 | 16.757726634 |

In the stable source example, `C_∞ = (I−Φ)^{-1}s = (−0.75,+0.25)`. Thus a stable **rate/change** response does not mean that the cumulative level returns to its pre-shock baseline. In the steady example the rate stays nonzero and the cumulative response grows linearly. In the explosive example both the rate magnitude and cumulative response grow geometrically.

## Stability: the precise version

For a finite-dimensional, fixed, discrete-time VAR(1), all initial impulse responses tend to zero exactly when `ρ(Φ) < 1`, where `ρ` is the largest complex eigenvalue modulus. For a 2×2 matrix,

`λ± = [tr(Φ) ± sqrt(tr(Φ)^2 − 4 det(Φ))]/2`.

If the discriminant is negative, the two eigenvalues are a complex conjugate pair. The modulus, not just the real part, must be tested. For `Φ = [[0.8,−0.8],[0.8,0.8]]`, the eigenvalues are `0.8 ± 0.8i`, with modulus `sqrt(1.28) ≈ 1.1314`: the system is explosive even though both real parts are 0.8.

### Source qualifications to surface in the advanced path

1. **Complex eigenvalues:** Appendix A.6 (printed 41 / PDF 22) says to test real parts for imaginary eigenvalues. That is not the correct discrete-time criterion. Use complex moduli. This is a mathematical correction, not a claim about new empirical evidence.
2. **Diagonalization:** the same appendix says invertibility implies diagonalizability. Invertible matrices need not be diagonalizable. Matrix-power iteration works without that assumption; eigenvector closed forms require a complete eigenbasis, or a Jordan/generalized treatment. The source's three symmetric example matrices are diagonalizable, even though each is singular because one eigenvalue is zero.
3. **Unit-circle boundary:** `ρ=1` is not universally the source's persistent one-direction drift. A semisimple eigenvalue −1 gives alternating changes; other unit complex eigenvalues give oscillations; a defective unit-root Jordan block can produce polynomial growth. The source's “steady” drift description applies to its displayed eigenvalue +1 example.
4. **Excitation:** if a matrix has an eigenvalue with modulus >1, there exist exploding initial states, but a particular shock may fail to excite that direction. Do not claim every shock must explode. In the symmetric source family, a same-sign shock `(s,s)` lies in the zero mode and vanishes after one step even when the other mode is explosive.
5. **Transient amplification:** a non-normal matrix can amplify an early response despite `ρ<1`. For example, `[[0.5,K],[0,0.5]]` can transmit a large first-period response from the second coordinate to the first, then eventually decay. Asymptotic stability does not bound all short-horizon gains.
6. **VAR(p):** build the companion matrix and test its eigenvalues. Testing each lag matrix separately, or their sum, is generally incorrect.

The VAR(p) companion state is `z_t = [y_t; y_{t−1}; …; y_{t−p+1}]`; its top block row is `[Φ_1 … Φ_p]` and its lower block rows shift prior values with identity blocks. This companion structure is the algebraic version of the SFD's delay-memory cells.

## SVAR, interpretation and causality

The paper adds current-to-current arrows for contemporaneous effects. Write such a specification as

`(I−B_0)y_t = Σ_k A_k y_{t−k} + u_t`.

If `I−B_0` is invertible, solve the simultaneous system before advancing time, obtaining reduced-form coefficient matrices `(I−B_0)^{-1}A_k`. A causal interpretation of a contemporaneous or lagged coefficient requires modeling/identification assumptions and data. A directed predictive link is not automatically an identified intervention effect.

The article is not a DSGE model derivation: it does not specify optimizing agents, preferences, budget constraints, market clearing, or identify structural economic primitives. SFDs can visualize systems of dynamic equations, but an SFD itself supplies neither economic identification nor those omitted assumptions.

The model is also not a Markov probability transition matrix. Its signed coefficients need not be nonnegative or sum to one; negative coefficients may reverse the sign of a transmitted response. Nor does “flow” imply physical mass or money conservation. Total response can be created, canceled, amplified or dissipated by the coefficient system. Exact conservation would be an additional restriction, not a general property.

The source discusses pruning statistically insignificant coefficients. The lab does not estimate coefficients or p-values. An arc switch should be called a hypothetical model edit; it must not claim that an edited arc is statistically insignificant. Removing an estimated arc can alter the response/stability and also introduce model misspecification.

## Proposed educational exhibits

### 1. Read the diagram

Let students toggle AR(1), AR(2), VAR(1) and VAR(2), seeing the current ellipses, lag diamonds, dashed unit-delay arrows and signed regression arrows. Select a coefficient to highlight source lag, target equation, equation term, numeric coefficient and current transmitted contribution. For accessibility, provide a matching edge list/table and keyboard-selectable controls.

Learning goal: distinguish a storage/memory connection from a fitted influence coefficient; read row = target, column = source.

### 2. Send a shock

Use the paper's stable Stocks/Bonds parameters. A step control advances one complete synchronous period. Play/pause can animate, but reduced motion should disable automatic animation and leave manual stepping fully functional. The node split and paired line charts display current change and cumulative response separately. Show the exact t=0 convention.

Learning goal: a one-time innovation can keep producing responses after the innovation has ended; a decaying change can leave a persistent cumulative displacement.

### 3. Change the feedback

A scalar `a` control for the symmetric source family permits stable, boundary and explosive presets with exact source parameters. A complex-plane eigenvalue/unit-circle diagram and an impulse-response plot show how eigenvalue modulus predicts long-run behavior. Include an advanced custom 2×2 matrix view or real/complex pair example if feasible.

Learning goal: the network's loop gains and signs determine whether disturbances fade, persist or grow. Handle the unit-circle boundary carefully.

### 4. Follow paths and edit a network

Use a clearly synthetic 3-variable VAR(1) with a chain or feedback loop. Highlight paths by horizon, show products of edge coefficients along walks and sums when routes merge, and compare the baseline response with one hypothetical arc removed. An edge A→B→C creates a two-period response; no direct A→C edge is necessary. Small loops can reverberate repeatedly.

Learning goal: `(Φ^h)_{ij}` is the sum of coefficient products over length-h directed walks from source j to target i. Signs can cancel even with many paths. Do not call signed coefficient sums “distance”; graph-path length and weighted gain serve different purposes.

### Advanced extensions that support the paper without changing its claims

- A stable but transiently amplifying matrix, clearly separated from the three source presets.
- An oscillating complex pair with its position inside/outside the unit circle.
- VAR(2) memory and the companion representation.
- Conditional mean response versus noisy simulated paths, with a declared innovation distribution.

These are optional: a complete site can explain the source's AR/VAR memory, shock propagation, three regimes, model edits, assumptions and limitations with four bounded labs plus evidence/glossary/quiz.

## Suggested meaningful model tests

1. Row-target/column-source multiplication on an asymmetric matrix.
2. One-step response equals matrix times shock.
3. Shock at t0 is included once and future innovations are zero by default.
4. Cumulative totals equal additive sums, not compound returns.
5. Exact stable source matrix response at horizons 1, 5, 10.
6. Stable source long-run sum equals `(I−Φ)^{-1}s`.
7. Steady source response persists with eigenvalue +1.
8. Explosive source response grows in the opposing mode.
9. Same-sign shock in the zero mode vanishes after one step, even with the other mode explosive.
10. Complex eigenvalues are classified by modulus, using the 0.8±0.8i counterexample.
11. Negative real eigenvalue yields alternating signs.
12. Non-normal stable matrix permits transient amplification before decay.
13. Synchronous updates are invariant to loop/equation traversal order.
14. VAR(2) uses separate previous-period history slots rather than in-place values.
15. An asymmetric A→B→C chain reaches C after two periods, not one.
16. Path-gain products sum to entries of the matrix power.
17. A disabled arc has zero coefficient and changes only its specified entry.
18. Coefficient and node limits reject nonfinite inputs; horizons are bounded; explosive trajectories use explicit numerical caps with a visible truncation notice rather than silent overflow.

## Limits and evidence boundary

The paper's principal evidence is its construction and stylized examples. A lab built from these inputs can demonstrate the algebra, graph interpretation and response dynamics. It cannot establish financial causation, estimated significance, crash probabilities, model goodness of fit, out-of-sample accuracy, profitable trading decisions or the adequacy of a fixed linear model for actual changing markets.

A graph can conceal uncertainty if it omits coefficient uncertainty, estimation error, omitted variables, changing regimes, nonlinearities and innovation covariance. The advanced lessons should expose these limits without overwhelming the foundation narrative. All new numerical examples should be marked synthetic, and source presets should be identified as reconstructions of the paper's declared parameters.
