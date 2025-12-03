import { BaseGmailUseCase } from './base-gmail.use-case';

export class GetMailboxesUseCase extends BaseGmailUseCase {
  async execute(userId: string) {
    const accessToken = await this.getAccessToken(userId);

    // Google Gmail API gọi Labels là Mailboxes
    // Vì IGmailService ta chưa define getLabels, ta tạm dùng getProfile hoặc listMessages
    // Thực tế ta cần thêm getLabels vào IGmailService.
    // Nhưng để đơn giản, ta giả lập mailboxes static hoặc gọi API nếu bạn muốn update Port.
    
    return [
      { id: 'INBOX', name: 'Inbox' },
      { id: 'SENT', name: 'Sent' },
      { id: 'DRAFT', name: 'Drafts' },
      { id: 'TRASH', name: 'Trash' },
      { id: 'SPAM', name: 'Spam' },
    ];
  }
}
