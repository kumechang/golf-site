# 記事の図解（SVG）

`public/diagrams/*.svg` を記事の `<figure class="diagram">` から `<img>` で読み込む。スタイルは `src/styles/global.css` の `figure.diagram`。

| 図 | 置いている記事 | 根拠 |
| --- | --- | --- |
| `play-flow` | basic-rules（プレーの基本的な流れ） | JGGAルール第4・6・10条 |
| `hole-post` | basic-rules（ホールポストへの入れ方） | 第4・13条。寸法は未確認のため載せていない |
| `course-distances` | how-to-hit-and-distance | 第16条（50/30/25/15m各2ホール）。配置は描かない |
| `scoring-flow` | how-to-score | 第4・9条ほか（反則は1打付加、から振りは数えない） |
| `tournament-ranges` | tournament-overview | JGGAでは未確認の一般的な目安。階段・矢印・番号は使わない |
| `compare-three` | vs-gateball-parkgolf | 記事の比較表のみ（alt は空。表と同じ内容） |
| `fouls` | fouls-and-manners | 第9条。押し出し・かき寄せの絵は一般的なイメージ |

## 作るときの約束

- スマホ基準：`viewBox` 幅は 360。343px 表示で文字が実効 13px 以上になるよう、`font-size` は 14 以上（本文15）。幅640で作ると約0.53倍に縮んで読めなくなる（一度失敗した）。
- 全 SVG に `role="img"`、`<title>`、`<desc>`。色だけで区別せず、記号・線種・文字を併用する。
- 公式で確認できない寸法・配置・定義は描かない。描くときは「イメージです」と図に書く。
- alt は短く（図の名前と中身）。説明は figcaption と本文に書く。
- 図を直したら、375px と 320px で横にはみ出さないこと、文字が読めることを確認する。
