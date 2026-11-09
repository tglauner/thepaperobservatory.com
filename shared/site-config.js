export const site = Object.freeze({
  name: "The Paper Observatory",
  domain: "thepaperobservatory.com",
  origin: "https://thepaperobservatory.com",
  repository: "https://github.com/tglauner/thepaperobservatory.com",
  publisher: "TG Investments and Research, LLC",
  contact: "https://tglauner.com/",
  initialDesign: { model: "gpt-6.1-sol", reasoning: "ultra", execution: "cloud", fallback: "none" },
  channels: [],
});

export const courses = Object.freeze([
  { id: "var", title: "Value at Risk", category: "Portfolio risk", description: "Connect covariance, simulation and historical scenarios to portfolio loss estimates.", url: "https://tglauner.com/value_at_risk/", topics: ["risk-on-off", "stochastic-flow-diagrams"] },
  { id: "rates", title: "Mastering Interest Rate Derivatives", category: "Rates & derivatives", description: "Build intuition for curves, swaps, options and the risks behind the valuation.", url: "https://tglauner.com/mastering_interest_rate_derivatives/", topics: ["stochastic-flow-diagrams", "risk-on-off"] },
  { id: "mbs", title: "Mastering MBS and ABS", category: "Structured finance", description: "Explore securitization, cash flows, prepayments and structured-product analytics.", url: "https://tglauner.com/mastering_mbs_and_abs/", topics: [] },
  { id: "frtb", title: "Fundamental Review of the Trading Book", category: "Market risk capital", description: "Connect market-risk measurement to the standardized and internal-model approaches.", url: "https://tglauner.com/frtb_fundamentals/", topics: ["risk-on-off"] },
]);

export function campaignUrl(url, { source = "observatory", medium = "referral", campaign = "course-library", content } = {}) {
  const parsed = new URL(url);
  if (parsed.protocol !== "https:") throw new Error("Commercial links must use HTTPS.");
  parsed.searchParams.set("utm_source", source);
  parsed.searchParams.set("utm_medium", medium);
  parsed.searchParams.set("utm_campaign", campaign);
  if (content) parsed.searchParams.set("utm_content", content);
  return parsed.href;
}
