import { Pinecone } from "@pinecone-database/pinecone";
import dotenv from "dotenv";

dotenv.config();

const pinecone = new Pinecone({
  apiKey: process.env.PINECONE_API_KEY!,
})

export const pineconeIndex = pinecone.Index(process.env.PINECONE_INDEX_NAME!);
console.log("✅ Đang sử dụng index:", process.env.PINECONE_INDEX_NAME);