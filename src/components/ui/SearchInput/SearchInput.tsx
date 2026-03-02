'use client';

import { forwardRef, useCallback, useEffect, useRef, useState } from 'react';
import styled, { keyframes } from 'styled-components';

import { useDebounce, useClickOutside } from '@/hooks';

import type { ReactNode } from 'react';

type SearchSuggestion = {
  id: string;
  label: string;
  description?: string;
  icon?: ReactNode;
  category?: string;
};

type SearchInputProps = {
  value: string;
  onChange: (value: string) => void;
  onSearch?: (value: string) => void;
  onSuggestionSelect?: (suggestion: SearchSuggestion) => void;
  suggestions?: SearchSuggestion[];
  isLoading?: boolean;
  placeholder?: string;
  debounceMs?: number;
  showClearButton?: boolean;
  autoFocus?: boolean;
};

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-4px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  position: relative;
  width: 100%;
`;

const InputWrapper = styled.div`
  position: relative;
  display: flex;
  align-items: center;
`;

const SearchIcon = styled.div`
  position: absolute;
  left: var(--spacing-3);
  display: flex;
  align-items: center;
  justify-content: center;
  color: var(--color-fg-tertiary);
  pointer-events: none;
`;

const Input = styled.input`
  width: 100%;
  height: 44px;
  padding: 0 var(--spacing-10) 0 var(--spacing-10);
  font-size: var(--font-size-sm);
  color: var(--color-fg-primary);
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-lg);
  outline: none;
  transition: var(--transition-interactive);

  &::placeholder {
    color: var(--color-fg-tertiary);
  }

  &:hover {
    border-color: var(--color-border-emphasis);
  }

  &:focus {
    border-color: var(--color-border-brand);
    box-shadow: var(--shadow-focus-brand);
  }
`;

const ClearButton = styled.button`
  position: absolute;
  right: var(--spacing-3);
  display: flex;
  align-items: center;
  justify-content: center;
  width: 24px;
  height: 24px;
  border: none;
  background: transparent;
  color: var(--color-fg-tertiary);
  cursor: pointer;
  border-radius: var(--radius-sm);
  transition: var(--transition-colors);

  &:hover {
    background-color: var(--color-bg-surface-hover);
    color: var(--color-fg-secondary);
  }
`;

const Spinner = styled.div`
  position: absolute;
  right: var(--spacing-3);
  width: 18px;
  height: 18px;
  border: 2px solid var(--color-border-subtle);
  border-top-color: var(--color-brand-500);
  border-radius: 50%;
  animation: spin 0.8s linear infinite;

  @keyframes spin {
    to {
      transform: rotate(360deg);
    }
  }
`;

const Dropdown = styled.div`
  position: absolute;
  top: calc(100% + var(--spacing-2));
  left: 0;
  right: 0;
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  overflow: hidden;
  z-index: var(--z-dropdown);
  animation: ${fadeIn} var(--duration-fast) var(--ease-out-expo);
`;

const SuggestionList = styled.div`
  max-height: 320px;
  overflow-y: auto;
`;

const Category = styled.div`
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-fg-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background-color: var(--color-bg-secondary);
`;

const SuggestionItem = styled.button<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--spacing-3);
  border: none;
  background-color: ${({ $isActive }) =>
    $isActive ? 'var(--color-bg-surface-hover)' : 'transparent'};
  cursor: pointer;
  text-align: left;
  transition: background-color var(--duration-fast) var(--ease-default);

  &:hover {
    background-color: var(--color-bg-surface-hover);
  }
`;

const SuggestionIcon = styled.div`
  flex-shrink: 0;
  width: 32px;
  height: 32px;
  margin-right: var(--spacing-3);
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-surface);
  border-radius: var(--radius-md);
  color: var(--color-fg-secondary);

  svg {
    width: 16px;
    height: 16px;
  }
`;

const SuggestionContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const SuggestionLabel = styled.div`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-fg-primary);
`;

const SuggestionDescription = styled.div`
  font-size: var(--font-size-xs);
  color: var(--color-fg-tertiary);
  margin-top: 2px;
  overflow: hidden;
  text-overflow: ellipsis;
  white-space: nowrap;
`;

const EmptyState = styled.div`
  padding: var(--spacing-6);
  text-align: center;
  color: var(--color-fg-tertiary);
  font-size: var(--font-size-sm);
`;

const SearchIconSvg = () => (
  <svg
    width="18"
    height="18"
    viewBox="0 0 18 18"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
  >
    <circle cx="7.5" cy="7.5" r="5" />
    <path d="M11 11l4.5 4.5" />
  </svg>
);

const groupByCategory = (suggestions: SearchSuggestion[]) => {
  const grouped = new Map<string, SearchSuggestion[]>();

  suggestions.forEach((suggestion) => {
    const category = suggestion.category ?? 'Results';
    const existing = grouped.get(category) ?? [];
    grouped.set(category, [...existing, suggestion]);
  });

  return grouped;
};

export const SearchInput = forwardRef<HTMLInputElement, SearchInputProps>(
  (
    {
      value,
      onChange,
      onSearch,
      onSuggestionSelect,
      suggestions = [],
      isLoading = false,
      placeholder = 'Search...',
      debounceMs = 300,
      showClearButton = true,
      autoFocus = false,
    },
    ref
  ) => {
    const [isOpen, setIsOpen] = useState(false);
    const [activeIndex, setActiveIndex] = useState(-1);
    const containerRef = useClickOutside<HTMLDivElement>(
      () => setIsOpen(false),
      isOpen
    );
    const inputRef = useRef<HTMLInputElement>(null);

    const debouncedValue = useDebounce(value, debounceMs);

    useEffect(() => {
      if (debouncedValue && onSearch) {
        onSearch(debouncedValue);
      }
    }, [debouncedValue, onSearch]);

    useEffect(() => {
      setActiveIndex(-1);
    }, [suggestions]);

    const handleFocus = useCallback(() => {
      if (suggestions.length > 0 || value) {
        setIsOpen(true);
      }
    }, [suggestions.length, value]);

    const handleChange = useCallback(
      (e: React.ChangeEvent<HTMLInputElement>) => {
        onChange(e.target.value);
        setIsOpen(true);
      },
      [onChange]
    );

    const handleClear = useCallback(() => {
      onChange('');
      setIsOpen(false);
      inputRef.current?.focus();
    }, [onChange]);

    const handleSelect = useCallback(
      (suggestion: SearchSuggestion) => {
        onSuggestionSelect?.(suggestion);
        setIsOpen(false);
      },
      [onSuggestionSelect]
    );

    const handleKeyDown = useCallback(
      (e: React.KeyboardEvent) => {
        if (!isOpen) {
          if (e.key === 'ArrowDown') {
            setIsOpen(true);
          }
          return;
        }

        switch (e.key) {
          case 'ArrowDown':
            e.preventDefault();
            setActiveIndex((prev) =>
              prev < suggestions.length - 1 ? prev + 1 : 0
            );
            break;
          case 'ArrowUp':
            e.preventDefault();
            setActiveIndex((prev) =>
              prev > 0 ? prev - 1 : suggestions.length - 1
            );
            break;
          case 'Enter':
            e.preventDefault();
            if (activeIndex >= 0 && suggestions[activeIndex]) {
              handleSelect(suggestions[activeIndex]);
            }
            break;
          case 'Escape':
            e.preventDefault();
            setIsOpen(false);
            break;
        }
      },
      [isOpen, suggestions, activeIndex, handleSelect]
    );

    const showDropdown =
      isOpen && (suggestions.length > 0 || (Boolean(value) && !isLoading));
    const groupedSuggestions = groupByCategory(suggestions);

    let itemIndex = 0;

    return (
      <Container ref={containerRef}>
        <InputWrapper>
          <SearchIcon>
            <SearchIconSvg />
          </SearchIcon>
          <Input
            ref={(node) => {
              if (typeof ref === 'function') {
                ref(node);
              } else if (ref) {
                ref.current = node;
              }
              (
                inputRef as React.MutableRefObject<HTMLInputElement | null>
              ).current = node;
            }}
            type="text"
            value={value}
            onChange={handleChange}
            onFocus={handleFocus}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            autoFocus={autoFocus}
            aria-label="Search"
            aria-expanded={showDropdown}
            aria-autocomplete="list"
            role="combobox"
          />
          {isLoading && <Spinner />}
          {!isLoading && value && showClearButton && (
            <ClearButton onClick={handleClear} aria-label="Clear search">
              <svg
                width="14"
                height="14"
                viewBox="0 0 14 14"
                fill="none"
                stroke="currentColor"
                strokeWidth="2"
              >
                <path d="M10.5 3.5L3.5 10.5M3.5 3.5l7 7" />
              </svg>
            </ClearButton>
          )}
        </InputWrapper>

        {showDropdown && (
          <Dropdown>
            <SuggestionList role="listbox">
              {suggestions.length === 0 ? (
                <EmptyState>No results found</EmptyState>
              ) : (
                Array.from(groupedSuggestions.entries()).map(
                  ([category, items]) => (
                    <div key={category}>
                      <Category>{category}</Category>
                      {items.map((suggestion) => {
                        const currentIndex = itemIndex++;
                        return (
                          <SuggestionItem
                            key={suggestion.id}
                            $isActive={currentIndex === activeIndex}
                            onClick={() => handleSelect(suggestion)}
                            onMouseEnter={() => setActiveIndex(currentIndex)}
                            role="option"
                            aria-selected={currentIndex === activeIndex}
                          >
                            {suggestion.icon && (
                              <SuggestionIcon>{suggestion.icon}</SuggestionIcon>
                            )}
                            <SuggestionContent>
                              <SuggestionLabel>
                                {suggestion.label}
                              </SuggestionLabel>
                              {suggestion.description && (
                                <SuggestionDescription>
                                  {suggestion.description}
                                </SuggestionDescription>
                              )}
                            </SuggestionContent>
                          </SuggestionItem>
                        );
                      })}
                    </div>
                  )
                )
              )}
            </SuggestionList>
          </Dropdown>
        )}
      </Container>
    );
  }
);

SearchInput.displayName = 'SearchInput';

export default SearchInput;
