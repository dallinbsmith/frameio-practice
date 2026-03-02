'use client';

import { useState, useRef, useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';

import { useClickOutside, useKeyPress } from '@/hooks';

import type { ReactNode } from 'react';

type DropdownAlign = 'left' | 'right' | 'center';

type DropdownItem = {
  label: string;
  value: string;
  icon?: ReactNode;
  disabled?: boolean;
  divider?: boolean;
};

type DropdownProps = {
  trigger: ReactNode;
  items: DropdownItem[];
  onSelect: (value: string) => void;
  align?: DropdownAlign;
  disabled?: boolean;
};

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: translateY(-8px);
  }
  to {
    opacity: 1;
    transform: translateY(0);
  }
`;

const Container = styled.div`
  position: relative;
  display: inline-block;
`;

const Trigger = styled.div<{ $disabled: boolean }>`
  ${({ $disabled }) =>
    $disabled &&
    css`
      opacity: 0.5;
      pointer-events: none;
    `}
`;

const alignStyles = {
  left: css`
    left: 0;
  `,
  right: css`
    right: 0;
  `,
  center: css`
    left: 50%;
    transform: translateX(-50%);
  `,
};

const Menu = styled.div<{ $align: DropdownAlign }>`
  position: absolute;
  top: calc(100% + var(--spacing-2));
  z-index: var(--z-dropdown);
  min-width: 200px;
  padding: var(--spacing-2);
  background-color: var(--color-bg-elevated);
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-lg);
  box-shadow: var(--shadow-lg);
  animation: ${slideIn} var(--duration-fast) var(--ease-out-expo);

  ${({ $align }) => alignStyles[$align]}
`;

const MenuItem = styled.button<{ $disabled: boolean }>`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  width: 100%;
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-sm);
  color: var(--color-fg-primary);
  background: transparent;
  border: none;
  border-radius: var(--radius-md);
  cursor: pointer;
  text-align: left;
  transition: var(--transition-interactive);

  &:hover:not(:disabled) {
    background-color: var(--color-bg-surface-hover);
  }

  &:focus-visible {
    outline: none;
    background-color: var(--color-bg-surface-hover);
  }

  ${({ $disabled }) =>
    $disabled &&
    css`
      opacity: 0.5;
      cursor: not-allowed;
    `}
`;

const IconWrapper = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 20px;
  height: 20px;
  color: var(--color-fg-secondary);
`;

const Divider = styled.div`
  height: 1px;
  margin: var(--spacing-2) 0;
  background-color: var(--color-border-subtle);
`;

export const Dropdown = ({
  trigger,
  items,
  onSelect,
  align = 'left',
  disabled = false,
}: DropdownProps) => {
  const [isOpen, setIsOpen] = useState(false);
  const [focusedIndex, setFocusedIndex] = useState(-1);
  const menuRef = useRef<HTMLDivElement>(null);

  const containerRef = useClickOutside<HTMLDivElement>(() => {
    setIsOpen(false);
  }, isOpen);

  useKeyPress('Escape', () => setIsOpen(false), { enabled: isOpen });

  useKeyPress(
    ['ArrowDown', 'ArrowUp'],
    (e) => {
      e.preventDefault();
      const selectableItems = items.filter(
        (item) => !item.divider && !item.disabled
      );
      const currentIndex = selectableItems.findIndex(
        (item) => items.indexOf(item) === focusedIndex
      );

      if (e.key === 'ArrowDown') {
        const nextIndex =
          currentIndex < selectableItems.length - 1 ? currentIndex + 1 : 0;
        const nextItem = selectableItems[nextIndex];
        if (nextItem) {
          setFocusedIndex(items.indexOf(nextItem));
        }
      } else {
        const prevIndex =
          currentIndex > 0 ? currentIndex - 1 : selectableItems.length - 1;
        const prevItem = selectableItems[prevIndex];
        if (prevItem) {
          setFocusedIndex(items.indexOf(prevItem));
        }
      }
    },
    { enabled: isOpen }
  );

  useKeyPress(
    'Enter',
    () => {
      const focusedItem = items[focusedIndex];
      if (
        focusedIndex >= 0 &&
        focusedItem &&
        !focusedItem.disabled &&
        !focusedItem.divider
      ) {
        handleSelect(focusedItem.value);
      }
    },
    { enabled: isOpen }
  );

  useEffect(() => {
    if (!isOpen) setFocusedIndex(-1);
  }, [isOpen]);

  const handleSelect = (value: string) => {
    onSelect(value);
    setIsOpen(false);
  };

  return (
    <Container ref={containerRef}>
      <Trigger
        $disabled={disabled}
        onClick={() => !disabled && setIsOpen(!isOpen)}
        role="button"
        aria-haspopup="listbox"
        aria-expanded={isOpen}
      >
        {trigger}
      </Trigger>

      {isOpen && (
        <Menu ref={menuRef} $align={align} role="listbox">
          {items.map((item, index) =>
            item.divider ? (
              <Divider key={`divider-${index}`} />
            ) : (
              <MenuItem
                key={item.value}
                $disabled={item.disabled ?? false}
                onClick={() => !item.disabled && handleSelect(item.value)}
                role="option"
                aria-selected={focusedIndex === index}
                tabIndex={focusedIndex === index ? 0 : -1}
              >
                {item.icon && <IconWrapper>{item.icon}</IconWrapper>}
                {item.label}
              </MenuItem>
            )
          )}
        </Menu>
      )}
    </Container>
  );
};

export default Dropdown;
