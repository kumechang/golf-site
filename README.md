# グラウンドゴルフ入門ナビ

グラウンドゴルフをこれから始める方・始めたばかりの方に向けた情報サイトです。
Astro 7 + Tailwind CSS v4 + Content Collections で構築しています（アルティメットナビの構成を踏襲）。

## 開発

```bash
npm install
npm run dev       # http://localhost:4321
npm run build     # 型チェック + 本番ビルド（dist/ に出力）
npm run preview   # ビルド結果のプレビュー
```

## ディレクトリ構成

```
src/
  content/articles/   … 記事本文（Markdown、content.config.ts でスキーマ検証）
  content.config.ts   … 記事のfrontmatterスキーマ（Zod）
  data/
    categories.ts      … カテゴリ定義（guide/start/gear/rules/community）
    products.ts         … Amazon商品リンクの一元管理（仕様書6.3対応）
  lib/amazon.ts          … Amazonアソシエイトリンク生成
  layouts/
    BaseLayout.astro      … 全ページ共通（head, Header, Footer, Analytics）
    ArticleLayout.astro   … 記事用（パンくず・Article/FAQPage JSON-LD）
  components/            … Header, Footer, 商品カード, 比較リスト, FAQ 等
  pages/
    index.astro            … トップページ
    [category]/index.astro … カテゴリ一覧ページ
    [category]/[slug].astro… 記事詳細ページ
    about.astro / privacy-policy.astro / affiliate-disclosure.astro
```

## 設定状況

- **ドメイン**: `https://ground-golf-navi.com` で確定済み。`astro.config.mjs` の `SITE_URL` に反映済み（DNS浸透待ち）
- **Amazonアソシエイトタグ**: `hiroshirevolu-22` で確定済み。ローカルの `.env`（gitignore対象）に設定済み
- **Google Analytics 4**: 測定ID `G-7JGDGW3W1V` で確定済み。ローカルの `.env`（gitignore対象）に設定済み

`.env` はコミットされないため、**本番のホスティング環境（Cloudflare Pagesなど）側の環境変数にも同じ値を設定する必要があります**。

```
PUBLIC_AMAZON_ASSOCIATE_TAG=hiroshirevolu-22
PUBLIC_GA_MEASUREMENT_ID=G-7JGDGW3W1V
```

## 公開前に対応すること

1. **ホスティング環境変数の設定**: 上記の環境変数を本番のホスティングサービス側にも設定する
2. **画像素材の追加**: 現状ヒーロー画像・記事画像は未挿入（グラデーションのプレースホルダーのみ）です。画像を追加する場合は `src/assets/` に配置し、各コンポーネントで差し込んでください
3. **キーワード実測**: 仕様書8章のとおり、公開前にラッコキーワード等で検索ボリュームを実測し、記事の優先順位を見直してください
4. **OGP画像**: 現在の `public/ogp-default.svg` はSVGのプレースホルダーです。SVGはOGPとして表示されないSNSがあるため、実運用前にPNG/JPG（1200×630px目安）に差し替えることを推奨します
5. **商品価格の最新確認**: `src/data/products.ts` の価格は2026-09-18時点でAmazon.co.jpにて確認した参考価格です。公開前に最新価格・在庫状況を再確認してください
