/** Original educational prose; source references are one-based physical PDF pages.
 * The journal cover is PDF page 1. Article printed page q is PDF page q - 19.
 * Source parameters are illustrative; no observations or fitted estimates are supplied.
 */

export const glossary = [
  {
    term: "Stochastic flow diagram",
    definition:
      "A graph that makes a dynamic system of equations visible. Its variables, memory cells and weighted arrows show how changes can travel and return over time.",
    advanced:
      "An SFD is a representation of the specified model. It supplies neither coefficient estimates nor a causal identification strategy by itself.",
  },
  {
    term: "Current vertex",
    definition:
      "An ellipse representing a variable in the current period. A single-variable autoregression has one current vertex; a vector autoregression has several.",
    advanced:
      "Use one current vertex for each equation component yᵢ,t. Variables may represent levels or changes; the interpretation must be declared.",
  },
  {
    term: "Lagged vertex",
    definition:
      "A diamond-shaped memory cell holding an earlier value of the same variable. A lag-one cell contains yesterday’s value in a daily model.",
    advanced:
      "A VAR(p) requires p history slots per variable. These slots form the state of the equivalent first-order companion system.",
  },
  {
    term: "Delay arc",
    definition:
      "A dashed arrow that copies a value into the next memory slot. Its coefficient is one; it changes when a value is available, rather than scaling it.",
    advanced:
      "The source calls this an outbound arc. Shift the complete old state synchronously after computing the next state; an in-place update would change the model.",
  },
  {
    term: "Coefficient arc",
    definition:
      "A solid arrow showing how a source value contributes to a target equation. Its signed coefficient can reinforce a change or reverse its direction.",
    advanced:
      "The coefficient and transmitted contribution are different objects: contribution = coefficient × source state. Contributions from all incoming terms add at the target.",
  },
  {
    term: "Autoregression (AR)",
    definition:
      "A model in which a variable depends on its own earlier values and a new disturbance. AR(2) uses two lags; AR(1) uses one.",
    advanced:
      "For centered variables, yₜ = Σₖφₖyₜ₋ₖ + εₜ. With multiple lags, stability depends on the companion system, rather than testing each coefficient separately.",
  },
  {
    term: "Vector autoregression (VAR)",
    definition:
      "A set of equations in which several variables can depend on their own and one another’s past values.",
    advanced:
      "Use column vectors and yₜ = ΣₖΦₖyₜ₋ₖ + εₜ. Matrix row i is target equation i; column j is source variable j.",
  },
  {
    term: "Innovation or shock",
    definition:
      "A new disturbance that is not explained by the lagged terms. A one-time shock can have effects long after it has stopped arriving.",
    advanced:
      "The paper assumes zero-mean innovations with a positive-definite contemporaneous covariance and no cross-time covariance. A reduced-form coordinate shock is not automatically an identified structural shock.",
  },
  {
    term: "Impulse response",
    definition:
      "The sequence of changes that follows a specified one-time shock when later innovations are set to zero.",
    advanced:
      "For VAR(1), rₕ = Φʰs. This conditional response is deterministic even though the model allows random innovations.",
  },
  {
    term: "Propagation and reverberation",
    definition:
      "Propagation is a shock’s transmission between variables. Reverberation is its persistence through memory and repeated feedback after the initial disturbance.",
    advanced:
      "For a fixed VAR(1), (Φʰ)ᵢⱼ sums the products of coefficients over all length-h directed walks from source j to target i. Multiple routes can reinforce or cancel.",
  },
  {
    term: "Current change and cumulative response",
    definition:
      "The current change tells us what happens this period. The cumulative response adds all changes since the shock. A fading change can leave a lasting cumulative displacement.",
    advanced:
      "With r₀ = s, define Cₕ = Σⱼ₌₀ʰrⱼ. These are additive arbitrary-unit changes, not compounded investment returns. When ρ(Φ) < 1, C∞ = (I − Φ)⁻¹s.",
  },
  {
    term: "Eigenvalue and spectral radius",
    definition:
      "An eigenvalue describes how one system direction is multiplied each period. The spectral radius is the largest eigenvalue magnitude.",
    advanced:
      "For discrete-time dynamics, use complex modulus |λ|. A complex eigenvalue with real part below one can still have modulus above one and generate growth.",
  },
  {
    term: "Stable, boundary and explosive",
    definition:
      "In the paper’s examples, a response can fade, continue at a constant rate, or grow. The corresponding spectral radii are below one, equal to one, and above one.",
    advanced:
      "All responses decay if ρ < 1. At ρ = 1, behavior depends on the unit-circle eigenvalues and their Jordan structure. At ρ > 1, some shocks can grow; a shock that misses every growing direction need not explode.",
  },
  {
    term: "Contemporaneous effect (SVAR)",
    definition:
      "An effect between variables in the same period. The paper draws these links between current ellipses with flat arrowheads.",
    advanced:
      "A specification (I − B₀)yₜ = ΣₖAₖyₜ₋ₖ + uₜ must be solved as a simultaneous system when I − B₀ is invertible. Structural interpretation requires identification assumptions.",
  },
  {
    term: "Predictive link and causal effect",
    definition:
      "A lagged coefficient can describe useful predictive information. That does not by itself establish what an intervention on the source would cause.",
    advanced:
      "Omitted variables, common shocks, contemporaneous residual correlation and identification choices can change the interpretation. A directed graph does not remove these econometric problems.",
  },
  {
    term: "Why this is not a Markov probability graph",
    definition:
      "SFD coefficients may be negative and need not sum to one. They describe signed linear effects, rather than probabilities of moving between states.",
    advanced:
      "Neither probability conservation nor money/mass conservation follows from this representation. Those would be additional restrictions on a particular model.",
  },
];

export const quiz = [
  {
    id: "memory-vertex",
    question: "What does a diamond-shaped vertex represent?",
    options: [
      "A separate financial asset.",
      "An earlier value stored as a memory cell.",
      "A probability of a crash.",
    ],
    correct: 1,
    explanation:
      "The paper uses ellipses for current variables and diamonds for lagged values. Adding a lag adds memory, without creating a new economic asset.",
    source: 7,
  },
  {
    id: "delay-coefficient",
    question: "What is the coefficient of a dashed delay connection?",
    options: [
      "One: it copies a value into the next lag slot.",
      "The current source value.",
      "The target’s regression coefficient.",
    ],
    correct: 0,
    explanation:
      "A delay arc has unit coefficient. The transmitted amount is the source state. A solid coefficient arc instead transmits its signed coefficient times that state.",
    source: 7,
  },
  {
    id: "matrix-orientation",
    question:
      "With matrix rows as targets and columns as sources, where is the effect of yesterday’s Bonds on today’s Stocks?",
    options: [
      "Stocks row, Bonds column.",
      "Bonds row, Stocks column.",
      "Only on the matrix diagonal.",
    ],
    correct: 0,
    explanation:
      "In yᵢ,t = Σⱼφᵢⱼyⱼ,t−1 + εᵢ,t, i indexes the target equation and j the source regressor. The corresponding arrow points from lagged Bonds to current Stocks.",
    source: 8,
  },
  {
    id: "shock-ended",
    question:
      "Can a one-time shock keep affecting the system when every later innovation is zero?",
    options: [
      "No: effects stop when new shocks stop.",
      "Yes: lagged states and feedback can keep transmitting its effect.",
      "Only if every coefficient is a probability.",
    ],
    correct: 1,
    explanation:
      "Reverberation is exactly this persistence after the disturbance. The response rₕ = Φʰs can fade, persist or grow depending on the model and the shock’s direction.",
    source: 12,
  },
  {
    id: "rate-level",
    question:
      "In the stable source example, the per-period response approaches zero. What happens to the cumulative response?",
    options: [
      "It must return to zero too.",
      "It approaches a finite displacement that can be different from zero.",
      "It necessarily grows exponentially.",
    ],
    correct: 1,
    explanation:
      "The current change and its cumulative sum are different. Under the lab’s explicit t=0 convention, the stable source parameters and shock (−0.5,0) give a limiting cumulative response of (−0.75,+0.25). This value is derived from the source parameters.",
    source: 14,
  },
  {
    id: "complex-modulus",
    question:
      "A discrete-time system has eigenvalues 0.8 ± 0.8i. Is it asymptotically stable?",
    options: [
      "Yes, because the real part is below one.",
      "No: each modulus is about 1.13, above one.",
      "Yes, because complex eigenvalues cannot produce growth.",
    ],
    correct: 1,
    explanation:
      "Discrete-time stability uses complex modulus, not real part. This qualifies a statement in the paper’s Appendix A.6. The example’s spectral radius is √(0.8² + 0.8²) ≈ 1.13.",
    source: 22,
  },
  {
    id: "shock-direction",
    question:
      "For the source family Φ = a[[1,−1],[−1,1]], what happens after a same-sign shock (s,s)?",
    options: [
      "It always excites the growing opposing-move direction.",
      "It becomes zero after one step, because it lies in the zero-eigenvalue direction.",
      "It produces the same response as (s,0).",
    ],
    correct: 1,
    explanation:
      "Multiplication gives a(s−s,−s+s) = (0,0). Even an explosive system need not amplify a shock that has no exposure to its growing direction. This is an algebraic extension of the source’s symmetric example.",
    source: 15,
  },
  {
    id: "not-probabilities",
    question:
      "Must the coefficients leaving a variable be nonnegative and add to one?",
    options: [
      "Yes: all diagrams with arrows are probability transition graphs.",
      "No: these are signed regression effects, without a probability-sum restriction.",
      "Only in the stable example.",
    ],
    correct: 1,
    explanation:
      "SFDs represent time-series equations. Negative weights can reverse a contribution, and responses can add or cancel. Probability conservation is not a general property of the model.",
    source: 8,
  },
  {
    id: "edit-not-estimate",
    question:
      "If you remove an arrow in the lab and the shock fades faster, what have you demonstrated?",
    options: [
      "The arrow was statistically insignificant in actual market data.",
      "A hypothetical change to the specified model changes its response.",
      "A real-world policy intervention will have the same effect.",
    ],
    correct: 1,
    explanation:
      "The lab does not fit data or identify interventions. Its arc switch changes one coefficient in a hypothetical model. Statistical significance, model adequacy and causal interpretation require additional evidence and assumptions.",
    source: 12,
  },
];

export const evidence = [
  {
    title: "Memory has a visible address",
    page: 7,
    printed: "26",
    summary:
      "An AR(1) becomes one current ellipse, one lag diamond, a unit delay connection and a coefficient connection back.",
    detail:
      "The delay arrow copies an old value into memory. The returning solid arrow scales the stored value by φ. This is the graphical architecture of yₜ = φyₜ₋₁ + εₜ. The coefficient and the amount transmitted through the arrow should be read separately.",
  },
  {
    title: "A system is more than a set of pairs",
    page: 8,
    printed: "27",
    summary:
      "The VAR(1) equations combine both variables’ lagged contributions in every target equation.",
    detail:
      "The paper builds its connections from a multivariate time-series model. Estimating isolated pairwise links can fail to account for overlapping regressors. In the lab’s explicit convention, rows identify targets and columns identify sources; incoming contributions are added synchronously from the old state.",
  },
  {
    title: "Stable changes can leave a lasting displacement",
    page: 14,
    printed: "33",
    summary:
      "The stable source matrix has diagonal coefficients 1/4, cross coefficients −1/4, and eigenvalues 1/2 and 0.",
    detail:
      "The source applies a Stocks shock of −1/2 and illustrates the response at several horizons. With the lab’s declared r₀ = (−0.5,0) and additive cumulative convention, rates decay and the cumulative response tends to (−0.75,+0.25). The limit is calculated from the published parameters, rather than reported as an empirical estimate.",
  },
  {
    title: "A unit-root direction keeps moving",
    page: 15,
    printed: "34",
    summary:
      "The steady source matrix has diagonal coefficients 1/2, cross coefficients −1/2, and eigenvalues 1 and 0.",
    detail:
      "Following the same coordinate shock, the source example retains an opposing-move component. Under the lab’s timing convention, changes remain (−0.25,+0.25) from horizon one onward and cumulative values grow linearly. This drift belongs to the source’s +1 eigenvalue example; other unit-circle cases can oscillate instead.",
  },
  {
    title: "An opposing-move mode amplifies the shock",
    page: 15,
    printed: "34",
    summary:
      "The explosive source matrix has diagonal coefficients 2/3, cross coefficients −2/3, and eigenvalues 4/3 and 0.",
    detail:
      "A shock with exposure to the opposing-move direction grows geometrically. The paper’s figures on printed page 37 / PDF page 18 illustrate this amplification. These coefficients are stylized examples; the result does not measure crash likelihood or imply that every possible shock excites the growing direction.",
  },
  {
    title: "Read the spectral argument critically",
    page: 22,
    printed: "41",
    summary:
      "The appendix uses eigenvalues to explain the three regimes. Its general statements require two mathematical qualifications.",
    detail:
      "For discrete-time systems with complex eigenvalues, stability depends on modulus rather than real part. Also, an invertible matrix need not be diagonalizable. Matrix-power iteration works without diagonalization; the source’s symmetric worked matrices do have an eigenbasis. The lab applies these qualifications explicitly.",
  },
];

export const readingList = [
  {
    title: "Stochastic flow diagrams",
    author: "Neil J. Calkin and Marcos López de Prado",
    url: "https://ssrn.com/abstract=2379314",
    note: "The supplied article: Algorithmic Finance 3 (2014), 21–42. Source links in the lab use physical PDF pages, including the journal cover as page one.",
  },
  {
    title: "Journal publication · DOI 10.3233/AF-140032",
    author: "Algorithmic Finance / IOS Press",
    url: "https://doi.org/10.3233/AF-140032",
    note: "The publication identifier printed on the article’s first page. Use the original for the full graph nomenclature, diagrams, derivations and historical Python snippets.",
  },
  {
    title:
      "The Topology of Macro Financial Flows: An Application of Stochastic Flow Diagrams",
    author: "Neil J. Calkin and Marcos López de Prado",
    url: "https://ssrn.com/abstract=2379319",
    note: "A related application cited by the source article. It is further reading; this lab does not reproduce or evaluate its dataset or empirical results.",
  },
];

export const limitations = [
  {
    title: "A representation is not an estimate",
    text: "The site uses source-declared parameters and clearly marked synthetic examples. It does not fit observations, calculate p-values, estimate R² or establish that a displayed link exists in current markets.",
  },
  {
    title: "A directed link does not identify an intervention",
    text: "A multivariate lag coefficient can describe predictive dependence. Interpreting it as a causal policy effect needs additional assumptions about omitted variables, common shocks, timing and structural identification.",
  },
  {
    title: "A fixed linear model is conditional",
    text: "Responses assume the coefficients remain fixed. Actual systems may have changing regimes, nonlinearities, constraints and coefficient uncertainty. The graph makes a model visible without resolving those modeling choices.",
  },
  {
    title: "Stochastic does not mean a probability-transfer graph",
    text: "The model has random innovations, but its arrow coefficients can be negative and need not sum to one. Neither probability conservation nor physical money-flow conservation follows automatically.",
  },
  {
    title: "Separate changes from cumulative levels",
    text: "A decaying impulse response can accumulate to a nonzero displacement. A constant change can create unbounded cumulative drift. The lab uses additive arbitrary-unit changes and makes its t=0 convention explicit.",
  },
  {
    title: "The unit-circle boundary needs care",
    text: "The paper’s steady example has a semisimple +1 eigenvalue. Other boundary cases can alternate or oscillate; defective unit-root matrices can grow polynomially. A spectral radius of one is therefore a boundary label, rather than a universal promise of constant drift.",
  },
  {
    title: "Asymptotic stability leaves short-run questions open",
    text: "A non-normal system can amplify an early response before it eventually decays. Conversely, a particular shock may fail to excite an explosive direction. Always inspect the chosen shock, horizon and complete response alongside the spectral radius.",
  },
  {
    title: "More lags and simultaneous effects change the calculation",
    text: "VAR(p) stability uses its companion matrix. A contemporaneous system must be solved jointly before advancing time. Testing individual coefficients or updating target variables in place can give the wrong dynamics.",
  },
];
