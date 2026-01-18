'use client';

import { useEffect } from 'react';
import { IEmail } from '../interfaces/mailAPI.interface';

const isEditableElement = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName;
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || target.isContentEditable;
};

const focusSearchInput = (inputId: string) => {
  const directInput = document.getElementById(inputId) as HTMLInputElement | null;
  if (directInput) {
    directInput.focus();
    return;
  }

  const fallbackInput = document.querySelector<HTMLInputElement>(
    `[data-search-input-id="${inputId}"] input`,
  );
  fallbackInput?.focus();
};

const scrollToEmail = (emailId: string) => {
  const element = document.querySelector<HTMLElement>(
    `[data-email-id="${emailId}"]`,
  );
  element?.scrollIntoView({ block: 'nearest' });
};

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
        let nextIndex = currentIndex;
        if (event.key === 'ArrowDown') {
          nextIndex = currentIndex < 0 ? 0 : Math.min(currentIndex + 1, emails.length - 1);
        } else {
          nextIndex = currentIndex <= 0 ? 0 : currentIndex - 1;
        }

        const nextEmail = emails[nextIndex];
        if (nextEmail) {
          onSelectEmail(nextEmail.id);
          scrollToEmail(nextEmail.id);
        }
        return;
      }

      if (key === 'enter') {
        event.preventDefault();
        const nextEmail = emails[currentIndex >= 0 ? currentIndex : 0];
        if (nextEmail) {
          onSelectEmail(nextEmail.id);
          scrollToEmail(nextEmail.id);
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
