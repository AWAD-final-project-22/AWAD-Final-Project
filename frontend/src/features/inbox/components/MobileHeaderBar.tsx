'use client';

import {
  ArrowLeftOutlined,
  MenuFoldOutlined,
  MenuUnfoldOutlined,
  ReloadOutlined,
} from '@ant-design/icons';
import { Button } from 'antd';
import { MobileHeader } from '../styles/InboxPage.style';

export const MobileHeaderBar: React.FC<{
  collapsed: boolean;
  setCollapsed: (v: boolean) => void;
  showEmailList: boolean;
  handleBackToList: () => void;
}> = ({ collapsed, setCollapsed, showEmailList, handleBackToList }) => (
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
);
