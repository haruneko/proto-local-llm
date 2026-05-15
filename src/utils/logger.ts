import * as fs from 'fs/promises';
import { Thought } from '../types/thought.ts';

export class IntelligenceLogger {
  constructor(private logPath: string) {}

  async log(thoughts: Thought[], userInput?: string, finalResponse?: string) {
    const timestamp = new Date().toISOString();
    let entry = `\n--- Session: ${timestamp} ---\n`;

    if (userInput) {
      entry += `Input: ${userInput}\n`;
    }

    for (const t of thoughts) {
      entry += `[${t.phase}] ${t.thought}\n`;
    }

    if (finalResponse) {
      entry += `Output: ${finalResponse}\n`;
    }

    await fs.appendFile(this.logPath, entry);
  }
}
