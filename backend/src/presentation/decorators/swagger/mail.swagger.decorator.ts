import { applyDecorators } from '@nestjs/common';
import {
  ApiOperation,
  ApiResponse,
  ApiParam,
  ApiQuery,
  ApiBody,
  ApiConsumes,
} from '@nestjs/swagger';
import { SendEmailDto } from '../../dtos/request/send-email.dto';
import { ReplyEmailDto } from '../../dtos/request/reply-email.dto';
import { ModifyEmailDto } from '../../dtos/request/modify-email.dto';

export const ApiGetMailboxes = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get list of mailboxes (labels)',
      description: 'Retrieve all Gmail labels/mailboxes for the authenticated user',
    }),
    ApiResponse({
      status: 200,
      description: 'List of mailboxes returned successfully',
      schema: {
        example: [
          { id: 'INBOX', name: 'Inbox', type: 'system' },
          { id: 'SENT', name: 'Sent', type: 'system' },
          { id: 'STARRED', name: 'Starred', type: 'system' },
        ],
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized - Invalid or missing token' }),
    ApiResponse({ status: 404, description: 'User not found or not linked with Google' }),
  );

export const ApiGetEmailDetail = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get email detail by ID',
      description: 'Retrieve full details of a specific email including body, headers, and attachments',
    }),
    ApiParam({ name: 'id', description: 'Gmail message ID', example: '18c8f1234567890a' }),
    ApiResponse({
      status: 200,
      description: 'Email detail returned successfully',
      schema: {
        example: {
          id: '18c8f1234567890a',
          threadId: '18c8f1234567890a',
          subject: 'Meeting Tomorrow',
          from: 'sender@example.com',
          to: 'recipient@example.com',
          date: '2025-11-30T10:30:00.000Z',
          body: '<p>Email body content</p>',
          isRead: true,
          isStarred: false,
          attachments: [],
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 404, description: 'Email not found' }),
  );

export const ApiGetEmails = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Get emails from a mailbox',
      description: 'Retrieve paginated list of emails from a specific mailbox/label',
    }),
    ApiParam({
      name: 'mailboxId',
      description: 'Mailbox/Label ID (e.g., INBOX, SENT, TRASH)',
      example: 'INBOX',
    }),
    ApiQuery({
      name: 'page',
      required: false,
      description: 'Page number',
      example: 1,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      description: 'Number of emails per page',
      example: 20,
    }),
    ApiResponse({
      status: 200,
      description: 'List of emails with pagination info',
      schema: {
        example: {
          emails: [
            {
              id: '18c8f1234567890a',
              subject: 'Meeting Tomorrow',
              from: 'sender@example.com',
              date: '2025-11-30T10:30:00.000Z',
              snippet: 'Email preview text...',
              isRead: true,
              isStarred: false,
            },
          ],
          page: 1,
          limit: 20,
          total: 150,
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 404, description: 'Mailbox not found' }),
  );

export const ApiSendEmail = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Send a new email',
      description: 'Send a new email via Gmail API with optional file attachments',
    }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          to: {
            type: 'array',
            items: { type: 'string' },
            description: 'Recipient email addresses',
            example: ['recipient@example.com']
          },
          subject: {
            type: 'string',
            description: 'Email subject',
            example: 'Meeting Tomorrow'
          },
          body: {
            type: 'string',
            description: 'Email body (HTML supported)',
            example: '<p>Hi, let\'s meet tomorrow at 10am.</p>'
          },
          cc: {
            type: 'array',
            items: { type: 'string' },
            description: 'CC recipients'
          },
          bcc: {
            type: 'array',
            items: { type: 'string' },
            description: 'BCC recipients'
          },
          files: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary'
            },
            description: 'File attachments (upload files directly)'
          }
        },
        required: ['to', 'subject', 'body']
      }
    }),
    ApiResponse({
      status: 201,
      description: 'Email sent successfully',
      schema: {
        example: {
          success: true,
          messageId: '18c8f1234567890a',
          threadId: '18c8f1234567890a',
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Bad request - Invalid email data' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 500, description: 'Failed to send email' }),
  );

export const ApiReplyEmail = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Reply to an email',
      description: 'Send a reply to an existing email with optional file attachments, maintaining the thread',
    }),
    ApiParam({ name: 'id', description: 'Original email message ID', example: '18c8f1234567890a' }),
    ApiConsumes('multipart/form-data'),
    ApiBody({
      schema: {
        type: 'object',
        properties: {
          body: {
            type: 'string',
            description: 'Reply body (HTML supported)',
            example: '<p>Thanks for your email. I will check and get back to you.</p>'
          },
          includeOriginal: {
            type: 'boolean',
            description: 'Include original message in reply',
            default: true
          },
          files: {
            type: 'array',
            items: {
              type: 'string',
              format: 'binary'
            },
            description: 'File attachments (upload files directly)'
          }
        },
        required: ['body']
      }
    }),
    ApiResponse({
      status: 201,
      description: 'Reply sent successfully',
      schema: {
        example: {
          success: true,
          messageId: '18c8f9876543210b',
          threadId: '18c8f1234567890a',
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Bad request - Invalid reply data' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 404, description: 'Original email not found' }),
  );

export const ApiModifyEmail = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Modify email labels',
      description: 'Modify email by changing labels (mark as read/unread, star, delete, archive, etc.)',
    }),
    ApiParam({ name: 'id', description: 'Email message ID', example: '18c8f1234567890a' }),
    ApiBody({ type: ModifyEmailDto }),
    ApiResponse({
      status: 200,
      description: 'Email modified successfully',
      schema: {
        example: {
          success: true,
          messageId: '18c8f1234567890a',
          labelIds: ['INBOX', 'UNREAD'],
        },
      },
    }),
    ApiResponse({ status: 400, description: 'Bad request - Invalid action or label IDs' }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 404, description: 'Email not found' }),
  );

export const ApiGetAttachment = () =>
  applyDecorators(
    ApiOperation({
      summary: 'Download email attachment',
      description: 'Stream and download an attachment from an email by message ID and attachment ID',
    }),
    ApiParam({ name: 'messageId', description: 'Gmail message ID', example: '18c8f1234567890a' }),
    ApiParam({ name: 'attachmentId', description: 'Attachment ID from email', example: 'ANGjdJ8wVN...' }),
    ApiResponse({
      status: 200,
      description: 'Attachment file streamed successfully',
      content: {
        'application/octet-stream': {
          schema: {
            type: 'string',
            format: 'binary',
          },
        },
      },
      headers: {
        'Content-Type': {
          description: 'MIME type of the attachment',
          schema: { type: 'string', example: 'application/pdf' },
        },
        'Content-Disposition': {
          description: 'Attachment filename',
          schema: { type: 'string', example: 'attachment; filename="document.pdf"' },
        },
        'Content-Length': {
          description: 'Size of the attachment in bytes',
          schema: { type: 'number', example: 12345 },
        },
      },
    }),
    ApiResponse({ status: 401, description: 'Unauthorized' }),
    ApiResponse({ status: 404, description: 'Attachment not found' }),
    ApiResponse({ status: 500, description: 'Failed to retrieve attachment' }),
  );

