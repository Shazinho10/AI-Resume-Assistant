import express, { Request, Response } from "express";
import cors from "cors";
import multer from "multer";
import path from "path";
import fs from "fs";
import { ingestionService } from "./services/ingestionService";
import { ragChatService } from "./services/ragChatService";
import swaggerUi from "swagger-ui-express";
import { swaggerSpec } from "./src/swagger";

const app = express();
const PORT = process.env.PORT || 3000;

// Middleware
app.use("/docs", swaggerUi.serve, swaggerUi.setup(swaggerSpec));
app.use(express.json());
app.use(cors());

// Uploads directory
const uploadsDir = path.join(__dirname, "uploads");
if (!fs.existsSync(uploadsDir)) fs.mkdirSync(uploadsDir, { recursive: true });

// Multer config
const storage = multer.diskStorage({
  destination: (_req, _file, cb) => cb(null, uploadsDir),
  filename: (_req, file, cb) => cb(null, Date.now() + "-" + file.originalname),
});
const upload = multer({ storage });

// Debug endpoint
app.get("/api/debug/vectorstore", (_req, res) => {
  console.log("\n🔍 [Server] Vector store status check requested");
  const status = ingestionService.getVectorStoreStatus();
  res.json({
    ...status,
    message: status.initialized 
      ? "✅ Vector store is initialized and ready" 
      : "❌ Vector store not initialized - please upload documents first"
  });
});

// Upload endpoint
app.post("/api/upload", upload.single("file"), async (req: Request, res: Response) => {
  console.log("\n📤 [Server] Upload request received");
  try {
    if (!req.file) {
      console.log("❌ [Server] No file uploaded");
      return res.status(400).json({ success: false, error: "No file uploaded" });
    }

    console.log(`📁 [Server] File received: ${req.file.originalname} (${req.file.size} bytes)`);
    console.log(`💾 [Server] Saved to: ${req.file.path}`);

    const result = await ingestionService.ingestDocument({
      filePath: req.file.path,
      metadata: { originalName: req.file.originalname },
    });

    console.log(`✅ [Server] Upload successful: ${result.chunksCount} chunks`);
    res.json({ success: true, ...result });
  } catch (err: any) {
    console.error(`❌ [Server] Upload error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

// RAG chat endpoint
app.post("/api/chat/rag", async (req: Request, res: Response) => {
  console.log("\n💬 [Server] Chat request received");
  try {
    const { message } = req.body;
    if (!message) {
      console.log("❌ [Server] No message provided");
      return res.status(400).json({ success: false, error: "Message required" });
    }

    console.log(`📝 [Server] User message: "${message}"`);

    const result = await ragChatService.chat({ message });
    
    console.log(`✅ [Server] Chat response generated (${result.answer.length} chars)`);
    res.json({ success: true, answer: result.answer });
  } catch (err: any) {
    console.error(`❌ [Server] Chat error: ${err.message}`);
    res.status(500).json({ success: false, error: err.message });
  }
});

// Health check
app.get("/health", (_req, res) => {
  console.log("❤️ [Server] Health check");
  res.json({ status: "ok" });
});

// Start server
app.listen(PORT, () => {
  console.log(`🚀 Server running on http://localhost:${PORT}`);
  console.log(`📚 API Documentation: http://localhost:${PORT}/docs`);
  console.log(`🔍 Vector Store Status: http://localhost:${PORT}/api/debug/vectorstore`);
});