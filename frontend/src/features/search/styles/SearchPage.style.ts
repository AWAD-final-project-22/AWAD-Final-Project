import styled from 'styled-components';

// Container for search results - similar to BoardContainer but vertical
export const SearchResultsContainer = styled.div`
  padding: 24px;
  height: calc(100vh - 73px);
  overflow-y: auto;
  background: #f5f7fa;

  &::-webkit-scrollbar {
    width: 8px;
  }

  &::-webkit-scrollbar-thumb {
    background-color: rgba(0, 0, 0, 0.2);
    border-radius: 4px;
  }
`;

export const ResultsGrid = styled.div`
  display: flex;
  flex-direction: column;
  gap: 16px;
  max-width: 900px;
  margin: 0 auto;
`;

export const SearchHeaderInfo = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  margin-bottom: 16px;
  padding: 16px;
  background: #fff;
  border-radius: 12px;
  box-shadow: 0 2px 8px rgba(0, 0, 0, 0.06);
`;

export const SearchHeaderTitle = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
`;

export const SearchTitle = styled.h3`
  margin: 0;
  font-size: 18px;
  font-weight: 600;
  color: #1a1a2e;
  display: flex;
  align-items: center;
  gap: 8px;
`;

export const SearchCount = styled.span`
  font-size: 13px;
  color: #8c8c8c;
`;
