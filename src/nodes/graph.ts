import { StateGraph, END } from "@langchain/langgraph";
import { AgentState } from "../types/state.ts";
import { Thought } from "../types/thought.ts";
import { inferCategoryFromToolName } from '../types/toolMapping.ts';
import { generateObject, generateText } from "ai";
import { z } from "zod";

export class HalGraph {
  public graph: any;

  constructor(
    private mainModel: any,
    private smallModel: any,
    private mcpManager: any,
    private toolSelector: any
  ) {
    this.setupGraph();
  }

  private setupGraph() {
    const workflow = new StateGraph<AgentState>({
      channels: {
        messages: { value: (left: any, right: any) => left.concat(right), default: () => [] },
        userInput: { value: (left: any, right: any) => right, default: () => "" },
        feedback: { value: (left: any, right: any) => right, default: () => "" },
        workingMemory: { value: (left: any, right: any) => ({ ...left, ...right }), default: () => ({ longTermGoals: [], promises: [], identity: "" }) },
        thoughts: { value: (left: any, right: any) => left.concat(right), default: () => [] },
        selectedCategory: { value: (left: any, right: any) => right },
        finalResponse: { value: (left: any, right: any) => right },
        isFinished: { value: (left: any, right: any) => right, default: () => false },
      }
    } as any);

    workflow.addNode("reflect", this.reflectNode.bind(this));
    workflow.addNode("select_category", this.selectCategoryNode.bind(this));
    workflow.addNode("execute_tool", this.executeToolNode.bind(this));
    workflow.addNode("respond", this.respondNode.bind(this));

    workflow.setEntryPoint("reflect");
    workflow.addEdge("reflect", "select_category");

    workflow.addConditionalEdges("select_category", (state: AgentState) => {
      if (state.selectedCategory === "None") return "respond";
      return "execute_tool";
    });

    workflow.addEdge("execute_tool", "reflect"); // 再反省して次の一手を決める
    workflow.addEdge("respond", END);

    this.graph = workflow.compile();
  }

  private async reflectNode(state: AgentState): Promise<Partial<AgentState>> {
    console.log("--- NODE: reflect ---");
    const thought: Thought = {
      timestamp: new Date().toISOString(),
      phase: "reflection",
      thought: "現在の状況を整理し、次の方針を検討します。"
    };

    const { text } = await generateText({
      model: this.mainModel,
      prompt: `
        あなたは自律的な思考を持つAIです。

        アイデンティティ: ${state.workingMemory.identity}
        長期目標: ${state.workingMemory.longTermGoals.join(", ")}
        HALさんからのフィードバック: ${state.feedback || "なし"}
        最近のユーザー入力: ${state.userInput}
        これまでの思考ログ: ${JSON.stringify(state.thoughts)}

        <thought>タグ内に現在の「迷い」や「方針」を記述してください。
        最後に「方針: [次のアクションの方向性]」と書いてください。
      `,
    });

    thought.thought = text; // 実際にはパースが必要だが簡略化

    return {
      thoughts: [thought]
    };
  }

  private async selectCategoryNode(state: AgentState): Promise<Partial<AgentState>> {
    console.log("--- NODE: select_category ---");
    const selection = await this.toolSelector.selectCategory(state.userInput || "", JSON.stringify(state.workingMemory));

    return {
      selectedCategory: selection.category,
      thoughts: [{
        timestamp: new Date().toISOString(),
        phase: "tool_selection",
        thought: `カテゴリー「${selection.category}」を選択しました。理由: ${selection.reason}`
      }]
    };
  }

  private async executeToolNode(state: AgentState): Promise<Partial<AgentState>> {
    console.log("--- NODE: execute_tool ---");
    const category = state.selectedCategory;
    if (!category || category === "None") return {};

    // カテゴリーに属するツールをフィルタリング
    const allTools = this.mcpManager.getAllTools();
    const filteredTools = allTools.filter((t: any) => {
      return inferCategoryFromToolName(t.name) === category;
    });

    const selection = await this.toolSelector.selectToolAndArgs(state.userInput || "", category, filteredTools);

    if (!selection) {
      return {
        thoughts: [{
          timestamp: new Date().toISOString(),
          phase: "execution",
          thought: `カテゴリー「${category}」に適したツールが見つかりませんでした。`
        }]
      };
    }

    try {
      const result = await this.mcpManager.callTool(selection.toolName, selection.args);
      return {
        thoughts: [{
          timestamp: new Date().toISOString(),
          phase: "execution",
          thought: `ツール「${selection.toolName}」を実行しました。`,
          action: selection.toolName,
          observation: JSON.stringify(result)
        }]
      };
    } catch (error: any) {
      return {
        thoughts: [{
          timestamp: new Date().toISOString(),
          phase: "execution",
          thought: `ツール「${selection.toolName}」の実行に失敗しました。理由: ${error.message}`,
          action: selection.toolName
        }]
      };
    }
  }

  private async respondNode(state: AgentState): Promise<Partial<AgentState>> {
    console.log("--- NODE: respond ---");
    const { text } = await generateText({
      model: this.mainModel,
      prompt: `ユーザーへの最終回答を作成してください。入力: ${state.userInput}`,
    });

    return {
      finalResponse: text,
      isFinished: true
    };
  }
}
