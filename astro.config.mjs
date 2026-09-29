// @ts-check
import { readdirSync, readFileSync } from 'node:fs';
import { fileURLToPath } from 'node:url';
import path from 'node:path';
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

const SITE_URL = 'https://ground-golf-navi.com';

/**
 * サイトマップのlastmodは、記事フロントマターのupdatedDate/pubDateなど
 * 実際に検証可能な日付があるページにのみ付与する。取得元のないページ
 * （固定ページ・都道府県ページ等）には付与せず、日付を偽装しない。
 */
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
