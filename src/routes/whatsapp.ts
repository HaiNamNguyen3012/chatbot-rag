import { Router, Request, Response } from "express";
import { askQuestionWithRAG } from "../services/rag";
import { detectNamespace } from "../utils/detectNamespace";
import MessagingResponse from "twilio/lib/twiml/MessagingResponse";

const router = Router();

router.post("/", async (req: Request, res: Response) => {
  
  try {
    const incomingMsg = req.body.Body?.trim();
    const from = req.body.From;

    console.log("📩 Tin nhắn từ:", from);
    console.log("📨 Nội dung:", incomingMsg);

    console.log("📩 Nhận được request từ WhatsApp:", req.body);

    let reply = "Xin lỗi, tôi chưa có đủ thông tin để trả lời câu hỏi này.";

    if (incomingMsg) {
      const namespace = await detectNamespace(incomingMsg);
      console.log("📁 Namespace được chọn:", namespace);
      reply = await askQuestionWithRAG(incomingMsg, namespace);
    }

    const twiml = new MessagingResponse();
    twiml.message(reply);
    res.type("text/xml").send(twiml.toString());
  } catch (error) {
    console.error("❌ Lỗi xử lý webhook WhatsApp:", error);
    const twiml = new MessagingResponse();
    twiml.message("Đã xảy ra lỗi khi xử lý câu hỏi.");
    res.type("text/xml").send(twiml.toString());
  }
});

export default router;