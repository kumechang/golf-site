import type { ImageMetadata } from 'astro';
import type { CategorySlug } from './categories';
import parkBenchSeniors from '../assets/photos/park-bench-seniors.avif';
import writingNotebook from '../assets/photos/writing-notebook.avif';
import communityHighfive from '../assets/illustrations/community-highfive.jpg';

// 素材集めの都合上、すべてのカテゴリに対応する写真があるわけではない。
// 内容と矛盾しない写真が見つかったカテゴリのみ掲載する。
// alt文に「イラスト」と明記しているものは実写ではなく生成イラストのため、
// 実際の活動風景の写真であるかのように誤解されないようにしている。
export const categoryImages: Partial<Record<CategorySlug, { src: ImageMetadata; alt: string }>> = {
  start: {
    src: communityHighfive,
    alt: 'グラウンドゴルフを楽しむ人々のイラスト',
  },
  community: {
    src: parkBenchSeniors,
    alt: '公園のベンチで休憩するシニアの人々（イメージ）',
  },
  rules: {
    src: writingNotebook,
    alt: '屋外でノートに書き込む手元（イメージ）',
  },
};
