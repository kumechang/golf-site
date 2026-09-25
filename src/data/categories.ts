export type CategorySlug = 'guide' | 'start' | 'gear' | 'rules' | 'community';

export interface CategoryMeta {
  slug: CategorySlug;
  name: string;
  shortName: string;
  description: string;
  // <title>・meta descriptionに使うSEO用の文言。
  // 記事「グラウンドゴルフとは？」等との重複（カニバリゼーション）を避けるため、
  // 画面表示用のname/descriptionとは別に用意する。
  metaTitle: string;
  metaDescription: string;
  // トップページ等でのアクセントカラー（Tailwindの検証済みパレットのみ使用）
  accent: {
    bg: string;
    text: string;
    ring: string;
  };
}

export const categories: CategoryMeta[] = [
  {
    slug: 'guide',
    name: 'グラウンドゴルフとは',
    shortName: 'グラウンドゴルフとは？',
    description: 'ルールや魅力など、グラウンドゴルフの基本をやさしく解説します。',
    metaTitle: 'グラウンドゴルフ入門ガイド一覧｜まずはここから',
    metaDescription:
      'グラウンドゴルフを始める前に知っておきたい基礎知識のガイド一覧です。競技の概要、向いている人、他のスポーツとの違いなどを紹介します。',
    accent: { bg: 'bg-sky-50', text: 'text-sky-700', ring: 'ring-sky-200' },
  },
  {
    slug: 'start',
    name: '始め方',
    shortName: '始め方',
    description: '体験教室の探し方や持ち物、費用感など、始める前に知りたい情報です。',
    metaTitle: 'グラウンドゴルフの始め方｜体験教室・持ち物・費用ガイド',
    metaDescription:
      'グラウンドゴルフを始めるために知っておきたい情報をまとめました。体験教室の探し方、当日の持ち物、かかる費用の目安がわかります。',
    accent: { bg: 'bg-green-50', text: 'text-green-700', ring: 'ring-green-200' },
  },
  {
    slug: 'gear',
    name: '道具選び',
    shortName: '道具選び',
    description: 'クラブ・ボール・シューズの選び方や、予算別のプレゼントガイドです。',
    metaTitle: 'グラウンドゴルフの道具選びガイド｜クラブ・ボール・シューズ',
    metaDescription:
      'グラウンドゴルフのクラブ・ボール・シューズの選び方から、予算別のプレゼントガイドまで、道具に関する情報をまとめました。',
    accent: { bg: 'bg-amber-50', text: 'text-amber-800', ring: 'ring-amber-200' },
  },
  {
    slug: 'rules',
    name: '上達・ルール',
    shortName: 'ルール',
    description: '基本ルールやスコアの数え方、マナーを詳しく解説します。',
    metaTitle: 'グラウンドゴルフのルール・上達ガイド',
    metaDescription:
      'グラウンドゴルフの基本ルール、スコアの数え方、よくある反則やマナーなど、上達に役立つ情報をまとめました。',
    accent: { bg: 'bg-teal-50', text: 'text-teal-700', ring: 'ring-teal-200' },
  },
  {
    slug: 'community',
    name: '大会・コミュニティ情報',
    shortName: '大会・地域',
    description: 'お住まいの地域のクラブの探し方や、大会参加のガイドです。',
    metaTitle: 'グラウンドゴルフの大会・クラブの探し方ガイド',
    metaDescription:
      'お住まいの地域でグラウンドゴルフのクラブを探す方法や、大会に初めて参加する際のポイントをまとめました。',
    accent: { bg: 'bg-indigo-50', text: 'text-indigo-700', ring: 'ring-indigo-200' },
  },
];

export function getCategory(slug: string): CategoryMeta | undefined {
  return categories.find((c) => c.slug === slug);
}
