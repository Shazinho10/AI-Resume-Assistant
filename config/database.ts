import { PoolConfig } from "pg";
import * as dotenv from "dotenv";

dotenv.config();

export const dbConfig: PoolConfig = {
  host: process.env.POSTGRES_HOST || "localhost",
  port: parseInt(process.env.POSTGRES_PORT || "5432"),
  user: process.env.POSTGRES_USER || "postgres",
  password: process.env.POSTGRES_PASSWORD,
  database: process.env.POSTGRES_DATABASE || "vectordb",
};

export const collectionName = process.env.COLLECTION_NAME || "documents";