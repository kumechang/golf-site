// 使い方: node scripts/places/clean-places.mjs <調査CSV> [--out=<出力JSON>] [--review=<確認用CSV>]
//   追加の調査（列: prefecture,municipality_code,municipality_name,page_title,page_url,matched_text,found_via,page_kind,facility_like_title,…）を今ある places.json に足すとき:
//   node scripts/places/clean-places.mjs <追加CSV> --append --surveyed=<取得日 YYYY-MM-DD> --review=<確認用CSV>
//   （追加CSVには match_count・surveyed_at の列がなく、found_via=event は「イベントのページを調べていて見つけた」の意味なので、読み替える）
// 調査CSVから、掲載できる事実項目だけを取り出して data/places/places.json に書く。確認用CSVには除外理由と印を出す。
import { existsSync, readFileSync, writeFileSync, mkdirSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv, buildPlaces } from './lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const flag = (k) => args.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const input = args.find((a) => !a.startsWith('--'));
if (!input) { console.error('使い方: node scripts/places/clean-places.mjs <調査CSV> [--out=…] [--review=…]'); process.exit(1); }

const append = args.includes('--append');
const surveyed = flag('surveyed');
if (append && !/^\d{4}-\d{2}-\d{2}$/.test(surveyed ?? '')) { console.error('--append には --surveyed=YYYY-MM-DD（CSVの取得日）が要ります'); process.exit(1); }
const out = flag('out') || join(root, 'data', 'places', 'places.json');
let rows = parseCsv(readFileSync(input, 'utf8'));
// 元ページが http のものは、https で開けると確かめたもの（check-https.mjs が作る）だけ置き換える
const httpsPath = join(root, 'data', 'places', 'https-upgrades.json');
const httpsMap = existsSync(httpsPath) ? JSON.parse(readFileSync(httpsPath, 'utf8')).upgrades ?? {} : {};
rows = rows.map((r) => (httpsMap[r.page_url] ? { ...r, page_url: httpsMap[r.page_url] } : r));
if (append) {
  // 追加CSVを、これまでの調査CSVと同じ形に読み替える。施設のページと分かっている行だけを使う
  rows = rows.map((r) => ({
    ...r,
    found_via: r.found_via === 'listing' || r.page_kind !== 'facility' ? 'listing' : 'facility',
    match_count: r.matched_text ? '1' : '0',
    in_title: '',
    surveyed_at: `${surveyed}T00:00:00Z`,
  }));
}
// 同じ文が同じ市区町村の多くのページに出ているときは、サイドメニューなどに出る語で、そのページの内容ではない可能性が高いので載せない
const menuExcluded = [];
if (append) {
  const count = new Map();
  for (const r of rows) count.set(`${r.municipality_code}|${r.matched_text}`, (count.get(`${r.municipality_code}|${r.matched_text}`) ?? 0) + 1);
  rows = rows.filter((r) => {
    if (r.matched_text && count.get(`${r.municipality_code}|${r.matched_text}`) >= 5) { menuExcluded.push({ url: r.page_url, municipality: r.municipality_name, reason: 'メニューなど、同じ文が多くのページに出る', title: r.page_title }); return false; }
    return true;
  });
}
let { places, excluded } = buildPlaces(rows);
excluded.push(...menuExcluded);
let newUrls = new Set();
if (append) {
  // すでに載せているもの（同じ元ページ、または同じ市区町村の同じ施設名）は足さない
  const prev = JSON.parse(readFileSync(out, 'utf8')).places;
  const urls = new Set(prev.map((p) => p.source_url));
  const names = new Set(prev.filter((p) => p.kind === 'facility').map((p) => `${p.municipality_code}|${p.name}`));
  const fresh = [];
  for (const p of places) {
    if (urls.has(p.source_url) || (p.kind === 'facility' && names.has(`${p.municipality_code}|${p.name}`))) { excluded.push({ url: p.source_url, municipality: p.municipality, reason: 'すでに載せている', title: p.name ?? '' }); continue; }
    fresh.push(p);
  }
  places = [...prev, ...fresh].sort((a, b) => a.municipality_code.localeCompare(b.municipality_code) || (a.name ?? '￿').localeCompare(b.name ?? '￿'));
  newUrls = new Set(fresh.map((p) => p.source_url));
  console.log(`追加 ${fresh.length}件（すでに載せているもの ${excluded.filter((e) => e.reason === 'すでに載せている').length}件は除く）`);
}
mkdirSync(dirname(out), { recursive: true });
writeFileSync(out, JSON.stringify({ generated_at: new Date().toISOString(), count: places.length, places }, null, 2) + '\n');

const review = flag('review');
if (review) {
  const q = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
  const lines = ['﻿区分,都道府県,市区町村,施設名,確認の印,元ページ,今回追加'];
  for (const p of places) lines.push([p.kind === 'facility' ? '施設' : '一覧ページ', p.prefecture, p.municipality, p.name ?? '', p.flags.join(' / '), p.source_url, newUrls.has(p.source_url) ? '追加' : ''].map(q).join(','));
  for (const e of excluded) lines.push(['除外', '', e.municipality, '', e.reason, e.url].map(q).join(','));
  writeFileSync(review, lines.join('\n') + '\n');
}
const kinds = places.reduce((m, p) => ((m[p.kind] = (m[p.kind] || 0) + 1), m), {});
console.log(`入力 ${rows.length}行 → 施設 ${kinds.facility || 0} / 一覧ページ ${kinds.listing || 0} / 除外 ${excluded.length}`);
console.log(`印あり ${places.filter((p) => p.flags.length).length}件、市区町村 ${new Set(places.map((p) => p.municipality_code)).size}`);
