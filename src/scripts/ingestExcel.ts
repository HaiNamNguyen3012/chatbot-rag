import fs from "fs";
import path from "path";
import xlsx from "xlsx";
import dotenv from "dotenv";
import { OpenAIEmbeddings } from "@langchain/openai";
import { PineconeStore } from "@langchain/community/vectorstores/pinecone";
import { pineconeIndex } from "../services/pinecone";
import { openai } from "../services/openai";

dotenv.config();

// Hàm sinh topic tự động từ nội dung câu hỏi + câu trả lời
async function getTopicFromText(text: string): Promise<string> {
  const res = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content:
          "Bạn là trợ lý phân loại chủ đề. Hãy phân loại đoạn văn dưới thành 1 từ hoặc cụm từ ngắn thể hiện đúng nội dung chính.",
      },
      {
        role: "user",
        content: `Phân loại topic của đoạn sau:\n\n"${text}"`,
      },
    ],
    temperature: 0.2,
  });

  return res.choices[0].message.content?.trim() || "Chưa xác định";
}

// Hàm chính để ingest từ file Excel vào Pinecone
async function ingestExcel(filePath: string, namespace: string) {
  const workbook = xlsx.readFile(filePath);
  const sheetName = workbook.SheetNames[0];
  const sheet = workbook.Sheets[sheetName];
  const data = xlsx.utils.sheet_to_json(sheet, { header: 1 });

  const embeddings = new OpenAIEmbeddings();

  const texts: string[] = [];
  const metadatas: Record<string, string>[] = [];

  for (let i = 1; i < data.length; i++) {
    const row = data[i] as string[]; // Fix lỗi: khai báo kiểu
    const question = row[0]?.toString().trim();
    const answer = row[1]?.toString().trim();
    let topic = row[2]?.toString().trim();

    if (!question || !answer) continue;

    const combinedText = `Q: ${question}\nA: ${answer}`;
    texts.push(combinedText);

    if (!topic) {
      topic = await getTopicFromText(combinedText);
      console.log(`🔍 Sinh topic cho câu hỏi: "${question}" → ${topic}`);
    }

    metadatas.push({ topic });
  }

  console.log("📌 Đang đẩy vào Pinecone...");
  await PineconeStore.fromTexts(texts, metadatas, embeddings, {
    pineconeIndex,
    namespace,
  });

  console.log("✅ Đã ingest dữ liệu từ Excel thành công!");
}

// Gọi hàm
const filePath = path.join(__dirname, "../../data/faq.xlsx"); // Bạn đổi lại tên file nếu khác
const namespace = "faq"; // Có thể đổi thành "duan" hoặc tên khác

ingestExcel(filePath, namespace).catch((err) => {
  console.error("❌ Lỗi trong quá trình ingest:", err);
});