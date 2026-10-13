import test from 'node:test';
import assert from 'node:assert/strict';
import { parseScheduleDate, parseSingleDate, normalize, yearInFiscal } from '../lib/dates.mjs';

const ctx = { fiscalYear: 2026 };

test('単日（曜日・祝日つき）', () => {
  assert.deepEqual(parseScheduleDate('5月6日（水・祝）', ctx), { start: '2026-05-06', end: '2026-05-06', warnings: [] });
});
test('同月の2日間（<br>由来の改行・全角数字）', () => {
  assert.deepEqual(parseScheduleDate('９月２６日（土）・27日（日）', ctx), { start: '2026-09-26', end: '2026-09-27', warnings: [] });
  assert.deepEqual(parseScheduleDate('10月7日（水）・ 8日（木）', ctx), { start: '2026-10-07', end: '2026-10-08', warnings: [] });
});
test('月またぎ', () => {
  assert.deepEqual(parseScheduleDate('5月31日(日)・6月1日(月)', ctx), { start: '2026-05-31', end: '2026-06-01', warnings: [] });
});
test('年度をまたぐ（1〜3月は翌年）', () => {
  assert.equal(parseScheduleDate('1月14日（木）', ctx).start, '2027-01-14');
  assert.equal(yearInFiscal(2026, 3), 2027);
  assert.equal(yearInFiscal(2026, 4), 2026);
});
test('日が未定の表記は推測しない', () => {
  const r = parseScheduleDate('2月未定', ctx);
  assert.equal(r.start, null);
  assert.match(r.reason, /未定/);
});
test('曜日が合わないときは警告を出す（日付は採用）', () => {
  const r = parseScheduleDate('10月17日（金）', ctx);
  assert.equal(r.start, '2026-10-17');
  assert.equal(r.warnings.length, 1);
});
test('存在しない日付は null', () => {
  assert.equal(parseScheduleDate('2月30日', ctx).start, null);
});
test('令和・西暦の単日', () => {
  assert.equal(parseSingleDate('R8/6/10'), '2026-06-10');
  assert.equal(parseSingleDate('R08.10.15'), '2026-10-15');
  assert.equal(parseSingleDate('令和8年6月10日'), '2026-06-10');
  assert.equal(parseSingleDate('2026年10月7日'), '2026-10-07');
  assert.equal(parseSingleDate('日付なし'), null);
});
test('normalize は全角を半角に', () => {
  assert.equal(normalize('１０月（水）'), '10月(水)');
});
