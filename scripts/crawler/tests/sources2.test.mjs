import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseKobeSchedule } from '../sources/kobe.mjs';
import { parseKanazawaSchedule } from '../sources/kanazawa.mjs';
import { parseSatsumaSchedule } from '../sources/satsumasendai.mjs';
import { parseSlashDate, parseMonthDayCell } from '../lib/dates.mjs';

const fx = (n) => readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'fixtures', n), 'utf-8');

test('日付：月/日・複数日・曜日チェック・不正な終了日', () => {
  assert.deepEqual(parseSlashDate('10/7-8', '水', 2026), { start: '2026-10-07', end: '2026-10-08', warnings: [] });
  assert.deepEqual(parseSlashDate('5/31-6/1', '日', 2026), { start: '2026-05-31', end: '2026-06-01', warnings: [] });
  const bad = parseSlashDate('9/26-17', '土', 2026);
  assert.equal(bad.start, '2026-09-26');
  assert.equal(bad.end, '2026-09-26');
  assert.equal(bad.warnings.length, 1);
  assert.equal(parseSlashDate('10/22', '水', 2026).warnings.length, 1); // 2026-10-22 は木曜
  assert.equal(parseSlashDate('未定', '', 2026).start, null);
});
test('日付：「4月 16日」', () => {
  assert.equal(parseMonthDayCell('\n 11月        10日   ', 2026).start, '2026-11-10');
  assert.equal(parseMonthDayCell('未定', 2026).start, null);
});
test('神戸：年度見出しから年を補い、年度またぎ（3月）は翌年、括弧の日付の違いを注意に出す', () => {
  const { events, notes } = parseKobeSchedule(fx('kobe.synthetic.html'), { sourceUrl: 'https://example.invalid/' });
  assert.equal(events.length, 3);
  assert.equal(events[0].start, '2026-04-20');
  assert.equal(events[2].start, '2027-03-06');
  assert.equal(events[1].venue, 'テスト運動広場');
  assert.equal(events[0].city, '神戸市');
  assert.ok(notes.some((n) => n.includes('括弧の日付(4/27)')));
});
test('神戸：構造が変わったら黙らない', () => {
  assert.ok(parseKobeSchedule('<html>x</html>', { sourceUrl: 'x' }).notes[0].includes('見つからない'));
});
test('金沢：市/県の区分、区分のない行は非公開、重複行の除去、複数日・不正な終了日', () => {
  const { events, notes } = parseKanazawaSchedule(fx('kanazawa.synthetic.html'), { sourceUrl: 'https://example.invalid/' });
  const by = Object.fromEntries(events.map((e) => [e.name, e]));
  assert.equal(events.length, 5); // 同じ行の重複は1件に
  assert.equal(by['テスト秋のフリータイム'].scope, 'in_prefecture');
  assert.equal(by['テスト秋のフリータイム'].prefecture, '石川県');
  assert.equal(by['テスト秋のフリータイム'].city, '金沢市');
  assert.equal(by['全国テスト大会'].start, '2026-11-08');
  assert.equal(by['全国テスト大会'].end, '2026-11-09');
  assert.equal(by['全国テスト大会'].prefecture, '埼玉県');
  assert.equal(by['ライフサポート中央'].scope, 'not_event');
  assert.equal(by['テスト国スポ'].end, '2026-09-26');
  assert.ok(notes.some((n) => n.includes('終了日の表記が不正')));
  assert.ok(notes.some((n) => n.includes('曜日が合わない')));
});
test('金沢：県の主催で開催地の県が不明なときは県を推測しない', () => {
  const { events } = parseKanazawaSchedule(fx('kanazawa.synthetic.html').replace('埼玉県', '吹田市'), { sourceUrl: 'x' });
  assert.equal(events.find((e) => e.name === '全国テスト大会').prefecture, null);
});
test('薩摩川内：グラウンド・ゴルフ協会の表だけを読み、他団体の「グランドゴルフ」は読まない', () => {
  const { events, notes } = parseSatsumaSchedule(fx('satsuma.synthetic.html'), { sourceUrl: 'https://example.invalid/' });
  assert.equal(events.length, 3);
  assert.deepEqual(events.map((e) => e.name), ['第163回協会大会', '第164回協会大会', '日付未定の事業']);
  assert.equal(events[0].start, '2026-11-10');
  assert.equal(events[1].start, '2027-01-20'); // 年度またぎ
  assert.equal(events[0].venue, '多目的広場');
  assert.equal(events[0].expectedParticipants, 280);
  assert.equal(events[2].start, null);
  assert.ok(notes.length >= 1);
});
test('薩摩川内：見出しが無ければ黙らない', () => {
  assert.ok(parseSatsumaSchedule('<html>令和8年度</html>', { sourceUrl: 'x' }).notes[0].includes('見つからない'));
});
