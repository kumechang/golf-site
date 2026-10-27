// IndexNow: ページの追加・更新を Bing などへ通知する（Google は参加していない）。
// 使い方（デプロイが終わってから）:
//   node scripts/seo/indexnow.mjs --dry-run                 送信先とURL数だけ確認
//   node scripts/seo/indexnow.mjs                           サイトマップの全URLを送信
//   node scripts/seo/indexnow.mjs --url <URL> [--url <URL>] 指定したURLだけ送信
//   --sitemap <URLまたはファイル>                           サイトマップの場所を変える（確認用）
import { readFileSync } from 'node:fs';

const SITE = 'https://ground-golf-navi.com';
const KEY = 'c04d3d05e01358fcc70d8c3656f0a6a2';
const KEY_LOCATION = `${SITE}/${KEY}.txt`;
const ENDPOINT = 'https://api.indexnow.org/indexnow';

const args = process.argv.slice(2);
const flag = (n) => args.includes(n);
const values = (n) => args.flatMap((a, i) => (a === n && args[i + 1] ? [args[i + 1]] : []));

async function load(src) {
  if (/^https?:\/\//.test(src)) {
    const r = await fetch(src);
    if (!r.ok) throw new Error(`${src} を取得できません（${r.status}）`);
    return r.text();
  }
  return readFileSync(src, 'utf8');
}

const locs = (xml) => [...xml.matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]);

async function sitemapUrls(src) {
  const first = locs(await load(src));
  // サイトマップ索引なら、中のサイトマップをたどる
  const isIndex = first.length > 0 && first.every((u) => /sitemap[^/]*\.xml$/.test(u));
  if (!isIndex) return first;
  const out = [];
  for (const u of first) out.push(...locs(await load(src.startsWith('http') ? u : src.replace(/[^/]*$/, u.split('/').pop()))));
  return out;
}

const explicit = values('--url');
const sitemap = values('--sitemap')[0] ?? `${SITE}/sitemap-index.xml`;
const urls = [...new Set(explicit.length ? explicit : await sitemapUrls(sitemap))];

for (const u of urls) {
  if (!u.startsWith(SITE + '/')) throw new Error(`このサイトのURLではありません: ${u}`);
}
if (!urls.length) throw new Error('送るURLがありません');

console.log(`送信先: ${ENDPOINT}\nURL数: ${urls.length}\n鍵ファイル: ${KEY_LOCATION}`);
if (flag('--dry-run')) {
  console.log(urls.slice(0, 5).join('\n') + (urls.length > 5 ? '\n...' : ''));
  process.exit(0);
}

// 鍵ファイルが公開されていなければ送らない
const k = await fetch(KEY_LOCATION).catch(() => null);
if (!k || !k.ok || (await k.text()).trim() !== KEY) {
  console.error('鍵ファイルが公開されていないため送信しません。デプロイが終わってからやり直してください。');
  process.exit(1);
}

for (let i = 0; i < urls.length; i += 10000) {
  const r = await fetch(ENDPOINT, {
    method: 'POST',
    headers: { 'content-type': 'application/json; charset=utf-8' },
    body: JSON.stringify({ host: new URL(SITE).host, key: KEY, keyLocation: KEY_LOCATION, urlList: urls.slice(i, i + 10000) }),
  });
  console.log(`HTTP ${r.status}`);
  if (r.status !== 200 && r.status !== 202) {
    console.error(await r.text());
    process.exit(1);
  }
}
