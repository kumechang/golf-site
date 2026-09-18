// 商品データの一元管理（仕様書6.3）。
// 2026-09-18に実際のAmazon.co.jp検索結果（保存HTML）から実在するASIN・商品名・価格を確認して登録している。
// 価格はAmazon側で日々変動するため「確認時点の参考価格」として扱い、断定的な表記は避ける。
// 月1回を目安に、価格・在庫・出品状況の変化を確認すること（仕様書6.3/7章）。
// ブランドは公益社団法人日本グラウンド・ゴルフ協会（JGGA）用具公認制度の対象になり得る
// 国内スポーツ用品メーカー（HATACHI/羽立工業、MIZUNO、NICHIYO/ニチヨー、asics、ALKA/アルカ、
// マルシン産業）の実商品から選定した。

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
}

export const products: Product[] = [
  {
    id: 'aruka-entry-club',
    asin: 'B0H2XHN15X',
    name: 'アルカ（ALKA） グラウンドゴルフクラブ 両面打クラブ GC050',
    brand: 'アルカ（ALKA）',
    priceYen: 8490,
    priceBand: 'entry',
    priceCheckedAt: '2026-09-18',
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
    priceYen: 9980,
    priceBand: 'entry',
    priceCheckedAt: '2026-09-18',
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
    priceCheckedAt: '2026-09-18',
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
    priceYen: 15000,
    priceBand: 'standard',
    priceCheckedAt: '2026-09-18',
    setContents: 'クラブ本体のみ（ケース・ボールは別売り）',
    material: 'JGGA用具標準規則に準拠したヘッド＋シャフト',
    handedness: '右打ち専用',
    recommendedFor: '体験教室から本格的に始めることが決まった方、振りやすさを重視したい方',
    reasonSelected:
      '国内総合スポーツメーカーとして、振りやすさ・打感の作り込みに定評があり、長く使う1本として選びやすい。',
    tags: ['15000-20000', 'beginner'],
  },
  {
    id: 'asics-club',
    asin: 'B07JJS595M',
    name: 'asics（アシックス） グラウンドゴルフクラブ ストロングショット ハイパー',
    brand: 'asics（アシックス）',
    priceYen: 16300,
    priceBand: 'standard',
    priceCheckedAt: '2026-09-18',
    setContents: 'クラブ本体のみ（ケース・ボールは別売り）',
    material: 'JGGA用具標準規則に準拠したヘッド＋シャフト',
    handedness: '商品ページに利き手（右打ち／左打ち）の記載なし。購入前に商品ページでご確認ください',
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
    priceCheckedAt: '2026-09-18',
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
    priceCheckedAt: '2026-09-18',
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
    priceYen: 900,
    priceBand: 'entry',
    priceCheckedAt: '2026-09-18',
    setContents: 'ボール単体',
    material: '樹脂製（直径60mm±1mm、重さ75〜95gのJGGA規格に適合）',
    recommendedFor: '練習用・予備球を探している方、気軽なプレゼントを探している方',
    reasonSelected:
      'JGGA公認マーク付きの樹脂製ボールで、価格も手頃なため予備球やちょっとした贈り物に選びやすい。',
    tags: ['under-10000', 'gift', 'ball'],
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
