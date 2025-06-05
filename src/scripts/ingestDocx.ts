import fs from "fs";
import path from "path";
import dotenv from "dotenv";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/community/vectorstores/pinecone";
import { pineconeIndex } from "../services/pinecone";
import { chunkText } from "../utils/chunkText";
import { getTopicFromChunk } from "../utils/getTopic";
import mammoth from "mammoth";

dotenv.config();
// @ts-ignore
async function loadDocxText(filePath: string): Promise<string> {
  const result = await mammoth.extractRawText({ path: filePath });
  return result.value || "";
}

// 🚀 Hàm chính để chunk + embedding + đẩy lên Pinecone
async function ingestDocx(filePath: string, namespace: string) {
  const rawText = await loadDocxText(filePath);
  console.log("📄 Đã đọc nội dung file DOCX. Đang chunk...");

  const chunks = chunkText(rawText, 1000);
  console.log(`🔹 Chunked thành ${chunks.length} đoạn.`);

  const embeddings = new OpenAIEmbeddings();

  // Tạo metadata với topic cho từng chunk
  const metadatas = await Promise.all(
    chunks.map(async (chunk) => {
      const topic = await getTopicFromChunk(chunk);
      return { topic };
    })
  );

  await PineconeStore.fromTexts(chunks, metadatas, embeddings, {
    pineconeIndex,
    namespace,
  });

  console.log("✅ Đã upload lên Pinecone thành công với topic!");
}

// 📂 Đường dẫn đến file DOCX
const filePath = path.join(__dirname, "../../data/eco-residence.docx");
const namespace = "duan";

ingestDocx(filePath, namespace).catch((err) => {
  console.error("❌ Lỗi trong quá trình ingest:", err);
});