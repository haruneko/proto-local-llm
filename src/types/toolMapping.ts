import { ToolCategory } from './tools.ts';

/**
 * MCPツール名からカテゴリーを推論するためのマッピング設定
 */
export const ToolCategoryMap: Record<string, ToolCategory> = {
  // Filesystem
  'read_file': 'File',
  'write_file': 'File',
  'list_directory': 'File',
  'move_file': 'File',

  // Search
  'google_search': 'Web',
  'brave_search': 'Web',
  'fetch_website': 'Web',

  // System
  'execute_command': 'System',
  'get_system_info': 'System',
};

/**
 * ツール名に基づいてカテゴリーを判定する
 */
export function inferCategoryFromToolName(toolName: string): ToolCategory {
  if (ToolCategoryMap[toolName]) {
    return ToolCategoryMap[toolName];
  }

  const lower = toolName.toLowerCase();
  if (lower.includes('file') || lower.includes('fs') || lower.includes('path')) return 'File';
  if (lower.includes('search') || lower.includes('google') || lower.includes('web')) return 'Web';

  return 'System'; // デフォルト
}
