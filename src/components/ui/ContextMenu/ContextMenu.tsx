'use client';

import { useCallback, useEffect, useRef, useState } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';

import type { ContextMenuItem, ContextMenuProps } from './types';

const fadeIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const Menu = styled.div<{ $x: number; $y: number }>`
  position: fixed;
  top: ${({ $y }) => $y}px;
  left: ${({ $x }) => $x}px;
  z-index: var(--z-popover);
  min-width: 180px;
  max-width: 280px;
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  padding: var(--spacing-1) 0;
  animation: ${fadeIn} var(--duration-fast) var(--ease-out-expo);
`;

const MenuItem = styled.button<{ $danger?: boolean; $isActive?: boolean }>`
  display: flex;
  align-items: center;
  width: 100%;
  padding: var(--spacing-2) var(--spacing-3);
  border: none;
  background-color: ${({ $isActive }) =>
    $isActive ? 'var(--color-bg-surface-hover)' : 'transparent'};
  cursor: pointer;
  transition: background-color var(--duration-fast) var(--ease-default);
  text-align: left;
  color: ${({ $danger }) =>
    $danger ? 'var(--color-status-error)' : 'var(--color-fg-primary)'};

  &:hover:not(:disabled) {
    background-color: var(--color-bg-surface-hover);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const ItemIcon = styled.div`
  flex-shrink: 0;
  width: 16px;
  height: 16px;
  margin-right: var(--spacing-2);
  display: flex;
  align-items: center;
  justify-content: center;

  svg {
    width: 16px;
    height: 16px;
  }
`;

const ItemLabel = styled.span`
  flex: 1;
  font-size: var(--font-size-sm);
`;

const ItemShortcut = styled.span`
  font-size: var(--font-size-xs);
  color: var(--color-fg-tertiary);
  margin-left: var(--spacing-3);
`;

const Separator = styled.div`
  height: 1px;
  background-color: var(--color-border-subtle);
  margin: var(--spacing-1) 0;
`;

const Label = styled.div`
  padding: var(--spacing-2) var(--spacing-3);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-fg-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
`;

const formatShortcut = (shortcut: string[]): string => {
  return shortcut.join(' + ');
};

export const ContextMenu = ({ items, position, onClose }: ContextMenuProps) => {
  const menuRef = useRef<HTMLDivElement>(null);
  const [activeIndex, setActiveIndex] = useState(-1);
  const [adjustedPosition, setAdjustedPosition] = useState(position);

  const actionItems = items.filter(
    (item): item is Extract<ContextMenuItem, { type: 'item' }> =>
      item.type === 'item'
  );

  useEffect(() => {
    if (position && menuRef.current) {
      const menu = menuRef.current;
      const rect = menu.getBoundingClientRect();
      const viewportWidth = window.innerWidth;
      const viewportHeight = window.innerHeight;

      let x = position.x;
      let y = position.y;

      if (x + rect.width > viewportWidth) {
        x = viewportWidth - rect.width - 8;
      }

      if (y + rect.height > viewportHeight) {
        y = viewportHeight - rect.height - 8;
      }

      setAdjustedPosition({ x: Math.max(8, x), y: Math.max(8, y) });
    }
  }, [position]);

  useEffect(() => {
    if (!position) return;

    const handleClickOutside = (e: MouseEvent) => {
      if (menuRef.current && !menuRef.current.contains(e.target as Node)) {
        onClose();
      }
    };

    const handleEscape = (e: KeyboardEvent) => {
      if (e.key === 'Escape') {
        onClose();
      }
    };

    const handleScroll = () => {
      onClose();
    };

    document.addEventListener('mousedown', handleClickOutside);
    document.addEventListener('keydown', handleEscape);
    window.addEventListener('scroll', handleScroll, true);

    return () => {
      document.removeEventListener('mousedown', handleClickOutside);
      document.removeEventListener('keydown', handleEscape);
      window.removeEventListener('scroll', handleScroll, true);
    };
  }, [position, onClose]);

  const handleKeyDown = useCallback(
    (e: React.KeyboardEvent) => {
      switch (e.key) {
        case 'ArrowDown':
          e.preventDefault();
          setActiveIndex((prev) =>
            prev < actionItems.length - 1 ? prev + 1 : 0
          );
          break;
        case 'ArrowUp':
          e.preventDefault();
          setActiveIndex((prev) =>
            prev > 0 ? prev - 1 : actionItems.length - 1
          );
          break;
        case 'Enter':
          e.preventDefault();
          const activeItem = actionItems[activeIndex];
          if (activeItem && !activeItem.disabled) {
            activeItem.action();
            onClose();
          }
          break;
      }
    },
    [actionItems, activeIndex, onClose]
  );

  const handleItemClick = useCallback(
    (item: Extract<ContextMenuItem, { type: 'item' }>) => {
      if (!item.disabled) {
        item.action();
        onClose();
      }
    },
    [onClose]
  );

  if (!position || !adjustedPosition) return null;

  if (typeof document === 'undefined') return null;

  let actionIndex = 0;

  return createPortal(
    <Menu
      ref={menuRef}
      $x={adjustedPosition.x}
      $y={adjustedPosition.y}
      role="menu"
      onKeyDown={handleKeyDown}
      tabIndex={-1}
    >
      {items.map((item, index) => {
        if (item.type === 'separator') {
          return <Separator key={`sep-${index}`} />;
        }

        if (item.type === 'label') {
          return <Label key={`label-${index}`}>{item.label}</Label>;
        }

        const currentActionIndex = actionIndex++;
        return (
          <MenuItem
            key={item.id}
            $danger={item.danger ?? false}
            $isActive={currentActionIndex === activeIndex}
            onClick={() => handleItemClick(item)}
            disabled={item.disabled ?? false}
            role="menuitem"
            onMouseEnter={() => setActiveIndex(currentActionIndex)}
          >
            {item.icon && <ItemIcon>{item.icon}</ItemIcon>}
            <ItemLabel>{item.label}</ItemLabel>
            {item.shortcut && (
              <ItemShortcut>{formatShortcut(item.shortcut)}</ItemShortcut>
            )}
          </MenuItem>
        );
      })}
    </Menu>,
    document.body
  );
};

export default ContextMenu;
