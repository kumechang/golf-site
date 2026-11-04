import test from 'node:test';
import assert from 'node:assert/strict';
import { buildMunicipalEvents, tidyEventName, tidyVenue, tidyOrganizer, tidyFee, parseDeadline, tidyContact, dateTextHas } from '../../events/municipal-lib.mjs';
import { normalizeAll, classify, summarize } from '../../../src/data/pref-events-core.mjs';

const row = (o = {}) => ({
  prefecture: '埼玉県', municipality_code: '11221', municipality_name: '吉川市', event_name: '第11回グラウンドゴルフ大会参加者募集中', event_kind: 'グラウンドゴルフ専用',
  date_text: '令和8年11月22日(日曜日)', date_basis: '項目', date_start: '2026-11-22', date_end: '2026-11-22', venue: '吉川運動公園', organizer: '', target: '', fee: '無料', deadline: '',
  contact_dept: 'スポーツ推進課', contact_phone: '048-982-6800', evidence: 'グラウンドゴルフ大会', page_url: 'https://example.city.jp/a', extracted_at: '2026-11-04T04:00:00Z', ...o,
});

test('名前から募集の飾りと状態を取り除く', () => {
  assert.equal(tidyEventName('【中止】令和8年度 第33回沼田市民グラウンド・ゴルフ大会').cancelled, true);
  assert.equal(tidyEventName('第11回グラウンドゴルフ大会参加者募集中').name, '第11回グラウンドゴルフ大会');
  assert.equal(tidyEventName('第30回市民グラウンドゴルフ大会の参加者を募集しています').name, '第30回市民グラウンドゴルフ大会');
  assert.equal(tidyEventName('青葉区民グラウンドゴルフ大会 参加者を募集します!').name, '青葉区民グラウンドゴルフ大会');
  assert.equal(tidyEventName('第30回市民グラウンドゴルフ大会の参加者を募集しています[').name.includes('しています'), false);
  assert.equal(tidyEventName('目黒区体育祭 グラウンド・ゴルフ大会 2026年11月7日(土曜日)').name, '目黒区体育祭 グラウンド・ゴルフ大会');
});

test('会場・主催・参加費・申込期限・問い合わせ先を整える', () => {
  assert.equal(tidyVenue('名称 稲美中央公園内「万葉森林浴グラウンド」(所在地: 稲美町)'), '稲美中央公園内「万葉森林浴グラウンド」');
  assert.equal(tidyVenue('http://example.com'), null);
  assert.equal(tidyOrganizer('問い合わせ先)'), null);
  assert.equal(tidyOrganizer('衛藤 頼光選手'), null);
  assert.equal(tidyOrganizer('主催:柏崎市教育委員会 主管:体育協会'), '柏崎市教育委員会');
  assert.equal(tidyFee('1人 500円 申込先(申込期限)'), '1人 500円');
  assert.equal(tidyFee('詳しくは別紙'), null);
  assert.equal(parseDeadline('令和8年10月22日(木曜日)', '2026-11-01'), '2026-10-22');
  assert.equal(parseDeadline('10月6日(火曜日)から10月21日(水曜日)まで', '2026-10-25'), '2026-10-21');
  assert.equal(parseDeadline('12月1日', '2026-11-01'), null, '開催日より後の期限は使わない');
  assert.deepEqual(tidyContact('のお問い合わせ 市民文化部体育スポーツ課', '0942-30-9226'), { dept: '市民文化部体育スポーツ課', phone: '0942-30-9226' });
  assert.deepEqual(tidyContact('は 教育委員会 です。', '086-728-2711'), { dept: null, phone: null }, '課名が不確かなら電話も載せない');
  assert.deepEqual(tidyContact('は、高崎市群馬支所地域振興課', '027-374-5111'), { dept: '高崎市群馬支所地域振興課', phone: '027-374-5111' });
  assert.equal(tidyContact('玉村町役場 町役場のご案内 お問い合わせ', '0270-65-2511').dept, null);
  assert.equal(tidyContact('スポーツ推進課 吉川市上笹塚一丁目58番地1', '048-982-6800').dept, 'スポーツ推進課');
  assert.equal(dateTextHas('6月27 日(土曜日)', '2026-06-27'), true);
});

test('専用の大会を通し、複数競技・グラウンドゴルフの記載がないものは条件で分ける', () => {
  const { events, excluded } = buildMunicipalEvents([
    row(),
    row({ event_name: '市民スポーツ大会', event_kind: '複数競技の大会', evidence: 'ゲートボール グラウンド・ゴルフ', page_url: 'https://example.city.jp/b' }),
    row({ event_name: '大会概要', event_kind: 'その他(ワードの記載あり)', page_url: 'https://example.city.jp/c' }),
    row({ event_name: '令和8年度グラウンドゴルフ場ネーミングライツ募集', page_url: 'https://example.city.jp/d' }),
    row({ page_url: 'http://example.city.jp/e', event_name: '第12回グラウンドゴルフ大会' }),
  ]);
  assert.deepEqual(events.map((e) => e.kind).sort(), ['gg', 'multi']);
  assert.ok(excluded.some((e) => e.reason.includes('名前にない')));
  assert.ok(excluded.some((e) => e.reason.includes('https')));
});

test('日付の文章に開催日の月日がないものは、日付なしにする（投稿日との取り違えを防ぐ）', () => {
  const { events } = buildMunicipalEvents([row({ date_text: '令和8年度', date_start: '2026-10-17', date_end: '2026-10-17', event_name: '第30回千種区学区対抗グラウンド・ゴルフ大会' })]);
  assert.equal(events[0].start, null);
  assert.equal(events[0].date_kind, 'unknown');
});

test('予備日は終了日に含めず、同じ大会の重複はまとめる', () => {
  const { events } = buildMunicipalEvents([
    row({ date_text: '令和8年10月25日(日曜日) 予備日 10月26日', date_start: '2026-10-25', date_end: '2026-10-26', page_url: 'https://example.city.jp/f' }),
    row({ page_url: 'https://example.city.jp/g', fee: '', venue: '' }),
  ]);
  assert.equal(events.length, 2, '日付が違えば別の大会');
  assert.equal(events.find((e) => e.start === '2026-10-25').end, '2026-10-25');
  const dup = buildMunicipalEvents([row({ page_url: 'https://example.city.jp/h' }), row({ page_url: 'https://example.city.jp/i', event_name: '第11回グラウンドゴルフ大会を開催しました', fee: '' })]);
  assert.equal(dup.events.length, 1);
});

test('日付のあるものと同じ大会の、日付なしは除く', () => {
  const { events } = buildMunicipalEvents([row(), row({ date_text: '', date_start: '', date_end: '', page_url: 'https://example.city.jp/j' })]);
  assert.equal(events.length, 1);
});

const muni = (o = {}) => ({
  id: 'M-0a1b2c3d', name: '第11回グラウンドゴルフ大会', kind: 'gg', prefecture: '埼玉県', municipality: '吉川市', start: '2026-11-22', end: '2026-11-22', date_kind: 'exact',
  venue: '吉川運動公園', organizer: null, target: null, fee: '無料', deadline: null, contact_dept: null, contact_phone: null, cancelled: false, postponed: false,
  source_url: 'https://example.city.jp/a', extracted_at: '2026-11-04T04:00:00Z', ...o,
});

test('県ごとの分類: 今後・日程不明・終了（直近12か月）', () => {
  const events = normalizeAll({ events: [] }, { events: [
    muni(), muni({ id: 'M-0a1b2c3e', start: '2026-05-01', end: '2026-05-01', source_url: 'https://example.city.jp/b' }),
    muni({ id: 'M-0a1b2c3f', start: '2025-06-01', end: '2025-06-01', source_url: 'https://example.city.jp/c' }),
    muni({ id: 'M-0a1b2c30', start: null, end: null, date_kind: 'unknown', source_url: 'https://example.city.jp/d' }),
  ] });
  const c = classify(events, '2026-11-04');
  assert.equal(c.up.length, 1);
  assert.equal(c.past.length, 1, '12か月より前の終了分は載せない');
  assert.equal(c.undated.length, 1);
});

test('件数が少ない県は、ページは作るが検索には載せない', () => {
  const events = normalizeAll({ events: [] }, { events: [muni(), muni({ id: 'M-0a1b2c3e', source_url: 'https://example.city.jp/b' })] });
  const s = summarize(events, '2026-11-04').get('埼玉県');
  assert.equal(s.hasPage, true);
  assert.equal(s.indexable, false);
  assert.equal(summarize(events, '2026-11-04').get('青森県').hasPage, false);
});

test('壊れたデータはビルドを止める', () => {
  assert.throws(() => normalizeAll({ events: [] }, { events: [muni({ source_url: 'http://example.city.jp/a' })] }), /https/);
  assert.throws(() => normalizeAll({ events: [] }, { events: [muni({ prefecture: 'ほげ県' })] }), /都道府県/);
  assert.throws(() => normalizeAll({ events: [] }, { events: [muni({ contact_phone: '03-12' })] }), /電話/);
});
