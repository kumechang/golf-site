// 使い方: node scripts/places/clean-details.mjs <詳細CSV> [--out=<出力JSON>] [--review=<確認用CSV>]
// 住所・電話番号の詳細CSVから、載せてよい項目だけを取り出して data/places/details.json に書く。
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv, buildDetails } from './lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const flag = (k) => args.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const input = args.find((a) => !a.startsWith('--'));
if (!input) { console.error('使い方: node scripts/places/clean-details.mjs <詳細CSV> [--out=…] [--review=…]'); process.exit(1); }

const rows = parseCsv(readFileSync(input, 'utf8'));
// 住所が別の市区町村から始まるかの判定に、すでに載せている市区町村の名前も使う
const known = JSON.parse(readFileSync(join(root, 'data', 'places', 'places.json'), 'utf8')).places.map((p) => p.municipality);
const { details, excluded } = buildDetails(rows, known);
const out = flag('out') || join(root, 'data', 'places', 'details.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({ generated_at: new Date().toISOString(), count: details.length, details }, null, 2) + '\n');
const review = flag('review');
if (review) {
  const q = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
  const lines = ['\uFEFF区分,都道府県,市区町村,施設名,住所,電話,除外の理由,元ページ'];
  for (const d of details) lines.push(['載せる', d.prefecture, d.municipality, d.name, d.address, d.phone ?? '', d.phone_is_contact ? '電話は問い合わせ先と同じ' : '', d.source_url].map(q).join(','));
  for (const e of excluded) lines.push(['除外', '', e.municipality, e.name, '', '', e.reason, e.url].map(q).join(','));
  writeFileSync(review, lines.join('\n') + '\n');
}
console.log(`入力 ${rows.length}行 → 載せる ${details.length}件（電話あり ${details.filter((d) => d.phone).length}）/ 除外 ${excluded.length}行`);
console.log(`市区町村 ${new Set(details.map((d) => d.municipality_code)).size}、都道府県 ${new Set(details.map((d) => d.prefecture)).size}`);
