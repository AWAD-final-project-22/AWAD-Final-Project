import { IGmailService, ModifyMessageParams } from '../../ports/gmail.port';
import { BaseGmailUseCase } from './base-gmail.use-case';

export class DeleteEmailUseCase extends BaseGmailUseCase {
  async execute(userId: string, messageId: string) {
    const accessToken = await this.getAccessToken(userId);

    const modifyParams: ModifyMessageParams = {
      addLabelIds: ['TRASH'],
      removeLabelIds: ['INBOX'],
    };

    const result = await this.gmailService.modifyMessage(
      accessToken,
      'me',
      messageId,
      modifyParams,
    );

    return {
      success: true,
      messageId: result.id,
      labelIds: result.labelIds,
    };
  }
}
