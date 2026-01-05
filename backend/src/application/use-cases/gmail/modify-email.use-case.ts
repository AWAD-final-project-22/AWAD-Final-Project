import { IGmailService, ModifyMessageParams } from '../../ports/gmail.port';
import { EmailAction } from '../../../domain/enums/email-action.enum';
import { BaseGmailUseCase } from './base-gmail.use-case';

export interface ModifyEmailParams {
  action?: EmailAction;
  addLabelIds?: string[];
  removeLabelIds?: string[];
}

export class ModifyEmailUseCase extends BaseGmailUseCase {
  async execute(userId: string, messageId: string, params: ModifyEmailParams) {
    const accessToken = await this.getAccessToken(userId);

    const modifyParams = this.mapActionToLabels(params);

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

  private mapActionToLabels(params: ModifyEmailParams): ModifyMessageParams {
    const result: ModifyMessageParams = {
      addLabelIds: [...(params.addLabelIds || [])],
      removeLabelIds: [...(params.removeLabelIds || [])],
    };

    if (!params.action) {
      return result;
    }

    switch (params.action) {
      case EmailAction.MARK_READ:
        result.removeLabelIds!.push('UNREAD');
        break;

      case EmailAction.MARK_UNREAD:
        result.addLabelIds!.push('UNREAD');
        break;

      case EmailAction.STAR:
        result.addLabelIds!.push('STARRED');
        break;

      case EmailAction.UNSTAR:
        result.removeLabelIds!.push('STARRED');
        break;

      case EmailAction.DELETE:
        result.addLabelIds!.push('TRASH');
        result.removeLabelIds!.push('INBOX');
        break;

      case EmailAction.ARCHIVE:
        result.removeLabelIds!.push('INBOX');
        break;

      case EmailAction.MOVE_TO_INBOX:
        result.addLabelIds!.push('INBOX');
        result.removeLabelIds!.push('TRASH');
        break;
    }

    return result;
  }
}
