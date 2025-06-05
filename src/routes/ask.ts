import { Router, Request, Response } from "express";
import { askQuestionWithRAG } from "../services/rag";

const router = Router();

router.post("/", async (req: Request, res: Response): Promise<any> =>  {
  try {
    const { question, namespace } = req.body;

    if (!question || !namespace) {
      return res.status(400).json({ error: "Missing question or namespace" });
    }

    const answer = await askQuestionWithRAG(question, namespace);

    return res.json({ answer });
  } catch (error) {
    console.error("Error in /ask route:", error);
    return res.status(500).json({ error: "Internal server error" });
  }
});

export default router; 