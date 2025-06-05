import { openai } from "../services/openai";

export async function detectNamespace(question: string): Promise<string> {
  const systemPrompt = `Bạn là trợ lý phân loại câu hỏi vào 2 nhóm: 
- "duan" nếu câu hỏi liên quan đến dự án, căn hộ, vị trí, tiện ích, thiết kế, giá bán...
- "faq" nếu câu hỏi liên quan đến quy trình, thủ tục, giấy tờ, chính sách, pháp lý...`;

  const res = await openai.chat.completions.create({
    model: "gpt-4",
    messages: [
      { role: "system", content: systemPrompt },
      { role: "user", content: `Câu hỏi: "${question}"\n=> Trả lời chỉ là "duan" hoặc "faq".` },
    ],
    temperature: 0,
  });

  const result = res.choices[0].message.content?.trim().toLowerCase();
  return result === "faq" ? "faq" : "duan"; // fallback về "duan" nếu không chắc
}