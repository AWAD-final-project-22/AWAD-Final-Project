import { Injectable, Optional, Logger } from '@nestjs/common';
import { EmailWorkflowEntity } from '../../domain/entities/emaiWorkflow.entity';
import { EmbeddingQueue } from '../queues/embedding.queue';

/**
 * Service to handle queueing embedding jobs for workflows.
 * This service encapsulates the logic of determining which workflows need embeddings
 * and queueing them, keeping the use case clean and focused on business logic.
 */
@Injectable()
export class EmbeddingQueueService {
  private readonly logger = new Logger(EmbeddingQueueService.name);
  private readonly BATCH_SIZE = 10;

  constructor(@Optional() private readonly embeddingQueue?: EmbeddingQueue) {}

  /**
   * Queue embedding jobs only for workflows that don't have embeddings yet.
   * Only processes the provided workflows (e.g., from pagination), not all emails in DB.
   *
   * @param userId - User ID
   * @param workflows - Workflows to check and queue (typically from pagination result)
   */
  async queuePendingEmbeddings(
    userId: string,
    workflows: EmailWorkflowEntity[],
  ): Promise<void> {
    if (!this.embeddingQueue) {
      this.logger.debug('Embedding queue not available, skipping queue operation');
      return;
    }

    if (workflows.length === 0) {
      return;
    }

    this.logger.log(
      `[EMBEDDING QUEUE] Checking embedding status for ${workflows.length} workflows (pagination only, not all DB)`,
    );

    // Filter only workflows without embeddings (exclude PROCESSING to avoid duplicate jobs)
    const pendingEmails = workflows.filter(
      (w) =>
        (!w.embedding || w.embedding.length === 0) &&
        w.embeddingStatus !== 'COMPLETED' &&
        w.embeddingStatus !== 'PROCESSING' &&
        (w.embeddingStatus === 'PENDING' || !w.embeddingStatus || w.embeddingStatus === null),
    );

    const alreadyHasEmbedding = workflows.length - pendingEmails.length;
    if (alreadyHasEmbedding > 0) {
      this.logger.log(
        `[EMBEDDING QUEUE] Skipping ${alreadyHasEmbedding} workflows that already have embeddings`,
      );
    }

    if (pendingEmails.length === 0) {
      this.logger.log(`[EMBEDDING QUEUE] No workflows need embedding generation`);
      return;
    }

    const emailIds = pendingEmails.map((w) => w.gmailMessageId).filter(Boolean);
    this.logger.log(
      `[EMBEDDING QUEUE] Queueing ${emailIds.length} workflows for embedding generation (from ${workflows.length} fetched)`,
    );

    // Queue in batches
    let batchCount = 0;
    for (let i = 0; i < emailIds.length; i += this.BATCH_SIZE) {
      const batch = emailIds.slice(i, i + this.BATCH_SIZE);
      await this.embeddingQueue.addBatchJob({
        emailIds: batch,
        userId,
      });
      batchCount++;
    }

    this.logger.log(`[EMBEDDING QUEUE] Queued ${batchCount} embedding batch jobs`);
  }
}
