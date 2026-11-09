export const papers = Object.freeze([
  { slug: "risk-on-off", title: "The Risk Observatory", paperTitle: "Managing Risks in a Risk-On/Risk-Off Environment", ssrnId: "2150877", authors: "Marcos López de Prado", year: null, summary: "Find the hidden bets beneath the assets. Explore correlation, principal components and concentration.", tags: ["Finance", "Portfolio risk", "Linear algebra"], labs: 4, devPort: 5174, previewPort: 4174, sourceFile: "ssrn-2150877.pdf", sourcePages: 50, printedOffset: 0, sourceHash: "e7a4b30973d60ccdf3a99143ce362cd202afff75d435cb3f87d3994afed1c5de" },
  { slug: "stochastic-flow-diagrams", title: "The Flow Observatory", paperTitle: "Stochastic flow diagrams", ssrnId: "2379314", authors: "Neil J. Calkin & Marcos López de Prado", year: 2014, summary: "Follow a shock through a system. Explore feedback, stability, memory and uncertainty.", tags: ["Finance", "Dynamic systems", "Time series"], labs: 5, devPort: 5175, previewPort: 4175, sourceFile: "ssrn-2379314.pdf", sourcePages: 23, printedOffset: 19, sourceHash: "9d140b75c013124d8267d821412cd6ea7dc1a282d06d16e849f45ed452331e54" },
]);

export function getPaper(slug) {
  const paper = papers.find(item => item.slug === slug);
  if (!paper) throw new Error(`Unknown paper: ${slug}`);
  return paper;
}

export function sourceUrl(slug, page, { local = false } = {}) {
  const paper = getPaper(slug);
  if (page !== undefined && (!Number.isInteger(page) || page < 1 || page > paper.sourcePages)) throw new Error("Invalid physical PDF page.");
  return local
    ? `/${paper.slug}/paper.pdf${page === undefined ? "" : `#page=${page}`}`
    : `https://papers.ssrn.com/sol3/papers.cfm?abstract_id=${paper.ssrnId}`;
}
