'use client';

import { LoadingSpin } from '@/components/LoadingSpin';
import {
  DeleteOutlined,
  DownloadOutlined,
  ForwardOutlined,
  SendOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { Button, Card, Divider, Tooltip, Typography } from 'antd';
import { useState } from 'react';
import {
  IEmailDetail,
  IReplyEmailParams,
  ISendMessageParams,
} from '../interfaces/mailAPI.interface';
import { EmailDetail } from '../styles/InboxPage.style';
import { ReplyEmailModal } from './ReplyEmailModal';
import { EmptyState } from '@/components/EmptyState';

const { Title, Text } = Typography;

interface EmailDetailProps {
  show: boolean;
  email: IEmailDetail | undefined;
  isEmailDetailLoading: boolean;
  handleSendReply: (payload: ISendMessageParams) => void;
  isReplyEmailPending: boolean;
}

export const EmailDetailPanel: React.FC<EmailDetailProps> = ({
  show,
  email,
  handleSendReply,
  isReplyEmailPending = false,
  isEmailDetailLoading = false,
}) => {
  const [replyModalOpen, setReplyModalOpen] = useState(false);
  const [replyParams, setReplyParams] = useState<
    IReplyEmailParams | undefined
  >();

  const handleReplyClick = () => {
    if (!email) return;

    const params: IReplyEmailParams = {
      to: [email.sender],
      body: email.preview || '',
      includeOriginal: true,
    };

    setReplyParams(params);
    setReplyModalOpen(true);
  };

  const renderLoading = () => {
    return <LoadingSpin />;
  };
  return (
    <EmailDetail $show={show}>
      {email ? (
        <>
          <Card
            title={
              <div>
                <Title level={4} style={{ marginBottom: 0, marginTop: 10 }}>
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
            style={{
              height: '100%',
              display: 'flex',
              flexDirection: 'column',
              overflowY: 'auto',
            }}
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
            {email.hasAttachment && (
              <div style={{ marginTop: 24 }}>
                <Divider orientation='left'>Attachment</Divider>
                <div style={{ padding: '8px 0' }}>
                  <Button icon={<DownloadOutlined />} type='link'>
                    document.pdf
                  </Button>
                </div>
              </div>
            )}
          </Card>

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
