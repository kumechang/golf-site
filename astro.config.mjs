// @ts-check
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

const SITE_URL = 'https://ground-golf-navi.com';

/**
 * サイトマップのlastmodは、記事フロントマターのupdatedDate/pubDateや、データファイル
 * （施設データの取得日・承認済みイベントの確認日）など、実際に検証可能な日付があるページにのみ付与する。
 * 取得元のないページ（固定ページ等）には付与せず、日付を偽装しない。
 */

// 市区町村コードの先頭2桁（JIS X 0401の都道府県番号）→ 都道府県ページの slug
const JIS_SLUGS = ['hokkaido','aomori','iwate','miyagi','akita','yamagata','fukushima','ibaraki','tochigi','gunma','saitama','chiba','tokyo','kanagawa','niigata','toyama','ishikawa','fukui','yamanashi','nagano','gifu','shizuoka','aichi','mie','shiga','kyoto','osaka','hyogo','nara','wakayama','tottori','shimane','okayama','hiroshima','yamaguchi','tokushima','kagawa','ehime','kochi','fukuoka','saga','nagasaki','kumamoto','oita','miyazaki','kagoshima','okinawa'];

/**
 * 都道府県ページ・大会カレンダーの lastmod を、データファイルの日付から求める。
 * 都道府県ページ: 施設データ（places.json の取得日、details.json の取得日）の最も新しい日付。
 * 大会カレンダー: 承認済みイベント（approved.json）の確認日の最も新しい日付。
 */
function getDataLastmods() {
  const root = path.dirname(fileURLToPath(import.meta.url));
  /** @param {string} rel */
  const readJson = (rel) => JSON.parse(readFileSync(path.join(root, rel), 'utf-8'));
  /** @type {Map<string, Date>} */
  const lastmods = new Map();
  /**
   * @param {string} key
   * @param {string} iso
   */
  const bump = (key, iso) => {
    const d = new Date(iso);
    if (Number.isNaN(d.getTime())) return;
    const day = new Date(d.toISOString().slice(0, 10));
    const cur = lastmods.get(key);
    if (!cur || day > cur) lastmods.set(key, day);
  };
  const rows = [
    ...readJson('data/places/places.json').places.map((/** @type {{municipality_code: string, surveyed_at: string}} */ p) => [p.municipality_code, p.surveyed_at]),
    ...readJson('data/places/details.json').details.map((/** @type {{municipality_code: string, fetched_at: string}} */ d) => [d.municipality_code, d.fetched_at]),
  ];
  for (const [code, iso] of rows) {
    const slug = JIS_SLUGS[Number(String(code).slice(0, 2)) - 1];
    if (slug) bump(`/community/find-a-club-near-you/${slug}/`, iso);
  }
  for (const e of readJson('data/events/approved.json').events) bump('/community/events/', e.last_checked_at);
  return lastmods;
}
function getArticleLastmods() {
  const __dirname = path.dirname(fileURLToPath(import.meta.url));
  const articlesDir = path.join(__dirname, 'src/content/articles');

  /** @type {Map<string, Date>} */
  const pathLastmods = new Map();
  /** @type {Map<string, Date>} */
  const categoryLastmods = new Map();
  /** @type {Date | null} */
  let siteLastmod = null;

  for (const file of readdirSync(articlesDir)) {
    if (!file.endsWith('.md')) continue;

    const slug = file.replace(/\.md$/, '');
    const content = readFileSync(path.join(articlesDir, file), 'utf-8');
    const categoryMatch = content.match(/^category:\s*"?([\w-]+)"?/m);
    const pubDateMatch = content.match(/^pubDate:\s*(\S+)/m);
    const updatedDateMatch = content.match(/^updatedDate:\s*(\S+)/m);
    if (!categoryMatch || !pubDateMatch) continue;

    const category = categoryMatch[1];
    const dateStr = updatedDateMatch ? updatedDateMatch[1] : pubDateMatch[1];
    const date = new Date(dateStr);
    if (Number.isNaN(date.getTime())) continue;

    pathLastmods.set(`/${category}/${slug}/`, date);

    const currentCategoryLastmod = categoryLastmods.get(category);
    if (!currentCategoryLastmod || date > currentCategoryLastmod) {
      categoryLastmods.set(category, date);
    }
    if (!siteLastmod || date > siteLastmod) {
      siteLastmod = date;
    }
  }

  return { pathLastmods, categoryLastmods, siteLastmod };
}

const { pathLastmods, categoryLastmods, siteLastmod } = getArticleLastmods();
const dataLastmods = getDataLastmods();

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [
    sitemap({
      serialize(item) {
        const pathname = new URL(item.url).pathname;

        if (pathname === '/' && siteLastmod) {
          return { ...item, lastmod: siteLastmod.toISOString() };
        }

        const articleLastmod = pathLastmods.get(pathname);
        if (articleLastmod) {
          return { ...item, lastmod: articleLastmod.toISOString() };
        }

        const dataLastmod = dataLastmods.get(pathname);
        if (dataLastmod) {
          return { ...item, lastmod: dataLastmod.toISOString() };
        }

        const segments = pathname.split('/').filter(Boolean);
        const categoryLastmod = segments.length === 1 ? categoryLastmods.get(segments[0]) : undefined;
        if (categoryLastmod) {
          return { ...item, lastmod: categoryLastmod.toISOString() };
        }

        return item;
      },
    }),
  ],
});
