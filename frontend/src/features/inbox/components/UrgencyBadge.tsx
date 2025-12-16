import React from 'react';
import { BadgeContainer, UrgencyDot } from '../styles/UrgencyBadge.style';

interface UrgencyBadgeProps {
  urgencyScore?: number;
  showLabel?: boolean;
}

export const UrgencyBadge: React.FC<UrgencyBadgeProps> = ({
  urgencyScore = 0.5,
  showLabel = true,
}) => {
  const getUrgencyLevel = (score: number): 'low' | 'medium' | 'high' => {
    if (score >= 0.7) return 'high';
    if (score >= 0.4) return 'medium';
    return 'low';
  };

  const getUrgencyLabel = (level: 'low' | 'medium' | 'high'): string => {
    switch (level) {
      case 'high':
        return 'High Priority';
      case 'medium':
        return 'Medium';
      case 'low':
        return 'Low';
    }
  };

  const urgencyLevel = getUrgencyLevel(urgencyScore);

  return (
    <BadgeContainer $urgency={urgencyLevel}>
      <UrgencyDot />
      {showLabel && <span>{getUrgencyLabel(urgencyLevel)}</span>}
    </BadgeContainer>
  );
};
