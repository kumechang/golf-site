# Gemini画像生成プロンプト集

> **2026-10-05 全面改訂（ホールポストの形状を公式ルールに合わせて修正）**
> 以前の版は、ホールポストを「支柱にチェーンリングが付いた形」「地面に穴を掘ったカップ」と指示しており、**誤りでした**。
> JGGA（日本グラウンド・ゴルフ協会）の公式ルールでは、ホールポストは「**地面に置く低い輪（ホール。底円の外径36cm・上円20cm・高さ約11cmのかご状で、中央に鈴）と、そこから立つ番号旗付きのポール**」で、ボールがホール内に入って静止した状態が「トマリ（ホールイン）」です。
> このファイルのプロンプトは、すべてこの形状で書き直しました。旧プロンプトは削除済みです。

## 使い方

1. 各プロンプトは **「Style〜Subject〜IMPORTANT（用具）〜Avoid〜Format」を1つのブロックとして丸ごと** Gemini に貼り付ける（一部だけ貼ると、実写で生成されることが実際にあった）。
2. **可能なら、実物のホールポストの写真を参考画像として一緒に添付する**（JGGAや各県協会のサイト、メーカー商品ページなど。ただし、この画像そのものを生成物に写し込まないこと）。Geminiは「低い輪＋中央のポール」の立体形状を文章だけでは崩しがちで、参考画像があると精度が大きく上がる。添付する場合は「Draw the hole-post to match the attached reference photo's shape, but as an illustration.」を末尾に足す。
3. **4案くらい生成して、下の「確認チェックリスト」を満たすものを選ぶ**。
4. 保存は **同じファイル名で `src/assets/illustrations/` に上書き**（GitHubの画面からmainへアップロードでOK）。コード側の変更は不要（altの見直しはこちらで行う）。

## 確認チェックリスト（ホールポストが写っている画像）

- [ ] 的が**地面に置かれた低い輪**になっている（地面に穴・カップは無い）
- [ ] 輪の中央から**ポールが立ち、番号の旗**が付いている
- [ ] ポールの途中に**輪やチェーンが吊られていない**
- [ ] ボールは**カラーの単色（白いゴルフボールではない）**
- [ ] クラブは**木製の太い頭**のもの（金属のゴルフクラブではない）
- [ ] 意図しない文字（崩れた日本語・ロゴ）が入っていない
- [ ] 実写風になっていない（イラストになっている）

## 一覧（再生成が必要なもの）

| # | 画像ファイル | 使用箇所 | 優先度 |
|---|------|------|--------|
| A | `hero-course-scene.jpg` | トップページ最上部（`index.astro`） | 必須 |
| B | `rules-scorecard-check.jpg` | `/rules/` カテゴリ一覧のヘッダー（`category-images.ts`） | 必須 |
| C | `course-overview.jpg` | 「グラウンドゴルフとは？」本文（`article-images.ts`） | 必須 |
| D | `diverse-players-group.jpg` | 「どんな人におすすめ？」本文 | 必須 |
| E | `hobby-crossroads.jpg` | 「定年後の趣味の選び方」本文 | 必須 |
| F | `guide-swing.jpg` | `/guide/` カテゴリ一覧のヘッダー | 必須 |
| G | `community-highfive.jpg` | `/start/` カテゴリ一覧のヘッダー | 必須 |
| H | `find-a-class-teaching.jpg` | 「体験教室の探し方」本文 | 必須 |
| I | `manners-comparison.jpg` | 「ファウルとマナー」本文 | 必須 |
| J | `tournament-scene.jpg` | 「大会に出てみたい人向けガイド」本文 | 推奨 |
| K | `community-gathering.jpg` | `/community/` カテゴリ一覧のヘッダー | 推奨 |
| L | `sports-comparison.jpg` | 「グラウンドゴルフ・ゲートボール・パークゴルフの違い」本文 | 必須 |
| M | `gentle-movement.jpg` | 「膝や腰に負担をかけたくない人向けの運動」本文 | 推奨 |

「必須」は、誤った形のホールポスト（鎖の輪・地面のカップ）がはっきり描かれているもの。「推奨」は、誤りが軽微（番号看板だけの支柱、クラブがゴルフ用など）なもの。

## 共通スタイルガイド

各プロンプトに内蔵済み（コピペ不要）。画風を調整したいときは、このスタイル部分は変えずに被写体の記述だけ変えること。

```
Style: warm, semi-realistic Japanese digital illustration (similar to anime/light-novel
background art), clean confident linework, soft cel-shading with gentle gradients, warm
natural outdoor lighting, lush green park/lawn setting, soft background bokeh, natural
realistic human proportions (NOT chibi, NOT flat vector icon style), muted warm color
palette dominated by greens and earth tones with occasional color accents, calm and
inviting mood. Japanese people should look active, dignified, and genuinely happy —
never frail, exaggerated, or caricatured.
```

---

## A. ホームページ ヒーロー

**保存先**: `src/assets/illustrations/hero-course-scene.jpg`（上書き）　**使用箇所**: トップページ最上部（`index.astro`）　**優先度**: 必須

**狙い**: 男性がホールポストに向かって構える導入カット。人物の頭〜足元まで画面内に余白を残す（モバイルでもトリミングで切れないように）。

```
Wide landscape illustration. This must be a hand-drawn/painted digital illustration — NOT a photograph,
NOT a photorealistic 3D render.

Style: warm, semi-realistic Japanese digital illustration (similar to anime/light-novel
background art), clean confident linework, soft cel-shading with gentle gradients, warm
natural outdoor lighting, lush green park/lawn setting, soft background bokeh, natural
realistic human proportions (NOT chibi, NOT flat vector icon style), muted warm color
palette dominated by greens and earth tones with occasional color accents, calm and
inviting mood. Japanese people should look active, dignified, and genuinely happy —
never frail, exaggerated, or caricatured.

Subject: A cheerful Japanese man in his late 60s with short grey hair, wearing a navy polo shirt,
beige trousers, a white cap and brown walking shoes, standing at the address position
with a ground-golf club, leaning gently forward, about to roll a bright orange ball along
the grass. He is in the right third of the frame with his whole body AND head fully
visible, with comfortable empty margin above his head and around him. A single ground-golf
hole-post (numeral "4" on its flag) stands about 15-20 m away in the center-left, drawn
small but with the low ring on the grass and the pole clearly recognizable. Wide, well-
kept lawn park, tall leafy trees in soft-focus background, bright blue sky with a few soft
clouds. Open negative space on the left third. Warm, healthy, active mood — not strenuous
or competitive.

IMPORTANT — EQUIPMENT ACCURACY. Draw the ground-golf "hole-post" (the target) exactly
like this; it is NOT a golf cup and NOT a chain ring hanging on a pole:
 (1) A LOW metal ring-shaped frame lies on the grass surface itself. It is a squat,
     shallow, open frame made of thin silver/white metal wire or bands, like a very low
     lampshade frame or a short wire basket with no bottom: wider at the base (about
     36 cm across, roughly the width of a large serving tray) and narrowing to a smaller
     circular opening at the top (about 20 cm across). It is only about 11 cm tall —
     about the height of a drink can. The small ball easily fits inside it.
 (2) A thin straight metal pole stands upright from the CENTER of this low ring, rising
     to roughly waist-to-chest height (about 1 m), with a small flat square flag/plate
     carrying one large numeral near the top of the pole. A tiny bell sits at the
     center of the ring where the pole meets it.
 (3) The ring sits ON the lawn. Absolutely NO hole or cup dug into the ground, NO flag
     standing in a cup, NO chain-link rings, NO ring or hoop attached around the pole at
     knee/hip/chest height, NO putting green, NO sand bunker.
 (4) Scoring means the ball has rolled INTO the low ring and stopped there.

Ground-golf gear: the club is a single wooden mallet-style club — a short, thick,
barrel-shaped wooden head with a flat striking face on a straight shaft of about 85 cm
with a wrapped grip (NOT a metal golf iron/putter, NOT a croquet mallet with a very
long head). The ball is a smooth solid ball about 6 cm across in a bright single color
(orange, yellow, red, blue or pink) — NOT a white golf ball.

Avoid: any legible text or Japanese characters (except the simple numerals noted),
logos, brand names, specific real commercial product designs, photorealistic rendering,
photographic realism, watermarks, harsh shadows, dark/moody lighting.
Format: 16:9 landscape, as high resolution as possible, high detail, illustrated/
painted style (not a photograph).
```

---

## B. rules カテゴリ

**保存先**: `src/assets/illustrations/rules-scorecard-check.jpg`（上書き）　**使用箇所**: `/rules/` カテゴリ一覧のヘッダー（`category-images.ts`）　**優先度**: 必須

**狙い**: 「トマリ（ホールイン）を確認する」落ち着いた場面。審判ではなく、確かめて微笑むイメージ。

```
Landscape illustration, medium close-up. This must be a hand-drawn/painted digital illustration — NOT a photograph,
NOT a photorealistic 3D render.

Style: warm, semi-realistic Japanese digital illustration (similar to anime/light-novel
background art), clean confident linework, soft cel-shading with gentle gradients, warm
natural outdoor lighting, lush green park/lawn setting, soft background bokeh, natural
realistic human proportions (NOT chibi, NOT flat vector icon style), muted warm color
palette dominated by greens and earth tones with occasional color accents, calm and
inviting mood. Japanese people should look active, dignified, and genuinely happy —
never frail, exaggerated, or caricatured.

Subject: A Japanese senior woman in her 60s, wearing a straw sun hat and a light cardigan,
crouching slightly on a grass lawn and smiling gently while checking that her orange ball
has come to rest INSIDE the low ring of a ground-golf hole-post; one hand points toward
the ball inside the ring. Her wooden ground-golf club rests lightly in her other hand.
The hole-post is large in the frame beside her (numeral "5" on the flag) so the low ring,
the center pole and the ball inside the ring are all clearly visible. Soft-focus green
park background with trees and distant hills. Bright, clear, calm mood — conveys
"checking carefully" without looking stern or official.

IMPORTANT — EQUIPMENT ACCURACY. Draw the ground-golf "hole-post" (the target) exactly
like this; it is NOT a golf cup and NOT a chain ring hanging on a pole:
 (1) A LOW metal ring-shaped frame lies on the grass surface itself. It is a squat,
     shallow, open frame made of thin silver/white metal wire or bands, like a very low
     lampshade frame or a short wire basket with no bottom: wider at the base (about
     36 cm across, roughly the width of a large serving tray) and narrowing to a smaller
     circular opening at the top (about 20 cm across). It is only about 11 cm tall —
     about the height of a drink can. The small ball easily fits inside it.
 (2) A thin straight metal pole stands upright from the CENTER of this low ring, rising
     to roughly waist-to-chest height (about 1 m), with a small flat square flag/plate
     carrying one large numeral near the top of the pole. A tiny bell sits at the
     center of the ring where the pole meets it.
 (3) The ring sits ON the lawn. Absolutely NO hole or cup dug into the ground, NO flag
     standing in a cup, NO chain-link rings, NO ring or hoop attached around the pole at
     knee/hip/chest height, NO putting green, NO sand bunker.
 (4) Scoring means the ball has rolled INTO the low ring and stopped there.

Ground-golf gear: the club is a single wooden mallet-style club — a short, thick,
barrel-shaped wooden head with a flat striking face on a straight shaft of about 85 cm
with a wrapped grip (NOT a metal golf iron/putter, NOT a croquet mallet with a very
long head). The ball is a smooth solid ball about 6 cm across in a bright single color
(orange, yellow, red, blue or pink) — NOT a white golf ball.

Avoid: any legible text or Japanese characters (except the simple numerals noted),
logos, brand names, specific real commercial product designs, photorealistic rendering,
photographic realism, watermarks, harsh shadows, dark/moody lighting.
Format: 16:9 landscape, as high resolution as possible, high detail, illustrated/
painted style (not a photograph).
```

---

## C. what-is-ground-golf 記事挿絵

**保存先**: `src/assets/illustrations/course-overview.jpg`（上書き）　**使用箇所**: 「グラウンドゴルフとは？」本文（`article-images.ts`）　**優先度**: 必須

**狙い**: コース全体と、ホールポストの並び方が一目で分かる俯瞰カット。

```
Wide landscape illustration, elevated wide-angle view. This must be a hand-drawn/painted digital illustration — NOT a photograph,
NOT a photorealistic 3D render.

Style: warm, semi-realistic Japanese digital illustration (similar to anime/light-novel
background art), clean confident linework, soft cel-shading with gentle gradients, warm
natural outdoor lighting, lush green park/lawn setting, soft background bokeh, natural
realistic human proportions (NOT chibi, NOT flat vector icon style), muted warm color
palette dominated by greens and earth tones with occasional color accents, calm and
inviting mood. Japanese people should look active, dignified, and genuinely happy —
never frail, exaggerated, or caricatured.

Subject: An elevated wide-angle view across a gently curving green lawn park course with a
winding gravel path. Three ground-golf hole-posts (flags numbered "1", "2", "3") stand at
different distances across the grass — the "1" post large in the foreground, "2" in the
middle, "3" small in the distance — each drawn exactly as described below, with the low
ring clearly visible on the grass at its base. A bright orange ball lies a short distance
from the "1" post, and one ball rests inside the ring of the "2" post. Two or three small
figures of Japanese seniors play casually near the far posts; one person stands watching
near a bench. Tall trees line the background, bright blue sky with soft clouds. Conveys
the overall layout and the gentle, spacious nature of the sport.

IMPORTANT — EQUIPMENT ACCURACY. Draw the ground-golf "hole-post" (the target) exactly
like this; it is NOT a golf cup and NOT a chain ring hanging on a pole:
 (1) A LOW metal ring-shaped frame lies on the grass surface itself. It is a squat,
     shallow, open frame made of thin silver/white metal wire or bands, like a very low
     lampshade frame or a short wire basket with no bottom: wider at the base (about
     36 cm across, roughly the width of a large serving tray) and narrowing to a smaller
     circular opening at the top (about 20 cm across). It is only about 11 cm tall —
     about the height of a drink can. The small ball easily fits inside it.
 (2) A thin straight metal pole stands upright from the CENTER of this low ring, rising
     to roughly waist-to-chest height (about 1 m), with a small flat square flag/plate
     carrying one large numeral near the top of the pole. A tiny bell sits at the
     center of the ring where the pole meets it.
 (3) The ring sits ON the lawn. Absolutely NO hole or cup dug into the ground, NO flag
     standing in a cup, NO chain-link rings, NO ring or hoop attached around the pole at
     knee/hip/chest height, NO putting green, NO sand bunker.
 (4) Scoring means the ball has rolled INTO the low ring and stopped there.

Ground-golf gear: the club is a single wooden mallet-style club — a short, thick,
barrel-shaped wooden head with a flat striking face on a straight shaft of about 85 cm
with a wrapped grip (NOT a metal golf iron/putter, NOT a croquet mallet with a very
long head). The ball is a smooth solid ball about 6 cm across in a bright single color
(orange, yellow, red, blue or pink) — NOT a white golf ball.

Avoid: any legible text or Japanese characters (except the simple numerals noted),
logos, brand names, specific real commercial product designs, photorealistic rendering,
photographic realism, watermarks, harsh shadows, dark/moody lighting.
Format: 16:9 landscape, as high resolution as possible, high detail, illustrated/
painted style (not a photograph).
```

---

## D. who-is-it-for 記事挿絵

**保存先**: `src/assets/illustrations/diverse-players-group.jpg`（上書き）　**使用箇所**: 「どんな人におすすめ？」本文　**優先度**: 必須

**狙い**: 多様な年代・体力の人が一緒に楽しめることを示す集合カット。

```
Landscape illustration, group portrait composition. This must be a hand-drawn/painted digital illustration — NOT a photograph,
NOT a photorealistic 3D render.

Style: warm, semi-realistic Japanese digital illustration (similar to anime/light-novel
background art), clean confident linework, soft cel-shading with gentle gradients, warm
natural outdoor lighting, lush green park/lawn setting, soft background bokeh, natural
realistic human proportions (NOT chibi, NOT flat vector icon style), muted warm color
palette dominated by greens and earth tones with occasional color accents, calm and
inviting mood. Japanese people should look active, dignified, and genuinely happy —
never frail, exaggerated, or caricatured.

Subject: A relaxed group of four distinct Japanese individuals standing together on a grass lawn,
each holding a ground-golf club: an active-looking man in his 70s in an olive vest and
cap, a smiling woman in her 60s in a lavender cardigan, an older woman in her 80s in a
patterned knit cardigan with a light cane resting beside her, and a woman in her 50s in
a light-blue jacket who looks like she just arrived (curious expression). Varied natural
body language, all approachable and genuinely happy. Soft-focus green park with benches
and a path behind them. A ground-golf hole-post (numeral "4" on its flag) stands to the
right of the group, with an orange ball resting a short distance from it. Conveys
"this sport welcomes many different kinds of people."

IMPORTANT — EQUIPMENT ACCURACY. Draw the ground-golf "hole-post" (the target) exactly
like this; it is NOT a golf cup and NOT a chain ring hanging on a pole:
 (1) A LOW metal ring-shaped frame lies on the grass surface itself. It is a squat,
     shallow, open frame made of thin silver/white metal wire or bands, like a very low
     lampshade frame or a short wire basket with no bottom: wider at the base (about
     36 cm across, roughly the width of a large serving tray) and narrowing to a smaller
     circular opening at the top (about 20 cm across). It is only about 11 cm tall —
     about the height of a drink can. The small ball easily fits inside it.
 (2) A thin straight metal pole stands upright from the CENTER of this low ring, rising
     to roughly waist-to-chest height (about 1 m), with a small flat square flag/plate
     carrying one large numeral near the top of the pole. A tiny bell sits at the
     center of the ring where the pole meets it.
 (3) The ring sits ON the lawn. Absolutely NO hole or cup dug into the ground, NO flag
     standing in a cup, NO chain-link rings, NO ring or hoop attached around the pole at
     knee/hip/chest height, NO putting green, NO sand bunker.
 (4) Scoring means the ball has rolled INTO the low ring and stopped there.

Ground-golf gear: the club is a single wooden mallet-style club — a short, thick,
barrel-shaped wooden head with a flat striking face on a straight shaft of about 85 cm
with a wrapped grip (NOT a metal golf iron/putter, NOT a croquet mallet with a very
long head). The ball is a smooth solid ball about 6 cm across in a bright single color
(orange, yellow, red, blue or pink) — NOT a white golf ball.

Avoid: any legible text or Japanese characters (except the simple numerals noted),
logos, brand names, specific real commercial product designs, photorealistic rendering,
photographic realism, watermarks, harsh shadows, dark/moody lighting.
Format: 16:9 landscape, as high resolution as possible, high detail, illustrated/
painted style (not a photograph).
```

---

## E. retirement-hobby-comparison 記事挿絵

**保存先**: `src/assets/illustrations/hobby-crossroads.jpg`（上書き）　**使用箇所**: 「定年後の趣味の選び方」本文　**優先度**: 必須

**狙い**: 前向きに選ぶ場面。焦りや不安の表情にしない。

```
Landscape illustration. This must be a hand-drawn/painted digital illustration — NOT a photograph,
NOT a photorealistic 3D render.

Style: warm, semi-realistic Japanese digital illustration (similar to anime/light-novel
background art), clean confident linework, soft cel-shading with gentle gradients, warm
natural outdoor lighting, lush green park/lawn setting, soft background bokeh, natural
realistic human proportions (NOT chibi, NOT flat vector icon style), muted warm color
palette dominated by greens and earth tones with occasional color accents, calm and
inviting mood. Japanese people should look active, dignified, and genuinely happy —
never frail, exaggerated, or caricatured.

Subject: A thoughtful Japanese man in his late 60s with grey hair, wearing a brown patterned
cardigan and beige trousers, standing at a gentle fork in a park path, looking ahead with
a calm, curious expression. To the right, on the grass beside the path, a ground-golf club
leans against nothing (resting on the grass) next to an orange ball, with a ground-golf
hole-post (numeral "7") a little further behind them. To the left, in soft focus on a
wooden bench: a small potted bonsai, a watering can and a camera, suggesting other
hobbies without being the focus. Lush green trees, warm bright daylight, open and hopeful
mood — conveys "many good choices, take your time deciding."

IMPORTANT — EQUIPMENT ACCURACY. Draw the ground-golf "hole-post" (the target) exactly
like this; it is NOT a golf cup and NOT a chain ring hanging on a pole:
 (1) A LOW metal ring-shaped frame lies on the grass surface itself. It is a squat,
     shallow, open frame made of thin silver/white metal wire or bands, like a very low
     lampshade frame or a short wire basket with no bottom: wider at the base (about
     36 cm across, roughly the width of a large serving tray) and narrowing to a smaller
     circular opening at the top (about 20 cm across). It is only about 11 cm tall —
     about the height of a drink can. The small ball easily fits inside it.
 (2) A thin straight metal pole stands upright from the CENTER of this low ring, rising
     to roughly waist-to-chest height (about 1 m), with a small flat square flag/plate
     carrying one large numeral near the top of the pole. A tiny bell sits at the
     center of the ring where the pole meets it.
 (3) The ring sits ON the lawn. Absolutely NO hole or cup dug into the ground, NO flag
     standing in a cup, NO chain-link rings, NO ring or hoop attached around the pole at
     knee/hip/chest height, NO putting green, NO sand bunker.
 (4) Scoring means the ball has rolled INTO the low ring and stopped there.

Ground-golf gear: the club is a single wooden mallet-style club — a short, thick,
barrel-shaped wooden head with a flat striking face on a straight shaft of about 85 cm
with a wrapped grip (NOT a metal golf iron/putter, NOT a croquet mallet with a very
long head). The ball is a smooth solid ball about 6 cm across in a bright single color
(orange, yellow, red, blue or pink) — NOT a white golf ball.

Avoid: any legible text or Japanese characters (except the simple numerals noted),
logos, brand names, specific real commercial product designs, photorealistic rendering,
photographic realism, watermarks, harsh shadows, dark/moody lighting.
Format: 16:9 landscape, as high resolution as possible, high detail, illustrated/
painted style (not a photograph).
```

---

## F. guide カテゴリ

**保存先**: `src/assets/illustrations/guide-swing.jpg`（上書き）　**使用箇所**: `/guide/` カテゴリ一覧のヘッダー　**優先度**: 必須

**狙い**: クラブを構える人。ホールポストは奥に配置し、形がはっきり見えるように。

```
Landscape illustration. This must be a hand-drawn/painted digital illustration — NOT a photograph,
NOT a photorealistic 3D render.

Style: warm, semi-realistic Japanese digital illustration (similar to anime/light-novel
background art), clean confident linework, soft cel-shading with gentle gradients, warm
natural outdoor lighting, lush green park/lawn setting, soft background bokeh, natural
realistic human proportions (NOT chibi, NOT flat vector icon style), muted warm color
palette dominated by greens and earth tones with occasional color accents, calm and
inviting mood. Japanese people should look active, dignified, and genuinely happy —
never frail, exaggerated, or caricatured.

Subject: A Japanese man in his late 60s with grey hair, wearing a grey-and-cream polo shirt and
khaki trousers, in a calm address stance with a ground-golf club, his orange ball on the
grass in front of him, looking toward a ground-golf hole-post (numeral "1" on its flag)
standing about 10 m ahead on the left; a second hole-post (numeral "2") is visible
farther away in softer focus. Both posts show the low ring on the grass with the pole
rising from its center. Wide, well-kept lawn, trees and bright sky behind. Calm, focused,
friendly mood.

IMPORTANT — EQUIPMENT ACCURACY. Draw the ground-golf "hole-post" (the target) exactly
like this; it is NOT a golf cup and NOT a chain ring hanging on a pole:
 (1) A LOW metal ring-shaped frame lies on the grass surface itself. It is a squat,
     shallow, open frame made of thin silver/white metal wire or bands, like a very low
     lampshade frame or a short wire basket with no bottom: wider at the base (about
     36 cm across, roughly the width of a large serving tray) and narrowing to a smaller
     circular opening at the top (about 20 cm across). It is only about 11 cm tall —
     about the height of a drink can. The small ball easily fits inside it.
 (2) A thin straight metal pole stands upright from the CENTER of this low ring, rising
     to roughly waist-to-chest height (about 1 m), with a small flat square flag/plate
     carrying one large numeral near the top of the pole. A tiny bell sits at the
     center of the ring where the pole meets it.
 (3) The ring sits ON the lawn. Absolutely NO hole or cup dug into the ground, NO flag
     standing in a cup, NO chain-link rings, NO ring or hoop attached around the pole at
     knee/hip/chest height, NO putting green, NO sand bunker.
 (4) Scoring means the ball has rolled INTO the low ring and stopped there.

Ground-golf gear: the club is a single wooden mallet-style club — a short, thick,
barrel-shaped wooden head with a flat striking face on a straight shaft of about 85 cm
with a wrapped grip (NOT a metal golf iron/putter, NOT a croquet mallet with a very
long head). The ball is a smooth solid ball about 6 cm across in a bright single color
(orange, yellow, red, blue or pink) — NOT a white golf ball.

Avoid: any legible text or Japanese characters (except the simple numerals noted),
logos, brand names, specific real commercial product designs, photorealistic rendering,
photographic realism, watermarks, harsh shadows, dark/moody lighting.
Format: 16:9 landscape, as high resolution as possible, high detail, illustrated/
painted style (not a photograph).
```

---

## G. start カテゴリ

**保存先**: `src/assets/illustrations/community-highfive.jpg`（上書き）　**使用箇所**: `/start/` カテゴリ一覧のヘッダー　**優先度**: 必須

**狙い**: ホールインを喜ぶハイタッチ。既存の構図（周りの拍手、スタートマット、番号スタンド）を維持。

```
Landscape illustration. This must be a hand-drawn/painted digital illustration — NOT a photograph,
NOT a photorealistic 3D render.

Style: warm, semi-realistic Japanese digital illustration (similar to anime/light-novel
background art), clean confident linework, soft cel-shading with gentle gradients, warm
natural outdoor lighting, lush green park/lawn setting, soft background bokeh, natural
realistic human proportions (NOT chibi, NOT flat vector icon style), muted warm color
palette dominated by greens and earth tones with occasional color accents, calm and
inviting mood. Japanese people should look active, dignified, and genuinely happy —
never frail, exaggerated, or caricatured.

Subject: A cheerful celebration scene in a lush park: in the center a Japanese man in his 60s
(navy polo, beige trousers, white cap and glasses) raises his ground-golf club in one
hand and gives a joyful high-five to a smiling woman in her 60s (pink patterned polo,
dark trousers). Around them 6-7 other Japanese seniors in sporty outfits clap and smile,
holding clubs. On the left foreground, a woman in a dark vest stands next to a ground-golf
hole-post; an orange ball sits INSIDE its low ring (this is the ball that just scored).
At the lower right there is a flat green start mat on the grass and a small wooden box
holding spare clubs with a blank numbered placard. A bench and a golf-style bag sit in the
soft-focus background. Warm, community, joyful mood.

IMPORTANT — EQUIPMENT ACCURACY. Draw the ground-golf "hole-post" (the target) exactly
like this; it is NOT a golf cup and NOT a chain ring hanging on a pole:
 (1) A LOW metal ring-shaped frame lies on the grass surface itself. It is a squat,
     shallow, open frame made of thin silver/white metal wire or bands, like a very low
     lampshade frame or a short wire basket with no bottom: wider at the base (about
     36 cm across, roughly the width of a large serving tray) and narrowing to a smaller
     circular opening at the top (about 20 cm across). It is only about 11 cm tall —
     about the height of a drink can. The small ball easily fits inside it.
 (2) A thin straight metal pole stands upright from the CENTER of this low ring, rising
     to roughly waist-to-chest height (about 1 m), with a small flat square flag/plate
     carrying one large numeral near the top of the pole. A tiny bell sits at the
     center of the ring where the pole meets it.
 (3) The ring sits ON the lawn. Absolutely NO hole or cup dug into the ground, NO flag
     standing in a cup, NO chain-link rings, NO ring or hoop attached around the pole at
     knee/hip/chest height, NO putting green, NO sand bunker.
 (4) Scoring means the ball has rolled INTO the low ring and stopped there.

Ground-golf gear: the club is a single wooden mallet-style club — a short, thick,
barrel-shaped wooden head with a flat striking face on a straight shaft of about 85 cm
with a wrapped grip (NOT a metal golf iron/putter, NOT a croquet mallet with a very
long head). The ball is a smooth solid ball about 6 cm across in a bright single color
(orange, yellow, red, blue or pink) — NOT a white golf ball.

Avoid: any legible text or Japanese characters (except the simple numerals noted),
logos, brand names, specific real commercial product designs, photorealistic rendering,
photographic realism, watermarks, harsh shadows, dark/moody lighting.
Format: 16:9 landscape, as high resolution as possible, high detail, illustrated/
painted style (not a photograph).
```

---

## H. find-a-class 記事挿絵

**保存先**: `src/assets/illustrations/find-a-class-teaching.jpg`（上書き）　**使用箇所**: 「体験教室の探し方」本文　**優先度**: 必須

**狙い**: 優しく教わる体験教室。看板は文字なし（クラブとボールの絵記号のみ）にする。

```
Landscape illustration. This must be a hand-drawn/painted digital illustration — NOT a photograph,
NOT a photorealistic 3D render.

Style: warm, semi-realistic Japanese digital illustration (similar to anime/light-novel
background art), clean confident linework, soft cel-shading with gentle gradients, warm
natural outdoor lighting, lush green park/lawn setting, soft background bokeh, natural
realistic human proportions (NOT chibi, NOT flat vector icon style), muted warm color
palette dominated by greens and earth tones with occasional color accents, calm and
inviting mood. Japanese people should look active, dignified, and genuinely happy —
never frail, exaggerated, or caricatured.

Subject: A friendly beginner lesson in a sunny park: a smiling Japanese instructor in his 70s
(grey hair, glasses, navy polo, beige trousers) gently guiding the arm of a laughing
Japanese woman in her 40s (pink sweatshirt, dark leggings, sneakers) who is addressing a
ball with a wooden ground-golf club. Behind them, a small group of six beginners of
different ages wait their turn, smiling, holding clubs. Two ground-golf hole-posts
(numerals "1" and "2") stand in the mid-distance, each with the low ring on the grass and
colored balls scattered on the lawn. At the right a wooden signboard shows only a simple
icon of a club and ball with abstract squiggle lines (NO legible text). A path and a bench
in the background.

IMPORTANT — EQUIPMENT ACCURACY. Draw the ground-golf "hole-post" (the target) exactly
like this; it is NOT a golf cup and NOT a chain ring hanging on a pole:
 (1) A LOW metal ring-shaped frame lies on the grass surface itself. It is a squat,
     shallow, open frame made of thin silver/white metal wire or bands, like a very low
     lampshade frame or a short wire basket with no bottom: wider at the base (about
     36 cm across, roughly the width of a large serving tray) and narrowing to a smaller
     circular opening at the top (about 20 cm across). It is only about 11 cm tall —
     about the height of a drink can. The small ball easily fits inside it.
 (2) A thin straight metal pole stands upright from the CENTER of this low ring, rising
     to roughly waist-to-chest height (about 1 m), with a small flat square flag/plate
     carrying one large numeral near the top of the pole. A tiny bell sits at the
     center of the ring where the pole meets it.
 (3) The ring sits ON the lawn. Absolutely NO hole or cup dug into the ground, NO flag
     standing in a cup, NO chain-link rings, NO ring or hoop attached around the pole at
     knee/hip/chest height, NO putting green, NO sand bunker.
 (4) Scoring means the ball has rolled INTO the low ring and stopped there.

Ground-golf gear: the club is a single wooden mallet-style club — a short, thick,
barrel-shaped wooden head with a flat striking face on a straight shaft of about 85 cm
with a wrapped grip (NOT a metal golf iron/putter, NOT a croquet mallet with a very
long head). The ball is a smooth solid ball about 6 cm across in a bright single color
(orange, yellow, red, blue or pink) — NOT a white golf ball.

Avoid: any legible text or Japanese characters (except the simple numerals noted),
logos, brand names, specific real commercial product designs, photorealistic rendering,
photographic realism, watermarks, harsh shadows, dark/moody lighting.
Format: 16:9 landscape, as high resolution as possible, high detail, illustrated/
painted style (not a photograph).
```

---

## I. fouls-and-manners 記事挿絵

**保存先**: `src/assets/illustrations/manners-comparison.jpg`（上書き）　**使用箇所**: 「ファウルとマナー」本文　**優先度**: 必須

**狙い**: 「離れて待つ（良い例）」と「近くに立たない（悪い例）」の左右対比。ホールポストは足元ではなく奥に置く。

```
Wide landscape illustration, split into two equal side-by-side panels separated by a thin dark vertical line. This must be a hand-drawn/painted digital illustration — NOT a photograph,
NOT a photorealistic 3D render.

Style: warm, semi-realistic Japanese digital illustration (similar to anime/light-novel
background art), clean confident linework, soft cel-shading with gentle gradients, warm
natural outdoor lighting, lush green park/lawn setting, soft background bokeh, natural
realistic human proportions (NOT chibi, NOT flat vector icon style), muted warm color
palette dominated by greens and earth tones with occasional color accents, calm and
inviting mood. Japanese people should look active, dignified, and genuinely happy —
never frail, exaggerated, or caricatured.

Subject: LEFT panel ("good example"): a Japanese man in his 70s in a straw hat and polo shirt
addresses an orange ball with a ground-golf club, while three other players stand
politely well off to the side and behind him, hands together, smiling and waiting.
RIGHT panel ("bad example"): the same man in the same stance, but another player stands
right next to him and leans in, peering over his shoulder, in the swing area; the player
looks slightly worried. In both panels a ground-golf hole-post (low ring on the grass with
a center pole and numeral flag) stands far ahead in the middle distance — NOT at the
player's feet. Soft late-afternoon light, distant hills and trees.

Text: add only these short Japanese labels, in a clean bold rounded font in a white band
across the top of each panel — left: 良い例 (with a green circle mark and check), right:
悪い例 (with a red cross mark). Small callouts: left 離れて待つ, right 近くに立たない.
Spell them exactly; if you cannot render the Japanese correctly, leave the top band
blank with no text at all.

IMPORTANT — EQUIPMENT ACCURACY. Draw the ground-golf "hole-post" (the target) exactly
like this; it is NOT a golf cup and NOT a chain ring hanging on a pole:
 (1) A LOW metal ring-shaped frame lies on the grass surface itself. It is a squat,
     shallow, open frame made of thin silver/white metal wire or bands, like a very low
     lampshade frame or a short wire basket with no bottom: wider at the base (about
     36 cm across, roughly the width of a large serving tray) and narrowing to a smaller
     circular opening at the top (about 20 cm across). It is only about 11 cm tall —
     about the height of a drink can. The small ball easily fits inside it.
 (2) A thin straight metal pole stands upright from the CENTER of this low ring, rising
     to roughly waist-to-chest height (about 1 m), with a small flat square flag/plate
     carrying one large numeral near the top of the pole. A tiny bell sits at the
     center of the ring where the pole meets it.
 (3) The ring sits ON the lawn. Absolutely NO hole or cup dug into the ground, NO flag
     standing in a cup, NO chain-link rings, NO ring or hoop attached around the pole at
     knee/hip/chest height, NO putting green, NO sand bunker.
 (4) Scoring means the ball has rolled INTO the low ring and stopped there.

Ground-golf gear: the club is a single wooden mallet-style club — a short, thick,
barrel-shaped wooden head with a flat striking face on a straight shaft of about 85 cm
with a wrapped grip (NOT a metal golf iron/putter, NOT a croquet mallet with a very
long head). The ball is a smooth solid ball about 6 cm across in a bright single color
(orange, yellow, red, blue or pink) — NOT a white golf ball.

Avoid: any other text, logos, brand names, specific real commercial product designs,
photorealistic rendering, photographic realism, watermarks, harsh shadows.
Format: 16:9 landscape, as high resolution as possible, high detail, illustrated/
painted style (not a photograph).
```

---

## J. entering-a-tournament 記事挿絵

**保存先**: `src/assets/illustrations/tournament-scene.jpg`（上書き）　**使用箇所**: 「大会に出てみたい人向けガイド」本文　**優先度**: 推奨

**狙い**: 大会の和やかな雰囲気。看板・得点表の文字は最小限、人名は入れない。

```
Landscape illustration. This must be a hand-drawn/painted digital illustration — NOT a photograph,
NOT a photorealistic 3D render.

Style: warm, semi-realistic Japanese digital illustration (similar to anime/light-novel
background art), clean confident linework, soft cel-shading with gentle gradients, warm
natural outdoor lighting, lush green park/lawn setting, soft background bokeh, natural
realistic human proportions (NOT chibi, NOT flat vector icon style), muted warm color
palette dominated by greens and earth tones with occasional color accents, calm and
inviting mood. Japanese people should look active, dignified, and genuinely happy —
never frail, exaggerated, or caricatured.

Subject: A friendly local ground-golf tournament in a park: around ten Japanese seniors and
middle-aged players wear numbered bibs (large numerals only) and chat, drink water and wait
their turn, holding wooden clubs. A string banner hangs between two trees reading
"第8回 地域交流グラウンドゴルフ大会". On the right, a wooden score board titled
"得点記録" has a simple grid with a heading "Aグループ" and rows of only numerals (NO
personal names), and a young woman in a numbered bib points at it. Folding chairs, a
club bag and a few colored balls on the grass at the left. In the soft-focus background,
two ground-golf hole-posts (numerals "1" and "2") with their low rings on the grass, and
a few players mid-game. Sunny, lively, welcoming mood.

Text: only the banner text, "得点記録", "Aグループ" and numerals. Spell exactly; if the
Japanese cannot be rendered correctly, leave the banner and board heading blank.

IMPORTANT — EQUIPMENT ACCURACY. Draw the ground-golf "hole-post" (the target) exactly
like this; it is NOT a golf cup and NOT a chain ring hanging on a pole:
 (1) A LOW metal ring-shaped frame lies on the grass surface itself. It is a squat,
     shallow, open frame made of thin silver/white metal wire or bands, like a very low
     lampshade frame or a short wire basket with no bottom: wider at the base (about
     36 cm across, roughly the width of a large serving tray) and narrowing to a smaller
     circular opening at the top (about 20 cm across). It is only about 11 cm tall —
     about the height of a drink can. The small ball easily fits inside it.
 (2) A thin straight metal pole stands upright from the CENTER of this low ring, rising
     to roughly waist-to-chest height (about 1 m), with a small flat square flag/plate
     carrying one large numeral near the top of the pole. A tiny bell sits at the
     center of the ring where the pole meets it.
 (3) The ring sits ON the lawn. Absolutely NO hole or cup dug into the ground, NO flag
     standing in a cup, NO chain-link rings, NO ring or hoop attached around the pole at
     knee/hip/chest height, NO putting green, NO sand bunker.
 (4) Scoring means the ball has rolled INTO the low ring and stopped there.

Ground-golf gear: the club is a single wooden mallet-style club — a short, thick,
barrel-shaped wooden head with a flat striking face on a straight shaft of about 85 cm
with a wrapped grip (NOT a metal golf iron/putter, NOT a croquet mallet with a very
long head). The ball is a smooth solid ball about 6 cm across in a bright single color
(orange, yellow, red, blue or pink) — NOT a white golf ball.

Avoid: personal names, any other text, logos, brand names, photorealistic rendering,
photographic realism, watermarks, harsh shadows.
Format: 16:9 landscape, as high resolution as possible, high detail, illustrated/
painted style (not a photograph).
```

---

## K. community カテゴリ

**保存先**: `src/assets/illustrations/community-gathering.jpg`（上書き）　**使用箇所**: `/community/` カテゴリ一覧のヘッダー　**優先度**: 推奨

**狙い**: ベンチでの談笑。背景のホールポストだけ正しい形にする。

```
Landscape illustration. This must be a hand-drawn/painted digital illustration — NOT a photograph,
NOT a photorealistic 3D render.

Style: warm, semi-realistic Japanese digital illustration (similar to anime/light-novel
background art), clean confident linework, soft cel-shading with gentle gradients, warm
natural outdoor lighting, lush green park/lawn setting, soft background bokeh, natural
realistic human proportions (NOT chibi, NOT flat vector icon style), muted warm color
palette dominated by greens and earth tones with occasional color accents, calm and
inviting mood. Japanese people should look active, dignified, and genuinely happy —
never frail, exaggerated, or caricatured.

Subject: A small group of four Japanese seniors after a ground-golf session near a wooden park
bench: a grey-haired woman in a beige cardigan sits on the bench laughing and holding a
blank notepad and pencil, a grey-haired man in a navy polo sits beside her and gestures
as he talks; a smiling woman in a bucket hat and green vest and a tall man in a brown
jacket stand on the right, both resting their hands on wooden clubs. Wooden clubs lean on
the bench. In the soft-focus lawn behind them, three ground-golf hole-posts (numerals
"2", "3", "4") with their low rings on the grass, and a few distant players in mid-swing.
Lush trees, a sandy path at the right, warm daylight. Relaxed, friendly community mood —
belonging, not competition.

IMPORTANT — EQUIPMENT ACCURACY. Draw the ground-golf "hole-post" (the target) exactly
like this; it is NOT a golf cup and NOT a chain ring hanging on a pole:
 (1) A LOW metal ring-shaped frame lies on the grass surface itself. It is a squat,
     shallow, open frame made of thin silver/white metal wire or bands, like a very low
     lampshade frame or a short wire basket with no bottom: wider at the base (about
     36 cm across, roughly the width of a large serving tray) and narrowing to a smaller
     circular opening at the top (about 20 cm across). It is only about 11 cm tall —
     about the height of a drink can. The small ball easily fits inside it.
 (2) A thin straight metal pole stands upright from the CENTER of this low ring, rising
     to roughly waist-to-chest height (about 1 m), with a small flat square flag/plate
     carrying one large numeral near the top of the pole. A tiny bell sits at the
     center of the ring where the pole meets it.
 (3) The ring sits ON the lawn. Absolutely NO hole or cup dug into the ground, NO flag
     standing in a cup, NO chain-link rings, NO ring or hoop attached around the pole at
     knee/hip/chest height, NO putting green, NO sand bunker.
 (4) Scoring means the ball has rolled INTO the low ring and stopped there.

Ground-golf gear: the club is a single wooden mallet-style club — a short, thick,
barrel-shaped wooden head with a flat striking face on a straight shaft of about 85 cm
with a wrapped grip (NOT a metal golf iron/putter, NOT a croquet mallet with a very
long head). The ball is a smooth solid ball about 6 cm across in a bright single color
(orange, yellow, red, blue or pink) — NOT a white golf ball.

Avoid: any legible text or Japanese characters (except the simple numerals noted),
logos, brand names, specific real commercial product designs, photorealistic rendering,
photographic realism, watermarks, harsh shadows, dark/moody lighting.
Format: 16:9 landscape, as high resolution as possible, high detail, illustrated/
painted style (not a photograph).
```

---

## L. vs-gateball-parkgolf 記事挿絵

**保存先**: `src/assets/illustrations/sports-comparison.jpg`（上書き）　**使用箇所**: 「グラウンドゴルフ・ゲートボール・パークゴルフの違い」本文　**優先度**: 必須

**狙い**: 3競技の道具を並べて比較。グラウンドゴルフの欄を正しい形状に。日本語見出し付き。

```
Wide landscape illustration, three equal side-by-side panels on soft green grass. This must be a hand-drawn/painted digital illustration — NOT a photograph,
NOT a photorealistic 3D render.

Style: warm, semi-realistic Japanese digital illustration (similar to anime/light-novel
background art), clean confident linework, soft cel-shading with gentle gradients, warm
natural outdoor lighting, lush green park/lawn setting, soft background bokeh, natural
realistic human proportions (NOT chibi, NOT flat vector icon style), muted warm color
palette dominated by greens and earth tones with occasional color accents, calm and
inviting mood. Japanese people should look active, dignified, and genuinely happy —
never frail, exaggerated, or caricatured.

Subject: Three vertical panels, each with its title at the top in a clean bold rounded Japanese
font. LEFT panel title: グラウンドゴルフ — shows a wooden mallet-style ground-golf club
(short barrel-shaped head), a bright red ball (about 6 cm), and a ground-golf hole-post
exactly as described below (low silver ring on the grass with a center pole and a small
numbered flag). MIDDLE panel title: ゲートボール — shows a T-shaped wooden mallet with a
cylindrical head, a numbered ball, two small inverted-U metal gates and a short goal
pole. RIGHT panel title: パークゴルフ — shows a golf-like club with a wooden head, a
slightly larger dark ball and a real cup hole in the ground with a small flag. All three
panels are drawn at a consistent scale with the same soft light; each panel has a slightly
different pale green/yellow tint.

Text: only the three titles グラウンドゴルフ / ゲートボール / パークゴルフ, spelled exactly,
and single numerals. If you cannot render the Japanese correctly, leave the titles blank.

IMPORTANT — EQUIPMENT ACCURACY. Draw the ground-golf "hole-post" (the target) exactly
like this; it is NOT a golf cup and NOT a chain ring hanging on a pole:
 (1) A LOW metal ring-shaped frame lies on the grass surface itself. It is a squat,
     shallow, open frame made of thin silver/white metal wire or bands, like a very low
     lampshade frame or a short wire basket with no bottom: wider at the base (about
     36 cm across, roughly the width of a large serving tray) and narrowing to a smaller
     circular opening at the top (about 20 cm across). It is only about 11 cm tall —
     about the height of a drink can. The small ball easily fits inside it.
 (2) A thin straight metal pole stands upright from the CENTER of this low ring, rising
     to roughly waist-to-chest height (about 1 m), with a small flat square flag/plate
     carrying one large numeral near the top of the pole. A tiny bell sits at the
     center of the ring where the pole meets it.
 (3) The ring sits ON the lawn. Absolutely NO hole or cup dug into the ground, NO flag
     standing in a cup, NO chain-link rings, NO ring or hoop attached around the pole at
     knee/hip/chest height, NO putting green, NO sand bunker.
 (4) Scoring means the ball has rolled INTO the low ring and stopped there.

Avoid: any other text, logos, brand names, specific real commercial product designs,
photorealistic rendering, photographic realism, watermarks, harsh shadows.
Format: 16:9 landscape, as high resolution as possible, high detail, illustrated/
painted style (not a photograph).
```

---

## M. gentle-exercise-comparison 記事挿絵

**保存先**: `src/assets/illustrations/gentle-movement.jpg`（上書き）　**使用箇所**: 「膝や腰に負担をかけたくない人向けの運動」本文　**優先度**: 推奨

**狙い**: 現状は金属のパターと白いボールで、ゴルフに見える。グラウンドゴルフの木製クラブとカラーボールに直す。

```
Landscape illustration. This must be a hand-drawn/painted digital illustration — NOT a photograph,
NOT a photorealistic 3D render.

Style: warm, semi-realistic Japanese digital illustration (similar to anime/light-novel
background art), clean confident linework, soft cel-shading with gentle gradients, warm
natural outdoor lighting, lush green park/lawn setting, soft background bokeh, natural
realistic human proportions (NOT chibi, NOT flat vector icon style), muted warm color
palette dominated by greens and earth tones with occasional color accents, calm and
inviting mood. Japanese people should look active, dignified, and genuinely happy —
never frail, exaggerated, or caricatured.

Subject: A Japanese senior woman in her 70s with short grey hair, wearing a soft green cardigan,
a cream top, brown trousers and comfortable brown shoes, standing comfortably upright on a
sunlit lawn and gently addressing a ground-golf ball at her feet with a relaxed,
un-strained posture (knees only slightly bent, relaxed shoulders), the wooden mallet-style
ground-golf club held lightly in both hands, a peaceful content expression. A bright
orange ball sits on the grass in front of the club head. Soft-focus green park background
with big trees and warm gentle sunlight. Calm, reassuring, low-impact mood — emphasizing
ease rather than athletic exertion. No hole-post is needed in this image.

Ground-golf gear: the club is a single wooden mallet-style club — a short, thick,
barrel-shaped wooden head with a flat striking face on a straight shaft of about 85 cm
with a wrapped grip (NOT a metal golf iron/putter, NOT a croquet mallet with a very
long head). The ball is a smooth solid ball about 6 cm across in a bright single color
(orange, yellow, red, blue or pink) — NOT a white golf ball.

Avoid: any legible text or Japanese characters (except the simple numerals noted),
logos, brand names, specific real commercial product designs, photorealistic rendering,
photographic realism, watermarks, harsh shadows, dark/moody lighting. Also avoid any pose that looks strained or athletic/competitive.
Format: 16:9 landscape, as high resolution as possible, high detail, illustrated/
painted style (not a photograph).
```

---

## 参考：ホールポストを含まない既存プロンプト（再生成不要・配線済み）

以下は誤りのない画像の元プロンプト。履歴として残す。

---

## 4. best-club-sets 記事挿絵

**用途**: 「【比較】グラウンドゴルフ初心者向けクラブセットおすすめ7選」の本文挿絵。

**狙い**: 実在の商品（Amazonで販売中の具体的な商品）を描かず、「複数の中から選ぶ」比較のイメージだけを表現する。**実物と異なる特定商品の絵は誤解を招くため厳禁。**

```
Landscape illustration.

Style: warm, semi-realistic Japanese digital illustration (similar to anime/light-novel
background art), clean confident linework, soft cel-shading with gentle gradients, warm
natural outdoor lighting, soft background bokeh, muted warm color palette.
Avoid: any legible text, logos, brand names, and — important — do NOT depict any real
or specific commercial product design, packaging, or logo. All clubs must look generic
and unbranded (plain wood-tone shafts, simple mallet heads, no printed markings).
Format: 16:9 landscape, approximately 1400x768px, high detail.

Subject: Close-up scene on a wooden park bench: four or five different generic
(unbranded) ground golf clubs of varying wood-tone colors and slightly different
mallet-head shapes, leaning neatly in a row against the bench. Soft morning sunlight,
blurred green park background. A pair of hands (forearms/hands only, no face visible)
reaching in to pick one up, conveying the idea of comparing and choosing between
options.
```

---

## 5. find-a-club-near-you 記事挿絵

**用途**: 「都道府県別グラウンドゴルフクラブ・コースの探し方」の本文挿絵。

**狙い**: 「地域で探す」というテーマを、実際の地図の正確性リスクを負わずに表現する。**実在する地図・地名を描かないこと。**

```
Landscape illustration.

Style: warm, semi-realistic Japanese digital illustration (similar to anime/light-novel
background art), clean confident linework, soft cel-shading with gentle gradients, warm
natural outdoor lighting, soft background bokeh, muted warm color palette.
Avoid: any legible text or Japanese characters (flyers/papers must show only abstract
illegible squiggle marks, never real words), logos, brand names, real or implied
geographic maps or place names, photorealistic rendering.
Format: 16:9 landscape, approximately 1400x768px, high detail.

Subject: A Japanese senior man in his 70s standing in front of a wooden community
park noticeboard, looking closely at several pinned paper flyers. One flyer shows a
small simple icon of a ground golf club and ball; all flyers otherwise have only
abstract placeholder squiggle lines, no legible text. Park setting with trees and a
path in the soft-focus background, bright cheerful daylight. Conveys "looking for
local information," not a literal map.
```

---

## 6. gift-guide 記事挿絵

**用途**: 「グラウンドゴルフをプレゼントに選ぶなら？予算別ギフトガイド」の本文挿絵。

**狙い**: 「プレゼント」を明確に想起させるフラットレイ構図。既存の `gear-flatlay.jpg` と並んでも統一感のある画角に。

```
Landscape illustration, overhead flat-lay composition.

Style: warm, semi-realistic Japanese digital illustration (similar to anime/light-novel
background art), clean confident linework, soft cel-shading with gentle gradients, warm
dappled natural sunlight, soft background bokeh, muted warm color palette with gentle
color accents.
Avoid: any legible text, logos, brand names, specific real commercial product designs,
photorealistic rendering.
Format: 16:9 landscape, approximately 1400x768px, high detail.

Subject: Overhead flat-lay on a wooden park table: a neatly wrapped gift box with a
soft green ribbon and bow, partially open, with a generic unbranded orange ground
golf ball and a small ground golf glove peeking out. A blank gift tag (no legible
text) is tied with string. Soft dappled sunlight, blurred green grass and trees at
the edges of frame. Warm, thoughtful, gift-giving mood.
```

---

## 7. how-to-score 記事挿絵

**用途**: 「グラウンドゴルフのスコアの数え方」の本文挿絵。

**狙い**: 既存の `gear-flatlay.jpg` に写っているスコアカード小物を、単独主役にした続編カット。

```
Landscape illustration, close flat-lay composition.

Style: warm, semi-realistic Japanese digital illustration (similar to anime/light-novel
background art), clean confident linework, soft cel-shading with gentle gradients, warm
dappled natural sunlight, soft background bokeh, muted warm color palette.
Avoid: any legible text or numbers on the scorecard (use faint abstract grid lines and
marks only — do not attempt to render readable Japanese text, as this looks broken),
logos, brand names, photorealistic rendering.
Format: 16:9 landscape, approximately 1400x768px, high detail.

Subject: Close flat-lay of a ground golf scorecard on a wooden park table (grid-line
table structure visible but no legible text/numbers), with a pencil resting on top and
a single orange ground golf ball beside it. A pair of hands (forearms only, no face)
visible at the edge of frame, gently pointing at a row as if counting strokes. Soft
blurred green grass background at the edges.
```

---

## 8. shoes-and-apparel 記事挿絵

**用途**: 「グラウンドゴルフのシューズ・ウェアの選び方」の本文挿絵。

**狙い**: 既存の `what-to-bring-flatlay.jpg` と似た構図だが、靴・帽子・ウェアだけにフォーカスを絞る。

```
Landscape illustration, overhead flat-lay composition.

Style: warm, semi-realistic Japanese digital illustration (similar to anime/light-novel
background art), clean confident linework, soft cel-shading with gentle gradients, warm
dappled natural sunlight, soft background bokeh, muted warm color palette.
Avoid: any legible text, logos or brand marks on any clothing/shoe item, photorealistic
rendering.
Format: 16:9 landscape, approximately 1400x768px, high detail.

Subject: Overhead flat-lay on a wooden bench: a pair of comfortable white/gray walking
sneakers, a light breathable pale-blue polo shirt, a wide-brim beige sun hat, and a
pair of thin sports gloves, all neatly arranged. Soft dappled sunlight filtering
through, blurred green grass at the edges. Clean, practical, comfortable mood —
conveys appropriate outdoor sports attire for seniors.
```


---

## 生成後の作業について

再生成した画像は、同じファイル名で `src/assets/illustrations/` に上書きしてもらえれば、ビルド側はそのまま反映される。内容に合わせた代替テキスト（alt）の見直しは、画像を確認したうえでこちらで行う。1点ずつでも、まとまってからでも進められる。

なお、以下はアートディレクターレビューで指摘されたが、AI生成では対応しないもの:

- **クラブ比較表の低コントラストな商品写真（MIZUNO）** — 実在の販売商品の写真のため、AI生成に差し替えると実物と異なる画像になり誤解を招く。Amazon側の別カット画像を探すか、撮影し直す方向で別途対応。
