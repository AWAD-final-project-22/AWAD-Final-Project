export interface IEmbeddingPort {
  generateEmbedding(text: string): Promise<number[]>;
  generateEmbeddingsBatch(texts: string[]): Promise<number[][]>;
}

export interface EmbeddingResult {
  embedding: number[];
}
