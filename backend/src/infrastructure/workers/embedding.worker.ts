import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { EmbeddingQueue } from '../queues/embedding.queue';
import { EmbeddingProcessorService } from '../services/embedding-processor.service';

@Injectable()
export class EmbeddingWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(EmbeddingWorker.name);
  private worker: any;

  constructor(
    private embeddingQueue: EmbeddingQueue,
    private embeddingProcessor: EmbeddingProcessorService,
  ) {}

  async onModuleInit() {
    this.logger.log('Starting embedding worker...');

    this.worker = this.embeddingQueue.createWorker(async (job) => {
      const { emailIds, userId } = job.data;
      await this.embeddingProcessor.processBatch(emailIds, userId);
    });

    this.worker.on('completed', (job: any) => {
      this.logger.log(`Embedding job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job: any, err: Error) => {
      this.logger.error(`Embedding job ${job?.id} failed:`, err);
    });

    this.logger.log('Embedding worker started');
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
      this.logger.log('Embedding worker stopped');
    }
  }
}
