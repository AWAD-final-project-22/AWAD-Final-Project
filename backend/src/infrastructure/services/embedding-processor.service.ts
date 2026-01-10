import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IEmbeddingPort } from '../../application/ports/embedding.port';
import type { IEmailWorkflowRepository } from '../../domain/repositories/IEmailWorkFflowRepository';
import { EmailWorkflowEntity } from '../../domain/entities/emaiWorkflow.entity';

export enum EmbeddingStatus {
  PENDING = 'PENDING',
  PROCESSING = 'PROCESSING',
  COMPLETED = 'COMPLETED',
  FAILED = 'FAILED',
}

@Injectable()
export class EmbeddingProcessorService {
  private readonly logger = new Logger(EmbeddingProcessorService.name);
  private readonly BATCH_SIZE = 10;

  constructor(
    @Inject('IEmbeddingPort')
    private readonly embeddingService: IEmbeddingPort,
    @Inject('IEmailWorkflowRepository')
    private readonly workflowRepository: IEmailWorkflowRepository,
  ) {
    if (!embeddingService) {
      throw new Error('IEmbeddingPort is required');
    }
  }

  async processBatch(emailIds: string[], userId: string): Promise<void> {
    this.logger.log(`Processing embedding batch for ${emailIds.length} emails (userId: ${userId})`);

    // Fetch workflows and filter only PENDING ones (exclude PROCESSING/COMPLETED to avoid duplicate processing)
    const workflows: EmailWorkflowEntity[] = [];
    for (const emailId of emailIds) {
      const workflow = await this.workflowRepository.findByGmailMessageId(userId, emailId);
      if (workflow) {
        // Only process if PENDING or null (not PROCESSING or COMPLETED)
        if (
          workflow.embeddingStatus === EmbeddingStatus.PENDING ||
          !workflow.embeddingStatus ||
          workflow.embeddingStatus === null
        ) {
          workflows.push(workflow);
        } else {
          this.logger.debug(
            `Skipping email ${emailId} - status: ${workflow.embeddingStatus}`,
          );
        }
      }
    }

    if (workflows.length === 0) {
      this.logger.log(
        `No pending workflows found for this batch (${emailIds.length} emails checked)`,
      );
      return;
    }

    // Update status to PROCESSING
    for (const workflow of workflows) {
      await this.workflowRepository.updateEmbeddingStatus(
        workflow.id,
        EmbeddingStatus.PROCESSING,
      );
    }

    try {
      // Prepare texts for embedding
      const texts = workflows.map(workflow => {
        const parts = [
          workflow.subject || '',
          workflow.from || '',
          workflow.snippet || '',
          workflow.aiSummary || '',
        ].filter(Boolean);
        return parts.join(' ');
      });

      // Generate embeddings
      this.logger.log(`Generating embeddings for ${texts.length} emails`);
      const embeddings = await this.embeddingService.generateEmbeddingsBatch(texts);

      // Update workflows with embeddings
      const updates = workflows.map((workflow, index) => ({
        id: workflow.id,
        embedding: embeddings[index] || null,
        status: embeddings[index] ? EmbeddingStatus.COMPLETED : EmbeddingStatus.FAILED,
      }));

      await this.workflowRepository.batchUpdateEmbeddings(updates);

      const successCount = updates.filter(u => u.status === EmbeddingStatus.COMPLETED).length;
      const failCount = updates.length - successCount;

      this.logger.log(
        `Batch processing completed: ${successCount} succeeded, ${failCount} failed`,
      );
    } catch (error) {
      this.logger.error('Failed to process embedding batch', error);

      // Mark all as FAILED
      for (const workflow of workflows) {
        await this.workflowRepository.updateEmbeddingStatus(
          workflow.id,
          EmbeddingStatus.FAILED,
        );
      }

      throw error;
    }
  }

  async findPendingEmbeddings(userId: string, limit: number = 50): Promise<string[]> {
    const workflows = await this.workflowRepository.findPendingEmbeddings(userId, limit);
    return workflows.map(w => w.gmailMessageId);
  }
}
