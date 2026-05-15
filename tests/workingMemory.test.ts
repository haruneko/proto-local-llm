import { describe, it, expect, beforeEach, afterEach } from 'vitest';
import { WorkingMemoryManager } from '../src/memory/workingMemory.ts';
import { WorkingMemory } from '../src/types/memory.ts';
import * as fs from 'fs/promises';
import * as path from 'path';

describe('WorkingMemoryManager', () => {
  const testFilePath = path.join(__dirname, 'test_current_state.json');

  beforeEach(async () => {
    const initialMemory: WorkingMemory = {
      longTermGoals: ['Test goal'],
      promises: ['Test promise'],
      identity: 'Test identity'
    };
    await fs.writeFile(testFilePath, JSON.stringify(initialMemory));
  });

  afterEach(async () => {
    try {
      await fs.unlink(testFilePath);
    } catch (e) {}
  });

  it('should load working memory correctly', async () => {
    const manager = new WorkingMemoryManager(testFilePath);
    const memory = await manager.load();
    expect(memory.identity).toBe('Test identity');
    expect(memory.longTermGoals).toContain('Test goal');
  });

  it('should save working memory correctly', async () => {
    const manager = new WorkingMemoryManager(testFilePath);
    const memory = await manager.load();
    memory.identity = 'Updated identity';
    await manager.save(memory);

    const savedContent = await fs.readFile(testFilePath, 'utf-8');
    const savedMemory = JSON.parse(savedContent);
    expect(savedMemory.identity).toBe('Updated identity');
  });
});
