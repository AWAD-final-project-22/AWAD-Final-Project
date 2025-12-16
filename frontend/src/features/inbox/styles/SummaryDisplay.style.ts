import styled from 'styled-components';

export const SummaryContainer = styled.div`
  display: flex;
  flex-direction: column;
  gap: 4px;
  padding: 8px 12px;
  background: linear-gradient(135deg, rgba(103, 126, 234, 0.08) 0%, rgba(240, 147, 251, 0.08) 100%);
  border-left: 3px solid #667eea;
  border-radius: 6px;
  margin: 8px 0;

  @media (max-width: 768px) {
    padding: 6px 10px;
  }
`;

export const SummaryHeader = styled.div`
  display: flex;
  align-items: center;
  gap: 6px;
  font-size: 11px;
  font-weight: 600;
  color: #667eea;
  text-transform: uppercase;
  letter-spacing: 0.5px;

  @media (max-width: 768px) {
    font-size: 10px;
  }
`;

export const SummaryText = styled.div`
  font-size: 13px;
  line-height: 1.5;
  color: #4a5568;
  
  @media (max-width: 768px) {
    font-size: 12px;
  }
`;

export const PreviewText = styled(SummaryText)`
  font-style: italic;
  color: #718096;
`;
