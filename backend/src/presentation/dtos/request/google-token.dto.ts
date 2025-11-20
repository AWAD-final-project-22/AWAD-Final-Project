import { IsNotEmpty, IsString } from 'class-validator';
import { ApiProperty } from '@nestjs/swagger';

export class GoogleTokenDto {
  @ApiProperty({ example: 'eyJhbGci...', description: 'Google ID Token' })
  @IsString()
  @IsNotEmpty()
  idToken!: string;
}
