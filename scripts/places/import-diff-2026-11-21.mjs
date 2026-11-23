// 使い方: node scripts/places/import-diff-2026-11-21.mjs
// 2026-11-21（土）の自治体サイト調査の「差分」CSV（data/places/pdf-ai/2026-11-21-diff.csv。新しい711行・無くなった311行）の取り込み。
// 差分CSVは、載せるのに必要な項目（会場・主催・費用・ページの種類）が無いので、行を1つずつ人が見て決めた。何度実行しても同じ結果になる。
//  ・載せる: HTMLの案内ページがある施設（住所は施設のページに書かれたものだけ）、日付が確かな直近のイベント
//  ・載せなくなる: 掲載中のページを実際に開いて確かめ、404になったもの／グラウンド・ゴルフの記載が無くなったもの
//    （「無くなった」は取得側で見つからなくなっただけのこともあるので、掲載中のURLを開いて確かめてから）
//  ・載せない: PDF（AIが読んだCSVで取り込む）、団体、堺市の公園一覧（公園ごとの記載ではない）、過去の古い大会、日が確定できないもの
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from './lib.mjs';
import { coreKey, hash8 } from '../events/municipal-lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const NOW = process.env.IMPORT_NOW ?? '2026-11-21T00:00:00Z';
const rows = parseCsv(readFileSync(join(root, 'data/places/pdf-ai/2026-11-21-diff.csv'), 'utf8'));
const rd = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const places = rd('data/places/places.json'), details = rd('data/places/details.json'), events = rd('data/events/municipal.json');
const placeOv = rd('data/places/overrides.json'), eventOv = rd('data/events/municipal-overrides.json');
const prefOf = new Map(places.places.map((p) => [p.municipality_code.slice(0, 2), p.prefecture]));
const row = (url) => rows.find((r) => r['URL'] === url) ?? (console.error('CSVに無いURL: ' + url), process.exit(1));

// ── 載せなくするもの（掲載中のページを 2026-11-23 に開いて確かめた）
const DROP_PLACE_URLS = {
  'https://www.city.shimada.shizuoka.jp/kanko-docs/0874.html': 'グラウンド・ゴルフの記載が無くなった（サッカー場などの一覧）',
  'https://www.city.shimada.shizuoka.jp/kanko-docs/2368.html': 'グラウンド・ゴルフの記載が無くなった',
  'https://www.city.shimada.shizuoka.jp/kanko-docs/kouennoshoukai.html': 'グラウンド・ゴルフの記載が無くなった（「公園」という名前の一般的な項目）',
  'https://webc.sjc.ne.jp/inabe/index': 'シルバー人材センターのページで、施設の案内ではない',
  'https://www.city.tamana.lg.jp/q/list/429.html?pg=1': 'グラウンド・ゴルフの記載が無くなった',
};
const DROP_EVENT_IDS = {
  'M-f56ceca3': '元のカレンダーに載らなくなった（スナッグゴルフの体験会で、グラウンド・ゴルフの大会ではない）',
  'M-f2ea6cb3': '元のページが削除された（404、2026-11-23に確認）',
  'M-2de7bce4': '元のページが削除された（404、2026-11-23に確認）',
  'M-1d62f0cb': '元のページが削除された（404、2026-11-23に確認）',
};

// ── 載せる施設（name は載せる名前。detail は、施設のページに書かれた住所・電話番号）
const F = (url, name, detail = null) => ({ url, name, detail });
const FACILITIES = [
  F('https://www.shichigahama.com/aquarena/facility05.html', '第1スポーツ広場'),
  F('https://www.shichigahama.com/aquarena/facility06.html', '第2スポーツ広場'),
  F('https://www.city.shibukawa.lg.jp/kyouiku/000144/000148/p001549.html', '伊香保屋外運動場グラウンドゴルフ場', { address: '群馬県渋川市伊香保町伊香保528番地4', phone: '0279-72-4285' }),
  F('https://www.city.shibukawa.lg.jp/kyouiku/000144/000148/p000229.html', '坂東橋緑地公園'),
  F('https://www.town.miyota.nagano.jp/category/kouen/2207.html', 'やまゆり公園', { address: '長野県北佐久郡御代田町大字塩野3036番48', phone: null }),
  F('https://www.urugi.jp/top/introduction_sightseeing/sports/ground_golf/', '南信州うるぎグラウンド・ゴルフ場'),
  F('https://www.city.ogaki.lg.jp/0000009551.html', 'かみいしづ緑の村公園'),
  F('https://www.city.sakai.lg.jp/kurashi/koen/shokai/baraike.html', '原池公園', { address: '大阪府堺市中区八田寺町320', phone: null }),
  F('https://www.city.sakai.lg.jp/kurashi/sports/sports_shisetsu/shisetsu/taiikukan/mihara/minoikeyakyu.html', 'みの池野球場'),
  F('https://www.town.kosa.lg.jp/q/aview/125/24.html', '安津橋健康広場グラウンド・ゴルフ場（グリーンパル甲佐）'),
  F('https://www.city.yokote.lg.jp/shisetsu/1005531/1005534/1003991.html', '吉田地区交流センター（隣接の公認グラウンド・ゴルフ場）'),
  F('https://www.city.tochigi.lg.jp/site/shakaitaiiku-gakkoukaihou/33437.html', '都賀市民運動場'),
  F('https://www.city.makinohara.shizuoka.jp/soshiki/26/2001.html', '小堤山公園'),
  F('https://www.city.himeji.lg.jp/kanko/0000002946.html', '付城公園'),
  F('https://www.city.tamana.lg.jp/q/aview/408/370.html', '蛇ヶ谷公園'),
  F('https://www.city.nobeoka.miyazaki.jp/site/miryoku/3212.html', '西階公園'),
  F('https://jkougen.jp/kankou/spot-info/sanwa-sogo-center/', 'さんわ総合センター'),
  F('https://www.sanko-shizuoka.jp/facility/category/grand_golf/', '有度山総合公園運動施設グラウンドゴルフ場'),
  F('https://www.city.iizuka.lg.jp/life/6/37/', '飯塚市グラウンドゴルフ場'),
];

// ── 載せるイベント（ページに書かれた日付・会場・問い合わせ先）
const EVENTS = [
  { url: 'https://www.city.matsusaka.mie.jp/site/sports/261114.html', name: '第22回松阪市長杯グラウンド・ゴルフ大会', start: '2026-11-15', venue: '松阪市総合運動公園 多目的広場', contact_dept: '教育委員会事務局スポーツ課', contact_phone: '0598-53-4391', cancelled: true },
  { url: 'https://www.city-nakatsu.jp/doc/2026111900037/', name: '第21回中津市長杯親善グラウンド・ゴルフ大会', start: '2026-11-19', venue: 'ダイハツ九州スポーツパーク大貞（芝生広場）', contact_dept: '体育・給食課', contact_phone: '0979-62-9013', finished_note: true },
  { url: 'https://www.city.mino.gifu.jp/docs/466.html', name: '大矢田公民館グラウンドゴルフ大会', start: '2026-11-14', venue: '大矢田グラウンド', organizer: '大矢田公民館' },
];

// 1) 載せなくする
const addOv = (list, o) => { if (!list.some((x) => x.source_url === o.source_url)) { list.push(o); return true; } return false; };
let dropP = 0, dropE = 0;
for (const url of Object.keys(DROP_PLACE_URLS)) if (addOv(placeOv.overrides, { source_url: url, exclude: true })) dropP++;
for (const [id, why] of Object.entries(DROP_EVENT_IDS)) if (!(id in eventOv.exclude)) { eventOv.exclude[id] = why; dropE++; }
const beforeE = events.events.length;
events.events = events.events.filter((e) => !(e.id in DROP_EVENT_IDS));

// 2) 施設を足す
const haveUrlName = new Set(places.places.map((p) => `${p.source_url}|${p.name}`));
const haveName = new Set(places.places.filter((p) => p.kind === 'facility').map((p) => `${p.municipality_code}|${p.name}`));
const haveUrl = new Set(places.places.map((p) => p.source_url));
let addF = 0, addD = 0, dupF = 0;
const haveDetail = new Set(details.details.map((d) => `${d.municipality_code}|${d.name.normalize('NFKC').replace(/\s+/g, '')}`));
for (const f of FACILITIES) {
  const r = row(f.url), code = r['自治体コード'];
  const prefecture = prefOf.get(code.slice(0, 2)) ?? (console.error('都道府県が分かりません: ' + code), process.exit(1));
  if (haveUrlName.has(`${f.url}|${f.name}`) || haveName.has(`${code}|${f.name}`) || haveUrl.has(f.url)) { dupF++; console.log('すでにある（施設）:', r['自治体名'], f.name); }
  else { places.places.push({ kind: 'facility', name: f.name, prefecture, municipality: r['自治体名'], municipality_code: code, source_url: f.url, surveyed_at: NOW, flags: [] }); addF++; }
  // 住所・電話番号は、すでにある施設にも、まだ付いていなければ足す
  if (f.detail && !haveDetail.has(`${code}|${f.name.normalize('NFKC').replace(/\s+/g, '')}`)) {
    details.details.push({ municipality_code: code, municipality: r['自治体名'], prefecture, name: f.name, address: f.detail.address, phone: f.detail.phone, phone_is_contact: false, source_kind: 'municipal', source_url: f.url, fetched_at: NOW }); addD++;
  }
}
places.places.sort((a, b) => a.municipality_code.localeCompare(b.municipality_code) || (a.name ?? '￿').localeCompare(b.name ?? '￿'));

// 3) イベントを足す
const haveId = new Set(events.events.map((e) => e.id));
const haveKey = new Set(events.events.map((e) => `${e.municipality_code}|${coreKey(e.name)}|${e.start ?? ''}`));
let addE = 0, dupE = 0;
for (const e of EVENTS) {
  const r = row(e.url), code = r['自治体コード'];
  const id = `M-${hash8(`${e.url}|${coreKey(e.name)}|${e.start}`)}`;
  if (haveId.has(id) || haveKey.has(`${code}|${coreKey(e.name)}|${e.start}`)) { dupE++; console.log('すでにある（イベント）:', r['自治体名'], e.name); continue; }
  events.events.push({
    id, prefecture: prefOf.get(code.slice(0, 2)), municipality_code: code, municipality: r['自治体名'], name: e.name, kind: 'gg', start: e.start, end: e.start, date_kind: 'exact',
    venue: e.venue ?? null, organizer: e.organizer ?? null, target: null, fee: null, deadline: null, contact_dept: e.contact_dept ?? null, contact_phone: e.contact_phone ?? null,
    cancelled: !!e.cancelled, postponed: false, finished_note: !!e.finished_note, source_url: e.url, extracted_at: NOW,
  });
  addE++;
}
events.source_extracted_to = NOW;
const w = (p, o) => writeFileSync(join(root, p), JSON.stringify(o, null, 2) + '\n');
w('data/places/places.json', places); w('data/places/details.json', details); w('data/events/municipal.json', events);
w('data/places/overrides.json', placeOv); w('data/events/municipal-overrides.json', eventOv);
console.log({ 載せなくした施設ページ: dropP, 載せなくしたイベント: dropE, イベント数: `${beforeE}→${events.events.length}`, 施設追加: addF, 施設重複: dupF, 住所電話追加: addD, イベント追加: addE, イベント重複: dupE });
