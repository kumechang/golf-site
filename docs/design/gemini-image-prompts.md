# Gemini画像生成プロンプト集

アートディレクター／UX・UIデザイナーレビューで指摘された「画像が必要な指摘」に対応するための、Gemini向け生成プロンプト集。

## 背景・スタイル方針

現在サイトには2つの画風が混在している。

- **生成イラスト（9点）**: `src/assets/illustrations/` に配置。温かみのある半写実的な日本のデジタルイラスト調（アニメ背景美術に近い、柔らかいセル塗り、自然光）。`guide-swing.jpg`（グラウンドゴルフをプレーする様子）、`gear-flatlay.jpg`（道具のフラットレイ）等が代表例。
- **実写ストック写真（一部）**: `src/assets/photos/` に配置。トップページのヒーロー画像、community/rulesカテゴリの画像で使用。

アートディレクターレビューでは、この画風の混在が「意図されたブランドではなく、寄せ集めの印象を与える」と指摘された。対応方針として、**生成イラストのスタイルに統一する**（実写より低コストで量産でき、サイト内で最も評価の高い既存イラスト＝ルール解説図と同じ路線のため）。

以下の12点すべて、このイラストスタイルで統一して生成する。

## 共通スタイルガイド（全プロンプト共通・コピペ用）

どのプロンプトにも以下のスタイル記述を含めている。統一感を保つため、Geminiで生成後に「既存イラストと画風が違う」と感じたら、この共通部分を維持したまま被写体の記述だけ調整して再生成してほしい。

```
Style: warm, semi-realistic Japanese digital illustration (similar to anime/light-novel
background art), clean confident linework, soft cel-shading with gentle gradients, warm
natural outdoor lighting, lush green park/lawn setting, soft background bokeh, natural
realistic human proportions (NOT chibi, NOT flat vector icon style, NOT photorealistic
3D render), muted warm color palette dominated by greens and earth tones with occasional
color accents, calm and inviting mood. Japanese seniors (60s-80s) should look active,
dignified, and genuinely happy — never frail, exaggerated, or caricatured.
Avoid: any legible text or Japanese characters (unless explicitly noted as simple
numerals only), logos, brand names, specific real commercial product designs,
photorealistic rendering, watermarks, harsh shadows, dark/moody lighting.
Format: 16:9 landscape, approximately 1400x768px, high detail.
```

> **⚠️ 運用上の注意（実際に起きた失敗から）**: プロンプトは必ず「Style〜Subject〜Avoid〜Format」を**1つのブロックとして丸ごと**貼り付けること。Subject部分だけを貼ると、Geminiがスタイル指定を認識できず実写（photorealistic）で生成してしまうことが実際にあった。以下の各プロンプトは、その対策としてすべて単体で完結する形（コピペ1回で完結）にしてある。

## 一覧

| # | 画像 | 用途 | 保存先（提案） | 状態 |
|---|------|------|----------------|------|
| 1 | ホームページ ヒーロー | トップページ最上部 | `src/assets/illustrations/hero-course-scene.jpg` | 未生成（ホールポスト修正版プロンプト待ち） |
| 2 | community カテゴリ | `/community/` ヘッダー | `src/assets/illustrations/community-gathering.jpg` | ✅配線済み |
| 3 | rules カテゴリ | `/rules/` ヘッダー | `src/assets/illustrations/rules-scorecard-check.jpg` | 未生成（1回目は実写化、修正版プロンプト待ち） |
| 4 | best-club-sets | 記事挿絵 | `src/assets/illustrations/club-selection-lineup.jpg` | ✅配線済み |
| 5 | find-a-club-near-you | 記事挿絵 | `src/assets/illustrations/local-community-board.jpg` | ✅配線済み |
| 6 | gift-guide | 記事挿絵 | `src/assets/illustrations/gift-wrapped-set.jpg` | ✅配線済み |
| 7 | how-to-score | 記事挿絵 | `src/assets/illustrations/scorecard-counting.jpg` | ✅配線済み |
| 8 | shoes-and-apparel | 記事挿絵 | `src/assets/illustrations/apparel-flatlay.jpg` | ✅配線済み |
| 9 | what-is-ground-golf | 記事挿絵 | `src/assets/illustrations/course-overview.jpg` | 未生成（1回目はホールポストが誤り、修正版プロンプト待ち） |
| 10 | who-is-it-for | 記事挿絵 | `src/assets/illustrations/diverse-players-group.jpg` | 未生成（1回目はホールポストが誤り、修正版プロンプト待ち） |
| 11 | gentle-exercise-comparison | 記事挿絵 | `src/assets/illustrations/gentle-movement.jpg` | ✅配線済み |
| 12 | retirement-hobby-comparison | 記事挿絵 | `src/assets/illustrations/hobby-crossroads.jpg` | 未生成（1回目はホールポストが誤り、修正版プロンプト待ち） |

4〜12は、現在イラストが無い9記事（`src/data/article-images.ts` に未登録）に対応する。1〜3は既存の実写画像の差し替え。

**ホールポストの誤りについて**: 1・3・9・10・12は被写体にホールポスト（ボールを通して支柱に当てる輪）を含むため、通常のゴルフのカップ・フラッグ・グリーンとして誤って生成されやすいことが実際に確認された。各プロンプトに正確な形状（支柱に固定された直径20cm程度のチェーンリング、地面に穴はない）を明記した修正版に更新済み。

---

## 1. ホームページ ヒーロー画像

**用途**: トップページ最上部のヒーロー枠（現在は実写 `equipment-course-photoac.jpg`、デスクトップのみ表示）。サイト全体の第一印象を決める最重要カット。

**狙い**: 既存イラスト群と様式を統一しつつ、明るく開放的な導入シーンにする。

**修正版（2026-09-30）**: 初回生成でホールポストがゴルフのカップのように描かれたため、用具の正確な形状指示を追加した自己完結プロンプトに更新。

```
Wide landscape illustration. This must be a hand-drawn/painted digital illustration —
NOT a photograph, NOT a photorealistic 3D render.

Style: warm, semi-realistic Japanese digital illustration (similar to anime/light-novel
background art), clean confident linework, soft cel-shading with gentle gradients, warm
natural outdoor lighting, lush green park/lawn setting, soft background bokeh, natural
realistic human proportions (NOT chibi, NOT flat vector icon style), muted warm color
palette dominated by greens and earth tones with occasional color accents, calm and
inviting mood.

Subject: A cheerful Japanese man in his late 60s, wearing a navy polo shirt, beige
trousers and a white cap, mid-swing with a ground golf club (a croquet-mallet-style
wooden club with a short shaft), about to hit a small orange ball toward a numbered
ground-golf hole-post in the distance. Wide, well-maintained green lawn park setting
with tall leafy trees in soft-focus background, bright blue sky with a few soft white
clouds. Warm, healthy, active mood — NOT strenuous or competitive. Subject centered-
right with open negative space to the left (for text overlay in the actual website
layout).

IMPORTANT — the hole-post design must be accurate: it is a chain-link metal ring
(about 20cm diameter) mounted horizontally around a thin vertical metal pole, at
roughly knee-to-hip height, with a small numbered square sign plate near the top of
the pole. NOT a golf-style hole/cup dug into the ground, no flagstick, no putting
green — the ball travels along the grass and passes through the ring, hitting the
pole to score.

Avoid: any legible text, logos, brand names, specific real commercial product designs,
photorealistic rendering, photographic realism, watermarks, harsh shadows, dark/moody
lighting.
Format: 16:9 landscape, approximately 1400x768px, high detail, illustrated/painted
style (not a photograph).
```

---

## 2. community カテゴリ画像

**用途**: `/community/` カテゴリ一覧ページのヘッダー（現在は実写 `park-bench-seniors.avif`）。

**狙い**: 「大会・地域コミュニティ」らしい和やかな交流シーン。既存の `community-highfive.jpg`（ハイタッチの一瞬）とは別カットにして重複を避ける。

```
Landscape illustration.

Style: warm, semi-realistic Japanese digital illustration (similar to anime/light-novel
background art), clean confident linework, soft cel-shading with gentle gradients, warm
natural outdoor lighting, lush green park/lawn setting, soft background bokeh, natural
realistic human proportions (NOT chibi, NOT flat vector icon style, NOT photorealistic
3D render), muted warm color palette dominated by greens and earth tones with occasional
color accents, calm and inviting mood. Japanese seniors (60s-80s) should look active,
dignified, and genuinely happy.
Avoid: any legible text, logos, brand names, photorealistic rendering, watermarks,
harsh shadows, dark/moody lighting.
Format: 16:9 landscape, approximately 1400x768px, high detail.

Subject: A small group of 4-5 Japanese seniors (men and women, 60s-80s) sitting and
standing together near a wooden park bench after a ground golf session, chatting and
laughing. Some hold ground golf clubs resting against the bench; one holds a blank
scorecard (no legible text on it). Numbered hole-post rings visible in the soft-focus
background lawn. Lush green trees, bright warm daylight. Relaxed, friendly, community
atmosphere — conveys belonging and local social connection, not competition.
```

---

## 3. rules カテゴリ画像

**用途**: `/rules/` カテゴリ一覧ページのヘッダー（現在は実写 `writing-notebook.avif`）。

**狙い**: 「審判・取り締まり」ではなく「確認・理解」の落ち着いた雰囲気に。既存の `rule-hole-post-diagram.jpg` と並べても違和感のない画角。

**修正版（2026-09-30）**: 初回生成が実写（photorealistic）になってしまったため、スタイル指定をSubjectと同じブロックにまとめ、用具の正確な形状指示も追加した自己完結プロンプトに更新。**このブロック全体を1回で貼り付けること**（Subject部分だけを貼らない）。

```
Landscape illustration. This must be a hand-drawn/painted digital illustration — NOT
a photograph, NOT a photorealistic 3D render.

Style: warm, semi-realistic Japanese digital illustration (similar to anime/light-novel
background art), clean confident linework, soft cel-shading with gentle gradients, warm
natural outdoor lighting, lush green park/lawn setting, soft background bokeh, natural
realistic human proportions (NOT chibi, NOT flat vector icon style), muted warm color
palette dominated by greens and earth tones with occasional color accents, calm and
inviting mood.

Subject: A Japanese senior woman in her 60s, wearing a sun hat and light cardigan,
crouching slightly beside a numbered ground-golf hole-post on a grass lawn, checking
the ball's position with a gentle, attentive expression, one hand pointing near the
ball. Soft-focus green park background with trees. Bright, clear, instructional mood
— conveys "checking carefully" without looking stern or official.

IMPORTANT — the hole-post design must be accurate: it is a chain-link metal ring
(about 20cm diameter) mounted horizontally around a thin vertical metal pole, at
roughly knee-to-hip height, with a small numbered square sign plate near the top of
the pole. The ball rests on the grass near the base of the pole/ring, NOT inside a
dug hole or cup in the ground. This is NOT conventional golf — there must be no
golf-style hole/cup in the ground, no flagstick, no putting green.

Avoid: any legible text, logos, brand names, photorealistic rendering, photographic
realism, watermarks, harsh shadows, dark/moody lighting.
Format: 16:9 landscape, approximately 1400x768px, high detail, illustrated/painted
style (not a photograph).
```

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

## 9. what-is-ground-golf 記事挿絵

**用途**: 「グラウンドゴルフとは？ルールをやさしく解説」の本文挿絵。サイトの看板記事。

**狙い**: 「そもそもどんな競技か」を一目で伝える俯瞰カット。カテゴリヘッダーの `guide-swing.jpg` とは別カットの記事専用イラスト。

**修正版（2026-09-30）**: 初回生成でホールポストが通常のゴルフのカップ・フラッグ・グリーンとして描かれてしまったため、用具の正確な形状指示を追加した自己完結プロンプトに更新。**このブロック全体を1回で貼り付けること**（Subject部分だけを貼らない）。

```
Wide landscape illustration, elevated wide-angle view. This must be a hand-drawn/
painted digital illustration — NOT a photograph, NOT a photorealistic 3D render.

Style: warm, semi-realistic Japanese digital illustration (similar to anime/light-novel
background art), clean confident linework, soft cel-shading with gentle gradients, warm
natural outdoor lighting, soft background bokeh, muted warm color palette. Japanese
seniors (60s-80s) should look active, dignified, and genuinely happy.

Subject: An elevated wide-angle view across a gently curving green lawn park course,
showing three numbered ground-golf hole-posts ("1", "2", "3") spaced out across the
grass at different distances, with two or three small distant figures of Japanese
seniors playing casually near the far hole-posts. Tall trees line the background,
bright blue sky with soft clouds. Conveys the overall layout and gentle, spacious
nature of the sport.

IMPORTANT — each hole-post's design must be accurate: it is a chain-link metal ring
(about 20cm diameter) mounted horizontally around a thin vertical metal pole, at
roughly knee-to-hip height, with a small numbered square sign plate near the top of
the pole. The ball rests on the grass near the base of the pole/ring. This is NOT
conventional golf — there must be absolutely no golf-style holes/cups dug into the
ground, no flagsticks, no putting greens, no sand bunkers anywhere in the image.

Avoid: any legible text beyond the simple numerals "1"/"2"/"3", logos, brand names,
photorealistic rendering, photographic realism, watermarks.
Format: 16:9 landscape, approximately 1400x768px, high detail, illustrated/painted
style (not a photograph).
```

---

## 10. who-is-it-for 記事挿絵

**用途**: 「どんな人におすすめ？グラウンドゴルフを始めるメリット」の本文挿絵。

**狙い**: 「幅広い人に向いている」ことを多様な人物構成で表現。既存の `community-highfive.jpg`（ハイタッチの瞬間）とは違う、落ち着いた集合カットにする。

**修正版（2026-09-30）**: 初回生成は人物構成が良かったものの、背景のホールポストがゴルフのカップ・フラッグとして描かれてしまったため、用具の正確な形状指示を追加した自己完結プロンプトに更新。**このブロック全体を1回で貼り付けること**（Subject部分だけを貼らない）。

```
Landscape illustration, group portrait composition. This must be a hand-drawn/painted
digital illustration — NOT a photograph, NOT a photorealistic 3D render.

Style: warm, semi-realistic Japanese digital illustration (similar to anime/light-novel
background art), clean confident linework, soft cel-shading with gentle gradients, warm
natural outdoor lighting, soft background bokeh, muted warm color palette. Japanese
people should look active, dignified, and genuinely happy — never frail or caricatured.

Subject: A relaxed group of four distinct Japanese individuals standing together on a
grass lawn, each holding a ground golf club: an active-looking man in his 70s, a
smiling woman in her 60s, an older woman in her 80s with a light cane resting nearby,
and a woman in her 50s who looks like she just arrived (slightly more casual outfit,
curious expression). All look approachable and genuinely happy, varied natural body
language. Soft-focus green park background with trees and a numbered ground-golf
hole-post nearby. Conveys "this sport welcomes many different kinds of people."

IMPORTANT — the hole-post's design must be accurate: it is a chain-link metal ring
(about 20cm diameter) mounted horizontally around a thin vertical metal pole, at
roughly knee-to-hip height, with a small numbered square sign plate near the top of
the pole. The ball rests on the grass near the base of the pole/ring. This is NOT
conventional golf — there must be absolutely no golf-style hole/cup dug into the
ground, no flagstick, no putting green.

Avoid: any legible text, logos, brand names, photorealistic rendering, photographic
realism, stiff/posed composition, watermarks.
Format: 16:9 landscape, approximately 1400x768px, high detail, illustrated/painted
style (not a photograph).
```

---

## 11. gentle-exercise-comparison 記事挿絵

**用途**: 「膝や腰に負担をかけたくない人向けの運動とは？」の本文挿絵。

**狙い**: 「体への負担が少ない」ことを視覚的に伝える、無理のない動きのカット。

```
Landscape illustration.

Style: warm, semi-realistic Japanese digital illustration (similar to anime/light-novel
background art), clean confident linework, soft cel-shading with gentle gradients, warm
natural outdoor lighting, soft background bokeh, muted warm color palette.
Avoid: any legible text, logos, brand names, photorealistic rendering, any pose that
looks strained or athletic/competitive.
Format: 16:9 landscape, approximately 1400x768px, high detail.

Subject: A Japanese senior woman in her 70s standing comfortably upright on a grass
lawn, gently addressing a ground golf ball at her feet with a relaxed, un-strained
posture (knees only slightly bent, calm relaxed shoulders), club held lightly, peaceful
content expression — emphasizing ease and low physical strain rather than athletic
exertion. Soft-focus green park background with trees, warm gentle sunlight. Calm,
reassuring, low-impact mood.
```

---

## 12. retirement-hobby-comparison 記事挿絵

**用途**: 「定年後の趣味の選び方｜一人でも始めやすい候補を比較」の本文挿絵。

**狙い**: 「定年後、何を始めるか選ぶ」という記事の主題を象徴的に表現。焦りや不安ではなく、前向きな選択の場面にする。

**修正版（2026-09-30）**: 初回生成でホールポストがゴルフのカップ・フラッグとして描かれてしまったため、用具の正確な形状指示を追加した自己完結プロンプトに更新。**このブロック全体を1回で貼り付けること**（Subject部分だけを貼らない）。

```
Landscape illustration. This must be a hand-drawn/painted digital illustration — NOT
a photograph, NOT a photorealistic 3D render.

Style: warm, semi-realistic Japanese digital illustration (similar to anime/light-novel
background art), clean confident linework, soft cel-shading with gentle gradients, warm
natural outdoor lighting, soft background bokeh, muted warm color palette. Mood must be
calm, hopeful, and unhurried — NOT anxious or urgent.

Subject: A thoughtful Japanese man in his late 60s standing at a gentle fork in a park
path, looking ahead with a calm, curious expression. To one side of the path, a ground
golf club and ball rest near a numbered hole-post. Further down the other path, small
unobtrusive hints of other hobbies (a small potted plant with a watering can, a camera)
are suggested in soft-focus in the far background, without being the main focus. Lush
green trees, warm bright daylight, open and hopeful mood — conveys "many good choices,
take your time deciding."

IMPORTANT — the hole-post's design must be accurate: it is a chain-link metal ring
(about 20cm diameter) mounted horizontally around a thin vertical metal pole, at
roughly knee-to-hip height, with a small numbered square sign plate near the top of
the pole. The ball rests on the grass near the base of the pole/ring. This is NOT
conventional golf — there must be absolutely no golf-style hole/cup dug into the
ground, no flagstick, no putting green.

Avoid: any legible text, logos, brand names, photorealistic rendering, photographic
realism, any expression of worry, loneliness, or urgency, watermarks.
Format: 16:9 landscape, approximately 1400x768px, high detail, illustrated/painted
style (not a photograph).
```

---

## 生成後の作業について

生成した画像を `src/assets/illustrations/` に上記ファイル名で置いてもらえれば、`src/data/article-images.ts` と `src/data/category-images.ts` への配線（コード側の対応）はこちらで行う。1点ずつでも、まとまってからでも進められるので、都合の良いタイミングで声をかけてほしい。

なお、以下はアートディレクターレビューで指摘されたが、AI生成では対応しないもの:

- **クラブ比較表の低コントラストな商品写真（MIZUNO）** — 実在の販売商品の写真のため、AI生成に差し替えると実物と異なる画像になり誤解を招く。Amazon側の別カット画像を探すか、撮影し直す方向で別途対応。
