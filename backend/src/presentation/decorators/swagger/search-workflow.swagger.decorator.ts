import { applyDecorators } from '@nestjs/common';
import { ApiBearerAuth, ApiTags, ApiOperation, ApiQuery, ApiResponse } from '@nestjs/swagger';

/**
 * Swagger documentation for search workflows endpoint
 */
export const ApiSearchWorkflowsDocs = () => {
  return applyDecorators(
    ApiTags('Workflows'),
    ApiBearerAuth('JWT-auth'),
    ApiOperation({
      summary: 'Fuzzy Search - Search workflows with typo tolerance',
      description: 'Fuzzy search workflows with typo tolerance and partial matching. Uses PostgreSQL pg_trgm extension for similarity matching. Features: Typo tolerance (e.g., "marketng" → finds "marketing"), Partial matches (e.g., "Nguy" → finds "Nguyễn Văn A", "nguyen@example.com"), Relevance ranking (results sorted by match quality), Searches in: subject (weight 3x), sender/from (weight 2.5x), snippet (weight 1x), AI summary (weight 1.5x)',
    }),
    ApiQuery({
      name: 'query',
      required: true,
      description: 'Search query with fuzzy matching and typo tolerance (e.g., "marketng" will find "marketing", "Nguy" will find "Nguyễn")',
      example: 'marketng',
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
      description: 'Page number for pagination',
      type: 'number',
      minimum: 1,
      example: 1,
    }),
    ApiResponse({
      status: 200,
      description: 'Workflows found successfully',
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
              $ref: '#/components/schemas/EmailWorkflow',
            },
          },
          pagination: {
            type: 'object',
            properties: {
              total: {
                type: 'integer',
                example: 25,
              },
              limit: {
                type: 'integer',
                example: 10,
              },
              offset: {
                type: 'integer',
                example: 0,
              },
              hasMore: {
                type: 'boolean',
                example: true,
              },
              currentPage: {
                type: 'integer',
                example: 1,
              },
            },
          },
        },
      },
    }),
    ApiResponse({
      status: 401,
      description: 'Unauthorized',
    }),
    ApiResponse({
      status: 400,
      description: 'Bad Request - Invalid query parameters',
    }),
  );
};