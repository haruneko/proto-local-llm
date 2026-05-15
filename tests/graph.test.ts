import { describe, it, expect, vi } from 'vitest';
import { HalGraph } from '../src/nodes/graph.ts';

describe('HalGraph', () => {
  it('should compile the graph', () => {
    const mockModel = {};
    const mockMcp = {};
    const mockSelector = {};
    const halGraph = new HalGraph(mockModel, mockModel, mockMcp, mockSelector);
    expect(halGraph.graph).toBeDefined();
  });
});
