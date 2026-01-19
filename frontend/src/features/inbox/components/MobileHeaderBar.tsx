'use client';

import {
  ArrowLeftOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Button, Tag } from 'antd';
import React from 'react';
import { MobileHeader } from '../styles/InboxPage.style';

interface MobileHeaderBarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  showEmailList: boolean;
  handleBackToList: () => void;
  isMobile: boolean;
  isOnline?: boolean;
}

export const MobileHeaderBar: React.FC<MobileHeaderBarProps> = ({
  collapsed,
  setCollapsed,
  showEmailList,
  handleBackToList,
  isMobile,
  isOnline = true,
}) => {
  if (!isMobile) return null;

  return (
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
      {!isOnline && <Tag color='red'>Offline</Tag>}
      {/* <Button icon={<ReloadOutlined />} type='text' /> */}
    </MobileHeader>
  );
};
