import { ApiProperty } from '@nestjs/swagger';
import { IsNotEmpty, IsOptional, IsString, IsArray, IsEmail } from 'class-validator';

export class ReplyEmailDto {
  @ApiProperty({ 
    description: 'Override recipient email(s) (defaults to original sender)',
    required: false,
    type: [String],
    example: ['user@example.com']
  })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  to?: string[];

  @ApiProperty({ 
    description: 'Carbon copy email(s)',
    required: false,
    type: [String],
    example: ['cc@example.com']
  })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  cc?: string[];

  @ApiProperty({ 
    description: 'Blind carbon copy email(s)',
    required: false,
    type: [String],
    example: ['bcc@example.com']
  })
  @IsOptional()
  @IsArray()
  @IsEmail({}, { each: true })
  bcc?: string[];

  @ApiProperty({ 
    description: 'Reply body (HTML supported)',
    example: '<p>Thanks for your email. I will check and get back to you.</p>'
  })
  @IsString()
  @IsNotEmpty()
  body: string;

  @ApiProperty({ 
    description: 'Include original message in reply',
    required: false,
    default: true
  })
  @IsOptional()
  includeOriginal?: boolean;

  @ApiProperty({ 
    description: 'Upload files directly (for Swagger UI)',
    required: false,
    type: 'array',
    items: {
      type: 'string',
      format: 'binary'
    }
  })
  @IsOptional()
  files?: any[];

  @ApiProperty({ 
    description: 'File attachments (base64 encoded) - use this when sending JSON',
    required: false,
    type: 'array',
    items: {
      type: 'object',
      properties: {
        filename: { type: 'string', example: 'document.pdf' },
        content: { type: 'string', example: 'JVBERi0xLjQK...' },
        mimeType: { type: 'string', example: 'application/pdf' }
      }
    }
  })
  @IsOptional()
  @IsArray()
  attachments?: Array<{
    filename: string;
    content: string;
    mimeType: string;
  }>;
}