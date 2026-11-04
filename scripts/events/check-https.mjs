// 使い方: node scripts/events/check-https.mjs <CSV>... [--out=data/events/https-upgrades.json]
// 元ページが http のイベントのうち、載せる条件を満たすものについて、同じURLを https で開けるかを確かめ、
// 開けたものだけを data/events/https-upgrades.json に書く（clean-municipal.mjs が使う）。
// 1件ずつ、間隔をあけて取得する。TLS の検証は外さない。開けなければ http のまま（載せない）。
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from '../places/lib.mjs';
import { buildMunicipalEvents } from './municipal-lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const flag = (k) => args.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const inputs = args.filter((a) => !a.startsWith('--'));
if (!inputs.length) { console.error('使い方: node scripts/events/check-https.mjs <CSV>...'); process.exit(1); }
const outPath = flag('out') || join(root, 'data', 'events', 'https-upgrades.json');

const rows = inputs.flatMap((f) => parseCsv(readFileSync(f, 'utf8').replace(/^﻿/, '')));
const places = JSON.parse(readFileSync(join(root, 'data', 'places', 'places.json'), 'utf8')).places;
const knownPrefectures = [...new Set(places.map((p) => p.prefecture))];
// http でも載せる条件を満たすもの（allowHttp）のうち、元ページが http のものだけを確かめる
const { events } = buildMunicipalEvents(rows, { knownPrefectures, allowHttp: true });
const urls = [...new Set(events.map((e) => e.source_url).filter((u) => u.startsWith('http://')))];
const prev = existsSync(outPath) ? JSON.parse(readFileSync(outPath, 'utf8')) : { upgrades: {} };
const upgrades = { ...prev.upgrades };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const baseHost = (h) => h.replace(/^www\./, '');
let ok = 0, ng = 0;
for (const u of urls) {
  const target = u.replace(/^http:/, 'https:');
  try {
    const res = await fetch(target, { redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'GroundGolfNaviBot/1.0 (+https://ground-golf-navi.com/about/)' } });
    const finalUrl = new URL(res.url);
    const same = baseHost(finalUrl.hostname) === baseHost(new URL(u).hostname);
    if (res.ok && same && finalUrl.protocol === 'https:') { upgrades[u] = target; ok++; console.log('OK  ', target); }
    else { ng++; console.log('NG  ', res.status, res.url); }
  } catch (e) { ng++; console.log('NG  ', target, String(e.cause?.code ?? e.message).slice(0, 60)); }
  await sleep(1500);
}
writeFileSync(outPath, JSON.stringify({ checked_at: new Date().toISOString(), upgrades }, null, 2) + '\n');
console.log({ candidates: urls.length, ok, ng });
