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

- **ドメイン**: `https://ground-golf-navi.com` で確定済み。`astro.config.mjs` の `SITE_URL` に反映済み（DNS浸透済み）
- **ホスティング**: Cloudflare（Workers/Pages統合の新方式）。デプロイコマンドが `npx wrangler versions upload` になっており、静的サイトの出力先を明示する `wrangler.jsonc`（`assets.directory: "./dist"`）をリポジトリ直下に配置済み。これが無いと「Missing entry-point to Worker script or to assets directory」でデプロイに失敗する
- **Amazonアソシエイトタグ**: `hiroshirevolu-22` で確定済み。`src/lib/amazon.ts` にデフォルト値として直接埋め込んでいるため、**ホスティング環境の環境変数設定なしでも正しいリンクが生成されます**（アソシエイトタグは公開後に誰でもリンクから見える値のため、非公開情報として扱う必要はありません）
- **Google Analytics 4**: 測定ID `G-7JGDGW3W1V` で確定済み。こちらはコード側にデフォルト値を持たせておらず、環境変数 `PUBLIC_GA_MEASUREMENT_ID` が未設定の間はGAタグを一切出力しない設計にしている（計測先を誤って本番以外の環境に送らないため）。**本番のホスティング環境（Cloudflare Pagesなど）側にこの環境変数を設定するまでは、アクセス解析が動きません**

```
PUBLIC_GA_MEASUREMENT_ID=G-7JGDGW3W1V
```

## 公開前に対応すること

1. **ホスティング環境変数の設定**: 上記のGA4測定IDを本番のホスティングサービス側に設定する（Amazonタグは設定不要）
2. **画像素材の追加**: `src/assets/photos/` に4枚配置済み。トップページのヒーローは実際のグラウンドゴルフ用具・コース写真（PhotoACからユーザーが取得）、about ページ・「大会・コミュニティ情報」「上達・ルール」カテゴリページはUnsplash/Pexels/Pixabayの無料枠から目視確認のうえ厳選した写真を使用しています。写真クローラーで収集した素材（Unsplash/Pexels/Pixabay/ぱくたそ等、計3,000枚超）の大半は、キーワード検索してもヒットせず「グラウンドゴルフ」とは無関係の写真（本物のゴルフ・クリケット・サッカー、食べ物、汎用タグ一覧等）が返ってくる状態で、安全に使える人物写真は依然として少ないです。記事本文用の画像は引き続き未挿入です。追加する場合は `src/assets/photos/` に配置し、`src/data/category-images.ts` 等で差し込んでください（画像は必ず目視確認のうえ、Unsplash+等の有料素材でないことをmanifest.jsonの`imageUrl`で確認してから使用すること）
3. **キーワード実測**: 仕様書8章のとおり、公開前にラッコキーワード等で検索ボリュームを実測し、記事の優先順位を見直してください
4. ~~OGP画像~~: 対応済み。`public/ogp-default.png`（1200×630px）をSNSシェア用の既定画像として使用（`public/ogp-default.svg` は編集用のソースとして残置）
5. **商品価格の最新確認**: `src/data/products.ts` の価格は2026-09-18時点でAmazon.co.jpにて確認した参考価格です。公開前に最新価格・在庫状況を再確認してください
6. ~~運営者情報の実データ登録~~: 対応済み。運営者名「グラウンドゴルフ・ナビ運営者（たくや）」、お問い合わせ先 `contact@ground-golf-navi.com` を `src/pages/about.astro` に反映済み
7. **商品画像の調達方法の見直し**: `src/assets/products/*.webp`（16枚）は、Amazon検索結果ページの保存HTMLから抽出したサムネイルを自社ドメインでホスティングしています。コンプライアンスレビューの結果、この方法はAmazonアソシエイト・プログラム運営規約が定める正規の画像利用方法（公式SiteStripeウィジェットや商品広告API経由での埋め込み）に該当しない可能性があるとの指摘が出ました。ユーザー確認の結果、**現時点ではこのまま運用し、後日正規の方法（SiteStripe等）に差し替える方針**です。対応時は `src/data/product-images.ts` の画像インポート元を差し替えてください
8. **商品ラインナップの拡充状況**: `src/data/products.ts` にクラブ・ボールに加え、グローブ・マーカー・スコアカード・クラブケース・ボールポーチ・日よけ帽子・自宅練習セットの実商品（HATACHI/ニチヨー/レザックス等の実ブランド、Amazon検索結果HTMLから確認したASIN）を追加済み（計16商品）。それぞれ`gear`カテゴリの各記事・`start/what-to-bring`・`rules/how-to-score`・`gear/gift-guide`に紐付けて表示している。シューズは「グラウンドゴルフ専用シューズ」の実在する商品が確認できなかったため（記事本文の「普段のウォーキングシューズで良い」という説明とも整合するため）意図的に商品を追加していない。Issue #2に添付されたAmazon検索結果HTML（40件）のうち、まだ確認していないもの（水筒・折りたたみチェア・ウォーキングポール・膝サポーター等の周辺グッズ）も残っているため、必要に応じて追加を検討してください
