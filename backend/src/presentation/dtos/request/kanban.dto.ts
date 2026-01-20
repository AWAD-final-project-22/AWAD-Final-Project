import { ApiProperty } from '@nestjs/swagger';
import {
  IsString,
  IsNotEmpty,
  IsOptional,
  IsNumber,
  Min,
} from 'class-validator';

export class CreateColumnDto {
  @ApiProperty({
    description: 'Column name (optional, defaults to label if not provided)',
    required: false,
    example: 'To Review',
  })
  @IsOptional()
  @IsString()
  name?: string;

  @ApiProperty({
    description: 'Gmail label ID to map to this column',
    example: 'STARRED',
  })
  @IsString()
  @IsNotEmpty()
  label: string;

  @ApiProperty({
    description: 'Column order (position)',
    required: false,
    example: 0,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}

export class UpdateColumnDto {
  @ApiProperty({
    description: 'New column name',
    required: false,
    example: 'Reviewed',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  name?: string;

  @ApiProperty({
    description: 'New Gmail label ID',
    required: false,
    example: 'IMPORTANT',
  })
  @IsOptional()
  @IsString()
  @IsNotEmpty()
  label?: string;

  @ApiProperty({
    description: 'New column order (position)',
    required: false,
    example: 1,
  })
  @IsOptional()
  @IsNumber()
  @Min(0)
  order?: number;
}

export class MoveCardDto {
  @ApiProperty({
    description: 'Source column ID',
    example: 'uuid-source-column',
  })
  @IsString()
  @IsNotEmpty()
  sourceColumnId: string;

  @ApiProperty({
    description: 'Destination column ID',
    example: 'uuid-destination-column',
  })
  @IsString()
  @IsNotEmpty()
  destinationColumnId: string;
}
