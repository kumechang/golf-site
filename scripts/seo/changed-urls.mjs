// 使い方: node scripts/seo/changed-urls.mjs <基準のコミット> [<比較先のコミット。省略は HEAD>] > urls.txt
//   node scripts/seo/indexnow.mjs --urls-file urls.txt     （デプロイが終わってから）
// 2つのコミットの差から、IndexNow で知らせるページを1行1URLで出す。公開サイトは見ない（ボット対策で止められることがあるため、手元の dist のサイトマップで、検索に載るページだけに絞る。先に npm run build）。
//  - 記事（src/content/articles/*.md）→ その記事のURL
//  - data/places/*.json の差 → 差のあった都道府県の、クラブ・施設のページ
//  - data/events/*.json の差 → 差のあった都道府県の予定表と、予定表の一覧
//  - src/ のコード（部品・画面・スタイル）の変更 → 全ページに影響するかもしれないので、警告だけを標準エラーに出す（--all の判断は人が行う）
import { execFileSync } from 'node:child_process';
import { existsSync, readFileSync } from 'node:fs';
import { dirname, join } from 'node:path';
import { fileURLToPath } from 'node:url';

const root = join(dirname(fileURLToPath(import.meta.url)), '..', '..');
const SITE = 'https://ground-golf-navi.com';
const [base, head = 'HEAD'] = process.argv.slice(2);
if (!base) { console.error('使い方: node scripts/seo/changed-urls.mjs <基準のコミット> [<比較先>]'); process.exit(1); }
const git = (...a) => execFileSync('git', a, { cwd: root, encoding: 'utf8', maxBuffer: 1 << 28 });
const showJson = (ref, f) => { try { return JSON.parse(git('show', `${ref}:${f}`)); } catch { return null; } };

const files = git('diff', '--name-only', base, head).split('\n').filter(Boolean);
const prefSrc = readFileSync(join(root, 'src/data/prefectures.ts'), 'utf8');
const slugOf = new Map([...prefSrc.matchAll(/name:\s*["']([^"']+)["'][\s\S]*?slug:\s*["']([^"']+)["']/g)].map((m) => [m[1], m[2]]));
const out = new Set();

// 記事
for (const f of files.filter((f) => /^src\/content\/articles\/[^/]+\.md$/.test(f))) {
  const slug = f.split('/').pop().replace(/\.md$/, '');
  const text = existsSync(join(root, f)) ? readFileSync(join(root, f), 'utf8') : null;
  const cat = text?.match(/^category:\s*["']?([a-z-]+)["']?/m)?.[1];
  if (cat) out.add(`${SITE}/${cat}/${slug}/`);
}

// 都道府県ごとの差
const diffPrefs = (file, listKey, prefOf) => {
  const a = showJson(base, file), b = showJson(head, file);
  if (!a || !b) return new Set();
  const group = (d) => { const m = new Map(); for (const r of d[listKey] ?? []) { const k = prefOf(r); m.set(k, [...(m.get(k) ?? []), JSON.stringify(r)]); } return m; };
  const ga = group(a), gb = group(b);
  const changed = new Set();
  for (const k of new Set([...ga.keys(), ...gb.keys()])) {
    if (JSON.stringify([...(ga.get(k) ?? [])].sort()) !== JSON.stringify([...(gb.get(k) ?? [])].sort())) changed.add(k);
  }
  return changed;
};
const placePrefs = new Set();
for (const [f, key] of [['data/places/places.json', 'places'], ['data/places/details.json', 'details']]) {
  if (files.includes(f)) for (const p of diffPrefs(f, key, (r) => r.prefecture)) placePrefs.add(p);
}
for (const p of placePrefs) if (slugOf.has(p)) out.add(`${SITE}/community/find-a-club-near-you/${slugOf.get(p)}/`);

const eventPrefs = new Set();
if (files.includes('data/events/municipal.json')) for (const p of diffPrefs('data/events/municipal.json', 'events', (r) => r.prefecture)) eventPrefs.add(p);
for (const p of eventPrefs) if (slugOf.has(p)) out.add(`${SITE}/community/events/${slugOf.get(p)}/`);
if (eventPrefs.size || files.includes('data/events/approved.json')) out.add(`${SITE}/community/events/`);

// 検索に載るページ（手元のサイトマップ）だけに絞る
const sm = join(root, 'dist', 'sitemap-0.xml');
let urls = [...out].sort();
if (existsSync(sm)) {
  const listed = new Set([...readFileSync(sm, 'utf8').matchAll(/<loc>\s*([^<\s]+)\s*<\/loc>/g)].map((m) => m[1]));
  const dropped = urls.filter((u) => !listed.has(u));
  urls = urls.filter((u) => listed.has(u));
  if (dropped.length) console.error(`サイトマップに無いため除いたページ: ${dropped.length}件（検索に載せないページなど）`);
} else console.error('dist/sitemap-0.xml がありません。先に npm run build をすると、検索に載るページだけに絞れます。');

const code = files.filter((f) => /^src\/(components|layouts|pages|styles)\//.test(f) || f === 'astro.config.mjs');
if (code.length) console.error(`注意: 画面のコードの変更があります（${code.length}ファイル）。全ページに影響する可能性があります。必要なら --all を、人が判断してください。\n  例: ${code.slice(0, 4).join(' / ')}`);
console.error(`知らせるページ: ${urls.length}件`);
console.log(urls.join('\n'));
