import { Injectable, Logger, Inject } from '@nestjs/common';
import type { IAiSummaryPort } from '../../application/ports/ai-summary.port';
import type { IEmailWorkflowRepository } from '../../domain/repositories/IEmailWorkFflowRepository';
import { EmailWorkflowEntity } from '../../domain/entities/emaiWorkflow.entity';

@Injectable()
export class SummaryProcessorService {
  private readonly logger = new Logger(SummaryProcessorService.name);

  constructor(
    @Inject('IAiSummaryPort')
    private readonly aiSummaryService: IAiSummaryPort,
    @Inject('IEmailWorkflowRepository')
    private readonly workflowRepository: IEmailWorkflowRepository,
  ) {
    if (!aiSummaryService) {
      throw new Error('IAiSummaryPort is required');
    }
  }

  async processBatch(emailIds: string[], userId: string): Promise<void> {
    this.logger.log(`Processing summary batch for ${emailIds.length} emails (userId: ${userId})`);

    // Batch fetch all workflows at once instead of sequential calls
    const allWorkflows = await Promise.all(
      emailIds.map(emailId => 
        this.workflowRepository.findByGmailMessageId(userId, emailId)
      )
    );

    const workflows: EmailWorkflowEntity[] = [];
    for (let i = 0; i < allWorkflows.length; i++) {
      const workflow = allWorkflows[i];
      const emailId = emailIds[i];
      
      if (workflow) {
        const needsSummary = 
          !workflow.aiSummary || 
          workflow.aiSummary.trim() === '' ||
          workflow.aiSummary.includes('AI summarization failed') ||
          workflow.aiSummary.includes('being processed');
        
        if (needsSummary) {
          workflows.push(workflow);
        } else {
          this.logger.debug(
            `Skipping email ${emailId} - already has valid summary`,
          );
        }
      }
    }

    if (workflows.length === 0) {
      this.logger.log(
        `No workflows needing summary found for this batch (${emailIds.length} emails checked)`,
      );
      return;
    }

    this.logger.log(`Found ${workflows.length} workflows needing AI summary`);

    try {
      const batchInput = workflows.map(workflow => ({
        id: workflow.gmailMessageId,
        subject: workflow.subject || '',
        body: workflow.snippet || '',
      }));

      this.logger.log(`Generating AI summaries for ${batchInput.length} emails`);
      const aiResults = await this.aiSummaryService.summarizeEmailBatch(batchInput);

      const updates: Array<{
        id: string;
        summary: string;
        urgencyScore: number;
      }> = [];

      for (const workflow of workflows) {
        const aiResult = aiResults[workflow.gmailMessageId];
        if (aiResult) {
          updates.push({
            id: workflow.id,
            summary: aiResult.summary,
            urgencyScore: aiResult.urgencyScore,
          });
        } else {
          updates.push({
            id: workflow.id,
            summary: 'AI summarization failed',
            urgencyScore: 0.5,
          });
        }
      }

      // Batch update all summaries in parallel instead of sequential
      const updatePromises = updates.map(update =>
        this.workflowRepository.updateAiSummary(
          update.id,
          update.summary,
          update.urgencyScore,
        )
      );
      await Promise.all(updatePromises);

      const successCount = updates.filter(u => !u.summary.includes('failed')).length;
      const failCount = updates.length - successCount;

      this.logger.log(
        `Batch processing completed: ${successCount} succeeded, ${failCount} failed`,
      );
    } catch (error) {
      this.logger.error('Failed to process summary batch', error);

      for (const workflow of workflows) {
        try {
          await this.workflowRepository.updateAiSummary(
            workflow.id,
            'AI summarization failed',
            0.5,
          );
        } catch (updateError) {
          this.logger.error(`Failed to update workflow ${workflow.id} as failed:`, updateError);
        }
      }

      throw error;
    }
  }

  async findPendingSummaries(userId: string, limit: number = 50): Promise<string[]> {
    try {
      // Find workflows that need AI summary processing
      const workflows = await this.workflowRepository.findByUserAndStatusWithPagination(
        userId,
        'INBOX' as any, // Cast to avoid type issues
        limit,
        0,
        {}
      );

      const pendingWorkflows: EmailWorkflowEntity[] = [];
      for (const workflow of workflows) {
        const needsSummary = 
          !workflow.aiSummary || 
          workflow.aiSummary.trim() === '' ||
          workflow.aiSummary.includes('AI summarization failed') ||
          workflow.aiSummary.includes('being processed');
        
        if (needsSummary) {
          pendingWorkflows.push(workflow);
        }
        
        if (pendingWorkflows.length >= limit) {
          break;
        }
      }

      return pendingWorkflows.map(w => w.gmailMessageId);
    } catch (error) {
      this.logger.error('Failed to find pending summaries:', error);
      return [];
    }
  }
}