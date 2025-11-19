export interface IMailbox {
  id: string;
  name: string;
}

export interface IEmail {
  id: string;
  mailboxId: string;
  sender: string;
  subject: string;
  preview: string;
  timestamp: string;
  isRead?: boolean;
  isStarred?: boolean;
  hasAttachment?: boolean;
}
