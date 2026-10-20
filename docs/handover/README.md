# 引き継ぎ資料（2026-10-18 更新。最初の版は 2026-10-14）

「グラウンドゴルフ入門ナビ」の作業を、新しいセッションで続けるための資料。
前のセッションは会話が非常に長くなったため、ここに必要な文脈をまとめた。**最初にこのファイルを最後まで読むこと。**

- サイト: https://ground-golf-navi.com/ （Astro 7 + Tailwind v4 の静的サイト。Cloudflare の git 連携で公開）
- リポジトリ: `kumechang/golf-site`
- 作業ブランチ: `claude/cool-fermi-tuoxe0`（このブランチにだけ push する。他のブランチには push しない）
- 運営者への報告は**日本語**で行う。

---

## 1. 運営者との約束事（毎回守る）

### 1.1 記事は専門家の流れで作る（エンジニアが独断で書かない）
記事・サイトの文言は、次の流れで作る。省略しない。

1. **SEOブリーフ**（検索意図・構成・FAQ・内部リンク・要事実確認リスト）と**読者心理ブリーフ**（ペルソナ別の不安・語彙・避ける表現・次の一歩）を、別々の専門家役（サブエージェント）に作らせる
2. **プロのライター役**が、両ブリーフを読んで本文を書く
3. **レビュー**を並行で行う: 編集・校閲／読者ペルソナ（4人程度）／競技ドメイン（一次情報でのファクトチェック）／コンプライアンス＋SEO＋アクセシビリティ
4. 指摘を**ライター役に反映させて**改訂 → サイトに反映 → ビルド → PR
5. 画像が必要になったら、**運営者に知らせる**（画像は運営者が用意する）

過去の例は `docs/handover/briefs/` に残してある（大会の種類の記事と、カレンダーページのブリーフ）。

### 1.2 変更の進め方（毎回同じ）
1. 変更 → `npm run build`（`astro check && astro build`）が通ることを確認
2. コミット → `claude/cool-fermi-tuoxe0` に push
3. PR を作成 → **squash マージ**
4. ブランチを main に合わせ直す:
   ```
   git fetch -q origin main && git reset -q --hard origin/main && git push -q --force-with-lease origin claude/cool-fermi-tuoxe0
   ```
5. 運営者に日本語で報告
- コミットの末尾:
  ```
  Co-Authored-By: Claude Sonnet 5.5 <noreply@anthropic.com>
  Claude-Session: https://claude.ai/code/session_01PTULYxhMV1jTdcU94rCAhH
  ```
  （新しいセッションでは、そのセッションの指示に表示される帰属表記に従う）
- PR 本文の末尾は「🤖 Generated with [Claude Code](https://claude.com/claude-code)」＋セッションURL
- PR はユーザーが頼んだときだけ作る（これまでは毎回「進めて」という依頼で作ってきた）
- GitHub の操作は MCP ツール（`mcp__github__*`）を使う。ToolSearch で読み込む。ときどき切断されるので、そのときは読み込み直す

### 1.3 取得（クローラー）の方針
- 運営者の指示: **「規約で禁止されているところは取らない」**
- ブロックを回避しない（UA・IPの偽装なし、TLS検証は無効にしない）
- JGGA（日本グラウンド・ゴルフ協会）の大会情報は**取得しない**（リンクのみ）
- 検索エンジンの結果ページはスクレイピングしない
- 個人情報（県スポーツ協会の会員名簿の氏名・住所・電話など）は保存しない
- 載せるのは事実項目（大会名・日程・開催地・会場・申込期限）と元ページへのリンクだけ。本文・画像・要項は転載しない

### 1.4 文章の方針（このサイトのトーン）
- 断定を避ける。「〜という方法があります」「一例として」「確認できた範囲では」
- 確認できていない事実は断定しない。分からないことは、聞き先を添えて書く
- 医療・効果の断定、煽り、希少性、恐怖訴求はしない
- 「雲の上」「敷居が高い」を地の文に使わない。「誰でも出られます」「楽しめます」「歓迎されます」と断定しない
- 表記: 本文は「グラウンドゴルフ」。団体名・大会名は中黒ありの「グラウンド・ゴルフ」。「グランドゴルフ」は導入で1回だけ併記（検索語の対応）
- 親のために調べている子世代には、「勧める必要はない」と書く

---

## 2. サイトの現在の状態

### 2.1 記事（`src/content/articles/*.md`、21本）
カテゴリ: `guide`（グラウンドゴルフとは）／`start`（始め方）／`gear`（道具選び）／`rules`（上達・ルール）／`community`（大会・コミュニティ情報）。定義は `src/data/categories.ts`。

主な記事: what-is-ground-golf, who-is-it-for, vs-gateball-parkgolf, gentle-exercise-comparison, retirement-hobby-comparison, from-golf-to-ground-golf, find-a-class, cost, what-to-bring, how-to-choose-a-club, how-to-choose-a-ball, shoes-and-apparel, best-club-sets, gift-guide, basic-rules, how-to-score, fouls-and-manners, how-to-hit-and-distance, find-a-club-near-you（47都道府県ページあり）, entering-a-tournament, **tournament-overview（今回新規）**

- アフィリエイト（Amazon）は `relatedProducts` があるページにだけ表記（`AffiliateNotice` は条件付き）
- 本文の箇条書きは `src/styles/global.css` の `.prose-article` で点・番号を付けている
- ヒーロー画像・各種画像は運営者が用意したものを `src/assets/` に置いている。新記事（tournament-overview）には画像がない

### 2.2 公開済みの新機能（今回のセッションの成果）
- **大会カレンダー** `/community/events/`（`src/pages/community/events/index.astro`、`src/components/EventCard.astro`、`src/data/events.ts`）
  - 承認済みデータ（`data/events/approved.json`、11件）を表示。県別（兵庫・香川・佐賀）＋最後に「全国・ブロック大会」の別枠
  - 開催日を過ぎた大会は、ビルド時に除外し、ブラウザ側のスクリプトでも隠す（再ビルドしなくても古くならない）。確認日から45日たつと注意が出る
  - 「掲載元」と「主催」を分ける。「主催」は運営者が確認して `organizer` を入れたときだけ表示。申込期限が過ぎたら「申込受付終了」。「受付中」「あと◯日」は書かない
  - Event 構造化データは付けない（BreadcrumbList のみ）。理由は `docs/handover/briefs/calendar-page-brief.md` §5.3
  - 表示の確認: `EVENTS_TODAY=2026-10-16 npm run build`（本番ビルドには付けない）
- **/about/ にクローラーの節**（`#crawler`）を追加。クローラーのUAがこのURLを指している
- **市区町村の施設の節**（2026-10-18 公開）。47都道府県ページ（`/community/find-a-club-near-you/<県>/`）に「市区町村の案内に、グラウンドゴルフの記載がある施設」を追加（詳細は §3.6）。`/about/#places` に調べ方の説明、関連4記事（find-a-club-near-you / what-to-bring / find-a-class / entering-a-tournament）から導線
- 記事「大会の種類」（`/community/tournament-overview/`）と、大会ガイド（entering-a-tournament）の修正（根拠のない「初心者から参加できる部門が多い」を削除、登録・用具条件を追記）
- カテゴリページ（`/community/`）にカレンダーへのカード

### 2.3 Search Console の知見（3週間分のデータ）
- 55ページが「検出-インデックス未登録」（まだクロールされていない）
- いちばん効いている記事はギフトガイド
- 「グランドゴルフ」表記の検索語が多い → タイトル・説明文の調整と、トップの「はじめての方は、ここから」を追加済み

### 2.4 競技ドメインで確認済みの事実（記事に使える）
- JGGAルール: 第2条マナー／第4条 打順は「きめられた打順にしたがって」／第6条 ゲーム中の打球練習禁止／第7条 助言・援助の禁止／第9条 ヘッドで打つ（押し出し・かき寄せは1打付加、から振りは打数に数えない）／第16条 標準コースは50m・30m・25m・15mが各2ホール（計8ホール）
- ホールポスト: 低い輪（ホール）と、番号旗のポール。ホールインはボールが輪の中で静止した状態（公式用語は「トマリ」）
- 会員規程: 第7条 入会申請は都道府県協会が取りまとめる／第8条 会員は日本協会と市町村・都道府県の各協会の事業に参加できる（「会員でないと出られない」とは書いていない）
- 北信越ブロック大会（令和8年度、福井県）: 参加資格は「JGGA登録会員」、申込先は主管の県協会、クラブ・ボールはJGGA認定品
- 香川県「みなスポ！かがわ2026 GG【東】大会」: 参加資格は「県GG協会会員および一般愛好者」
- 勝ち上がり式の出場の仕組みは、JGGAの公開情報では確認できていない（記事では「範囲の違い」として書く）

---

## 3. イベント収集の仕組み（クローラー＋確認フロー）

詳細は `docs/crawler/README.md`（使い方・構造・読み取り器の表）と `docs/crawler/REVIEW.md`（確認の基準・承認の手順）。ここでは要点だけ。

### 3.1 構成
- Node 22 ESM、依存なし、`node:test`。`npm run test:crawler`（**63件**が通る状態。施設データの整形のテストを含む）
- `scripts/crawl-events.mjs` が台帳 `data/crawler/sources.json`（30情報源、`status`: allowed/pending/excluded/blocked/out_of_scope、47都道府県のカバレッジ）を読み、`status==='allowed'` で reader のあるものだけ取得
- 取得クライアント `scripts/crawler/lib/http.mjs`: 誠実なUA（`GroundGolfNaviBot/1.0 (+https://ground-golf-navi.com/about/)`）、robots.txt を先に確認、ホストごとに1秒以上の間隔、リトライ、ページ数上限、リダイレクト先も robots 再確認
- reader（`scripts/crawler/sources/`）: saga, kagawa, yamanashi, saitama（開催速報の監視のみ）, kobe, kanazawa, satsumasendai
- 出力: `data/crawler/out/<日時>/`（git 管理外）に events.json / events.csv / report.md

### 3.2 確認フロー
```
npm run crawl:events                         # 取得（out/ に出力）
npm run review:events                        # レポート（要判断・重複・注意の印）
npm run review:events -- decide <id> approve "内部メモ" --level=local|block|national
npm run review:events -- decide <id> reject|dup:<統合先id> ["メモ"]
npm run review:events -- build               # data/events/approved.json を更新
```
- 承認には `--level` が**必須**（`local`=県のセクション、`block`/`national`=全国・ブロック大会の別枠）。任意で `--organizer=` `--display-name=` `--public-note=`
- 内部メモ（`note`）は公開ページに出ない。読者向けの補足は `public_note`
- 再承認では、前の level・補足は引き継がれる
- id は「都道府県＋開始日＋大会名＋情報源」から決まる。**日程や名前が変わると id が変わり承認が外れる**
- `data/crawler/out/` は git 管理外なので、新しいセッションでは先に `npm run crawl:events` が必要（`decide` も `build` も出力を読む）

### 3.3 承認済み 11件（`data/crawler/review/decisions.json`）
- 兵庫・神戸市 4件（E-017d6650, E-7c53e8ef, E-416e3545, E-f23540d9）
- 香川 1件（E-23209e11。申込受付終了。開催 2026-10-15）
- 佐賀 3件（E-d565dd3a, E-0eb6f46d, E-838d73bc）
- 全国・ブロック 3件（E-8b9368f4 全国レディス, E-7aa0aec5 ねんりんピック2026加須, E-c3a521db 九州地区沖縄）
- 重複の統合 2件（E-ed79f86f → E-8b9368f4, E-29a735b6 → E-7aa0aec5）

### 3.4 まだ判断が出ていない 10件（運営者に確認中のまま）
公開候補23件のうち、次の10件は載せていない（`docs/crawler/first-review-2026-10-14.md` に理由）。
- 保留 7件: 薩摩川内市 4件（E-d6690d0c, E-b842dc08, E-a57eab9d, E-adee16bd）、金沢市フリータイム 2件（E-846db74c, E-3c0425e6）、石川県知事杯（E-edb198c7）
- 却下の提案 3件: 指導員養成講習会（E-8f0655e5）、優良プレーヤー及び普及指導員大会（E-d510494b）、ベストプレーヤー大会（E-70cee9d8）

### 3.5 取得でわかった重要事項
- 協会の大会は**登録選手向けが中心**。参加資格はどの情報源にも載っていない → 公開時は全件に「参加資格・申込は主催者の案内で確認してください」を付ける
- `listed_by` は「その情報が載っていたページの団体」で、**主催者ではない**（全国・ブロックの3件は佐賀県協会の予定表に載っていたので、掲載元が佐賀県協会になっている）
- 一般の人が参加できる市民大会・体験会は、**自治体のサイト**にある（横浜市・稲城市・岩倉市など。規約確認前で保留）

### 3.6 市区町村の施設データ（`docs/places/README.md` に詳細）
運営者が、全国の市区町村の1次情報（施設の案内ページ）を、**取得時に robots.txt と利用規約を確認しながら**調べたCSV（1,421行・487市区町村・2026-10-17〜18）を元にしている。CSV には自治体ページから抜き出した文（`matched_text`）が入っているため、**リポジトリには入れていない**（新しいセッションでは運営者に再提供してもらう）。

- 流れ: `npm run places:clean -- <CSV> --review=<確認用CSV>` → `data/places/places.json`（施設名・市区町村・元ページURL・取得日・確認用の印）。印のあるもの、http、イベント・大会募集・本文に記載なしのページは載せない
- 運営者の判断は `data/places/overrides.json`（`source_url` をキーに `exclude` / `name` / `as_listing`）。再生成しても消えない。レビューで見つかった67件の修正が入っている。取り下げ依頼が来たら `exclude` を足して当日中に反映
- 読み込みと検証は `src/data/places.ts`（不正なデータはビルド失敗。施設名の検査あり）、表示は `src/components/MunicipalPlaces.astro`
- 現在の掲載: **1,206件・444市区町村**（施設606件＋施設名のない一覧ページ。47都道府県すべて）。偏りが大きい（愛知95、群馬・埼玉80台、北海道・富山は1件）。全国の約1,740市区町村のうち約444
- 表示の約束: 「利用できます」と書かない（「市区町村の案内に記載がある」まで）。載っていない市区町村は「未確認」で「ない」ではない。件数の多い少ないは調べ方の差。「公式」「提供」「施設一覧」は使わない。構造化データは付けない。親ページに県別の件数は出さない
- 見せ方: 市区町村ごとにまとめ、20件以上の県は3件以上の市区町村を折りたたみ（h3 は details の外）。10件以上の県は絞り込み欄（JavaScript が使えるときだけ表示）。一覧ページへのリンクは1市区町村につき上位3件まで
- 注意: 施設名は自動で整えており、**全件を人が通読してはいない**（レビューで664件中約63件を修正）。再調査のたびに通読が必要
- 設計ブリーフ: `docs/handover/briefs/places-page-brief.md`

### 3.7 「住所・電話番号を個別に確認できた施設の例」の節（旧「地図データから確認できる施設の例」）
- データは `src/data/osm-course-examples.ts`（約455件。ファイル名・変数名は旧名のまま。改名は未着手）。**OpenStreetMap が出典なのは千葉・大分の2件と「周辺の地図情報から施設名を特定」の8件のみ**で、残りは自治体などのウェブサイトや Web 検索で確認したもの。以前の見出し・導入文が「OpenStreetMap をもとに」と書いていたのは実態と合わず、2026-10-19 に直した
- 各行の出典の表記は `src/data/place-sources.ts`（`sourceNote` の完全一致から種類を判定。未知の表記は「Web上の公開情報」）。新しいデータには `source` を付ける。`© OpenStreetMap contributors` は OSM 由来の行がある県（9県）にだけ出す
- 要確認: 「自治体公式サイト等」415件に、第三者サイト（いこーよ等）が混じっていないか／「Web検索により確認」13件の情報源が不明（再調査して具体化したい）／千葉・大分の OSM 2件が個別確認の結果か OSM の掲載値のままか
- 運営者が自治体のページから取った住所・電話番号（詳細CSV 709行）を、2026-10-20 に施設の節へ追加済み（476件・172市区町村・電話373件。`npm run places:details`、`data/places/details.json`、詳細は `docs/places/README.md`）。同じ施設が「住所・電話番号を個別に確認できた施設の例」の節にもあれば、そちらを外す。食い違う同名の施設と、住所が別の市区町村から始まるものは載せていない

---

## 4. 体験会（地域の一般向けイベント）について：調査の結論

運営者は「大きな大会ではなく、地域の体験会のようなものを集めたい」と考えている。**調査は途中で止めた**（トークン消費が大きかったため）。分かっていること:

- 運営者が前に調べた「政府API・オープンデータ」（e-Gov APIカタログ38件）には、地域のグラウンドゴルフイベントは**入っていない**。関係しうるのはデータカタログサイトAPI（#30、メタデータのみ）だけで、自治体のイベント系データセットにグラウンドゴルフが含まれるかは**未確認**
- 検索で、公式の自治体ページに次の例が見つかった（2026-10-14 時点）
  - 葛飾区「グラウンド・ゴルフ体験コーナー」: 2026-11-25（水）、無料、用具貸出、定員20人（抽選）、初心者は指導員が同行。申込期限は10/2で過ぎている。出典: https://www.city.katsushika.lg.jp/_res/projects/default_project/_page_/001/033/073/2026gg.pdf
  - 目黒区体育祭 グラウンド・ゴルフ大会: 2026-11-07、区内在住・在学・在勤が対象、申込は10/23まで。出典: https://www.city.meguro.tokyo.jp/sports/event/taiikusai_ground_golf.html
  - 過去の調査で、志木市の市民大会（市内在住・在勤・在学）、能代市の初心者向けの大会（用具貸出、2025年）も確認
- 性質: 自治体のスポーツ課・区のページにあり、1自治体に年に数件。多くが**チラシのPDFや個別のお知らせ**で、機械で読み取る形式ではない。申込期限が過ぎているものが多く、鮮度が短い
- **推奨（運営者はこの方向に同意）**: クローラーを自治体ごとに作らず、**運営者が見つけた体験会を、元ページのURL付きで手作業で登録**する。既存の「確認して承認する」の流れを流用する。自動で集めるのは、自治体のオープンデータで見つかった場合だけ
- 見せ方（案）: 大会と別枠にし、**参加資格（区内在住など）と申込期限を目立たせる**。載せる項目は名称・日時・場所・対象・費用・申込方法の種類・主催者・元ページ。電話番号・メール・担当者名は載せない
- 作るなら、これも「専門家ブリーフ → 実装 → レビュー」の流れで

---

## 5. 残っている宿題（優先度の目安）

運営者の判断が要るもの:
1. 保留7件・却下提案3件を載せるか（§3.4）
2. 佐賀県内の2件（県民スポーツ大会、2026ねんりんピックさが）に「参加できる方が限られる場合があります」という補足を付けるか。今は定型文だけ
3. /about/ の「運営者が内容を確認し、掲載を承認したものだけを載せています」が実態に合っているか。**AIの利用有無には触れていない**。事実どおりの表現にしたいなら文面を決める
4. 体験会を、手作業登録で始めるか

実装・作業:
- **体験会の手作業登録の仕組み**（上記§4）。データファイル・登録手順・表示（カレンダーと別枠）
- **更新の自動化**: 週1回のクロール＋再公開。Cloudflare の git 連携ビルドを外部から起動できるか未確認。今は手動。クライアント補正で古い表示は防いでいる
- 市区町村サイトの規約確認（横浜市・稲城市・岩倉市）と、必要なら reader 追加
- 島根・富山・滋賀などの reader 追加（台帳に情報源あり）。岐阜（Ameba ブログ）は規約確認が必要
- 既存記事の表記統一（別PR）: `find-a-class.md` と `cost.md` の「協会の支部」→中立な表現（entering-a-tournament は直し済み）。`find-a-club-near-you.md` の「多くのクラブは新しい参加者を歓迎しています」は根拠が未確認の一般化
- 記事「大会の種類」に画像がない（運営者に画像を依頼する）
- 任意: JGGA への問い合わせ文面（大会の参加資格・出場の決まり方）、大会カレンダーの県別ページ化（件数が増えたとき。閾値は calendar-page-brief §1）
- 公開後に人が原文で確認すると安全な点: 北信越・香川の要項PDF（参加資格・用具条件）、JGGA会員規程第5・7・8条（WebFetch の要約経由だった）
- 市区町村の施設データ: 施設名の通読（誤りが残っている可能性）、再調査の依頼（調査範囲を広げる。北海道・富山・徳島・高知・香川がほぼ空）、http のURL34件を https で開けるか確認して載せるか、件数が増えたときの横断検索（親ページに、市区町村名で探す欄。検索用データを別に持つ）
- 体験会とカレンダーの関係: カレンダー（大会）と施設（場所）と体験会（手作業登録）をどうつなぐか。県ページから「その県の今後の大会」へのリンク（`/community/events/#<slug>`）も任意で未実装

---

## 6. 環境のくせ・ハマりどころ

- `pkill` は終了コード144でシェルごと落ちることがある。**別のコマンドとして単独で**実行する
- Python の `urllib` は一部のサイト（岩倉市など Imperva）で 403 になる。curl は通る。これは「curl のみ可」として台帳に記録し、回避はしない
- GitHub MCP ツールがときどき切断される → ToolSearch で `select:mcp__github__create_pull_request,mcp__github__merge_pull_request` のように読み込み直す
- Playwright: `/opt/node22/lib/node_modules/playwright`、Chromium は `/opt/pw-browsers/chromium-1194/chrome-linux/chrome`。プロジェクトの node_modules には Playwright が無い
- 画面確認は `python3 -m http.server 4399 -d dist` で配信して撮る。固定ヘッダーが要素スクリーンショットに重なって写る
- モバイルのヘッダーは2段で高さ約175px。ページ内リンクの着地位置は `html { scroll-padding-top }`（`src/styles/global.css`）で調整している
- Tailwind v4 の preflight で `ul` のリストマークが消える。本文は `.prose-article`、それ以外は `role="list"` と `list-disc` を明示する
- `astro check` が `npm run build` に含まれる。型エラーがあるとビルドが失敗する
- 新しい環境では `node_modules` が無いことがある。`astro: not found` が出たら `npm ci` を実行する
- `src/data/events.ts` の `jstDate` を `places.ts` が再利用している（日本時間の日付）。JIS の都道府県番号は `places.ts` の `JIS_ORDER`（`prefectures.ts` は地方順で JIS 順ではない）
- このセッションの会話全文のトランスクリプトは、新しい環境では使えない前提で、**重要な決定はすべてこの資料とリポジトリの docs に書いてある**

---

## 7. 新しいセッションの最初にやること

1. この README と `docs/crawler/README.md`・`docs/crawler/REVIEW.md` を読む
2. `git fetch origin main && git checkout -B claude/cool-fermi-tuoxe0 origin/main`（指示された作業ブランチ名を使う）
3. `npm install` → `npm run build` と `npm run test:crawler` が通ることを確認
4. 運営者に「どれから進めるか」を聞く（§5 の宿題）。体験会の手作業登録から始めるのが、これまでの流れでは自然
5. 記事・文言を作るときは §1.1 の流れで

## 8. 関連ドキュメント一覧

| ファイル | 内容 |
| --- | --- |
| `docs/crawler/README.md` | クローラーの使い方・構造・reader の表・出力項目・情報源の追加方法 |
| `docs/crawler/REVIEW.md` | 確認の基準・承認の手順・level と補足・公開ページ |
| `docs/crawler/source-check-2026-10-13.md` | 約40の情報源の robots・規約の確認結果 |
| `docs/crawler/first-review-2026-10-14.md` | 公開候補23件の確認記録と提案 |
| `docs/handover/briefs/tournament-seo-brief.md` | 「大会の種類」記事のSEOブリーフ（過去の例） |
| `docs/handover/briefs/tournament-psychology-brief.md` | 同・読者心理ブリーフ |
| `docs/handover/briefs/calendar-page-brief.md` | 大会カレンダーページの設計ブリーフ（構成・文言・a11y・コンプライアンス・運用） |
| `docs/handover/briefs/places-page-brief.md` | 市区町村の施設の節の設計ブリーフ |
| `docs/places/README.md` | 施設データの更新手順・overrides・整形ルール・書き方の約束 |
| `docs/design/gemini-image-prompts.md` | 画像生成用のプロンプト案 |
| `data/crawler/sources.json` | 情報源の台帳（取得可否・理由・カバレッジ） |
| `data/crawler/review/decisions.json` | 承認・却下・重複の判断の記録 |
| `data/events/approved.json` | 公開用の承認済み一覧（カレンダーが読む） |
| `data/places/places.json` / `overrides.json` | 市区町村の施設データと運営者の判断（都道府県ページが読む） |
