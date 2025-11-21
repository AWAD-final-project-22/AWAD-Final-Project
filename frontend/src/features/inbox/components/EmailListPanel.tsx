'use client';
import { Button, Checkbox, Dropdown, Menu, Typography } from 'antd';
import { IEmail } from '../interfaces/mailAPI.interface';
import {
  EmailItem,
  EmailList,
  EmailPreview,
  EmailSubject,
  EmailTime,
  Toolbar,
} from '../styles/InboxPage.style';

import {
  CheckOutlined,
  CheckSquareOutlined,
  DeleteOutlined,
  MailOutlined,
  MoreOutlined,
  PaperClipOutlined,
  ReloadOutlined,
  StarFilled,
  StarOutlined as StarO,
} from '@ant-design/icons';
const { Text } = Typography;

export const EmailListPanel: React.FC<{
  showEmailList: boolean;
  checkedEmails: Set<string>;
  handleSelectAll: (checked: boolean) => void;
  filteredEmails: IEmail[];
  handleCheckboxChange: (id: string, checked: boolean) => void;
  handleEmailClick: (id: string) => void;
}> = ({
  showEmailList,
  checkedEmails,
  handleSelectAll,
  filteredEmails,
  handleCheckboxChange,
  handleEmailClick,
}) => {
  const menu = (
    <Menu>
      <Menu.Item key='markAsRead' icon={<CheckOutlined />}>
        Mark as read
      </Menu.Item>
      <Menu.Item key='markAsUnread' icon={<MailOutlined />}>
        Mark as unread
      </Menu.Item>
      <Menu.Divider />
      <Menu.Item key='delete' danger icon={<DeleteOutlined />}>
        Delete
      </Menu.Item>
    </Menu>
  );

  const formatDate = (dateString: string) => {
    const date = new Date(dateString);
    const now = new Date();

    if (date.toDateString() === now.toDateString()) {
      return date.toLocaleTimeString([], {
        hour: '2-digit',
        minute: '2-digit',
      });
    }

    if (date.getFullYear() === now.getFullYear()) {
      return date.toLocaleDateString([], { month: 'short', day: 'numeric' });
    }

    return date.toLocaleDateString([], {
      year: 'numeric',
      month: 'short',
      day: 'numeric',
    });
  };

  return (
    <EmailList show={showEmailList}>
      <Toolbar>
        <Checkbox
          onChange={(e) => handleSelectAll(e.target.checked)}
          checked={
            checkedEmails.size > 0 &&
            checkedEmails.size === filteredEmails?.length
          }
          indeterminate={
            filteredEmails &&
            checkedEmails.size > 0 &&
            checkedEmails.size < filteredEmails?.length
          }
        />
        <Button type='text' icon={<ReloadOutlined />} />
        <Button type='text' icon={<DeleteOutlined />} />
        <Button type='text' icon={<MailOutlined />} />
        <Dropdown overlay={menu} trigger={['click']}>
          <Button type='text' icon={<MoreOutlined />} />
        </Dropdown>
        <div style={{ flex: 1 }} />
        <Button type='text' icon={<CheckSquareOutlined />} />
      </Toolbar>
      <div style={{ height: 'calc(100vh - 112px)', overflowY: 'auto' }}>
        {filteredEmails?.map((email) => (
          <EmailItem
            key={email.id}
            selected={false}
            onClick={() => handleEmailClick(email.id)}
          >
            <div
              style={{
                display: 'flex',
                alignItems: 'center',
                width: '100%',
              }}
            >
              <div
                style={{
                  display: 'flex',
                  alignItems: 'center',
                  minWidth: 40,
                }}
              >
                <Checkbox
                  style={{ marginRight: 8 }}
                  checked={checkedEmails.has(email.id)}
                  onChange={(e) => {
                    e.stopPropagation();
                    handleCheckboxChange(email.id, e.target.checked);
                  }}
                />
                <Button
                  type='text'
                  icon={
                    email.isStarred ? (
                      <StarFilled style={{ color: '#faad14' }} />
                    ) : (
                      <StarO />
                    )
                  }
                  style={{ marginRight: 8 }}
                  onClick={(e) => {
                    e.stopPropagation();
                    // Toggle star status
                  }}
                />
              </div>
              <EmailPreview>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <EmailSubject
                    style={{
                      fontWeight: email.isRead ? 'normal' : 'bold',
                    }}
                  >
                    {email.sender.split('<')[0].trim()}
                  </EmailSubject>
                  <EmailTime>{formatDate(email.timestamp)}</EmailTime>
                </div>
                <div
                  style={{
                    display: 'flex',
                    justifyContent: 'space-between',
                  }}
                >
                  <div>
                    <Text strong={!email.isRead} style={{ marginRight: 8 }}>
                      {email.subject}
                    </Text>
                    <Text type='secondary'>
                      {email.preview.length > 50
                        ? `${email.preview.substring(0, 50)}...`
                        : email.preview}
                    </Text>
                  </div>
                  {email.hasAttachment && (
                    <PaperClipOutlined style={{ color: '#8c8c8c' }} />
                  )}
                </div>
              </EmailPreview>
            </div>
          </EmailItem>
        ))}
      </div>
    </EmailList>
  );
};
