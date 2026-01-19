import { Injectable, Logger, Inject } from '@nestjs/common';
import { Cron } from '@nestjs/schedule';
import type { IEmailWorkflowRepository } from '../../domain/repositories/IEmailWorkFflowRepository';
import { EmailWorkflowEntity } from '../../domain/entities/emaiWorkflow.entity';

@Injectable()
export class AutoReturnService {
  private readonly logger = new Logger(AutoReturnService.name);

  constructor(
    @Inject('IEmailWorkflowRepository')
    private readonly workflowRepository: IEmailWorkflowRepository,
  ) {}

  @Cron('*/2 * * * *') 
  async processExpiredSnoozes(): Promise<void> {
    const startTime = Date.now();
    
    try {
      this.logger.log('Starting auto-return process for expired snoozes');
      
      const expiredWorkflows = await this.findExpiredWorkflows();
      
      if (expiredWorkflows.length === 0) {
        this.logger.log('No expired workflows found');
        return;
      }

      this.logger.log(`Found ${expiredWorkflows.length} expired workflows to process`);

      let processedCount = 0;
      let errorCount = 0;

      for (const workflow of expiredWorkflows) {
        try {
          await this.clearSnooze(workflow);
          processedCount++;
          this.logger.log(`Cleared snooze for workflow ${workflow.id}`);
        } catch (error) {
          errorCount++;
          this.logger.error(`Failed to clear snooze for workflow ${workflow.id}:`, error);
        }
      }

      const executionTime = Date.now() - startTime;

      this.logger.log({
        action: 'auto_return_completed',
        totalFound: expiredWorkflows.length,
        processedCount,
        errorCount,
        executionTime,
        timestamp: new Date().toISOString(),
      });

    } catch (error) {
      const executionTime = Date.now() - startTime;
      this.logger.error('Failed to process expired snoozes:', {
        error: error.message,
        executionTime,
        timestamp: new Date().toISOString(),
      });
    }
  }

  async findExpiredWorkflows(): Promise<EmailWorkflowEntity[]> {
    const now = new Date();
    return this.workflowRepository.findSnoozedEmailsDue(now);
  }

  async clearSnooze(workflow: EmailWorkflowEntity): Promise<void> {
    // Clear snoozedUntil bằng cách set về null
    // Status sẽ được giữ nguyên (không thay đổi)
    await this.workflowRepository.updateSnooze(workflow.id, null);
    
    this.logger.log(`Cleared snooze for workflow ${workflow.id} (user: ${workflow.userId})`);
  }
}