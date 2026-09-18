import type { ImageMetadata } from 'astro';
import ruleHolePostDiagram from '../assets/illustrations/rule-hole-post-diagram.jpg';
import clubAnatomyDiagram from '../assets/illustrations/club-anatomy-diagram.jpg';
import sportsComparison from '../assets/illustrations/sports-comparison.jpg';
import findAClassTeaching from '../assets/illustrations/find-a-class-teaching.jpg';
import whatToBringFlatlay from '../assets/illustrations/what-to-bring-flatlay.jpg';
import ballSizeComparison from '../assets/illustrations/ball-size-comparison.jpg';
import tournamentScene from '../assets/illustrations/tournament-scene.jpg';
import mannersComparison from '../assets/illustrations/manners-comparison.jpg';
import costPiggybank from '../assets/illustrations/cost-piggybank.jpg';

// 記事id（src/content/articles/*.md のファイル名）ごとの補助イラスト。
// すべて生成イラストのため、実写と誤解されないようaltに用途が伝わる説明を入れている。
export const articleImages: Record<string, { src: ImageMetadata; alt: string }> = {
  'basic-rules': {
    src: ruleHolePostDiagram,
    alt: 'ボールが輪を通って支柱に当たるとホールインになることを示す図解イラスト',
  },
  'how-to-choose-a-club': {
    src: clubAnatomyDiagram,
    alt: 'グラウンドゴルフのクラブの各部名称（ヘッド・グリップ・シャフト長）を示す図解イラスト',
  },
  'vs-gateball-parkgolf': {
    src: sportsComparison,
    alt: 'グラウンドゴルフ・ゲートボール・パークゴルフの道具を並べて比較したイラスト',
  },
  'find-a-class': {
    src: findAClassTeaching,
    alt: '体験教室でインストラクターが初心者にクラブの構え方を教えているイラスト',
  },
  'what-to-bring': {
    src: whatToBringFlatlay,
    alt: '体験教室の持ち物（水筒・タオル・帽子・スニーカー・手袋・筆記用具）を並べたイラスト',
  },
  'how-to-choose-a-ball': {
    src: ballSizeComparison,
    alt: '手のひらに乗せたボールで直径約6cmの大きさを示すイラスト',
  },
  'entering-a-tournament': {
    src: tournamentScene,
    alt: '地域のグラウンドゴルフ大会で参加者がゼッケンを付けて交流している様子のイラスト',
  },
  'fouls-and-manners': {
    src: mannersComparison,
    alt: '打つ人から離れて待つ良い例と、近くに立つ悪い例を対比したイラスト',
  },
  cost: {
    src: costPiggybank,
    alt: 'グラウンドゴルフの道具と貯金箱を並べた、費用の手頃さを表すイラスト',
  },
};
