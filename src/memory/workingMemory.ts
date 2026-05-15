import * as fs from 'fs/promises';
import { WorkingMemory, WorkingMemorySchema } from '../types/memory.ts';

export class WorkingMemoryManager {
  constructor(private filePath: string) {}

  async load(): Promise<WorkingMemory> {
    try {
      const content = await fs.readFile(this.filePath, 'utf-8');
      const data = JSON.parse(content);
      return WorkingMemorySchema.parse(data);
    } catch (error) {
      // ファイルが存在しない、またはパース失敗時のデフォルト
      return {
        longTermGoals: [],
        promises: [],
        identity: '自律的な思考を持つAIアシスタント',
      };
    }
  }

  async save(memory: WorkingMemory): Promise<void> {
    const data = WorkingMemorySchema.parse(memory);
    await fs.writeFile(this.filePath, JSON.stringify(data, null, 2));
  }
}
