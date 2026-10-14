import test from 'node:test';
import assert from 'node:assert/strict';
import { createClient, USER_AGENT } from '../lib/http.mjs';

// 実際のネットワークは使わず、fetch を差し替えて「礼儀」の挙動を確かめる。
function fakeFetch(routes) {
  const calls = [];
  const impl = async (url, init) => {
    calls.push({ url, ua: init?.headers?.['User-Agent'] });
    const r = routes[new URL(url).pathname] ?? { status: 404, body: '' };
    return new Response(r.body ?? '', { status: r.status, headers: r.headers ?? { 'content-type': 'text/html; charset=utf-8' } });
  };
  return { impl, calls };
}
const client = (routes, opts = {}) => {
  const f = fakeFetch(routes);
  return { c: createClient({ minDelayMs: 0, fetchImpl: f.impl, ...opts }), calls: f.calls };
};

test('識別できるUAを名乗り、取得の前に robots.txt を確認する', async () => {
  const { c, calls } = client({ '/robots.txt': { status: 404 }, '/a': { status: 200, body: 'ok' } });
  const r = await c.get('https://example.invalid/a');
  assert.equal(r.ok, true);
  assert.equal(calls[0].url, 'https://example.invalid/robots.txt');
  assert.ok(calls.every((x) => x.ua === USER_AGENT));
  assert.match(USER_AGENT, /ground-golf-navi\.com\/about\//);
});

test('robots.txt で禁止されたページは取得しない（リクエストも送らない）', async () => {
  const { c, calls } = client({ '/robots.txt': { status: 200, body: 'User-agent: *\nDisallow: /pdf/\n', headers: { 'content-type': 'text/plain' } }, '/pdf/x': { status: 200, body: 'secret' } });
  const r = await c.get('https://example.invalid/pdf/x');
  assert.equal(r.ok, false);
  assert.match(r.reason, /robots/);
  assert.ok(!calls.some((x) => x.url.endsWith('/pdf/x')));
});

test('robots.txt が 403 のときは、そのサイトを取得しない', async () => {
  const { c, calls } = client({ '/robots.txt': { status: 403 }, '/a': { status: 200, body: 'ok' } });
  const r = await c.get('https://example.invalid/a');
  assert.equal(r.ok, false);
  assert.ok(!calls.some((x) => x.url.endsWith('/a')));
});

test('リダイレクト先も robots.txt を確認し、禁止なら辿らない', async () => {
  const { c, calls } = client({
    '/robots.txt': { status: 200, body: 'User-agent: *\nDisallow: /private/\n', headers: { 'content-type': 'text/plain' } },
    '/go': { status: 302, headers: { location: '/private/page' } },
    '/private/page': { status: 200, body: 'x' },
  });
  const r = await c.get('https://example.invalid/go');
  assert.equal(r.ok, false);
  assert.ok(!calls.some((x) => x.url.endsWith('/private/page')));
});

test('1回の実行で取得するページ数に上限がある', async () => {
  const { c } = client({ '/robots.txt': { status: 404 }, '/1': { status: 200, body: 'a' }, '/2': { status: 200, body: 'b' } }, { maxPages: 1 });
  assert.equal((await c.get('https://example.invalid/1')).ok, true);
  const second = await c.get('https://example.invalid/2');
  assert.equal(second.ok, false);
  assert.match(second.reason, /上限/);
});

test('同じホストへのアクセスは、決めた間隔を空ける', async () => {
  const { c } = client({ '/robots.txt': { status: 404 }, '/1': { status: 200, body: 'a' }, '/2': { status: 200, body: 'b' } }, { minDelayMs: 150 });
  const t0 = Date.now();
  await c.get('https://example.invalid/1');
  await c.get('https://example.invalid/2');
  // robots.txt + 2ページ = 3リクエスト → 少なくとも2回分の間隔
  assert.ok(Date.now() - t0 >= 280, `間隔が短すぎる: ${Date.now() - t0}ms`);
});
