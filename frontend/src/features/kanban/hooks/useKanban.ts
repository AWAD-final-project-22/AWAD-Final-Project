'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';
import { App } from 'antd';
import { DropResult } from '@hello-pangea/dnd';
import { useQueries, useQueryClient } from '@tanstack/react-query';
import { API_PATH } from '@/constants/apis.constant';
import {
  useGetEmailsByMailBoxId,
  useMutationModifyEmailLabels,
} from '@/features/inbox/hooks/mailAPIs';
import { getListEmailsByMailBoxId } from '@/features/inbox/services/mailQueries';
import { IEmail } from '@/features/inbox/interfaces/mailAPI.interface';
import {
  IKanbanEmail,
  KanbanStatus,
  IFilterOptions,
  SortType,
} from '../interfaces/kanban.interface';
import { SNOOZED_COLUMN_ID } from '../constants/kanban.constant';
import { useGetKanbanColumns } from './kanbanAPIs';
import { LIMIT_DEFAULT } from '@/constants/common.constant';
import {
  useGetWorkflows,
  useMutationUpdateWorkflowStatus,
  useMutationSnoozeWorkflow,
  useMutationCreateOrUpdateWorkflow,
  useMutationUpdatePriority,
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

const STORAGE_KEY_FILTERS = 'kanban_filters';
const STORAGE_KEY_SORT = 'kanban_sort';

const getInitialFilters = (): IFilterOptions => {
  if (typeof window === 'undefined') {
    return {
      showUnreadOnly: false,
      showAttachmentsOnly: false,
      senderFilter: null,
    };
  }
  const saved = localStorage.getItem(STORAGE_KEY_FILTERS);
  if (saved) {
    try {
      return JSON.parse(saved);
    } catch {
      return {
        showUnreadOnly: false,
        showAttachmentsOnly: false,
        senderFilter: null,
      };
    }
  }
  return {
    showUnreadOnly: false,
    showAttachmentsOnly: false,
    senderFilter: null,
  };
};

const getInitialSort = (): SortType => {
  if (typeof window === 'undefined') return 'date-newest';
  const saved = localStorage.getItem(STORAGE_KEY_SORT);
  return (saved as SortType) || 'date-newest';
};

export const useKanban = ({ mailboxId = 'INBOX' }: UseKanbanProps = {}) => {
  const { notification } = App.useApp();
  const [snoozeModalOpen, setSnoozeModalOpen] = useState(false);
  const [selectedEmailForSnooze, setSelectedEmailForSnooze] = useState<
    string | null
  >(null);
  const [filters, setFilters] = useState<IFilterOptions>(getInitialFilters);
  const [sortBy, setSortBy] = useState<SortType>(getInitialSort);

  // Persist filters to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_FILTERS, JSON.stringify(filters));
    }
  }, [filters]);

  // Persist sort to localStorage
  useEffect(() => {
    if (typeof window !== 'undefined') {
      localStorage.setItem(STORAGE_KEY_SORT, sortBy);
    }
  }, [sortBy]);

  const {
    data: emailsData,
    isLoading: isEmailsLoading,
    refetch: refetchEmails,
  } = useGetEmailsByMailBoxId(
    { page: 1, limit: Number(LIMIT_DEFAULT) * 5 },
    mailboxId,
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

  const transformWorkflowToKanbanEmail = useCallback(
    (workflow: any): IKanbanEmail => {
      const gmailEmail = emailsData?.emails?.find(
        (e: IEmail) => e.id === workflow.gmailMessageId,
      );

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
        workflowId: workflow.id,
        priority: workflow.priority || 0,
      };
    },
    [emailsData],
  );

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
      result.SNOOZED = snoozedWorkflows.data.map(
        transformWorkflowToKanbanEmail,
      );
    }

    return result;
  }, [
    inboxWorkflows,
    todoWorkflows,
    doneWorkflows,
    snoozedWorkflows,
    transformWorkflowToKanbanEmail,
  ]);

  // Filter emails based on filter options
  const filterEmails = useCallback(
    (emails: IKanbanEmail[]): IKanbanEmail[] => {
      let filtered = [...emails];

      // Filter by unread
      if (filters.showUnreadOnly) {
        filtered = filtered.filter((email) => email.isRead === false);
      }

      // Filter by attachments
      if (filters.showAttachmentsOnly) {
        filtered = filtered.filter((email) => email.hasAttachment === true);
      }

      // Filter by sender
      if (filters.senderFilter) {
        const searchTerm = filters.senderFilter.toLowerCase();
        filtered = filtered.filter((email) =>
          email.sender.toLowerCase().includes(searchTerm),
        );
      }

      return filtered;
    },
    [filters],
  );

  // Sort emails based on sort option
  const sortEmails = useCallback(
    (emails: IKanbanEmail[]): IKanbanEmail[] => {
      const sorted = [...emails];

      switch (sortBy) {
        case 'date-newest':
          return sorted.sort(
            (a, b) =>
              new Date(b.timestamp).getTime() - new Date(a.timestamp).getTime(),
          );
        case 'date-oldest':
          return sorted.sort(
            (a, b) =>
              new Date(a.timestamp).getTime() - new Date(b.timestamp).getTime(),
          );
        case 'sender-asc':
          return sorted.sort((a, b) => {
            const senderA = a.sender.split('<')[0].trim().toLowerCase();
            const senderB = b.sender.split('<')[0].trim().toLowerCase();
            return senderA.localeCompare(senderB);
          });
        case 'sender-desc':
          return sorted.sort((a, b) => {
            const senderA = a.sender.split('<')[0].trim().toLowerCase();
            const senderB = b.sender.split('<')[0].trim().toLowerCase();
            return senderB.localeCompare(senderA);
          });
        default:
          return sorted;
      }
    },
    [sortBy],
  );

  // Apply filters and sort to grouped emails
  const processedEmails = useMemo(() => {
    const result: Record<KanbanStatus, IKanbanEmail[]> = {
      INBOX: [],
      TODO: [],
      IN_PROGRESS: [],
      DONE: [],
      SNOOZED: [],
    };

    // Process each status separately
    (Object.keys(groupedEmails) as KanbanStatus[]).forEach((status) => {
      const emails = groupedEmails[status] || [];
      const filtered = filterEmails(emails);
      const sorted = sortEmails(filtered);
      result[status] = sorted;
    });

    return result;
  }, [groupedEmails, filterEmails, sortEmails]);

  // Fetch dynamic columns from settings - must be before handleDragEnd
  const { data: dynamicColumns = [] } = useGetKanbanColumns();

  // Fetch emails for each custom column's label
  const labelEmailsResults = useQueries({
    queries: dynamicColumns.map((col) => ({
      queryKey: [API_PATH.EMAIL.GET_LIST_EMAILS_MAILBOX.API_KEY, col.label],
      queryFn: () =>
        getListEmailsByMailBoxId({ page: 1, limit: 50 }, col.label),
      select: (
        response: Awaited<ReturnType<typeof getListEmailsByMailBoxId>>,
      ) => response.data,
      enabled: !!col.label,
    })),
  });

  const queryClient = useQueryClient();

  const { mutateAsync: modifyLabels } = useMutationModifyEmailLabels({
    onSuccess: () => {
      refetchAllWorkflows();
      // Invalidate all email queries to refresh custom columns
      queryClient.invalidateQueries({
        queryKey: [API_PATH.EMAIL.GET_LIST_EMAILS_MAILBOX.API_KEY],
      });
    },
    onError: (error) => {
      notification.error({
        message: 'Failed to modify labels',
        description: error.message,
      });
    },
  });

  const { mutateAsync: createOrUpdateWorkflow } =
    useMutationCreateOrUpdateWorkflow({
      onSuccess: () => {
        refetchAllWorkflows();
      },
    });

  const { mutateAsync: updatePriority } = useMutationUpdatePriority({
    onSuccess: () => {
      refetchAllWorkflows();
    },
  });

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

      const emailId = draggableId;
      const destColumnId = destination.droppableId;
      const sourceColumnId = source.droppableId;

      // Check if destination is a custom column
      const destCustomColumn = dynamicColumns.find(
        (col) => `custom-${col.id}` === destColumnId,
      );
      const sourceCustomColumn = dynamicColumns.find(
        (col) => `custom-${col.id}` === sourceColumnId,
      );

      // Check if source is from a static workflow column (for determining if we need workflow update)
      const isSourceStaticColumn = ['TODO', 'DONE'].includes(sourceColumnId);

      // Handle label modifications for custom columns
      if (destCustomColumn || sourceCustomColumn) {
        try {
          const addLabelIds = destCustomColumn
            ? [destCustomColumn.label]
            : undefined;
          const removeLabelIds = sourceCustomColumn
            ? [sourceCustomColumn.label]
            : undefined;

          await modifyLabels({
            id: emailId,
            addLabelIds,
            removeLabelIds,
          });
        } catch (error) {
          console.error('Failed to modify labels:', error);
          notification.error({
            message: 'Failed to move email',
            description: 'Could not update email labels',
          });
          return;
        }
      }

      // If destination is a custom column only (not moving to static), we're done
      if (destCustomColumn && !isSourceStaticColumn) {
        notification.success({
          message: 'Email Moved',
          description: `Email moved to ${
            destCustomColumn.name || destCustomColumn.label
          }`,
          duration: 2,
        });
        return;
      }

      // For workflow columns, use existing logic
      const newStatus = destColumnId as KanbanStatus;

      const allWorkflows = [
        ...(inboxWorkflows?.data || []),
        ...(todoWorkflows?.data || []),
        ...(doneWorkflows?.data || []),
        ...(snoozedWorkflows?.data || []),
      ];

      const workflow = allWorkflows.find((w) => w.gmailMessageId === emailId);

      try {
        if (workflow) {
          // Workflow exists, update status
          await updateStatus({
            id: workflow.id,
            status: mapKanbanToWorkflowStatus(newStatus),
          });
        } else {
          // Workflow doesn't exist, find email data and create workflow
          const allLabelEmails = labelEmailsResults.flatMap(
            (r) => r.data?.emails || [],
          );
          const email = allLabelEmails.find((e) => e.id === emailId);

          if (!email) {
            notification.error({
              message: 'Error',
              description: 'Could not find email data',
            });
            return;
          }

          await createOrUpdateWorkflow({
            emailId: email.id,
            subject: email.subject || '(No Subject)',
            from: email.sender || 'unknown',
            date: email.timestamp || new Date().toISOString(),
            snippet: email.preview,
            status: mapKanbanToWorkflowStatus(newStatus),
          });
        }

        notification.success({
          message: 'Email Moved',
          description: `Email moved to ${newStatus.replace('_', ' ')}`,
          duration: 2,
        });
      } catch (error) {
        console.error('Failed to update status:', error);
      }
    },
    [
      inboxWorkflows,
      todoWorkflows,
      doneWorkflows,
      snoozedWorkflows,
      updateStatus,
      modifyLabels,
      dynamicColumns,
      notification,
      queryClient,
      labelEmailsResults,
      createOrUpdateWorkflow,
    ],
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
    [
      inboxWorkflows,
      todoWorkflows,
      doneWorkflows,
      snoozedWorkflows,
      snoozeWorkflow,
      notification,
    ],
  );

  // Handle unsnooze
  const handleUnsnooze = useCallback(
    async (emailId: string) => {
      const workflow = snoozedWorkflows?.data?.find(
        (w) => w.gmailMessageId === emailId,
      );

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
    [snoozedWorkflows, updateStatus, notification],
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

  // Get columns to display with filtered and sorted emails
  const columns = useMemo(() => {
    // Custom columns from settings (includes INBOX by default)
    // These are user-defined and can be edited/deleted
    const customColumns = dynamicColumns.map((col) => {
      // Find emails fetched for this column's label
      const labelIndex = dynamicColumns.findIndex((c) => c.id === col.id);
      const labelEmails = labelEmailsResults[labelIndex]?.data?.emails || [];
      const mappedEmails: IKanbanEmail[] = labelEmails.map((email: IEmail) => ({
        id: email.id,
        mailboxId: email.mailboxId,
        sender: email.sender,
        subject: email.subject,
        preview: email.preview,
        timestamp: email.timestamp,
        isRead: email.isRead,
        isStarred: email.isStarred,
        hasAttachment: email.hasAttachment,
        aiSummary: email.aiSummary,
        status: 'INBOX' as KanbanStatus,
      }));

      return {
        id: `custom-${col.id}`,
        title: col.name || col.label,
        emails: mappedEmails,
        label: col.label,
        isCustom: true,
      };
    });

    // If no custom columns exist, show default INBOX column
    // This happens when user first accesses the feature
    const displayCustomColumns =
      customColumns.length > 0
        ? customColumns
        : [
            {
              id: 'INBOX',
              title: 'INBOX',
              emails: processedEmails['INBOX'] || [],
              label: 'INBOX',
              isCustom: false,
            },
          ];

    // Static workflow columns (TODO, DONE) - cannot be edited/deleted
    const staticColumns = [
      { id: 'TODO', title: 'TO DO', emails: processedEmails['TODO'] || [] },
      { id: 'DONE', title: 'DONE', emails: processedEmails['DONE'] || [] },
    ];

    return [...displayCustomColumns, ...staticColumns];
  }, [processedEmails, dynamicColumns, labelEmailsResults]);

  // Snoozed emails for separate display with filters and sort
  const snoozedEmails = useMemo(() => {
    return processedEmails[SNOOZED_COLUMN_ID] || [];
  }, [processedEmails]);

  // Filter handlers
  const handleFilterChange = useCallback((newFilters: IFilterOptions) => {
    setFilters(newFilters);
  }, []);

  const handleSortChange = useCallback((newSort: SortType) => {
    setSortBy(newSort);
  }, []);

  const handleClearFilters = useCallback(() => {
    setFilters({
      showUnreadOnly: false,
      showAttachmentsOnly: false,
      senderFilter: null,
    });
  }, []);

  // Handle priority change
  const handleUpdatePriority = useCallback(
    async (workflowId: string, priority: number) => {
      try {
        await updatePriority({ id: workflowId, priority });
        notification.success({
          message: 'Priority Updated',
          duration: 2,
        });
      } catch (error) {
        console.error('Failed to update priority:', error);
        notification.error({
          message: 'Failed to update priority',
        });
      }
    },
    [updatePriority, notification],
  );

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
    filters,
    sortBy,
    handleFilterChange,
    handleSortChange,
    handleClearFilters,
    handleUpdatePriority,
  };
};
