// 使い方: node scripts/places/import-pdf-ai.mjs [data/places/pdf-ai/2026-11-17-all.csv]
// 自治体のPDFを AI が読んで取り出したCSV（種類・自治体コード・自治体名・名称・場所・日付 …）から、載せるものだけを選んで
//   ・イベント → data/events/municipal.json  ・施設 → data/places/places.json と data/places/details.json
// に足す。何度実行しても同じ結果になる（すでにあるものは足さない）。
// 載せるかどうかは、下の表（EVENTS・FACILITIES）で人が決めたもの。CSVの「名称」と「自治体コード」で行を探し、見つからなければ止まる。
// 載せなかった行と理由は SKIPPED に残す（docs/places/README.md にも書く）。「団体」の行は、サイトに載せる場所がまだないので足さない。
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from './lib.mjs';
import { coreKey, hash8 } from '../events/municipal-lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const csvPath = process.argv.find((a, i) => i >= 2 && !a.startsWith('--')) ?? join(root, 'data/places/pdf-ai/2026-11-17-all.csv');
const NOW = process.env.IMPORT_NOW ?? '2026-11-17T00:00:00Z';
const rows = parseCsv(readFileSync(csvPath, 'utf8'));
const find = (type, code, name) => {
  const r = rows.find((x) => x['種類'] === type && x['自治体コード'] === code && x['名称'] === name);
  if (!r) { console.error(`CSVに行がありません: ${type} ${code} ${name}`); process.exit(1); }
  return r;
};
const places = JSON.parse(readFileSync(join(root, 'data/places/places.json'), 'utf8'));
const details = JSON.parse(readFileSync(join(root, 'data/places/details.json'), 'utf8'));
const events = JSON.parse(readFileSync(join(root, 'data/events/municipal.json'), 'utf8'));
const prefOf = new Map(places.places.map((p) => [p.municipality_code.slice(0, 2), p.prefecture]));
const pref = (code) => prefOf.get(code.slice(0, 2)) ?? (console.error('都道府県が分かりません: ' + code), process.exit(1));
const E = (code, csvName, o) => ({ code, csvName, kind: 'gg', end: null, venue: null, organizer: null, target: null, fee: null, deadline: null, contact_dept: null, contact_phone: null, finished_note: false, ...o });

// ── イベント（CSVの日付の文から、人が読んで確かめた日付）
const EVENTS = [
  E('03202', "目指せホールインワン『グラウンド・ゴルフ大会』(第13回)", { name: '目指せホールインワン『グラウンド・ゴルフ大会』（第13回）', start: '2026-06-07', venue: '新里生涯学習センター', organizer: '新里地区生涯スポーツ推進協議会', finished_note: true }),
  E('03206', 'グラウンド・ゴルフ 春季交流大会', { name: 'グラウンド・ゴルフ 春季交流大会', start: '2026-04-15' }),
  E('03206', 'グラウンド・ゴルフ 夏季交流大会', { name: 'グラウンド・ゴルフ 夏季交流大会', start: '2026-05-20' }),
  E('03206', '北海道・東北 グラウンド・ゴルフ交歓大会', { name: '北海道・東北 グラウンド・ゴルフ交歓大会', start: '2026-07-01', end: '2026-07-02' }),
  E('11222', '第71回市民体育祭 地区対抗グラウンド・ゴルフ大会', { start: '2026-10-10', venue: '総合公園多目的運動場', finished_note: true }),
  E('11239', '第25回坂戸市民スポーツフェスティバル グラウンド・ゴルフ体験', { start: '2026-04-29', venue: '坂戸市民総合運動公園 第1多目的運動場', organizer: 'グラウンド・ゴルフ協会' }),
  E('11243', 'グラウンドゴルフ大会', { start: '2026-11-22', venue: '吉川運動公園', contact_dept: 'スポーツ推進課', contact_phone: '048-982-6800' }),
  E('11246', '第20回白岡市民グラウンド・ゴルフ大会', { start: '2026-11-12', organizer: '白岡市グラウンド・ゴルフ協会', target: '白岡市民愛好者・白岡協会会員' }),
  E('11246', '第4回白岡市杯グラウンド・ゴルフ大会', { start: '2026-10-10', organizer: '白岡市グラウンド・ゴルフ協会', target: '県内外協会（連盟）会員のみ' }),
  E('11324', '春季グラウンドゴルフ大会', { start: '2026-03-19', venue: '運動公園グラウンド', finished_note: true }),
  E('23205', 'サマーニュースポーツフェスティバル', { kind: 'multi', start: '2026-07-25', venue: '半田市立半田中学校 グラウンド', organizer: '半田市教育委員会', target: '小学生以下の方は保護者同伴', fee: '無料', contact_dept: '教育委員会教育部スポーツ課', contact_phone: '0569-22-1184' }),
  E('23212', '碧信杯', { start: '2026-10-21', venue: '多目的グラウンド（総合運動公園）', organizer: '安城市グラウンドゴルフ協会' }),
  E('23212', '月例会(安城市グラウンドゴルフ協会)', { name: '月例会（安城市グラウンドゴルフ協会）', start: '2026-11-04', venue: '多目的グラウンド（総合運動公園）', organizer: '安城市グラウンドゴルフ協会' }),
  E('23212', '安城選手権「グラウンドゴルフ」', { start: '2026-11-19', venue: '多目的グラウンド（総合運動公園）', organizer: '安城市スポーツ協会' }),
  E('23212', '郵友グラウンド・ゴルフ大会', { start: '2026-11-20', venue: '多目的グラウンド（総合運動公園）', organizer: '安城グラウンドゴルフ郵友会' }),
  E('23225', '令和8年度 グラウンド・ゴルフ教室', { name: 'グラウンド・ゴルフ教室', start: '2026-04-14', end: '2026-05-19', venue: '御林公園・昭和グランド', target: '市内のグラウンド・ゴルフ愛好者（障がいのある方も参加できます）。定員15名', fee: '受講料 一般2,000円・65歳以上1,200円。ほかに必要経費800円' }),
  E('28228', '北播磨広域定住自立圏グラウンド・ゴルフ大会', { start: '2027-02-23', venue: '滝野総合公園多目的グラウンド' }),
  E('28464', '第53回グラウンドゴルフ大会', { start: '2026-09-12', venue: '丸尾建築総合公園 町民グラウンド', contact_dept: '町民体育館' }),
  E('28464', '第52回グラウンドゴルフ大会', { start: '2026-03-07', venue: '丸尾建築総合公園 町民グラウンド', contact_dept: '町民体育館' }),
  E('31401', '日南町グラウンドゴルフ大会', { start: '2026-05-16', venue: '三本松グリーンパーク', organizer: '日南町スポーツ協会' }),
  E('31401', '阿毘縁高原グラウンドゴルフ大会', { start: '2026-09-09', venue: '多里山村広場', organizer: '日南町スポーツ協会' }),
  E('43531', '富岡地区秋季グラウンド・ゴルフ大会', { start: '2026-11-15', venue: '農村運動広場', organizer: '富岡地区体育振興会', contact_dept: '教育委員会' }),
  E('43531', '第12回苓北町長杯グラウンド・ゴルフ大会', { start: '2027-03-21', venue: '農村運動広場', contact_dept: '教育委員会' }),
];

// ── 施設（名前はCSVの名称を整えたもの。住所・電話は、PDFに書かれていて、その施設のものと確かめられたものだけ）
const F = (code, csvName, name, d = null) => ({ code, csvName, name, detail: d });
const FACILITIES = [
  F('02201', '盛運輸サンドーム(屋内グラウンド)', '盛運輸サンドーム（屋内グラウンド）'),
  F('03206', '和賀川グラウンドゴルフ公認コース', '和賀川グラウンドゴルフ公認コース'),
  F('09215', '大桶運動公園 野球場北側広場', '大桶運動公園 野球場北側広場'),
  F('10345', 'リバートピア吉岡 グラウンドゴルフ場', 'リバートピア吉岡 グラウンドゴルフ場'),
  F('11326', '毛呂山総合公園 芝生広場', '毛呂山総合公園 芝生広場'),
  F('12213', '東金市多目的グラウンド', '東金市多目的グラウンド'),
  F('18208', 'トリムパークかなづ グラウンドゴルフコース', 'トリムパークかなづ グラウンドゴルフコース'),
  F('23212', '安城市西部グラウンドゴルフ場', '安城市西部グラウンドゴルフ場', { address: null, phone: '0566-76-9393', phone_is_contact: true }),
  F('23212', '安城市総合運動公園 多目的グラウンド', '安城市総合運動公園 多目的グラウンド'),
  F('23213', '西尾市松原グラウンド・ゴルフ場', '西尾市松原グラウンド・ゴルフ場'),
  F('23215', '犬山市野外活動センター グラウンド・ゴルフ場', '犬山市野外活動センター グラウンド・ゴルフ場', { address: null, phone: '0568-44-0353', phone_is_contact: true }),
  F('23223', '桜木多目的広場', '桜木多目的広場'),
  F('23223', '長草多目的広場', '長草多目的広場'),
  F('23234', '鹿田グラウンドゴルフ場', '鹿田グラウンドゴルフ場'),
  F('23234', '高田寺グラウンドゴルフ場', '高田寺グラウンドゴルフ場'),
  F('23302', '町民運動広場(町民グラウンド)', '町民運動広場（町民グラウンド）'),
  F('23302', '愛知池運動公園運動場', '愛知池運動公園運動場'),
  F('27215', '池の里市民交流センター(サブグラウンド・グラウンド)', '池の里市民交流センター'),
  F('29402', 'ニュースポーツ広場(明日香村)', 'ニュースポーツ広場'),
  F('40211', '市民の森公園 軽スポーツ広場', '市民の森公園 軽スポーツ広場'),
  F('45431', '西郷総合グラウンド', '西郷総合グラウンド', { address: '宮崎県美郷町西郷1870番地', phone: null, phone_is_contact: false }),
];

// 載せなかった行と理由（人が決めたもの）
export const SKIPPED = {
  '施設: 桶川市 新小針領家グラウンド': 'グラウンド・ゴルフ専用の設備の記述がなく、加盟団体が利用するという記述だけ',
  '施設: 江南市 草井グラウンドゴルフ場': '駅伝の中継所の名前から読み取っただけで、利用の記述がない',
  '施設: 東郷町 境川緑地公園 第2多目的運動広場': '表の崩れで、第1・第2のどちらの行か確定できない',
  '施設: 呉市 呉昭和高校跡地グラウンド': '取扱要綱に基づく暫定的な使用で、続くか分からない',
  'イベント: 青森市 体験会(2026年7月)': '3か所の会場と日付の対応が崩れていて確定できない',
  'イベント: 五島市 ×7': '月が確定できない（日・旬だけ）',
  'イベント: 大野市・西脇市': '年・大会名・会場が確定できない（信頼度が低い）',
  'イベント: 大牟田市': '日が確定できない（令和8年10月）',
  'イベント: 苓北町 老連GG大会・志岐地区': '日が未定（令和9年2月だけ・未定）',
  'イベント: 桶川市(2023)・新発田市(2024)・いすみ市・燕市・筑後市(2025年10月)': '開催日から1年以上たっていて、表示の対象外',
  '団体 22行': 'クラブ・協会の紹介を載せる場所がまだない（運営者の判断が要る）。CSVは data/places/pdf-ai/ に保存',
};

const have = new Set(events.events.map((e) => e.id));
const haveKey = new Set(events.events.map((e) => `${e.municipality_code}|${coreKey(e.name)}|${e.start ?? ''}`));
let addedE = 0, dupE = 0;
for (const e of EVENTS) {
  const r = find('イベント', e.code, e.csvName);
  const name = e.name ?? r['名称'];
  const url = r['PDFのURL'];
  if (!/^https:\/\//.test(url)) { console.error('https でないURL: ' + url); process.exit(1); }
  const id = `M-${hash8(`${url}|${coreKey(name)}|${e.start}`)}`;
  if (have.has(id) || haveKey.has(`${e.code}|${coreKey(name)}|${e.start}`)) { dupE++; console.log('すでにある（イベント）:', r['自治体名'], name); continue; }
  events.events.push({
    id, prefecture: pref(e.code), municipality_code: e.code, municipality: r['自治体名'], name, kind: e.kind, start: e.start, end: e.end ?? e.start,
    date_kind: e.end && e.end !== e.start && (Date.parse(e.end) - Date.parse(e.start)) / 86400e3 > 10 ? 'range' : 'exact',
    venue: e.venue, organizer: e.organizer, target: e.target, fee: e.fee, deadline: e.deadline, contact_dept: e.contact_dept, contact_phone: e.contact_phone,
    cancelled: false, postponed: false, finished_note: e.finished_note, source_url: url, extracted_at: NOW,
  });
  addedE++;
}
events.source_extracted_to = NOW;

const haveUrlName = new Set(places.places.map((p) => `${p.source_url}|${p.name}`));
const haveName = new Set(places.places.filter((p) => p.kind === 'facility').map((p) => `${p.municipality_code}|${p.name}`));
let addedF = 0, dupF = 0, addedD = 0;
for (const f of FACILITIES) {
  const r = find('施設', f.code, f.csvName);
  const url = r['PDFのURL'];
  if (!/^https:\/\//.test(url)) { console.error('https でないURL: ' + url); process.exit(1); }
  if (haveUrlName.has(`${url}|${f.name}`) || haveName.has(`${f.code}|${f.name}`)) { dupF++; console.log('すでにある（施設）:', r['自治体名'], f.name); continue; }
  places.places.push({ kind: 'facility', name: f.name, prefecture: pref(f.code), municipality: r['自治体名'], municipality_code: f.code, source_url: url, surveyed_at: NOW, flags: [] });
  addedF++;
  if (f.detail) {
    details.details.push({ municipality_code: f.code, municipality: r['自治体名'], prefecture: pref(f.code), name: f.name, address: f.detail.address, phone: f.detail.phone, phone_is_contact: f.detail.phone_is_contact, source_kind: 'municipal', source_url: url, fetched_at: NOW });
    addedD++;
  }
}
places.places.sort((a, b) => a.municipality_code.localeCompare(b.municipality_code) || (a.name ?? '￿').localeCompare(b.name ?? '￿'));
if ('count' in places) places.count = places.places.length;
if ('count' in details) details.count = details.details.length;
writeFileSync(join(root, 'data/events/municipal.json'), JSON.stringify(events, null, 2) + '\n');
writeFileSync(join(root, 'data/places/places.json'), JSON.stringify(places, null, 2) + '\n');
writeFileSync(join(root, 'data/places/details.json'), JSON.stringify(details, null, 2) + '\n');
console.log({ イベント追加: addedE, イベント重複: dupE, 施設追加: addedF, 施設重複: dupF, 住所電話追加: addedD, 団体の行は足さない: rows.filter((r) => r['種類'] === '団体').length });
