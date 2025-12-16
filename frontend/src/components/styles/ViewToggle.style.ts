import styled from 'styled-components';

export const ToggleWrapper = styled.div`
  .ant-segmented {
    background: #f0f2f5;
    padding: 4px;
    border-radius: 8px;
  }

  .ant-segmented-item {
    border-radius: 6px;
    min-width: 100px;
    transition: all 0.3s ease;
  }

  .ant-segmented-item-selected {
    background: linear-gradient(135deg, #667eea 0%, #764ba2 100%);
    color: #fff;
    box-shadow: 0 2px 8px rgba(102, 126, 234, 0.3);
  }

  .ant-segmented-item-label {
    display: flex;
    align-items: center;
    justify-content: center;
    gap: 6px;
    padding: 6px 12px;
    font-weight: 500;
  }
`;
