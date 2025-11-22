import { ChatOpenAI, OpenAIEmbeddings } from "@langchain/openai";
import { StringOutputParser } from "@langchain/core/output_parsers";
import { RunnableSequence } from "@langchain/core/runnables";
import { ChatPromptTemplate, MessagesPlaceholder } from "@langchain/core/prompts";
import { HumanMessage, AIMessage, SystemMessage, BaseMessage } from "@langchain/core/messages";
import { ingestionService } from "./ingestionService";
import * as dotenv from "dotenv";

dotenv.config();

export interface ChatMessage {
  role: "user" | "assistant" | "system";
  content: string;
}

export interface RagChatOptions {
  message: string;
  history?: ChatMessage[];
  systemPrompt?: string;
  temperature?: number;
  topK?: number;
}

export class RagChatService {
  private model: ChatOpenAI;
  private embeddings: OpenAIEmbeddings;

  constructor() {
    console.log("🤖 [RagChatService] Initializing...");
    this.model = new ChatOpenAI({
      modelName: "gpt-4o-mini",
      temperature: 0.7,
      openAIApiKey: process.env.OPENAI_API_KEY,
    });

    this.embeddings = new OpenAIEmbeddings({
      modelName: "text-embedding-3-small",
      openAIApiKey: process.env.OPENAI_API_KEY,
    });
    console.log("✅ [RagChatService] Initialized successfully");
  }

  private buildMessages(history: ChatMessage[] = []): BaseMessage[] {
    return history.map((msg) => {
      if (msg.role === "user") return new HumanMessage(msg.content);
      if (msg.role === "assistant") return new AIMessage(msg.content);
      return new SystemMessage(msg.content);
    });
  }

  private formatDocs(docs: any[]): string {
    const formatted = docs.map((doc) => doc.pageContent).join("\n\n");
    console.log(`📝 [RagChatService] Formatted ${docs.length} documents, total ${formatted.length} characters`);
    return formatted;
  }

  async chat(options: RagChatOptions) {
    const { message, history = [], systemPrompt, temperature, topK = 4 } = options;
    console.log(`\n💬 [RagChatService] Chat request: "${message}"`);

    if (temperature !== undefined) {
      this.model = new ChatOpenAI({
        modelName: "gpt-4o-mini",
        temperature,
        openAIApiKey: process.env.OPENAI_API_KEY,
      });
    }

    // Check vector store status
    const vectorStore = ingestionService.vectorStore;
    console.log(`📚 [RagChatService] Vector Store Check:`);
    console.log(`   - Exists: ${vectorStore !== null}`);
    console.log(`   - Type: ${vectorStore?.constructor.name || 'null'}`);
    
    if (!vectorStore) {
      console.error("❌ [RagChatService] No documents ingested yet!");
      throw new Error("No documents ingested yet. Please upload documents first.");
    }

    console.log(`🔍 [RagChatService] Creating retriever with k=${topK}...`);
    const retriever = vectorStore.asRetriever({ k: topK });
    
    console.log(`🔎 [RagChatService] Retrieving relevant documents...`);
    const relevantDocs = await retriever.invoke(message);
    console.log(`✅ [RagChatService] Retrieved ${relevantDocs.length} relevant documents`);
    
    if (relevantDocs.length === 0) {
      console.warn("⚠️ [RagChatService] WARNING: No relevant documents found!");
    } else {
      relevantDocs.forEach((doc, idx) => {
        console.log(`   📄 Doc ${idx + 1}: ${doc.pageContent.substring(0, 100)}...`);
      });
    }

    const chatHistory = this.buildMessages(history);

    const defaultSystemPrompt = `You are a helpful AI assistant designed for resume filtering.
Your job is to look at the provided resume and the job description and then highlight the following:
1. Match Score (0-100%)
2. Strengths - What makes this candidate a good fit
3. Gaps - What skills or experience are missing
4. Key Insights - Overall assessment

Use the context provided to give specific, detailed answers. If the context doesn't contain relevant information, say so.

Context:
{context}`;

    const promptTemplate = ChatPromptTemplate.fromMessages([
      ["system", systemPrompt || defaultSystemPrompt],
      new MessagesPlaceholder("chat_history"),
      ["human", "{question}"],
    ]);

    console.log(`🔗 [RagChatService] Building RAG chain...`);
    const ragChain = RunnableSequence.from([
      {
        context: (input: any) => this.formatDocs(input.relevantDocs),
        question: (input: any) => input.question,
        chat_history: (input: any) => input.chat_history,
      },
      promptTemplate,
      this.model,
      new StringOutputParser(),
    ]);

    console.log(`🚀 [RagChatService] Invoking RAG chain...`);
    const answer = await ragChain.invoke({ 
      question: message, 
      relevantDocs, 
      chat_history: chatHistory 
    });

    console.log(`✅ [RagChatService] Generated answer (${answer.length} characters)`);

    return {
      answer,
      sources: relevantDocs.map((doc) => ({ 
        content: doc.pageContent, 
        metadata: doc.metadata 
      })),
    };
  }
}

export const ragChatService = new RagChatService();