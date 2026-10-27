# Bing Webmaster Tools「SEO Recommendations」への対応記録

- 対応日: 2026-10-27（別サイトで対応した内容に合わせて実施。このサイトのCSVはまだ取得していない）

| 項目 | 対応 |
| --- | --- |
| IndexNow | 鍵ファイルと送信スクリプトを追加（送信はデプロイ後に運営者が実行） |
| メタディスクリプションが短いページ | 7ページを拡充（40〜44字 → 85〜103字） |
| 高品質なドメインからのインバウンドリンク | コードでは対応不可（下記） |

## IndexNow

ページの追加・更新を Bing などへ通知する仕組み。Bing・Yandex・Naver・Seznam などが参加。**Google は参加していない**ので、Google への通知は従来どおり Search Console の「インデックス登録をリクエスト」で行う。送信は更新の通知であり、インデックスや順位を保証しない。

- 鍵ファイル: `public/c04d3d05e01358fcc70d8c3656f0a6a2.txt`（公開URL `https://ground-golf-navi.com/c04d3d05e01358fcc70d8c3656f0a6a2.txt`、中身は鍵そのもの。鍵は公開される前提で秘密情報ではない）
- 送信スクリプト: `scripts/seo/indexnow.mjs`（`npm run indexnow -- <引数>`）
  - `--dry-run`: 送信先とURL数だけ確認（送らない）
  - 引数なし: サイトマップ（`sitemap-index.xml` → `sitemap-0.xml`）の全URLを `https://api.indexnow.org/indexnow` へ送信
  - `--url <URL>`: 指定URLだけ送信（繰り返し可）
  - `--sitemap <URLまたはファイル>`: サイトマップの場所を変える（`dist/sitemap-index.xml` で事前確認できる）
  - 送信前に鍵ファイルが公開されていることを確認し、見えなければ送らない。このサイト以外のURLは送らない。
- 自動化したい場合は、Cloudflare の「Crawler Hints」（Caching > Configuration）をオンにする方法もある（未確認）。

### 運営者の作業（マージ・デプロイ後）
1. `https://ground-golf-navi.com/c04d3d05e01358fcc70d8c3656f0a6a2.txt` が表示されることを確認する。
2. `npm run indexnow` を実行して全URLを1回送信する。
3. 記事の追加・大きな更新のあとは、デプロイ後に `npm run indexnow -- --url <更新したURL>` を実行する。
4. Bing Webmaster Tools の IndexNow の画面で、送信が反映されたか見る（時間がかかることがある）。
5. 1〜2週間後に、SEO Recommendations の指摘が減ったか確認する。

## メタディスクリプション

Bing が短いと指摘する対象のうち、特に短かった7ページ（40〜44字）を、ページ本文にある内容だけで書き直した。title は変更していない（「グランドゴルフ」表記の効果測定中のため、11月下旬の確認まで触らない）。

対象: `how-to-score`、`basic-rules`、`fouls-and-manners`、`entering-a-tournament`、`shoes-and-apparel`、`/about/`、`/affiliate-disclosure/`。

方針: 本文にない数値・効果を足さない。「グランドゴルフ」の併記はしない。「図で」と書くのは図入りの3ページで各1回まで。50〜60字台のページは今回は変更していない（必要なら、効果を見てから拡げる）。

## インバウンドリンク（運営者の作業）

他サイトからのリンクはコードでは増やせない。自然な紹介の機会を作る。
- 地域のクラブ・協会・自治体の施設案内・個人のブログなどに、役立つ記事（ルール、大会の種類、都道府県別の探し方）を紹介してもらう。
- 避けること: リンクの売買、相互リンクの大量依頼、掲示板・SNSへの機械的な投稿（検索エンジンの規約違反になりうる）。
