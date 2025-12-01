import { Injectable } from '@nestjs/common';
import { google } from 'googleapis';
import {
  IGmailService,
  GmailMessage,
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
    userId: string = 'me',
    query: string = '',
    maxResults: number = 10,
  ): Promise<GmailMessage[]> {
    const gmail = this.getClient(accessToken);

    const res = await gmail.users.messages.list({
      userId,
      q: query,
      maxResults,
    });

    const messages = res.data.messages || [];
    if (messages.length === 0) return [];

    const details = await Promise.all(
      messages.map((msg) => this.getMessage(accessToken, userId, msg.id!)),
    );

    return details;
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
}
