export function chunkText(text: string, maxLength: number = 1000): string[]{
  const sentences = text.split(/(?<=[./?])\s+/);
  const chunks: string[] = [];
  let currentChunk = "";

  for (const sentence of sentences) {
    if ((currentChunk + sentence).length <= maxLength) {
      currentChunk += sentence + " ";
    } else {
      chunks.push(currentChunk.trim());
      currentChunk = sentence + " ";
    }
  }

  if (currentChunk) {
    chunks.push(currentChunk.trim());
  }
  return chunks;
}