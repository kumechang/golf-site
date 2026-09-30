import type { ImageMetadata } from 'astro';
import type { CategorySlug } from './categories';
import communityHighfive from '../assets/illustrations/community-highfive.jpg';
import guideSwing from '../assets/illustrations/guide-swing.jpg';
import gearFlatlay from '../assets/illustrations/gear-flatlay.jpg';
import communityGathering from '../assets/illustrations/community-gathering.jpg';

// 全カテゴリを生成イラストのスタイルに統一している（アートディレクター
// レビューで、実写ストック写真との画風混在がブランドの一貫性を損なうと
// 指摘されたため）。alt文に「イラスト」と明記し、実際の活動風景の
// 写真であるかのように誤解されないようにしている。
export const categoryImages: Partial<Record<CategorySlug, { src: ImageMetadata; alt: string }>> = {
  guide: {
    src: guideSwing,
    alt: '番号付きホールポストに向かってクラブを構える人のイラスト',
  },
  start: {
    src: communityHighfive,
    alt: 'グラウンドゴルフを楽しむ人々のイラスト',
  },
  gear: {
    src: gearFlatlay,
    alt: 'クラブ・ボール・グローブ・スコアカード・帽子を並べたイラスト',
  },
  community: {
    src: communityGathering,
    alt: 'プレー後にベンチで談笑するグラウンドゴルフ仲間のイラスト',
  },
};
