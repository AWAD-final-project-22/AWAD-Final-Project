'use client';

import { useEffect } from 'react';
import { IKanbanEmail } from '../interfaces/kanban.interface';

interface KanbanNavColumn {
  id: string;
  emails: IKanbanEmail[];
}

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

const scrollToCard = (emailId: string) => {
  const element = document.querySelector<HTMLElement>(
    `[data-email-id="${emailId}"]`,
  );
  element?.scrollIntoView({ block: 'nearest' });
};

const findPosition = (
  columns: KanbanNavColumn[],
  emailId: string | null,
) => {
  if (!emailId) return null;
  for (let colIndex = 0; colIndex < columns.length; colIndex += 1) {
    const rowIndex = columns[colIndex].emails.findIndex((e) => e.id === emailId);
    if (rowIndex >= 0) {
      return { colIndex, rowIndex };
    }
  }
  return null;
};

const findFirstEmail = (columns: KanbanNavColumn[]) => {
  for (let colIndex = 0; colIndex < columns.length; colIndex += 1) {
    if (columns[colIndex].emails.length > 0) {
      return { colIndex, rowIndex: 0 };
    }
  }
  return null;
};

interface KanbanKeyboardNavOptions {
  columns: KanbanNavColumn[];
  selectedCardId: string | null;
  onSelectCard: (emailId: string) => void;
  onOpenGmail: (emailId: string) => void;
  searchInputId?: string;
  enabled?: boolean;
}

export const useKanbanKeyboardNav = ({
  columns,
  selectedCardId,
  onSelectCard,
  onOpenGmail,
  searchInputId = 'kanban-search-input',
  enabled = true,
}: KanbanKeyboardNavOptions) => {
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

      if (!columns || columns.length === 0) return;

      const currentPosition = findPosition(columns, selectedCardId);

      if (event.key === 'ArrowDown' || event.key === 'ArrowUp') {
        event.preventDefault();
        const position = currentPosition || findFirstEmail(columns);
        if (!position) return;
        const { colIndex, rowIndex } = position;
        const columnEmails = columns[colIndex].emails;
        if (columnEmails.length === 0) return;

        const nextIndex =
          event.key === 'ArrowDown'
            ? Math.min(rowIndex + 1, columnEmails.length - 1)
            : Math.max(rowIndex - 1, 0);
        const nextEmail = columnEmails[nextIndex];
        if (nextEmail) {
          onSelectCard(nextEmail.id);
          scrollToCard(nextEmail.id);
        }
        return;
      }

      if (event.key === 'ArrowRight' || event.key === 'ArrowLeft') {
        event.preventDefault();
        const position = currentPosition || findFirstEmail(columns);
        if (!position) return;

        const direction = event.key === 'ArrowRight' ? 1 : -1;
        let nextColIndex = position.colIndex + direction;

        while (
          nextColIndex >= 0 &&
          nextColIndex < columns.length &&
          columns[nextColIndex].emails.length === 0
        ) {
          nextColIndex += direction;
        }

        if (nextColIndex < 0 || nextColIndex >= columns.length) return;

        const nextColumn = columns[nextColIndex].emails;
        if (nextColumn.length === 0) return;

        const nextRowIndex = Math.min(position.rowIndex, nextColumn.length - 1);
        const nextEmail = nextColumn[nextRowIndex];
        if (nextEmail) {
          onSelectCard(nextEmail.id);
          scrollToCard(nextEmail.id);
        }
        return;
      }

      if (key === 'enter') {
        event.preventDefault();
        if (currentPosition) {
          const email = columns[currentPosition.colIndex].emails[currentPosition.rowIndex];
          if (email) {
            onSelectCard(email.id);
            onOpenGmail(email.id);
            return;
          }
        }

        const firstPosition = findFirstEmail(columns);
        if (firstPosition) {
          const email = columns[firstPosition.colIndex].emails[firstPosition.rowIndex];
          if (email) {
            onSelectCard(email.id);
            onOpenGmail(email.id);
          }
        }
      }
    };

    window.addEventListener('keydown', handleKeyDown);
    return () => window.removeEventListener('keydown', handleKeyDown);
  }, [columns, selectedCardId, onSelectCard, onOpenGmail, searchInputId, enabled]);
};
