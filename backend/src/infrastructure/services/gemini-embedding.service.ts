import { Injectable, Logger } from '@nestjs/common';
import { ConfigService } from '@nestjs/config';
import { GoogleGenerativeAI } from '@google/generative-ai';
import { IEmbeddingPort } from '../../application/ports/embedding.port';

@Injectable()
export class GeminiEmbeddingService implements IEmbeddingPort {
  private readonly logger = new Logger(GeminiEmbeddingService.name);
  private readonly genAI: GoogleGenerativeAI;
  private readonly BATCH_SIZE = 10;
  private readonly DELAY_MS = 100;
  private readonly MAX_RETRIES = 3;
  private readonly EMBEDDING_DIMENSION = 768;

  constructor(private configService: ConfigService) {
    const apiKey = this.configService.get<string>('GEMINI_API_KEY');
    if (!apiKey) {
      this.logger.warn('GEMINI_API_KEY not configured. Embedding service will be disabled.');
    }
    this.genAI = new GoogleGenerativeAI(apiKey || 'dummy-key');
  }

  async generateEmbedding(text: string): Promise<number[]> {
    try {
      // Use text-embedding-004 model for embeddings
      const model = this.genAI.getGenerativeModel({ 
        model: 'text-embedding-004' 
      });

      const result = await model.embedContent(text);
      const embedding = result.embedding.values;

      if (!embedding || embedding.length !== this.EMBEDDING_DIMENSION) {
        throw new Error(`Invalid embedding dimension: ${embedding?.length}, expected ${this.EMBEDDING_DIMENSION}`);
      }

      this.logger.debug(`Generated embedding for text (length: ${text.length})`);
      return embedding;
    } catch (error) {
      this.logger.error('Failed to generate embedding', error);
      throw error;
    }
  }

  async generateEmbeddingsBatch(texts: string[]): Promise<number[][]> {
    if (texts.length === 0) {
      return [];
    }

    const results: number[][] = [];
    const batches = this.chunkArray(texts, this.BATCH_SIZE);

    for (let i = 0; i < batches.length; i++) {
      const batch = batches[i];
      
      try {
        // Process batch with retry logic
        const batchEmbeddings = await this.processBatchWithRetry(batch);
        results.push(...batchEmbeddings);

        // Add delay between batches to respect rate limits
        if (i < batches.length - 1) {
          await this.sleep(this.DELAY_MS);
        }
      } catch (error) {
        this.logger.error(`Failed to process batch ${i + 1}/${batches.length}`, error);
        // Continue with other batches even if one fails
        // Add null embeddings as placeholders
        batch.forEach(() => results.push([]));
      }
    }

    return results;
  }

  private async processBatchWithRetry(texts: string[]): Promise<number[][]> {
    let lastError: Error | null = null;

    for (let attempt = 1; attempt <= this.MAX_RETRIES; attempt++) {
      try {
        const model = this.genAI.getGenerativeModel({ 
          model: 'text-embedding-004' 
        });

        // Process each text in the batch
        const promises = texts.map(text => 
          model.embedContent(text).then(result => result.embedding.values)
        );

        const embeddings = await Promise.all(promises);

        // Validate embeddings
        embeddings.forEach((embedding, index) => {
          if (!embedding || embedding.length !== this.EMBEDDING_DIMENSION) {
            throw new Error(`Invalid embedding dimension at index ${index}`);
          }
        });

        return embeddings;
      } catch (error: any) {
        lastError = error;
        this.logger.warn(`Attempt ${attempt}/${this.MAX_RETRIES} failed:`, error.message);

        // If rate limited, wait longer before retry
        if (error.message?.includes('rate limit') || error.status === 429) {
          const waitTime = Math.pow(2, attempt) * 1000; // Exponential backoff
          await this.sleep(waitTime);
        } else if (attempt < this.MAX_RETRIES) {
          await this.sleep(1000 * attempt); // Linear backoff for other errors
        }
      }
    }

    throw lastError || new Error('Failed to process batch after retries');
  }

  private chunkArray<T>(array: T[], size: number): T[][] {
    const chunks: T[][] = [];
    for (let i = 0; i < array.length; i += size) {
      chunks.push(array.slice(i, i + size));
    }
    return chunks;
  }

  private sleep(ms: number): Promise<void> {
    return new Promise(resolve => setTimeout(resolve, ms));
  }
}
