// 使い方: node scripts/places/weekly-update.mjs <施設の詳細CSV（週ごとの取り直し）> --surveyed=YYYY-MM-DD [--review-dir=<確認用ファイルを置く場所>]
// 先に: node scripts/places/check-https.mjs <同じCSV>（http のページが https で開けるか。開けたものだけ https-upgrades.json に残る）
// 週ごとに取り直した施設の詳細CSV（列: prefecture, municipality_code, municipality_name, facility_name, address, phone, inquiry_dept, inquiry_phone,
// page_title, page_url, multi_facility, keyword_in_item, matched_text, …）を、いま載せているデータに「足す」。置き換えない。
//  1. 新しい元ページ（places.json にないURL）を、clean-places.mjs --append で足す（同じ文が5ページ以上に出るメニューの語などは、そちらの規則で除く）
//  2. 住所・電話番号（details.json）: 施設の項目にグラウンドゴルフの語がある行（keyword_in_item=1）か、1施設だけのページの行だけを使い、
//     新しい施設を足す。すでにある施設で、住所か電話番号が空だったものは、取れた値で埋める。値が食い違うものは、いまの値を残す（再調査用に一覧を出す）。
//     イベントや記事の題名らしい名前・付帯施設などは足さない。
// 今週のCSVに無いものは、消えたのか取れなかっただけなのか分からないので、残す。
import { readFileSync, writeFileSync, mkdirSync, mkdtempSync } from 'node:fs';
import { spawnSync } from 'node:child_process';
import { tmpdir } from 'node:os';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from './lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const flag = (k) => args.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const input = args.find((a) => !a.startsWith('--'));
const surveyed = flag('surveyed');
if (!input || !/^\d{4}-\d{2}-\d{2}$/.test(surveyed ?? '')) { console.error('使い方: node scripts/places/weekly-update.mjs <CSV> --surveyed=YYYY-MM-DD [--review-dir=…]'); process.exit(1); }
const dir = flag('review-dir') || mkdtempSync(join(tmpdir(), 'places-weekly-'));
mkdirSync(dir, { recursive: true });

const q = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
const writeCsv = (path, header, rows) => writeFileSync(path, '﻿' + [header.join(','), ...rows.map((r) => header.map((h) => q(r[h])).join(','))].join('\n') + '\n');
const readJson = (p) => JSON.parse(readFileSync(join(root, p), 'utf8'));
const run = (script, a) => {
  const r = spawnSync(process.execPath, [join(root, 'scripts', 'places', script), ...a], { encoding: 'utf8' });
  process.stdout.write(r.stdout);
  if (r.status !== 0) { process.stderr.write(r.stderr); process.exit(r.status ?? 1); }
};

const httpsMap = readJson('data/places/https-upgrades.json').upgrades ?? {};
const rows = parseCsv(readFileSync(input, 'utf8').replace(/^﻿/, '')).map((r) => ({ ...r, page_url: httpsMap[r.page_url] ?? r.page_url }));
const single = (r) => r.keyword_in_item === '1' || !r.multi_facility;

// 1. 新しい元ページ
const known = new Set(readJson('data/places/places.json').places.map((p) => p.source_url));
const byUrl = new Map();
for (const r of rows) if (!known.has(r.page_url)) byUrl.set(r.page_url, [...(byUrl.get(r.page_url) ?? []), r]);
const pageHeader = ['prefecture', 'municipality_code', 'municipality_name', 'page_title', 'page_url', 'matched_text', 'found_via', 'source', 'facility_like_title', 'new_municipality', 'page_kind', 'survey_route'];
const pages = [...byUrl.entries()].map(([url, rs]) => {
  const r = rs[0];
  const facility = rs.length === 1 && single(r) && !r.multi_facility && r.facility_name && r.facility_name !== '詳細情報';
  return { prefecture: r.prefecture, municipality_code: r.municipality_code, municipality_name: r.municipality_name, page_title: r.page_title, page_url: url, matched_text: r.matched_text, found_via: 'facility', source: 'weekly', facility_like_title: '', new_municipality: '', page_kind: facility ? 'facility' : 'listing', survey_route: r.extract_route };
});
console.log(`新しい元ページの候補: ${pages.length}件`);
if (pages.length) {
  const pagesCsv = join(dir, 'pages-append.csv');
  writeCsv(pagesCsv, pageHeader, pages);
  run('clean-places.mjs', [pagesCsv, '--append', `--surveyed=${surveyed}`, `--review=${join(dir, 'places-review.csv')}`]);
}

// 2. 住所・電話番号
const detailRows = rows.filter(single);
const detailHeader = Object.keys(rows[0]);
const filtered = join(dir, 'details-filtered.csv');
writeCsv(filtered, detailHeader, detailRows);
const fetched = `${surveyed}T00:00:00Z`;
const fresh = join(dir, 'details.fresh.json');
run('clean-details.mjs', [filtered, `--out=${fresh}`, `--fetched=${fetched}`]);
const NOT_FACILITY = /体験会|交歓会|大会|誕生|付帯施設|武道館|使用料|利用料/;
const cur = readJson('data/places/details.json').details;
const next = JSON.parse(readFileSync(fresh, 'utf8')).details;
const key = (d) => `${d.source_url}|${d.name}`;
const byKey = new Map(cur.map((d) => [key(d), d]));
const byMuni = new Set(cur.map((d) => `${d.municipality_code}|${d.name}`));
let added = 0, filled = 0;
const skipped = [], conflicts = [];
for (const d of next) {
  const old = byKey.get(key(d));
  if (old) {
    let f = false;
    for (const k of ['address', 'phone']) {
      if (!old[k] && d[k]) { old[k] = d[k]; f = true; }
      else if (old[k] && d[k] && old[k] !== d[k]) conflicts.push({ 施設: `${d.municipality} ${d.name}`, 項目: k, いま: old[k], 今週: d[k] });
    }
    if (f) { old.fetched_at = fetched; filled++; }
    continue;
  }
  if (byMuni.has(`${d.municipality_code}|${d.name}`)) continue; // 同じ市区町村の同じ施設名（別ページ）は足さない
  if (NOT_FACILITY.test(d.name)) { skipped.push({ 施設: `${d.municipality} ${d.name}`, 理由: '施設ではない可能性（イベント・記事の題名、付帯施設など）' }); continue; }
  cur.push(d); byMuni.add(`${d.municipality_code}|${d.name}`); added++;
}
cur.sort((a, b) => a.municipality_code.localeCompare(b.municipality_code) || a.name.localeCompare(b.name));
writeFileSync(join(root, 'data/places/details.json'), JSON.stringify({ generated_at: new Date().toISOString(), count: cur.length, details: cur }, null, 2) + '\n');
writeFileSync(join(dir, 'details-skipped-and-conflicts.json'), JSON.stringify({ 足さなかった: skipped, 値が食い違った: conflicts }, null, 2) + '\n');
console.log({ 住所電話_追加: added, 住所電話_空欄を補った: filled, 足さなかった: skipped.length, 値が食い違った_いまの値を残した: conflicts.length, 確認用ファイル: dir });
