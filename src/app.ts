import express from "express";
import dotenv from "dotenv";
import mongoose from "mongoose";
import cors from "cors";
import askRoute from "./routes/ask";
import whatsappRoute from "./routes/whatsapp";
import bodyParser from "body-parser";

dotenv.config();
const app = express();
app.use(cors());
app.use(express.json());
app.use(bodyParser.urlencoded({ extended: false }));

app.use("/ask", askRoute);
app.use("/whatsapp", whatsappRoute);
const PORT = process.env.PORT;
mongoose.connect(process.env.MONGODB_URI!).then(() => {
  console.log("✅ MongoDB connected");
  app.listen(PORT, () => {
    console.log(`🚀 Server chạy tại http://localhost:${PORT}`);
  });
});