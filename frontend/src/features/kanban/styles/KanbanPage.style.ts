import { Layout } from 'antd';
import styled from 'styled-components';

const { Sider } = Layout;

export const KanbanLayout = styled(Layout)`
  height: 100vh;
  overflow: hidden !important;
  background: #f5f7fa;
`;

export const KanbanHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px 24px;
  background: #fff;
  border-bottom: 1px solid #e8e8e8;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

export const KanbanTitle = styled.h1`
  margin: 0;
  font-size: 20px;
  font-weight: 600;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  gap: 10px;
`;

export const KanbanSider = styled(Sider)`
  background: #fff;
  border-right: 1px solid #f0f0f0;
`;

export const BoardContainer = styled.div`
  display: flex;
  gap: 20px;
  padding: 24px;
  height: calc(100vh - 73px);
  overflow-x: auto;
  align-items: flex-start;

  &::-webkit-scrollbar {
    height: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
`;

export const ColumnContainer = styled.div<{ $isDraggingOver?: boolean }>`
  flex: 0 0 340px;
  background: ${({ $isDraggingOver }) => ($isDraggingOver ? '#e6f7ff' : '#f8f9fc')};
  border-radius: 12px;
  display: flex;
  flex-direction: column;
  max-height: 100%;
  transition: background-color 0.2s ease;
`;

export const ColumnHeader = styled.div<{ $status: string }>`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 16px;
  border-bottom: 1px solid #e8e8e8;
  background: ${({ $status }) => {
        switch ($status) {
            case 'INBOX':
                return 'linear-gradient(135deg, #667eea 0%, #764ba2 100%)';
            case 'TODO':
                return 'linear-gradient(135deg, #f093fb 0%, #f5576c 100%)';
            case 'DONE':
                return 'linear-gradient(135deg, #4facfe 0%, #00f2fe 100%)';
            case 'SNOOZED':
                return 'linear-gradient(135deg, #fa709a 0%, #fee140 100%)';
            default:
                return 'linear-gradient(135deg, #a8edea 0%, #fed6e3 100%)';
        }
    }};
  border-radius: 12px 12px 0 0;
`;

export const ColumnTitle = styled.h3`
  margin: 0;
  font-size: 14px;
  font-weight: 600;
  color: #fff;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const ColumnCount = styled.span`
  background: rgba(255, 255, 255, 0.3);
  color: #fff;
  padding: 2px 10px;
  border-radius: 12px;
  font-size: 12px;
  font-weight: 600;
`;

export const ColumnContent = styled.div`
  flex: 1;
  overflow-y: auto;
  padding: 12px;
  min-height: 200px;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 3px;
  }
`;

export const CardContainer = styled.div<{ $isDragging?: boolean }>`
  background: #fff;
  border-radius: 10px;
  padding: 16px;
  margin-bottom: 12px;
  box-shadow: ${({ $isDragging }) =>
        $isDragging
            ? '0 8px 24px rgba(0, 0, 0, 0.15)'
            : '0 2px 8px rgba(0, 0, 0, 0.06)'};
  cursor: grab;
  transition: all 0.2s ease;
  border: 1px solid ${({ $isDragging }) => ($isDragging ? '#1890ff' : '#f0f0f0')};

  &:hover {
    box-shadow: 0 4px 16px rgba(0, 0, 0, 0.1);
    transform: translateY(-2px);
  }

  &:active {
    cursor: grabbing;
  }
`;

export const CardHeader = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 8px;
`;

export const SenderBadge = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SenderAvatar = styled.div<{ $color?: string }>`
  width: 32px;
  height: 32px;
  border-radius: 50%;
  background: ${({ $color }) => $color || '#667eea'};
  display: flex;
  align-items: center;
  justify-content: center;
  color: #fff;
  font-weight: 600;
  font-size: 12px;
`;

export const SenderName = styled.span`
  font-size: 13px;
  font-weight: 500;
  color: #333;
  max-width: 180px;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

export const CardTimestamp = styled.span`
  font-size: 11px;
  color: #8c8c8c;
`;

export const CardSubject = styled.h4`
  margin: 0 0 8px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
  line-height: 1.4;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const CardPreview = styled.p`
  margin: 0 0 12px 0;
  font-size: 13px;
  color: #666;
  line-height: 1.5;
  display: -webkit-box;
  -webkit-line-clamp: 2;
  -webkit-box-orient: vertical;
  overflow: hidden;
`;

export const SummaryBox = styled.div`
  background: linear-gradient(135deg, #f8f9ff 0%, #f0f4ff 100%);
  border: 1px solid #e8ecff;
  border-radius: 8px;
  padding: 10px 12px;
  margin-bottom: 12px;
`;

export const SummaryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  margin-bottom: 6px;
  color: #667eea;
  font-size: 11px;
  font-weight: 600;
  text-transform: uppercase;
  letter-spacing: 0.5px;
`;

export const SummaryText = styled.p`
  margin: 0;
  font-size: 12px;
  color: #444;
  line-height: 1.5;
`;

export const CardActions = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding-top: 12px;
  border-top: 1px solid #f0f0f0;
`;

export const ActionButton = styled.button<{ $variant?: 'primary' | 'secondary' }>`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  border: none;
  border-radius: 6px;
  font-size: 12px;
  font-weight: 500;
  cursor: pointer;
  transition: all 0.2s ease;
  background: ${({ $variant }) =>
        $variant === 'primary' ? '#667eea' : 'transparent'};
  color: ${({ $variant }) =>
        $variant === 'primary' ? '#fff' : '#666'};

  &:hover {
    background: ${({ $variant }) =>
        $variant === 'primary' ? '#5a6fd6' : '#f5f5f5'};
  }
`;

export const OpenMailLink = styled.a`
  display: flex;
  align-items: center;
  gap: 4px;
  padding: 6px 12px;
  color: #667eea;
  text-decoration: none;
  font-size: 12px;
  font-weight: 500;
  border-radius: 6px;
  transition: all 0.2s ease;

  &:hover {
    background: #f0f4ff;
    color: #5a6fd6;
  }
`;

export const SnoozeIndicator = styled.div`
  display: flex;
  align-items: center;
  gap: 4px;
  background: #fff7e6;
  color: #fa8c16;
  padding: 4px 8px;
  border-radius: 4px;
  font-size: 11px;
  font-weight: 500;
`;

export const ViewToggle = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SearchInput = styled.div`
  flex: 1;
  max-width: 400px;
`;
