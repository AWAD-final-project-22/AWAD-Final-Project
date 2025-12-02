'use client';

import {
  ArrowLeftOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import React from 'react';
import { MobileHeader } from '../styles/InboxPage.style';

interface MobileHeaderBarProps {
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  showEmailList: boolean;
  handleBackToList: () => void;
  isMobile: boolean;
}

export const MobileHeaderBar: React.FC<MobileHeaderBarProps> = ({
  collapsed,
  setCollapsed,
  showEmailList,
  handleBackToList,
  isMobile,
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
      {/* <Button icon={<ReloadOutlined />} type='text' /> */}
    </MobileHeader>
  );
};
