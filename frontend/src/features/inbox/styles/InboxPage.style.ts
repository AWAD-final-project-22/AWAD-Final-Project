import { Layout } from 'antd';
import styled from 'styled-components';
import {
  EmailDetailProps,
  EmailItemProps,
  StyledSiderProps,
} from '../interfaces/mail.interface';

const { Sider } = Layout;

export const StyledLayout = styled(Layout)`
  height: 100vh;
`;

export const StyledSider = styled(Sider)<StyledSiderProps>`
  background: #fff;
  border-right: 1px solid #f0f0f0;
  @media (max-width: 768px) {
    display: ${({ collapsed }) => (collapsed ? 'none' : 'block')};
    position: absolute;
    z-index: 10;
    height: 100%;
  }
`;

interface EmailListProps {
  show: boolean;
}

export const EmailList = styled.div<EmailListProps>`
  flex: 1;

  overflow-y: none;
  border-right: 1px solid #f0f0f0;
  @media (max-width: 992px) {
    display: ${({ show }) => (show ? 'block' : 'none')};
    width: 100%;
  }
`;

export const DivEmailList = styled.div`
  overflow-y: auto;
  height: calc(100% - 56px);
  display: flex;
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

export const EmailDetail = styled.div<EmailDetailProps>`
  flex: 1;
  overflow-y: none;
  padding: 24px;
  @media (max-width: 992px) {
    display: ${({ show }) => (show ? 'block' : 'none')};
    width: 100%;
  }
`;

export const EmailItem = styled.div<EmailItemProps>`
  padding: 12px 16px;
  border-bottom: 1px solid #f0f0f0;
  cursor: pointer;
  display: flex;
  align-items: center;
  background: ${({ selected }) => (selected ? '#e6f7ff' : 'white')};
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
  display: none;
  padding: 12px 16px;
  background: #fff;
  border-bottom: 1px solid #f0f0f0;
  @media (max-width: 992px) {
    display: flex;
    justify-content: space-between;
    align-items: center;
  }
`;
