import { Client } from "@modelcontextprotocol/sdk/client/index.js";
import { StdioClientTransport } from "@modelcontextprotocol/sdk/client/stdio.js";
import { Tool } from "@modelcontextprotocol/sdk/types.js";

export class MCPClientManager {
  private clients: Map<string, Client> = new Map();
  private tools: Map<string, { client: Client; tool: Tool }> = new Map();

  async registerServer(name: string, command: string, args: string[] = []) {
    const transport = new StdioClientTransport({
      command,
      args,
    });

    const client = new Client(
      {
        name: "hal-ai-client",
        version: "1.0.0",
      },
      {
        capabilities: {},
      }
    );

    await client.connect(transport);
    this.clients.set(name, client);

    const response = await client.listTools();
    for (const tool of response.tools) {
      this.tools.set(tool.name, { client, tool });
    }
  }

  getAllTools() {
    return Array.from(this.tools.values()).map(t => t.tool);
  }

  async callTool(name: string, args: any) {
    const toolInfo = this.tools.get(name);
    if (!toolInfo) {
      throw new Error(`Tool ${name} not found`);
    }
    return await toolInfo.client.callTool({
      name,
      arguments: args,
    });
  }
}
