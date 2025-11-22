import { OpenAPIV3 } from "openapi-types";

export const swaggerSpec: OpenAPIV3.Document = {
  openapi: "3.0.0",
  info: {
    title: "AI Resume Assistant RAG API",
    version: "1.0.0",
    description: "API Documentation for the AI Resume Assistant RAG backend",
  },
  servers: [
    { url: "http://localhost:3000", description: "Local server" }
  ],
  paths: {
    "/api/upload": {
      post: {
        summary: "Upload and ingest a document",
        requestBody: {
          required: true,
          content: {
            "multipart/form-data": {
              schema: {
                type: "object",
                properties: {
                  file: { type: "string", format: "binary" }
                },
                required: ["file"]
              }
            }
          }
        },
        responses: {
          "200": { description: "Successful upload" },
          "400": { description: "No file uploaded" },
          "500": { description: "Server error" }
        }
      }
    },
    "/api/chat/rag": {
      post: {
        summary: "RAG chat endpoint",
        requestBody: {
          required: true,
          content: {
            "application/json": {
              schema: {
                type: "object",
                properties: { message: { type: "string" } },
                required: ["message"]
              }
            }
          }
        },
        responses: {
          "200": { description: "Successful response" },
          "400": { description: "Message required" },
          "500": { description: "Server error" }
        }
      }
    }
  }
};
