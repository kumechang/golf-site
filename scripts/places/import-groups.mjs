// 使い方: node scripts/places/import-groups.mjs [data/places/pdf-ai/2026-11-26-all.csv]
// AIが自治体の資料から取り出したCSV（種類=団体）から、県ページの「市区町村の資料に載っていた団体」の節に載せるデータ data/places/groups.json を作る。
// 載せる項目: 団体名・種類・活動の場所・活動日の文・元の資料のURL・資料の年度（古いときだけ表示）。代表者名・電話・メールは載せない（CSVにあっても使わない）。
// 載せる基準: ①信頼度が低くない ②元の資料が https ③活動の場所か活動日の記載がある、または、古い資料でも名簿だけでもない。
// 何度実行しても同じ結果（すでにある団体は、同じ市区町村・同じ名前なら足さない）。CSVは累計なので、新しい週のCSVを渡せば、新しい団体だけ足される。
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from './lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const csvPath = process.argv[2] ?? join(root, 'data/places/pdf-ai/2026-11-26-all.csv');
const outPath = join(root, 'data/places/groups.json');
const URLCOL = '資料のURL(PDFまたはHTMLページ)';
const NOW = process.env.IMPORT_NOW ?? new Date().toISOString().slice(0, 10) + 'T00:00:00Z';
const norm = (s) => s.normalize('NFKC');
const rows = parseCsv(readFileSync(csvPath, 'utf8')).filter((r) => r['種類'] === '団体');
const places = JSON.parse(readFileSync(join(root, 'data/places/places.json'), 'utf8')).places;
const prefOf = new Map(places.map((p) => [p.municipality_code.slice(0, 2), p.prefecture]));
const prev = existsSync(outPath) ? JSON.parse(readFileSync(outPath, 'utf8')) : { groups: [] };
const key = (code, name) => `${code}|${norm(name).replace(/[\s・･\-()]/g, '').replace(/グランド/g, 'グラウンド')}`;
const have = new Set(prev.groups.map((g) => key(g.municipality_code, g.name)));

const PERSONAL = /会長|代表|氏名|副会長|事務局長|様|さん|携帯|メール|@/;
const STALE = /古い|過去|令和2年|令和元|平成|2023|2024/;
const ROSTER = /加盟団体|登録団体|名簿|減免|定期利用|一覧/;
const SCHED = /[月火水木金土日]曜|毎週|毎日|\d+:\d+|第\d|毎月|月例|\d+月/;
const kindOf = (name, head) => (/協会/.test(head + name) ? '協会' : /連盟/.test(head + name) ? '連盟' : /同好会|愛好会/.test(head + name) ? '同好会' : /クラブ/.test(head + name) ? 'クラブ' : null);
const yearOf = (t) => {
  const m = norm(t).match(/(令和(?:元|\d+)年度?|平成\d+年度?|20\d\d年(?:度|\d+月)?)/);
  return m ? m[1] : null;
};
const isOldYear = (y) => { if (!y) return false; const n = norm(y); let w = null; const r = n.match(/令和(元|\d+)/); const h = n.match(/平成(\d+)/); const g = n.match(/(20\d\d)/); if (r) w = 2018 + (r[1] === '元' ? 1 : Number(r[1])); else if (h) w = 1988 + Number(h[1]); else if (g) w = Number(g[1]); return w !== null && w < 2025; };

const out = [...prev.groups];
let added = 0, skipped = 0, dup = 0;
for (const r of rows) {
  const code = r['自治体コード'], name0 = r['名称'].replace(/\(/g, '（').replace(/\)/g, '）').trim(), url = r[URLCOL];
  const note = (r['備考'] ?? '') + (r['根拠'] ?? '');
  const head = (r['内容'] ?? '').split(' / ')[0];
  const sched0 = (r['内容'] ?? '').includes(' / ') ? r['内容'].split(' / ').slice(1).join('。').trim() : '';
  const place = norm(r['場所'] ?? '').replace(/\s+/g, ' ').trim();
  let schedule = sched0 && !PERSONAL.test(sched0) && !/https?:|@|0\d{1,4}-\d{1,4}-\d{3,4}/.test(sched0) ? sched0.replace(/\s+/g, ' ') : '';
  if (schedule.length > 100) schedule = '';
  if (!SCHED.test(schedule)) schedule = schedule && /毎|月|曜|時|:/.test(schedule) ? schedule : '';
  const hasInfo = Boolean(place) || Boolean(schedule);
  // 資料の年度は、「設立」「発足」などの団体の沿革の文を除いて取り出す（設立年を資料の年度と取り違えない）
  const noteForYear = note.split(/[。]/).filter((t) => !/設立|発足|創立|結成|開設|会員\d|オープン/.test(t)).join('。');
  const year = yearOf(noteForYear);
  const stale = STALE.test(noteForYear) || isOldYear(year);
  if (r['信頼度'] === 'low' || !/^https:\/\//.test(url) || PERSONAL.test(name0) || name0.length > 40) { skipped++; continue; }
  if (!(hasInfo || !(stale || ROSTER.test(note)))) { skipped++; continue; }
  if (stale && !year && !hasInfo) { skipped++; continue; }
  if (have.has(key(code, name0))) { dup++; continue; }
  have.add(key(code, name0));
  const prefecture = prefOf.get(code.slice(0, 2));
  if (!prefecture) { console.error('都道府県が分かりません: ' + code); process.exit(1); }
  out.push({ id: `G-${code}-${String(out.length + 1).padStart(3, '0')}`, prefecture, municipality: r['自治体名'], municipality_code: code, name: name0, kind: kindOf(name0, head), place: place && !PERSONAL.test(place) && !/要項|抜粋|資料/.test(place) && place.length <= 60 ? place.replace(/[★☆]/g, '') : null, schedule: schedule || null, source_url: url, source_year: stale ? (year ?? null) : null, stale: Boolean(stale && year), surveyed_at: NOW });
  added++;
}
out.sort((a, b) => a.municipality_code.localeCompare(b.municipality_code) || a.name.localeCompare(b.name, 'ja'));
writeFileSync(outPath, JSON.stringify({ generated_at: NOW, groups: out }, null, 2) + '\n');
console.log({ 団体の行: rows.length, 追加: added, すでにある: dup, 見送り: skipped, 合計: out.length, 市区町村: new Set(out.map((g) => g.municipality_code)).size, 都道府県: new Set(out.map((g) => g.prefecture)).size });
