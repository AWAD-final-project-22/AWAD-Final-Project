import { Injectable, Logger, OnModuleInit } from '@nestjs/common';
import { Queue, Worker, QueueEvents } from 'bullmq';
import { RedisService } from '../services/redis.service';
import { ConfigService } from '@nestjs/config';

export interface SummaryJobData {
  emailIds: string[];
  userId: string;
}

@Injectable()
export class SummaryQueue implements OnModuleInit {
  private readonly logger = new Logger(SummaryQueue.name);
  private queue: Queue;
  private queueEvents: QueueEvents;
  private readonly CONCURRENCY = 2; // Conservative for demo

  constructor(
    private redisService: RedisService,
    private configService: ConfigService,
  ) {}

  async onModuleInit() {
    const connection = this.redisService.getConnectionOptions();
    
    this.queue = new Queue('summary-jobs', {
      connection: connection as any, 
      defaultJobOptions: {
        attempts: 3,
        backoff: {
          type: 'exponential',
          delay: 2000,
        },
        removeOnComplete: {
          age: 3600, // Keep completed jobs for 1 hour
          count: 500, // Keep max 500 completed jobs
        },
        removeOnFail: {
          age: 86400, // Keep failed jobs for 24 hours for debugging
        },
      },
    });

    this.queueEvents = new QueueEvents('summary-jobs', {
      connection: connection as any,
    });

    this.setupEventListeners();
    this.logger.log('Summary queue initialized');
  }

  async addBatchJob(data: SummaryJobData, priority?: number) {
    const jobId = `summary-${data.userId}-${Date.now()}-${Math.random().toString(36).substr(2, 9)}`;
    return this.queue.add('process-summary-batch', data as any, {
      priority: priority || 0,
      jobId,
    });
  }

  createWorker(processor: (job: { data: SummaryJobData }) => Promise<void>) {
    const connection = this.redisService.getConnectionOptions();
    
    return new Worker(
      'summary-jobs',
      async (job: any) => {
        this.logger.log(`Processing summary job ${job.id} for ${job.data.emailIds.length} emails`);
        await processor(job);
      },
      {
        connection: connection as any, 
        concurrency: this.CONCURRENCY,
        limiter: {
          max: 5, // 5 jobs per second - conservative for demo
          duration: 1000, 
        },
      },
    );
  }

  private setupEventListeners() {
    this.queueEvents.on('completed', ({ jobId }) => {
      this.logger.log(`Summary job ${jobId} completed`);
    });

    this.queueEvents.on('failed', ({ jobId, failedReason }) => {
      this.logger.error(`Summary job ${jobId} failed: ${failedReason}`);
    });

    this.queueEvents.on('progress', ({ jobId, data }) => {
      this.logger.debug(`Summary job ${jobId} progress: ${data}`);
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