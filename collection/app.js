import { papers as catalog, sourceUrl } from '../shared/catalog.js';

function element(tag, className, text) {
  const node = document.createElement(tag);
  if (className) node.className = className;
  if (text !== undefined) node.textContent = text;
  return node;
}

// The first two entries have bespoke covers; later registry entries join the same collection.
const listedSlugs = new Set([...document.querySelectorAll('[data-paper]')].map(paper => paper.querySelector('a').getAttribute('href').split('/')[1]));
for (const [index, paper] of catalog.entries()) {
  if (listedSlugs.has(paper.slug)) continue;
  const subjects = [];
  if (paper.tags.some(tag => /finance|portfolio|risk|economics/i.test(tag))) subjects.push('finance');
  else subjects.push('beyond');
  if (paper.tags.some(tag => /mathemat|foundation|linear algebra|dynamic system|statistics/i.test(tag))) subjects.push('foundations');
  const card = element('article', 'paper-card paper-generic');
  card.dataset.paper = '';
  card.dataset.subjects = subjects.join(' ');
  card.dataset.search = [paper.title, paper.paperTitle, paper.authors, paper.summary, paper.ssrnId, ...paper.tags].join(' ');
  const visual = element('a', 'card-visual generic-visual');
  visual.href = `/${paper.slug}/`;
  visual.setAttribute('aria-label', `Explore ${paper.paperTitle}`);
  const label = element('span', 'visual-label', String(index + 1).padStart(3, '0'));
  label.append(element('span', '', 'A NEW PERSPECTIVE'));
  visual.append(label);
  const diagram = document.createElementNS('http://www.w3.org/2000/svg', 'svg');
  diagram.setAttribute('viewBox', '0 0 560 300');
  diagram.setAttribute('aria-hidden', 'true');
  const paths = [['ellipse', { cx: 280, cy: 150, rx: 155, ry: 65 }], ['ellipse', { cx: 280, cy: 150, rx: 65, ry: 115 }], ['circle', { cx: 280, cy: 150, r: 115 }], ['path', { d: 'M85 150H475M280 32V268' }], ['circle', { cx: 280, cy: 150, r: 5 }]];
  for (const [tag, attributes] of paths) {
    const shape = document.createElementNS('http://www.w3.org/2000/svg', tag);
    for (const [key, value] of Object.entries(attributes)) shape.setAttribute(key, value);
    diagram.append(shape);
  }
  visual.append(diagram, element('span', 'visual-caption', 'RESEARCH, MADE EXPLORABLE.'), element('span', 'visual-arrow', '↗'));
  const body = element('div', 'card-body');
  const tags = element('div', 'card-tags');
  for (const tag of paper.tags.slice(0, 2)) tags.append(element('span', '', tag.toUpperCase()));
  tags.append(element('span', '', `${paper.labs} LABS`));
  const heading = element('h3');
  const titleLink = element('a', '', paper.paperTitle);
  titleLink.href = `/${paper.slug}/`;
  heading.append(titleLink);
  const source = element('div', 'paper-source');
  source.append(element('span', 'source-eyebrow', 'BASED ON THE RESEARCH'), element('strong', '', paper.paperTitle), element('span', '', `${paper.authors}${paper.year ? ` · ${paper.year}` : ''}`));
  const footer = element('div', 'card-footer');
  const explore = element('a', 'explore', `Enter ${paper.title.replace(/^The /, 'the ')} `);
  explore.href = `/${paper.slug}/`;
  explore.append(element('span', '', '↗'));
  const original = element('a', 'source-link', `SSRN ${paper.ssrnId} ↗`);
  original.href = sourceUrl(paper.slug);
  original.setAttribute('aria-label', `Original ${paper.paperTitle} on SSRN`);
  footer.append(explore, original);
  body.append(tags, heading, element('p', '', paper.summary), source, footer);
  card.append(visual, body);
  document.querySelector('.paper-grid').append(card);
}

const search = document.querySelector('#paper-search');
const filters = [...document.querySelectorAll('[data-filter]')];
const papers = [...document.querySelectorAll('[data-paper]')];
const resultCount = document.querySelector('[data-result-count]');
const emptyState = document.querySelector('[data-empty-state]');
const emptyDescription = document.querySelector('[data-empty-description]');
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
  });
}
document.querySelector('[data-clear-filters]').addEventListener('click', () => {
  activeSubject = 'all';
  search.value = '';
  updateCatalog();
  search.focus({ preventScroll: true });
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
