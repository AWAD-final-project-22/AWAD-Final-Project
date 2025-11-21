'use client';

import { Typography } from 'antd';
import { MailOutlined } from '@ant-design/icons';

const { Text } = Typography;

export const EmptyState: React.FC = () => (
  <div
    style={{
      height: '100%',
      display: 'flex',
      flexDirection: 'column',
      alignItems: 'center',
      justifyContent: 'center',
      color: '#8c8c8c',
    }}
  >
    <MailOutlined style={{ fontSize: 48, marginBottom: 16 }} />
    <Text>Select an email to view its content</Text>
  </div>
);
