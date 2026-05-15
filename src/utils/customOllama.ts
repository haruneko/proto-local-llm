import { LanguageModelV1 } from 'ai';
import { Ollama } from 'ollama';

// 最小限の実装。必要に応じて拡張
export function createCustomOllamaModel(baseUrl: string, modelId: string): LanguageModelV1 {
  const ollama = new Ollama({ host: baseUrl });

  return {
    specificationVersion: 'v1',
    provider: 'ollama-custom',
    modelId: modelId,
    defaultObjectGenerationMode: 'json',
    doGenerate: async (options) => {
      // 非常に簡略化した実装。実際にはプロンプトの変換が必要
      const prompt = options.prompt?.map(p => p.type === 'text' ? p.text : '').join('\n') || '';
      const response = await ollama.generate({
        model: modelId,
        prompt: prompt,
      });
      return {
        text: response.response,
        finishReason: 'stop',
        usage: { promptTokens: 0, completionTokens: 0 },
        rawCall: { rawPrompt: prompt, rawResponse: response },
      };
    },
    // 他の必要なメソッドを実装（またはモック）
  } as any;
}
