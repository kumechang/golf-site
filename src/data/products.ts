// 商品データの一元管理（仕様書6.3）。
// 価格・重量・セット内容はメーカー・時期により変動するため、断定を避け「目安」と明記している。
// ブランドは公益社団法人日本グラウンド・ゴルフ協会（JGGA）の用具公認制度で認められている
// メーカーから選定（架空の商品名・価格は使用しない）。実際の商品ページへの固定リンクは、
// 出品状況が変わりやすいため使わず、ブランド名でのAmazon内検索に誘導する形にしている。
// 参考: https://groundgolf.or.jp/Portals/0/download/PDF/sP16.pdf（用具標準規則）

export type PriceBand = 'entry' | 'standard' | 'premium';

export interface Product {
  id: string;
  name: string;
  brand: string;
  priceBand: PriceBand;
  priceRangeLabel: string; // 「目安」表記の価格帯
  setContents: string;
  material: string;
  recommendedFor: string;
  reasonSelected: string;
  searchKeyword: string;
  tags: string[]; // gift-guide等での絞り込みに使用
}

export const products: Product[] = [
  {
    id: 'hatachi-entry-set',
    name: 'HATACHI（ハタチ） グラウンドゴルフ クラブセット',
    brand: 'HATACHI',
    priceBand: 'entry',
    priceRangeLabel: '1万円前後〜（目安・要確認）',
    setContents: 'クラブ本体＋専用ケース（モデルにより内容が異なるため購入前に商品ページで要確認）',
    material: 'JGGA用具標準規則に準拠したヘッド（木製）＋シャフト',
    recommendedFor: 'これから体験教室に通う方、初めての1本を探している方',
    reasonSelected:
      'スポーツ用品メーカーとして実績があり、初心者向けモデルの選択肢が豊富なため、最初の1本として選びやすい。',
    searchKeyword: 'HATACHI ハタチ グラウンドゴルフ クラブ',
    tags: ['under-15000', 'beginner'],
  },
  {
    id: 'mizuno-standard-club',
    name: 'MIZUNO（ミズノ） グラウンドゴルフ クラブ',
    brand: 'MIZUNO',
    priceBand: 'standard',
    priceRangeLabel: '1.5万円前後〜（目安・要確認）',
    setContents: 'クラブ本体（ケースは商品により付属有無が異なる）',
    material: 'JGGA用具標準規則に準拠したヘッド（木製）＋シャフト',
    recommendedFor: '体験教室から本格的に始めることが決まった方、握りやすさを重視したい方',
    reasonSelected:
      '国内総合スポーツメーカーとしてグリップ・重量バランスの作り込みに定評があり、長く使う1本として選びやすい。',
    searchKeyword: 'MIZUNO ミズノ グラウンドゴルフ クラブ',
    tags: ['15000-25000', 'beginner'],
  },
  {
    id: 'nichiyo-club-set',
    name: 'NICHIYO（ニチヨー） グラウンドゴルフ クラブセット',
    brand: 'NICHIYO（ニチヨー）',
    priceBand: 'standard',
    priceRangeLabel: '1.5万円前後〜（目安・要確認）',
    setContents: 'クラブ本体＋ケース（モデルにより内容が異なるため購入前に商品ページで要確認）',
    material: 'JGGA用具標準規則に準拠したヘッド（木製）＋シャフト',
    recommendedFor: '地域のクラブ・大会にも参加を考えている方',
    reasonSelected:
      'グラウンドゴルフ・パークゴルフ用品を専門的に扱うメーカーで、競技志向のモデルまで選択肢が広い。',
    searchKeyword: 'ニチヨー NICHIYO グラウンドゴルフ クラブ',
    tags: ['15000-25000', 'club-member'],
  },
  {
    id: 'asics-club',
    name: 'asics（アシックス） グラウンドゴルフ クラブ',
    brand: 'asics',
    priceBand: 'standard',
    priceRangeLabel: '1.5万円前後〜（目安・要確認）',
    setContents: 'クラブ本体（ケースは商品により付属有無が異なる）',
    material: 'JGGA用具標準規則に準拠したヘッド（木製）＋シャフト',
    recommendedFor: '普段から使い慣れたスポーツブランドで選びたい方',
    reasonSelected:
      '大手スポーツブランドとして品質・サイズ展開の安定感があり、贈り物としても選びやすい。',
    searchKeyword: 'アシックス asics グラウンドゴルフ クラブ',
    tags: ['15000-25000', 'gift'],
  },
  {
    id: 'itec-club',
    name: 'ITEC（井上工業） グラウンドゴルフ クラブ',
    brand: 'ITEC（井上工業）',
    priceBand: 'premium',
    priceRangeLabel: '2万円台〜（目安・要確認）',
    setContents: 'クラブ本体（ケースは商品により付属有無が異なる）',
    material: 'JGGA用具標準規則に準拠したヘッド（木製）＋シャフト',
    recommendedFor: '打感や打ちやすさにこだわりたい、上達を目指す方',
    reasonSelected:
      'グラウンドゴルフ用具を専門的に手がけるメーカーで、上級者からの評価情報が集めやすい。',
    searchKeyword: 'ITEC 井上工業 グラウンドゴルフ クラブ',
    tags: ['25000-plus', 'club-member'],
  },
  {
    id: 'gransia-club-set',
    name: 'GRANSIA（アルカ） グラウンドゴルフ クラブセット',
    brand: 'GRANSIA（アルカ）',
    priceBand: 'premium',
    priceRangeLabel: '2万円台〜（目安・要確認）',
    setContents: 'クラブ本体＋ケース（モデルにより内容が異なるため購入前に商品ページで要確認）',
    material: 'JGGA用具標準規則に準拠したヘッド（木製）＋シャフト',
    recommendedFor: '大会出場も視野に入れている方、こだわりの1本を探している方',
    reasonSelected:
      'JGGA用具公認制度に対応したモデルを展開しており、競技志向の方にも選びやすい。',
    searchKeyword: 'GRANSIA アルカ グラウンドゴルフ クラブ',
    tags: ['25000-plus', 'club-member'],
  },
  {
    id: 'aco-club',
    name: 'A.C.O グラウンドゴルフ クラブ',
    brand: 'A.C.O',
    priceBand: 'entry',
    priceRangeLabel: '1万円前後〜（目安・要確認）',
    setContents: 'クラブ本体（ケースは商品により付属有無が異なる）',
    material: 'JGGA用具標準規則に準拠したヘッド（木製）＋シャフト',
    recommendedFor: 'まずは費用を抑えて始めてみたい方',
    reasonSelected:
      'グラウンドゴルフ・パークゴルフ用品を扱うメーカーとして、手に取りやすい価格帯のモデルがある。',
    searchKeyword: 'A.C.O グラウンドゴルフ クラブ',
    tags: ['under-15000', 'beginner', 'gift'],
  },
  {
    id: 'ground-golf-ball-resin',
    name: 'グラウンドゴルフ 公認球（樹脂製）',
    brand: '各メーカー（JGGA認定球）',
    priceBand: 'entry',
    priceRangeLabel: '数千円〜（目安・要確認、複数個セットが中心）',
    setContents: 'ボール単体または複数個セット',
    material: '樹脂製（直径60mm±1mm、重さ75〜95gのJGGA規格に適合するもの）',
    recommendedFor: '練習用・予備球を探している方、色違いで複数持ちたい方',
    reasonSelected:
      '主流である樹脂製かつJGGA認定マーク付きのものを選べば、規格外れによる大会での使用不可を避けられる。',
    searchKeyword: 'グラウンドゴルフ ボール 公認球',
    tags: ['under-15000', 'gift', 'ball'],
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
