import { ToolCategory, CategorySelectionSchema, CategorySelection } from '../types/tools.ts';
import { generateObject } from 'ai';
import { z } from 'zod';

export class HierarchicalToolSelector {
  constructor(private model: any) {}

  async selectCategory(input: string, context: string): Promise<CategorySelection> {
    const { object } = await generateObject({
      model: this.model,
      schema: CategorySelectionSchema,
      prompt: `
        以下のユーザー入力とコンテキストに基づき、次に使用すべきツールのカテゴリーを選択してください。

        ユーザー入力: ${input}
        コンテキスト: ${context}

        カテゴリー定義:
        - File: ファイルの読み書き、一覧表示など
        - Web: インターネット検索、ブラウジングなど
        - System: システム情報の取得、コマンド実行など
        - Social: 外部SNSやチャット連携など
        - None: ツールを使用する必要がない、または適切なツールがない場合
      `,
    });

    return object;
  }
}
