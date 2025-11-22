import { OpenAIEmbeddings } from "@langchain/openai";
import { MemoryVectorStore } from "@langchain/classic/vectorstores/memory";
import { RecursiveCharacterTextSplitter } from "@langchain/textsplitters";
import { PDFLoader } from "@langchain/community/document_loaders/fs/pdf"
import { DocxLoader } from "@langchain/community/document_loaders/fs/docx";
import { TextLoader } from "@langchain/classic/document_loaders/fs/text"
import { CSVLoader } from "@langchain/community/document_loaders/fs/csv"
import { Document } from "@langchain/core/documents";
import * as dotenv from "dotenv";
import * as path from "path";

dotenv.config();

export interface IngestionOptions {
  filePath: string;
  chunkSize?: number;
  chunkOverlap?: number;
  metadata?: Record<string, any>;
}

export class IngestionService {
  private embeddings: OpenAIEmbeddings;
  private textSplitter: RecursiveCharacterTextSplitter;
  public vectorStore: MemoryVectorStore | null = null;

  constructor() {
    console.log("🔧 [IngestionService] Initializing...");
    this.embeddings = new OpenAIEmbeddings({
      openAIApiKey: process.env.OPENAI_API_KEY,
      modelName: "text-embedding-3-small",
    });

    this.textSplitter = new RecursiveCharacterTextSplitter({
      chunkSize: 1000,
      chunkOverlap: 200,
    });
    console.log("✅ [IngestionService] Initialized successfully");
  }

  private async loadDocument(filePath: string): Promise<Document[]> {
    console.log(`📄 [IngestionService] Loading document: ${filePath}`);
    const ext = path.extname(filePath).toLowerCase();
    let loader;

    switch (ext) {
      case ".pdf":
        loader = new PDFLoader(filePath);
        break;
      case ".docx":
        loader = new DocxLoader(filePath);
        break;
      case ".txt":
        loader = new TextLoader(filePath);
        break;
      case ".csv":
        loader = new CSVLoader(filePath);
        break;
      default:
        throw new Error(`Unsupported file type: ${ext}`);
    }

    const docs = await loader.load();
    console.log(`✅ [IngestionService] Loaded ${docs.length} document(s), total content length: ${docs.reduce((acc, doc) => acc + doc.pageContent.length, 0)} chars`);
    return docs;
  }

  private async getVectorStore(): Promise<MemoryVectorStore> {
    if (!this.vectorStore) {
      console.log("🆕 [IngestionService] Creating new MemoryVectorStore");
      this.vectorStore = new MemoryVectorStore(this.embeddings);
      console.log("✅ [IngestionService] MemoryVectorStore created successfully");
    } else {
      console.log("♻️ [IngestionService] Reusing existing MemoryVectorStore");
    }
    return this.vectorStore;
  }

  async ingestDocument(options: IngestionOptions) {
    const { filePath, chunkSize, chunkOverlap, metadata } = options;
    console.log(`\n🚀 [IngestionService] Starting ingestion for: ${filePath}`);

    if (chunkSize || chunkOverlap) {
      this.textSplitter = new RecursiveCharacterTextSplitter({
        chunkSize: chunkSize || 1000,
        chunkOverlap: chunkOverlap || 200,
      });
    }

    const docs = await this.loadDocument(filePath);

    if (metadata) {
      docs.forEach((doc) => {
        doc.metadata = { ...doc.metadata, ...metadata };
      });
    }

    console.log(`✂️ [IngestionService] Splitting documents...`);
    const splitDocs = await this.textSplitter.splitDocuments(docs);
    console.log(`✅ [IngestionService] Created ${splitDocs.length} chunks`);

    const vectorStore = await this.getVectorStore();
    console.log(`💾 [IngestionService] Adding ${splitDocs.length} chunks to vector store...`);
    await vectorStore.addDocuments(splitDocs);
    
    // Verify the documents were added
    console.log(`✅ [IngestionService] Documents added to vector store`);
    console.log(`📊 [IngestionService] Vector Store Status: ${this.vectorStore ? 'INITIALIZED' : 'NOT INITIALIZED'}`);

    return {
      success: true,
      chunksCount: splitDocs.length,
      message: `Successfully ingested ${splitDocs.length} chunks from ${path.basename(filePath)}`,
    };
  }

  async ingestMultipleDocuments(filePaths: string[], metadata?: Record<string, any>) {
    const results = [];
    let totalChunks = 0;

    for (const filePath of filePaths) {
      try {
        const result = await this.ingestDocument({ filePath, metadata });
        results.push({ file: path.basename(filePath), chunks: result.chunksCount });
        totalChunks += result.chunksCount;
      } catch (error: any) {
        console.error(`❌ [IngestionService] Error ingesting ${filePath}:`, error.message);
        results.push({ file: path.basename(filePath), chunks: 0, error: error.message });
      }
    }

    console.log(`\n📊 [IngestionService] Final Status:`);
    console.log(`   - Total chunks: ${totalChunks}`);
    console.log(`   - Vector Store: ${this.vectorStore ? '✅ INITIALIZED' : '❌ NOT INITIALIZED'}`);

    return { success: true, totalChunks, results };
  }

  // Method to check vector store status
  getVectorStoreStatus() {
    const status = {
      initialized: this.vectorStore !== null,
      type: this.vectorStore?.constructor.name || 'null',
    };
    console.log(`🔍 [IngestionService] Vector Store Status Check:`, status);
    return status;
  }
}

export const ingestionService = new IngestionService();