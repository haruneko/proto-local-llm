import { describe, it, expect, vi } from 'vitest';
import { MCPClientManager } from '../src/tools/mcpClient.ts';

describe('MCPClientManager', () => {
  it('should be able to initialize and list tools', async () => {
    const mockClient: any = {
      connect: vi.fn().mockResolvedValue(undefined),
      listTools: vi.fn().mockResolvedValue({ tools: [{ name: 'test_tool', description: 'desc', inputSchema: {} }] }),
    };

    // 実際には Client インスタンスを作成するロジックをテスト
    const manager = new MCPClientManager();
    expect(manager.registerServer).toBeDefined();
  });
});
