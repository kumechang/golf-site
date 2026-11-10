// 商品データの一元管理（仕様書6.3）。
// 2026-09-18に実際のAmazon.co.jp検索結果（保存HTML）から実在するASIN・商品名・価格を確認して登録している。
// 2026-11-09にシューズ8点をAmazon.co.jpの商品ページで確認して追加した（足幅表記・着脱・防水の記載・価格・評価）。
// 2026-10-30にAmazon.co.jpの商品ページで価格・出品状況を再確認し、価格の更新・商品の追加・販売終了品の削除を行った。
// ウエストポーチ（northway-waist-pouch）の価格は、商品ページではなくAmazonの検索結果に出ていた表示価格。
// 価格はAmazon側で日々変動するため「確認時点の参考価格」として扱い、断定的な表記は避ける。
// 月1回を目安に、価格・在庫・出品状況の変化を確認すること（仕様書6.3/7章）。
// ブランドは公益社団法人日本グラウンド・ゴルフ協会（JGGA）用具公認制度の対象になり得る
// 国内スポーツ用品メーカー（HATACHI/羽立工業、MIZUNO、NICHIYO/ニチヨー、asics、ALKA/アルカ、
// マルシン産業）の実商品から選定した。
//
// 各記事のproductIds配列の並び順は、価格帯（エントリー→スタンダード→上位モデル）に
// 沿った意図的な並びであり、比較表・カード一覧はこの順序をそのまま表示に使う。
// 「順位」ではなく「価格帯グルーピング」として成立させている表示のため、
// 並び順を変更する場合は各記事の価格帯見出し（###）との整合性を崩さないこと。

export type PriceBand = 'entry' | 'standard' | 'premium';

export interface Product {
  id: string;
  asin: string;
  name: string;
  brand: string;
  priceYen: number;
  priceBand: PriceBand;
  priceCheckedAt: string; // 価格確認日（YYYY-MM-DD）
  setContents: string;
  material: string;
  // 利き手対応。クラブは右打ち専用・左打ち専用・両面打ち（左右兼用）が混在するため、
  // 贈り物として選ぶ際に特に重要な情報として独立フィールドにしている。ボールには適用しない。
  handedness?: string;
  recommendedFor: string;
  reasonSelected: string;
  tags: string[]; // gift-guide等での絞り込みに使用
  // シューズの比較表・絞り込み用。商品名・商品ページの記載のとおりに書く（効果は確認していない）
  shoe?: {
    target: string; // 対象（男性向け／女性向け／男女共用／記載なし）。商品名・商品ページの記載だけを根拠にする
    width: string; // 足幅の表記（例: 幅広（4E））
    closure: string; // 着脱（紐／面ファスナー（マジックテープ） など。確認できない場合は「確認できていません」）
    water: string; // 防水・撥水の記載（例: 防水（商品ページの記載））
    widthE: number; // 絞り込み用。表記のうち最も広いE（3E→3、4E→4、6E→6）
    velcro: boolean; // 面ファスナーの記載がある
    waterStated: boolean; // 「防水」の記載がある（撥水のみは false）
  };
}

export const products: Product[] = [
  {
    id: 'aruka-entry-club',
    asin: 'B0H2XHN15X',
    name: 'アルカ（ALKA） グラウンドゴルフクラブ 両面打クラブ GC050',
    brand: 'アルカ（ALKA）',
    priceYen: 8490,
    priceBand: 'entry',
    priceCheckedAt: '2026-10-30',
    setContents: 'クラブ本体のみ（ケース・ボールは別売り）',
    material: 'JGGA用具標準規則に準拠したヘッド＋シャフト',
    handedness: '両面打ち（左右兼用・利き手を選ばず使える）',
    recommendedFor: 'まずは費用を抑えて始めてみたい方、利き手が分からない相手に贈りたい方',
    reasonSelected:
      'グラウンドゴルフ・パークゴルフ用品を扱うメーカーの実売クラブで、価格帯の中でも手に取りやすい部類に入る。左右どちらの利き手でも使える両面打ちタイプのため、プレゼントとして利き手を確認できない場合にも選びやすい。',
    tags: ['under-10000', 'beginner', 'gift', 'ambidextrous'],
  },
  {
    id: 'nichiyo-club-set',
    asin: 'B0D7PXWGSW',
    name: 'ニチヨー（NICHIYO） 特選入門用4点セット K-1700',
    brand: 'ニチヨー（NICHIYO）',
    priceYen: 9800,
    priceBand: 'entry',
    priceCheckedAt: '2026-10-30',
    setContents: 'クラブ＋ボール＋ケース等の4点セット（内容は商品ページで要確認）',
    material: 'JGGA用具標準規則に準拠したヘッド＋シャフト',
    handedness: '商品ページに利き手（右打ち／左打ち）の記載なし。購入前に商品ページでご確認ください',
    recommendedFor: '道具を一式まとめて揃えたい初心者の方',
    reasonSelected:
      'グラウンドゴルフ・パークゴルフ用品を専門的に扱うメーカーの入門者向けセットで、クラブ単体を買い足す手間がない。',
    tags: ['under-10000', 'beginner', 'gift'],
  },
  {
    id: 'hatachi-entry-set',
    asin: 'B0CZ9BJ1W5',
    name: 'HATACHI（ハタチ） お楽しみ3点セット ハードフェイスクラブ 84cm',
    brand: 'HATACHI（羽立工業）',
    priceYen: 11980,
    priceBand: 'entry',
    priceCheckedAt: '2026-10-30',
    setContents: 'クラブ＋ケース＋ボールの3点セット',
    material: 'JGGA用具標準規則に準拠したヘッド＋シャフト',
    handedness: '商品ページに利き手（右打ち／左打ち）の記載なし。購入前に商品ページでご確認ください',
    recommendedFor: 'これから体験教室に通う方、初めての1本を探している方',
    reasonSelected:
      'スポーツ用品メーカーとして実績のあるHATACHI（羽立工業）公式の3点セットで、クラブ・ケース・ボールを一度に揃えられる。',
    tags: ['under-15000', 'beginner', 'gift'],
  },
  {
    id: 'mizuno-standard-club',
    asin: 'B009C09W6C',
    name: 'MIZUNO（ミズノ） グラウンドゴルフ クラブ オールスター MX（右打用）',
    brand: 'MIZUNO（ミズノ）',
    priceYen: 14000,
    priceBand: 'standard',
    priceCheckedAt: '2026-10-30',
    setContents: 'クラブ本体のみ（ケース・ボールは別売り）',
    material: 'JGGA用具標準規則に準拠したヘッド＋シャフト',
    handedness: '右打ち専用',
    recommendedFor: '体験教室から本格的に始めることが決まった方、振りやすさを重視したい方',
    reasonSelected:
      '国内総合スポーツメーカーとして、振りやすさ・打感の作り込みに定評があり、長く使う1本として選びやすい。',
    tags: ['under-15000', 'beginner'],
  },
  {
    id: 'asics-club',
    asin: 'B07JJS595M',
    name: 'asics（アシックス） グラウンドゴルフクラブ ストロングショット ハイパー',
    brand: 'asics（アシックス）',
    priceYen: 19350,
    priceBand: 'premium',
    priceCheckedAt: '2026-10-30',
    setContents: 'クラブ本体のみ（ケース・ボールは別売り）',
    material: 'JGGA用具標準規則に準拠したヘッド＋シャフト',
    handedness: '商品ページに「左打用」のバリエーションの記載あり。右打ち・左打ちの別は購入前に商品ページでご確認ください',
    recommendedFor: '普段から使い慣れたスポーツブランドで選びたい方',
    reasonSelected:
      '大手スポーツブランドとして品質・ラインアップの安定感があり、贈り物としても選びやすい。',
    tags: ['15000-20000', 'gift'],
  },
  {
    id: 'hatachi-standard-set',
    asin: 'B0GG9NTFVW',
    name: 'HATACHI（ハタチ） パワードソールクラブ3 クラブ・ケース・ボールセット BH1477（右打ち）',
    brand: 'HATACHI（羽立工業）',
    priceYen: 19000,
    priceBand: 'premium',
    priceCheckedAt: '2026-10-30',
    setContents: 'クラブ＋ケース＋ボールの3点セット',
    material: 'JGGA用具標準規則に準拠したヘッド＋シャフト',
    handedness: '右打ち専用',
    recommendedFor: 'セットで上位モデルを揃えたい方、長く使う1本を探している方',
    reasonSelected:
      'HATACHI公式の上位モデルセットで、クラブ・ケース・ボールが一式揃い、贈り物としても本格志向の方にも選びやすい。',
    tags: ['20000-plus', 'club-member', 'gift'],
  },
  {
    id: 'marushin-premium-club',
    asin: 'B0BGLBR5XH',
    name: 'マルシン産業（MARUSHIN） グラウンドゴルフクラブ ブリリアントモデル 84cm',
    brand: 'マルシン産業（MARUSHIN）',
    priceYen: 19800,
    priceBand: 'premium',
    priceCheckedAt: '2026-10-30',
    setContents: 'クラブ本体のみ（ケース・ボールは別売り）',
    material: 'JGGA用具標準規則に準拠したヘッド＋シャフト',
    handedness: '商品ページに利き手（右打ち／左打ち）の記載なし。購入前に商品ページでご確認ください',
    recommendedFor: '打感や打ちやすさにこだわりたい、上達を目指す方',
    reasonSelected:
      'グラウンドゴルフ・パークゴルフ用品を専門的に手がけるメーカーの上位モデルで、競技志向の方にも選びやすい。',
    tags: ['20000-plus', 'club-member'],
  },
  {
    id: 'ground-golf-ball-resin',
    asin: 'B0DSNXZK5F',
    name: 'HATACHI（ハタチ） 公認ボール グラウンドゴルフボール',
    brand: 'HATACHI（羽立工業）',
    priceYen: 790,
    priceBand: 'entry',
    priceCheckedAt: '2026-10-30',
    setContents: 'ボール単体',
    material: '樹脂製（直径60mm±1mm、重さ75〜95gのJGGA規格に適合）',
    recommendedFor: '練習用・予備球を探している方、気軽なプレゼントを探している方',
    reasonSelected:
      '商品名に「公認ボール」と書かれた樹脂製ボールで、価格も手頃なため予備球やちょっとした贈り物に選びやすい。',
    tags: ['under-10000', 'gift', 'ball'],
  },
  {
    id: 'lezax-gloves',
    asin: 'B0GV212R9H',
    name: 'レザックス（LEZAX） Racrec グラウンドゴルフ 両手用グローブ RCGL-6001',
    brand: 'レザックス（LEZAX）',
    priceYen: 1980,
    priceBand: 'entry',
    priceCheckedAt: '2026-10-30',
    setContents: '手袋（両手）1双',
    material: '合成繊維（グリップ力を高める加工あり）',
    recommendedFor: 'クラブを握る手が痛くなりやすい方、グリップ力を高めたい方',
    reasonSelected:
      'グラウンドゴルフ・パークゴルフ用品を扱うメーカーの実売グローブで、両手セットのため利き手を気にせず選べる。',
    tags: ['under-10000', 'gift', 'glove'],
  },
  {
    id: 'hatachi-stretch-gloves',
    asin: 'B0856V2YPP',
    name: 'HATACHI（ハタチ） ウルトラストレッチグローブ',
    brand: 'HATACHI（羽立工業）',
    priceYen: 2200,
    priceBand: 'entry',
    priceCheckedAt: '2026-10-30',
    setContents: '手袋（枚数・内容は未確認）',
    material: 'ストレッチ素材',
    recommendedFor: 'フィット感を重視したい方、ワンランク上のグローブを探している方',
    reasonSelected: 'HATACHI（羽立工業）のストレッチ素材グローブ。商品名に「ストレッチ」と書かれている。',
    tags: ['under-10000', 'gift', 'glove'],
  },
  {
    id: 'hatachi-marker',
    asin: 'B0DPVXVL1G',
    name: 'HATACHI（ハタチ） 蛍光マーカー BH6043',
    brand: 'HATACHI（羽立工業）',
    priceYen: 820,
    priceBand: 'entry',
    priceCheckedAt: '2026-10-30',
    setContents: 'マーカー本体',
    material: '樹脂製',
    recommendedFor: '練習中や大会でボールの位置を分かりやすく示したい方',
    reasonSelected: 'HATACHI公式の蛍光マーカーで、視認性が高く価格も手頃なため気軽に揃えやすい。',
    tags: ['under-10000', 'gift', 'accessory'],
  },
  {
    id: 'score-card-waterproof',
    asin: 'B09FH8WQ1W',
    name: 'グラウンドゴルフ 耐水両面スコアカード（20枚入）',
    brand: 'グラウンドゴルフ用品',
    priceYen: 680,
    priceBand: 'entry',
    priceCheckedAt: '2026-10-30',
    setContents: 'スコアカード20枚',
    material: '耐水紙',
    recommendedFor: '練習や大会で繰り返しスコアカードを使いたい方',
    reasonSelected: '雨天でも書き込みやすい耐水タイプで、20枚入りのためまとめ買いにも向いている。',
    tags: ['under-10000', 'accessory'],
  },
  {
    id: 'hatachi-club-case',
    asin: 'B07RXVTCP9',
    name: 'HATACHI（ハタチ） グラウンドゴルフ マルチクラブケース BH7004',
    brand: 'HATACHI（羽立工業）',
    priceYen: 2288,
    priceBand: 'standard',
    priceCheckedAt: '2026-10-30',
    setContents: 'クラブケース本体（クラブは別売り）',
    material: 'ポリエステル素材',
    recommendedFor: 'クラブの持ち運び・保管用のケースを探している方',
    reasonSelected: 'HATACHI公式のクラブケースで、長さ90cmとクラブの収納に対応したサイズ。',
    tags: ['under-10000', 'accessory'],
  },
  {
    id: 'hatachi-ball-pouch',
    asin: 'B0CMXSC8S6',
    name: 'HATACHI（ハタチ） フック式ボールポーチ',
    brand: 'HATACHI（羽立工業）',
    priceYen: 1650,
    priceBand: 'standard',
    priceCheckedAt: '2026-10-30',
    setContents: 'ボールポーチ本体',
    material: '合成繊維',
    recommendedFor: 'ベルトなどに付けてボールを携帯したい方',
    reasonSelected: 'HATACHI公式のフック式ポーチで、ベルト等に取り付けてボールを持ち運びやすい。',
    tags: ['under-10000', 'gift', 'accessory'],
  },
  {
    id: 'nichiyo-practice-set',
    asin: 'B0HFZBL1HH',
    name: 'ニチヨー（NICHIYO） ホールインワン自宅練習セット',
    brand: 'ニチヨー（NICHIYO）',
    priceYen: 6480,
    priceBand: 'premium',
    priceCheckedAt: '2026-10-30',
    setContents: 'ホールポスト・スタートマット等（詳しい内容は商品ページでご確認ください）',
    material: '商品ページで要確認',
    recommendedFor: '自宅で手軽に練習したい方、上級者向けの贈り物を探している方',
    reasonSelected:
      'グラウンドゴルフ・パークゴルフ用品を専門的に扱うメーカーの自宅練習セットで、自宅でも練習環境を手軽に整えられる。',
    tags: ['gift', 'accessory'],
  },
  {
    id: 'dunlop-refined-shoes',
    asin: 'B09VNPYGGF',
    name: 'DUNLOP REFINED（ダンロップリファインド） DM2001 幅広4E 撥水 軽量 ウォーキングシューズ',
    brand: 'DUNLOP REFINED（ダンロップリファインド）',
    priceYen: 4481,
    priceBand: 'entry',
    priceCheckedAt: '2026-10-30',
    setContents: 'シューズ',
    material: '商品ページで要確認',
    recommendedFor: '足幅が広めで、幅4E表記のウォーキングシューズを探している方',
    reasonSelected:
      '商品名に「幅広4E」「撥水」「軽量」と書かれたウォーキングシューズで、着脱は紐。Amazonの評価は4.1（1,494件）。',
    tags: ['under-10000', 'shoes'],
    shoe: { target: '記載なし', width: '幅広（4E）', closure: '紐', water: '撥水（商品名の記載）', widthE: 4, velcro: false, waterStated: false },
  },
  {
    id: 'achilles-walking-shoes',
    asin: 'B0GT44W584',
    name: 'achilles（アキレス） ウォーキングシューズ 防水 幅広 軽量 LJM 9020（男性4E・女性3E）',
    brand: 'achilles（アキレス）',
    priceYen: 5255,
    priceBand: 'entry',
    priceCheckedAt: '2026-10-30',
    setContents: 'シューズ',
    material: '商品ページで要確認',
    recommendedFor: '足幅が広めで、幅広表記のウォーキングシューズを探している方',
    reasonSelected:
      '商品名に「防水」「幅広」「軽量」「男性4E・女性3E」と書かれたウォーキングシューズで、着脱は紐。Amazonの評価は4.3（99件）。',
    tags: ['under-10000', 'shoes'],
    shoe: { target: '男女共用（男性4E・女性3Eの記載）', width: '幅広（男性4E・女性3E）', closure: '紐', water: '防水（商品名の記載）', widthE: 4, velcro: false, waterStated: true },
  },
  {
    id: 'moonstar-m196',
    asin: 'B07PYV39B4',
    name: 'MoonStar（ムーンスター） メンズ 晴雨兼用 ウォーキングシューズ 防水 幅広 SPLT M196',
    brand: 'MoonStar',
    priceYen: 3614,
    priceBand: 'entry',
    priceCheckedAt: '2026-11-09',
    setContents: 'シューズ',
    material: '商品ページで要確認',
    recommendedFor: '足幅が広めで、紐で調整するメンズのウォーキングシューズを探している方',
    reasonSelected:
      '商品名に「晴雨兼用」「防水」「幅広」と書かれたメンズのウォーキングシューズで、サイズ表記は4E、着脱は紐。Amazonの評価は4.0（3,310件）と件数が多い。商品ページにはソールが路面をグリップする意匠だという記載がある。',
    tags: ['under-10000', 'shoes'],
    shoe: { target: '男性向け', width: '幅広（4E）', closure: '紐', water: '防水（商品ページの記載）', widthE: 4, velcro: false, waterStated: true },
  },
  {
    id: 'moonstar-l171',
    asin: 'B07PJPYCBF',
    name: 'MoonStar（ムーンスター） スニーカー 晴雨兼用 ウォーキングシューズ 防水 4E 22〜25cm レディース SPLT L171',
    brand: 'MoonStar',
    priceYen: 3682,
    priceBand: 'entry',
    priceCheckedAt: '2026-11-09',
    setContents: 'シューズ',
    material: '商品ページで要確認',
    recommendedFor: '足幅が広めで、4E表記のレディースのウォーキングシューズを探している方（22〜25cm）',
    reasonSelected:
      '商品名に「晴雨兼用」「防水」「4E」と書かれたレディース（22〜25cm）のウォーキングシューズ。Amazonの評価は4.1（290件）。仕様欄の着脱は紐だが、説明に「マジックテープ」「開口部が広い」という語もあるため、着脱の方式は商品ページで確認したい。商品ページには防滑を考慮したソール設計だという記載がある。',
    tags: ['under-10000', 'shoes'],
    shoe: { target: '女性向け', width: '幅広（4E）', closure: '紐（説明にマジックテープの語もあり）', water: '防水（商品ページの記載）', widthE: 4, velcro: false, waterStated: true },
  },
  {
    id: 'achilles-ljm9030',
    asin: 'B0DWF6Y8R2',
    name: 'Achilles（アキレス） メンズ スニーカー 防水 超幅広 軽量 6E LJM 9030',
    brand: 'achilles',
    priceYen: 4753,
    priceBand: 'entry',
    priceCheckedAt: '2026-11-09',
    setContents: 'シューズ',
    material: '商品ページで要確認',
    recommendedFor: '足幅がかなり広めで、6E表記のメンズのウォーキングシューズを探している方',
    reasonSelected:
      '商品名に「防水」「超幅広」「軽量」「6E」と書かれたメンズの靴で、着脱は紐。マジックテープ版は別にあるという記載が商品ページにある。Amazonの評価は4.0（43件）と件数は少なめ。商品ページにはソールが防滑に配慮した意匠だという記載がある。',
    tags: ['under-10000', 'shoes'],
    shoe: { target: '男性向け', width: '超幅広（6E）', closure: '紐', water: '防水（商品ページの記載）', widthE: 6, velcro: false, waterStated: true },
  },
  {
    id: 'dunlop-dm287',
    asin: 'B09TDL9GCF',
    name: 'DUNLOP REFINED DM287 防水 幅広 4E 面ファスナー ウォーキング シューズ',
    brand: 'DUNLOP REFINED',
    priceYen: 5604,
    priceBand: 'entry',
    priceCheckedAt: '2026-11-09',
    setContents: 'シューズ',
    material: '商品ページで要確認',
    recommendedFor: '足幅が広めで、面ファスナーで着脱できるウォーキングシューズを探している方',
    reasonSelected:
      '商品名に「防水」「幅広」「4E」「面ファスナー」と書かれたウォーキングシューズ。Amazonの評価は4.2（583件）で、販売元はAmazon.co.jpと表示されている。商品ページには滑り止めソールだという記載がある。',
    tags: ['under-10000', 'shoes'],
    shoe: { target: '記載なし', width: '幅広（4E）', closure: '面ファスナー（マジックテープ）', water: '防水（商品ページの記載）', widthE: 4, velcro: true, waterStated: true },
  },
  {
    id: 'mizuno-freeride2',
    asin: 'B0D5XXBJ4S',
    name: 'MIZUNO ウエーブフリーライド2 SW ウォーキングシューズ',
    brand: 'MIZUNO',
    priceYen: 7194,
    priceBand: 'entry',
    priceCheckedAt: '2026-11-09',
    setContents: 'シューズ',
    material: '商品ページで要確認',
    recommendedFor: '足幅が広めで、4E表記の防水ではないウォーキングシューズを探している方',
    reasonSelected:
      'MIZUNOのウォーキングシューズで、足幅の表記は4E。耐水レベルの欄には非防水とある（商品ページの記載）。着脱は紐だが、ページに内甲ファスナーの記載もあり、この型番のものかは商品ページで確認したい。ソールは説明欄にX10ラバーとある。Amazonの評価は4.2（261件）。',
    tags: ['under-10000', 'shoes'],
    shoe: { target: '記載なし', width: '幅広（4E）', closure: '紐（内甲ファスナーの記載もあり）', water: '非防水と記載（商品ページ）', widthE: 4, velcro: false, waterStated: false },
  },
  {
    id: 'mizuno-frd-wp',
    asin: 'B0F18J3NQZ',
    name: 'MIZUNO ウォーキングシューズ WAVE FRD WP 防水 幅広 厚底 B1GR2600【Amazon.co.jp限定】',
    brand: 'MIZUNO',
    priceYen: 8487,
    priceBand: 'entry',
    priceCheckedAt: '2026-11-09',
    setContents: 'シューズ',
    material: '商品ページで要確認',
    recommendedFor: '足幅が3E表記で、防水の記載があるウォーキングシューズを探している方',
    reasonSelected:
      '商品名に「WP」「防水」「幅広」「厚底」「Amazon.co.jp限定」と書かれたMIZUNOのウォーキングシューズで、足幅の表記は3E、着脱は紐。Amazonの評価は4.0（86件）。',
    tags: ['under-10000', 'shoes'],
    shoe: { target: '記載なし', width: '幅広（3E）', closure: '紐', water: '防水（商品名の記載）', widthE: 3, velcro: false, waterStated: true },
  },
  {
    id: 'mizuno-me05-gtx',
    asin: 'B0DPFLDP3Q',
    name: 'MIZUNO ユニセックス大人 ME-05 GTX3 ウォーキングシューズ',
    brand: 'MIZUNO',
    priceYen: 10846,
    priceBand: 'entry',
    priceCheckedAt: '2026-11-09',
    setContents: 'シューズ',
    material: '商品ページで要確認',
    recommendedFor: '足幅が3E表記で、ゴアテックスの記載があるウォーキングシューズを探している方（ユニセックス）',
    reasonSelected:
      '商品ページに防水（ゴアテックス）の記載があるMIZUNOのユニセックスのウォーキングシューズで、足幅の表記は3E、着脱は紐。商品ページには濡れた路面で滑りにくいとされる「Wgrip」の記載がある。Amazonの評価は4.0（82件）。',
    tags: ['under-15000', 'shoes'],
    shoe: { target: '男女共用（商品名に「ユニセックス」）', width: '幅広（3E）', closure: '紐', water: '防水（ゴアテックス・商品ページの記載）', widthE: 3, velcro: false, waterStated: true },
  },
  {
    id: 'mizuno-ld40-gtx',
    asin: 'B0CQ6WYMBK',
    name: 'MIZUNO メンズ LD40 VII GTX 防水 ゴアテックス 軽量 幅広 内甲ファスナー ウォーキングシューズ',
    brand: 'MIZUNO',
    priceYen: 18860,
    priceBand: 'standard',
    priceCheckedAt: '2026-11-09',
    setContents: 'シューズ',
    material: '商品ページで要確認',
    recommendedFor: '足幅が広めで、ゴアテックスの記載があり、紐と内甲ファスナーを使える靴を探している方（メンズ）',
    reasonSelected:
      '商品名に「防水」「ゴアテックス」「軽量」「幅広」「内甲ファスナー」と書かれたMIZUNOのメンズのウォーキングシューズ。足幅のサイズ表記は3E・4E、着脱は紐に加えて内甲ファスナー（商品名の記載）。商品ページには濡れた路面で滑りにくいとされる「Wgrip」の記載がある。Amazonの評価は4.1（142件）。',
    tags: ['15000-20000', 'shoes'],
    shoe: { target: '男性向け', width: '幅広（3E・4E）', closure: '紐＋内甲ファスナー（商品名の記載）', water: '防水（ゴアテックス・商品ページの記載）', widthE: 4, velcro: false, waterStated: true },
  },
  {
    id: 'hatachi-aero-ball',
    asin: 'B0FJRGRHDV',
    name: 'HATACHI（ハタチ） グラウンドゴルフ ボール エアロボール 2025年',
    brand: 'HATACHI（羽立工業）',
    priceYen: 1650,
    priceBand: 'entry',
    priceCheckedAt: '2026-10-30',
    setContents: 'ボール（個数は商品ページでご確認ください）',
    material: '特殊合成樹脂（商品ページの記載）',
    recommendedFor: '青×赤のボールを探している方、HATACHIのボールを試してみたい方',
    reasonSelected:
      'グラウンドゴルフ用品を扱うHATACHIの2025年版ボールで、色は青×赤。Amazonの評価は4.1（85件）。商品ページにJGGAの認定に関する記載は確認できていないため、大会で使う場合は主催者の規定とあわせてご確認ください。',
    tags: ['under-10000', 'ball'],
  },
  {
    id: 'hatachi-blade-ball',
    asin: 'B08WHWN7WT',
    name: 'HATACHI（ハタチ） グラウンドゴルフボール エアブレイド流星 イエロー 約φ6cm BH3806',
    brand: 'HATACHI（羽立工業）',
    priceYen: 1320,
    priceBand: 'entry',
    priceCheckedAt: '2026-10-30',
    setContents: 'ボール（個数は商品ページでご確認ください。色違いは別の商品ページ）',
    material: '特殊合成樹脂（商品ページの記載）',
    recommendedFor: 'イエローのボールを探している方、HATACHIのボールを試してみたい方',
    reasonSelected:
      'グラウンドゴルフ用品を扱うHATACHIのボールで、この商品ページはイエロー。レッド・ブルー・蛍光ピンクは別の商品ページになっている。Amazonの評価は4.1（122件）。商品ページにJGGAの認定に関する記載は確認できていないため、大会で使う場合は主催者の規定とあわせてご確認ください。',
    tags: ['under-10000', 'ball'],
  },
  {
    id: 'hatachi-win4-ball',
    asin: 'B0D3DVDNC9',
    name: 'HATACHI（ハタチ） ウィン4 グラウンドゴルフ 3ピース ボール（2024年）',
    brand: 'HATACHI（羽立工業）',
    priceYen: 1140,
    priceBand: 'entry',
    priceCheckedAt: '2026-10-30',
    setContents: 'ボール（「3ピース」が構造か個数かは商品ページで確認できていません）',
    material: 'プラスチック（商品ページの記載）',
    recommendedFor: 'JGGAの認定品と記載されたボールを探している方、予備球を探している方',
    reasonSelected:
      '商品ページに「(公社)日本グラウンド・ゴルフ協会認定品」と記載されたボール。Amazonの評価は3.7（14件）と件数は少なめ。確認時点では発送まで6〜7日の表示だったため、贈り物にする場合は日程に余裕を持って確認したい。',
    tags: ['under-10000', 'gift', 'ball'],
  },
  {
    id: 'gokei-sun-visor',
    asin: 'B07BNBZVBG',
    name: 'GOKEI サンバイザー つば広 UPF50+ アームカバー付き',
    brand: 'GOKEI',
    priceYen: 2470,
    priceBand: 'entry',
    priceCheckedAt: '2026-10-30',
    setContents: 'サンバイザー＋アームカバー',
    material: '商品ページで要確認',
    recommendedFor: '屋外のプレー用に、つば広のサンバイザーとアームカバーを探している方（レディース表記の商品）',
    reasonSelected:
      'Amazonの評価件数が多い（4.1、1,484件）。商品名に「UPF50+」と書かれたサンバイザー＋アームカバー（レディース表記）。商品名にグラウンドゴルフの記載はない。',
    tags: ['under-10000', 'accessory'],
  },
  {
    id: 'hatachi-bh8080-gloves',
    asin: 'B01ENUC6L8',
    name: 'HATACHI（ハタチ） グラウンドゴルフ ストレッチ手袋 BH8080',
    brand: 'HATACHI（羽立工業）',
    priceYen: 2023,
    priceBand: 'entry',
    priceCheckedAt: '2026-10-30',
    setContents: '手袋（枚数・片手用か両手用かは商品ページでご確認ください）',
    material: '商品ページで要確認',
    handedness: '手の向き（右用・左用）は確認できていません。購入前に商品ページでご確認ください',
    recommendedFor: 'HATACHIのストレッチ手袋を探している方',
    reasonSelected:
      'グラウンドゴルフ用品を扱うHATACHIの手袋で、商品名に「ストレッチ」と書かれている。Amazonの評価は4.0（148件）。JGGAの記載は商品ページにない。同じHATACHIの「ウルトラストレッチグローブ」とは別の商品。',
    tags: ['under-10000', 'gift', 'glove'],
  },
  {
    id: 'asics-magnet-gloves',
    asin: 'B0BJD5777F',
    name: 'asics（アシックス） グラウンドゴルフ 磁石付きグローブ',
    brand: 'asics（アシックス）',
    priceYen: 2002,
    priceBand: 'entry',
    priceCheckedAt: '2026-10-30',
    setContents: 'グローブ（枚数・片手用か両手用かは商品ページでご確認ください。サイズ・色により価格が変わります）',
    material: 'ひら：合成皮革、甲：ポリエステル・合成皮革',
    handedness: '手の向き（右用・左用）は確認できていません。購入前に商品ページでご確認ください',
    recommendedFor: '普段から使い慣れたスポーツブランドで、磁石付きのグローブを探している方',
    reasonSelected:
      '大手スポーツブランドasicsのグラウンドゴルフ用グローブで、商品名に「磁石付き」と書かれている。Amazonの評価は4.2（52件）。磁石の位置や使い方は確認できていないため、商品ページでご確認ください。',
    tags: ['under-10000', 'gift', 'glove'],
  },
  {
    id: 'northway-waist-pouch',
    asin: 'B0CMTFDW6Y',
    name: 'ノースウェイスポーツ（NORTHWAY） パークゴルフ・グラウンド・ゴルフ ウエストポーチ',
    brand: 'ノースウェイスポーツ（NORTHWAY）',
    priceYen: 3141,
    priceBand: 'entry',
    priceCheckedAt: '2026-10-30',
    setContents: 'ウエストポーチ本体（容量・収納の内容は商品ページでご確認ください）',
    material: '商品ページで要確認',
    recommendedFor: 'ボールや小物を身につけて持ち運びたい方',
    reasonSelected:
      '商品名に「パークゴルフ・グラウンド・ゴルフ」と書かれたウエストポーチ。Amazonの評価は4.1（35件）。表示している価格はAmazonの検索結果に出ていた金額で、商品ページ上の価格は確認できていない。',
    tags: ['under-10000', 'gift', 'accessory'],
  },
];

export function getProductsByIds(ids: string[]): Product[] {
  return ids
    .map((id) => products.find((p) => p.id === id))
    .filter((p): p is Product => Boolean(p));
}

export function getProductsByTag(tag: string): Product[] {
  return products.filter((p) => p.tags.includes(tag));
}
