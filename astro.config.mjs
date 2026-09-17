// @ts-check
import { defineConfig } from 'astro/config';
import tailwindcss from '@tailwindcss/vite';
import sitemap from '@astrojs/sitemap';

// TODO: 本番ドメイン確定後に実URLへ差し替えること（フェーズ0でサイト名・ドメイン確定）
const SITE_URL = 'https://groundgolf-navi.example.com';

export default defineConfig({
  site: SITE_URL,
  trailingSlash: 'always',
  vite: {
    plugins: [tailwindcss()],
  },
  integrations: [sitemap()],
});
