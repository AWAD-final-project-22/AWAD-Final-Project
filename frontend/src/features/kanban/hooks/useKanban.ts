'use client';

import { useCallback, useMemo, useState } from 'react';
import { App } from 'antd';
import { DropResult } from '@hello-pangea/dnd';
import { useGetEmailsByMailBoxId } from '@/features/inbox/hooks/mailAPIs';
import { IEmail } from '@/features/inbox/interfaces/mailAPI.interface';
import {
    IKanbanEmail,
    KanbanStatus,
} from '../interfaces/kanban.interface';
import {
    KANBAN_COLUMN_ORDER,
    SNOOZED_COLUMN_ID,
} from '../constants/kanban.constant';
import { LIMIT_DEFAULT } from '@/constants/common.constant';
import {
    useGetWorkflows,
    useMutationUpdateWorkflowStatus,
    useMutationSnoozeWorkflow,
} from '@/features/inbox/hooks/workflowAPIs';
import { WorkflowStatus } from '@/features/inbox/interfaces/workflow.interface';

interface UseKanbanProps {
    mailboxId?: string;
}

const mapKanbanToWorkflowStatus = (status: KanbanStatus): WorkflowStatus => {
    return status as unknown as WorkflowStatus;
};

const mapWorkflowToKanbanStatus = (status: WorkflowStatus): KanbanStatus => {
    return status as unknown as KanbanStatus;
};

export const useKanban = ({ mailboxId = 'INBOX' }: UseKanbanProps = {}) => {
    const { notification } = App.useApp();
    const [snoozeModalOpen, setSnoozeModalOpen] = useState(false);
    const [selectedEmailForSnooze, setSelectedEmailForSnooze] = useState<string | null>(null);

    const { data: emailsData, isLoading: isEmailsLoading, refetch: refetchEmails } = useGetEmailsByMailBoxId(
        { page: 1, limit: Number(LIMIT_DEFAULT) * 5 },
        mailboxId
    );

    const { data: inboxWorkflows, refetch: refetchInbox } = useGetWorkflows({
        status: WorkflowStatus.INBOX,
        limit: 100,
        offset: 0,
    });

    const { data: todoWorkflows, refetch: refetchTodo } = useGetWorkflows({
        status: WorkflowStatus.TODO,
        limit: 100,
        offset: 0,
    });

    const { data: doneWorkflows, refetch: refetchDone } = useGetWorkflows({
        status: WorkflowStatus.DONE,
        limit: 100,
        offset: 0,
    });

    const { data: snoozedWorkflows, refetch: refetchSnoozed } = useGetWorkflows({
        status: WorkflowStatus.SNOOZED,
        limit: 100,
        offset: 0,
    });

    const { mutateAsync: updateStatus } = useMutationUpdateWorkflowStatus({
        onSuccess: () => {
            refetchAllWorkflows();
        },
        onError: (error) => {
            notification.error({
                message: 'Failed to update status',
                description: error.message,
            });
        },
    });

    const { mutateAsync: snoozeWorkflow } = useMutationSnoozeWorkflow({
        onSuccess: () => {
            refetchAllWorkflows();
        },
        onError: (error) => {
            notification.error({
                message: 'Failed to snooze email',
                description: error.message,
            });
        },
    });

    const refetchAllWorkflows = useCallback(() => {
        refetchInbox();
        refetchTodo();
        refetchDone();
        refetchSnoozed();
        refetchEmails();
    }, [refetchInbox, refetchTodo, refetchDone, refetchSnoozed, refetchEmails]);

    const transformWorkflowToKanbanEmail = useCallback((workflow: any): IKanbanEmail => {
        const gmailEmail = emailsData?.emails?.find((e: IEmail) => e.id === workflow.gmailMessageId);

        return {
            id: workflow.gmailMessageId,
            mailboxId: 'INBOX',
            sender: workflow.from,
            subject: workflow.subject,
            preview: workflow.snippet || '',
            timestamp: workflow.date,
            status: mapWorkflowToKanbanStatus(workflow.status),
            snoozedUntil: workflow.snoozedUntil || null,
            originalStatus: null,
            aiSummary: workflow.aiSummary,
            urgencyScore: workflow.urgencyScore,
            isRead: gmailEmail?.isRead,
            isStarred: gmailEmail?.isStarred,
            hasAttachment: gmailEmail?.hasAttachment,
        };
    }, [emailsData]);

    const groupedEmails = useMemo(() => {
        const result: Record<KanbanStatus, IKanbanEmail[]> = {
            INBOX: [],
            TODO: [],
            IN_PROGRESS: [],
            DONE: [],
            SNOOZED: [],
        };

        if (inboxWorkflows?.data) {
            result.INBOX = inboxWorkflows.data.map(transformWorkflowToKanbanEmail);
        }

        if (todoWorkflows?.data) {
            result.TODO = todoWorkflows.data.map(transformWorkflowToKanbanEmail);
        }

        if (doneWorkflows?.data) {
            result.DONE = doneWorkflows.data.map(transformWorkflowToKanbanEmail);
        }

        if (snoozedWorkflows?.data) {
            result.SNOOZED = snoozedWorkflows.data.map(transformWorkflowToKanbanEmail);
        }

        return result;
    }, [inboxWorkflows, todoWorkflows, doneWorkflows, snoozedWorkflows, transformWorkflowToKanbanEmail]);

    // Handle drag and drop
    const handleDragEnd = useCallback(
        async (result: DropResult) => {
            const { destination, source, draggableId } = result;

            if (!destination) return;

            if (
                destination.droppableId === source.droppableId &&
                destination.index === source.index
            ) {
                return;
            }

            const newStatus = destination.droppableId as KanbanStatus;
            const emailId = draggableId;

            const allWorkflows = [
                ...(inboxWorkflows?.data || []),
                ...(todoWorkflows?.data || []),
                ...(doneWorkflows?.data || []),
                ...(snoozedWorkflows?.data || []),
            ];

            const workflow = allWorkflows.find((w) => w.gmailMessageId === emailId);

            if (!workflow) {
                notification.error({
                    message: 'Error',
                    description: 'Could not find workflow for this email',
                });
                return;
            }

            try {
                await updateStatus({
                    id: workflow.id,
                    status: mapKanbanToWorkflowStatus(newStatus),
                });

                notification.success({
                    message: 'Email Moved',
                    description: `Email moved to ${newStatus.replace('_', ' ')}`,
                    duration: 2,
                });
            } catch (error) {
                console.error('Failed to update status:', error);
            }
        },
        [inboxWorkflows, todoWorkflows, doneWorkflows, snoozedWorkflows, updateStatus, notification]
    );

    // Handle snooze
    const handleSnooze = useCallback(
        async (emailId: string, snoozedUntil: Date) => {
            const allWorkflows = [
                ...(inboxWorkflows?.data || []),
                ...(todoWorkflows?.data || []),
                ...(doneWorkflows?.data || []),
                ...(snoozedWorkflows?.data || []),
            ];

            const workflow = allWorkflows.find((w) => w.gmailMessageId === emailId);

            if (!workflow) {
                notification.error({
                    message: 'Error',
                    description: 'Could not find workflow for this email',
                });
                return;
            }

            try {
                await snoozeWorkflow({
                    id: workflow.id,
                    snoozedUntil,
                });

                setSnoozeModalOpen(false);
                setSelectedEmailForSnooze(null);

                notification.success({
                    message: 'Email Snoozed',
                    description: `Email will reappear on ${snoozedUntil.toLocaleString()}`,
                });
            } catch (error) {
                console.error('Failed to snooze:', error);
            }
        },
        [inboxWorkflows, todoWorkflows, doneWorkflows, snoozedWorkflows, snoozeWorkflow, notification]
    );

    // Handle unsnooze
    const handleUnsnooze = useCallback(
        async (emailId: string) => {
            const workflow = snoozedWorkflows?.data?.find((w) => w.gmailMessageId === emailId);

            if (!workflow) {
                notification.error({
                    message: 'Error',
                    description: 'Could not find workflow for this email',
                });
                return;
            }

            try {
                await updateStatus({
                    id: workflow.id,
                    status: WorkflowStatus.INBOX, // Return to inbox by default
                });

                notification.success({
                    message: 'Email Unsnoozed',
                    description: 'Email has been restored to inbox.',
                });
            } catch (error) {
                console.error('Failed to unsnooze:', error);
            }
        },
        [snoozedWorkflows, updateStatus, notification]
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

    // Get columns to display
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
        refetch: refetchAllWorkflows,
    };
};
