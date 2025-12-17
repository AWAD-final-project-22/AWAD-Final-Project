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
      summary: 'Search workflows with fuzzy matching',
      description: 'Search workflows by query with fuzzy matching and typo tolerance. Supports partial matches in subject, sender (from), snippet, and AI summary.',
    }),
    ApiQuery({
      name: 'query',
      required: true,
      description: 'Search query with fuzzy matching support',
      example: 'marketing',
      type: 'string',
      minLength: 1,
      maxLength: 100,
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