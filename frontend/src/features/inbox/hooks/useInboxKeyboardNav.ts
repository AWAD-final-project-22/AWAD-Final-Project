'use client';

import { useEffect } from 'react';
import { isEditableElement, focusSearchInput, scrollToDataEmail } from '@/helpers/keyboardNav.helper';
import { IEmail } from '../interfaces/mailAPI.interface';

interface InboxKeyboardNavOptions {
  emails: IEmail[];
  selectedEmailId?: string | null;
  onSelectEmail: (emailId: string) => void;
  isMobile: boolean;
  showEmailDetail: boolean;
  onBackToList?: () => void;
  searchInputId?: string;
  enabled?: boolean;
}

/**
 * Keyboard shortcuts (Inbox):
 * - /: focus search input
 * - ArrowUp/ArrowDown: move selection in list
 * - Enter: open selected email (or first email)
 * - Escape: on mobile, return to list view
 */
export const useInboxKeyboardNav = ({
  emails,
  selectedEmailId,
  onSelectEmail,
  isMobile,
  showEmailDetail,
  onBackToList,
  searchInputId = 'inbox-search-input',
  enabled = true,
}: InboxKeyboardNavOptions) => {
  useEffect(() => {
    if (!enabled) return;

    const handleKeyDown = (event: KeyboardEvent) => {
      if (event.defaultPrevented || event.metaKey || event.ctrlKey || event.altKey) {
        return;
      }
      if (isEditableElement(event.target)) return;

      const key = event.key.toLowerCase();

      if (key === '/') {
        event.preventDefault();
        focusSearchInput(searchInputId);
        return;
      }

      if (key === 'escape') {
        if (isMobile && showEmailDetail) {
          event.preventDefault();
          onBackToList?.();
        }
        return;
      }

      if (!emails || emails.length === 0) return;

      const currentIndex = selectedEmailId
        ? emails.findIndex((email) => email.id === selectedEmailId)
        : -1;

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const nextIndex =
          event.key === 'ArrowDown'
            ? currentIndex < 0
              ? 0
              : Math.min(currentIndex + 1, emails.length - 1)
            : currentIndex <= 0
              ? 0
              : currentIndex - 1;

        const nextEmail = emails[nextIndex];
        if (nextEmail) {
          onSelectEmail(nextEmail.id);
          scrollToDataEmail(nextEmail.id);
        }
        return;
      }

      if (key === 'enter') {
        event.preventDefault();
        if (currentIndex < 0) {
          const firstEmail = emails[0];
          if (firstEmail) {
            onSelectEmail(firstEmail.id);
            scrollToDataEmail(firstEmail.id);
          }
          return;
        }

        const currentEmail = emails[currentIndex];
        if (currentEmail) {
          if (isMobile && !showEmailDetail) {
            onSelectEmail(currentEmail.id);
          }
          scrollToDataEmail(currentEmail.id);
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [
    emails,
    selectedEmailId,
    onSelectEmail,
    isMobile,
    showEmailDetail,
    onBackToList,
    searchInputId,
    enabled,
  ]);
};
