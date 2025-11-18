import { Controller, Get, Param } from '@nestjs/common';
import { GetMailboxesUseCase } from '../../application/use-cases/email/get-mailboxes.use-case';
import { GetEmailsUseCase } from '../../application/use-cases/email/get-emails.use-case';
import { GetEmailDetailUseCase } from '../../application/use-cases/email/get-email-detail.use-case';

@Controller('mail')
export class EmailController {
  constructor(
    private readonly getMailboxes: GetMailboxesUseCase,
    private readonly getEmails: GetEmailsUseCase,
    private readonly getEmailDetail: GetEmailDetailUseCase,
  ) {}

  @Get('mailboxes')
  async mailboxes() {
    return this.getMailboxes.execute();
  }

  @Get('mailboxes/:id/emails')
  async emails(@Param('id') id: string) {
    return this.getEmails.execute(id);
  }

  @Get('emails/:id')
  async emailDetail(@Param('id') id: string) {
    return this.getEmailDetail.execute(id);
  }
}
