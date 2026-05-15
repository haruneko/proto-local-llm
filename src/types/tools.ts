import { z } from 'zod';

/**
 * ツールカテゴリー
 */
export const ToolCategorySchema = z.enum(['File', 'Web', 'System', 'Social', 'None']);
export type ToolCategory = z.infer<typeof ToolCategorySchema>;

/**
 * 二段階選別: カテゴリー選択の出力
 */
export const CategorySelectionSchema = z.object({
  category: ToolCategorySchema,
  reason: z.string().describe('そのカテゴリーを選んだ理由'),
});

export type CategorySelection = z.infer<typeof CategorySelectionSchema>;
