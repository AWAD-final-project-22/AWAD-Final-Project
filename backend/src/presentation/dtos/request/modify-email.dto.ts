import { ApiProperty } from '@nestjs/swagger';
import { IsEnum, IsOptional } from 'class-validator';
import { EmailAction } from '../../../domain/enums/email-action.enum';

export class ModifyEmailDto {
  @ApiProperty({
    description: 'Action to perform on the email',
    enum: EmailAction,
    example: EmailAction.MARK_READ,
  })
  @IsEnum(EmailAction)
  action: EmailAction;

  @ApiProperty({
    description: 'Custom label IDs to add (optional)',
    required: false,
    example: ['Label_123'],
  })
  @IsOptional()
  addLabelIds?: string[];

  @ApiProperty({
    description: 'Custom label IDs to remove (optional)',
    required: false,
    example: ['Label_456'],
  })
  @IsOptional()
  removeLabelIds?: string[];
}
