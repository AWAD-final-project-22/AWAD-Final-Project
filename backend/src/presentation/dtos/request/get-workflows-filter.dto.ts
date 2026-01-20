import { ApiProperty } from '@nestjs/swagger';
import { IsOptional, IsEnum, IsBoolean } from 'class-validator';
import { Transform } from 'class-transformer';

export enum WorkflowSortBy {
  DATE_NEWEST = 'date_newest',
  DATE_OLDEST = 'date_oldest',
}

// Custom transformer to properly parse boolean from query string
const parseBoolean = (value: any): boolean | undefined => {
  if (value === undefined || value === null) {
    return undefined;
  }
  if (typeof value === 'boolean') {
    return value;
  }
  if (typeof value === 'string') {
    const lowerValue = value.toLowerCase();
    if (lowerValue === 'true') return true;
    if (lowerValue === 'false') return false;
    // For other strings, return undefined (treat as not provided)
    return undefined;
  }
  return Boolean(value);
};

export class GetWorkflowsFilterDto {
  @ApiProperty({
    description: 'Sort workflows by date',
    enum: WorkflowSortBy,
    required: false,
    example: WorkflowSortBy.DATE_NEWEST,
  })
  @IsOptional()
  @IsEnum(WorkflowSortBy)
  sortBy?: WorkflowSortBy;

  @ApiProperty({
    description: 'Show only unread emails',
    required: false,
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseBoolean(value))
  @IsBoolean()
  unreadOnly?: boolean;

  @ApiProperty({
    description: 'Show only emails with attachments',
    required: false,
    example: false,
  })
  @IsOptional()
  @Transform(({ value }) => parseBoolean(value))
  @IsBoolean()
  attachmentsOnly?: boolean;
}
