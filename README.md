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

## 公開前に必ず対応すること

1. **ドメイン確定**: `astro.config.mjs` の `SITE_URL`（現在は仮のプレースホルダー）を実際のドメインに差し替える
2. **Amazonアソシエイトタグ**: `.env` に `PUBLIC_AMAZON_ASSOCIATE_TAG` を設定する（`.env.example` 参照）。未設定の間は仮のタグでビルドされます
3. **Google Analytics 4**: `.env` に `PUBLIC_GA_MEASUREMENT_ID` を設定する。未設定の間はGAタグは出力されません
4. **画像素材の追加**: 現状ヒーロー画像・記事画像は未挿入（グラデーションのプレースホルダーのみ）です。画像を追加する場合は `src/assets/` に配置し、各コンポーネントで差し込んでください。検索キーワード例はユーザーに別途共有済みです
5. **キーワード実測・記事本数の拡充**: 仕様書8章のとおり、公開前にラッコキーワード等で実測し、サイトマップ（仕様書3章）に残る「どんな人におすすめ？」「都道府県別クラブ・コースの探し方」など未執筆の記事を追加してください
6. **OGP画像**: 現在の `public/ogp-default.svg` はSVGのプレースホルダーです。SVGはOGPとして表示されないSNSがあるため、実運用前にPNG/JPG（1200×630px目安）に差し替えることを推奨します
7. **紹介料率・商品価格の最新確認**: `src/data/products.ts` の価格帯・商品情報は目安です。公開前にAmazon側の最新情報で確認してください
