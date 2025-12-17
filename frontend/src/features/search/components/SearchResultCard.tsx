'use client';

import React from 'react';
import { ExportOutlined, PaperClipOutlined } from '@ant-design/icons';
import { formatDate } from '@/helpers/day.helper';
import { ISearchResult } from '../interfaces/search.interface';
import { UrgencyBadge } from '@/features/inbox/components/UrgencyBadge';
import { SummaryDisplay } from '@/features/inbox/components/SummaryDisplay';
// Reuse styled-components from KanbanPage for consistency
import {
  CardContainer,
  CardHeader,
  SenderBadge,
  SenderAvatar,
  SenderName,
  CardTimestamp,
  CardSubject,
  CardActions,
  OpenMailLink,
} from '@/features/kanban/styles/KanbanPage.style';

interface SearchResultCardProps {
  result: ISearchResult;
}

// Reuse helper functions from KanbanCard
const getAvatarColor = (sender: string): string => {
  const colors = [
    '#667eea',
    '#f093fb',
    '#4facfe',
    '#43e97b',
    '#fa709a',
    '#fee140',
    '#30cfd0',
    '#a18cd1',
  ];
  let hash = 0;
  for (let i = 0; i < sender.length; i++) {
    hash = sender.charCodeAt(i) + ((hash << 5) - hash);
  }
  return colors[Math.abs(hash) % colors.length];
};

const getInitials = (sender: string): string => {
  const name = sender.split('<')[0].trim();
  const parts = name.split(' ').filter(Boolean);
  if (parts.length >= 2) {
    return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
  }
  return name.substring(0, 2).toUpperCase();
};

const getSenderName = (sender: string): string => {
  return sender.split('<')[0].trim() || sender;
};

export const SearchResultCard: React.FC<SearchResultCardProps> = ({
  result,
}) => {
  const senderName = getSenderName(result.from);
  const initials = getInitials(result.from);
  const avatarColor = getAvatarColor(result.from);

  return (
    <CardContainer>
      <CardHeader>
        <SenderBadge>
          <SenderAvatar $color={avatarColor}>{initials}</SenderAvatar>
          <SenderName>{senderName}</SenderName>
        </SenderBadge>
        <div style={{ display: 'flex', alignItems: 'center', gap: 8 }}>
          {result.hasAttachment && (
            <PaperClipOutlined style={{ color: '#8c8c8c' }} />
          )}
          <CardTimestamp>{formatDate(result.date)}</CardTimestamp>
        </div>
      </CardHeader>

      <CardSubject>{result.subject}</CardSubject>

      {result.urgencyScore !== undefined && (
        <div style={{ marginTop: '8px' }}>
          <UrgencyBadge urgencyScore={result.urgencyScore} showLabel={true} />
        </div>
      )}

      <SummaryDisplay
        summary={result.aiSummary}
        preview={result.snippet || ''}
        maxLength={120}
        showIcon={true}
      />

      <CardActions>
        <OpenMailLink
          href={`/inbox?emailId=${result.gmailMessageId}`}
          target='_blank'
          rel='noopener noreferrer'
        >
          View Email
          <ExportOutlined />
        </OpenMailLink>
      </CardActions>
    </CardContainer>
  );
};
