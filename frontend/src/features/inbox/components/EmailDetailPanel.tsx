'use client';

import { IEmail } from '../interfaces/mailAPI.interface';
import { EmailDetail } from '../styles/InboxPage.style';
import { Button, Card, Typography } from 'antd';
import {
  DeleteOutlined,
  DownloadOutlined,
  ForwardOutlined,
  SendOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { Divider } from 'antd';
import { EmptyState } from './EmptyState';

const { Title, Text } = Typography;

export const EmailDetailPanel: React.FC<{
  show: boolean;
  email: IEmail | undefined;
}> = ({ show, email }) => (
  <EmailDetail show={show}>
    {email ? (
      <Card
        title={
          <div>
            <Title level={4} style={{ marginBottom: 0 }}>
              {email.subject}
            </Title>
            <div
              style={{
                display: 'flex',
                justifyContent: 'space-between',
                marginTop: 8,
              }}
            >
              <Text type='secondary'>From: {email.sender}</Text>
              <div>
                <Text type='secondary' style={{ marginRight: 16 }}>
                  {new Date(email.timestamp).toLocaleString()}
                </Text>
                <Button type='text' icon={<StarOutlined />} />
                <Button type='text' icon={<ForwardOutlined />} />
                <Button type='text' icon={<SendOutlined />} />
                <Button type='text' icon={<DeleteOutlined />} />
              </div>
            </div>
          </div>
        }
        bordered={false}
        style={{
          height: '100%',
          display: 'flex',
          flexDirection: 'column',
        }}
        bodyStyle={{ flex: 1, overflowY: 'auto' }}
      >
        <div style={{ whiteSpace: 'pre-line' }}>
          <p>Hello,</p>
          <p>
            This is a sample email content. You can view the details of the
            email here.
          </p>
          <p>Best regards,</p>
          <p>Sender</p>
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
    ) : (
      <EmptyState />
    )}
  </EmailDetail>
);
