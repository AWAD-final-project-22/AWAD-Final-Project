import { KanbanStatus, IKanbanColumn, ISnoozeOption } from '../interfaces/kanban.interface';

export const KANBAN_COLUMNS: IKanbanColumn[] = [
    { id: 'INBOX', title: 'INBOX', emails: [] },
    { id: 'TODO', title: 'TO DO', emails: [] },
    { id: 'DONE', title: 'DONE', emails: [] },
];

export const KANBAN_COLUMN_ORDER: KanbanStatus[] = ['INBOX', 'TODO', 'DONE'];

export const SNOOZED_COLUMN_ID: KanbanStatus = 'SNOOZED';

export const KANBAN_LOCAL_STORAGE_KEY = 'kanban_email_states';

// Helper to create snooze options based on current time
export const getSnoozeOptions = (): ISnoozeOption[] => {
    const now = new Date();

    // Tomorrow 9 AM
    const tomorrow9am = new Date(now);
    tomorrow9am.setDate(tomorrow9am.getDate() + 1);
    tomorrow9am.setHours(9, 0, 0, 0);

    // Later today (3 hours from now)
    const laterToday = new Date(now);
    laterToday.setHours(laterToday.getHours() + 3);

    // Next week Monday 9 AM
    const nextMonday = new Date(now);
    const daysUntilMonday = (8 - nextMonday.getDay()) % 7 || 7;
    nextMonday.setDate(nextMonday.getDate() + daysUntilMonday);
    nextMonday.setHours(9, 0, 0, 0);

    // Next month 1st 9 AM
    const nextMonth = new Date(now);
    nextMonth.setMonth(nextMonth.getMonth() + 1);
    nextMonth.setDate(1);
    nextMonth.setHours(9, 0, 0, 0);

    return [
        { label: 'Later today', value: laterToday },
        { label: 'Tomorrow 9 AM', value: tomorrow9am },
        { label: 'Next week', value: nextMonday },
        { label: 'Next month', value: nextMonth },
    ];
};
