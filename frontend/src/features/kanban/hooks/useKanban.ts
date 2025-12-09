'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { App } from 'antd';
import { DropResult } from '@hello-pangea/dnd';
import { useGetEmailsByMailBoxId } from '@/features/inbox/hooks/mailAPIs';
import { IEmail } from '@/features/inbox/interfaces/mailAPI.interface';
import {
    IKanbanEmail,
    IKanbanState,
    KanbanStatus,
} from '../interfaces/kanban.interface';
import {
    KANBAN_COLUMN_ORDER,
    KANBAN_LOCAL_STORAGE_KEY,
    SNOOZED_COLUMN_ID,
} from '../constants/kanban.constant';
import { LIMIT_DEFAULT } from '@/constants/common.constant';

interface UseKanbanProps {
    mailboxId?: string;
}

const DEFAULT_STATE: IKanbanState = {
    columns: {
        INBOX: [],
        TODO: [],
        IN_PROGRESS: [],
        DONE: [],
        SNOOZED: [],
    },
    emailStates: {},
};

export const useKanban = ({ mailboxId = 'INBOX' }: UseKanbanProps = {}) => {
    const { notification } = App.useApp();
    const [kanbanState, setKanbanState] = useState<IKanbanState>(DEFAULT_STATE);
    const [snoozeModalOpen, setSnoozeModalOpen] = useState(false);
    const [selectedEmailForSnooze, setSelectedEmailForSnooze] = useState<string | null>(null);

    // Fetch emails from inbox
    const { data: emailsData, isLoading: isEmailsLoading, refetch } = useGetEmailsByMailBoxId(
        { page: 1, limit: Number(LIMIT_DEFAULT) * 5 }, // Get more emails for kanban view
        mailboxId
    );

    // Load saved states from localStorage
    useEffect(() => {
        if (typeof window !== 'undefined') {
            const savedStates = localStorage.getItem(KANBAN_LOCAL_STORAGE_KEY);
            if (savedStates) {
                try {
                    const parsed = JSON.parse(savedStates);
                    setKanbanState((prev) => ({
                        ...prev,
                        emailStates: parsed,
                    }));
                } catch (e) {
                    console.error('Failed to parse kanban states from localStorage:', e);
                }
            }
        }
    }, []);

    // Save states to localStorage whenever they change
    const saveStatesToLocalStorage = useCallback((states: IKanbanState['emailStates']) => {
        if (typeof window !== 'undefined') {
            localStorage.setItem(KANBAN_LOCAL_STORAGE_KEY, JSON.stringify(states));
        }
    }, []);

    // Check and restore snoozed emails
    const checkAndRestoreSnoozedEmails = useCallback(() => {
        const now = new Date();
        let hasChanges = false;

        setKanbanState((prev) => {
            const newEmailStates = { ...prev.emailStates };

            Object.entries(newEmailStates).forEach(([emailId, state]) => {
                if (state.status === 'SNOOZED' && state.snoozedUntil) {
                    const snoozedUntil = new Date(state.snoozedUntil);
                    if (snoozedUntil <= now) {
                        // Restore to original status or INBOX
                        newEmailStates[emailId] = {
                            ...state,
                            status: state.originalStatus || 'INBOX',
                            snoozedUntil: null,
                            originalStatus: null,
                        };
                        hasChanges = true;
                    }
                }
            });

            if (hasChanges) {
                saveStatesToLocalStorage(newEmailStates);
                notification.info({
                    message: 'Email Restored',
                    description: 'A snoozed email has been restored to your inbox.',
                });
                return { ...prev, emailStates: newEmailStates };
            }
            return prev;
        });
    }, [notification, saveStatesToLocalStorage]);

    // Set up interval to check for expired snoozes
    useEffect(() => {
        const interval = setInterval(checkAndRestoreSnoozedEmails, 30000); // Check every 30 seconds
        return () => clearInterval(interval);
    }, [checkAndRestoreSnoozedEmails]);

    // Transform emails to kanban format and group by columns
    const groupedEmails = useMemo(() => {
        const result: Record<KanbanStatus, IKanbanEmail[]> = {
            INBOX: [],
            TODO: [],
            IN_PROGRESS: [],
            DONE: [],
            SNOOZED: [],
        };

        if (!emailsData?.emails) return result;

        emailsData.emails.forEach((email: IEmail) => {
            const savedState = kanbanState.emailStates[email.id];
            const status: KanbanStatus = savedState?.status || 'INBOX';
            const snoozedUntil = savedState?.snoozedUntil || null;
            const originalStatus = savedState?.originalStatus || null;

            const kanbanEmail: IKanbanEmail = {
                ...email,
                status,
                snoozedUntil,
                originalStatus,
            };

            if (result[status]) {
                result[status].push(kanbanEmail);
            } else {
                result.INBOX.push(kanbanEmail);
            }
        });

        return result;
    }, [emailsData, kanbanState.emailStates]);

    // Handle drag and drop
    const handleDragEnd = useCallback(
        (result: DropResult) => {
            const { destination, source, draggableId } = result;

            // Dropped outside a droppable area
            if (!destination) return;

            // Dropped in the same position
            if (
                destination.droppableId === source.droppableId &&
                destination.index === source.index
            ) {
                return;
            }

            const newStatus = destination.droppableId as KanbanStatus;
            const emailId = draggableId;

            setKanbanState((prev) => {
                const newEmailStates = {
                    ...prev.emailStates,
                    [emailId]: {
                        status: newStatus,
                        snoozedUntil: null,
                        originalStatus: null,
                    },
                };

                saveStatesToLocalStorage(newEmailStates);

                return {
                    ...prev,
                    emailStates: newEmailStates,
                };
            });

            notification.success({
                message: 'Email Moved',
                description: `Email moved to ${newStatus.replace('_', ' ')}`,
                duration: 2,
            });
        },
        [notification, saveStatesToLocalStorage]
    );

    // Handle snooze
    const handleSnooze = useCallback(
        (emailId: string, snoozedUntil: Date) => {
            const currentState = kanbanState.emailStates[emailId];
            const originalStatus = currentState?.status || 'INBOX';

            setKanbanState((prev) => {
                const newEmailStates = {
                    ...prev.emailStates,
                    [emailId]: {
                        status: 'SNOOZED' as KanbanStatus,
                        snoozedUntil: snoozedUntil.toISOString(),
                        originalStatus: originalStatus as KanbanStatus,
                    },
                };

                saveStatesToLocalStorage(newEmailStates);

                return {
                    ...prev,
                    emailStates: newEmailStates,
                };
            });

            setSnoozeModalOpen(false);
            setSelectedEmailForSnooze(null);

            notification.success({
                message: 'Email Snoozed',
                description: `Email will reappear on ${snoozedUntil.toLocaleString()}`,
            });
        },
        [kanbanState.emailStates, notification, saveStatesToLocalStorage]
    );

    // Handle unsnooze
    const handleUnsnooze = useCallback(
        (emailId: string) => {
            const currentState = kanbanState.emailStates[emailId];
            const originalStatus = currentState?.originalStatus || 'INBOX';

            setKanbanState((prev) => {
                const newEmailStates = {
                    ...prev.emailStates,
                    [emailId]: {
                        status: originalStatus,
                        snoozedUntil: null,
                        originalStatus: null,
                    },
                };

                saveStatesToLocalStorage(newEmailStates);

                return {
                    ...prev,
                    emailStates: newEmailStates,
                };
            });

            notification.success({
                message: 'Email Unsnoozed',
                description: 'Email has been restored to its original column.',
            });
        },
        [kanbanState.emailStates, notification, saveStatesToLocalStorage]
    );

    // Open snooze modal
    const openSnoozeModal = useCallback((emailId: string) => {
        setSelectedEmailForSnooze(emailId);
        setSnoozeModalOpen(true);
    }, []);

    // Close snooze modal
    const closeSnoozeModal = useCallback(() => {
        setSnoozeModalOpen(false);
        setSelectedEmailForSnooze(null);
    }, []);

    // Get columns to display (excluding IN_PROGRESS for now)
    const columns = useMemo(() => {
        return KANBAN_COLUMN_ORDER.map((status) => ({
            id: status,
            title: status.replace('_', ' '),
            emails: groupedEmails[status] || [],
        }));
    }, [groupedEmails]);

    // Snoozed emails for separate display
    const snoozedEmails = useMemo(() => {
        return groupedEmails[SNOOZED_COLUMN_ID] || [];
    }, [groupedEmails]);

    return {
        columns,
        snoozedEmails,
        isEmailsLoading,
        handleDragEnd,
        handleSnooze,
        handleUnsnooze,
        openSnoozeModal,
        closeSnoozeModal,
        snoozeModalOpen,
        selectedEmailForSnooze,
        refetch,
    };
};
