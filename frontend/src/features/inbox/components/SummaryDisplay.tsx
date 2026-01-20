import React from 'react';
import { Skeleton, Tooltip } from 'antd';
import {
  SummaryContainer,
  SummaryHeader,
  SummaryText,
  PreviewText,
} from '../styles/SummaryDisplay.style';

interface SummaryDisplayProps {
  summary?: string;
  preview?: string;
  isLoading?: boolean;
  showIcon?: boolean;
}

export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({
  summary,
  preview,
  isLoading = false,
  showIcon = true,
}) => {
  if (isLoading) {
    return (
      <SummaryContainer>
        <Skeleton active paragraph={{ rows: 2 }} />
      </SummaryContainer>
    );
  }

  const displayText = summary || preview || 'No summary available';

  return (
    <SummaryContainer>
      <SummaryHeader>
        {showIcon && <span>✨</span>}
        <span>{summary ? 'AI Summary' : 'Preview'}</span>
      </SummaryHeader>
      {summary ? (
        <Tooltip title={displayText}>
          <SummaryText>{displayText}</SummaryText>
        </Tooltip>
      ) : (
        <Tooltip title={displayText}>
          <PreviewText>{displayText}</PreviewText>
        </Tooltip>
      )}
    </SummaryContainer>
  );
};
