import test from 'node:test';
import assert from 'node:assert/strict';
import { readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import { dirname, join } from 'node:path';
import { parseSagaSchedule } from '../sources/saga.mjs';
import { statusFor, classifyType, splitPlace, eventKey } from '../lib/event.mjs';

const html = readFileSync(join(dirname(fileURLToPath(import.meta.url)), 'fixtures', 'saga-schedule.synthetic.html'), 'utf-8');
const { events, notes, fiscalYear } = parseSagaSchedule(html, { sourceUrl: 'https://example.invalid/schedule.html', today: '2026-10-14' });

test('年度と行数', () => {
  assert.equal(fiscalYear, 2026);
  assert.equal(events.length, 6);
});
test('行クラスから scope を決める', () => {
  const byName = Object.fromEntries(events.map((e) => [e.name, e]));
  assert.equal(byName['令和8年度テスト協会総会'].scope, 'not_event');
  assert.equal(byName['テスト県レディス交歓大会'].scope, 'in_prefecture');
  assert.equal(byName['第39回テスト全国交歓大会'].scope, 'out_of_prefecture');
});
test('<br>入りの複数日を読み、開催地から県と市を分ける', () => {
  const e = events.find((x) => x.name === 'テスト健康福祉祭');
  assert.equal(e.start, '2026-11-08');
  assert.equal(e.end, '2026-11-09');
  assert.equal(e.prefecture, '埼玉県');
  assert.equal(e.city, '加須市');
  assert.equal(e.venue, 'テスト公園');
});
test('県名がない開催地は協会の県を補う', () => {
  const e = events.find((x) => x.name === 'テスト県レディス交歓大会');
  assert.equal(e.prefecture, '佐賀県');
  assert.equal(e.city, '佐賀市');
  assert.equal(e.venue, null);
});
test('日が未定の行は日程を埋めず、曜日不一致は注意に出す', () => {
  const tbd = events.find((x) => x.name === 'テスト協議会');
  assert.equal(tbd.start, null);
  assert.equal(statusFor(tbd, '2026-10-14'), '日程未定');
  assert.ok(notes.some((n) => n.includes('曜日が合わない')));
});
test('状態：今日以降は開催予定、過ぎたら開催済み', () => {
  assert.equal(statusFor({ start: '2026-10-14', end: '2026-10-14' }, '2026-10-14'), '開催予定');
  assert.equal(statusFor({ start: '2026-10-07', end: '2026-10-08' }, '2026-10-14'), '開催済み');
});
test('種別と重複キー', () => {
  assert.equal(classifyType('九州地区2級・3級普及指導員研修交歓大会'), '大会');
  assert.equal(classifyType('普及指導員研修会（フォローアップ研修）'), '研修・講習');
  assert.equal(classifyType('令和8年度協会総会'), '会議・総会');
  assert.equal(splitPlace('鹿児島県薩摩川内市', '佐賀県').prefecture, '鹿児島県');
  assert.equal(eventKey({ prefecture: '佐賀県', start: '2026-11-08', name: '第35回　佐賀県グラウンド・ゴルフ交歓大会' }), eventKey({ prefecture: '佐賀県', start: '2026-11-08', name: '第35回佐賀県グラウンドゴルフ交歓大会' }));
});
test('構造が変わったら黙って0件にせず注意を出す', () => {
  const r = parseSagaSchedule('<html><body><h3>2026年度大会スケジュール</h3><p>no table</p></body></html>', { sourceUrl: 'x', today: '2026-10-14' });
  assert.equal(r.events.length, 0);
  assert.ok(r.notes[0].includes('見つからない'));
});
