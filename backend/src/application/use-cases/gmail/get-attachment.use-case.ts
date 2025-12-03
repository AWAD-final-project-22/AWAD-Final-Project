import { BaseGmailUseCase } from './base-gmail.use-case';

export class GetAttachmentUseCase extends BaseGmailUseCase {
  async execute(userId: string, messageId: string, attachmentId: string) {
    const accessToken = await this.getAccessToken(userId);

    return await this.gmailService.getAttachment(
      accessToken,
      messageId,
      attachmentId,
      'me',
    );
  }
}
