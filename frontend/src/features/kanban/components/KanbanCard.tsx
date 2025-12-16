'use client';

import React from 'react';
import { ClockCircleOutlined, ExportOutlined } from '@ant-design/icons';
import { formatDate } from '@/helpers/day.helper';
import { IKanbanEmail } from '../interfaces/kanban.interface';
import { UrgencyBadge } from '@/features/inbox/components/UrgencyBadge';
import { SummaryDisplay } from '@/features/inbox/components/SummaryDisplay';
import {
    CardContainer,
    CardHeader,
    SenderBadge,
    SenderAvatar,
    SenderName,
    CardTimestamp,
    CardSubject,
    CardActions,
    ActionButton,
    OpenMailLink,
    SnoozeIndicator,
} from '../styles/KanbanPage.style';

interface KanbanCardProps {
    email: IKanbanEmail;
    isDragging?: boolean;
    onSnooze: () => void;
    onUnsnooze: () => void;
}

// Generate a consistent color based on sender name
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

// Extract initials from sender name
const getInitials = (sender: string): string => {
    const name = sender.split('<')[0].trim();
    const parts = name.split(' ').filter(Boolean);
    if (parts.length >= 2) {
        return `${parts[0][0]}${parts[1][0]}`.toUpperCase();
    }
    return name.substring(0, 2).toUpperCase();
};

// Extract clean sender name
const getSenderName = (sender: string): string => {
    return sender.split('<')[0].trim() || sender;
};

// Format snooze time remaining
const formatSnoozeTime = (snoozedUntil: string): string => {
    const target = new Date(snoozedUntil);
    const now = new Date();
    const diff = target.getTime() - now.getTime();

    if (diff <= 0) return 'Expiring...';

    const hours = Math.floor(diff / (1000 * 60 * 60));
    const days = Math.floor(hours / 24);

    if (days > 0) return `${days}d ${hours % 24}h`;
    if (hours > 0) return `${hours}h`;
    const minutes = Math.floor(diff / (1000 * 60));
    return `${minutes}m`;
};

export const KanbanCard: React.FC<KanbanCardProps> = ({
    email,
    isDragging = false,
    onSnooze,
    onUnsnooze,
}) => {
    const senderName = getSenderName(email.sender);
    const initials = getInitials(email.sender);
    const avatarColor = getAvatarColor(email.sender);

    return (
        <CardContainer $isDragging={isDragging}>
            <CardHeader>
                <SenderBadge>
                    <SenderAvatar $color={avatarColor}>{initials}</SenderAvatar>
                    <SenderName>{senderName}</SenderName>
                </SenderBadge>
                <CardTimestamp>{formatDate(email.timestamp)}</CardTimestamp>
            </CardHeader>

            <CardSubject>{email.subject}</CardSubject>

            {email.urgencyScore !== undefined && (
                <div style={{ marginTop: '8px' }}>
                    <UrgencyBadge urgencyScore={email.urgencyScore} showLabel={true} />
                </div>
            )}

            <SummaryDisplay
                summary={email.aiSummary}
                preview={email.preview}
                maxLength={120}
                showIcon={true}
            />

            {email.status === 'SNOOZED' && email.snoozedUntil && (
                <SnoozeIndicator>
                    <ClockCircleOutlined />
                    <span>Snoozed for {formatSnoozeTime(email.snoozedUntil)}</span>
                </SnoozeIndicator>
            )}

            <CardActions>
                {email.status === 'SNOOZED' ? (
                    <ActionButton onClick={onUnsnooze}>
                        <ClockCircleOutlined />
                        Unsnooze
                    </ActionButton>
                ) : (
                    <ActionButton onClick={onSnooze}>
                        <ClockCircleOutlined />
                        Snooze
                    </ActionButton>
                )}
                <OpenMailLink href={`/inbox?emailId=${email.id}`} target="_blank" rel="noopener noreferrer">
                    Open Mail
                    <ExportOutlined />
                </OpenMailLink>
            </CardActions>
        </CardContainer>
    );
};

