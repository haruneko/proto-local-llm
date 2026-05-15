import { z } from 'zod';

/**
 * 作業記憶 (Working Memory)
 * current_state.json または Markdown形式で保存される
 */
export const WorkingMemorySchema = z.object({
  longTermGoals: z.array(z.string()).describe('現在の長期的な目標'),
  promises: z.array(z.string()).describe('HALさんとの約束事'),
  identity: z.string().describe('AI自身の現在のアイデンティティ'),
  currentFocus: z.string().optional().describe('現在集中していること'),
});

export type WorkingMemory = z.infer<typeof WorkingMemorySchema>;

/**
 * 長期記憶 (Long-term Memory) のエントリ
 */
export interface MemoryEntry {
  id: string;
  content: string;
  timestamp: string;
  metadata: Record<string, any>;
  vector?: number[];
}
