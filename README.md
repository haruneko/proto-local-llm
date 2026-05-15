# HAL-AI: 自律型「30分監修」思考ループ

このプロジェクトは、強力なローカルLLM資産を活かし、自律的な思考と記憶を持つAIアシスタントのスケルトン実装です。

## 1. 基本的な会話方法

本システムは「非常駐バッチ型」で動作します。

1.  **ユーザー入力**: `input.md` にメッセージを書き込みます。
    *   例: `今日のタスクを整理して、関連するファイルを検索してください。`
2.  **実行**: 以下のコマンドで思考ループを起動します。
    ```bash
    bun run src/index.ts
    ```
3.  **回答の確認**:
    *   **最終回答**: `output.md` に出力されます。
    *   **思考ログ**: `intelligence.log` に、AIの「内省（<thought>）」やツール選択の過程がすべて記録されます。

## 2. 設定の変更方法

### 環境変数 (`.env`)
Ollamaの接続先や使用モデルを変更できます。
*   `OLLAMA_BASE_URL`: Ollama APIのURL（例: `http://192.168.15.1:11434`）
*   `MAIN_MODEL`: メインの思考に使用するモデル（例: `gemma4:e4b`）
*   `SMALL_MODEL`: 要約やツール選択に使用する軽量モデル（例: `gemma2:9b`）

### AIの性格・記憶 (`data/current_state.json`)
AIのアイデンティティや長期目標を直接編集できます。
*   `identity`: AIの自己定義。
*   `longTermGoals`: 追い求めている目標。
*   `promises`: ユーザー（HALさん）との約束事。

## 3. MCP（Model Context Protocol）の設定

外部ツールを追加するには、`src/index.ts` の MCP 登録セクションにサーバー情報を追記します。

### 設定例 (Google Search / Filesystem)
`src/index.ts` 内の `mcpManager.registerServer` を以下のように記述します。

```typescript
// Google Search の例
await mcpManager.registerServer('search', 'npx', [
  '-y', '@modelcontextprotocol/server-google-search',
  '--api-key', 'YOUR_API_KEY'
]);

// ファイル操作 (fs) の例
await mcpManager.registerServer('filesystem', 'npx', [
  '-y', '@modelcontextprotocol/server-filesystem',
  '/path/to/allowed/directory'
]);
```

登録されたツールは、AIが `File` や `Web` カテゴリーを選択した際に自動的にコンテキストへ注入されます。

## 4. 監修（Observability）

30分の監修時間で以下を確認してください。
*   `intelligence.log`: AIが何を考え、なぜその行動をとったか（あるいは何もしなかったか）を確認。
*   `data/lancedb`: 長期記憶として蓄積されたエピソードの妥当性。
*   必要に応じて `current_state.json` を書き換え、AIの「教育」を行ってください。

## 開発スタック
*   **Runtime**: Bun
*   **Orchestration**: LangGraph.js
*   **LLM Interface**: Vercel AI SDK Core
*   **Database**: LanceDB
*   **Protocol**: Model Context Protocol (MCP)
