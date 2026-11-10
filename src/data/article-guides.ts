// 記事ごとの「次の一歩」ボタンと、長い記事の「読む人から選ぶ」入口。
// href の書き方: '/…/' はサイト内のページ、'#pref-list' などは固定の id、'h:語' は本文の h2 の先頭が一致する見出しへ移る（[slug].astro が id にする。見つからなければビルドを失敗させる）。
export interface GuideLink {
  label: string;
  href: string;
}

export interface ArticleGuide {
  steps: GuideLink[];
  entrancesHeading?: string;
  entrances?: GuideLink[];
}

const FIND_CLASS: GuideLink = { label: '近くの体験教室を探す', href: '/start/find-a-class/' };
const PICK_PREF: GuideLink = { label: '県の名前から探す', href: '/start/find-a-class/#pref-list' };
const PRODUCTS: GuideLink = { label: '商品の例と価格を見る', href: '#article-products' };

export const articleGuides: Record<string, ArticleGuide> = {
  'what-is-ground-golf': { steps: [FIND_CLASS, PICK_PREF] },
  'who-is-it-for': { steps: [FIND_CLASS, PICK_PREF] },
  cost: { steps: [FIND_CLASS, PICK_PREF] },
  'what-to-bring': { steps: [FIND_CLASS, PICK_PREF] },
  'vs-gateball-parkgolf': { steps: [FIND_CLASS, PICK_PREF] },
  'from-golf-to-ground-golf': {
    steps: [FIND_CLASS, PICK_PREF],
    entrancesHeading: '読みたいところから選ぶ',
    entrances: [
      { label: '結論を先に読む', href: 'h:まず結論' },
      { label: 'ゴルフ経験が活きること', href: 'h:ゴルフ経験が活きること' },
      { label: '切り替えるか、両方続けるか', href: 'h:切り替える' },
    ],
  },
  'retirement-hobby-comparison': {
    steps: [{ label: '比べる表を見る', href: 'h:定年後の趣味、何がある' }, FIND_CLASS],
    entrancesHeading: '読みたいところから選ぶ',
    entrances: [
      { label: '7つの趣味を比べる表', href: 'h:定年後の趣味、何がある' },
      { label: '3つの質問で絞り込む', href: 'h:タイプ別診断' },
      { label: '体験教室で起きること', href: 'h:グラウンドゴルフの体験教室に行くと' },
    ],
  },
  'gentle-exercise-comparison': {
    steps: [{ label: '比べる表を見る', href: 'h:膝や腰に優しい運動' }, FIND_CLASS],
    entrancesHeading: '読みたいところから選ぶ',
    entrances: [
      { label: '6つの運動を比べる表', href: 'h:膝や腰に優しい運動' },
      { label: '3つの質問で選ぶ', href: 'h:どちらのタイプ' },
      { label: '最初の30分に起きること', href: 'h:グラウンドゴルフを試すとしたら' },
    ],
  },
  'basic-rules': { steps: [FIND_CLASS, PICK_PREF] },
  'how-to-score': { steps: [FIND_CLASS, PICK_PREF] },
  'fouls-and-manners': { steps: [FIND_CLASS, PICK_PREF] },
  'how-to-hit-and-distance': {
    steps: [FIND_CLASS, PICK_PREF],
    entrancesHeading: '読む人から選ぶ',
    entrances: [
      { label: '打ち方の基本の流れ', href: 'h:打ち方の基本' },
      { label: '距離感のつかみ方', href: 'h:距離感をつかむには' },
      { label: '2打目の考え方', href: 'h:2打目の打ち方' },
      { label: 'ゴルフ経験のある方', href: 'h:ゴルフ経験のある方へ' },
      { label: 'ご家族を見守る方', href: 'h:ご家族のプレーを' },
    ],
  },
  'how-to-choose-a-club': { steps: [PRODUCTS] },
  'how-to-choose-a-ball': { steps: [PRODUCTS] },
  'gift-guide': { steps: [PRODUCTS] },
  'best-club-sets': { steps: [PRODUCTS] },
  'find-a-class': {
    steps: [
      { label: '県を選んで、近くの窓口を探す', href: '#pref-list' },
      { label: '電話やメールの文例を見る', href: 'h:電話やメールで' },
    ],
  },
  'find-a-club-near-you': {
    steps: [{ label: '県の名前から探す', href: '#pref-list' }, { label: '体験教室の探し方を読む', href: '/start/find-a-class/' }],
  },
  'tournament-overview': {
    steps: [{ label: '地域別の予定表を見る', href: '/community/events/' }, FIND_CLASS],
    entrancesHeading: '読む人から選ぶ',
    entrances: [
      { label: '体験や交流の場を探す', href: 'h:身近な集まり' },
      { label: '競技として続けたい', href: 'h:ゴルフ経験者の方へ' },
      { label: 'ご家族のために調べる', href: 'h:親御さんのために' },
      { label: '大会の日程を探す', href: 'h:大会の日程の探し方' },
    ],
  },
  'entering-a-tournament': {
    steps: [{ label: '地域別の予定表を見る', href: '/community/events/' }, FIND_CLASS],
  },
};
