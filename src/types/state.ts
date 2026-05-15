import { BaseMessage } from '@langchain/core/messages';
import { WorkingMemory } from './memory.ts';
import { Thought } from './thought.ts';
import { ToolCategory } from './tools.ts';

/**
 * LangGraph の共通状態 (State)
 */
export interface AgentState {
  // 入力
  messages: BaseMessage[];
  userInput?: string;
  feedback?: string;

  // 記憶
  workingMemory: WorkingMemory;

  // 思考プロセス
  thoughts: Thought[];

  // ツール選別
  selectedCategory?: ToolCategory;

  // 最終出力
  finalResponse?: string;
  isFinished: boolean;
}
