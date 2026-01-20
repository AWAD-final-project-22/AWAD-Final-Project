import { IsString, IsOptional, Min } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';
import { Type } from 'class-transformer';

export class GetSuggestionsDto {
  @ApiProperty({
    description: 'Search query string',
    example: 'john',
    required: true,
  })
  @IsString()
  q: string;

  @ApiProperty({
    description: 'Maximum number of suggestions to return',
    example: 5,
    required: false,
    default: 5,
  })
  @IsOptional()
  @Type(() => Number)
  @Min(1)
  limit?: number;
}
