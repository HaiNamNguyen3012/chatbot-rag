import { openai } from "../services/openai";

export async function getTopicFromChunk(text: string): Promise<string> {
  const res = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      {
        role: "system",
        content: "Bạn là trợ lý phân loại chủ đề. Hãy phân loại đoạn văn dưới thành 1 từ hoặc cụm từ ngắn thể hiện đúng nội dung chính.",
      },
      {
        role: "user",
        content: `Phân loại topic của đoạn sau:\n\n"${text}"`,
      },
    ],
    temperature: 0,
  });

  return res.choices[0].message.content?.trim() || "Chưa xác định";
}