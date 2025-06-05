import { PineconeStore } from "@langchain/community/vectorstores/pinecone";
import { pineconeIndex } from "./pinecone";
import { OpenAIEmbeddings } from "@langchain/openai";
import { openai } from "./openai"; // SDK OpenAI v4
import { ChatCompletionMessageParam } from "openai/resources";

export async function getVectorStore(namespace: string) {
  const embeddings = new OpenAIEmbeddings();
  return await PineconeStore.fromExistingIndex(embeddings, {
    pineconeIndex,
    namespace,
  });
}

export async function askQuestionWithRAG(question: string, namespace: string): Promise<string> {
  try {
    const vectorStore = await getVectorStore(namespace);
    const embedding = await new OpenAIEmbeddings().embedQuery(question);

    const results = await vectorStore.similaritySearchVectorWithScore(embedding, 3);

    if (!results || results.length === 0 || results[0][1] < 0.75) {
      return "Xin lỗi, tôi chưa có đủ thông tin để trả lời câu hỏi này.";
    }

    const context = results.map(([doc, _]) => doc.pageContent).join("\n\n");

    const messages: ChatCompletionMessageParam[] = [
      {
        role: "system",
        content: `Bạn là một trợ lý chuyên ngành xây dựng. Dựa vào các thông tin sau, hãy trả lời thật ngắn gọn và chính xác:\n\n${context}`,
      },
      {
        role: "user",
        content: question,
      },
    ];

    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages,
      temperature: 0.3,
    });

    return completion.choices[0].message.content || "Xin lỗi, không thể tạo câu trả lời.";
  } catch (error: any) {
    console.error("❌ Lỗi trong askQuestionWithRAG:", error);
    return "Đã xảy ra lỗi trong quá trình xử lý câu hỏi.";
  }
}