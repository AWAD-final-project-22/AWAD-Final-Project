'use client';

import { EmptyState } from '@/components/EmptyState';
import { LoadingSpin } from '@/components/LoadingSpin';
import {
  DeleteOutlined,
  DownloadOutlined,
  ForwardOutlined,
  PaperClipOutlined,
  SendOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { Button, Divider, Tooltip, Typography } from 'antd';
import { useState } from 'react';
import { getFileIcon } from '../helpers/fileIcon.helper';
import {
  IEmailDetail,
  IReplyEmailParams,
  ISendMessageParams,
} from '../interfaces/mailAPI.interface';
import {
  AttachmentCard,
  AttachmentContainer,
  AttachmentList,
  CardEmailDetail,
  EmailDetail,
  FileIconWrapper,
  FileInfo,
  FileMeta,
  FileName,
  FileSize,
} from '../styles/InboxPage.style';
import { ReplyEmailModal } from './ReplyEmailModal';

const { Title, Text } = Typography;

interface EmailDetailProps {
  show: boolean;
  email: IEmailDetail | undefined;
  isEmailDetailLoading: boolean;
  handleSendReply: (payload: ISendMessageParams) => void;
  isReplyEmailPending: boolean;
  onDownloadAttachment: (
    messageId: string,
    attachmentId: string,
    filename: string,
  ) => void;
}

export const EmailDetailPanel: React.FC<EmailDetailProps> = ({
  show,
  email,
  handleSendReply,
  isReplyEmailPending = false,
  isEmailDetailLoading = false,
  onDownloadAttachment,
}) => {
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyParams, setReplyParams] = useState<
    IReplyEmailParams | undefined
  >();

  const handleReplyClick = () => {
    if (!email) return;

    const fromAddress = email.from || email.sender || '';
    const senderEmail = fromAddress.match(/<([^>]+)>/)?.[1] || fromAddress;

    const params: IReplyEmailParams = {
      to: [senderEmail],
      body: email.preview || '',
      includeOriginal: true,
    };

    setReplyParams(params);
    setReplyModalOpen(true);
  };

  const handleDownloadClick = (
    e: React.MouseEvent,
    attachmentId: string,
    filename: string,
  ) => {
    e.stopPropagation();
    if (email && attachmentId) {
      onDownloadAttachment(email.id, attachmentId, filename);
    }
  };

  const renderLoading = () => {
    return <LoadingSpin />;
  };
  return (
    <EmailDetail $show={show}>
      {email ? (
        <>
          <CardEmailDetail
            title={
              <div>
                <Title level={4} style={{ marginBottom: -10, marginTop: 15 }}>
                  {email.subject}
                </Title>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                    alignItems: 'center',
                    marginTop: 8,
                  }}
                >
                  <div>
                    <Text type='secondary'>From: {email.from}</Text>
                  </div>
                  <div style={{ marginLeft: '8px' }}>
                    <Text type='secondary' style={{ marginRight: 8 }}>
                      {new Date(email.date).toLocaleString()}
                    </Text>
                    <Tooltip title='Toggle star'>
                      <Button type='text' icon={<StarOutlined />} />
                    </Tooltip>
                    <Tooltip title='Forward'>
                      <Button type='text' icon={<ForwardOutlined />} />
                    </Tooltip>
                    <Tooltip title='Reply'>
                      <Button
                        type='text'
                        icon={<SendOutlined />}
                        onClick={handleReplyClick}
                      />
                    </Tooltip>
                    <Tooltip title='Delete'>
                      <Button type='text' icon={<DeleteOutlined />} />
                    </Tooltip>
                  </div>
                </div>
              </div>
            }
          >
            <div style={{ marginBottom: 16 }}>
              {email.snippet && (
                <Typography.Paragraph
                  type='secondary'
                  style={{ marginBottom: 8 }}
                >
                  {email.snippet}
                </Typography.Paragraph>
              )}
              {email.body && (
                <div
                  style={{
                    background: '#fafafa',
                    padding: 12,
                    borderRadius: 6,
                  }}
                  dangerouslySetInnerHTML={{ __html: email.body }}
                />
              )}
            </div>
            {email.attachments && email.attachments.length > 0 && (
              <AttachmentContainer>
                <Divider orientation='left' style={{ fontSize: '14px' }}>
                  <PaperClipOutlined style={{ marginRight: 8 }} />
                  Attachments ({email.attachments.length})
                </Divider>

                <AttachmentList>
                  {email.attachments.map((att) => (
                    <AttachmentCard key={att.id}>
                      <FileInfo>
                        <FileIconWrapper>
                          {getFileIcon(att.mimeType, att.filename)}
                        </FileIconWrapper>
                        <FileMeta>
                          <FileName title={att.filename}>
                            {att.filename}
                          </FileName>
                          <FileSize>
                            {Math.round((att.size || 0) / 1024)} KB
                          </FileSize>
                        </FileMeta>
                      </FileInfo>

                      <Tooltip title='Download'>
                        <Button
                          type='text'
                          icon={<DownloadOutlined />}
                          disabled={!att.id}
                          onClick={(e) =>
                            handleDownloadClick(e, att.id || '', att.filename)
                          }
                        />
                      </Tooltip>
                    </AttachmentCard>
                  ))}
                </AttachmentList>
              </AttachmentContainer>
            )}
          </CardEmailDetail>

          <ReplyEmailModal
            open={replyModalOpen}
            onClose={() => setReplyModalOpen(false)}
            onSend={handleSendReply}
            replyParams={replyParams}
            originalSubject={email.subject}
            isReplyEmailPending={isReplyEmailPending}
          />
        </>
      ) : isEmailDetailLoading ? (
        renderLoading()
      ) : (
        <EmptyState message='Select an email to view its content' />
      )}
    </EmailDetail>
  );
};
