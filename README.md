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
- **Amazonアソシエイトタグ**: `hiroshirevolu-22` で確定済み。`src/lib/amazon.ts` にデフォルト値として直接埋め込んでいるため、**ホスティング環境の環境変数設定なしでも正しいリンクが生成されます**（アソシエイトタグは公開後に誰でもリンクから見える値のため、非公開情報として扱う必要はありません）
- **Google Analytics 4**: 測定ID `G-7JGDGW3W1V` で確定済み。こちらはコード側にデフォルト値を持たせておらず、環境変数 `PUBLIC_GA_MEASUREMENT_ID` が未設定の間はGAタグを一切出力しない設計にしている（計測先を誤って本番以外の環境に送らないため）。**本番のホスティング環境（Cloudflare Pagesなど）側にこの環境変数を設定するまでは、アクセス解析が動きません**

```
PUBLIC_GA_MEASUREMENT_ID=G-7JGDGW3W1V
```

## 公開前に対応すること

1. **ホスティング環境変数の設定**: 上記のGA4測定IDを本番のホスティングサービス側に設定する（Amazonタグは設定不要）
2. **画像素材の追加**: 現状ヒーロー画像・記事画像は未挿入（グラデーションのプレースホルダーのみ）です。画像を追加する場合は `src/assets/` に配置し、各コンポーネントで差し込んでください
3. **キーワード実測**: 仕様書8章のとおり、公開前にラッコキーワード等で検索ボリュームを実測し、記事の優先順位を見直してください
4. ~~OGP画像~~: 対応済み。`public/ogp-default.png`（1200×630px）をSNSシェア用の既定画像として使用（`public/ogp-default.svg` は編集用のソースとして残置）
5. **商品価格の最新確認**: `src/data/products.ts` の価格は2026-09-18時点でAmazon.co.jpにて確認した参考価格です。公開前に最新価格・在庫状況を再確認してください
6. **運営者情報の実データ登録**: `src/pages/about.astro` の「お問い合わせ窓口の詳細は、準備が整い次第このページに追記いたします」は仮の文言です。実在しない氏名・連絡先を機械的に埋めることはできないため、企画側で実際の連絡先（メールフォーム等）を用意し次第、このページに反映してください。ペルソナレビューでも、空欄のままだと初見の読者の信頼感を損ねる可能性があると指摘が出ています
7. **商品画像の調達方法の見直し**: `src/assets/products/*.webp`（8枚）は、Amazon検索結果ページの保存HTMLから抽出したサムネイルを自社ドメインでホスティングしています。コンプライアンスレビューの結果、この方法はAmazonアソシエイト・プログラム運営規約が定める正規の画像利用方法（公式SiteStripeウィジェットや商品広告API経由での埋め込み）に該当しない可能性があるとの指摘が出ました。ユーザー確認の結果、**現時点ではこのまま運用し、後日正規の方法（SiteStripe等）に差し替える方針**です。対応時は `src/data/product-images.ts` の画像インポート元を差し替えてください
