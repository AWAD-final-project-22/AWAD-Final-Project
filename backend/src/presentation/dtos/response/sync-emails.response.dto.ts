import { ApiProperty } from '@nestjs/swagger';

export class SyncEmailsResponseDto {
  @ApiProperty({
    description: 'Number of emails successfully synced to database',
    example: 50,
  })
  synced: number;

  @ApiProperty({
    description: 'Total number of emails available in Gmail inbox',
    example: 150,
  })
  total: number;
}