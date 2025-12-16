import styled from 'styled-components';

export const BadgeContainer = styled.div<{ $urgency: 'low' | 'medium' | 'high' }>`
  display: inline-flex;
  align-items: center;
  gap: 4px;
  padding: 2px 8px;
  border-radius: 12px;
  font-size: 11px;
  font-weight: 600;
  line-height: 1.4;
  
  background: ${({ $urgency }) => {
    switch ($urgency) {
      case 'high':
        return 'linear-gradient(135deg, #ff6b6b 0%, #ee5a6f 100%)';
      case 'medium':
        return 'linear-gradient(135deg, #ffd93d 0%, #ffb830 100%)';
      case 'low':
        return 'linear-gradient(135deg, #6bcf7f 0%, #4caf50 100%)';
    }
  }};
  
  color: #fff;
  box-shadow: 0 1px 3px rgba(0, 0, 0, 0.12);

  @media (max-width: 768px) {
    font-size: 10px;
    padding: 2px 6px;
  }
`;

export const UrgencyDot = styled.span`
  width: 6px;
  height: 6px;
  border-radius: 50%;
  background: currentColor;
`;
