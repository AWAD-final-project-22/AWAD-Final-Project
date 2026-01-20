'use client';

import { EmptyState } from '@/components/EmptyState';
import { LoadingSpin } from '@/components/LoadingSpin';
import { SearchResultsView } from '@/features/search/components/SearchResultsView';
import { SearchWithSuggestions } from '@/features/search/components/SearchWithSuggestions';
import {
  useSearchWorkflows,
  useSearchWorkflowsSemantic,
} from '@/features/search/hooks/useSearch';
import { useLogout } from '@/hooks/useLogout';
import { useNetworkStatus } from '@/hooks/useNetworkStatus';
import { useQueryClient } from '@tanstack/react-query';
import {
  AppstoreOutlined,
  SortDescendingOutlined,
  SortAscendingOutlined,
  MailOutlined,
  PaperClipOutlined,
} from '@ant-design/icons';
import { DragDropContext } from '@hello-pangea/dnd';
import { App, Layout, Select, Tag } from 'antd';
import React, { useCallback, useEffect, useRef, useState } from 'react';
import { KanbanColumn } from './components/KanbanColumn';
import { SettingsModal } from './components/SettingsModal';
import { SnoozeModal } from './components/SnoozeModal';
import { SNOOZED_COLUMN_ID } from './constants/kanban.constant';
import { useKanban } from './hooks/useKanban';
import { useKanbanKeyboardNav } from './hooks/useKanbanKeyboardNav';
import { kanbanKeys } from './hooks/kanbanAPIs';
import {
  workflowKeys,
  useMutationSyncEmails,
} from '@/features/inbox/hooks/workflowAPIs';
import { clearExpiredCache } from '@/helpers/offlineCache.helper';

import { PARAMS_URL } from '@/constants/params.constant';
import { useControlParams } from '@/hooks/useControlParams';
import {
  BoardContainer,
  FilterItem,
  KanbanHeader,
  KanbanLayout,
  KanbanTitle,
  SearchInput,
} from './styles/KanbanPage.style';
import { Action } from './components/Action';

type SearchType = 'fuzzy' | 'semantic';

const KanbanPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPage, setSearchPage] = useState(1);
  const [searchType, setSearchType] = useState<SearchType>('fuzzy');
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const [selectedCardId, setSelectedCardId] = useState<string | null>(null);
  const { notification } = App.useApp();
  const { isOnline } = useNetworkStatus();
  const prevOnlineRef = useRef(isOnline);
  const queryClient = useQueryClient();

  const { handleLogout, isLoggingOut } = useLogout();

  const [filterValue, setFilterValue] = useState<string | undefined>(undefined);
  const { updateSearchQuery } = useControlParams();

  // Fuzzy search
  const {
    data: fuzzySearchData,
    isLoading: isFuzzyLoading,
    isError: isFuzzyError,
    error: fuzzyError,
  } = useSearchWorkflows(
    { query: searchQuery, page: searchPage, limit: 10 },
    searchQuery.length > 0 && searchType === 'fuzzy',
  );

  // Semantic search
  const {
    data: semanticSearchData,
    isLoading: isSemanticLoading,
    isError: isSemanticError,
    error: semanticError,
  } = useSearchWorkflowsSemantic(
    { query: searchQuery, page: searchPage, limit: 10 },
    searchQuery.length > 0 && searchType === 'semantic',
  );

  // Use appropriate search data based on search type
  const searchData =
    searchType === 'fuzzy' ? fuzzySearchData : semanticSearchData;
  const isSearchLoading =
    searchType === 'fuzzy' ? isFuzzyLoading : isSemanticLoading;
  const isSearchError = searchType === 'fuzzy' ? isFuzzyError : isSemanticError;
  const searchError = searchType === 'fuzzy' ? fuzzyError : semanticError;

  const updateParamsSearchEmail = (value: string, param: string) => {
    const updatedQuery: Record<string, string | undefined> = {};
    if (value) {
      updatedQuery[param] = value;
    } else {
      updatedQuery[param] = undefined;
    }
    updateSearchQuery(updatedQuery, true);
  };

  const clearParams = () => {
    const updatedQuery: Record<string, string | undefined> = {};
    updatedQuery[PARAMS_URL.SEARCH_EMAIL] = undefined;
    updatedQuery[PARAMS_URL.FILTER_ATTACHMENT] = undefined;
    updatedQuery[PARAMS_URL.FILTER_BY_DATE] = undefined;
    updatedQuery[PARAMS_URL.FILTER] = undefined;
    updatedQuery[PARAMS_URL.PAGE] = undefined;
    updateSearchQuery(updatedQuery, true);
  };

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value.trim());
    setSearchPage(1);
    updateParamsSearchEmail(value.trim(), PARAMS_URL.SEARCH_EMAIL);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchPage(1);
  }, []);

  const handleSearchPageChange = useCallback((page: number) => {
    setSearchPage(page);
    updateParamsSearchEmail(page.toString(), PARAMS_URL.PAGE);
  }, []);

  const handleFilterChange = (value: string | undefined) => {
    setFilterValue(value);
    if (value) {
      updateParamsSearchEmail(value, PARAMS_URL.FILTER);
    } else {
      updateParamsSearchEmail('', PARAMS_URL.FILTER);
    }
  };

  // const handleClearFilters = useCallback(() => {
  //   setFilterValue(undefined);
  //   updateParamsSearchEmail('', PARAMS_URL.FILTER);
  // }, []);

  const handleSearchTypeToggle = useCallback(() => {
    setSearchType((prev) => (prev === 'fuzzy' ? 'semantic' : 'fuzzy'));
  }, []);

  // Sync emails from Gmail when page loads
  const { mutate: syncEmails, isPending: isSyncing } = useMutationSyncEmails({
    onSuccess: () => {
      console.log('[Sync] Emails synced successfully');
    },
    onError: (error) => {
      console.error('[Sync] Failed to sync emails:', error);
      notification.error({
        message: 'Sync Failed',
        description: 'Could not sync emails from Gmail. Please try again.',
      });
    },
  });

  // Sync on mount
  useEffect(() => {
    syncEmails();
  }, []);

  // Kanban state
  const {
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
    handleUpdatePriority,
    isInboxLoading,
    isTodoLoading,
    isDoneLoading,
    handleFilterChange: handleKanbanFilterChange,
    handleSortChange: handleKanbanSortChange,
    handleClearFilters: handleKanbanClearFilters,
  } = useKanban();

  const handleSnoozeConfirm = (snoozedUntil: Date) => {
    if (selectedEmailForSnooze) {
      handleSnooze(selectedEmailForSnooze, snoozedUntil);
    }
  };

  useEffect(() => clearParams(), []);
  useEffect(() => {
    if (searchQuery) {
      setSelectedCardId(null);
    }
  }, [searchQuery]);

  // Apply filters when filterValue changes
  useEffect(() => {
    if (filterValue === 'newest') {
      handleKanbanSortChange('date-newest');
      handleKanbanClearFilters();
    } else if (filterValue === 'oldest') {
      handleKanbanSortChange('date-oldest');
      handleKanbanClearFilters();
    } else if (filterValue === 'unread') {
      handleKanbanFilterChange({
        showUnreadOnly: true,
        showAttachmentsOnly: false,
        senderFilter: null,
      });
      handleKanbanSortChange('date-newest');
    } else if (filterValue === 'attachments') {
      handleKanbanFilterChange({
        showUnreadOnly: false,
        showAttachmentsOnly: true,
        senderFilter: null,
      });
      handleKanbanSortChange('date-newest');
    } else {
      // Clear all filters
      handleKanbanClearFilters();
      handleKanbanSortChange('date-newest');
    }
  }, [
    filterValue,
    handleKanbanFilterChange,
    handleKanbanSortChange,
    handleKanbanClearFilters,
  ]);

  useEffect(() => {
    const wasOnline = prevOnlineRef.current;
    if (wasOnline === isOnline) return;

    if (!isOnline) {
      notification.warning({
        message: 'Offline mode',
        description: 'Showing cached data.',
      });
    } else {
      notification.success({
        message: 'Back online',
        description: 'Data will refresh automatically.',
      });
      (async () => {
        try {
          await clearExpiredCache();
        } catch (error) {
          console.warn('[offline-cache] cleanup failed', error);
        }
        queryClient.invalidateQueries({ queryKey: workflowKeys.all });
        queryClient.invalidateQueries({ queryKey: kanbanKeys.columns() });
      })();
    }

    prevOnlineRef.current = isOnline;
  }, [isOnline, notification, queryClient]);

  const navColumns = React.useMemo(() => {
    const baseColumns = columns.map((col) => ({
      id: col.id,
      emails: col.emails,
    }));
    if (snoozedEmails.length > 0) {
      baseColumns.push({
        id: SNOOZED_COLUMN_ID,
        emails: snoozedEmails,
      });
    }
    return baseColumns;
  }, [columns, snoozedEmails]);

  useKanbanKeyboardNav({
    columns: navColumns,
    selectedCardId,
    onSelectCard: setSelectedCardId,
    onOpenGmail: (emailId: string) => {
      window.open(
        `https://mail.google.com/mail/u/0/#inbox/${emailId}`,
        '_blank',
      );
    },
    searchInputId: 'kanban-search-input',
    enabled: !searchQuery && !snoozeModalOpen && !settingsModalOpen,
  });

  const renderSearchInput = () => (
    <SearchInput>
      <SearchWithSuggestions
        placeholder='Search emails...'
        onSearch={handleSearch}
        onChange={(value) => {
          if (value === '') handleClearSearch();
        }}
        onClear={handleClearSearch}
        updateParamsSearchEmail={(value) =>
          updateParamsSearchEmail(value, PARAMS_URL.SEARCH_EMAIL)
        }
        allowClear
        style={{ width: '100%' }}
        inputId='kanban-search-input'
      />

      <FilterItem>
        <Select
          placeholder='Filter emails'
          value={filterValue}
          onChange={handleFilterChange}
          style={{ width: 150 }}
          options={[
            {
              value: 'newest',
              label: (
                <>
                  <SortDescendingOutlined /> Newest first
                </>
              ),
            },
            {
              value: 'oldest',
              label: (
                <>
                  <SortAscendingOutlined /> Oldest first
                </>
              ),
            },
            {
              value: 'unread',
              label: (
                <>
                  <MailOutlined /> Unread
                </>
              ),
            },
            {
              value: 'attachments',
              label: (
                <>
                  <PaperClipOutlined /> Attachments
                </>
              ),
            },
          ]}
          allowClear
        />
      </FilterItem>
    </SearchInput>
  );

  if (
    isSyncing ||
    isEmailsLoading ||
    isInboxLoading ||
    isTodoLoading ||
    isDoneLoading
  ) {
    return (
      <KanbanLayout>
        <LoadingSpin />
      </KanbanLayout>
    );
  }

  const hasEmails =
    columns.some((col) => col.emails.length > 0) || snoozedEmails.length > 0;

  if (!hasEmails) {
    return (
      <KanbanLayout>
        <KanbanHeader>
          <KanbanTitle>
            <AppstoreOutlined />
            AI Email Flow
          </KanbanTitle>

          {renderSearchInput()}

          <Action
            setSettingsModalOpen={setSettingsModalOpen}
            refreshKanban={refetch}
            onLogout={handleLogout}
            isLoggingOut={isLoggingOut}
            searchType={searchType}
            onSearchTypeToggle={handleSearchTypeToggle}
          />
        </KanbanHeader>
        <Layout.Content>
          <EmptyState message='No emails to display' />
        </Layout.Content>
        <SettingsModal
          open={settingsModalOpen}
          onClose={() => setSettingsModalOpen(false)}
        />
      </KanbanLayout>
    );
  }

  return (
    <KanbanLayout>
      <KanbanHeader>
        <KanbanTitle>
          <AppstoreOutlined />
          AI Email Flow
          {!isOnline && (
            <Tag color='red' style={{ marginLeft: 8 }}>
              Offline
            </Tag>
          )}
        </KanbanTitle>

        {renderSearchInput()}

        <Action
          setSettingsModalOpen={setSettingsModalOpen}
          refreshKanban={refetch}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
          searchType={searchType}
          onSearchTypeToggle={handleSearchTypeToggle}
        />
      </KanbanHeader>

      <Layout.Content>
        {searchQuery ? (
          <SearchResultsView
            query={searchQuery}
            results={searchData?.data || []}
            isLoading={isSearchLoading}
            isError={isSearchError}
            error={searchError as Error}
            pagination={{
              total: searchData?.pagination?.total || 0,
              currentPage: searchData?.pagination?.currentPage || 1,
              limit: searchData?.pagination?.limit || 10,
            }}
            onPageChange={handleSearchPageChange}
            onClearSearch={handleClearSearch}
          />
        ) : (
          <DragDropContext onDragEnd={handleDragEnd}>
            <BoardContainer>
              {columns.map((column) => (
                <KanbanColumn
                  key={column.id}
                  id={column.id}
                  title={column.title}
                  emails={column.emails}
                  onSnooze={openSnoozeModal}
                  onUnsnooze={handleUnsnooze}
                  onPriorityChange={handleUpdatePriority}
                  selectedCardId={selectedCardId}
                  onSelectCard={setSelectedCardId}
                />
              ))}
              {snoozedEmails.length > 0 && (
                <KanbanColumn
                  id={SNOOZED_COLUMN_ID}
                  title='SNOOZED'
                  emails={snoozedEmails}
                  onSnooze={openSnoozeModal}
                  onUnsnooze={handleUnsnooze}
                  onPriorityChange={handleUpdatePriority}
                  selectedCardId={selectedCardId}
                  onSelectCard={setSelectedCardId}
                />
              )}
            </BoardContainer>
          </DragDropContext>
        )}
      </Layout.Content>

      <SnoozeModal
        open={snoozeModalOpen}
        onClose={closeSnoozeModal}
        onSnooze={handleSnoozeConfirm}
      />

      <SettingsModal
        open={settingsModalOpen}
        onClose={() => setSettingsModalOpen(false)}
      />
    </KanbanLayout>
  );
};

export default KanbanPage;
