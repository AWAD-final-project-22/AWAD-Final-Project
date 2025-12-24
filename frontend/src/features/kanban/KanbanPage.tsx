'use client';

import React, { useState, useCallback } from 'react';
import { Button, Tooltip, Layout } from 'antd';
import { ReloadOutlined, AppstoreOutlined } from '@ant-design/icons';
import { useKanban } from './hooks/useKanban';
import { ViewToggle } from '@/components/ViewToggle';
import { LoadingSpin } from '@/components/LoadingSpin';
import { EmptyState } from '@/components/EmptyState';
import { SnoozeModal } from './components/SnoozeModal';
import { KanbanColumn } from './components/KanbanColumn';
import {
  KanbanLayout,
  KanbanHeader,
  KanbanTitle,
  SearchInput,
  BoardContainer,
} from './styles/KanbanPage.style';
import { SNOOZED_COLUMN_ID } from './constants/kanban.constant';
import { DragDropContext } from '@hello-pangea/dnd';
import styled from 'styled-components';
import { useSearchWorkflows } from '@/features/search/hooks/useSearch';
import { SearchResultsView } from '@/features/search/components/SearchResultsView';
import { SearchWithSuggestions } from '@/features/search/components/SearchWithSuggestions';


const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const KanbanPage: React.FC = () => {
  const [searchQuery, setSearchQuery] = useState('');
  const [searchPage, setSearchPage] = useState(1);

  const {
    data: searchData,
    isLoading: isSearchLoading,
    isError: isSearchError,
    error: searchError,
  } = useSearchWorkflows(
    { query: searchQuery, page: searchPage, limit: 10 },
    searchQuery.length > 0,
  );

  const handleSearch = useCallback((value: string) => {
    setSearchQuery(value.trim());
    setSearchPage(1);
  }, []);

  const handleClearSearch = useCallback(() => {
    setSearchQuery('');
    setSearchPage(1);
  }, []);

  const handleSearchPageChange = useCallback((page: number) => {
    setSearchPage(page);
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
  } = useKanban();

  const handleSnoozeConfirm = (snoozedUntil: Date) => {
    if (selectedEmailForSnooze) {
      handleSnooze(selectedEmailForSnooze, snoozedUntil);
    }
  };

  const renderSearchInput = () => (
    <SearchInput>
      <SearchWithSuggestions
        placeholder='Search emails...'
        onSearch={handleSearch}
        onChange={(value) => {
          if (value === '') handleClearSearch();
        }}
        onClear={handleClearSearch}
        allowClear
        style={{ width: '100%' }}
      />
    </SearchInput>
  );

  if (isEmailsLoading && !searchQuery) {
    return (
      <KanbanLayout>
        <LoadingSpin />
      </KanbanLayout>
    );
  }

  const hasEmails =
    columns.some((col) => col.emails.length > 0) || snoozedEmails.length > 0;

  // Empty state (no emails and no search)
  if (!hasEmails && !searchQuery) {
    return (
      <KanbanLayout>
        <KanbanHeader>
          <KanbanTitle>
            <AppstoreOutlined />
            AI Email Flow
          </KanbanTitle>

          {renderSearchInput()}

          <HeaderActions>
            <Tooltip title='Refresh'>
              <Button
                type='text'
                icon={<ReloadOutlined />}
                onClick={() => refetch()}
              />
            </Tooltip>
            <ViewToggle currentView='kanban' />
          </HeaderActions>
        </KanbanHeader>
        <Layout.Content>
          <EmptyState message='No emails to display' />
        </Layout.Content>
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

        <HeaderActions>
          <Tooltip title='Refresh'>
            <Button
              type='text'
              icon={<ReloadOutlined />}
              onClick={() => refetch()}
            />
          </Tooltip>
          <ViewToggle currentView='kanban' />
        </HeaderActions>
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
                />
              ))}
              {/* Snoozed column */}
              {snoozedEmails.length > 0 && (
                <KanbanColumn
                  id={SNOOZED_COLUMN_ID}
                  title='SNOOZED'
                  emails={snoozedEmails}
                  onSnooze={openSnoozeModal}
                  onUnsnooze={handleUnsnooze}
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
    </KanbanLayout>
  );
};

export default KanbanPage;
