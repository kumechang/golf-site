import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseKagawaList, parseKagawaDetail } from '../sources/kagawa.mjs';
import { parseYamanashiList } from '../sources/yamanashi.mjs';
import { parseSaitamaInfo } from '../sources/saitama.mjs';
import { resolveDeadline } from '../lib/dates.mjs';
import { statusFor } from '../lib/event.mjs';

const fx = (n) => readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'fixtures', n), 'utf-8');

test('香川：開催要項の一覧だけを読み、大会結果は読まない', () => {
  const { events, notes } = parseKagawaList(fx('kagawa-games.synthetic.html'), { sourceUrl: 'https://example.invalid/games/' });
  assert.equal(events.length, 2);
  assert.equal(events[0].name, 'テスト県協会 35周年記念大会');
  assert.equal(events[0].start, '2026-10-15');
  assert.equal(events[1].name, 'テスト交歓大会');
  assert.equal(events[1].start, '2026-12-02');
  assert.ok(!events.some((e) => e.name === '過去の大会'));
  assert.deepEqual(notes, []);
});
test('香川：案内ページから場所・市・申込締切を補い、日付の食い違いを検出する', () => {
  const ev = { name: 'テスト県協会 35周年記念大会', start: '2026-10-15' };
  const { fields, notes } = parseKagawaDetail(fx('kagawa-info.synthetic.html'), ev);
  assert.equal(fields.venue, '高松市立テスト運動公園');
  assert.equal(fields.city, '高松市');
  assert.equal(fields.applicationDeadline, '2026-09-24');
  assert.deepEqual(notes, []);
  const mismatch = parseKagawaDetail(fx('kagawa-info.synthetic.html'), { name: 'X', start: '2026-10-16' });
  assert.equal(mismatch.notes.length, 1);
});
test('香川：見出しが無ければ0件で黙らず注意を出す', () => {
  const r = parseKagawaList('<html><h2>開催予定</h2></html>', { sourceUrl: 'x' });
  assert.equal(r.events.length, 0);
  assert.ok(r.notes[0].includes('見つからない'));
});
test('申込締切：開催日より後の年は採らない', () => {
  assert.equal(resolveDeadline('9月24日', '2026-10-15'), '2026-09-24');
  assert.equal(resolveDeadline('12月1日', '2026-01-20'), '2025-12-01');
  assert.equal(resolveDeadline('なし', '2026-10-15'), null);
});
test('山梨：一覧から日付・名前・URLを読み、日付のない投稿は注意に出す', () => {
  const { events, notes } = parseYamanashiList(fx('yamanashi-tournament.synthetic.html'));
  assert.equal(events.length, 2);
  assert.equal(events[0].name, 'テスト山梨ねんりんピック2026');
  assert.equal(events[0].start, '2026-09-06');
  assert.equal(events[1].start, '2026-12-06');
  assert.equal(statusFor(events[0], '2026-10-14'), '開催済み');
  assert.equal(statusFor(events[1], '2026-10-14'), '開催予定');
  assert.equal(notes.length, 1);
});
test('山梨：構造が変わったら0件で黙らない', () => {
  const r = parseYamanashiList('<html><body>nothing</body></html>');
  assert.equal(r.events.length, 0);
  assert.ok(r.notes[0].includes('1件も'));
});
test('埼玉：開催速報が空なら「掲載なし」、掲載があれば人が気づける注意を出す', () => {
  const empty = parseSaitamaInfo(fx('saitama-info-empty.synthetic.html'));
  assert.equal(empty.events.length, 0);
  assert.match(empty.notes[0], /掲載なし/);
  const filled = parseSaitamaInfo(fx('saitama-info-filled.synthetic.html'));
  assert.equal(filled.events.length, 0);
  assert.match(filled.notes[0], /形式未対応/);
  const broken = parseSaitamaInfo('<html>x</html>');
  assert.match(broken.notes[0], /見つからない/);
});
