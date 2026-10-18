// 使い方: node scripts/places/clean-places.mjs <調査CSV> [--out=<出力JSON>] [--review=<確認用CSV>]
// 調査CSVから、掲載できる事実項目だけを取り出して data/places/places.json に書く。確認用CSVには除外理由と印を出す。
import { readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv, buildPlaces } from './lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const flag = (k) => args.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const input = args.find((a) => !a.startsWith('--'));
if (!input) { console.error('使い方: node scripts/places/clean-places.mjs <調査CSV> [--out=…] [--review=…]'); process.exit(1); }

const rows = parseCsv(readFileSync(input, 'utf8'));
const { places, excluded } = buildPlaces(rows);
const out = flag('out') || join(root, 'data', 'places', 'places.json');
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({ generated_at: new Date().toISOString(), count: places.length, places }, null, 2) + '\n');

const review = flag('review');
if (review) {
  const q = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
  const lines = ['﻿区分,都道府県,市区町村,施設名,確認の印,元ページ'];
  for (const p of places) lines.push([p.kind === 'facility' ? '施設' : '一覧ページ', p.prefecture, p.municipality, p.name ?? '', p.flags.join(' / '), p.source_url].map(q).join(','));
  for (const e of excluded) lines.push(['除外', '', e.municipality, '', e.reason, e.url].map(q).join(','));
  writeFileSync(review, lines.join('\n') + '\n');
}
const kinds = places.reduce((m, p) => ((m[p.kind] = (m[p.kind] || 0) + 1), m), {});
console.log(`入力 ${rows.length}行 → 施設 ${kinds.facility || 0} / 一覧ページ ${kinds.listing || 0} / 除外 ${excluded.length}`);
console.log(`印あり ${places.filter((p) => p.flags.length).length}件、市区町村 ${new Set(places.map((p) => p.municipality_code)).size}`);
