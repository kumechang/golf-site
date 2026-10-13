# イベント情報クローラー

グラウンドゴルフのイベント（大会など）を、取得を許可している情報源から集める。DBや公開ページには**直接触れない**。出力のCSV/JSONを人が確認してから取り込む。

## 使い方

```bash
npm run test:crawler                       # テスト（30件）
npm run crawl:events                       # 台帳で status=allowed かつ reader のある情報源をすべて取得
npm run crawl:events -- --only=pref-saga   # 1つだけ
npm run crawl:events -- --today=2026-10-14 --out-dir=/tmp/out
```

出力（既定は `data/crawler/out/<日時>/`。gitには入れない）: `events.json` / `events.csv` / `report.md`

## 取得のルール（変えない）

- 実在の識別情報つきUA: `GroundGolfNaviBot/1.0 (+https://ground-golf-navi.com/about/)`。偽装しない。TLS検証は無効化しない
- 取得前にそのホストの robots.txt を確認し、禁止パスは取らない（`scripts/crawler/lib/robots.mjs`）。robots.txt が無い(404)なら制限なし、403・5xx・接続失敗は取らない
- 1ホスト1秒以上の間隔。robots の `Crawl-delay` と台帳の `delay` の大きい方
- 429/5xx/タイムアウトは2回まで再試行（2秒・5秒）。403/404/405は確定。1回の実行のページ数に上限（既定200）
- 取るのは `data/crawler/sources.json` で `status: "allowed"` の情報源だけ。`pending` `excluded` `blocked` `out_of_scope` は取らない（規約・robotsで禁止されているところは取らない）
- 保存するのは事実項目（大会名・日程・開催地・会場・主催）と元ページのURLのみ。本文・画像は保存しない

## 構成

| ファイル | 役割 |
| --- | --- |
| `scripts/crawl-events.mjs` | ドライバ。台帳を読み、readerを実行し、CSV/JSON/レポートを書く |
| `scripts/crawler/lib/http.mjs` | 礼儀正しい取得（robots・間隔・再試行・上限・文字コード判定） |
| `scripts/crawler/lib/robots.mjs` | robots.txt の解釈 |
| `scripts/crawler/lib/dates.mjs` | 日本語の日付表記（年度補完・複数日・月またぎ・令和表記・曜日の整合チェック）。年や日が確定できないときは推測せず空にして理由を残す |
| `scripts/crawler/lib/event.mjs` | 種別（大会/研修・講習/会議・総会/その他）、状態（開催予定/開催済み/日程未定）、重複判定キー |
| `scripts/crawler/lib/html.mjs` | 依存なしの小さなHTML読み取り |
| `scripts/crawler/sources/*.mjs` | 情報源ごとのreader（下の表） |

## 実装済みのreader

| id | 情報源 | 取るもの | メモ |
| --- | --- | --- | --- |
| `pref-saga` | 佐賀県 大会スケジュール | 日程・大会名・開催地・会場（表） | 行クラスで県内/県外/大会以外を判定 |
| `pref-kagawa` | 香川県 `/games/` 開催予定 | 開催日・大会名。案内ページ（`/info/`）から会場・市・申込締切 | `/taikai/` `/result/` `/pdf/` `*.pdf` は取得しない。終わった大会の案内ページは取らない。一覧と案内ページの日付が違えば注意 |
| `pref-yamanashi` | 山梨県 `/tournament/`（1ページ目） | 開催日・大会名・詳細URL | 「結果」の一覧が中心で、開催予定はほぼ載らない。会場は取っていない |
| `pref-saitama` | 埼玉県 `/info/info.php`（開催速報） | 掲載の有無の監視のみ | 掲載があるときの形式が未確認のため、日付を推測せず「掲載あり」を注意に出す。トップの大会一覧は結果（過去）、年間予定はPDFのため対象外 |

## 出力の項目

`source_id, event_name, start_date, end_date, date_text, prefecture, city, venue, application_deadline, organizer, event_type, scope, event_status, official_source, publishable, source_url, last_checked_at, key`

- `scope`: `in_prefecture`（県内の大会）/ `out_of_prefecture`（県外の大会）/ `not_event`（会議・研修など）
- `publishable`: `not_event` ではなく、`開催予定`（今日以降）で日程が確定しているもの。**公開前には必ず人が確認する**
- `official_source`: 台帳の `official`（千葉の町会サイトのような非公式の情報源は false）
- `key`: 都道府県＋開始日＋大会名（記号・全角半角を除いたもの）。複数の情報源の重複判定に使う

## 情報源（reader）を追加する手順

1. 台帳（`data/crawler/sources.json`）で、その情報源が `allowed` で、robots・規約に問題がないことを確認する（`pending` のものは先に確認する）
2. 台帳の情報源に `reader`（readerのid）、`prefecture`、`organizer` を足す
3. `scripts/crawler/sources/<id>.mjs` に `id`、`run(ctx)`、解析関数を作る。**構造が変わったときは黙って0件にせず、`notes` に理由を返す**
4. テスト用の**合成HTML**（実ページのコピーはfixtureにしない）で解析関数のテストを書く
5. `scripts/crawl-events.mjs` の `READERS` に登録し、実際に1回動かして、会場・日付・種別を1件ずつ目で確認する。2回目も同じ結果になることを確認する

## 今後（未実装）

- 神戸市（年間行事予定）、金沢市、薩摩川内市（全競技からGG抽出）、島根県（年度別ページ）、富山・滋賀のreader
- 埼玉県の開催速報に掲載が出たときの形式に合わせた読み取り
- 山梨県の詳細ページ（会場・要項）と2ページ目以降
- 差分検知（前回の出力との比較）、「開催済みでもう消えた」の検知（完全な一覧を取得できる情報源のみ）
- 定期実行（GitHub Actions の `workflow_dispatch` を外部のcronから呼ぶ方式を想定。ノウハウ文書の方針どおり）
- DBへの取り込み（出力→確認→取り込みの手順）
