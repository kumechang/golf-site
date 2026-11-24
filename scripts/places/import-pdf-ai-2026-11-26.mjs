// 使い方: node scripts/places/import-pdf-ai-2026-11-26.mjs
// 2026-11-26に受け取った「AIが自治体の資料（PDFと、HTMLの案内ページ）を読んで取り出したCSV」（data/places/pdf-ai/2026-11-26-all.csv。11-25分の307行を含む620行）の取り込み。
// 前回まで（import-pdf-ai.mjs・import-pdf-ai-2026-11-25.mjs）の行は対象外。載せるかは、行を1つずつ見て決めた。何度実行しても同じ結果になる。
//  ・施設: 資料に利用の記載があり、名前が確定できるもの。信頼度が低い、元の資料が http、名前や所在地が確定できないものは載せない。住所・電話番号は、資料に書かれたものを足す（元がHTMLのページなら、あとで verify-sources.mjs で元ページと突き合わせられる）
//  ・イベント: 日付が確定できて、開催から1年以内か、これから開かれるもの。月・日が確定できないもの、資料が http のもの、信頼度が低いものは載せない
//  ・団体（クラブ・協会）: 載せる場所がまだないので足さない
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from './lib.mjs';
import { coreKey, hash8, tidyEventName, tidyVenue, tidyOrganizer, tidyTarget, tidyFee, tidyContact } from '../events/municipal-lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const NOW = process.env.IMPORT_NOW ?? '2026-11-26T00:00:00Z';
const URLCOL = '資料のURL(PDFまたはHTMLページ)';
const rd = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const csv = (p) => parseCsv(readFileSync(join(root, p), 'utf8'));
const rows = csv('data/places/pdf-ai/2026-11-26-all.csv');
const prevRows = csv('data/places/pdf-ai/2026-11-25-all.csv');
const key = (r) => `${r['種類']}|${r['自治体コード']}|${r['名称']}`;
const prevKeys = new Set(prevRows.map(key));
const fresh = rows.filter((r) => !prevKeys.has(key(r)));
const places = rd('data/places/places.json'), details = rd('data/places/details.json'), events = rd('data/events/municipal.json');
const prefOf = new Map(places.places.map((p) => [p.municipality_code.slice(0, 2), p.prefecture]));
const pref = (code) => prefOf.get(code.slice(0, 2)) ?? (console.error('都道府県が分かりません: ' + code), process.exit(1));
const norm = (s) => s.normalize('NFKC');

// ── 施設: 載せないもの（コード|名前の先頭）と理由
const SKIP_FAC = {
  '05211|天王多目的健康広場': 'フェスティバルでの体験の会場で、グラウンド・ゴルフ場ではない',
  '11245|総合体育館前グラウンド・ゴルフ場': '臨時駐車場の名前',
  '12207|千駄堀スポーツ広場': '信頼度が低い（昔の一覧）',
  '12207|和名ケ谷スポーツセンター': '信頼度が低い（昔の一覧）',
  '23206|中央公園グラウンド ナイター': '名前にナイターが入り、施設名として載せられない',
  '29363|田原本町グラウンドゴルフ場': '信頼度が低い',
};
// ── 施設: 載せる名前の直し（CSVの名称→載せる名前）。それ以外は、末尾・先頭の市区町村名と「(施設概要)」を外すだけ
const RENAME = {
  '湖山池金沢休養ゾーン(金沢ふれあい公園)多目的広場': '金沢ふれあい公園 多目的広場',
  '東尾久運動場 小広場(ゲートボール/グラウンド・ゴルフ場)': '東尾久運動場 小広場',
  '最上川中山緑地 ひまわりグラウンド・ゴルフ場': '最上川中山緑地 ひまわりグラウンド・ゴルフ場',
};
// ── 施設: 住所と電話番号の取り出し（資料の「場所」「連絡先」から）
const PHONE3 = /(0\d{1,4})[-(（]?(\d{1,4})[-)）]?(\d{3,4})/;
function detailOf(r, code) {
  let address = norm(r['場所'] ?? '').trim();
  address = address.replace(/[（(][^）)]*$/, '').replace(/\s+/g, ' ').trim();
  if (address && !/[0-9]|地内|地先|番地/.test(address)) address = '';
  if (address && !/[都道府県]/.test(address.slice(0, 5))) address = pref(code) + address;
  if (address.length > 80 || /[@＠]|https?:/.test(address)) address = '';
  const c = norm(r['連絡先'] ?? '');
  const m = c.match(PHONE3);
  const phone = m ? `${m[1]}-${m[2]}-${m[3]}` : '';
  const contact = Boolean(phone) && /[^\d\s\-()（）]/.test(c.replace(PHONE3, '').replace(/[（(][^）)]*[)）]/g, '').trim()); // 番号の前に課・窓口の名前があれば、窓口の番号
  return { address: address || null, phone: phone || null, contact };
}

// ── イベント: 載せるものの開催日（[コード, 名前の先頭, 日付または {dates}, 追加の指定]）。年のない行は、曜日が合う年・年度から（曜日が合わなければ載せない）
const EV = [
  ['02210', '国スポ公開競技', ['2026-09-26', '2026-09-27']],
  ['03209', '日形地区', '2026-10-25'],
  ['04214', '第20回東松島市', '2026-11-14'],
  ['05212', '健幸まちづくり', '2026-10-25'],
  ['06201', '第18回地区親善', '2026-10-11'],
  ['07203', '第45回郡山市老人クラブ', '2026-06-11'], ['07203', '第46回郡山市老人クラブ', '2026-10-20'], ['07203', '第41回東部地区スポーツ大会', '2026-06-28'],
  ['08214', '第46回高萩市民', '2026-11-04'], ['08222', 'はまなす公民館', '2026-06-23'], ['08224', '守谷市グラウンドゴルフ大会', '2026-09-27', { cancelled: true }],
  ['10206', '第34回沼田市民', '2026-10-22'],
  ['10209', '第35回藤岡市民春季', '2026-05-17'], ['10209', '第17回藤岡市長杯', '2026-06-10'], ['10209', '第57回藤岡市民総合体育大会', '2026-10-18'],
  ['10464', '第34回町民グラウンドゴルフ大会', '2026-09-26'], ['10464', '春季GG大会', '2026-04-02'],
  ['11222', '第39回グラウンド・ゴルフ大会', '2026-11-17'],
  ['11239', '第40回入西地区', '2026-11-07'], ['11239', '第39回入西地区', '2026-05-16'],
  ['12232', '第34回白井市', '2026-11-14'],
  ['13102', 'グラウンドゴルフ・ペタンク', '2026-05-21'],
  ['13119', '令和8年度シニアグラウンド・ゴルフ大会', '2026-10-20'],
  ['13122', '区民秋季グラウンド・ゴルフ大会', '2026-11-25'],
  ['13206', 'グラウンドゴルフの集い', { dates: ['2026-11-04', '2026-11-08', '2026-11-18'] }], ['13206', 'グラウンドゴルフ大会(押立', '2026-10-17'], ['13206', 'グラウンドゴルフ大会(四谷', '2026-11-28'],
  ['13223', '令和8年度心身障害者', '2026-09-12'], ['13225', 'グラウンドゴルフ講習会', '2026-11-12'],
  ['14402', '清川村グラウンド・ゴルフ大会', '2026-06-27', { cancelled: true }],
  ['16201', '第25回富山市民', '2026-10-18'], ['16202', '第21回高岡市民', '2026-06-21'],
  ['19364', '町民グラウンド・ゴルフ大会', '2026-10-18'],
  ['22130', '第19回健康福祉祭', '2026-04-02'], ['22206', '第14回三島市長杯', '2026-11-17'], ['22342', '第27回町民グラウンドゴルフ大会', '2026-10-17'],
  ['23100', '第12回千種区民', '2025-11-30'], ['23100', '第35回北区', '2026-05-16'], ['23100', '第34回学区対抗', '2026-06-07'], ['23100', '第36回天白区', '2026-05-20'], ['23100', '第33回緑区', '2026-04-18'],
  ['23207', '市民交流グラウンド・ゴルフ大会', '2026-05-10'], ['23228', '第30回市民グラウンドゴルフ大会', '2026-11-15'],
  ['24205', '第63回桑名市民', '2026-10-11'],
  ['26465', '野田川森林公園', '2026-11-23'], ['27202', 'スポーツ体験会', '2026-06-21'], ['27212', '八尾市GG協会', '2026-12-08'],
  ['28202', 'グラウンド・ゴルフ月例大会', { dates: ['2026-10-26', '2026-11-20', '2026-12-17'] }],
  ['31372', '第4回 あつまらいや北条', '2026-09-05'], ['31384', '日吉津村グラウンドゴルフ大会', '2026-06-20', { cancelled: true }],
  ['33663', '第11回久米南町', '2026-11-07'], // 福山市の沼隈GG交歓会（2026-11-21）は、元のページが削除されていた（404、2026-11-26に確認）ので載せない
  
  ['40203', '障害者ふれあいスポーツ', '2026-10-18'], ['40213', '第36回いきいき健康づくり', '2026-10-15'], ['40383', 'グラウンドゴルフ大会(岡垣町', '2026-06-21'],
  ['44203', '第6回「いつも心に交通安全」', '2026-10-27'], ['45205', '新市誕生20周年', '2026-11-13'], ['46203', '親子でグラウンド・ゴルフ体験', '2026-06-28'], ['46221', '高齢者学級合同', '2026-11-06'],
];
export const SKIPPED_EVENTS = '資料が http（喜界町・むつ市・取手市・笠松町・彦根市・湯梨浜町・徳之島町・播磨町）／1年以上前（沼田市・館山市・伊豆市・泉南市・播磨町野添・鹿島市・鹿屋市・名古屋市の昨年分）／曜日が合わない（野々市市の2つ・大刀洗町）／同窓会のチャリティ（南風原町）／放課後子ども教室（松前町）／月・日が確定できない・継続の教室・信頼度が低い／延期で新しい日が分からない（松山市）／元のページが404（福山市の沼隈GG交歓会）／指導員の養成講習（葛飾区）／成績表のページで大会名にGGがない（八潮市）';

const weekdayOk = (text, iso) => { const m = text.match(/[（(]([月火水木金土日])/); if (!m) return true; return '日月火水木金土'[new Date(iso + 'T00:00:00Z').getUTCDay()] === m[1]; };
// 同じ市区町村にすでにある似た名前の施設は足さない
const muniOf = new Map(places.places.map((p) => [p.municipality_code, p.municipality]));
for (const r of fresh) muniOf.set(r['自治体コード'], r['自治体名']);
const simp = (s, code) => { let t = norm(s).replace(/[\s・･\-()]/g, '').replace(/グランド/g, 'グラウンド').replace(/グラウンドゴルフ場|グラウンドゴルフ/g, 'GG'); const m = muniOf.get(code); if (m) t = t.split(m).join('').split(m.replace(/[市区町村]$/, '')).join(''); return t; };
const existingNames = new Map();
const addName = (code, n) => existingNames.set(code, [...(existingNames.get(code) ?? []), simp(n, code)]);
for (const p of places.places) if (p.kind === 'facility') addName(p.municipality_code, p.name);
for (const d of details.details) addName(d.municipality_code, d.name);
const similar = (code, name) => { const parts = [name, ...(norm(name).match(/[（(]([^（）()]+)[)）]/g) ?? []).map((x) => x.slice(1, -1))].map((x) => simp(x, code)); const a = parts[0]; return (existingNames.get(code) ?? []).some((b) => parts.some((a) => a.length >= 3 && b.length >= 3 && (a === b || a.includes(b) || b.includes(a)))) || (existingNames.get(code) ?? []).some((b) => a.length >= 3 && b.length >= 3 && (a === b || a.includes(b) || b.includes(a))); };

// 1) 施設
const haveUrlName = new Set(places.places.map((p) => `${p.source_url}|${p.name}`));
const haveName = new Set(places.places.filter((p) => p.kind === 'facility').map((p) => `${p.municipality_code}|${p.name}`));
const haveDetail = new Set(details.details.map((d) => `${d.municipality_code}|${norm(d.name).replace(/\s+/g, '')}`));
let addF = 0, dupF = 0, skipF = 0, addD = 0;
const usedSkip = new Set();
for (const r of fresh.filter((r) => r['種類'] === '施設')) {
  const code = r['自治体コード'], csvName = r['名称'], url = r[URLCOL], muni = r['自治体名'];
  const sk = Object.keys(SKIP_FAC).find((k) => k.startsWith(code + '|') && csvName.startsWith(k.slice(6)));
  if (sk) { usedSkip.add(sk); skipF++; continue; }
  if (!/^https:\/\//.test(url) || r['信頼度'] === 'low') { skipF++; continue; }
  let name = RENAME[csvName] ?? csvName;
  name = norm(name === csvName ? csvName : name);
  name = name.replace(/[（(]施設概要[)）]$/, '').replace(new RegExp('[（(][^（）()]*' + muni + '[^（）()]*[)）]$'), '').replace(new RegExp('^' + muni + '\\s+'), '').replace(/[（(](グラウンド[・]?ゴルフ場)[)）]$/, '$1').trim();
  if (haveUrlName.has(`${url}|${name}`) || haveName.has(`${code}|${name}`) || similar(code, name)) { dupF++; continue; }
  places.places.push({ kind: 'facility', name, prefecture: pref(code), municipality: muni, municipality_code: code, source_url: url, surveyed_at: NOW, flags: [] });
  haveName.add(`${code}|${name}`); haveUrlName.add(`${url}|${name}`); addName(code, name); addF++;
  const dt = detailOf(r, code);
  if ((dt.address || dt.phone) && !haveDetail.has(`${code}|${norm(name).replace(/\s+/g, '')}`)) {
    details.details.push({ municipality_code: code, municipality: muni, prefecture: pref(code), name, address: dt.address, phone: dt.phone, phone_is_contact: dt.contact, source_kind: 'municipal', source_url: url, fetched_at: NOW }); addD++;
  }
}
for (const k of Object.keys(SKIP_FAC)) if (!usedSkip.has(k)) console.error('SKIP_FAC に対応する行が見つかりません: ' + k);
places.places.sort((a, b) => a.municipality_code.localeCompare(b.municipality_code) || (a.name ?? '￿').localeCompare(b.name ?? '￿'));

// 2) イベント
const haveId = new Set(events.events.map((e) => e.id));
const haveKey = new Set(events.events.map((e) => `${e.municipality_code}|${coreKey(e.name)}|${e.start ?? ''}`));
const haveDay = new Set(events.events.map((e) => `${e.municipality_code}|${e.start ?? ''}`));
let addE = 0, dupE = 0;
const seenRow = new Set();
for (const [code, prefix, spec, opt = {}] of EV) {
  const cands = fresh.filter((x) => x['種類'] === 'イベント' && x['自治体コード'] === code && x['名称'].startsWith(prefix));
  if (!cands.length) { console.error('CSVに行がありません: ' + code + ' ' + prefix); process.exit(1); }
  const r = cands[0];
  if (new Set(cands.map((x) => x['名称'])).size > 1) { console.error('名前の先頭が複数の行に当たります: ' + code + ' ' + prefix + ' ' + [...new Set(cands.map((x) => x['名称']))].join(' / ')); process.exit(1); }
  const url = r[URLCOL];
  if (!/^https:\/\//.test(url)) { console.log('資料が http なので載せない:', r['自治体名'], r['名称']); continue; }
  const list = spec.dates ? spec.dates.map((d) => [d, d]) : Array.isArray(spec) ? [[spec[0], spec[1]]] : [[spec, spec]];
  for (const [start, end] of list) {
    if (!spec.dates && !weekdayOk(r['日付'], start)) { console.log('曜日が合わないので載せない:', r['自治体名'], r['名称'], start, r['日付'].slice(0, 28)); continue; }
    const t = tidyEventName(r['名称']);
    const name = (t.name || r['名称']).replace(/[（(]/g, '（').replace(/[)）]/g, '）').replace(new RegExp('（' + r['自治体名'] + '）', 'g'), '').trim();
    const id = `M-${hash8(`${url}|${coreKey(name)}|${start}`)}`;
    if (haveId.has(id) || haveKey.has(`${code}|${coreKey(name)}|${start}`) || haveDay.has(`${code}|${start}`)) { dupE++; console.log('すでにある（イベント）:', r['自治体名'], name, start); continue; }
    const get = (label) => r['内容'].match(new RegExp(label + ':\\s*([^/]+)'))?.[1]?.trim() ?? null;
    const cm = r['連絡先'].match(/^(.*?)\s*(\d{2,4}-\d{2,4}-\d{3,4})?\s*$/);
    const contact = tidyContact(cm?.[1] ?? '', cm?.[2] ?? '');
    const days = (Date.parse(end) - Date.parse(start)) / 86400e3;
    events.events.push({
      id, prefecture: pref(code), municipality_code: code, municipality: r['自治体名'], name, kind: 'gg', start, end, date_kind: days > 10 ? 'range' : 'exact',
      venue: tidyVenue(r['場所'].replace(/[（(][^）)]*$/, '')) || null, organizer: tidyOrganizer(get('主催') ?? '') || null, target: tidyTarget((get('対象') ?? '').replace(/[（(][^）)]*参加[^）)]*[）)]/g, '').trim()) || null, fee: tidyFee(get('参加費') ?? '') || null, deadline: null,
      contact_dept: contact.dept, contact_phone: contact.phone, cancelled: Boolean(opt.cancelled), postponed: false, finished_note: /結果|報告|様子|開催済み/.test(r['備考'] + r['根拠']), source_url: url, extracted_at: NOW,
    });
    haveKey.add(`${code}|${coreKey(name)}|${start}`); haveDay.add(`${code}|${start}`); addE++;
  }
}
events.source_extracted_to = NOW;
const w = (p, o) => writeFileSync(join(root, p), JSON.stringify(o, null, 2) + '\n');
w('data/places/places.json', places); w('data/places/details.json', details); w('data/events/municipal.json', events);
console.log({ 施設追加: addF, 施設重複: dupF, 施設見送り: skipF, 住所電話追加: addD, イベント追加: addE, イベント重複: dupE, 団体の行は足さない: fresh.filter((r) => r['種類'] === '団体').length });
