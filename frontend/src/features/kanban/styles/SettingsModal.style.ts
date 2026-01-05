import styled from 'styled-components';

export const SettingsContent = styled.div`
  padding: 8px 0;
`;

export const ColumnListContainer = styled.div`
  margin-bottom: 24px;
  max-height: 300px;
  overflow-y: auto;

  &::-webkit-scrollbar {
    width: 6px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.15);
    border-radius: 3px;
  }
`;

export const ColumnItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: 12px 16px;
  background: #f8f9fc;
  border-radius: 8px;
  margin-bottom: 8px;
  transition: all 0.2s ease;

  &:hover {
    background: #f0f2f5;
  }

  @media (max-width: 480px) {
    flex-direction: column;
    align-items: flex-start;
    gap: 12px;
  }
`;

export const ColumnInfo = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  flex: 1;
  min-width: 0;
`;

export const ColumnName = styled.span`
  font-size: 14px;
  font-weight: 500;
  color: #1a1a2e;
  word-break: break-word;
`;

export const ColumnLabel = styled.span`
  font-size: 12px;
  color: #8c8c8c;
`;

export const ColumnActions = styled.div`
  display: flex;
  gap: 8px;
  flex-shrink: 0;

  @media (max-width: 480px) {
    width: 100%;
    justify-content: flex-end;
  }
`;

export const FormSection = styled.div`
  background: #fafafa;
  border-radius: 8px;
  padding: 16px;
  margin-top: 16px;

  @media (max-width: 480px) {
    padding: 12px;
  }
`;

export const FormTitle = styled.h4`
  margin: 0 0 16px 0;
  font-size: 14px;
  font-weight: 600;
  color: #1a1a2e;
`;

export const EmptyState = styled.div`
  text-align: center;
  padding: 32px 16px;
  color: #8c8c8c;
`;

export const LoadingContainer = styled.div`
  display: flex;
  justify-content: center;
  align-items: center;
  padding: 40px 16px;
`;
