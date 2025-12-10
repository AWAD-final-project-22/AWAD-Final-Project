import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { WorkflowStatus } from '@prisma/client';

export function ApiGetWorkflowsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get email workflows by status',
      description: 'INBOX: fetch từ Gmail + AI summarize | TODO/DONE/SNOOZED: query DB',
    }),
    ApiQuery({
      name: 'status',
      enum: WorkflowStatus,
      required: true,
      description: 'Workflow status: INBOX, TODO, IN_PROGRESS, DONE, SNOOZED',
    }),
    ApiQuery({
      name: 'limit',
      type: Number,
      required: false,
      example: 10,
      description: 'Items per page (default: 10)',
    }),
    ApiQuery({
      name: 'offset',
      type: Number,
      required: false,
      example: 0,
      description: 'Items to skip (default: 0)',
    }),
    ApiResponse({
      status: 200,
      description: 'Success',
      schema: {
        example: {
          success: true,
          data: [
            {
              id: 'cm4h8x9z00001l408gq5c8h9j',
              gmailMessageId: '18f3c8e1a2b4d5e6',
              subject: 'Meeting tomorrow at 3 PM',
              from: 'john@example.com',
              date: '2025-12-10T10:30:00.000Z',
              snippet: 'Hi, lets meet tomorrow...',
              status: 'INBOX',
              priority: 0,
              deadline: null,
              snoozedUntil: null,
              aiSummary: 'Meeting request. Action: Confirm attendance.',
              urgencyScore: 0.7,
              createdAt: '2025-12-10T10:30:00.000Z',
              updatedAt: '2025-12-10T10:30:00.000Z',
            },
          ],
          pagination: {
            total: 25,
            limit: 10,
            offset: 0,
            hasMore: true,
          },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' })
  );
}

export function ApiUpdateWorkflowStatusDocs() {
  return applyDecorators(
    ApiOperation({ summary: 'Update workflow status', description: 'Chuyển trạng thái workflow (INBOX → TODO/DONE/IN_PROGRESS/SNOOZED)' }),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          status: {
            type: 'string',
            enum: Object.values(WorkflowStatus),
            example: 'TODO',
            description: 'Trạng thái mới cho workflow',
          },
        },
        required: ['status'],
      },
      examples: {
        todo: { summary: 'Chuyển sang TODO', value: { status: 'TODO' } },
        done: { summary: 'Chuyển sang DONE', value: { status: 'DONE' } },
      },
    }),
    ApiResponse({ status: 200, description: 'Status updated successfully', schema: { example: { success: true, data: { id: 'cm4h8x9z00001l408gq5c8h9j', status: 'TODO', updatedAt: '2025-12-10T10:30:00.000Z' } } } }),
    ApiResponse({ status: 400, description: 'Bad Request - Invalid status or input' }),
    ApiResponse({ status: 401, description: 'Unauthorized - Invalid token' }),
    ApiResponse({ status: 404, description: 'Not Found - Workflow not found or not owned by user' })
  );
}