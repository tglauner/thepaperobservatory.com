import { papers as catalog, sourceUrl } from '../shared/catalog.js';

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// Newly registered papers inherit the same compact navigation and source disclosure.
const listedSlugs = new Set([...document.querySelectorAll('[data-paper]')].map(paper => paper.querySelector('a').getAttribute('href').split('/')[1]));
for (const paper of catalog) {
  if (listedSlugs.has(paper.slug)) continue;
  const subjects = [];
  if (paper.tags.some(tag => /finance|portfolio|risk|economics/i.test(tag))) subjects.push('finance');
  else subjects.push('beyond');
  if (paper.tags.some(tag => /mathemat|foundation|linear algebra|dynamic system|statistics/i.test(tag))) subjects.push('foundations');
  const card = element('article', 'paper-card');
  card.dataset.paper = '';
  card.dataset.subjects = subjects.join(' ');
  card.dataset.search = [paper.title, paper.paperTitle, paper.authors, paper.summary, paper.sourceRef, ...paper.tags].join(' ');
  const link = element('a', 'model-link');
  link.href = `/${paper.slug}/`;
  const code = element('span', 'model-code', 'NEW');
  code.setAttribute('aria-hidden', 'true');
  const copy = element('span', 'model-copy');
  copy.append(element('strong', '', paper.title.replace(/^The /, '').replace(/ Observatory$/, '')), element('span', '', paper.summary));
  const arrow = element('span', 'model-arrow', '↗');
  arrow.setAttribute('aria-hidden', 'true');
  link.append(code, copy, arrow);
  const source = element('details', 'paper-source');
  const summary = element('summary');
  summary.append(element('span', 'sr-only', `${paper.paperTitle} paper `), document.createTextNode('Source'));
  const citation = element('div');
  const original = element('a', '', `${paper.sourceLabel} · Original source ↗`);
  original.href = sourceUrl(paper.slug);
  citation.append(element('p', '', paper.summary), element('strong', '', paper.paperTitle), element('p', '', `${paper.authors}${paper.year ? ` · ${paper.year}` : ''}`), original);
  source.append(summary, citation);
  card.append(link, source);
  document.querySelector('.paper-grid').append(card);
}

const search = document.querySelector('#paper-search');
const filters = [...document.querySelectorAll('[data-filter]')];
const papers = [...document.querySelectorAll('[data-paper]')];
const resultCount = document.querySelector('[data-result-count]');
const emptyState = document.querySelector('[data-empty-state]');
const emptyDescription = document.querySelector('[data-empty-description]');
const filterDisclosure = document.querySelector('.filter-disclosure');
const subjectLabels = { all: 'Filter', finance: 'Finance', foundations: 'Foundations', beyond: 'Beyond finance' };
let activeSubject = 'all';
document.querySelector('[data-filter="all"] span').textContent = String(papers.length).padStart(2, '0');

function normalize(value) {
  return value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
}

function updateCatalog() {
  const terms = normalize(search.value).trim().split(/\s+/).filter(Boolean);
  let count = 0;
  for (const paper of papers) {
    const inSubject = activeSubject === 'all' || paper.dataset.subjects.split(' ').includes(activeSubject);
    const haystack = normalize(`${paper.dataset.search} ${paper.textContent}`);
    const matches = inSubject && terms.every(term => haystack.includes(term));
    paper.hidden = !matches;
    if (matches) count += 1;
  }
  resultCount.textContent = `${count} ${count === 1 ? 'paper' : 'papers'}`;
  filterDisclosure.querySelector('summary').textContent = activeSubject === 'all' ? 'Filter' : `Filter: ${subjectLabels[activeSubject]}`;
  emptyState.hidden = count !== 0;
  emptyDescription.textContent = activeSubject === 'beyond' && terms.length === 0
    ? 'The collection begins with finance and mathematical foundations. Exceptional visual research from other fields will have a home here as the collection grows.'
    : `Try another subject or a different search. There ${papers.length === 1 ? 'is' : 'are'} currently ${papers.length} ${papers.length === 1 ? 'companion' : 'companions'} in the collection.`;
  for (const filter of filters) {
    const selected = filter.dataset.filter === activeSubject;
    filter.classList.toggle('is-active', selected);
    filter.setAttribute('aria-pressed', String(selected));
  }
}

search.addEventListener('input', updateCatalog);
for (const filter of filters) {
  filter.addEventListener('click', () => {
    activeSubject = filter.dataset.filter;
    updateCatalog();
    document.querySelector('.filter-disclosure').open = false;
    document.querySelector('.filter-disclosure > summary').focus();
  });
}
document.querySelector('[data-clear-filters]').addEventListener('click', () => {
  activeSubject = 'all';
  search.value = '';
  updateCatalog();
  search.focus({ preventScroll: true });
});

filterDisclosure.addEventListener('keydown', event => {
  if (event.key === 'Escape') {
    filterDisclosure.open = false;
    filterDisclosure.querySelector('summary').focus();
  }
});

const correlation = document.querySelector('#hero-correlation');
const correlationOutput = document.querySelector('#correlation-output');
const shareOutput = document.querySelector('[data-variance-share]');
const chartDescription = document.querySelector('#hero-chart-description');
const pointGroup = document.querySelector('[data-ellipse-points]');
const samplePoints = [[-.77, .12], [-.62, -.3], [-.51, .37], [-.4, -.54], [-.35, -.03], [-.2, .62], [-.15, -.29], [-.02, .25], [.07, -.72], [.12, .42], [.21, -.12], [.3, -.42], [.37, .21], [.48, .58], [.56, -.25], [.68, .13], [.8, -.08]];
const circles = samplePoints.map(() => {
  const circle = document.createElementNS('http://www.w3.org/2000/svg', 'circle');
  circle.setAttribute('r', '1.8');
  pointGroup.append(circle);
  return circle;
});

function updateCorrelation() {
  const rho = Number(correlation.value) / 100;
  const major = 120 * Math.sqrt(1 + rho);
  const minor = 120 * Math.sqrt(1 - rho);
  const share = ((1 + rho) * 50).toFixed(1);
  const value = rho.toFixed(2);
  const scales = { outer: 1, middle: .75, inner: .5 };
  for (const ellipse of document.querySelectorAll('[data-ellipse]')) {
    ellipse.setAttribute('rx', String(major * scales[ellipse.dataset.ellipse]));
    ellipse.setAttribute('ry', String(minor * scales[ellipse.dataset.ellipse]));
  }
  document.querySelector('[data-principal-axis]').setAttribute('d', `M${-major - 17} 0H${major + 17}`);
  document.querySelector('[data-minor-axis]').setAttribute('d', `M0 ${-minor - 16}V${minor + 16}`);
  samplePoints.forEach(([x, y], index) => {
    circles[index].setAttribute('cx', String(x * major));
    circles[index].setAttribute('cy', String(y * minor));
  });
  correlationOutput.textContent = `ρ = ${value}`;
  correlation.setAttribute('aria-valuetext', `Correlation ${value}; shared direction holds ${share} percent of total variance`);
  shareOutput.textContent = `${share}%`;
  chartDescription.textContent = `An ellipse stretches along a shared risk direction as positive correlation rises. At correlation ${value}, this direction holds ${share} percent of total variance. This is a synthetic teaching model of two equal-volatility assets.`;
}

correlation.addEventListener('input', updateCorrelation);
updateCorrelation();
updateCatalog();
document.querySelector('[data-current-year]').textContent = String(new Date().getFullYear());
