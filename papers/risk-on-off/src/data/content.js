/**
 * Original educational prose based on ssrn-2150877.pdf.
 * Slide references are 1-based PDF pages. Quiz answers use zero-based indices.
 * Reported source examples are rounded illustrations, not reproduced backtests.
 */

export const glossary = [
  {
    term: "Covariance matrix",
    definition:
      "A table of how asset changes vary together. The diagonal entries are individual variances; the off-diagonal entries are covariances. Combined with holdings, it determines modeled portfolio variance.",
    advanced:
      "For a symmetric positive semidefinite matrix V and holdings w, portfolio variance is wᵀVw. The measurement interval and instrument units must be consistent.",
  },
  {
    term: "Correlation",
    definition:
      "Covariance divided by the two standard deviations. It ranges from −1 to +1. In the vector picture, ρ = cos φ for the angle between return vectors drawn from a common origin.",
    advanced:
      "The supplementary internal triangle angle θ instead gives ρ = −cos θ. A single average correlation loses information that remains present in the full covariance matrix.",
  },
  {
    term: "Variance and volatility",
    definition:
      "Variance is the mean squared deviation from the mean. Volatility is its square root. Multiplying variance by four multiplies volatility by two.",
    advanced:
      "Variance scales quadratically with holdings, while volatility scales with their absolute size. Always identify which quantity a stress control changes.",
  },
  {
    term: "Eigenvector",
    definition:
      "A direction that a matrix stretches without turning. Here, an eigenvector describes a combination of instruments that forms one principal risk direction.",
    advanced:
      "Vzᵢ = λᵢzᵢ. A symmetric covariance matrix admits an orthonormal eigenbasis. Flipping an eigenvector’s sign changes its loading sign but leaves its variance share unchanged.",
  },
  {
    term: "Eigenvalue",
    definition:
      "The variance associated with a unit-length eigenvector portfolio. A larger eigenvalue means more variance per unit of exposure in that direction.",
    advanced:
      "Covariance eigenvalues are nonnegative. The square root of an eigenvalue is the corresponding mode volatility, in the model’s chosen units.",
  },
  {
    term: "Principal component",
    definition:
      "One of the uncorrelated linear combinations obtained by rotating into the covariance eigenbasis. The first component has the largest variance; later components explain successively less.",
    advanced:
      "Uncorrelated does not generally mean independent. Nonlinear dependence and common tail events may survive the rotation; joint Gaussian variables are a special case.",
  },
  {
    term: "Factor loading",
    definition:
      "How much of a principal direction a portfolio holds. Compute the vector of loadings by projecting holdings into the eigenbasis: f = Zᵀw.",
    advanced:
      "Reconstruction gives w = Zf. A large loading on a low-variance mode need not contribute much risk because its variance contribution is λᵢfᵢ².",
  },
  {
    term: "Asset risk contribution",
    definition:
      "An attribution of portfolio risk to the original instruments. A hedging instrument can make a negative contribution even though the portfolio’s total variance is nonnegative.",
    advanced:
      "The normalized Euler contribution is wᵢ(Vw)ᵢ/(wᵀVw). These shares sum to one, but negative entries make them unsuitable as entropy probabilities.",
  },
  {
    term: "Component risk share",
    definition:
      "The fraction of total variance coming from one principal component: pᵢ = λᵢfᵢ² / Σⱼλⱼfⱼ². These shares are nonnegative and add to one.",
    advanced:
      "The shares are undefined if total modeled variance is zero. They describe variance attribution, rather than probabilities of a gain or a loss.",
  },
  {
    term: "Shannon entropy",
    definition:
      "A measure of how evenly risk shares are spread: S = −Σᵢpᵢ ln pᵢ. One dominant share gives low entropy; equal shares give the highest entropy for a fixed number of modes.",
    advanced:
      "Use natural logarithms and the limiting convention 0 ln 0 = 0. Entropy here applies to the distribution of variance shares.",
  },
  {
    term: "Effective number of bets",
    definition:
      "Nₑff = exp(S) turns entropy into a count-like quantity. Equal risk across three components gives three effective bets; all risk in one component gives one.",
    advanced:
      "This is an entropy-based effective count of uncorrelated components. It does not establish that the components are statistically independent.",
  },
  {
    term: "Normalized portfolio entropy",
    definition:
      "The presentation rescales the effective count as H = (Nₑff − 1)/(n − 1). For n > 1, it runs from zero for one component to one for equal risk across every component.",
    advanced:
      "This differs from dividing Shannon entropy by ln n. Multiplying every holding by the same nonzero amount leaves H unchanged, even though volatility changes.",
  },
  {
    term: "Diversified Risk Parity",
    definition:
      "DRP equalizes variance contributions across principal components. It balances modeled risk directions, whereas asset risk parity balances contributions from the original instruments.",
    advanced:
      "For positive eigenvalues, fᵢ ∝ ±1/√λᵢ and w = Zf. Signs, scale and constraints still need choices; tiny eigenvalues can require very large offsetting holdings.",
  },
  {
    term: "Rayleigh quotient",
    definition:
      "R(w,V) = wᵀVw / wᵀw measures variance for a fixed squared holdings length. The leading eigenvector gives the maximum; the final eigenvector gives the minimum.",
    advanced:
      "All eigenvectors are stationary directions, but intermediate eigenvectors are generally saddle points. They are not all global risk maxima.",
  },
  {
    term: "Investment universe",
    definition:
      "The set of instruments available in the analysis. Its covariance matrix defines the principal directions against which diversification is measured.",
    advanced:
      "Adding instruments or changing their units can change the basis and entropy. Repeated eigenvalues also permit multiple eigenbases, so entropy requires a declared basis.",
  },
  {
    term: "Risk-on / risk-off",
    definition:
      "Market language for broad changes in investors’ willingness to bear risk. The presentation uses this context to motivate stress to a common risk direction.",
    advanced:
      "The default stress scenario changes one mode’s volatility with holdings and eigenvectors fixed. An optional rotation also changes the first two axes. These are covariance scenarios, rather than a classifier of real market regimes.",
  },
];

export const quiz = [
  {
    id: "many-instruments",
    question:
      "A portfolio holds 30 instruments, but 98% of its variance comes from one principal component. What is the best description?",
    options: [
      "It is broadly diversified because it has 30 holdings.",
      "Its modeled risk is concentrated in one common direction.",
      "Its volatility must be high in absolute terms.",
    ],
    correct: 1,
    explanation:
      "A long holdings list can hide a single common exposure. Concentration describes where variance comes from; leverage determines its scale. The source’s three-instrument example puts 98% of risk in its first component.",
    source: 32,
  },
  {
    id: "geometry-angle",
    question:
      "Two equally volatile, positively held assets have correlation zero. What is the angle between their return vectors drawn from a common origin?",
    options: ["0°", "90°", "180°"],
    correct: 1,
    explanation:
      "The common-origin convention gives ρ = cos φ. Zero correlation means perpendicular vectors and portfolio volatility √2 times either asset’s volatility, for one unit of each. The triangle’s supplementary internal angle uses the alternative formula ρ = −cos θ.",
    source: 7,
  },
  {
    id: "volatility-shock",
    question:
      "All portfolio risk lies in PC1. If PC1’s volatility doubles, what happens to portfolio variance?",
    options: [
      "It doubles.",
      "It quadruples.",
      "It is unchanged because the holdings are fixed.",
    ],
    correct: 1,
    explanation:
      "Variance is volatility squared. Doubling √λ₁ multiplies λ₁ by four and doubles the portfolio’s volatility. Slide 25 shocks √λ₁; a square root can disappear in plain-text extraction of the PDF.",
    source: 25,
  },
  {
    id: "balanced-shock",
    question:
      "Three components initially contribute equal variance. With holdings and axes fixed, PC1 volatility doubles. What is the total volatility multiplier?",
    options: ["2", "√2, about 1.41", "4/3, about 1.33"],
    correct: 1,
    explanation:
      "The first contribution grows from one unit of variance to four, while the other two stay at one. Total variance goes from three to six, so volatility rises by √(6/3) = √2. This is a calculation from the source’s mode-shock idea, not a reported backtest.",
    source: 25,
  },
  {
    id: "entropy-leverage",
    question:
      "Every holding is multiplied by two, with covariance unchanged. What happens to normalized portfolio entropy?",
    options: [
      "It doubles.",
      "It falls because risk increased.",
      "It stays the same.",
    ],
    correct: 2,
    explanation:
      "Each component variance contribution multiplies by four, so their normalized shares stay unchanged. Entropy therefore stays unchanged while volatility doubles. Risk level and risk concentration are separate quantities.",
    source: 29,
  },
  {
    id: "uncorrelated-independent",
    question:
      "After covariance PCA, the principal components are uncorrelated. Which conclusion follows?",
    options: [
      "They cannot suffer losses together.",
      "Their linear covariance cross terms vanish under this covariance model.",
      "They are independent for every return distribution.",
    ],
    correct: 1,
    explanation:
      "Diagonal covariance removes second-moment cross terms. It does not generally remove nonlinear or tail dependence. Independence follows from uncorrelatedness under additional assumptions, such as joint Gaussianity.",
    source: 13,
  },
  {
    id: "erc-different",
    question:
      "A portfolio has equal risk contribution from every asset. Must it also have equal risk contribution from every principal component?",
    options: [
      "Yes, a change of coordinates preserves every contribution.",
      "No, the two rules balance different objects.",
      "Only if it holds more than three assets.",
    ],
    correct: 1,
    explanation:
      "Asset ERC and component DRP use different decompositions. Slide 37 shows asset shares near one third each, but component shares near 15%, 85% and 0%. Its reported entropy is only 0.27.",
    source: 37,
  },
  {
    id: "rayleigh",
    question:
      "At a fixed Euclidean holdings length, which principal direction globally maximizes portfolio variance?",
    options: [
      "Every eigenvector.",
      "The eigenvector with the smallest eigenvalue.",
      "The eigenvector with the largest eigenvalue.",
    ],
    correct: 2,
    explanation:
      "The Rayleigh quotient lies between the smallest and largest eigenvalues. The leading eigenvector reaches the maximum and the final eigenvector reaches the minimum. Intermediate eigenvectors are stationary directions, generally saddle points; the presentation’s broad wording needs this qualification.",
    source: 23,
  },
];

export const evidence = [
  {
    title: "Hedging legs can hide balanced components",
    slide: 19,
    summary:
      "Three Treasury futures have asset risk shares of −38%, 298% and −160%, yet each component contributes about one third.",
    detail:
      "Slides 19–20 report holdings of 90, −448 and 206 contracts in 2y, 5y and 10y US Treasury note futures. Negative asset contributions reflect hedges. The component decomposition has no negative shares and reveals equal modeled risk across its three principal directions. These are rounded source values.",
  },
  {
    title: "A common mode becomes more volatile",
    slide: 25,
    summary:
      "The presentation doubles the first component’s volatility, √λ₁, to illustrate sensitivity to a shared risk direction.",
    detail:
      "A pure-PC1 portfolio receives the full volatility multiplier. A portfolio with a smaller initial PC1 variance share receives a smaller proportional increase, with holdings and axes fixed. Doubling mode volatility quadruples that eigenvalue; this is an illustrative scenario, rather than evidence of a measured market regime transition.",
  },
  {
    title: "Diversification depends on the available universe",
    slide: 30,
    summary:
      "The same rates holdings have reported entropy 1.00 in a rates-only universe and 0.76 when EUR/USD is also available.",
    detail:
      "The newly available currency future has zero holding, but the expanded covariance matrix changes the benchmark risk directions. Reported implied correlation remains 0.98 in both cases. The claim concerns diversification relative to available bets, rather than an automatic increase in the existing portfolio’s variance.",
  },
  {
    title: "Low correlation, one dominant bet",
    slide: 32,
    summary:
      "Reported implied correlation: 0.00. Reported entropy: 0.05. First-component risk share: 98%.",
    detail:
      "The example combines E-mini S&P 500, copper and Italian government bond futures. Rounded component shares are 98%, 2% and 0%. A single correlation summary therefore misses strong directional concentration. The slide supplies an illustrative portfolio table, rather than a dated return series or reproducible backtest.",
  },
  {
    title: "High correlation, four balanced directions",
    slide: 33,
    summary:
      "Reported implied correlation: 0.98. Reported entropy: 1.00. Four components each contribute 25%.",
    detail:
      "The source uses four US Treasury futures with long and short positions. Equal component risk is compatible with high correlation between the underlying instruments. This is maximum entropy within that particular covariance basis and universe; it does not guarantee low leverage, low volatility or protection from losses.",
  },
  {
    title: "Asset parity differs from component parity",
    slide: 37,
    summary:
      "Asset contributions are about 33% each, while component contributions are 15%, 85% and 0%. Reported entropy is 0.27.",
    detail:
      "The example combines S&P 500, Dow and US Treasury futures. Equal Risk Contribution balances the original instrument contributions; Diversified Risk Parity balances eigenmode contributions. Neither label removes the need to examine costs, leverage and covariance estimation. Values are rounded as reported.",
  },
];

export const readingList = [
  {
    title: "Managing Risks in a Risk-On/Risk-Off Environment",
    author: "Marcos López de Prado",
    url: "https://ssrn.com/abstract=2150877",
    note: "The 50-slide source presentation supplied with this project. Follow the numbered slide links throughout the lab for the original argument and illustrative futures examples.",
  },
  {
    title: "Balanced Baskets: A New Approach to Trading and Hedging Risks",
    author: "David H. Bailey and Marcos López de Prado",
    url: "https://www.davidhbailey.com/dhbpapers/trading-baskets.pdf",
    note: "Author-hosted full paper, Journal of Investment Strategies, Fall 2012. Develops balanced-basket methods and algorithms; a useful next reading after the lab. The presentation points to this research via SSRN 2066170.",
  },
];

export const limitations = [
  {
    title: "A model of variance",
    text: "Volatility and component entropy describe second moments. They leave out liquidity, transaction costs, margin, skewness, jumps and many features of extreme losses. Equal component risk is not a guarantee against loss.",
  },
  {
    title: "Uncorrelated components can remain dependent",
    text: "Diagonal covariance eliminates linear cross terms under the chosen model. Nonlinear dependence and common tail events can remain. “Pure bets” is the presentation’s language for uncorrelated directions, rather than a general proof of independence.",
  },
  {
    title: "The universe and measurement units matter",
    text: "Changing the available instruments, their scaling, or the estimation window can change the principal directions and entropy. Covariance PCA on contract value changes is a different analysis from correlation PCA on standardized returns.",
  },
  {
    title: "Small eigenvalues make balancing fragile",
    text: "Equal component risk requires loadings proportional to 1/√λ. A small estimated eigenvalue can demand a large position; a zero eigenvalue cannot carry positive variance at finite holdings. Practical constraints and covariance estimation matter.",
  },
  {
    title: "A basis may be unstable or non-unique",
    text: "Nearly tied eigenvalues can make individual estimated directions unstable. Exactly repeated eigenvalues permit rotations within their shared subspace without changing covariance. Entropy of individual component shares depends on which valid basis is selected.",
  },
  {
    title: "A scenario is not a regime detector",
    text: "The default stress experiment holds the eigenvectors fixed while changing one mode’s volatility. Its optional rotation illustrates a change in the first two axes; holdings remain fixed throughout. This site does not estimate a live risk-on/risk-off state or forecast returns.",
  },
  {
    title: "Separate concentration from size",
    text: "Scaling a portfolio changes volatility while leaving its component shares and entropy unchanged. Comparing stress sensitivity at equal baseline volatility answers a different question from comparing Rayleigh risk at equal holdings length.",
  },
  {
    title: "Read the source examples as illustrations",
    text: "The presentation reports rounded futures tables without the full underlying observations and sampling details. The lab’s interactive charts use explicitly synthetic inputs; the source evidence cards preserve reported figures without claiming an exact replication.",
  },
];
