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
import { Button, Drawer, Menu } from 'antd';
import React from 'react';
import { IMailbox } from '../interfaces/mailAPI.interface';
import { DesktopSider, SidebarContent } from '../styles/InboxPage.style';
import { SearchWithSuggestions } from '@/features/search/components/SearchWithSuggestions';


interface SidebarProps {
  collapsed: boolean;
  setCollapsed: (value: boolean) => void;
  isMobile: boolean;
  selectedMailbox: string;
  setSelectedMailbox: (value: string) => void;
  mailboxes: IMailbox[];
  searchText: string;
  setSearchText: (value: string) => void;
  setOpenComposeModal?: (value: boolean) => void;
  handleSearch?: (query: string) => void;
}

export const Sidebar: React.FC<SidebarProps> = ({
  collapsed,
  setCollapsed,
  isMobile,
  selectedMailbox,
  setSelectedMailbox,
  mailboxes,
  searchText,
  setSearchText,
  setOpenComposeModal,
  handleSearch,
}) => {
  const items = mailboxes?.map((mailbox) => {
    let icon: React.ReactNode;
    switch (mailbox.name.toLowerCase()) {
      case 'inbox':
        icon = <InboxOutlined />;
        break;
      case 'starred':
        icon = <StarOutlined />;
        break;
      case 'sent':
        icon = <SendOutlined />;
        break;
      case 'drafts':
        icon = <FileOutlined />;
        break;
      case 'trash':
        icon = <DeleteOutlined />;
        break;
      default:
        icon = <FolderOutlined />;
    }
    return {
      key: mailbox.id,
      icon,
      label: mailbox.name,
    };
  });

  const sidebarContent = (
    <SidebarContent>
      <div style={{ padding: '16px', textAlign: 'center' }}>
        <Button
          type='primary'
          icon={<EditOutlined />}
          block
          style={{ marginBottom: '16px' }}
          onClick={() => setOpenComposeModal?.(true)}
        >
          {(!collapsed || isMobile) && 'Compose'}
        </Button>
        <SearchWithSuggestions
          placeholder='Search emails...'
          onSearch={handleSearch || setSearchText}
          value={searchText}
          onChange={setSearchText}
          onClear={() => setSearchText('')}
          style={{ marginBottom: '16px' }}
          allowClear
        />
      </div>
      <Menu
        mode='inline'
        selectedKeys={[selectedMailbox]}
        onClick={({ key }) => {
          setSelectedMailbox(key as string);
          if (isMobile) {
            setCollapsed(true);
          }
        }}
        items={items}
      />
    </SidebarContent>
  );

  if (isMobile) {
    return (
      <Drawer
        placement='left'
        open={!collapsed}
        onClose={() => setCollapsed(true)}
        width={250}
        styles={{
          body: { padding: 0 },
        }}
      >
        {sidebarContent}
      </Drawer>
    );
  }

  return (
    <DesktopSider
      width={250}
      collapsible
      collapsed={collapsed}
      onCollapse={setCollapsed}
      trigger={null}
      collapsedWidth={80}
    >
      {sidebarContent}
    </DesktopSider>
  );
};
