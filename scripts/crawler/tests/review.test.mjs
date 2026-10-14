import test from 'node:test';
import assert from 'node:assert/strict';
import { similarNames, coreName, eventId, annotate, pendingList, staleDecisions, buildApproved, mergeApproval, eventsWithoutLevel, findDuplicateCandidates, validateDecision, renderReview } from '../lib/review.mjs';

const row = (o) => ({ source_id: 'src-a', event_name: 'テスト大会', start_date: '2026-11-08', end_date: '2026-11-08', prefecture: '佐賀県', city: '佐賀市', venue: '会場', listed_by: '協会', event_type: '大会', scope: 'in_prefecture', event_status: '開催予定', official_source: true, publishable: true, source_url: 'https://example.invalid/a', last_checked_at: '2026-10-14T00:00:00Z', application_deadline: null, warnings: [], key: `佐賀県|2026-11-08|${o.event_name || 'テスト大会'}`, ...o });

test('名前の類似：表記違いの同じ大会は似ている、同じ日の別の大会は似ていない', () => {
  assert.equal(similarNames('第20回全国グラウンド・ゴルフレディス交歓大会', '全国レディス大会'), true);
  assert.equal(similarNames('第38回全国健康福祉祭彩の国さいたま大会(ねんりんピック2026）', '全国ねんりんピック'), true);
  assert.equal(similarNames('2026あおもり国民スポーツ大会グラウンド・ゴルフ競技', '国民スポーツ青森大会'), true);
  assert.equal(similarNames('第35回佐賀県グラウンド・ゴルフ交歓大会', '金沢市優良プレーヤー及び普及指導員大会'), false);
  assert.equal(similarNames('第7回神戸市ＧＧペア大会', '第10回神戸市普及指導員有資格者研修大会'), false);
  assert.equal(coreName('第20回全国グラウンド・ゴルフレディス交歓大会'), '全国レディス');
});
test('id は安定していて、日程や名前が変わると変わる', () => {
  const a = row({});
  assert.equal(eventId(a), eventId({ ...a }));
  assert.match(eventId(a), /^E-[0-9a-f]{8}$/);
  assert.notEqual(eventId(a), eventId({ ...a, key: '佐賀県|2026-11-09|テスト大会' }));
  assert.notEqual(eventId(a), eventId({ ...a, source_id: 'src-b' }));
});
test('重複の疑い：別の情報源で日程が同じものだけを組にし、強弱をつける', () => {
  const rows = [
    { ...row({ event_name: '第20回全国グラウンド・ゴルフレディス交歓大会' }), id: 'E-00000001' },
    { ...row({ event_name: '全国レディス大会', source_id: 'src-b' }), id: 'E-00000002' },
    { ...row({ event_name: '別の大会', source_id: 'src-b' }), id: 'E-00000003' },
    { ...row({ event_name: '同じ情報源の同じ日', source_id: 'src-a' }), id: 'E-00000004' },
  ];
  const pairs = findDuplicateCandidates(rows);
  assert.equal(pairs.find((p) => p.a === 'E-00000001' && p.b === 'E-00000002').strength, 'strong');
  assert.equal(pairs.find((p) => p.a === 'E-00000001' && p.b === 'E-00000003').strength, 'weak');
  assert.ok(!pairs.some((p) => p.a === 'E-00000001' && p.b === 'E-00000004')); // 同じ情報源どうしは組にしない
});
test('注意の印：県不明・非公式・申込締切・会場なし・読み取りの注意', () => {
  const [r] = annotate([row({ prefecture: null, official_source: false, venue: null, application_deadline: '2026-09-01', warnings: ['曜日が合わない'] })], { decisions: [] }, '2026-10-14');
  for (const f of ['開催地の県が不明', '非公式の情報源', '申込締切を過ぎている', '会場が未記載', '曜日が合わない']) assert.ok(r.flags.includes(f), f);
});
test('注意の印：参加対象が限られそうな大会（指導員・優良プレーヤー・研修など）', () => {
  const names = ['金沢市優良プレーヤー及び普及指導員大会', '３級指導員養成講習会', 'ねんりんピック選考会', '普通の交歓大会'];
  const ann = annotate([row({ event_name: names[0] }), row({ event_name: names[1], event_type: '研修・講習' }), row({ event_name: names[2] }), row({ event_name: names[3] })], { decisions: [] }, '2026-10-14');
  const limited = (r) => r.flags.some((f) => f.includes('参加対象が限られる'));
  assert.deepEqual(ann.map(limited), [true, true, true, false]);
});
test('注意の印：全国・ブロック大会は代表選手の大会の可能性', () => {
  const ann = annotate([row({ event_name: '第20回全国グラウンド・ゴルフレディス交歓大会' }), row({ event_name: '第39回九州地区グラウンド・ゴルフ交歓沖縄県大会' }), row({ event_name: '第30回神戸カップＧＧ交歓大会' })], { decisions: [] }, '2026-10-14');
  const rep = (r) => r.flags.some((f) => f.includes('代表選手'));
  assert.deepEqual(ann.map(rep), [true, true, false]);
});
test('判断：承認済みだけが公開一覧に入る。却下・開催済み・未承認は入らない。重複は統合先にまとめる', () => {
  const rows = [row({ event_name: 'A大会' }), row({ event_name: 'B大会' }), row({ event_name: 'C大会' }), row({ event_name: 'D大会', source_id: 'src-b', source_url: 'https://example.invalid/b' }), row({ event_name: '終わった大会', start_date: '2026-10-01', end_date: '2026-10-01', key: 'x', event_status: '開催済み', publishable: false })];
  const ids = rows.map(eventId);
  const decisions = { decisions: [
    { id: ids[0], status: 'approved', level: 'local', note: '確認済み', public_note: '補足です' },
    { id: ids[1], status: 'rejected' },
    { id: ids[3], status: 'duplicate_of', duplicate_of: ids[0] },
    { id: ids[4], status: 'approved', level: 'local' },
  ] };
  const ann = annotate(rows, decisions, '2026-10-14');
  assert.deepEqual(pendingList(ann).map((r) => r.event_name), ['C大会']);
  const out = buildApproved(ann, '2026-10-14');
  assert.deepEqual(out.map((e) => e.name), ['A大会']);
  assert.deepEqual(out[0].also_listed_in, ['https://example.invalid/b']);
  assert.equal(out[0].note, '確認済み');
  assert.equal(out[0].level, 'local');
  assert.equal(out[0].public_note, '補足です');
  assert.ok(!('organizer' in out[0]), '主催者は確認できたときだけ入る');
});
test('承認済みでも開催日を過ぎたら一覧から外れる', () => {
  const r = row({ event_name: 'A大会' });
  const ann = annotate([r], { decisions: [{ id: eventId(r), status: 'approved', level: 'local' }] }, '2026-11-09');
  assert.equal(buildApproved(ann, '2026-11-09').length, 0);
});
test('日程が変わると判断が外れて再確認になり、古い判断は「見つからない」に出る', () => {
  const before = row({ event_name: 'A大会' });
  const decisions = { decisions: [{ id: eventId(before), status: 'approved', decided_at: '2026-10-01' }] };
  const changed = row({ event_name: 'A大会', start_date: '2026-11-15', end_date: '2026-11-15', key: '佐賀県|2026-11-15|A大会' });
  const ann = annotate([changed], decisions, '2026-10-14');
  assert.equal(pendingList(ann).length, 1);
  assert.equal(staleDecisions(ann, decisions).length, 1);
});
test('判断の検証', () => {
  assert.equal(validateDecision({ id: 'E-0123abcd', status: 'approved', level: 'local' }), null);
  assert.equal(validateDecision({ id: 'E-0123abcd', status: 'approved', level: 'national' }), null);
  assert.ok(validateDecision({ id: 'E-0123abcd', status: 'approved' }), '承認には level が必須');
  assert.ok(validateDecision({ id: 'E-0123abcd', status: 'approved', level: 'world' }));
  assert.equal(validateDecision({ id: 'E-0123abcd', status: 'rejected' }), null);
  assert.ok(validateDecision({ id: 'x', status: 'approved', level: 'local' }));
  assert.ok(validateDecision({ id: 'E-0123abcd', status: 'maybe' }));
  assert.ok(validateDecision({ id: 'E-0123abcd', status: 'duplicate_of' }));
});
test('レポートに要判断・重複・承認済みが出る', () => {
  const rows = [row({ event_name: 'A大会' }), row({ event_name: 'B大会', source_id: 'src-b' })];
  const decisions = { decisions: [{ id: eventId(rows[0]), status: 'approved', note: 'OK' }] };
  const md = renderReview({ annotated: annotate(rows, decisions, '2026-10-14'), decisionsFile: decisions, today: '2026-10-14', generatedAt: 'now' });
  assert.match(md, /公開候補: 2件（要判断 1 \/ 承認済み 1/);
  assert.match(md, /## 要判断[\s\S]*B大会/);
  assert.match(md, /## 承認済み[\s\S]*A大会[\s\S]*OK/);
  assert.match(md, /日程だけ同じ/);
});

test('承認の再実行で、前の区分・主催者・補足は消えず、新しい指定が優先される', () => {
  const prev = { id: 'E-0123abcd', status: 'approved', level: 'local', public_note: '補足', organizer: '主催者A' };
  const again = mergeApproval(prev, { id: 'E-0123abcd', status: 'approved', note: 'メモ' });
  assert.equal(again.level, 'local');
  assert.equal(again.public_note, '補足');
  assert.equal(again.organizer, '主催者A');
  const changed = mergeApproval(prev, { id: 'E-0123abcd', status: 'approved', level: 'national', public_note: '新しい補足' });
  assert.equal(changed.level, 'national');
  assert.equal(changed.public_note, '新しい補足');
  // 却下などでは引き継がない
  assert.equal(mergeApproval(prev, { id: 'E-0123abcd', status: 'rejected' }).level, undefined);
});

test('区分が未設定の承認は、公開用一覧の作成を止める材料になる', () => {
  assert.deepEqual(eventsWithoutLevel([{ id: 'E-1', level: 'local' }, { id: 'E-2' }, { id: 'E-3', level: 'world' }]), ['E-2', 'E-3']);
  assert.deepEqual(eventsWithoutLevel([{ id: 'E-1', level: 'block' }]), []);
});
