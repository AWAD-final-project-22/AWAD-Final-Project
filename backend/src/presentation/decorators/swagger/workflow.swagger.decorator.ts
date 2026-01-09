import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiQuery,
  ApiResponse,
  ApiBody,
} from '@nestjs/swagger';
import { WorkflowStatus } from '@prisma/client';
import { WorkflowSortBy } from '../../dtos/request/get-workflows-filter.dto';

export function ApiGetWorkflowsDocs() {
  return applyDecorators(
    ApiOperation({
      summary: 'Get email workflows by status with sorting and filtering',
      description: 'Get workflows with optional sorting (date_newest/date_oldest) and filtering (unreadOnly, attachmentsOnly). INBOX: fetch từ Gmail + AI summarize | TODO/DONE/SNOOZED: query DB. Filters and sorting apply in real-time.',
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
    ApiQuery({
      name: 'sortBy',
      enum: WorkflowSortBy,
      required: false,
      description: 'Sort workflows by date: date_newest (newest first) or date_oldest (oldest first)',
      example: WorkflowSortBy.DATE_NEWEST,
    }),
    ApiQuery({
      name: 'unreadOnly',
      type: Boolean,
      required: false,
      example: false,
      description: 'Show only unread emails (filter)',
    }),
    ApiQuery({
      name: 'attachmentsOnly',
      type: Boolean,
      required: false,
      example: false,
      description: 'Show only emails with attachments (filter)',
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
          sort: {
            sortBy: 'date_newest',
          },
          filters: {
            unreadOnly: false,
            attachmentsOnly: false,
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