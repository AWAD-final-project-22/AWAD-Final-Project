'use client';
import { Button, Checkbox, Pagination, Tooltip, Typography } from 'antd';
import { IEmail } from '../interfaces/mailAPI.interface';
import {
  DivEmailList,
  EmailItem,
  EmailList,
  EmailPreview,
  EmailSubject,
  EmailTime,
  Toolbar,
} from '../styles/InboxPage.style';

import {
  DeleteOutlined,
  MailOutlined,
  PaperClipOutlined,
  ReloadOutlined,
  StarFilled,
  StarOutlined as StarO,
} from '@ant-design/icons';
import { formatDate } from '@/helpers/day.helper';
const { Text } = Typography;

interface EmailListPanelProps {
  showEmailList: boolean;
  checkedEmails: Set<string>;
  handleSelectAll: (checked: boolean) => void;
  filteredEmails: IEmail[];
  handleCheckboxChange: (id: string, checked: boolean) => void;
  handleEmailClick: (id: string) => void;
  isMobile?: boolean;
  selectedEmail: IEmail | undefined;
}

export const EmailListPanel: React.FC<EmailListPanelProps> = ({
  showEmailList,
  checkedEmails,
  handleSelectAll,
  filteredEmails,
  handleCheckboxChange,
  handleEmailClick,
  isMobile = false,
  selectedEmail,
}) => {
  return (
    <EmailList $show={showEmailList}>
      <Toolbar>
        <Tooltip title='Select all'>
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
        </Tooltip>
        <Tooltip title='Refresh'>
          <Button type='text' icon={<ReloadOutlined />} />
        </Tooltip>
        <Tooltip title='Delete selected'>
          <Button type='text' icon={<DeleteOutlined />} />
        </Tooltip>
        <Tooltip title='Mark as read'>
          <Button type='text' icon={<MailOutlined />} />
        </Tooltip>
        <div style={{ flex: 1 }} />
      </Toolbar>
      <DivEmailList $isMobile={isMobile}>
        {filteredEmails?.map((email) => (
          <EmailItem
            key={email.id}
            $selected={selectedEmail?.id === email.id}
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
                <Tooltip title={email.isStarred ? 'Unstar' : 'Star'}>
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
                </Tooltip>
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
      </DivEmailList>

      <Pagination
        size='small'
        total={filteredEmails?.length || 0}
        pageSize={20}
        showSizeChanger={false}
        style={{ padding: '8px', textAlign: 'center' }}
      />
    </EmailList>
  );
};
