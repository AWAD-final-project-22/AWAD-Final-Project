'use client';

import { EmptyState } from '@/components/EmptyState';
import { LoadingSpin } from '@/components/LoadingSpin';
import { SearchResultsView } from '@/features/search/components/SearchResultsView';
import { SearchWithSuggestions } from '@/features/search/components/SearchWithSuggestions';
import { useSearchWorkflows } from '@/features/search/hooks/useSearch';
import { useLogoutSync } from '@/hooks/useLogoutSync';
import { useMutationLogout } from '@/hooks/apis/authenAPIs';
import { useAppDispatch } from '@/redux/hooks';
import { setAccessToken } from '@/redux/slices/authSlice';
import {
  AppstoreOutlined,
  SortDescendingOutlined,
  SortAscendingOutlined,
  MailOutlined,
  PaperClipOutlined,
} from '@ant-design/icons';
import { DragDropContext } from '@hello-pangea/dnd';
import { App, Layout, Select } from 'antd';
import React, { useCallback, useEffect, useState } from 'react';
import { useRouter } from 'next/navigation';
import { KanbanColumn } from './components/KanbanColumn';
import { SettingsModal } from './components/SettingsModal';
import { SnoozeModal } from './components/SnoozeModal';
import { SNOOZED_COLUMN_ID } from './constants/kanban.constant';
import { useKanban } from './hooks/useKanban';

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

const KanbanPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPage, setSearchPage] = useState(1);
  const [settingsModalOpen, setSettingsModalOpen] = useState(false);
  const router = useRouter();
  const dispatch = useAppDispatch();
  const { notification } = App.useApp();

  const { broadcastLogout } = useLogoutSync();
  const { mutate: logout, isPending: isLoggingOut } = useMutationLogout({
    onSuccess: () => {
      notification.success({ message: 'Logged out successfully' });
      dispatch(setAccessToken(null));
      document.cookie =
        'refreshToken=; path=/; expires=Thu, 01 Jan 1970 00:00:00 UTC; SameSite=Lax';
      broadcastLogout();
      router.push('/login');
    },
    onError: (error) => {
      console.error('Logout failed:', error);
      notification.error({ message: 'Logout failed' });
    },
  });

  const handleLogout = () => {
    logout();
  };

  const [sortByDate, setSortByDate] = useState<string | undefined>(undefined);
  const { updateSearchQuery } = useControlParams();

  const {
    data: searchData,
    isLoading: isSearchLoading,
    isError: isSearchError,
    error: searchError,
  } = useSearchWorkflows(
    { query: searchQuery, page: searchPage, limit: 10 },
    searchQuery.length > 0,
  );

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

  const handleFilterChange = (value: string) => {
    setSortByDate(value);
    updateParamsSearchEmail(value, PARAMS_URL.FILTER);
  };

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
  } = useKanban();

  const handleSnoozeConfirm = (snoozedUntil: Date) => {
    if (selectedEmailForSnooze) {
      handleSnooze(selectedEmailForSnooze, snoozedUntil);
    }
  };

  useEffect(() => clearParams(), []);

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
      />

      <FilterItem>
        <Select
          placeholder='Filter emails'
          value={sortByDate}
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

  if (isEmailsLoading || isInboxLoading || isTodoLoading || isDoneLoading) {
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
        </KanbanTitle>

        {renderSearchInput()}

        <Action
          setSettingsModalOpen={setSettingsModalOpen}
          refreshKanban={refetch}
          onLogout={handleLogout}
          isLoggingOut={isLoggingOut}
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
