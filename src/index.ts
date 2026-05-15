import { createOllama } from 'ollama-ai-provider';
import { WorkingMemoryManager } from './memory/workingMemory.ts';
import { LongTermMemoryManager } from './memory/longTermMemory.ts';
import { MCPClientManager } from './tools/mcpClient.ts';
import { HierarchicalToolSelector } from './tools/hierarchicalToolSelector.ts';
import { HalGraph } from './nodes/graph.ts';
import { IntelligenceLogger } from './utils/logger.ts';
import * as lancedb from '@lancedb/lancedb';
import * as fs from 'fs/promises';
import * as dotenv from 'dotenv';
import { Ollama } from 'ollama';

dotenv.config();

async function main() {
  console.log("Starting HAL-AI Batch Process...");

  // 1. 環境準備
  const ollamaProvider = createOllama({
    baseURL: process.env.OLLAMA_BASE_URL || 'http://192.168.15.1:11434/api',
  });

  // AI SDK V2互換のモデル（接続失敗時は例外が出るが、スケルトンとして正しい接続先を指定）
  const mainModel = ollamaProvider(process.env.MAIN_MODEL || 'gemma4:e4b');
  const smallModel = ollamaProvider(process.env.SMALL_MODEL || 'gemma2:9b');

  // LanceDB (Vectore DB)
  const db = await lancedb.connect('data/lancedb');

  // Ollama Embeddings 用のクライアント
  const ollamaClient = new Ollama({ host: process.env.OLLAMA_BASE_URL || 'http://192.168.15.1:11434' });

  // マネージャー初期化
  const wmManager = new WorkingMemoryManager('data/current_state.json');
  const ltmManager = new LongTermMemoryManager(db, ollamaClient);
  const mcpManager = new MCPClientManager();
  const logger = new IntelligenceLogger('intelligence.log');

  // 2. 状態ロード
  const workingMemory = await wmManager.load();
  let userInput = "";
  try {
    userInput = await fs.readFile('input.md', 'utf-8');
    if (!userInput.trim()) userInput = "(No user input)";
  } catch (e) {
    userInput = "(No user input)";
  }

  // 3. MCP接続（スケルトンとしてfsを例示）
  try {
    // await mcpManager.registerServer('filesystem', 'npx', ['-y', '@modelcontextprotocol/server-filesystem', process.cwd()]);
    console.log("MCP servers registration ready.");
  } catch (e) {
    console.error("Failed to register MCP servers", e);
  }

  const toolSelector = new HierarchicalToolSelector(smallModel);
  const halGraph = new HalGraph(mainModel, smallModel, mcpManager, toolSelector);

  // 4. 実行
  const initialState = {
    messages: [],
    userInput,
    workingMemory,
    thoughts: [],
    isFinished: false
  };

  console.log("Invoking Graph...");
  // サンドボックス環境では実際のIPに接続できないため、試行して失敗した場合はエラーログを残す
  try {
    const result = await halGraph.graph.invoke(initialState);

    // 5. 永続化
    await wmManager.save(result.workingMemory);
    await logger.log(result.thoughts, userInput, result.finalResponse);

    if (result.finalResponse) {
      await fs.writeFile('output.md', result.finalResponse);
    }
    console.log("Batch Process Completed.");
  } catch (error: any) {
    console.error("Execution failed. This is expected in a restricted sandbox if Ollama is unreachable.");
    console.error("Error details:", error.message);

    // スケルトンとしての動作証明のため、モックでのフォールバック実行も可能だが、
    // ここでは「正しい接続設定での失敗」を提示する
  }
}

main().catch(console.error);
