// 使い方: node scripts/places/clean-details.mjs <詳細CSV> [--enriched] [--fetched=<ISO日時>] [--out=<出力JSON>] [--review=<確認用CSV>]
// --enriched: 補完済みの統合CSV（列: 都道府県,市区町村コード,市区町村,施設名,住所,電話番号,問い合わせ先,問い合わせ電話,元ページ,情報補完,重複統合）を読む。
//   既存の details.json にある同じ施設・同じ内容のものは、取得日を引き継ぐ（新しい・変わったものだけ --fetched の日時にする）
// 住所・電話番号の詳細CSVから、載せてよい項目だけを取り出して data/places/details.json に書く。
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv, buildDetails, enrichedToRows, normKey, isGenericName } from './lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const flag = (k) => args.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const input = args.find((a) => !a.startsWith('--'));
if (!input) { console.error('使い方: node scripts/places/clean-details.mjs <詳細CSV> [--out=…] [--review=…]'); process.exit(1); }

const csvRows = parseCsv(readFileSync(input, 'utf8'));
const places = JSON.parse(readFileSync(join(root, 'data', 'places', 'places.json'), 'utf8')).places;
// 住所が別の市区町村から始まるかの判定に、すでに載せている市区町村の名前も使う
const known = places.map((p) => p.municipality);
const enriched = args.includes('--enriched');
const outPath = flag('out') || join(root, 'data', 'places', 'details.json');
let rows = csvRows;
if (enriched) {
  // 市区町村コードが空の行は、すでに載せているデータの（都道府県, 市区町村）から補う
  const lookup = new Map(places.map((p) => [`${p.prefecture}|${p.municipality}`, p.municipality_code]));
  rows = enrichedToRows(csvRows, lookup, flag('fetched') || new Date().toISOString());
}
const result = buildDetails(rows, known);
let { details } = result;
const { excluded } = result;
if (enriched) {
  let previous = [];
  try { previous = JSON.parse(readFileSync(outPath, 'utf8')).details; } catch { /* 初回 */ }
  const prev = new Map(previous.map((d) => [`${d.municipality_code}|${normKey(d.name)}`, d]));
  details = details.map((d) => {
    const o = prev.get(`${d.municipality_code}|${normKey(d.name)}`);
    return o && o.address === d.address && o.phone === d.phone && o.source_url === d.source_url && (o.source_kind ?? 'municipal') === d.source_kind ? { ...d, fetched_at: o.fetched_at } : d;
  });
  // 今回のCSVに入っていない、すでに載せていた施設は残す（取り込みで減らさない）
  const have = new Set(details.map((d) => `${d.municipality_code}|${normKey(d.name)}`));
  // 名前を直した行は、直す前の名前で載せていた施設を置き換える（古い名前を残さない）
  const renamed = new Set(rows.filter((r) => r.original_name && r.original_name !== r.facility_name).map((r) => `${r.municipality_code}|${normKey(r.original_name)}`));
  for (const o of previous) {
    const k = `${o.municipality_code}|${normKey(o.name)}`;
    if (!have.has(k) && !renamed.has(k) && !isGenericName(o.name)) details.push({ source_kind: 'municipal', ...o });
  }
  details.sort((a, b) => a.municipality_code.localeCompare(b.municipality_code) || a.name.localeCompare(b.name));
}
const out = outPath;
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({ generated_at: new Date().toISOString(), count: details.length, details }, null, 2) + '\n');
const review = flag('review');
if (review) {
  const q = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
  const lines = ['\uFEFF区分,都道府県,市区町村,施設名,住所,電話,補足,除外の理由,元ページ'];
  for (const d of details) lines.push(['載せる', d.prefecture, d.municipality, d.name, d.address ?? '', d.phone ?? '', [d.phone_is_contact ? '電話は問い合わせ先' : '', d.source_kind === 'web' ? 'Web補完' : ''].filter(Boolean).join('・'), '', d.source_url].map(q).join(','));
  for (const e of excluded) lines.push(['除外', '', e.municipality, e.name, '', '', '', e.reason, e.url].map(q).join(','));
  writeFileSync(review, lines.join('\n') + '\n');
}
console.log(`入力 ${csvRows.length}行 → 載せる ${details.length}件（電話あり ${details.filter((d) => d.phone).length}）/ 除外 ${excluded.length}行`);
console.log(`市区町村 ${new Set(details.map((d) => d.municipality_code)).size}、都道府県 ${new Set(details.map((d) => d.prefecture)).size}`);
