'use client';

import React from 'react';
import { Button, Input, Tooltip, Layout } from 'antd';
import {
    ReloadOutlined,
    AppstoreOutlined,
} from '@ant-design/icons';
import { useKanban } from './hooks/useKanban';
import { ViewToggle } from '@/components/ViewToggle';
import { LoadingSpin } from '@/components/LoadingSpin';
import { EmptyState } from '@/components/EmptyState';
import { SnoozeModal } from './components/SnoozeModal';
import { KanbanColumn } from './components/KanbanColumn';
import { FilterBar } from './components/FilterBar';
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

const { Search } = Input;

const HeaderActions = styled.div`
  display: flex;
  align-items: center;
  gap: 16px;
`;

const KanbanPage: React.FC = () => {
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
        filters,
        sortBy,
        handleFilterChange,
        handleSortChange,
        handleClearFilters,
    } = useKanban();

    const handleSnoozeConfirm = (snoozedUntil: Date) => {
        if (selectedEmailForSnooze) {
            handleSnooze(selectedEmailForSnooze, snoozedUntil);
        }
    };

    if (isEmailsLoading) {
        return (
            <KanbanLayout>
                <LoadingSpin />
            </KanbanLayout>
        );
    }

    const hasEmails = columns.some((col) => col.emails.length > 0) || snoozedEmails.length > 0;

    if (!hasEmails) {
        return (
            <KanbanLayout>
                <KanbanHeader>
                    <KanbanTitle>
                        <AppstoreOutlined />
                        AI Email Flow
                    </KanbanTitle>

                    <SearchInput>
                        <Search
                            placeholder="Search emails..."
                            allowClear
                            style={{ width: '100%' }}
                        />
                    </SearchInput>

                    <HeaderActions>
                        <Tooltip title="Refresh">
                            <Button
                                type="text"
                                icon={<ReloadOutlined />}
                                onClick={() => refetch()}
                            />
                        </Tooltip>
                        <ViewToggle currentView="kanban" />
                    </HeaderActions>
                </KanbanHeader>

                <FilterBar
                    filters={filters}
                    sortBy={sortBy}
                    onFilterChange={handleFilterChange}
                    onSortChange={handleSortChange}
                    onClearFilters={handleClearFilters}
                />

                <Layout.Content>
                    <EmptyState message="No emails to display" />
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

                <SearchInput>
                    <Search
                        placeholder="Search emails..."
                        allowClear
                        style={{ width: '100%' }}
                    />
                </SearchInput>

                <HeaderActions>
                    <Tooltip title="Refresh">
                        <Button
                            type="text"
                            icon={<ReloadOutlined />}
                            onClick={() => refetch()}
                        />
                    </Tooltip>
                    <ViewToggle currentView="kanban" />
                </HeaderActions>
            </KanbanHeader>

            <FilterBar
                filters={filters}
                sortBy={sortBy}
                onFilterChange={handleFilterChange}
                onSortChange={handleSortChange}
                onClearFilters={handleClearFilters}
            />

            <Layout.Content>
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
                                title="SNOOZED"
                                emails={snoozedEmails}
                                onSnooze={openSnoozeModal}
                                onUnsnooze={handleUnsnooze}
                            />
                        )}
                    </BoardContainer>
                </DragDropContext>
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
