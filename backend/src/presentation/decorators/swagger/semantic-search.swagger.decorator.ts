import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

/**
 * Swagger documentation for semantic search workflows endpoint
 */
export const ApiSemanticSearchDocs = () => {
  return applyDecorators(
    ApiTags('Workflows'),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: 'Semantic search workflows using AI embeddings',
      description: 'Search workflows using semantic similarity with AI embeddings. This provides more intelligent search results that understand context, synonyms, and meaning rather than just exact keyword matches. Results are ranked by similarity score (0-1, higher is better).',
    }),
    ApiQuery({
      name: 'query',
      required: true,
      description: 'Search query for semantic search (understands context and synonyms)',
      example: 'meeting tomorrow',
      type: 'string',
      minLength: 1,
      maxLength: 200,
    }),
    ApiQuery({
      name: 'limit',
      required: false,
      description: 'Maximum number of results to return',
      type: 'number',
      minimum: 1,
      maximum: 100,
      example: 10,
    }),
    ApiQuery({
      name: 'offset',
      required: false,
      description: 'Number of results to skip for pagination',
      type: 'number',
      minimum: 0,
      example: 0,
    }),
    ApiQuery({
      name: 'page',
      required: false,
      description: 'Page number for pagination (alternative to offset)',
      type: 'number',
      minimum: 1,
      example: 1,
    }),
    ApiResponse({
      status: 200,
      description: 'Semantic search completed successfully. Results are ranked by similarity score.',
      schema: {
        type: 'object',
        properties: {
          success: {
            type: 'boolean',
            example: true,
          },
          data: {
            type: 'array',
            items: {
              type: 'object',
              properties: {
                id: { type: 'string', example: 'uuid-here' },
                userId: { type: 'string', example: 'user-uuid' },
                gmailMessageId: { type: 'string', example: 'gmail-msg-id' },
                subject: { type: 'string', example: 'Meeting tomorrow' },
                from: { type: 'string', example: 'john@example.com' },
                date: { type: 'string', format: 'date-time' },
                snippet: { type: 'string', example: 'Email preview...' },
                hasAttachment: { type: 'boolean', example: false },
                status: { type: 'string', enum: ['INBOX', 'TODO', 'IN_PROGRESS', 'DONE', 'SNOOZED'] },
                priority: { type: 'number', example: 0 },
                deadline: { type: 'string', format: 'date-time', nullable: true },
                snoozedUntil: { type: 'string', format: 'date-time', nullable: true },
                aiSummary: { type: 'string', nullable: true },
                urgencyScore: { type: 'number', example: 0.7, nullable: true },
                embeddingStatus: { type: 'string', example: 'COMPLETED', nullable: true },
                createdAt: { type: 'string', format: 'date-time' },
                updatedAt: { type: 'string', format: 'date-time' },
                similarity: {
                  type: 'number',
                  description: 'Similarity score (0-1, higher is better)',
                  example: 0.892,
                  minimum: 0,
                  maximum: 1,
                },
              },
            },
          },
          pagination: {
            type: 'object',
            properties: {
              total: { type: 'integer', example: 50, description: 'Total number of results available' },
              limit: { type: 'integer', example: 10 },
              offset: { type: 'integer', example: 0 },
              hasMore: { type: 'boolean', example: true },
              currentPage: { type: 'integer', example: 1 },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - Query parameter is required or invalid',
      schema: {
        type: 'object',
        properties: {
          success: { type: 'boolean', example: false },
          message: { type: 'string', example: 'Query parameter is required' },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized - Invalid or missing JWT token',
    }),
    ApiResponse({
      status: 500,
      description: 'Internal Server Error - Semantic search failed, may fallback to fuzzy search',
    }),
  );
};
