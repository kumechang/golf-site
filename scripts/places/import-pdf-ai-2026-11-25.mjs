// 使い方: node scripts/places/import-pdf-ai-2026-11-25.mjs
// 2026-11-25に受け取った「PDFをAIが読んだCSV」（data/places/pdf-ai/2026-11-25-all.csv。前回の88行を含む307行）の取り込み。
// 11-17分（import-pdf-ai.mjs）に載せたもの・載せなかったものは、そのまま（すでにあるものは足さない。載せなかったものは、下の SKIP_* に残す）。
// 載せるかどうかは、行を1つずつ見て決めた（下の表）。何度実行しても同じ結果になる。
//  ・施設: 利用の記載があり、名前が確定できるもの。信頼度が低い・名前や所在地が確定できない・元ページが http のものは載せない
//  ・イベント: 日付が確定できて、開催から1年以内か、これから開かれるもの。月・日が確定できないもの、信頼度が低いものは載せない
//  ・団体（クラブ・協会）: 載せる場所がまだないので足さない
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from './lib.mjs';
import { coreKey, hash8, tidyEventName, tidyVenue, tidyOrganizer, tidyTarget, tidyFee, tidyContact } from '../events/municipal-lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const NOW = process.env.IMPORT_NOW ?? '2026-11-25T00:00:00Z';
const rows = parseCsv(readFileSync(join(root, 'data/places/pdf-ai/2026-11-25-all.csv'), 'utf8'));
const oldRows = parseCsv(readFileSync(join(root, 'data/places/pdf-ai/2026-11-17-all.csv'), 'utf8'));
const key = (r) => `${r['種類']}|${r['自治体コード']}|${r['名称']}`;
const oldKeys = new Set(oldRows.map(key));
const rd = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const places = rd('data/places/places.json'), details = rd('data/places/details.json'), events = rd('data/events/municipal.json');
const prefOf = new Map(places.places.map((p) => [p.municipality_code.slice(0, 2), p.prefecture]));
const pref = (code) => prefOf.get(code.slice(0, 2)) ?? (console.error('都道府県が分かりません: ' + code), process.exit(1));

// ── 施設: 載せないもの（コード|名前の先頭）と理由
const SKIP_FAC = {
  '02203|プライフーズスタジアム': 'グラウンド・ゴルフの記載が確かでない（面積・利用期間の記述だけ）',
  '02203|八戸市 主練習場': '資料の題名からの名前で、グラウンド・ゴルフの記載がない',
  '05201|秋田市のグラウンドゴルフ場': '施設の正式名称が分からない',
  '05211|二荒山グラウンドゴルフ場': '「飯田川二荒山グラウンドゴルフ場」と同じ施設の可能性が高い（重複を避けた）',
  '06212|花笠グランドゴルフ場': 'グラウンド・ゴルフの利用の記述がない（マラソンのスタート地点の名前）',
  '07212|小高中部運動場': 'グラウンド・ゴルフの記載がない',
  '08203|南部田中冷設': '名前が文字の崩れで確定できない',
  '08216|下入野健康増進センター': '信頼度が低い（OCRの文字化け）',
  '08220|つくば市 中央公園': '信頼度が低い（公園名が確定できない）',
  '10208|坂東橋緑地公園ソフトボール場': '「坂東橋緑地公園」を、すでに載せている',
  '12207|古ヶ崎スポーツ広場': 'グラウンド・ゴルフの記載が確かでない（一覧表の行）',
  '13111|大森ふるさとの浜辺公園 フットサル場': '施設の名前が、フットサル場の名前',
  '13114|区立公園多目的運動場': '信頼度が低い（個別の公園名が確定できない）',
  '15210|十日町市 多目的広場': '広場の名前が確定できない',
  '22130|三ヶ日運動場': '信頼度が低い',
  '22209|元島田公園': '説明の文が途中で切れている',
  '22212|焼津市 多目的広場A・D': '公園名が確定できない',
  '24543|大白公園': '信頼度が低い（OCRの文字の崩れ）',
  '27381|河南町 グラウンド・ゴルフ場': '施設は河南町の所在で、資料は太子町のもの（市区町村の対応が複雑）',
  '31302|ゆかむりの里': '施設名の読み取りが確かでない（表の崩れ）',
  '34545|山村広場グラウンドゴルフ場': '元のPDFのURLが http',
  '46215|総合運動公園': '信頼度が低い（配置図の文字）',
};
// ── 施設: 載せる名前の直し（CSVの名称→載せる名前）。それ以外は、先頭の「◯◯市 」と末尾の「（市区町村名）」を外すだけ
const RENAME = {
  '屋内運動場(グリーンドーム)(八戸市)': '屋内運動場（グリーンドーム）',
  '総合運動公園グラウンドゴルフ場(昭和村)': '総合運動公園グラウンドゴルフ場',
  '北ノ台スポーツ多目的広場 第1スポーツ広場': '北ノ台スポーツ多目的広場',
  'きこちゃんスタジアム(下呂市)': 'きこちゃんスタジアム',
  '藤枝総合運動公園(グランドゴルフ個人利用)': '藤枝総合運動公園',
  '河内トリムパーク(グラウンドゴルフ)': '河内トリムパーク',
  '山城コミュニティ広場 一般競技場(グラウンドゴルフ用)': '山城コミュニティ広場',
  '見影橋公園野球場(グラウンドゴルフ専用枠)': '見影橋公園野球場',
  '湯の瀬川公園(にばんわく広場)グランドゴルフ場': '湯の瀬川公園（にばんわく広場）グランドゴルフ場',
  '真室川町 グラウンドゴルフ場': '真室川町グラウンドゴルフ場',
  '伯耆町 グラウンドゴルフ場': '伯耆町グラウンドゴルフ場',
  '宝達志水町 グラウンドゴルフ場': '宝達志水町グラウンドゴルフ場',
  '新見市 いこいとふれあいの公園 グラウンドゴルフ場': 'いこいとふれあいの公園 グラウンドゴルフ場',
  '庄原市 戸宇スポーツ広場 グラウンドゴルフ場': '戸宇スポーツ広場',
  '川崎町 運動公園 グラウンドゴルフ場': '川崎町運動公園グラウンドゴルフ場',
  '久米南町民運動公園(グラウンドゴルフ場)': '久米南町民運動公園',
  '狭山市 多目的グラウンド': '多目的グラウンド',
  '米原市 番場多目的広場': '番場多目的広場',
  '池田市 北多目的広場': '北多目的広場',
  '大山崎町 多目的広場A・B': '多目的広場A・B',
  '大谷公園 グラウンドゴルフ場': '大谷公園グラウンドゴルフ場',
};
// ── 施設: 住所・電話番号（PDFに書かれたもの。phone_is_contact は、窓口の番号のとき）
const DETAIL = {
  '白石市グラウンド・ゴルフ場(若林弁天パーク)': { address: '宮城県白石市大鷹沢大町字若林地内', phone: '0224-26-6090', contact: false },
  '飯田川二荒山グラウンドゴルフ場': { address: '秋田県潟上市飯田川下虻川字蟹沢12番地1' },
  '南石関グラウンド・ゴルフ場': { address: '山形県山形市南石関57-1' },
  '真室川町 グラウンドゴルフ場': { phone: '0233-62-3411', contact: true },
  '羊山公園グラウンド(A・B)': { address: '埼玉県秩父市大宮6208番地' },
  '加賀朝日町グラウンドゴルフ場': { address: '石川県金沢市加賀朝日町北6番地' },
  '羽曳野市立健康ふれあいの郷グラウンド・ゴルフ場': { address: '大阪府羽曳野市羽曳が丘9丁目35-1', phone: '072-950-6611', contact: true },
};

// ── イベント: 載せるものの開催日（CSVの日付の文から、人が確かめたもの。年のない行は、曜日が合う年・年度から）
const EV = {
  '03209|岩手日日グループ杯グラウンドゴルフ交歓大会': '2026-10-01', '03209|岩手県第二地区レディースグラウンド・ゴルフ交歓大会': '2026-10-15',
  '03209|一関市グラウンド・ゴルフ協会東山支部月例会': '2026-10-08', '03209|げいび渓杯特例大会(グラウンド・ゴルフ)': '2026-10-22',
  '03209|川崎町民交通安全グラウンドゴルフ大会': '2026-10-28', '03209|第2回ふれあいグラウンドゴルフ大会': '2026-11-05',
  '03209|一関市グラウンド・ゴルフ協会東山支部長杯グラウンド・ゴルフ大会': '2026-11-19',
  '03215|令和8年度奥州市民スポーツ祭 グラウンド・ゴルフ競技': '2026-06-13', '03381|金ケ崎町スポーツ大会 グラウンド・ゴルフ交流大会': '2026-07-09',
  '05203|第3回横手カップ室内GG大会': '2026-02-02', '06364|梅の里まむろがわ春まつり グランドゴルフ交流大会': '2026-04-29',
  '07207|第59回須賀川市民スポーツ大会 グラウンド・ゴルフ': '2026-10-16', '09209|グラウンド・ゴルフ教室(令和8年度スポーツ教室)': ['2027-01-18', '2027-02-12'],
  '09214|第22回さくら市民体育祭夏季球技大会 グラウンド・ゴルフ': '2026-09-13', '10448|第10回グラウンド・ゴルフ大会': '2026-05-19', '10448|第10回グラウンド・ゴルフ教室': '2026-05-12',
  '12208|野田市協会普及指導員大会(グラウンド・ゴルフ協会)': '2026-05-26', '12208|福田地区グラウンド・ゴルフ大会': '2026-06-06',
  '12226|富津市ふれあいスポーツフェスタ2026 グラウンド・ゴルフ': '2026-10-12', '13110|グラウンド・ゴルフ教室(砧イベント)': '2026-11-27',
  '13122|葛飾区民春季グラウンド・ゴルフ大会': '2026-04-15', '13122|葛飾区民秋季グラウンド・ゴルフ大会': '2025-11-26',
  '13207|第73回昭島市民スポーツ大会 種目別大会 グラウンド・ゴルフ': '2026-09-30', '13225|第58回稲城市民スポーツ・レクリエーション大会 グラウンドゴルフ大会': '2026-11-03',
  '15205|2026柏崎スポーツレクリエーショングランプリ グラウンドゴルフ大会': '2026-06-21', '15206|新潟県グラウンドゴルフ下越ブロック交歓大会': '2026-07-04', '15206|市民総体グラウンドゴルフ': '2026-09-20',
  '15209|第69回加茂市総合スポーツ大会 グラウンド・ゴルフ大会': '2026-10-10', '21303|第44回町民・交流グラウンド・ゴルフ大会': '2026-10-25',
  '22207|第47回富士宮市スポーツ祭 第20回グラウンド・ゴルフ大会(区対抗)': '2026-11-14', '25206|なごみ杯グランドゴルフ大会': '2026-11-06',
  '25210|令和8年度野洲市秋季スポーツ大会 グラウンド・ゴルフ': '2026-11-12', '25383|グラウンドゴルフ大会(日野町 11月19日)': '2026-11-19', '25383|グラウンドゴルフ大会(日野町 11月7日)': '2026-11-07',
  '27222|令和8年度羽曳野グラウンド・ゴルフコース月例大会 第5回': '2026-10-23', '27222|令和8年度羽曳野グラウンド・ゴルフコース月例大会 第6回': '2026-11-27',
  '27222|令和8年度羽曳野グラウンド・ゴルフコース月例大会 第7回': '2026-12-18', '27222|令和8年度羽曳野グラウンド・ゴルフコース月例大会 第8回': '2027-01-22',
  '27222|令和8年度羽曳野グラウンド・ゴルフコース月例大会 第9回': '2027-02-26', '27222|令和8年度羽曳野グラウンド・ゴルフコース月例大会 第10回': '2027-03-26',
  '27361|熊取町町民スポーツ大会 グランドゴルフ': '2026-09-11', '28202|第76回尼崎市民スポーツ祭 グラウンド・ゴルフ': '2026-06-11',
  '29203|第75回大和郡山市民スポーツ大会 グラウンド・ゴルフの部': '2026-05-15', '30203|ライフ親子グラウンド・ゴルフ大会 in 橋本': '2026-11-21',
  '31371|東伯郡 グラウンド・ゴルフの部(町村対抗)': '2026-06-21', '32202|浜田市総合スポーツ大会 グラウンドゴルフ': '2026-10-24', '33204|令和8年度地域交流グラウンドゴルフ大会': '2026-11-07',
  '36201|第21回 徳島市民スポ・レクフェスティバル グラウンド・ゴルフ大会': '2026-10-11',
  '40202|大牟田市グラウンドゴルフ協会 月例大会(6月)': '2026-06-09', '40202|大牟田市グラウンドゴルフ協会 月例大会(7月)': '2026-07-10', '40202|大牟田市グラウンドゴルフ協会 月例大会(8月)': '2026-08-07',
  '40202|大牟田市グラウンドゴルフ協会 月例大会(4月)': '2026-04-15', '40202|大牟田市グラウンドゴルフ協会 月例大会(1月)': '2026-01-14',
  '43100|令和8年度熊本市民スポーツフェスタ グラウンドゴルフ': '2026-10-03', '43501|第12回分館対抗グラウンド・ゴルフ大会': '2026-10-04', '46392|第22回さつま町区公民館対抗グラウンド・ゴルフ大会': '2026-11-28',
};
export const SKIPPED_EVENTS = '月・日が確定できない（むつ市・上三川町・みなかみ町・津市・防府市・呉市・北広島町・薩摩川内市・川崎町・日吉津村・矢板市）／信頼度が低い（三川町・津市）／出店一覧の記載（平川市）／どちらが予備日か確定できない（田原本町）／開催から1年以上（坂戸市・加茂市の昨年分・桶川市・太子町）';

const norm = (s) => s.normalize('NFKC');
const weekdayOk = (text, iso) => { const m = text.match(/[（(]([月火水木金土日])/); if (!m) return true; const d = new Date(iso + 'T00:00:00Z').getUTCDay(); return '日月火水木金土'[d] === m[1]; };

// 1) 施設
const haveUrlName = new Set(places.places.map((p) => `${p.source_url}|${p.name}`));
const haveName = new Set(places.places.filter((p) => p.kind === 'facility').map((p) => `${p.municipality_code}|${p.name}`));
const haveDetail = new Set(details.details.map((d) => `${d.municipality_code}|${norm(d.name).replace(/\s+/g, '')}`));
// 名前のゆれ（全角・半角、スペース、中黒、グランド／グラウンド）をならして、同じ市区町村にすでにある似た名前の施設は足さない
const simp = (s) => norm(s).replace(/[\s・･\-()]/g, '').replace(/グランド/g, 'グラウンド').replace(/グラウンドゴルフ場|グラウンドゴルフ/g, 'GG');
const existingNames = new Map();
for (const p of places.places) if (p.kind === 'facility') existingNames.set(p.municipality_code, [...(existingNames.get(p.municipality_code) ?? []), simp(p.name)]);
for (const d of details.details) existingNames.set(d.municipality_code, [...(existingNames.get(d.municipality_code) ?? []), simp(d.name)]);
const similar = (code, name) => { const a = simp(name); return (existingNames.get(code) ?? []).some((b) => a.length >= 4 && b.length >= 4 && (a === b || a.includes(b) || b.includes(a))); };
let addF = 0, dupF = 0, skipF = 0, addD = 0;
const usedSkip = new Set();
for (const r of rows.filter((r) => r['種類'] === '施設' && !oldKeys.has(key(r)))) {
  const code = r['自治体コード'], csvName = r['名称'], url = r['PDFのURL'];
  const sk = Object.keys(SKIP_FAC).find((k) => k.startsWith(code + '|') && csvName.startsWith(k.slice(6)));
  if (sk) { usedSkip.add(sk); skipF++; continue; }
  if (!/^https:\/\//.test(url) || r['信頼度'] === 'low') { skipF++; console.log('載せない（http・信頼度が低い）:', r['自治体名'], csvName); continue; }
  let name = RENAME[csvName] ?? csvName.replace(/\(([^)]*)\)$/, (m, g) => (g === r['自治体名'] ? '' : m)).replace(new RegExp('^' + r['自治体名'] + '\\s+'), '').replace(/\(/g, '（').replace(/\)/g, '）').trim();
  if (haveUrlName.has(`${url}|${name}`) || haveName.has(`${code}|${name}`) || similar(code, name)) { dupF++; continue; }
  places.places.push({ kind: 'facility', name, prefecture: pref(code), municipality: r['自治体名'], municipality_code: code, source_url: url, surveyed_at: NOW, flags: [] });
  haveName.add(`${code}|${name}`); haveUrlName.add(`${url}|${name}`); existingNames.set(code, [...(existingNames.get(code) ?? []), simp(name)]); addF++;
  const dt = DETAIL[csvName];
  if (dt && !haveDetail.has(`${code}|${norm(name).replace(/\s+/g, '')}`)) {
    details.details.push({ municipality_code: code, municipality: r['自治体名'], prefecture: pref(code), name, address: dt.address ?? null, phone: dt.phone ?? null, phone_is_contact: Boolean(dt.contact), source_kind: 'municipal', source_url: url, fetched_at: NOW }); addD++;
  }
}
for (const k of Object.keys(SKIP_FAC)) if (!usedSkip.has(k)) console.error('SKIP_FAC に対応する行が見つかりません: ' + k);
places.places.sort((a, b) => a.municipality_code.localeCompare(b.municipality_code) || (a.name ?? '￿').localeCompare(b.name ?? '￿'));

// 2) イベント
const haveId = new Set(events.events.map((e) => e.id));
const haveKey = new Set(events.events.map((e) => `${e.municipality_code}|${coreKey(e.name)}|${e.start ?? ''}`));
const haveDay = new Set(events.events.map((e) => `${e.municipality_code}|${e.start ?? ''}`));
let addE = 0, dupE = 0;
for (const [k, v] of Object.entries(EV)) {
  const [code, ...rest] = k.split('|'); const csvName = rest.join('|');
  const r = rows.find((x) => x['種類'] === 'イベント' && x['自治体コード'] === code && x['名称'] === csvName);
  if (!r) { console.error('CSVに行がありません: ' + k); process.exit(1); }
  const [start, end0] = Array.isArray(v) ? v : [v, v]; const end = end0 ?? start;
  if (!weekdayOk(r['日付'], start)) { console.log('曜日が合わないので載せない:', r['自治体名'], csvName, start, r['日付'].slice(0, 30)); continue; }
  const url = r['PDFのURL'];
  if (!/^https:\/\//.test(url)) { console.error('https でないURL: ' + url); process.exit(1); }
  const t = tidyEventName(csvName);
  const name = (t.name || csvName).replace(/\(/g, '（').replace(/\)/g, '）');
  const id = `M-${hash8(`${url}|${coreKey(name)}|${start}`)}`;
  if (haveId.has(id) || haveKey.has(`${code}|${coreKey(name)}|${start}`) || haveDay.has(`${code}|${start}`)) { dupE++; console.log('すでにある（イベント）:', r['自治体名'], name, start); continue; }
  const get = (label) => r['内容'].match(new RegExp(label + ':\\s*([^/]+)'))?.[1]?.trim() ?? null;
  const cm = r['連絡先'].match(/^(.*?)\s*(\d{2,4}-\d{2,4}-\d{3,4})?\s*$/);
  const contact = tidyContact(cm?.[1] ?? '', cm?.[2] ?? '');
  const days = (Date.parse(end) - Date.parse(start)) / 86400e3;
  events.events.push({
    id, prefecture: pref(code), municipality_code: code, municipality: r['自治体名'], name, kind: 'gg', start, end, date_kind: days > 10 ? 'range' : 'exact',
    venue: (/^原ラウンドゴルフ場/.test(r['場所']) ? null : tidyVenue(r['場所'])) || null, // 元のPDFの文字が欠けた表記（原グラウンドゴルフ場とみられるが確かでない）は載せない
    organizer: tidyOrganizer(get('主催') ?? '') || null, target: tidyTarget(get('対象') ?? '') || null, fee: tidyFee(get('参加費') ?? '') || null, deadline: null,
    contact_dept: contact.dept, contact_phone: contact.phone, cancelled: false, postponed: false, finished_note: /結果|報告|様子/.test(r['備考'] + r['根拠'] + csvName), source_url: url, extracted_at: NOW,
  });
  haveKey.add(`${code}|${coreKey(name)}|${start}`); haveDay.add(`${code}|${start}`); addE++;
}
events.source_extracted_to = NOW;
const w = (p, o) => writeFileSync(join(root, p), JSON.stringify(o, null, 2) + '\n');
w('data/places/places.json', places); w('data/places/details.json', details); w('data/events/municipal.json', events);
console.log({ 施設追加: addF, 施設重複: dupF, 施設見送り: skipF, 住所電話追加: addD, イベント追加: addE, イベント重複: dupE, 団体の行は足さない: rows.filter((r) => r['種類'] === '団体' && !oldKeys.has(key(r))).length });
