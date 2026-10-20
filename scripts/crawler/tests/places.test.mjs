import test from 'node:test';
import assert from 'node:assert/strict';
import { parseCsv, facilityName, classify, buildPlaces } from '../../places/lib.mjs';

const row = (o) => ({ prefecture: '埼玉県', municipality_code: '11100', municipality_name: '川口市', page_kind: 'facility', page_title: '', page_url: 'https://example.invalid/a', matched_text: 'グラウンドゴルフなどに利用できます', match_count: '1', in_title: '', found_via: 'facility', via_link_text: '', surveyed_at: '2026-10-18T00:00:00Z', ...o });

test('CSV：BOM・引用符内のカンマ・改行・"" を読める', () => {
  const rows = parseCsv('﻿a,b\n"x,1","y\n2"\n"q""r",z\n');
  assert.deepEqual(rows, [{ a: 'x,1', b: 'y\n2' }, { a: 'q"r', b: 'z' }]);
});

test('施設名：サイト名や「施設案内」を除いて、施設の名前を取り出す', () => {
  assert.equal(facilityName(row({ page_title: '岩舟総合運動公園 - 栃木市ホームページ', municipality_name: '栃木市' })), '岩舟総合運動公園');
  assert.equal(facilityName(row({ page_title: '浄化センター運動広場 施設案内 | 稲沢市', municipality_name: '稲沢市' })), '浄化センター運動広場');
  assert.equal(facilityName(row({ page_title: '津島市公式ホームページ', via_link_text: '東公園グラウンド', municipality_name: '津島市' })), '東公園グラウンド');
});

test('施設名：一覧・料金・お知らせ・活動名だけのページは施設名にしない', () => {
  assert.equal(facilityName(row({ page_title: '体育施設一覧 - 川口市ホームページ' })), null);
  assert.equal(facilityName(row({ page_title: 'スポーツ施設使用料のお知らせ' })), null);
  assert.equal(facilityName(row({ page_title: 'グラウンド・ゴルフ | 厚木市', municipality_name: '厚木市' })), null);
});

test('分類：イベント・大会・本文に記載なしは除外、一覧は listing、施設名が取れれば facility', () => {
  assert.equal(classify(row({ found_via: 'event', page_title: 'グラウンド・ゴルフ体験コーナー' })).kind, 'exclude');
  assert.equal(classify(row({ page_title: '市民グラウンド・ゴルフ大会の参加者募集' })).kind, 'exclude');
  assert.equal(classify(row({ match_count: '0', page_title: '岩舟総合運動公園' })).kind, 'exclude');
  assert.equal(classify(row({ found_via: 'listing', page_title: '体育施設 - 川口市' })).kind, 'listing');
  assert.deepEqual(classify(row({ page_title: '芝生広場 | 川口市' })), { kind: 'facility', name: '芝生広場' });
});

test('同じ市区町村の同じ施設は1件にまとめ、抜き出した文は出力に含めない', () => {
  const { places } = buildPlaces([
    row({ page_title: '岩舟総合運動公園 | 川口市', matched_text: 'ひみつの文章', page_url: 'https://example.invalid/1' }),
    row({ page_title: '岩舟総合運動公園 | 川口市', matched_text: 'ひみつの文章', page_url: 'https://example.invalid/2', match_count: '4' }),
  ]);
  assert.equal(places.length, 1);
  assert.equal(places[0].source_url, 'https://example.invalid/2');
  assert.ok(!JSON.stringify(places).includes('ひみつの文章'));
});

test('確認用の印：用語の説明・使えない趣旨・一般的な名前', () => {
  const { places } = buildPlaces([
    row({ page_title: '岩木川市民ゴルフ場', matched_text: 'ニュースポーツとはスナッグゴルフ、グラウンドゴルフ等をいう。' }),
    row({ page_title: '阪内川スポーツ公園', matched_text: '多目的グラウンドでグラウンドゴルフは禁止です', page_url: 'https://example.invalid/x' }),
    row({ page_title: '多目的広場 | 川口市', page_url: 'https://example.invalid/y' }),
  ]);
  const flags = places.flatMap((p) => p.flags).join('|');
  assert.match(flags, /用語の説明/);
  assert.match(flags, /使えない趣旨/);
  assert.match(flags, /名前が一般的/);
});

import { buildDetails } from '../../places/lib.mjs';
const drow = (o) => ({ prefecture: '静岡県', municipality_code: '22206', municipality_name: '三島市', facility_name: '南田町広場', address: '南田町4-40', phone: '055-971-0001', inquiry_phone: '055-971-9999', page_url: 'https://example.invalid/a', extracted_at: '2026-10-18T08:00:00Z', matched_text: 'ひみつの文章', ...o });

test('詳細：市区町村名のない住所は市区町村名を補い、抜き出した文は出力に含めない', () => {
  const { details } = buildDetails([drow({})]);
  assert.equal(details.length, 1);
  assert.equal(details[0].address, '三島市南田町4-40');
  assert.equal(details[0].phone, '055-971-0001');
  assert.equal(details[0].phone_is_contact, false);
  assert.ok(!JSON.stringify(details).includes('ひみつの文章'));
});

test('詳細：電話が問い合わせ先と同じなら印を付ける。形式が不正な電話は載せない', () => {
  const same = buildDetails([drow({ phone: '055-971-9999' })]).details[0];
  assert.equal(same.phone_is_contact, true);
  assert.equal(buildDetails([drow({ phone: '電話は課まで' })]).details[0].phone, null);
});

test('詳細：http・別の市区町村の住所・名前になっていないものは除外', () => {
  const rows = [
    drow({ page_url: 'http://example.invalid/h', facility_name: 'A広場' }),
    drow({ municipality_name: '神川町', facility_name: '川本グラウンド', address: '深谷市本田501番地先', page_url: 'https://example.invalid/b' }),
    drow({ municipality_name: '深谷市', facility_name: 'B広場', address: '深谷市本田1-1', page_url: 'https://example.invalid/c' }),
    drow({ facility_name: '施設', page_url: 'https://example.invalid/d' }),
    drow({ facility_name: '申し込み先', page_url: 'https://example.invalid/e' }),
  ];
  const { details, excluded } = buildDetails(rows);
  assert.deepEqual(details.map((d) => d.name), ['B広場']);
  assert.equal(excluded.length, 4);
});

test('詳細：同じ市区町村・同じ名前で住所や電話が食い違うものは載せず、同じ内容の重複は1件にする', () => {
  const dup = buildDetails([drow({}), drow({ page_url: 'https://example.invalid/2' })]);
  assert.equal(dup.details.length, 1);
  const conflict = buildDetails([drow({}), drow({ address: '別の町1-1', page_url: 'https://example.invalid/2' })]);
  assert.equal(conflict.details.length, 0);
  assert.match(conflict.excluded[0].reason, /食い違う/);
});
