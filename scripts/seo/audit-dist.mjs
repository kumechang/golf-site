// 使い方: npm run build のあとに  node scripts/seo/audit-dist.mjs [--json=出力先]
// dist/ の全HTMLを読み、公開前に直せる不具合を一覧にする（外部サイトは見ない。外部リンクの確認は scripts/places/check-links.mjs）。
//  - 内部リンク切れ・#アンカー切れ  - title/description の欠け・重複・長さ  - h1 が1つでないページ
//  - alt の無い画像  - Amazon リンクの tag 欠け  - サイトマップのページが noindex のもの / canonical 欠け
//  - 禁止語（運営者が決めた言葉づかい）の混入
import { readdirSync, readFileSync, statSync, existsSync, writeFileSync } from 'node:fs';
import { dirname, join, relative } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const dist = join(root, 'dist');
const SITE = 'https://ground-golf-navi.com';
const jsonOut = process.argv.find((a) => a.startsWith('--json='))?.slice(7);
const walk = (d) => readdirSync(d).flatMap((n) => { const p = join(d, n); return statSync(p).isDirectory() ? walk(p) : [p]; });
const htmlFiles = walk(dist).filter((f) => f.endsWith('.html'));
const urlOf = (f) => '/' + relative(dist, f).replace(/index\.html$/, '').replace(/\.html$/, '');
const pages = new Map();
for (const f of htmlFiles) pages.set(urlOf(f), readFileSync(f, 'utf8'));
const decode = (s) => s.replace(/&amp;/g, '&').replace(/&quot;/g, '"').replace(/&#39;/g, "'").replace(/&lt;/g, '<').replace(/&gt;/g, '>');
const textOf = (h) => decode(h.replace(/<(script|style)[\s\S]*?<\/\1>/g, '').replace(/<[^>]+>/g, ' ').replace(/\s+/g, ' '));
const idsOf = (h) => new Set([...h.matchAll(/\sid="([^"]+)"/g)].map((m) => m[1]));
const sitemap = existsSync(join(dist, 'sitemap-0.xml')) ? readFileSync(join(dist, 'sitemap-0.xml'), 'utf8') : '';
const inSitemap = new Set([...sitemap.matchAll(/<loc>([^<]+)<\/loc>/g)].map((m) => m[1].replace(SITE, '')));

const issues = {};
const add = (k, u, d) => (issues[k] ??= []).push(d ? `${u}  ${d}` : u);
const titles = new Map(), descs = new Map();
const FORBIDDEN = [/公式/, /最強/, /必ず/, /効果がある/, /ランキング/, /人気/, /フィルター/, /！/, /おすすめ/];
for (const [u, html] of pages) {
  const noindex = /<meta[^>]+name="robots"[^>]+noindex/.test(html);
  const title = decode(html.match(/<title>([^<]*)<\/title>/)?.[1] ?? '');
  const desc = decode(html.match(/<meta name="description" content="([^"]*)"/)?.[1] ?? '');
  if (!title) add('title が無い', u); else { titles.set(title, [...(titles.get(title) ?? []), u]); if (title.length > 70) add('title が長い（70字超）', u, `${title.length}字`); }
  if (!desc) add('description が無い', u); else { descs.set(desc, [...(descs.get(desc) ?? []), u]); if (desc.length > 160) add('description が長い（160字超）', u, `${desc.length}字`); }
  const h1 = (html.match(/<h1[\s>]/g) ?? []).length;
  if (h1 !== 1) add('h1 が1つでない', u, `${h1}個`);
  for (const m of html.matchAll(/<img\b[^>]*>/g)) if (!/\salt(=|\s|>|\/)/.test(m[0])) add('alt の無い画像', u, m[0].slice(0, 80));
  if (!noindex && !/<link rel="canonical"/.test(html)) add('canonical が無い', u);
  if (noindex && inSitemap.has(u)) add('noindex なのにサイトマップにある', u);
  if (!noindex && !inSitemap.has(u) && u !== '/404' && !/^\/404/.test(u)) add('index可なのにサイトマップに無い', u);
  const ids = idsOf(html);
  for (const m of html.matchAll(/<a\b[^>]*\shref="([^"]+)"/g)) {
    const href = decode(m[1]);
    if (/^(mailto:|tel:|javascript:)/.test(href)) continue;
    if (/amazon\.co\.jp/.test(href)) { if (!/[?&]tag=/.test(href)) add('Amazon リンクに tag が無い', u, href.slice(0, 80)); continue; }
    if (/^https?:\/\//.test(href) && !href.startsWith(SITE)) continue;
    const [path0, hash] = href.replace(SITE, '').split('#');
    const path = path0 || u;
    if (path.startsWith('/')) {
      const norm = path.replace(/\/?$/, '/').replace(/\/\/$/, '/');
      const target = pages.has(path) ? path : pages.has(norm) ? norm : null;
      const isFile = !target && existsSync(join(dist, path.split('?')[0]));
      if (!target && !isFile) { add('内部リンク切れ', u, href); continue; }
      if (hash && target && !idsOf(pages.get(target)).has(hash)) add('#アンカー切れ', u, href);
    } else if (hash && !ids.has(hash)) add('#アンカー切れ', u, href);
  }
  const main = textOf(html.match(/<main[\s\S]*<\/main>/)?.[0] ?? html);
  for (const re of FORBIDDEN) {
    const m = main.match(new RegExp(`.{0,12}${re.source}.{0,12}`));
    if (m) add(`禁止語「${re.source}」を含む`, u, `…${m[0]}…`);
  }
}
for (const [t, us] of titles) if (us.length > 1) add('title が重複', us.join(' , '), t.slice(0, 40));
for (const [t, us] of descs) if (us.length > 1 && us.length < 40) add('description が重複', us.slice(0, 4).join(' , '), `${us.length}ページ`);
const out = Object.fromEntries(Object.entries(issues).map(([k, v]) => [k, v]));
console.log(`ページ数: ${pages.size}`);
for (const [k, v] of Object.entries(out)) console.log(`\n■ ${k}（${v.length}件）\n` + v.slice(0, 12).map((x) => '  ' + x).join('\n') + (v.length > 12 ? `\n  …ほか${v.length - 12}件` : ''));
if (!Object.keys(out).length) console.log('問題は見つかりませんでした。');
if (jsonOut) writeFileSync(jsonOut, JSON.stringify(out, null, 2));
