'use client';

import {
  DeleteOutlined,
  EditOutlined,
  FileOutlined,
  FolderOutlined,
  InboxOutlined,
  SendOutlined,
  StarOutlined,
} from '@ant-design/icons';
import { Button, Input, Menu } from 'antd';
import { IEmail, IMailbox } from '../interfaces/mailAPI.interface';
import { StyledSider } from '../styles/InboxPage.style';
import { valueType } from 'antd/es/statistic/utils';

const { Search } = Input;

export const Sidebar: React.FC<{
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  isMobile: boolean;
  selectedMailbox: string;
  setSelectedMailbox: (v: string) => void;
  mailboxes: IMailbox[];
  emails: IEmail[];
  searchText: string;
  setSearchText: (v: string) => void;
}> = ({
  collapsed,
  setCollapsed,
  isMobile,
  selectedMailbox,
  setSelectedMailbox,
  mailboxes,
  emails,
  searchText,
  setSearchText,
}) => (
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
        onSearch={setSearchText}
        value={searchText}
        onChange={(e) => setSearchText(e.target.value)}
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
);
