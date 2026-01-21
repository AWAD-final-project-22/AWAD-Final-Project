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
import {
  IEmail,
  IEmailResponse,
} from '@/features/inbox/interfaces/mailAPI.interface';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useAppSelector } from '@/redux/hooks';
import { selectCurrentUser } from '@/redux/slices/authSlice';
import {
  EMAIL_LIST_LIMIT,
  generateCacheKey,
  logOfflineCache,
  readCache,
  STORES,
  writeCache,
} from '@/helpers/offlineCache.helper';
import {
  IKanbanEmail,
  KanbanStatus,
  IFilterOptions,
  SortType,
} from '../interfaces/kanban.interface';
import { SNOOZED_COLUMN_ID } from '../constants/kanban.constant';
import { useGetKanbanColumns } from './kanbanAPIs';
import {
  LIMIT_DEFAULT,
  OFFSET_DEFAULT,
  WORKFLOW_EMAIL_LIMIT,
} from '@/constants/common.constant';
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
  const { isOnline } = useNetworkStatus();
  const userId = useAppSelector(selectCurrentUser)?.id || 'anonymous';
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

  const {
    data: inboxWorkflows,
    refetch: refetchInbox,
    isLoading: isInboxLoading,
  } = useGetWorkflows({
    status: WorkflowStatus.INBOX,
    limit: WORKFLOW_EMAIL_LIMIT,
    offset: OFFSET_DEFAULT,
  });

  const {
    data: todoWorkflows,
    refetch: refetchTodo,
    isLoading: isTodoLoading,
  } = useGetWorkflows({
    status: WorkflowStatus.TODO,
    limit: WORKFLOW_EMAIL_LIMIT,
    offset: OFFSET_DEFAULT,
  });

  const {
    data: doneWorkflows,
    refetch: refetchDone,
    isLoading: isDoneLoading,
  } = useGetWorkflows({
    status: WorkflowStatus.DONE,
    limit: WORKFLOW_EMAIL_LIMIT,
    offset: OFFSET_DEFAULT,
  });

  const { data: snoozedWorkflows, refetch: refetchSnoozed } = useGetWorkflows({
    status: WorkflowStatus.SNOOZED,
    limit: WORKFLOW_EMAIL_LIMIT,
    offset: OFFSET_DEFAULT,
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

  useEffect(() => {
    if (!isOnline) return;
    const snoozedData = snoozedWorkflows?.data || [];
    if (snoozedData.length === 0) return;

    const snoozedTimes = snoozedData
      .map((workflow) => workflow.snoozedUntil)
      .filter((value): value is string => Boolean(value))
      .map((value) => new Date(value).getTime())
      .filter((time) => !Number.isNaN(time));

    if (snoozedTimes.length === 0) return;

    const nextSnoozeAt = Math.min(...snoozedTimes);
    const now = Date.now();
    const bufferMs = 5000;
    const delayMs =
      nextSnoozeAt > now ? nextSnoozeAt - now + bufferMs : 30000;

    const timeoutId = setTimeout(() => {
      refetchAllWorkflows();
    }, delayMs);

    return () => clearTimeout(timeoutId);
  }, [isOnline, snoozedWorkflows?.data, refetchAllWorkflows]);

  const transformWorkflowToKanbanEmail = useCallback(
    // eslint-disable-next-line @typescript-eslint/no-explicit-any
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

  const { data: dynamicColumns = [] } = useGetKanbanColumns();
  const queryClient = useQueryClient();

  const labelPage = 1;
  const labelLimit = 50;
  const labelSearch = '';
  const labelFilter = '';

  const labelEmailsResults = useQueries({
    queries: dynamicColumns.map((col) => ({
      queryKey: [
        API_PATH.EMAIL.GET_LIST_EMAILS_MAILBOX.API_KEY,
        col.label,
        userId,
        labelPage,
        labelLimit,
        labelSearch,
        labelFilter,
      ],
      queryFn: async () => {
        const cacheKey = generateCacheKey(
          userId,
          col.label,
          labelPage,
          labelLimit,
          labelSearch,
          labelFilter,
        );
        const cached = await readCache(STORES.emailLists, cacheKey);
        logOfflineCache('label emails cache read', {
          cacheKey,
          label: col.label,
          hit: !!cached,
        });

        if (!isOnline) {
          logOfflineCache('label emails offline return', {
            cacheKey,
            label: col.label,
          });
          return (
            cached || {
              emails: [],
              page: labelPage,
              limit: labelLimit,
              total: 0,
            }
          );
        }

        const fetchAndUpdate = async () => {
          logOfflineCache('label emails fetch start', {
            cacheKey,
            label: col.label,
          });
          const response = await getListEmailsByMailBoxId(
            { page: labelPage, limit: labelLimit },
            col.label,
          );
          const limitedEmails = response.data.emails.slice(0, EMAIL_LIST_LIMIT);
          const updated = {
            ...response.data,
            emails: limitedEmails,
          };
          await writeCache(STORES.emailLists, cacheKey, updated);
          queryClient.setQueryData(
            [
              API_PATH.EMAIL.GET_LIST_EMAILS_MAILBOX.API_KEY,
              col.label,
              userId,
              labelPage,
              labelLimit,
              labelSearch,
              labelFilter,
            ],
            updated,
          );
          logOfflineCache('label emails fetch success', {
            cacheKey,
            label: col.label,
            count: response.data?.emails?.length,
          });
          return response.data;
        };

        if (cached) {
          logOfflineCache('label emails return cached', {
            cacheKey,
            label: col.label,
          });
          setTimeout(() => {
            logOfflineCache('label emails background fetch', {
              cacheKey,
              label: col.label,
            });
            fetchAndUpdate().catch((error) => {
              console.warn(
                '[offline-cache] label emails refresh failed',
                error,
              );
            });
          }, 0);
          return cached;
        }

        logOfflineCache('label emails cache miss', {
          cacheKey,
          label: col.label,
        });
        return fetchAndUpdate();
      },
      enabled: !!col.label,
    })),
  });

  const { mutateAsync: modifyLabels } = useMutationModifyEmailLabels({
    onSuccess: () => {
      refetchAllWorkflows();
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

      const isSourceStaticColumn = ['TODO', 'DONE'].includes(sourceColumnId);

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
            (r) => (r.data as IEmailResponse)?.emails || [],
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
            date: email.date || new Date().toISOString(),
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
    const customColumns = dynamicColumns.map((col) => {
      const labelIndex = dynamicColumns.findIndex((c) => c.id === col.id);
      const labelEmails =
        (labelEmailsResults[labelIndex]?.data as IEmailResponse)?.emails || [];
      const mappedEmails: IKanbanEmail[] = labelEmails.map((email: IEmail) => ({
        id: email.id,
        mailboxId: email.mailboxId,
        sender: email.sender,
        subject: email.subject,
        preview: email.preview,
        timestamp: email.date,
        isRead: email.isRead,
        isStarred: email.isStarred,
        hasAttachment: email.hasAttachment,
        aiSummary: email.aiSummary,
        status: 'INBOX' as KanbanStatus,
      }));

      // Apply filters and sort to custom columns
      const filteredEmails = filterEmails(mappedEmails);
      const sortedEmails = sortEmails(filteredEmails);

      return {
        id: `custom-${col.id}`,
        title: col.name || col.label,
        emails: sortedEmails,
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
  }, [
    processedEmails,
    dynamicColumns,
    labelEmailsResults,
    filterEmails,
    sortEmails,
  ]);

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
    isInboxLoading,
    isTodoLoading,
    isDoneLoading,
  };
};
