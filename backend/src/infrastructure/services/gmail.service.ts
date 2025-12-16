import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import {
  IGmailService,
  GmailMessage,
  GmailLabel,
  ListMessagesParams,
  ListMessagesResponse,
  SendMessageParams,
  ModifyMessageParams,
} from '../../application/ports/gmail.port';

@Injectable()
export class GmailServiceImpl implements IGmailService {
  private getClient(accessToken: string) {
    const oauth2Client = new google.auth.OAuth2();
    oauth2Client.setCredentials({ access_token: accessToken });
    return google.gmail({ version: 'v1', auth: oauth2Client });
  }

  async getProfile(accessToken: string): Promise<any> {
    const gmail = this.getClient(accessToken);
    const res = await gmail.users.getProfile({ userId: 'me' });
    return res.data;
  }

  async listMessages(
    accessToken: string,
    params: ListMessagesParams,
  ): Promise<ListMessagesResponse> {
    const gmail = this.getClient(accessToken);
    const userId = params.userId || 'me';

    const res = await gmail.users.messages.list({
      userId,
      labelIds: params.labelIds,
      q: params.query,
      maxResults: params.maxResults || 20,
      pageToken: params.pageToken, 
    });

    const messages = res.data.messages || [];
    
    const details = messages.length > 0 
      ? await Promise.all(
          messages.map((msg) => this.getMessage(accessToken, userId, msg.id!)),
        )
      : [];

    return {
      messages: details,
      nextPageToken: res.data.nextPageToken ?? undefined,
      resultSizeEstimate: res.data.resultSizeEstimate ?? undefined,
    };
  }

  async getMessage(
    accessToken: string,
    userId: string = 'me',
    messageId: string,
  ): Promise<GmailMessage> {
    const gmail = this.getClient(accessToken);
    const res = await gmail.users.messages.get({
      userId,
      id: messageId,
      format: 'full', 
    });

    return res.data as unknown as GmailMessage;
  }

  async listLabels(
    accessToken: string,
    userId: string = 'me',
  ): Promise<GmailLabel[]> {
    const gmail = this.getClient(accessToken);
    
    const res = await gmail.users.labels.list({ 
      userId 
    });
    
    return (res.data.labels || []) as GmailLabel[];
  }

  async sendMessage(
    accessToken: string,
    params: SendMessageParams,
  ): Promise<GmailMessage> {
    const gmail = this.getClient(accessToken);

    const email = this.createEmailMessage(params);

    // Encode base64url
    const encodedMessage = Buffer.from(email)
      .toString('base64')
      .replace(/\+/g, '-')
      .replace(/\//g, '_')
      .replace(/=+$/, '');

    interface SendMessageRequestBody {
      raw: string;
      threadId?: string;
    }

    const requestBody: SendMessageRequestBody = {
      raw: encodedMessage,
    };

    if (params.threadId) {
      requestBody.threadId = params.threadId;
    }

    const res = await gmail.users.messages.send({
      userId: 'me',
      requestBody,
    });

    return res.data as unknown as GmailMessage;
  }

  async modifyMessage(
    accessToken: string,
    userId: string = 'me',
    messageId: string,
    params: ModifyMessageParams,
  ): Promise<GmailMessage> {
    const gmail = this.getClient(accessToken);

    const res = await gmail.users.messages.modify({
      userId,
      id: messageId,
      requestBody: {
        addLabelIds: params.addLabelIds,
        removeLabelIds: params.removeLabelIds,
      },
    });

    return res.data as unknown as GmailMessage;
  }

  async getAttachment(
    accessToken: string,
    messageId: string,
    attachmentId: string,
    userId: string = 'me',
  ): Promise<{ data: Buffer; mimeType: string; filename: string }> {
    const gmail = this.getClient(accessToken);

    const attachmentRes = await gmail.users.messages.attachments.get({
      userId,
      messageId,
      id: attachmentId,
    });

    const messageRes = await gmail.users.messages.get({
      userId,
      id: messageId,
      format: 'full',
    });

    let filename = 'attachment';
    let mimeType = 'application/octet-stream';

    const findAttachment = (parts: any[]): void => {
      for (const part of parts) {
        if (part.body?.attachmentId === attachmentId) {
          filename = part.filename || filename;
          mimeType = part.mimeType || mimeType;
          return;
        }
        if (part.parts) {
          findAttachment(part.parts);
        }
      }
    };

    if (messageRes.data.payload?.parts) {
      findAttachment(messageRes.data.payload.parts);
    }

    const data = attachmentRes.data.data;
    if (!data) {
      throw new Error('Attachment data not found');
    }

    const base64 = data.replace(/-/g, '+').replace(/_/g, '/');
    const buffer = Buffer.from(base64, 'base64');

    return { data: buffer, mimeType, filename };
  }

  private createEmailMessage(params: SendMessageParams): string {
    const lines: string[] = [];

    lines.push(`To: ${params.to.join(', ')}`);
    
    if (params.cc?.length) {
      lines.push(`Cc: ${params.cc.join(', ')}`);
    }
    
    if (params.bcc?.length) {
      lines.push(`Bcc: ${params.bcc.join(', ')}`);
    }
    
    lines.push(`Subject: ${params.subject}`);
    
    if (params.replyToMessageId) {
      lines.push(`In-Reply-To: <${params.replyToMessageId}>`);
      lines.push(`References: <${params.replyToMessageId}>`);
    }
    
    lines.push('MIME-Version: 1.0');

    // If has attachments, create multipart/mixed email
    if (params.attachments && params.attachments.length > 0) {
      const boundary = `----=_Part_${Date.now()}_${Math.random().toString(36).substring(2)}`;
      
      lines.push(`Content-Type: multipart/mixed; boundary="${boundary}"`);
      lines.push('');
      
      // Body part
      lines.push(`--${boundary}`);
      lines.push('Content-Type: text/html; charset=UTF-8');
      lines.push('Content-Transfer-Encoding: 7bit');
      lines.push('');
      lines.push(params.body);
      lines.push('');
      
      // Attachment parts
      for (const attachment of params.attachments) {
        lines.push(`--${boundary}`);
        lines.push(`Content-Type: ${attachment.mimeType}; name="${attachment.filename}"`);
        lines.push('Content-Transfer-Encoding: base64');
        lines.push(`Content-Disposition: attachment; filename="${attachment.filename}"`);
        lines.push('');
        
        // Split base64 content into 76-character lines (RFC 2045)
        const base64Lines = attachment.content.match(/.{1,76}/g) || [];
        lines.push(...base64Lines);
        lines.push('');
      }
      
      lines.push(`--${boundary}--`);
    } else {
      // Simple text/html email without attachments
      lines.push('Content-Type: text/html; charset=UTF-8');
      lines.push('');
      lines.push(params.body);
    }

    return lines.join('\r\n');
  }
}