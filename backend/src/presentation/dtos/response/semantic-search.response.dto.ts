import { ApiProperty } from '@nestjs/swagger';
import { WorkflowStatus } from '@prisma/client';

export class SemanticSearchResultDto {
  @ApiProperty({ description: 'Workflow ID', example: 'uuid-here' })
  id: string;

  @ApiProperty({ description: 'User ID', example: 'user-uuid' })
  userId: string;

  @ApiProperty({ description: 'Gmail message ID', example: 'gmail-msg-id' })
  gmailMessageId: string;

  @ApiProperty({ description: 'Email subject', example: 'Meeting tomorrow' })
  subject: string;

  @ApiProperty({ description: 'Email sender', example: 'john@example.com' })
  from: string;

  @ApiProperty({ description: 'Email date', example: '2024-01-09T10:00:00Z' })
  date: Date;

  @ApiProperty({ description: 'Email snippet', required: false, example: 'Email preview text...' })
  snippet?: string;

  @ApiProperty({ description: 'Has attachment', example: false })
  hasAttachment: boolean;

  @ApiProperty({ 
    description: 'Workflow status', 
    enum: WorkflowStatus,
    example: WorkflowStatus.INBOX 
  })
  status: WorkflowStatus;

  @ApiProperty({ description: 'Priority', example: 0 })
  priority: number;

  @ApiProperty({ description: 'Deadline', required: false, example: '2024-01-10T10:00:00Z' })
  deadline?: Date;

  @ApiProperty({ description: 'Snoozed until', required: false })
  snoozedUntil?: Date;

  @ApiProperty({ description: 'AI summary', required: false })
  aiSummary?: string;

  @ApiProperty({ description: 'Urgency score (0-1)', required: false, example: 0.7 })
  urgencyScore?: number;

  @ApiProperty({ description: 'Embedding status', required: false, example: 'COMPLETED' })
  embeddingStatus?: string;

  @ApiProperty({ description: 'Created at', example: '2024-01-09T10:00:00Z' })
  createdAt: Date;

  @ApiProperty({ description: 'Updated at', example: '2024-01-09T10:00:00Z' })
  updatedAt: Date;

  @ApiProperty({ 
    description: 'Similarity score (0-1, higher is better). Indicates how relevant this result is to the search query.',
    example: 0.892,
    required: false,
    minimum: 0,
    maximum: 1,
  })
  similarity?: number;
}

export class SemanticSearchPaginationDto {
  @ApiProperty({ description: 'Total number of results', example: 50 })
  total: number;

  @ApiProperty({ description: 'Number of results per page', example: 10 })
  limit: number;

  @ApiProperty({ description: 'Number of results skipped', example: 0 })
  offset: number;

  @ApiProperty({ description: 'Whether there are more results', example: true })
  hasMore: boolean;

  @ApiProperty({ description: 'Current page number', example: 1 })
  currentPage: number;
}

export class SemanticSearchResponseDto {
  @ApiProperty({ description: 'Success status', example: true })
  success: boolean;

  @ApiProperty({ 
    description: 'Search results with similarity scores',
    type: [SemanticSearchResultDto],
  })
  data: SemanticSearchResultDto[];

  @ApiProperty({ 
    description: 'Pagination information',
    type: SemanticSearchPaginationDto,
  })
  pagination: SemanticSearchPaginationDto;
}
