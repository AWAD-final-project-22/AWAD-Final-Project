import { Injectable, Logger, OnModuleInit, OnModuleDestroy } from '@nestjs/common';
import { Worker } from 'bullmq';
import { SummaryQueue } from '../queues/summary.queue';
import { SummaryProcessorService } from '../services/summary-processor.service';

@Injectable()
export class SummaryWorker implements OnModuleInit, OnModuleDestroy {
  private readonly logger = new Logger(SummaryWorker.name);
  private worker: Worker | undefined;

  constructor(
    private summaryQueue: SummaryQueue,
    private summaryProcessor: SummaryProcessorService,
  ) {}

  async onModuleInit() {
    this.logger.log('Starting summary worker...');

    this.worker = this.summaryQueue.createWorker(async (job) => {
      const { emailIds, userId } = job.data;
      await this.summaryProcessor.processBatch(emailIds, userId);
    });

    this.worker.on('completed', (job: any) => {
      this.logger.log(`Summary job ${job.id} completed successfully`);
    });

    this.worker.on('failed', (job: any, err: Error) => {
      this.logger.error(`Summary job ${job?.id} failed:`, err);
    });

    this.logger.log('Summary worker started');
  }

  async onModuleDestroy() {
    if (this.worker) {
      await this.worker.close();
      this.logger.log('Summary worker stopped');
    }
  }
}