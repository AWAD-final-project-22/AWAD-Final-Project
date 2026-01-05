'use client';

import React, { useState, useCallback, useRef, useEffect } from 'react';
import { AutoComplete, Input } from 'antd';
import type { AutoCompleteProps } from 'antd';
import { SearchOutlined, UserOutlined, FileTextOutlined } from '@ant-design/icons';
import styled from 'styled-components';
import { useSuggestions } from '../hooks/useSuggestions';
import { SuggestionItem } from '../interfaces/suggestions.interface';

const { Search } = Input;

const StyledAutoComplete = styled(AutoComplete)`
  width: 100%;
  
  .ant-select-dropdown {
    z-index: 1050;
  }
`;

const SuggestionOption = styled.div`
  display: flex;
  align-items: center;
  gap: 8px;
  padding: 4px 0;
`;

const SuggestionText = styled.span`
  flex: 1;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const SuggestionCount = styled.span`
  color: #999;
  font-size: 12px;
`;

interface SearchWithSuggestionsProps {
  placeholder?: string;
  onSearch: (value: string) => void;
  onClear?: () => void;
  value?: string;
  onChange?: (value: string) => void;
  allowClear?: boolean;
  style?: React.CSSProperties;
  debounceMs?: number;
  maxSuggestions?: number;
}

export const SearchWithSuggestions: React.FC<SearchWithSuggestionsProps> = ({
  placeholder = 'Search...',
  onSearch,
  onClear,
  value: controlledValue,
  onChange: controlledOnChange,
  allowClear = true,
  style,
  debounceMs = 300,
  maxSuggestions = 5,
}) => {
  const [searchValue, setSearchValue] = useState(controlledValue || '');
  const [debouncedQuery, setDebouncedQuery] = useState('');
  const debounceTimerRef = useRef<NodeJS.Timeout | null>(null);

  // Sync with controlled value
  useEffect(() => {
    if (controlledValue !== undefined && controlledValue !== searchValue) {
      setSearchValue(controlledValue);
    }
  }, [controlledValue]);

  const { data: suggestionsData, isLoading } = useSuggestions(
    {
      q: debouncedQuery,
      limit: maxSuggestions,
    },
    debouncedQuery.length > 0,
  );

  const handleInputChange = useCallback(
    (value: string) => {
      setSearchValue(value);
      controlledOnChange?.(value);

      // Debounce logic
      if (debounceTimerRef.current) {
        clearTimeout(debounceTimerRef.current);
      }

      debounceTimerRef.current = setTimeout(() => {
        setDebouncedQuery(value);
      }, debounceMs);
    },
    [debounceMs, controlledOnChange],
  );

  const handleSelect = useCallback(
    (value: unknown) => {
      const stringValue = String(value);
      setSearchValue(stringValue);
      controlledOnChange?.(stringValue);
      onSearch(stringValue);
    },
    [onSearch, controlledOnChange],
  );

  const handleSearch = useCallback(
    (value: string) => {
      onSearch(value);
    },
    [onSearch],
  );

  const handleClear = useCallback(() => {
    setSearchValue('');
    setDebouncedQuery('');
    controlledOnChange?.('');
    onClear?.();
  }, [onClear, controlledOnChange]);

  // Format suggestions cho AutoComplete
  const options: AutoCompleteProps['options'] = React.useMemo(() => {
    if (!suggestionsData?.suggestions || suggestionsData.suggestions.length === 0) {
      return [];
    }

    return suggestionsData.suggestions.map((suggestion: SuggestionItem) => ({
      value: suggestion.text,
      label: (
        <SuggestionOption>
          {suggestion.type === 'sender' ? (
            <UserOutlined style={{ color: '#1890ff' }} />
          ) : (
            <FileTextOutlined style={{ color: '#52c41a' }} />
          )}
          <SuggestionText>{suggestion.text}</SuggestionText>
          <SuggestionCount>({suggestion.count})</SuggestionCount>
        </SuggestionOption>
      ),
    }));
  }, [suggestionsData]);

  return (
    <StyledAutoComplete
      value={searchValue}
      options={options}
      onSelect={handleSelect}
      onChange={(value: unknown) => handleInputChange(String(value))}
      notFoundContent={isLoading ? 'Loading...' : null}
      style={style}
    >
      <Search
        placeholder={placeholder}
        allowClear={allowClear}
        onSearch={handleSearch}
        onChange={(e) => {
          if (e.target.value === '' && allowClear) {
            handleClear();
          }
        }}
        prefix={<SearchOutlined />}
      />
    </StyledAutoComplete>
  );
};
