import { openai } from "../services/openai";

export async function getSuggestedTopic(text: string): Promise<string> {
  try {
    const completion = await openai.chat.completions.create({
      model: "gpt-4",
      messages: [
        {
          role: "system",
          content: `Bạn là một trợ lý phân tích văn bản. Hãy đọc nội dung sau và rút gọn thành một từ khóa hoặc cụm từ ngắn (topic) đại diện cho chủ đề chính.`,
        },
        {
          role: "user",
          content: text,
        },
      ],
      temperature: 0.3,
    });

    return completion.choices[0].message.content?.trim() || "Chưa rõ";
  } catch (error) {
    console.error("❌ Lỗi khi sinh topic:", error);
    return "Chưa rõ";
  }
}