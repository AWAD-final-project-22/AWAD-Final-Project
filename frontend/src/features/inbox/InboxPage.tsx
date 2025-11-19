'use client';

import {
  ArrowLeftOutlined,
  CheckOutlined,
  CheckSquareOutlined,
  DeleteOutlined,
  DownloadOutlined,
  EditOutlined,
  FileOutlined,
  FolderOutlined,
  ForwardOutlined,
  InboxOutlined,
  MailOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  MoreOutlined,
  PaperClipOutlined,
  ReloadOutlined,
  SendOutlined,
  StarFilled,
  StarOutlined as StarO,
  StarOutlined,
} from '@ant-design/icons';
import {
  Button,
  Card,
  Checkbox,
  Divider,
  Dropdown,
  Input,
  Layout,
  Menu,
  Typography,
} from 'antd';
import React, { useState } from 'react';
import {
  DivEmailList,
  EmailDetail,
  EmailItem,
  EmailList,
  EmailPreview,
  EmailSubject,
  EmailTime,
  MobileHeader,
  StyledLayout,
  StyledSider,
  Toolbar,
} from './styles/InboxPage.style';
import { useInbox } from './hooks/useInbox';
import { useWindowSize } from '@/hooks/useWindowSize';
import { breakpoints } from '@/themes/breakpoint';

const { Text, Title } = Typography;
const { Search } = Input;

const InboxPage: React.FC = () => {
  const [checkedEmails, setCheckedEmails] = useState<Set<string>>(new Set());
  const [collapsed, setCollapsed] = useState(false);
  const [selectedMailbox, setSelectedMailbox] = useState('inbox');
  const [selectedEmail, setSelectedEmail] = useState<string | null>(null);
  const [searchText, setSearchText] = useState('');
  const [showEmailList, setShowEmailList] = useState(true);
  const [showEmailDetail, setShowEmailDetail] = useState(false);
  const windowSize = useWindowSize();
  const isMobile = windowSize.width <= Number(breakpoints.md);

  const { mailboxes, emails } = useInbox({
    mailBoxID: selectedMailbox,
    mailID: selectedEmail || '',
  });

  const handleCheckboxChange = (emailId: string, checked: boolean) => {
    const newCheckedEmails = new Set(checkedEmails);
    if (checked) {
      newCheckedEmails.add(emailId);
    } else {
      newCheckedEmails.delete(emailId);
    }
    setCheckedEmails(newCheckedEmails);
  };

  const handleSelectAll = (checked: boolean) => {
    if (checked) {
      setCheckedEmails(new Set(filteredEmails?.map((email) => email.id)));
    } else {
      setCheckedEmails(new Set());
    }
  };

  const filteredEmails = emails?.filter(
    (email) =>
      email.mailboxId === selectedMailbox &&
      (email.subject.toLowerCase().includes(searchText.toLowerCase()) ||
        email.sender.toLowerCase().includes(searchText.toLowerCase()) ||
        email.preview.toLowerCase().includes(searchText.toLowerCase())),
  );

  const selectedEmailData = emails?.find((email) => email.id === selectedEmail);

  const handleEmailClick = (emailId: string) => {
    setSelectedEmail(emailId);
    if (isMobile) {
      setShowEmailList(false);
      setShowEmailDetail(true);
    }
  };

  const handleBackToList = () => {
    setShowEmailList(true);
    setShowEmailDetail(false);
  };

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

  return (
    <StyledLayout>
      <StyledSider
        key='main-sider'
        width={250}
        collapsible
        collapsed={collapsed}
        onCollapse={setCollapsed}
        trigger={null}
        collapsedWidth={isMobile ? 0 : 80}
      >
        <div style={{ padding: '16px', textAlign: 'center' }}>
          <Button
            type='primary'
            icon={<EditOutlined />}
            block
            style={{ marginBottom: '16px' }}
          >
            {!collapsed && 'Compose'}
          </Button>
          <Search
            placeholder='Search...'
            onSearch={(value) => setSearchText(value)}
            style={{ marginBottom: '16px' }}
            allowClear
          />
        </div>
        <Menu
          mode='inline'
          selectedKeys={[selectedMailbox]}
          onClick={({ key }) => setSelectedMailbox(key as string)}
        >
          <Menu.Item key='inbox' icon={<InboxOutlined />}>
            Inbox <span style={{ float: 'right' }}>{emails?.length}</span>
          </Menu.Item>
          <Menu.Item key='starred' icon={<StarOutlined />}>
            Starred
          </Menu.Item>
          <Menu.Item key='sent' icon={<SendOutlined />}>
            Sent
          </Menu.Item>
          <Menu.Item key='drafts' icon={<FileOutlined />}>
            Drafts
          </Menu.Item>
          <Menu.Item key='archive' icon={<FolderOutlined />}>
            Archive
          </Menu.Item>
          <Menu.Item key='trash' icon={<DeleteOutlined />}>
            Trash
          </Menu.Item>
          <Menu.Divider />
          <Menu.ItemGroup title='Folders'>
            {mailboxes?.slice(6).map((mailbox) => (
              <Menu.Item key={mailbox.id} icon={<FolderOutlined />}>
                {mailbox.name}
              </Menu.Item>
            ))}
          </Menu.ItemGroup>
        </Menu>
      </StyledSider>

      <Layout>
        <MobileHeader>
          <Button
            icon={collapsed ? <MenuUnfoldOutlined /> : <MenuFoldOutlined />}
            onClick={() => setCollapsed(!collapsed)}
            type='text'
          />
          {!showEmailList && (
            <Button
              icon={<ArrowLeftOutlined />}
              onClick={handleBackToList}
              type='text'
            >
              Back
            </Button>
          )}
          <div style={{ flex: 1 }}></div>
          <Button icon={<ReloadOutlined />} type='text' />
        </MobileHeader>

        <DivEmailList>
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
                  selected={selectedEmail === email.id}
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
                          <Text
                            strong={!email.isRead}
                            style={{ marginRight: 8 }}
                          >
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

          <EmailDetail show={!isMobile || showEmailDetail}>
            {selectedEmailData ? (
              <Card
                title={
                  <div>
                    <Title level={4} style={{ marginBottom: 0 }}>
                      {selectedEmailData.subject}
                    </Title>
                    <div
                      style={{
                        display: 'flex',
                        justifyContent: 'space-between',
                        marginTop: 8,
                      }}
                    >
                      <Text type='secondary'>
                        Từ: {selectedEmailData.sender}
                      </Text>
                      <div>
                        <Text type='secondary' style={{ marginRight: 16 }}>
                          {new Date(
                            selectedEmailData.timestamp,
                          ).toLocaleString()}
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
                    This is a sample email content. You can view the details of
                    the email here.
                  </p>
                  <p>Best regards,</p>
                  <p>Sender</p>
                </div>
                {selectedEmailData.hasAttachment && (
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
            )}
          </EmailDetail>
        </DivEmailList>
      </Layout>
    </StyledLayout>
  );
};

export default InboxPage;
