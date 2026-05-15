import { ToolCategory, CategorySelectionSchema, CategorySelection } from '../types/tools.ts';
import { generateObject } from 'ai';
import { z } from 'zod';

import { Tool } from "@modelcontextprotocol/sdk/types.js";

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

  /**
   * 選択されたカテゴリーに属するツールの中から、具体的に実行するツールとその引数を決定する
   */
  async selectToolAndArgs(input: string, category: ToolCategory, tools: Tool[]): Promise<{ toolName: string; args: any } | null> {
    if (tools.length === 0) return null;

    const { object } = await generateObject({
      model: this.model,
      schema: z.object({
        toolName: z.string(),
        args: z.any(),
        reason: z.string()
      }),
      prompt: `
        あなたはカテゴリー「${category}」のツールマスターです。
        ユーザーの要望: ${input}

        以下の利用可能なツールから最適なものを1つ選び、引数を決定してください。

        利用可能なツール:
        ${JSON.stringify(tools, null, 2)}
      `,
    });

    return object;
  }
}
