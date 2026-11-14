import poll from '../../content/research-poll.json';
import { toggleChoice, sameChoices, sortedPapers, matchesSearch } from './poll.js';

const API = import.meta.env.VITE_VOTING_API || 'https://paper-observatory-voting.glaunertim.workers.dev';
const $ = selector => document.querySelector(selector);
const eligible = new Set(poll.shortlist.map(paper => paper.id));
let draft = new Set();
let saved = new Set();
let votes = null;
let token;
let ready = false;
let busy = false;
let resultsBusy = false;
let archivePage = 0;

function node(tag, className, text) {
  const element = document.createElement(tag);
  if (className) element.className = className;
  if (text !== undefined) element.textContent = text;
  return element;
}

function sourceLink(paper) {
  const link = node('a', '', `Read source on SSRN ↗`);
  link.href = `https://papers.ssrn.com/sol3/papers.cfm?abstract_id=${paper.id}`;
  link.target = '_blank';
  link.rel = 'noopener noreferrer';
  return link;
}

function statement(label, text) {
  const p = node('p');
  p.append(node('strong', '', `${label} `), document.createTextNode(text));
  return p;
}

function status(message) {
  $('#ballot-status').textContent = message;
}

function updateBallot() {
  $('#ballot-count').textContent = `${draft.size} of 3 selected`;
  $('#ballot-choices').textContent = poll.shortlist.filter(paper => draft.has(paper.id))
    .map(paper => paper.question).join(' · ') || 'Your curiosity starts here.';
  $('#save-ballot').disabled = !ready || busy || sameChoices(draft, saved);
  $('#save-ballot').textContent = busy ? 'Saving…' : saved.size && !draft.size ? 'Withdraw my ballot' : 'Save my ballot';
  $('#clear-ballot').disabled = !ready || busy || !draft.size;
}

function renderShortlist() {
  const expanded = new Set([...document.querySelectorAll('#shortlist-rows details[open]')].map(detail => detail.dataset.id));
  const papers = sortedPapers(poll.shortlist, $('#shortlist-sort').value, votes)
    .filter(paper => matchesSearch(paper, $('#shortlist-search').value));
  const rows = papers.map(paper => {
    const row = node('tr', draft.has(paper.id) ? 'is-selected' : '');
    row.id = `paper-${paper.id}`;
    const pick = node('td');
    const label = node('label', 'paper-pick');
    const checkbox = node('input');
    checkbox.type = 'checkbox';
    checkbox.id = `pick-${paper.id}`;
    checkbox.setAttribute('aria-label', `Vote for ${paper.question}`);
    checkbox.checked = draft.has(paper.id);
    checkbox.disabled = !ready || busy || (draft.size >= 3 && !draft.has(paper.id));
    checkbox.addEventListener('change', () => {
      try {
        draft = toggleChoice(draft, paper.id, eligible);
        status('Unsaved choices. Save your ballot to make them count.');
      } catch (error) {
        status(error.message);
      }
      renderShortlist();
      updateBallot();
      document.getElementById(`pick-${paper.id}`)?.focus({ preventScroll: true });
    });
    label.append(checkbox);
    pick.append(label);
    const info = node('td');
    if (paper.recommended) info.append(node('span', 'pick-badge', 'ONE OF OUR NEXT FIVE'));
    info.append(node('h3', 'paper-question', paper.question), node('span', 'paper-subtitle', paper.title), node('p', 'paper-authors', paper.authors));
    const details = node('details');
    details.dataset.id = paper.id;
    details.open = expanded.has(paper.id);
    details.append(node('summary', '', 'The experiment, what you’ll learn & the caveat'));
    const detail = node('div', 'idea-detail');
    detail.append(statement('Try this:', paper.concept), statement('Take away:', paper.learn), statement('Keep in mind:', paper.caveat),
      statement('Evidence:', `${paper.review} Physical PDF pages: ${paper.pages.join(', ')} in the reviewed version.`));
    const links = node('div', 'paper-links');
    const share = node('button', 'text-link', 'Copy this idea’s link');
    share.type = 'button';
    share.addEventListener('click', () => copyLink(`#paper-${paper.id}`));
    links.append(sourceLink(paper), share);
    detail.append(links);
    details.append(detail);
    info.append(details);
    const citations = node('td');
    citations.append(node('span', 'metric', paper.citations === null ? '—' : paper.citations.toLocaleString()), node('span', 'metric-note', 'OPENALEX'));
    const count = node('td');
    count.append(node('span', 'metric', votes ? votes[paper.id].toLocaleString() : '—'), node('span', 'metric-note', 'CHOICES'));
    if (votes) {
      const max = Math.max(1, ...Object.values(votes));
      const bar = node('span', 'vote-bar');
      bar.style.width = `${80 * votes[paper.id] / max}px`;
      bar.setAttribute('aria-hidden', 'true');
      count.append(bar);
    }
    row.append(pick, info, citations, count);
    return row;
  });
  $('#shortlist-rows').replaceChildren(...rows);
  $('#shortlist-empty').hidden = rows.length > 0;
}

function renderArchive() {
  const filter = $('#archive-filter').value;
  const papers = poll.archive.filter(paper => matchesSearch(paper, $('#archive-search').value) &&
    (filter === 'all' || (filter === 'shortlist' && eligible.has(paper.id)) ||
     (filter === 'reviewed' && paper.reviewed) || (filter === 'unverified' && paper.dateStatus === 'not_verified')));
  const rows = papers.slice(archivePage * 20, archivePage * 20 + 20).map(paper => {
    const row = node('tr');
    const info = node('td');
    const title = node('h3');
    const link = sourceLink(paper);
    link.textContent = `${paper.title} ↗`;
    title.append(link);
    info.append(title, node('p', 'paper-authors', paper.authors));
    const research = node('td');
    research.append(node('span', 'status-badge', paper.reviewed ? 'Source sections reviewed' : 'Needs source review'));
    research.append(node('span', 'metric-note', paper.dateStatus === 'exclude_before_window'
      ? 'Outside requested date window'
      : paper.posted ? `SSRN posted ${paper.posted}; earliest release unchecked` : 'SSRN date unverified'));
    if (eligible.has(paper.id)) {
      const vote = node('a', '', 'Open voting candidate ↑');
      vote.href = `#paper-${paper.id}`;
      research.append(vote);
    }
    row.append(node('td', '', String(paper.rank).padStart(3, '0')), info, node('td', '', paper.citations.toLocaleString()), research);
    return row;
  });
  $('#archive-rows').replaceChildren(...rows);
  $('#archive-count').textContent = `${papers.length} of 100 research leads`;
  $('#archive-empty').hidden = papers.length > 0;
  const pages = Math.max(1, Math.ceil(papers.length / 20));
  $('#archive-page').textContent = `Page ${archivePage + 1} of ${pages}`;
  $('#archive-previous').disabled = archivePage === 0;
  $('#archive-next').disabled = archivePage + 1 >= pages;
}

async function request(path, options = {}) {
  const response = await fetch(`${API}${path}`, { ...options, signal: AbortSignal.timeout(15000) });
  const body = await response.json();
  if (!response.ok) throw new Error(body.error || 'The voting request failed.');
  return body;
}

async function refreshResults() {
  const data = await request('/results');
  if (data.poll !== poll.id || !Number.isSafeInteger(data.ballots) || data.ballots < 0 ||
      !data.votes || !poll.shortlist.every(paper => Number.isSafeInteger(data.votes[paper.id]) && data.votes[paper.id] >= 0)) {
    throw new Error('The voting service returned invalid results.');
  }
  votes = data.votes;
  $('#community-summary').textContent = `${data.ballots.toLocaleString()} community ballot${data.ballots === 1 ? '' : 's'} · up to 3 choices each`;
  renderShortlist();
}

function checkChoices(choices) {
  if (!Array.isArray(choices) || choices.length > 3 || new Set(choices).size !== choices.length ||
    !choices.every(id => eligible.has(id))) throw new Error('The voting service returned an invalid ballot.');
}

async function connect() {
  try {
    const key = `observatory-ballot:${poll.id}`;
    token = localStorage.getItem(key);
    if (!token) {
      token = crypto.randomUUID();
      localStorage.setItem(key, token);
    }
    if (!/^[0-9a-f-]{36}$/i.test(token)) throw new Error('The saved browser ballot key is invalid. Clear this site’s saved data to reset it.');
    const data = await request('/ballot', { headers: { Authorization: `Bearer ${token}` } });
    checkChoices(data.choices);
    saved = new Set(data.choices);
    draft = new Set(saved);
    ready = true;
    status(saved.size ? 'Your saved ballot is loaded. Changes replace your previous choices.' : 'Choose up to three. Nothing is submitted until you save.');
  } catch (error) {
    ready = false;
    status(`Voting could not connect: ${error.message} Reload to retry. Browser storage must be available.`);
  }
  renderShortlist();
  updateBallot();
}

async function copyLink(hash = '') {
  try {
    await navigator.clipboard.writeText(`https://thepaperobservatory.com/next/${hash}`);
    status('Voting link copied. Share it anywhere you want people to weigh in.');
  } catch (error) {
    status(`Could not copy the link: ${error.message} You can copy https://thepaperobservatory.com/next/ from your address bar.`);
  }
}

function openLinkedPaper() {
  const id = location.hash.slice('#paper-'.length);
  if (!location.hash.startsWith('#paper-') || !eligible.has(id)) return;
  $('#shortlist-search').value = '';
  renderShortlist();
  const row = document.getElementById(`paper-${id}`);
  row.querySelector('details').open = true;
  row.style.scrollMarginTop = `${$('.ballot-panel').offsetHeight + 20}px`;
  row.scrollIntoView({ block: 'start' });
}

$('#save-ballot').addEventListener('click', async () => {
  if (!ready || busy) return;
  busy = true;
  updateBallot();
  renderShortlist();
  try {
    const data = await request('/ballot', {
      method: 'PUT',
      headers: { 'Content-Type': 'application/json', Authorization: `Bearer ${token}` },
      body: JSON.stringify({ choices: [...draft] }),
    });
    checkChoices(data.choices);
    if (data.saved !== true || !sameChoices(new Set(data.choices), draft)) throw new Error('Ballot confirmation did not match your choices.');
    saved = new Set(data.choices);
    status(saved.size ? 'Ballot saved. Your choices now count in the community results.' : 'Ballot withdrawn. You can choose again at any time.');
    try {
      await refreshResults();
    } catch (error) {
      $('#community-summary').textContent = `Your ballot was saved, but results could not refresh: ${error.message}`;
    }
  } catch (error) {
    status(`Your ballot could not be confirmed: ${error.message} Retry safely; saving replaces rather than adds a ballot.`);
  } finally {
    busy = false;
    updateBallot();
    renderShortlist();
  }
});
$('#clear-ballot').addEventListener('click', () => {
  draft = new Set();
  renderShortlist();
  updateBallot();
  status(saved.size ? 'Choices cleared locally. Save to withdraw your previous ballot.' : 'Choices cleared. Nothing has been submitted.');
});
$('#share-poll').addEventListener('click', () => copyLink());
$('#shortlist-search').addEventListener('input', renderShortlist);
$('#shortlist-sort').addEventListener('change', renderShortlist);
$('#archive-search').addEventListener('input', () => { archivePage = 0; renderArchive(); });
$('#archive-filter').addEventListener('change', () => { archivePage = 0; renderArchive(); });
$('#archive-previous').addEventListener('click', () => { archivePage -= 1; renderArchive(); });
$('#archive-next').addEventListener('click', () => { archivePage += 1; renderArchive(); });
$('#refresh-results').addEventListener('click', async () => {
  if (resultsBusy) return;
  resultsBusy = true;
  try {
    await refreshResults();
  } catch (error) {
    $('#community-summary').textContent = `Results unavailable: ${error.message}`;
  } finally {
    resultsBusy = false;
  }
});
window.addEventListener('hashchange', openLinkedPaper);
$('.voting-section .research-table-wrap').before($('.ballot-panel'));
renderShortlist();
renderArchive();
openLinkedPaper();
connect();
refreshResults().catch(error => {
  $('#community-summary').textContent = `Results unavailable: ${error.message} Use Refresh community results to retry.`;
});
