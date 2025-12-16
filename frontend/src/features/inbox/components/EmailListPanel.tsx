'use client';
import { Button, Checkbox, Pagination, Tooltip, Typography } from 'antd';
import { IEmail, IEmailResponse } from '../interfaces/mailAPI.interface';
import { UrgencyBadge } from './UrgencyBadge';
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
import { EmptyState } from '@/components/EmptyState';
import { LoadingSpin } from '@/components/LoadingSpin';
import { ViewToggle } from '@/components/ViewToggle';
const { Text } = Typography;

interface EmailListPanelProps {
  showEmailList: boolean;
  checkedEmails: Set<string>;
  handleSelectAll: (checked: boolean) => void;
  emails?: IEmailResponse;
  filteredEmails: IEmail[];
  isEmailsLoading: boolean;
  handleCheckboxChange: (id: string, checked: boolean) => void;
  handleEmailClick: (id: string) => void;
  isMobile?: boolean;
  selectedEmail: IEmail | undefined;
  handlePageChange: (page: number) => void;
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
  isEmailsLoading = false,
  handlePageChange,
  emails,
}) => {
  const renderEmailList = () => {
    if (!filteredEmails) {
      return <EmptyState message='No emails to display' />;
    }
    if (isEmailsLoading) {
      return <LoadingSpin />;
    }
    return (
      <>
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
                      alignItems: 'center',
                      gap: '8px',
                    }}
                  >
                    <div style={{ flex: 1 }}>
                      <div style={{ marginBottom: '4px' }}>
                        <Text strong={!email.isRead} style={{ marginRight: 8 }}>
                          {email.subject}
                        </Text>
                      </div>
                      <div style={{ display: 'flex', alignItems: 'center', gap: '8px' }}>
                        {email.urgencyScore !== undefined && (
                          <UrgencyBadge urgencyScore={email.urgencyScore} showLabel={false} />
                        )}
                        <Text type='secondary'>
                          {email.aiSummary
                            ? email.aiSummary.length > 80
                              ? `✨ ${email.aiSummary.substring(0, 80)}...`
                              : `✨ ${email.aiSummary}`
                            : email.preview.length > 80
                            ? `${email.preview.substring(0, 80)}...`
                            : email.preview}
                        </Text>
                      </div>
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
          total={emails?.total || 0}
          pageSize={20}
          showSizeChanger={false}
          style={{ padding: '8px', textAlign: 'center' }}
          onChange={(e) => handlePageChange(e)}
        />
      </>
    );
  };

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
        <ViewToggle currentView='list' />
      </Toolbar>
      {renderEmailList()}
    </EmailList>
  );
};
