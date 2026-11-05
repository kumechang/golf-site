// 使い方: node scripts/places/check-https.mjs <調査CSV>... [--out=data/places/https-upgrades.json]
// 元ページが http のページを、同じURLの https で開けるか確かめ、開けたものだけ data/places/https-upgrades.json に書く。
// clean-places.mjs が、開けると確かめたものだけ https に置き換える。1件ずつ間隔をあけて取得し、TLS検証は外さない。
import { readFileSync, writeFileSync, existsSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';
import { parseCsv } from './lib.mjs';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const flag = (k) => args.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3);
const inputs = args.filter((a) => !a.startsWith('--'));
if (!inputs.length) { console.error('使い方: node scripts/places/check-https.mjs <調査CSV>...'); process.exit(1); }
const outPath = flag('out') || join(root, 'data', 'places', 'https-upgrades.json');
const urls = [...new Set(inputs.flatMap((f) => parseCsv(readFileSync(f, 'utf8')).map((r) => r.page_url)).filter((u) => /^http:\/\//.test(u)))];
const prev = existsSync(outPath) ? JSON.parse(readFileSync(outPath, 'utf8')).upgrades : {};
const upgrades = { ...prev };
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const baseHost = (h) => h.replace(/^www\./, '');
let ok = 0, ng = 0;
for (const u of urls) {
  const target = u.replace(/^http:/, 'https:');
  try {
    const res = await fetch(target, { redirect: 'follow', signal: AbortSignal.timeout(20000), headers: { 'user-agent': 'GroundGolfNaviBot/1.0 (+https://ground-golf-navi.com/about/)' } });
    const f = new URL(res.url);
    if (res.ok && f.protocol === 'https:' && baseHost(f.hostname) === baseHost(new URL(u).hostname)) { upgrades[u] = target; ok++; console.log('OK  ', target); }
    else { ng++; console.log('NG  ', res.status, res.url); }
  } catch (e) { ng++; console.log('NG  ', target, String(e.cause?.code ?? e.message).slice(0, 60)); }
  await sleep(1500);
}
writeFileSync(outPath, JSON.stringify({ checked_at: new Date().toISOString(), upgrades }, null, 2) + '\n');
console.log({ candidates: urls.length, ok, ng });
