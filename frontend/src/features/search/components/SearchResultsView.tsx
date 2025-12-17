'use client';

import React from 'react';
import { Pagination, Alert, Button } from 'antd';
import { CloseCircleOutlined, SearchOutlined } from '@ant-design/icons';
import { SearchResultCard } from './SearchResultCard';
import { ISearchResult } from '../interfaces/search.interface';
import { LoadingSpin } from '@/components/LoadingSpin';
import { EmptyState } from '@/components/EmptyState';
import {
  SearchResultsContainer,
  ResultsGrid,
  SearchHeaderInfo,
  SearchHeaderTitle,
  SearchTitle,
  SearchCount,
} from '../styles/SearchPage.style';

interface SearchResultsViewProps {
  query: string;
  results: ISearchResult[];
  isLoading: boolean;
  isError: boolean;
  error?: Error;
  pagination: {
    total: number;
    currentPage: number;
    limit: number;
  };
  onPageChange: (page: number) => void;
  onClearSearch: () => void;
}

export const SearchResultsView: React.FC<SearchResultsViewProps> = ({
  query,
  results,
  isLoading,
  isError,
  error,
  pagination,
  onPageChange,
  onClearSearch,
}) => {
  if (isLoading) {
    return (
      <SearchResultsContainer>
        <LoadingSpin />
      </SearchResultsContainer>
    );
  }

  if (isError) {
    return (
      <SearchResultsContainer>
        <Alert
          message='Search Error'
          description={
            error?.message ||
            'An error occurred while searching. Please try again.'
          }
          type='error'
          showIcon
          action={
            <Button size='small' onClick={onClearSearch}>
              Clear Search
            </Button>
          }
          style={{ maxWidth: 600, margin: '100px auto' }}
        />
      </SearchResultsContainer>
    );
  }

  return (
    <SearchResultsContainer>
      <ResultsGrid>
        <SearchHeaderInfo>
          <SearchHeaderTitle>
            <SearchTitle>
              <SearchOutlined />
              Search Results for &quot;{query}&quot;
            </SearchTitle>
            <SearchCount>
              Found {pagination.total} result{pagination.total !== 1 ? 's' : ''}
            </SearchCount>
          </SearchHeaderTitle>
          <Button icon={<CloseCircleOutlined />} onClick={onClearSearch}>
            Clear Search
          </Button>
        </SearchHeaderInfo>

        {!results || results.length === 0 ? (
          <EmptyState message='No results found' />
        ) : (
          <>
            {results.map((result) => (
              <SearchResultCard key={result.id} result={result} />
            ))}

            {pagination.total > pagination.limit && (
              <Pagination
                size='small'
                total={pagination.total}
                pageSize={pagination.limit}
                current={pagination.currentPage}
                showSizeChanger={false}
                style={{ textAlign: 'center', marginTop: 16 }}
                onChange={onPageChange}
              />
            )}
          </>
        )}
      </ResultsGrid>
    </SearchResultsContainer>
  );
};
