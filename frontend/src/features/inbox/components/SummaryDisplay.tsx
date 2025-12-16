import React from 'react';
import { Skeleton } from 'antd';
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
  maxLength?: number;
  showIcon?: boolean;
}

export const SummaryDisplay: React.FC<SummaryDisplayProps> = ({
  summary,
  preview,
  isLoading = false,
  maxLength = 150,
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
  const truncatedText =
    displayText.length > maxLength
      ? `${displayText.substring(0, maxLength)}...`
      : displayText;

  return (
    <SummaryContainer>
      <SummaryHeader>
        {showIcon && <span>✨</span>}
        <span>{summary ? 'AI Summary' : 'Preview'}</span>
      </SummaryHeader>
      {summary ? (
        <SummaryText>{truncatedText}</SummaryText>
      ) : (
        <PreviewText>{truncatedText}</PreviewText>
      )}
    </SummaryContainer>
  );
};
