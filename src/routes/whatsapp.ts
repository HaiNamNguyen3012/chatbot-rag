import express, { Request, Response } from "express";
import { askQuestionWithRAG } from "../services/rag";

const router = express.Router();

router.post("/webhook", async (req: Request, res: Response) => {
  const message = req.body.Body;
  const sender = req.body.From;

  console.log(`📩 Tin nhắn từ ${sender}: ${message}`);

  // Gọi RAG để lấy câu trả lời
  const answer = await askQuestionWithRAG(message, "faq");

  // Gửi lại trả lời dưới dạng TwiML
  const responseMessage = `
    <Response>
      <Message>${answer}</Message>
    </Response>
  `;

  res.set("Content-Type", "text/xml");
  res.send(responseMessage.trim());
});

export default router;