import { MemoryEntry } from '../types/memory.ts';
import * as lancedb from '@lancedb/lancedb';

export class LongTermMemoryManager {
  private tableName = 'memories';

  constructor(
    private db: lancedb.Connection,
    private ollama: any // Ollama instance for embeddings
  ) {}

  async add(content: string, metadata: Record<string, any> = {}): Promise<void> {
    const vector = await this.getEmbedding(content);
    const table = await this.getOrCreateTable();
    await table.add([{
      id: crypto.randomUUID(),
      content,
      metadata: JSON.stringify(metadata),
      vector,
      timestamp: new Date().toISOString()
    }]);
  }

  async search(query: string, limit: number = 5): Promise<MemoryEntry[]> {
    const vector = await this.getEmbedding(query);
    const table = await this.getOrCreateTable();
    const results = await table
      .search(vector)
      .limit(limit)
      .execute();

    return results.map((r: any) => ({
      id: r.id,
      content: r.content,
      metadata: JSON.parse(r.metadata),
      timestamp: r.timestamp,
      vector: r.vector
    }));
  }

  private async getEmbedding(text: string): Promise<number[]> {
    // Ollama APIを使用してベクトル化
    const response = await this.ollama.embeddings({
      model: process.env.SMALL_MODEL || 'gemma2:9b',
      prompt: text,
    });
    return response.embedding;
  }

  private async getOrCreateTable() {
    try {
      return await this.db.openTable(this.tableName);
    } catch (e) {
      // テーブルが存在しない場合に作成するためのスキーマ定義が必要だが、
      // LanceDBはデータ投入時に推論することも可能
      return await this.db.createTable(this.tableName, []);
    }
  }
}
