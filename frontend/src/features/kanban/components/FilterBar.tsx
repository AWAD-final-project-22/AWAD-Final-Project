'use client';

import React from 'react';
import { Select, Checkbox, Input } from 'antd';
import { FilterOutlined, CloseCircleOutlined, SortAscendingOutlined } from '@ant-design/icons';
import { IFilterOptions, SortType, ISortOption } from '../interfaces/kanban.interface';
import {
    FilterBarContainer,
    FilterGroup,
    FilterLabel,
    SortGroup,
    ActiveFilterBadge,
    ClearFiltersButton,
    SenderFilterInput,
} from './FilterBar.style';

interface FilterBarProps {
    filters: IFilterOptions;
    sortBy: SortType;
    onFilterChange: (filters: IFilterOptions) => void;
    onSortChange: (sortBy: SortType) => void;
    onClearFilters: () => void;
}

const SORT_OPTIONS: ISortOption[] = [
    { type: 'date-newest', label: 'Date: Newest First' },
    { type: 'date-oldest', label: 'Date: Oldest First' },
    { type: 'sender-asc', label: 'Sender: A-Z' },
    { type: 'sender-desc', label: 'Sender: Z-A' },
];

export const FilterBar: React.FC<FilterBarProps> = ({
    filters,
    sortBy,
    onFilterChange,
    onSortChange,
    onClearFilters,
}) => {
    const activeFilterCount = [
        filters.showUnreadOnly,
        filters.showAttachmentsOnly,
        filters.senderFilter !== null && filters.senderFilter !== '',
    ].filter(Boolean).length;

    const handleUnreadChange = (checked: boolean) => {
        onFilterChange({ ...filters, showUnreadOnly: checked });
    };

    const handleAttachmentsChange = (checked: boolean) => {
        onFilterChange({ ...filters, showAttachmentsOnly: checked });
    };

    const handleSenderFilterChange = (value: string) => {
        onFilterChange({ 
            ...filters, 
            senderFilter: value.trim() === '' ? null : value.trim() 
        });
    };

    return (
        <FilterBarContainer>
            <FilterGroup>
                <FilterLabel>
                    <FilterOutlined style={{ marginRight: 6 }} />
                    Filters:
                </FilterLabel>
                
                <Checkbox
                    checked={filters.showUnreadOnly}
                    onChange={(e) => handleUnreadChange(e.target.checked)}
                >
                    Show Unread Only
                </Checkbox>

                <Checkbox
                    checked={filters.showAttachmentsOnly}
                    onChange={(e) => handleAttachmentsChange(e.target.checked)}
                >
                    Has Attachments
                </Checkbox>

                <SenderFilterInput>
                    <Input
                        placeholder="From sender..."
                        value={filters.senderFilter || ''}
                        onChange={(e) => handleSenderFilterChange(e.target.value)}
                        allowClear
                        size="small"
                    />
                </SenderFilterInput>

                {activeFilterCount > 0 && (
                    <>
                        <ActiveFilterBadge>
                            <FilterOutlined />
                            {activeFilterCount} active
                        </ActiveFilterBadge>
                        <ClearFiltersButton onClick={onClearFilters}>
                            <CloseCircleOutlined />
                            Clear All
                        </ClearFiltersButton>
                    </>
                )}
            </FilterGroup>

            <SortGroup>
                <FilterLabel>
                    <SortAscendingOutlined style={{ marginRight: 6 }} />
                    Sort:
                </FilterLabel>
                <Select
                    value={sortBy}
                    onChange={onSortChange}
                    options={SORT_OPTIONS.map(opt => ({
                        value: opt.type,
                        label: opt.label,
                    }))}
                    style={{ width: 180 }}
                    size="small"
                />
            </SortGroup>
        </FilterBarContainer>
    );
};
