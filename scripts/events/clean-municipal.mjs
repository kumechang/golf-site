// 使い方: node scripts/events/clean-municipal.mjs <CSV> [<CSV>...] [--out=<出力JSON>] [--review=<除いたものの確認用CSV>]
// 市区町村のイベントCSVから、載せてよい項目だけを data/events/municipal.json に書く。元のCSV（市区町村のページの文字を含む）はリポジトリに入れない。
import { readFileSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from '../places/lib.mjs';
import { buildMunicipalEvents } from './municipal-lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const flag = (k) => args.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const inputs = args.filter((a) => !a.startsWith('--'));
if (!inputs.length) { console.error('使い方: node scripts/events/clean-municipal.mjs <CSV>... [--out=…] [--review=…]'); process.exit(1); }

const rows = inputs.flatMap((f) => parseCsv(readFileSync(f, 'utf8').replace(/^﻿/, '')));
const places = JSON.parse(readFileSync(join(root, 'data', 'places', 'places.json'), 'utf8')).places;
const knownPrefectures = [...new Set(places.map((p) => p.prefecture))];
const built = buildMunicipalEvents(rows, { knownPrefectures });
// 運営者の判断で載せないもの（理由つき）
const overrides = JSON.parse(readFileSync(join(root, 'data', 'events', 'municipal-overrides.json'), 'utf8')).exclude ?? {};
const events = built.events.filter((e) => !(e.id in overrides));
const excluded = [...built.excluded, ...built.events.filter((e) => e.id in overrides).map((e) => ({ reason: `運営者の判断: ${overrides[e.id]}`, prefecture: e.prefecture, municipality: e.municipality, name: e.name, date_text: e.start ?? '', url: e.source_url }))];
const stats = { ...built.stats, kept: events.length, dated: events.filter((e) => e.start).length, undated: events.filter((e) => !e.start).length, excluded: excluded.length };
const extracted = rows.map((r) => r.extracted_at).filter(Boolean).sort();
const out = { generated_at: new Date().toISOString(), source_extracted_from: extracted[0] ?? null, source_extracted_to: extracted.at(-1) ?? null, events };
writeFileSync(flag('out') || join(root, 'data', 'events', 'municipal.json'), JSON.stringify(out, null, 2) + '\n');
console.log(stats);
const why = {};
for (const e of excluded) why[e.reason] = (why[e.reason] ?? 0) + 1;
console.log('除いた理由:', why);
if (flag('review')) {
  const esc = (s) => `"${String(s ?? '').replace(/"/g, '""')}"`;
  writeFileSync(flag('review'), '﻿理由,都道府県,市区町村,名前,日付の文章,元ページ\n' + excluded.map((e) => [e.reason, e.prefecture, e.municipality, e.name, e.date_text, e.url].map(esc).join(',')).join('\n') + '\n');
}
