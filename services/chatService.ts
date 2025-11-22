import { ChatOpenAI } from "@langchain/openai";
import { HumanMessage, SystemMessage, AIMessage, BaseMessage } from "@langchain/core/messages";
import * as dotenv from "dotenv";

dotenv.config();

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface ChatServiceOptions {
  message: string;
  history?: ChatMessage[];
  systemPrompt?: string;
  temperature?: number;
  modelName?: string;
}

export class ChatService {
  private model: ChatOpenAI;

  constructor() {
    this.model = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
  }

  private buildMessages(
    message: string,
    history: ChatMessage[] = [],
    systemPrompt?: string
  ): BaseMessage[] {
    const messages: BaseMessage[] = [];

    if (systemPrompt) {
      messages.push(new SystemMessage(systemPrompt));
    }

    for (const msg of history) {
      if (msg.role === "user") {
        messages.push(new HumanMessage(msg.content));
      } else if (msg.role === "assistant") {
        messages.push(new AIMessage(msg.content));
      } else if (msg.role === "system") {
        messages.push(new SystemMessage(msg.content));
      }
    }

    messages.push(new HumanMessage(message));
    return messages;
  }

  async chat(options: ChatServiceOptions): Promise<string> {
    const { message, history, systemPrompt, temperature, modelName } = options;

    if (temperature !== undefined || modelName !== undefined) {
      this.model = new ChatOpenAI({
        modelName: modelName || "gpt-4o-mini",
        temperature: temperature ?? 0.7,
        openAIApiKey: process.env.OPENAI_API_KEY,
      });
    }

    const messages = this.buildMessages(message, history, systemPrompt);
    const response = await this.model.invoke(messages);

    return response.content as string;
  }
}

export const chatService = new ChatService();