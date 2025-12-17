export interface IKanbanEmail {
    id: string;
    threadId?: string;
    mailboxId: string;
    sender: string;
    subject: string;
    preview: string;
    timestamp: string;
    isRead?: boolean;
    isStarred?: boolean;
    hasAttachment?: boolean;
    status: KanbanStatus;
    snoozedUntil?: string | null;
    originalStatus?: KanbanStatus | null;
    aiSummary?: string;
    urgencyScore?: number;
}

export type KanbanStatus = 'INBOX' | 'TODO' | 'IN_PROGRESS' | 'DONE' | 'SNOOZED';

export interface IKanbanColumn {
    id: KanbanStatus;
    title: string;
    emails: IKanbanEmail[];
}

export interface ISnoozeOption {
    label: string;
    value: Date;
}

export interface IKanbanState {
    columns: Record<KanbanStatus, IKanbanEmail[]>;
    emailStates: Record<string, { status: KanbanStatus; snoozedUntil?: string | null; originalStatus?: KanbanStatus | null }>;
}

export interface IFilterOptions {
    showUnreadOnly: boolean;
    showAttachmentsOnly: boolean;
    senderFilter: string | null;
}

export type SortType = 'date-newest' | 'date-oldest' | 'sender-asc' | 'sender-desc';

export interface ISortOption {
    type: SortType;
    label: string;
}

export interface IKanbanFilterSortState {
    filters: IFilterOptions;
    sortBy: SortType;
}
