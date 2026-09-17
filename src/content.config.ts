import { defineCollection, z } from 'astro:content';
import { glob } from 'astro/loaders';

const CATEGORY_SLUGS = ['guide', 'start', 'gear', 'rules', 'community'] as const;
const ARTICLE_TYPES = ['intro', 'howto', 'comparison', 'community'] as const;

const articles = defineCollection({
  loader: glob({ pattern: '**/*.md', base: './src/content/articles' }),
  schema: z.object({
    title: z.string(),
    description: z.string(),
    category: z.enum(CATEGORY_SLUGS),
    articleType: z.enum(ARTICLE_TYPES),
    order: z.number(),
    pubDate: z.coerce.date(),
    updatedDate: z.coerce.date().optional(),
    // 比較・ランキング記事で紹介する商品ID（src/data/products.ts のid参照）
    productIds: z.array(z.string()).optional(),
    // FAQ（あれば FAQPage JSON-LD を自動生成）
    faqItems: z
      .array(
        z.object({
          question: z.string(),
          answer: z.string(),
        })
      )
      .optional(),
    // ヒーロー画像（未入稿の間はグラデーションのプレースホルダーで表示する。
    // 画像が用意でき次第、src/assets配下に配置しこのパスを更新する）
    heroImage: z.string().optional(),
    heroImageAlt: z.string().optional(),
  }),
});

export const collections = { articles };
