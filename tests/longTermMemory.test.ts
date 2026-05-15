import { describe, it, expect, beforeEach, afterEach, vi } from 'vitest';
import { LongTermMemoryManager } from '../src/memory/longTermMemory.ts';

// LanceDBのモック化が必要かもしれないが、まずはインターフェースのテスト
describe('LongTermMemoryManager', () => {
  it('should define search and add methods', () => {
    // 依存関係をモック
    const mockDb: any = {
      createTable: vi.fn(),
      openTable: vi.fn(),
    };
    const mockOllama: any = {
      embeddings: vi.fn(),
    };

    const manager = new LongTermMemoryManager(mockDb, mockOllama);
    expect(manager.add).toBeDefined();
    expect(manager.search).toBeDefined();
  });
});
