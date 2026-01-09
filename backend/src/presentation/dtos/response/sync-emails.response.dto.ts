import { ApiProperty } from '@nestjs/swagger';

class SyncEmailsDataDto {
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

export class SyncEmailsResponseDto {
  @ApiProperty({
    description: 'Indicates if the operation was successful',
    example: true,
  })
  success: boolean;

  @ApiProperty({
    description: 'Sync result data',
    type: SyncEmailsDataDto,
  })
  data: SyncEmailsDataDto;
}