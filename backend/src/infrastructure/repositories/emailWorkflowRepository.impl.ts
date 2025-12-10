import { IEmailWorkflowRepository } from '../../domain/repositories/IEmailWorkFflowRepository';
import { Injectable } from '@nestjs/common';
import { PrismaService } from '../database/prisma.service';
import { EmailWorkflowEntity } from '../../domain/entities/emaiWorkflow.entity' 
import { WorkflowStatus } from '@prisma/client';

@Injectable()
export class EmailWorkflowRepositoryImpl implements IEmailWorkflowRepository {
  constructor(private prisma: PrismaService) {}

  private toEntity(workflow: any): EmailWorkflowEntity {
    return new EmailWorkflowEntity({
      ...workflow,
      snippet: workflow.snippet ?? undefined,
      deadline: workflow.deadline ?? undefined,
      snoozedUntil: workflow.snoozedUntil ?? undefined,
      aiSummary: workflow.aiSummary ?? undefined,
      urgencyScore: workflow.urgencyScore ?? undefined,
    });
  }

  async create(data: Partial<EmailWorkflowEntity>): Promise<EmailWorkflowEntity> {
    // Check if workflow already exists for this userId + gmailMessageId
    const existing = await this.findByGmailMessageId(data.userId!, data.gmailMessageId!);
    if (existing) {
      return existing;
    }
    const workflow = await this.prisma.emailWorkflow.create({
      data: {
        userId: data.userId!,
        gmailMessageId: data.gmailMessageId!,
        subject: data.subject!,
        from: data.from!,
        date: data.date!,
        snippet: data.snippet,
        status: data.status || WorkflowStatus.INBOX,
        priority: data.priority || 0,
        deadline: data.deadline,
        snoozedUntil: data.snoozedUntil,
        aiSummary: data.aiSummary,
        urgencyScore: data.urgencyScore,
      },
    });
    return this.toEntity(workflow);
  }

  async findById(id: string): Promise<EmailWorkflowEntity | null> {
    const workflow = await this.prisma.emailWorkflow.findUnique({
      where: { id },
    });
    return workflow ? this.toEntity(workflow) : null;
  }

  async findByGmailMessageId(
    userId: string,
    gmailMessageId: string,
  ): Promise<EmailWorkflowEntity | null> {
    const workflow = await this.prisma.emailWorkflow.findUnique({
      where: {
        userId_gmailMessageId: { userId, gmailMessageId },
      },
    });
    return workflow ? this.toEntity(workflow) : null;
  }

  async findByUserAndStatus(
    userId: string,
    status: WorkflowStatus,
  ): Promise<EmailWorkflowEntity[]> {
    const workflows = await this.prisma.emailWorkflow.findMany({
      where: { userId, status },
      orderBy: [
        { priority: 'desc' },
        { urgencyScore: 'desc' },
        { date: 'desc' },
      ],
    });
    return workflows.map((w) => this.toEntity(w));
  }

  async findSnoozedEmailsDue(now: Date = new Date()): Promise<EmailWorkflowEntity[]> {
    const workflows = await this.prisma.emailWorkflow.findMany({
      where: {
        status: WorkflowStatus.SNOOZED,
        snoozedUntil: {
          lte: now,
        },
      },
    });
    return workflows.map((w) => this.toEntity(w));
  }

  async updateStatus(id: string, status: WorkflowStatus): Promise<EmailWorkflowEntity> {
    const workflow = await this.prisma.emailWorkflow.update({
      where: { id },
      data: {
        status,
        updatedAt: new Date(),
        ...(status !== WorkflowStatus.SNOOZED && {
          snoozedUntil: null,
        }),
      },
    });
    return this.toEntity(workflow);
  }

  async updateSnooze(id: string, snoozedUntil: Date): Promise<EmailWorkflowEntity> {
    const workflow = await this.prisma.emailWorkflow.update({
      where: { id },
      data: {
        status: WorkflowStatus.SNOOZED,
        snoozedUntil,
        updatedAt: new Date(),
      },
    });
    return this.toEntity(workflow);
  }

  async updateAiSummary(
    id: string,
    summary: string,
    urgencyScore?: number,
  ): Promise<EmailWorkflowEntity> {
    const workflow = await this.prisma.emailWorkflow.update({
      where: { id },
      data: {
        aiSummary: summary,
        urgencyScore,
        updatedAt: new Date(),
      },
    });
    return this.toEntity(workflow);
  }

  async syncFromGmail(userId: string, gmailEmails: any[]): Promise<void> {
    const operations = gmailEmails.map((email) =>
      this.prisma.emailWorkflow.upsert({
        where: {
          userId_gmailMessageId: {
            userId,
            gmailMessageId: email.id,
          },
        },
        create: {
          userId,
          gmailMessageId: email.id,
          subject: email.subject || '(No Subject)',
          from: email.from || 'unknown@example.com',
          date: new Date(email.date),
          snippet: email.snippet,
          status: WorkflowStatus.INBOX,
        },
        update: {
          subject: email.subject || '(No Subject)',
          snippet: email.snippet,
        },
      }),
    );

    await this.prisma.$transaction(operations);
  }

  async updateDeadline(id: string, deadline: Date): Promise<EmailWorkflowEntity> {
    const workflow = await this.prisma.emailWorkflow.update({
      where: { id },
      data: { deadline },
    });
    return this.toEntity(workflow);
  }

  async findOverdueEmails(userId: string): Promise<EmailWorkflowEntity[]> {
    const workflows = await this.prisma.emailWorkflow.findMany({
      where: {
        userId,
        deadline: {
          lt: new Date(),
        },
        status: {
          not: WorkflowStatus.DONE,
        },
      },
      orderBy: { deadline: 'asc' },
    });
    return workflows.map((w) => this.toEntity(w));
  }

  async findByUserAndStatusWithPagination(
    userId: string,
    status: WorkflowStatus,
    limit: number,
    offset: number,
  ): Promise<EmailWorkflowEntity[]> {
    const workflows = await this.prisma.emailWorkflow.findMany({
      where: { userId, status },
      orderBy: [
        { priority: 'desc' },
        { urgencyScore: 'desc' },
        { date: 'desc' },
      ],
      take: limit,
      skip: offset,
    });
    return workflows.map((w) => this.toEntity(w));
  }

  async countByUserAndStatus(userId: string, status: WorkflowStatus): Promise<number> {
    return this.prisma.emailWorkflow.count({
      where: { userId, status },
    });
  }
}