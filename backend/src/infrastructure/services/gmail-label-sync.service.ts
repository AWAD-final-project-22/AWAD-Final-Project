import { Injectable, Logger, Inject } from '@nestjs/common';
import { IGmailService } from '../../application/ports/gmail.port';
import { GmailTokenService } from './gmail-token.service';

@Injectable()
export class GmailLabelSyncService {
  private readonly logger = new Logger(GmailLabelSyncService.name);

  constructor(
    @Inject(IGmailService)
    private readonly gmailService: IGmailService,
    private readonly gmailTokenService: GmailTokenService,
  ) {}

  async applyLabel(
    userId: string,
    emailId: string,
    labelId: string,
  ): Promise<void> {
    const accessToken = await this.gmailTokenService.getAccessToken(userId);

    await this.gmailService.modifyMessage(accessToken, 'me', emailId, {
      addLabelIds: [labelId],
    });

    this.logger.log(`Applied label ${labelId} to email ${emailId}`);
  }

  async removeLabel(
    userId: string,
    emailId: string,
    labelId: string,
  ): Promise<void> {
    const accessToken = await this.gmailTokenService.getAccessToken(userId);

    await this.gmailService.modifyMessage(accessToken, 'me', emailId, {
      removeLabelIds: [labelId],
    });

    this.logger.log(`Removed label ${labelId} from email ${emailId}`);
  }

  async moveCard(
    userId: string,
    emailId: string,
    sourceLabel: string,
    destinationLabel: string,
  ): Promise<void> {
    const accessToken = await this.gmailTokenService.getAccessToken(userId);

    await this.gmailService.modifyMessage(accessToken, 'me', emailId, {
      addLabelIds: [destinationLabel],
      removeLabelIds: [sourceLabel],
    });

    this.logger.log(
      `Moved email ${emailId} from ${sourceLabel} to ${destinationLabel}`,
    );
  }

  async batchRemoveLabel(
    userId: string,
    emailIds: string[],
    labelId: string,
  ): Promise<void> {
    const accessToken = await this.gmailTokenService.getAccessToken(userId);

    const results = await Promise.allSettled(
      emailIds.map((emailId) =>
        this.gmailService.modifyMessage(accessToken, 'me', emailId, {
          removeLabelIds: [labelId],
        }),
      ),
    );

    const failed = results.filter((r) => r.status === 'rejected');
    if (failed.length > 0) {
      this.logger.warn(
        `Failed to remove label from ${failed.length}/${emailIds.length} emails`,
      );
    }

    this.logger.log(
      `Batch removed label ${labelId} from ${emailIds.length - failed.length} emails`,
    );
  }
}
