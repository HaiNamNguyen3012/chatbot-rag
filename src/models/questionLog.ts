import { Document, model, Schema } from "mongoose";

export interface QuestionLogDocument extends Document {
  question: string;
  answer: string;
  topic: string;
}

const QuestionLogSchema = new Schema<QuestionLogDocument>({
  question: { type: String, required: true },
  answer: { type: String, required: true },
  topic: { type: String, required: true },
});

export const QuestionLog = model<QuestionLogDocument>('QuestionLog', QuestionLogSchema);