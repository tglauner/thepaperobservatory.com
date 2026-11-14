import test from 'node:test';
import assert from 'node:assert/strict';
import { DatabaseSync } from 'node:sqlite';
import { readFileSync } from 'node:fs';
import poll from '../content/research-poll.json' with { type: 'json' };
import worker, { validChoices, allowedOrigin } from '../services/voting/worker.js';
import { toggleChoice, sameChoices, sortedPapers, matchesSearch } from '../collection/next/poll.js';

const ids = poll.shortlist.map(paper => paper.id);
const eligible = new Set(ids);
const origin = 'https://thepaperobservatory.com';
const browser = '92c9b29a-d110-4f98-8044-f4e3632f1e5d';

function database() {
  const sqlite = new DatabaseSync(':memory:');
  sqlite.exec(readFileSync(new URL('../services/voting/schema.sql', import.meta.url), 'utf8'));
  const prepare = sql => {
    let values = [];
    return {
      bind(...args) { values = args; return this; },
      async first() { return sqlite.prepare(sql).get(...values) || null; },
      async all() { return { results: sqlite.prepare(sql).all(...values) }; },
      execute() {
        const statement = sqlite.prepare(sql);
        if (statement.columns().length) return { results: statement.all(...values) };
        statement.run(...values);
        return { results: [] };
      },
    };
  };
  return {
    prepare,
    async batch(statements) {
      sqlite.exec('BEGIN');
      try {
        const results = statements.map(statement => statement.execute());
        sqlite.exec('COMMIT');
        return results;
      } catch (error) {
        sqlite.exec('ROLLBACK');
        throw error;
      }
    },
    close: () => sqlite.close(),
  };
}

function fixture(t) {
  const DB = database();
  t.after(() => DB.close());
  const env = { DB, ALLOWED_ORIGINS: origin, RATE_SALT: 'unit-test-only-not-a-production-secret' };
  const send = (path, method = 'GET', choices, token = browser, extra = {}) => {
    const request = new Request(`https://voting.example${path}`, {
      method,
      headers: {
        Origin: origin,
        Authorization: `Bearer ${token}`,
        'Content-Type': 'application/json',
        'CF-Connecting-IP': '192.0.2.1',
        ...extra,
      },
      ...(method === 'PUT' ? { body: JSON.stringify({ choices }) } : {}),
    });
    return worker.fetch(request, env);
  };
  return { send, env };
}

test('ballot choices reject duplicate, off-shortlist and more than three IDs', () => {
  assert.ok(validChoices([]));
  assert.ok(validChoices(ids.slice(0, 3)));
  for (const choices of [null, {}, [ids[0], ids[0]], ['unknown'], ids.slice(0, 4), [123]]) {
    assert.equal(validChoices(choices), false);
  }
});

test('selection caps at three but always permits deselection', () => {
  let choices = new Set(ids.slice(0, 3));
  assert.throws(() => toggleChoice(choices, ids[3], eligible), /three/);
  choices = toggleChoice(choices, ids[0], eligible);
  assert.equal(choices.size, 2);
  assert.equal(toggleChoice(choices, ids[3], eligible).size, 3);
  assert.throws(() => toggleChoice(choices, 'unknown', eligible), /not open/);
  assert.ok(sameChoices(new Set(['a', 'b']), new Set(['b', 'a'])));
});

test('search and ordering work across title, author, concept and counts without mutating data', () => {
  assert.ok(matchesSearch(poll.shortlist[0], 'Fedspeak'));
  assert.equal(matchesSearch(poll.shortlist[0], 'unfindable xyz'), false);
  const before = poll.shortlist.map(paper => paper.id);
  const votes = Object.fromEntries(ids.map((id, i) => [id, i]));
  assert.equal(sortedPapers(poll.shortlist, 'votes', votes)[0].id, ids.at(-1));
  assert.deepEqual(poll.shortlist.map(paper => paper.id), before);
});

test('only exact configured origins and project preview origins are permitted', () => {
  assert.ok(allowedOrigin(origin, origin));
  assert.ok(allowedOrigin('https://abc123.thepaperobservatory.pages.dev', origin));
  for (const value of ['https://evil.example', 'https://thepaperobservatory.com.evil.example', 'null', null]) {
    assert.equal(allowedOrigin(value, origin), false);
  }
});

test('persisted ballots replace rather than accumulate, are private by browser key, and can be withdrawn', async t => {
  const { send } = fixture(t);
  assert.deepEqual((await (await send('/ballot')).json()).choices, []);
  assert.equal((await send('/ballot', 'PUT', ids.slice(0, 3))).status, 200);
  assert.deepEqual((await (await send('/ballot')).json()).choices, ids.slice(0, 3));
  let results = await (await send('/results')).json();
  assert.equal(results.ballots, 1);
  assert.equal(results.votes[ids[0]], 1);
  await send('/ballot', 'PUT', [ids[3]]);
  results = await (await send('/results')).json();
  assert.equal(results.ballots, 1);
  assert.equal(results.votes[ids[0]], 0);
  assert.equal(results.votes[ids[3]], 1);
  const another = 'a4d3dbcc-85bc-421a-a46f-b64424ed94d7';
  assert.deepEqual((await (await send('/ballot', 'GET', undefined, another)).json()).choices, []);
  await send('/ballot', 'PUT', [ids[3]], another);
  results = await (await send('/results')).json();
  assert.equal(results.ballots, 2);
  assert.equal(results.votes[ids[3]], 2);
  await send('/ballot', 'PUT', []);
  results = await (await send('/results')).json();
  assert.equal(results.ballots, 1);
  assert.equal(results.votes[ids[3]], 1);
});

test('invalid input, unauthorized origins and malformed tokens do not create ballots', async t => {
  const { send } = fixture(t);
  assert.equal((await send('/ballot', 'PUT', ids.slice(0, 4))).status, 400);
  assert.equal((await send('/ballot', 'PUT', [ids[0], ids[0]])).status, 400);
  assert.equal((await send('/ballot', 'PUT', [ids[0]], browser, { Origin: 'https://evil.example' })).status, 403);
  assert.equal((await send('/ballot', 'PUT', [ids[0]], 'invalid')).status, 401);
  const response = await send('/ballot', 'PUT', [ids[0]], browser, { 'Content-Type': 'text/plain' });
  assert.equal(response.status, 415);
  assert.equal((await (await send('/results')).json()).ballots, 0);
});

test('oversized and invalid JSON are rejected with an explicit error', async t => {
  const { env } = fixture(t);
  for (const body of ['{', JSON.stringify({ choices: [], padding: 'x'.repeat(2100) })]) {
    const response = await worker.fetch(new Request('https://voting.example/ballot', {
      method: 'PUT',
      headers: { Origin: origin, Authorization: `Bearer ${browser}`, 'Content-Type': 'application/json' },
      body,
    }), env);
    assert.equal(response.status, 400);
    assert.match((await response.json()).error, /JSON/);
  }
});

test('network write limits reject excessive updates without changing the saved ballot', async t => {
  const { send } = fixture(t);
  for (let i = 0; i < 60; i++) assert.equal((await send('/ballot', 'PUT', [ids[0]])).status, 200);
  assert.equal((await send('/ballot', 'PUT', [ids[1]])).status, 429);
  assert.deepEqual((await (await send('/ballot')).json()).choices, [ids[0]]);
});

test('results do not count ballots from another poll', async t => {
  const { send, env } = fixture(t);
  await env.DB.batch([env.DB.prepare(
    'INSERT INTO ballots (voter_hash, poll_id, choices) VALUES (?, ?, ?)'
  ).bind('other', 'another-round', JSON.stringify([ids[0]]))]);
  const data = await (await send('/results')).json();
  assert.equal(data.ballots, 0);
  assert.equal(data.votes[ids[0]], 0);
});
