// 使い方: npm run build のあとに  node scripts/places/check-links.mjs [--out=出力JSON] [--delay=2000] [--hosts=12]
// 公開しているページ（dist/）に出ている外部リンクが、いまも開けるかを確かめる。Amazon・Google 地図・自サイトは除く。
// 同じホストには間隔をあけて1件ずつ（既定2秒）、ホストどうしは並行して取得する。TLS検証は外さない。User-Agent は名乗る（偽装しない）。
// 本文は読まず、状態コードと最終URLだけを見る。失敗したものは最後にもう一度だけ試す。
//   ok      2xx（同じホストの別の場所への移動を含む）
//   moved   別のホストへ移動した（リンク先の組織が変わった可能性。人が確認する）
//   dead    404/410
//   blocked 401/403/429（ボット対策で見られないだけの可能性。人が確認する）
//   error   5xx・タイムアウト・名前解決の失敗など
import { readdirSync, readFileSync, statSync, writeFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const args = process.argv.slice(2);
const flag = (k, d) => args.find((a) => a.startsWith(`--${k}=`))?.slice(k.length + 3) ?? d;
const out = flag('out', null);
const delay = Number(flag('delay', 2000));
const concurrency = Number(flag('hosts', 12));
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const decode = (s) => s.replace(/&amp;/g, '&');
const found = new Map(); // url -> Set(ページ)
for (const f of walk(join(root, 'dist')).filter((f) => f.endsWith('.html'))) {
  const page = '/' + f.slice(join(root, 'dist').length + 1).replace(/index\.html$/, '');
  for (const m of readFileSync(f, 'utf8').matchAll(/<a\b[^>]*\shref="(https?:\/\/[^"]+)"/g)) {
    const u = decode(m[1]).split('#')[0];
    if (/(^|\.)ground-golf-navi\.com|amazon\.co\.jp|amzn\.|(^https?:\/\/(www\.)?google\.com\/maps)/.test(u)) continue;
    if (!found.has(u)) found.set(u, new Set());
    found.get(u).add(page);
  }
}
const byHost = new Map();
for (const u of found.keys()) { const h = new URL(u).hostname; byHost.set(h, [...(byHost.get(h) ?? []), u]); }
const sleep = (ms) => new Promise((r) => setTimeout(r, ms));
const baseHost = (h) => h.replace(/^www\./, '');
const UA = 'GroundGolfNaviBot/1.0 (+https://ground-golf-navi.com/about/)';
const results = {};
async function check(u) {
  try {
    const res = await fetch(u, { redirect: 'follow', signal: AbortSignal.timeout(25000), headers: { 'user-agent': UA, accept: 'text/html,*/*;q=0.5' } });
    res.body?.cancel().catch(() => {});
    const f = new URL(res.url);
    let kind;
    if (res.ok) kind = baseHost(f.hostname) === baseHost(new URL(u).hostname) ? 'ok' : 'moved';
    else if (res.status === 404 || res.status === 410) kind = 'dead';
    else if ([401, 403, 429].includes(res.status)) kind = 'blocked';
    else kind = 'error';
    return { kind, status: res.status, final: res.url !== u ? res.url : undefined };
  } catch (e) { return { kind: 'error', status: 0, note: String(e.cause?.code ?? e.message).slice(0, 60) }; }
}
const queue = [...byHost.entries()];
let done = 0;
async function worker() {
  while (queue.length) {
    const [, urls] = queue.shift();
    for (const u of urls) { results[u] = await check(u); done++; await sleep(delay); }
  }
}
console.error(`確かめるURL: ${found.size}件 / ホスト ${byHost.size}`);
await Promise.all(Array.from({ length: concurrency }, worker));
// 失敗したものは1回だけ、間をあけて再試行
const retry = Object.entries(results).filter(([, r]) => r.kind === 'dead' || r.kind === 'error');
await sleep(5000);
for (const [u] of retry) { const r = await check(u); if (r.kind === 'ok' || r.kind === 'moved') r.recovered = true; results[u] = r; await sleep(delay); }
const tally = {};
for (const r of Object.values(results)) tally[r.kind] = (tally[r.kind] ?? 0) + 1;
console.log(JSON.stringify({ 確認した数: Object.keys(results).length, ...tally }));
const report = Object.entries(results).filter(([, r]) => r.kind !== 'ok').map(([u, r]) => ({ url: u, ...r, pages: [...found.get(u)].slice(0, 5) }));
if (out) writeFileSync(out, JSON.stringify({ checked_at: new Date().toISOString(), tally, report }, null, 2) + '\n');
for (const k of ['dead', 'error', 'moved', 'blocked']) {
  const rs = report.filter((r) => r.kind === k);
  if (rs.length) console.log(`\n■ ${k}（${rs.length}件）\n` + rs.map((r) => `  ${r.status || r.note} ${r.url}${r.final ? '  → ' + r.final : ''}  [${r.pages[0]}]`).join('\n'));
}
