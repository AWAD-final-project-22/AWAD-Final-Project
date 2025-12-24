import { ApiProperty } from '@nestjs/swagger';

export class SuggestionItemDto {
  @ApiProperty({
    description: 'Suggestion text',
    example: 'John Doe',
  })
  text: string;

  @ApiProperty({
    description: 'Type of suggestion',
    enum: ['sender', 'subject'],
    example: 'sender',
  })
  type: 'sender' | 'subject';

  @ApiProperty({
    description: 'Number of emails matching this suggestion',
    example: 5,
  })
  count: number;
}

export class GetSuggestionsResponseDto {
  @ApiProperty({
    description: 'Success status',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'List of suggestions',
    type: [SuggestionItemDto],
  })
  suggestions: SuggestionItemDto[];
}
