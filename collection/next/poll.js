export function toggleChoice(current, id, eligible) {
  if (!eligible.has(id)) throw new Error('This paper is not open for voting.');
  const next = new Set(current);
  if (next.has(id)) next.delete(id);
  else {
    if (next.size >= 3) throw new Error('You can choose up to three papers.');
    next.add(id);
  }
  return next;
}

export function sameChoices(left, right) {
  return left.size === right.size && [...left].every(id => right.has(id));
}

export function sortedPapers(papers, order, votes) {
  return [...papers].sort((a, b) => {
    if (order === 'title') return a.title.localeCompare(b.title);
    if (order === 'votes') return (votes?.[b.id] ?? 0) - (votes?.[a.id] ?? 0) || a.editorialOrder - b.editorialOrder;
    if (order === 'citations') return (b.citations ?? -1) - (a.citations ?? -1) || a.editorialOrder - b.editorialOrder;
    return a.editorialOrder - b.editorialOrder;
  });
}

export function matchesSearch(paper, query) {
  const normalize = value => value.normalize('NFD').replace(/[\u0300-\u036f]/g, '').toLowerCase();
  const haystack = normalize([paper.title, paper.authors, paper.id, paper.question || '', paper.concept || ''].join(' '));
  return normalize(query).trim().split(/\s+/).every(term => haystack.includes(term));
}
