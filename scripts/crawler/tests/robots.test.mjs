import test from 'node:test';
import assert from 'node:assert/strict';
import { parseRobots, isAllowed, rulesFromResponse } from '../lib/robots.mjs';

const TOKEN = 'GroundGolfNaviBot';

test('* グループの Disallow と Allow（最長一致）', () => {
  const r = parseRobots('User-agent: *\nDisallow: /app/\nAllow: /app/download/\n', TOKEN);
  assert.equal(isAllowed(r, '/app/x'), false);
  assert.equal(isAllowed(r, '/app/download/a.pdf'), true);
  assert.equal(isAllowed(r, '/other'), true);
});
test('香川県のような /taikai/ 禁止と *.pdf$ とクエリ禁止', () => {
  const r = parseRobots('User-agent: *\nDisallow: /taikai/\nDisallow: /*?\nDisallow: /*.pdf$\n', TOKEN);
  assert.equal(isAllowed(r, '/taikai/2026/'), false);
  assert.equal(isAllowed(r, '/games/'), true);
  assert.equal(isAllowed(r, '/games/?p=2'), false);
  assert.equal(isAllowed(r, '/pdf/a.pdf'), false);
  assert.equal(isAllowed(r, '/pdf/a.pdf.html'), true);
});
test('自分のUAのグループがあれば * より優先', () => {
  const r = parseRobots('User-agent: *\nDisallow:\n\nUser-agent: GroundGolfNaviBot\nDisallow: /private/\n', TOKEN);
  assert.equal(isAllowed(r, '/private/a'), false);
  assert.equal(isAllowed(r, '/open'), true);
});
test('他のボットだけを禁止していても自分は取得できる', () => {
  const r = parseRobots('User-agent: GPTBot\nDisallow: /\n\nUser-agent: *\nDisallow: /wp-admin/\n', TOKEN);
  assert.equal(isAllowed(r, '/games/'), true);
});
test('Crawl-delay を読む', () => {
  assert.equal(parseRobots('User-agent: *\nCrawl-Delay: 5\n', TOKEN).crawlDelay, 5);
});
test('取得結果の扱い：404は制限なし、403・5xxは取得しない、HTMLが返ったら制限なし', () => {
  assert.equal(rulesFromResponse(404, '', TOKEN).blockAll, false);
  assert.equal(rulesFromResponse(403, '', TOKEN).blockAll, true);
  assert.equal(rulesFromResponse(503, '', TOKEN).blockAll, true);
  assert.equal(rulesFromResponse(200, '<html>not found</html>', TOKEN).blockAll, false);
});
