import { BaseGmailUseCase } from './base-gmail.use-case';

const allowedLabels = [
  'INBOX',
  'SENT',
  'DRAFT',
  'TRASH',
  'SPAM',
  'STARRED',
  'IMPORTANT',
  'UNREAD'
];

export class GetLabelsUseCase extends BaseGmailUseCase {
  async execute(userId: string) {
    const accessToken = await this.getAccessToken(userId);

        const labels = await this.gmailService.listLabels(
            accessToken,
            'me',
        );

        const filteredLabels = labels.filter(label => 
            allowedLabels.includes(label.id!)
        );

        return filteredLabels;
    }
}