export const isEditableElement = (target: EventTarget | null): boolean => {
  if (!(target instanceof HTMLElement)) return false;
  const tagName = target.tagName;
  return tagName === 'INPUT' || tagName === 'TEXTAREA' || target.isContentEditable;
};

export const focusSearchInput = (inputId: string) => {
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

export const scrollToDataEmail = (emailId: string) => {
  const element = document.querySelector<HTMLElement>(
    `[data-email-id="${emailId}"]`,
  );
  element?.scrollIntoView({ block: 'nearest' });
};
