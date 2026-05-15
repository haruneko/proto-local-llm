import { z } from 'zod';

/**
 * 思考プロセス (Thought Log)
 */
export const ThoughtSchema = z.object({
  timestamp: z.string(),
  phase: z.enum(['reflection', 'tool_selection', 'execution', 'summarization']),
  thought: z.string().describe('<thought> タグに含まれる内容'),
  action: z.string().optional().describe('実行したアクション'),
  observation: z.string().optional().describe('アクションの結果'),
});

export type Thought = z.infer<typeof ThoughtSchema>;

/**
 * 最終的な発話 (Speech)
 */
export const SpeechSchema = z.object({
  text: z.string(),
  isSilent: z.boolean().default(false).describe('沈黙を選択したかどうか'),
});
