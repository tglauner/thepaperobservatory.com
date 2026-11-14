import poll from '../../content/research-poll.json' with { type: 'json' };

const candidateIds = new Set(poll.shortlist.map(paper => paper.id));
const tokenPattern = /^Bearer ([0-9a-f]{8}-[0-9a-f]{4}-4[0-9a-f]{3}-[89ab][0-9a-f]{3}-[0-9a-f]{12})$/i;

export function validChoices(choices) {
  return Array.isArray(choices) && choices.length <= 3 &&
    choices.every(id => typeof id === 'string' && candidateIds.has(id)) &&
    new Set(choices).size === choices.length;
}

export function allowedOrigin(origin, configured) {
  return (configured || '').split(',').includes(origin) ||
    /^https:\/\/[a-z0-9-]+\.thepaperobservatory\.pages\.dev$/.test(origin || '');
}

async function digest(value) {
  const hash = await crypto.subtle.digest('SHA-256', new TextEncoder().encode(value));
  return Array.from(new Uint8Array(hash), byte => byte.toString(16).padStart(2, '0')).join('');
}

async function boundedBody(request) {
  const reader = request.body?.getReader();
  if (!reader) throw new Error('Empty request');
  const chunks = [];
  let length = 0;
  while (true) {
    const { done, value } = await reader.read();
    if (done) break;
    length += value.length;
    if (length > 2048) {
      await reader.cancel();
      throw new Error('Request too large');
    }
    chunks.push(value);
  }
  const combined = new Uint8Array(length);
  let offset = 0;
  for (const chunk of chunks) {
    combined.set(chunk, offset);
    offset += chunk.length;
  }
  return JSON.parse(new TextDecoder().decode(combined));
}

export default {
  async fetch(request, env) {
    const origin = request.headers.get('Origin');
    const allowed = allowedOrigin(origin, env.ALLOWED_ORIGINS);
    const headers = {
      'Content-Type': 'application/json',
      'Cache-Control': 'no-store',
      'X-Content-Type-Options': 'nosniff',
      'Vary': 'Origin',
      ...(allowed ? {
        'Access-Control-Allow-Origin': origin,
        'Access-Control-Allow-Methods': 'GET, PUT, OPTIONS',
        'Access-Control-Allow-Headers': 'Authorization, Content-Type',
      } : {}),
    };
    const respond = (body, status = 200) => new Response(JSON.stringify(body), { status, headers });
    const path = new URL(request.url).pathname;
    if (!['/results', '/ballot'].includes(path)) return respond({ error: 'Not found.' }, 404);
    if (origin && !allowed) return respond({ error: 'Origin not permitted.' }, 403);
    if (request.method === 'OPTIONS') return allowed
      ? new Response(null, { status: 204, headers })
      : respond({ error: 'Origin required.' }, 403);

    try {
      if (path === '/results' && request.method === 'GET') {
        const [result, total] = await env.DB.batch([
          env.DB.prepare(
            "SELECT j.value AS id, COUNT(*) AS votes FROM ballots, json_each(ballots.choices) j WHERE ballots.poll_id = ? GROUP BY j.value"
          ).bind(poll.id),
          env.DB.prepare(
            "SELECT COUNT(*) AS ballots FROM ballots WHERE poll_id = ? AND json_array_length(choices) > 0"
          ).bind(poll.id),
        ]);
        return respond({
          poll: poll.id,
          ballots: total.results[0].ballots,
          votes: Object.fromEntries(poll.shortlist.map(paper => [
            paper.id, result.results.find(row => row.id === paper.id)?.votes || 0,
          ])),
        });
      }
      if (path !== '/ballot' || !['GET', 'PUT'].includes(request.method)) {
        return respond({ error: 'Method not permitted.' }, 405);
      }
      const token = tokenPattern.exec(request.headers.get('Authorization') || '')?.[1];
      if (!token) return respond({ error: 'A valid browser ballot identifier is required.' }, 401);
      const voter = await digest(`${poll.id}:${token}`);
      if (request.method === 'GET') {
        const row = await env.DB.prepare('SELECT choices FROM ballots WHERE voter_hash = ?').bind(voter).first();
        return respond({ choices: row ? JSON.parse(row.choices) : [] });
      }
      if (!allowed) return respond({ error: 'Origin required.' }, 403);
      if (!request.headers.get('Content-Type')?.startsWith('application/json')) {
        return respond({ error: 'JSON is required.' }, 415);
      }
      let body;
      try {
        body = await boundedBody(request);
      } catch {
        return respond({ error: 'Invalid or oversized JSON request.' }, 400);
      }
      if (!body || !validChoices(body.choices)) {
        return respond({ error: 'Choose up to three different papers from the voting shortlist.' }, 400);
      }
      if (!env.RATE_SALT) throw new Error('Voting rate-limit secret is not configured');
      const now = Math.floor(Date.now() / 1000);
      const hour = Math.floor(now / 3600);
      const address = request.headers.get('CF-Connecting-IP');
      if (!address) return respond({ error: 'Unable to verify request network.' }, 400);
      const bucket = await digest(`${env.RATE_SALT}:${hour}:${address}`);
      const limit = await env.DB.prepare(
        'INSERT INTO request_limits (bucket, hits, expires_at) VALUES (?, 1, ?) ' +
        'ON CONFLICT(bucket) DO UPDATE SET hits = hits + 1 RETURNING hits'
      ).bind(bucket, (hour + 2) * 3600).first();
      if (limit.hits > 60) return respond({ error: 'Too many ballot updates. Please try again in an hour.' }, 429);
      await env.DB.batch([
        env.DB.prepare(
          'INSERT INTO ballots (voter_hash, poll_id, choices) VALUES (?, ?, ?) ' +
          'ON CONFLICT(voter_hash) DO UPDATE SET choices = excluded.choices, updated_at = CURRENT_TIMESTAMP'
        ).bind(voter, poll.id, JSON.stringify(body.choices)),
        env.DB.prepare('DELETE FROM request_limits WHERE expires_at < ?').bind(now),
      ]);
      return respond({ choices: body.choices, saved: true });
    } catch (error) {
      console.error('[voting] Request failed:', error.message);
      return respond({ error: 'Voting is temporarily unavailable. Your changes have not been confirmed; please retry.' }, 503);
    }
  },
};
