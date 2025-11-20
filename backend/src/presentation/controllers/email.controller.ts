import { Controller, Get, Param } from '@nestjs/common';
import { GetMailboxesUseCase } from '../../application/use-cases/email/get-mailboxes.use-case';
import { GetEmailsUseCase } from '../../application/use-cases/email/get-emails.use-case';
import { GetEmailDetailUseCase } from '../../application/use-cases/email/get-email-detail.use-case';
import {
  ApiTags,
  ApiOperation,
  ApiResponse,
  ApiBearerAuth,
} from '@nestjs/swagger';

@ApiTags('Email')
@ApiBearerAuth() // Indicate that all endpoints in this controller require Bearer token
@Controller('mail')
export class EmailController {
  constructor(
    private readonly getMailboxes: GetMailboxesUseCase,
    private readonly getEmails: GetEmailsUseCase,
    private readonly getEmailDetail: GetEmailDetailUseCase,
  ) {}

  @Get('mailboxes')
  @ApiOperation({ summary: 'Get list of mailboxes' })
  @ApiResponse({ status: 200, description: 'List of mailboxes' })
  async mailboxes() {
    return this.getMailboxes.execute();
  }

  @Get('mailboxes/:id/emails')
  @ApiOperation({ summary: 'Get emails in a specific mailbox' })
  @ApiResponse({ status: 200, description: 'List of emails' })
  async emails(@Param('id') id: string) {
    return this.getEmails.execute(id);
  }

  @Get('emails/:id')
  @ApiOperation({ summary: 'Get email details' })
  @ApiResponse({ status: 200, description: 'Email details' })
  async emailDetail(@Param('id') id: string) {
    return this.getEmailDetail.execute(id);
  }
}
