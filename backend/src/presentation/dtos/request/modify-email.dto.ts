import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional, IsArray, IsString } from 'class-validator';
import { EmailAction } from '../../../domain/enums/email-action.enum';

export class ModifyEmailDto {
  @ApiProperty({
    description: 'Action to perform on the email (optional if using label IDs)',
    enum: EmailAction,
    required: false,
    example: EmailAction.MARK_READ,
  })
  @IsOptional()
  @IsEnum(EmailAction)
  action?: EmailAction;

  @ApiProperty({
    description: 'Label IDs to add to the email',
    required: false,
    example: ['STARRED', 'IMPORTANT'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  addLabelIds?: string[];

  @ApiProperty({
    description: 'Label IDs to remove from the email',
    required: false,
    example: ['UNREAD'],
  })
  @IsOptional()
  @IsArray()
  @IsString({ each: true })
  removeLabelIds?: string[];
}
