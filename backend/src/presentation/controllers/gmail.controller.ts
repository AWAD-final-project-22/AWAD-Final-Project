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
  UploadedFiles
} from '@nestjs/common';
import { FileFieldsInterceptor } from '@nestjs/platform-express';
import { ApiTags, ApiBearerAuth } from '@nestjs/swagger';
import {
  ApiGetMailboxes,
  ApiGetEmailDetail,
  ApiGetEmails,
  ApiSendEmail,
  ApiReplyEmail,
  ApiModifyEmail,
  ApiGetAttachment,
} from '../decorators/swagger/mail.swagger.decorator';
import { JwtAuthGuard } from '../guards/jwt-auth.guard';
import { GetLabelsUseCase } from '../../application/use-cases/gmail/get-labels.use-case';
import { GetEmailsUseCase } from '../../application/use-cases/gmail/get-emails.use-case';
import { GetEmailDetailUseCase } from '../../application/use-cases/gmail/get-email-detail.use-case';
import { SendEmailUseCase } from '../../application/use-cases/gmail/send-email.use-case';
import { ReplyEmailUseCase } from '../../application/use-cases/gmail/reply-email.use-case';
import { ModifyEmailUseCase } from '../../application/use-cases/gmail/modify-email.use-case';
import { GetAttachmentUseCase } from '../../application/use-cases/gmail/get-attachment.use-case';
import { SendEmailDto } from '../dtos/request/send-email.dto';
import { ReplyEmailDto } from '../dtos/request/reply-email.dto';
import { ModifyEmailDto } from '../dtos/request/modify-email.dto';

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
  ) {}

  @Get('mailboxes')
  @ApiGetMailboxes()
  async getMailboxes(@Req() req: any) {
    return await this.getLabelsUseCase.execute(req.user.sub);
  }

  @Get('emails/:id')
  @ApiGetEmailDetail()
  async getEmailDetail(@Req() req: any, @Param('id') id: string) {
    return await this.getEmailDetailUseCase.execute(req.user.sub, id);
  }

  @Get('mailboxes/:mailboxId/emails')
  @ApiGetEmails()
  async getEmails(
    @Req() req: any, 
    @Param('mailboxId') mailboxId: string,
    @Query('page') page?: string,
    @Query('limit') limit?: string,
  ) {
    const mbId = mailboxId || 'inbox';
    const pageNum = page ? parseInt(page, 10) : 1;
    const limitNum = limit ? parseInt(limit, 10) : 20;
    
    return await this.getEmailsUseCase.execute(
      req.user.sub, 
      mbId,
      pageNum,
      limitNum,
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
    const filterValidEmails = (value: any): string[] | undefined => {
      if (!value) return undefined;
      const arr = Array.isArray(value) ? value : [value];
      const filtered = arr.filter(email => 
        email && 
        typeof email === 'string' && 
        email.trim() !== '' && 
        email !== 'string' && 
        email.includes('@')
      );
      return filtered.length > 0 ? filtered : undefined;
    };

    // Parse array fields from multipart/form-data
    const to = Array.isArray(body.to) ? body.to : (body.to ? [body.to] : []);
    const cc = filterValidEmails(body.cc);
    const bcc = filterValidEmails(body.bcc);

    // Convert uploaded files to base64 attachments
    let attachments: Array<{ filename: string; content: string; mimeType: string }> = [];
    
    if (uploadedFiles?.files) {
      const fileAttachments = uploadedFiles.files.map(file => ({
        filename: file.originalname,
        content: file.buffer.toString('base64'),
        mimeType: file.mimetype
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
    @Req() req: any,
    @Param('id') id: string,
    @Body() body: any,
    @UploadedFiles() uploadedFiles?: { files?: any[] }
  ) {
    // Helper to filter valid email addresses
    const filterValidEmails = (value: any): string[] | undefined => {
      if (!value) return undefined;
      const arr = Array.isArray(value) ? value : [value];
      const filtered = arr.filter(email => 
        email && 
        typeof email === 'string' && 
        email.trim() !== '' && 
        email !== 'string' && 
        email.includes('@')
      );
      return filtered.length > 0 ? filtered : undefined;
    };

    // Parse email fields
    const to = body.to ? (Array.isArray(body.to) ? body.to : [body.to]) : undefined;
    const cc = filterValidEmails(body.cc);
    const bcc = filterValidEmails(body.bcc);
    const includeOriginal = body.includeOriginal === 'true' || body.includeOriginal === true;

    // Convert uploaded files to base64 attachments
    let attachments: Array<{ filename: string; content: string; mimeType: string }> = [];
    
    if (uploadedFiles?.files) {
      const fileAttachments = uploadedFiles.files.map(file => ({
        filename: file.originalname,
        content: file.buffer.toString('base64'),
        mimeType: file.mimetype
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
    @Req() req: any,
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
    @Req() req: any,
    @Param('messageId') messageId: string,
    @Param('attachmentId') attachmentId: string,
    @Res({ passthrough: true }) res: any,
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
}

