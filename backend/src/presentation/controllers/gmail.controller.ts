import {
  Controller,
  Get,
  Post,
  Param,
  Query,
  UseGuards,
  Req,
  Body,
  Res,
  StreamableFile,
  UseInterceptors,
  UploadedFiles,
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import type { Request, Response } from 'express';

interface MulterFile {
  fieldname: string;
  originalname: string;
  encoding: string;
  mimetype: string;
  buffer: Buffer;
  size: number;
}
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  ApiGetMailboxes,
  ApiGetEmailDetail,
  ApiGetEmails,
  ApiSendEmail,
  ApiReplyEmail,
  ApiModifyEmail,
  ApiGetAttachment,
  ApiSyncEmails,
  ApiDeleteEmail,
} from '../decorators/swagger/mail.swagger.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetLabelsUseCase } from '../../application/use-cases/gmail/get-labels.use-case';
import { GetEmailsUseCase } from '../../application/use-cases/gmail/get-emails.use-case';
import { GetEmailDetailUseCase } from '../../application/use-cases/gmail/get-email-detail.use-case';
import { SendEmailUseCase } from '../../application/use-cases/gmail/send-email.use-case';
import { ReplyEmailUseCase } from '../../application/use-cases/gmail/reply-email.use-case';
import { ModifyEmailUseCase } from '../../application/use-cases/gmail/modify-email.use-case';
import { GetAttachmentUseCase } from '../../application/use-cases/gmail/get-attachment.use-case';
import { SyncEmailsUseCase } from '../../application/use-cases/gmail/sync-emails.use-case';
import { DeleteEmailUseCase } from '../../application/use-cases/gmail/delete-email.use-case';
import { ModifyEmailDto } from '../dtos/request/modify-email.dto';
import { SyncEmailsDto } from '../dtos/request/sync-emails.dto';
import { SyncEmailsResponseDto } from '../dtos/response/sync-emails.response.dto';

@ApiTags('Mail')
@ApiBearerAuth('JWT-auth')
@UseGuards(JwtAuthGuard)
@Controller('mail')
export class GmailController {
  constructor(
    private readonly getLabelsUseCase: GetLabelsUseCase,
    private readonly getEmailsUseCase: GetEmailsUseCase,
    private readonly getEmailDetailUseCase: GetEmailDetailUseCase,
    private readonly sendEmailUseCase: SendEmailUseCase,
    private readonly replyEmailUseCase: ReplyEmailUseCase,
    private readonly modifyEmailUseCase: ModifyEmailUseCase,
    private readonly getAttachmentUseCase: GetAttachmentUseCase,
    private readonly syncEmailsUseCase: SyncEmailsUseCase,
    private readonly deleteEmailUseCase: DeleteEmailUseCase,
  ) {}

  @Get('mailboxes')
  @ApiGetMailboxes()
  async getMailboxes(@Req() req: Request & { user: { sub: string } }) {
    return await this.getLabelsUseCase.execute(req.user.sub);
  }

  @Get('emails/:id')
  @ApiGetEmailDetail()
  async getEmailDetail(@Req() req: Request & { user: { sub: string } }, @Param('id') id: string) {
    return await this.getEmailDetailUseCase.execute(req.user.sub, id);
  }

  @Get('mailboxes/:mailboxId/emails')
  @ApiGetEmails()
  async getEmails(
    @Req() req: any, 
    @Param('mailboxId') mailboxId: string,
    @Query('limit') limit?: string,
    @Query('offset') offset?: string,
    @Query('sortBy') sortBy?: 'date_newest' | 'date_oldest',
    @Query('unreadOnly') unreadOnly?: string,
    @Query('attachmentsOnly') attachmentsOnly?: string,
  ) {
    const mbId = mailboxId || 'inbox';
    const limitNum = limit ? parseInt(limit, 10) : 20;
    const offsetNum = offset ? parseInt(offset, 10) : 0;

    const filterOptions = {
      sortBy: sortBy || 'date_newest',
      unreadOnly: unreadOnly === 'true',
      attachmentsOnly: attachmentsOnly === 'true',
    };

    return await this.getEmailsUseCase.execute(
      req.user.sub,
      mbId,
      limitNum,
      offsetNum,
      filterOptions,
    );
  }

  @Post('emails/send')
  @ApiSendEmail()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 10 }]))
  async sendEmail(
    @Req() req: any, 
    @Body() body: any,
    @UploadedFiles() uploadedFiles?: { files?: any[] }
  ) {
    // Helper to filter valid email addresses
    const filterValidEmails = (value: unknown): string[] | undefined => {
      if (!value) return undefined;
      const arr = Array.isArray(value) ? value : [value];
      const filtered = arr.filter(
        (email) =>
          email &&
          typeof email === 'string' &&
          email.trim() !== '' &&
          email !== 'string' &&
          email.includes('@'),
      );
      return filtered.length > 0 ? filtered : undefined;
    };

    // Parse array fields from multipart/form-data
    const to = Array.isArray(body.to) ? body.to : body.to ? [body.to] : [];
    const cc = filterValidEmails(body.cc);
    const bcc = filterValidEmails(body.bcc);

    // Convert uploaded files to base64 attachments
    let attachments: Array<{
      filename: string;
      content: string;
      mimeType: string;
    }> = [];

    if (body.attachments && Array.isArray(body.attachments)) {
      attachments = [...body.attachments];
    }

    if (uploadedFiles?.files) {
      const fileAttachments = uploadedFiles.files.map((file) => ({
        filename: file.originalname,
        content: file.buffer.toString('base64'),
        mimeType: file.mimetype,
      }));
      attachments = [...attachments, ...fileAttachments];
    }

    return await this.sendEmailUseCase.execute(req.user.sub, {
      to,
      subject: body.subject,
      body: body.body,
      cc,
      bcc,
      attachments,
    });
  }

  @Post('emails/:id/reply')
  @ApiReplyEmail()
  @UseInterceptors(FileFieldsInterceptor([{ name: 'files', maxCount: 10 }]))
  async replyEmail(
    @Req() req: Request & { user: { sub: string } },
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles() uploadedFiles?: { files?: any[] }
  ) {
    // Helper to filter valid email addresses
    const filterValidEmails = (value: unknown): string[] | undefined => {
      if (!value) return undefined;
      const arr = Array.isArray(value) ? value : [value];
      const filtered = arr.filter(
        (email) =>
          email &&
          typeof email === 'string' &&
          email.trim() !== '' &&
          email !== 'string' &&
          email.includes('@'),
      );
      return filtered.length > 0 ? filtered : undefined;
    };

    // Parse email fields
    const to = body.to
      ? Array.isArray(body.to)
        ? body.to
        : [body.to]
      : undefined;
    const cc = filterValidEmails(body.cc);
    const bcc = filterValidEmails(body.bcc);
    const includeOriginal =
      body.includeOriginal === 'true' || body.includeOriginal === true;

    // Convert uploaded files to base64 attachments
    let attachments: Array<{
      filename: string;
      content: string;
      mimeType: string;
    }> = [];

    if (body.attachments && Array.isArray(body.attachments)) {
      attachments = [...body.attachments];
    }

    if (uploadedFiles?.files) {
      const fileAttachments = uploadedFiles.files.map((file) => ({
        filename: file.originalname,
        content: file.buffer.toString('base64'),
        mimeType: file.mimetype,
      }));
      attachments = [...attachments, ...fileAttachments];
    }

    return await this.replyEmailUseCase.execute(req.user.sub, id, {
      to,
      cc,
      bcc,
      body: body.body,
      includeOriginal,
      attachments,
    });
  }

  @Post('emails/:id/modify')
  @ApiModifyEmail()
  async modifyEmail(
    @Req() req: Request & { user: { sub: string } },
    @Param('id') id: string,
    @Body() dto: ModifyEmailDto,
  ) {
    return await this.modifyEmailUseCase.execute(req.user.sub, id, {
      action: dto.action,
      addLabelIds: dto.addLabelIds,
      removeLabelIds: dto.removeLabelIds,
    });
  }

  @Get('attachments/:messageId/:attachmentId')
  @ApiGetAttachment()
  async getAttachment(
    @Req() req: Request & { user: { sub: string } },
    @Param('messageId') messageId: string,
    @Param('attachmentId') attachmentId: string,
    @Res({ passthrough: true }) res: Response,
  ) {
    const result = await this.getAttachmentUseCase.execute(
      req.user.sub,
      messageId,
      attachmentId,
    );

    // Set response headers for file download
    res.set({
      'Content-Type': result.mimeType,
      'Content-Disposition': `attachment; filename="${result.filename}"`,
      'Content-Length': result.data.length,
    });

    return new StreamableFile(result.data);
  }

  @Post('sync')
  @ApiSyncEmails()
  async syncEmails(
    @Req() req: Request & { user: { sub: string } },
    @Query() query: SyncEmailsDto,
  ): Promise<SyncEmailsResponseDto> {
    const result = await this.syncEmailsUseCase.execute(req.user.sub, query.limit || 50);
    
    return {
      success: true,
      data: {
        synced: result.synced,
        total: result.total,
      },
    };
  }

  @Post('emails/:id/delete')
  @ApiDeleteEmail()
  async deleteEmail(
    @Req() req: Request & { user: { sub: string } },
    @Param('id') id: string,
  ) {
    return await this.deleteEmailUseCase.execute(req.user.sub, id);
  }
}
