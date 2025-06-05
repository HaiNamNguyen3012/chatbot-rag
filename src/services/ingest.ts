import fs from 'fs';
import path from 'path';
import { PineconeStore } from '@langchain/community/vectorstores/pinecone';
import { pineconeIndex } from './pinecone';
import { chunkText } from '../utils/chunkText';
import { OpenAIEmbeddings } from '@langchain/openai';
import { Document } from "@langchain/core/documents";
import dotenv from 'dotenv';

dotenv.config();

export async function ingest() {
  try {
    const filePath = path.join(__dirname, '../../data/project.txt');
    const rawText = fs.readFileSync(filePath, 'utf8');
    const chunksRaw = chunkText(rawText);

    const chunks = chunksRaw.map((text, i) => new Document({
      pageContent: text,
      metadata: { id: `${i + 1}` },
    }));

    const namespace = process.env.PINECONE_NAMESPACE || 'default';

    console.log(`📦 Đang ingest ${chunks.length} chunks...`);

    await PineconeStore.fromDocuments(
      chunks,
      new OpenAIEmbeddings(),
      {
        pineconeIndex,
        namespace,
      }
    );

    console.log(`✅ Ingest hoàn tất cho namespace "${namespace}".`);
  } catch (error) {
    console.error("❌ Ingest thất bại:", error);
  }
}

ingest();