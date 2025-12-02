import { Layout } from 'antd';
import styled from 'styled-components';

const { Sider } = Layout;

export const StyledLayout = styled(Layout)`
  height: 100vh;
  overflow: hidden !important;
`;

export const DesktopSider = styled(Sider)`
  background: #fff;
  border-right: 1px solid #f0f0f0;
`;

export const SidebarContent = styled.div`
  height: 100%;
  display: flex;
  flex-direction: column;
  background: #fff;
`;

export const EmailList = styled.div<{ $show: boolean }>`
  flex: 1;
  overflow-y: none;
  border-right: 2px solid #d9d9d9;
  @media (max-width: 992px) {
    display: ${({ $show }) => ($show ? 'block' : 'none')};
    width: 100%;
  }
`;

export const DivEmail = styled.div<{ $isMobile?: boolean }>`
  overflow-y: auto;
  height: ${({ $isMobile }) => ($isMobile ? 'calc(100% - 56px)' : '100%')};
  display: flex;
`;

export const DivEmailList = styled.div<{ $isMobile?: boolean }>`
  height: ${({ $isMobile }) =>
    $isMobile ? 'calc(100vh - 160px)' : 'calc(100vh - 100px)'};
  overflow-y: auto;
  &::-webkit-scrollbar {
    display: block;
    width: 6px;
    height: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(198, 198, 200, 1);
    border-radius: 4px;
  }

  &::-webkit-scrollbar-track {
    background-color: rgba(242, 242, 242, 1);
  }
`;

export const EmailDetail = styled.div<{ $show: boolean }>`
  flex: 1;
  overflow-y: none;
  padding: 24px;
  @media (max-width: 992px) {
    display: ${({ $show }) => ($show ? 'block' : 'none')};
    width: 100%;
  }
`;

export const EmailItem = styled.div<{ $selected: boolean }>`
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  display: flex;
  align-items: center;
  background: ${({ $selected }) => ($selected ? '#e6f7ff' : 'white')};
  &:hover {
    background: #f5f5f5;
  }
`;

export const EmailPreview = styled.div`
  flex: 1;
  margin-left: 16px;
  overflow: hidden;
`;

export const EmailSubject = styled.div`
  font-weight: 500;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const EmailTime = styled.span`
  color: #8c8c8c;
  font-size: 12px;
`;

export const Toolbar = styled.div`
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  display: flex;
  gap: 8px;
  flex-wrap: wrap;
`;

export const MobileHeader = styled.div`
  display: flex;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  justify-content: space-between;
  align-items: center;
`;
