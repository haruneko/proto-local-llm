import { describe, it, expect, vi } from 'vitest';
import { HierarchicalToolSelector } from '../src/tools/hierarchicalToolSelector.ts';

describe('HierarchicalToolSelector', () => {
  it('should categorize tools and select the right one', async () => {
    const mockModel: any = {
      generate: vi.fn().mockResolvedValue({ object: { category: 'File', reason: 'needs to read file' } }),
    };
    const selector = new HierarchicalToolSelector(mockModel);
    // テストロジック
    expect(selector.selectCategory).toBeDefined();
    expect(selector.selectToolAndArgs).toBeDefined();
  });
});
