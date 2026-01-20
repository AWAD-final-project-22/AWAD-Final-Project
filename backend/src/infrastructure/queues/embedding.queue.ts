import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue, Worker, QueueEvents } from 'bullmq';
import { RedisService } from '../services/redis.service';
import { ConfigService } from '@nestjs/config';

export interface EmbeddingJobData {
  emailIds: string[];
  userId: string;
}

@Injectable()
export class EmbeddingQueue implements OnModuleInit {
  private readonly logger = new Logger(EmbeddingQueue.name);
  private queue: Queue;
  private queueEvents: QueueEvents;
  private readonly CONCURRENCY = 3;

  constructor(
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const connection = this.redisService.getConnectionOptions();
    
    this.queue = new Queue('embedding-jobs', {
      connection: connection as any, 
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: {
          age: 3600, 
          count: 1000, 
        },
        removeOnFail: {
          age: 86400, 
        },
      },
    });

    this.queueEvents = new QueueEvents('embedding-jobs', {
      connection: connection as any,
    });

    this.setupEventListeners();
    this.logger.log('Embedding queue initialized');
  }

  async addBatchJob(data: EmbeddingJobData, priority?: number) {
    return this.queue.add('process-embedding-batch', data as any, {
      priority: priority || 0,
      jobId: `embedding-${data.userId}-${Date.now()}`,
    });
  }

  createWorker(processor: (job: { data: EmbeddingJobData }) => Promise<void>) {
    const connection = this.redisService.getConnectionOptions();
    
    return new Worker(
      'embedding-jobs',
      async (job: any) => {
        this.logger.log(`Processing embedding job ${job.id} for ${job.data.emailIds.length} emails`);
        await processor(job);
      },
      {
        connection: connection as any, 
        concurrency: this.CONCURRENCY,
        limiter: {
          max: 10, 
          duration: 1000, 
        },
      },
    );
  }

  private setupEventListeners() {
    this.queueEvents.on('completed', ({ jobId }) => {
      this.logger.log(`Job ${jobId} completed`);
    });

    this.queueEvents.on('failed', ({ jobId, failedReason }) => {
      this.logger.error(`Job ${jobId} failed: ${failedReason}`);
    });

    this.queueEvents.on('progress', ({ jobId, data }) => {
      this.logger.debug(`Job ${jobId} progress: ${data}`);
    });
  }

  async getQueueStats() {
    const [waiting, active, completed, failed] = await Promise.all([
      this.queue.getWaitingCount(),
      this.queue.getActiveCount(),
      this.queue.getCompletedCount(),
      this.queue.getFailedCount(),
    ]);

    return {
      waiting,
      active,
      completed,
      failed,
    };
  }

  async close() {
    await this.queue.close();
    await this.queueEvents.close();
  }
}
