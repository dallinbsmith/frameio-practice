'use client';

import { useCallback, useEffect, useMemo, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';

import { useDebounce, useLockBodyScroll } from '@/hooks';

import type { CommandItem, CommandPaletteProps } from './types';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95) translateY(-10px);
  }
  to {
    opacity: 1;
    transform: scale(1) translateY(0);
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: flex-start;
  justify-content: center;
  padding-top: 15vh;
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  animation: ${fadeIn} var(--duration-fast) var(--ease-default);
`;

const Container = styled.div`
  width: 100%;
  max-width: 560px;
  background-color: var(--color-bg-elevated);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  animation: ${slideIn} var(--duration-normal) var(--ease-out-expo);
`;

const SearchContainer = styled.div`
  display: flex;
  align-items: center;
  padding: var(--spacing-4);
  border-bottom: 1px solid var(--color-border-subtle);
`;

const SearchIcon = styled.div`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-right: var(--spacing-3);
  color: var(--color-fg-tertiary);
`;

const SearchInput = styled.input`
  flex: 1;
  border: none;
  background: transparent;
  font-size: var(--font-size-base);
  color: var(--color-fg-primary);
  outline: none;

  &::placeholder {
    color: var(--color-fg-tertiary);
  }
`;

const ResultsContainer = styled.div`
  max-height: 400px;
  overflow-y: auto;
`;

const GroupLabel = styled.div`
  padding: var(--spacing-2) var(--spacing-4);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-fg-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  background-color: var(--color-bg-secondary);
`;

const ItemList = styled.div`
  padding: var(--spacing-2) 0;
`;

const Item = styled.button<{ $isActive: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  border: none;
  background-color: ${({ $isActive }) =>
    $isActive ? 'var(--color-bg-surface-hover)' : 'transparent'};
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-default);
  text-align: left;

  &:hover {
    background-color: var(--color-bg-surface-hover);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ItemIcon = styled.div`
  flex-shrink: 0;
  width: 20px;
  height: 20px;
  margin-right: var(--spacing-3);
  color: var(--color-fg-secondary);
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 18px;
    height: 18px;
  }
`;

const ItemContent = styled.div`
  flex: 1;
  min-width: 0;
`;

const ItemLabel = styled.div`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-fg-primary);
`;

const ItemDescription = styled.div`
  font-size: var(--font-size-xs);
  color: var(--color-fg-tertiary);
  margin-top: 2px;
`;

const ItemShortcut = styled.div`
  display: flex;
  gap: var(--spacing-1);
  margin-left: var(--spacing-3);
`;

const ShortcutKey = styled.kbd`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 22px;
  height: 22px;
  padding: 0 var(--spacing-1);
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-fg-secondary);
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-sm);
`;

const EmptyState = styled.div`
  padding: var(--spacing-8);
  text-align: center;
  color: var(--color-fg-tertiary);
  font-size: var(--font-size-sm);
`;

const Footer = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-3) var(--spacing-4);
  border-top: 1px solid var(--color-border-subtle);
  background-color: var(--color-bg-secondary);
`;

const FooterHint = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-4);
  font-size: var(--font-size-xs);
  color: var(--color-fg-tertiary);
`;

const HintItem = styled.span`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
`;

const filterItems = (items: CommandItem[], query: string): CommandItem[] => {
  if (!query) return items;

  const lowerQuery = query.toLowerCase();

  return items.filter((item) => {
    const labelMatch = item.label.toLowerCase().includes(lowerQuery);
    const descMatch = item.description?.toLowerCase().includes(lowerQuery);
    const keywordMatch = item.keywords?.some((k) =>
      k.toLowerCase().includes(lowerQuery)
    );

    return labelMatch || descMatch || keywordMatch;
  });
};

const groupItems = (
  items: CommandItem[],
  recentIds: string[] = []
): { group: string; items: CommandItem[] }[] => {
  const recent = items.filter((item) => recentIds.includes(item.id));
  const byGroup = new Map<string, CommandItem[]>();

  items.forEach((item) => {
    if (recentIds.includes(item.id)) return;
    const group = item.group ?? 'Actions';
    const existing = byGroup.get(group) ?? [];
    byGroup.set(group, [...existing, item]);
  });

  const groups: { group: string; items: CommandItem[] }[] = [];

  if (recent.length > 0) {
    groups.push({ group: 'Recent', items: recent });
  }

  byGroup.forEach((groupItems, groupName) => {
    groups.push({ group: groupName, items: groupItems });
  });

  return groups;
};

export const CommandPalette = ({
  isOpen,
  onClose,
  items,
  placeholder = 'Search commands...',
  emptyMessage = 'No results found',
  recentIds = [],
  maxRecentItems = 5,
}: CommandPaletteProps) => {
  const [query, setQuery] = useState('');
  const [activeIndex, setActiveIndex] = useState(0);
  const inputRef = useRef<HTMLInputElement>(null);
  const itemRefs = useRef<Map<number, HTMLButtonElement>>(new Map());

  const debouncedQuery = useDebounce(query, 150);

  useLockBodyScroll(isOpen);

  const filteredItems = useMemo(
    () => filterItems(items, debouncedQuery),
    [items, debouncedQuery]
  );

  const groupedItems = useMemo(
    () => groupItems(filteredItems, recentIds.slice(0, maxRecentItems)),
    [filteredItems, recentIds, maxRecentItems]
  );

  const flatItems = useMemo(
    () => groupedItems.flatMap((g) => g.items),
    [groupedItems]
  );

  useEffect(() => {
    if (isOpen) {
      setQuery('');
      setActiveIndex(0);
      inputRef.current?.focus();
    }
  }, [isOpen]);

  useEffect(() => {
    setActiveIndex(0);
  }, [debouncedQuery]);

  useEffect(() => {
    const activeElement = itemRefs.current.get(activeIndex);
    activeElement?.scrollIntoView({ block: 'nearest' });
  }, [activeIndex]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < flatItems.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : flatItems.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          const activeItem = flatItems[activeIndex];
          if (activeItem && !activeItem.disabled) {
            activeItem.action();
            onClose();
          }
          break;
        case 'Escape':
          e.preventDefault();
          onClose();
          break;
      }
    },
    [flatItems, activeIndex, onClose]
  );

  const handleItemClick = useCallback(
    (item: CommandItem) => {
      if (!item.disabled) {
        item.action();
        onClose();
      }
    },
    [onClose]
  );

  const handleOverlayClick = useCallback(
    (e: React.MouseEvent) => {
      if (e.target === e.currentTarget) {
        onClose();
      }
    },
    [onClose]
  );

  if (!isOpen) return null;

  if (typeof document === 'undefined') return null;

  let itemIndex = 0;

  return createPortal(
    <Overlay onClick={handleOverlayClick}>
      <Container role="dialog" aria-modal="true" aria-label="Command palette">
        <SearchContainer>
          <SearchIcon>
            <svg
              viewBox="0 0 20 20"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
              strokeLinecap="round"
            >
              <circle cx="8.5" cy="8.5" r="5.5" />
              <path d="M12.5 12.5L17 17" />
            </svg>
          </SearchIcon>
          <SearchInput
            ref={inputRef}
            type="text"
            value={query}
            onChange={(e) => setQuery(e.target.value)}
            onKeyDown={handleKeyDown}
            placeholder={placeholder}
            aria-label="Search commands"
          />
        </SearchContainer>

        <ResultsContainer>
          {flatItems.length === 0 ? (
            <EmptyState>{emptyMessage}</EmptyState>
          ) : (
            groupedItems.map((group) => (
              <div key={group.group}>
                <GroupLabel>{group.group}</GroupLabel>
                <ItemList role="listbox">
                  {group.items.map((item) => {
                    const currentIndex = itemIndex++;
                    return (
                      <Item
                        key={item.id}
                        ref={(el) => {
                          if (el) itemRefs.current.set(currentIndex, el);
                        }}
                        $isActive={currentIndex === activeIndex}
                        onClick={() => handleItemClick(item)}
                        disabled={item.disabled}
                        role="option"
                        aria-selected={currentIndex === activeIndex}
                      >
                        {item.icon && <ItemIcon>{item.icon}</ItemIcon>}
                        <ItemContent>
                          <ItemLabel>{item.label}</ItemLabel>
                          {item.description && (
                            <ItemDescription>
                              {item.description}
                            </ItemDescription>
                          )}
                        </ItemContent>
                        {item.shortcut && (
                          <ItemShortcut>
                            {item.shortcut.map((key, i) => (
                              <ShortcutKey key={i}>{key}</ShortcutKey>
                            ))}
                          </ItemShortcut>
                        )}
                      </Item>
                    );
                  })}
                </ItemList>
              </div>
            ))
          )}
        </ResultsContainer>

        <Footer>
          <FooterHint>
            <HintItem>
              <ShortcutKey>↑↓</ShortcutKey> Navigate
            </HintItem>
            <HintItem>
              <ShortcutKey>↵</ShortcutKey> Select
            </HintItem>
            <HintItem>
              <ShortcutKey>Esc</ShortcutKey> Close
            </HintItem>
          </FooterHint>
        </Footer>
      </Container>
    </Overlay>,
    document.body
  );
};

export default CommandPalette;
