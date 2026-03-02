'use client';

import { useMemo } from 'react';
import { createPortal } from 'react-dom';
import styled, { keyframes } from 'styled-components';

import { useLockBodyScroll } from '@/hooks';

import { useKeyboardShortcuts } from './context';

import type { KeyboardShortcut, ShortcutGroup } from './types';

const fadeIn = keyframes`
  from { opacity: 0; }
  to { opacity: 1; }
`;

const slideIn = keyframes`
  from {
    opacity: 0;
    transform: scale(0.95);
  }
  to {
    opacity: 1;
    transform: scale(1);
  }
`;

const Overlay = styled.div`
  position: fixed;
  inset: 0;
  z-index: var(--z-modal);
  display: flex;
  align-items: center;
  justify-content: center;
  padding: var(--spacing-4);
  background-color: rgba(0, 0, 0, 0.6);
  backdrop-filter: blur(4px);
  animation: ${fadeIn} var(--duration-fast) var(--ease-default);
`;

const Dialog = styled.div`
  width: 100%;
  max-width: 600px;
  max-height: calc(100vh - var(--spacing-8));
  background-color: var(--color-bg-elevated);
  border-radius: var(--radius-xl);
  box-shadow: var(--shadow-xl);
  overflow: hidden;
  animation: ${slideIn} var(--duration-normal) var(--ease-out-expo);
`;

const Header = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-4) var(--spacing-6);
  border-bottom: 1px solid var(--color-border-subtle);
`;

const Title = styled.h2`
  font-size: var(--text-heading-sm-size);
  font-weight: var(--font-weight-semibold);
  color: var(--color-fg-primary);
`;

const CloseButton = styled.button`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 32px;
  height: 32px;
  border: none;
  background: transparent;
  color: var(--color-fg-tertiary);
  cursor: pointer;
  border-radius: var(--radius-md);
  transition: var(--transition-interactive);

  &:hover {
    background-color: var(--color-bg-surface-hover);
    color: var(--color-fg-primary);
  }
`;

const Content = styled.div`
  padding: var(--spacing-4) var(--spacing-6);
  overflow-y: auto;
  max-height: calc(100vh - 200px);
`;

const Group = styled.div`
  &:not(:last-child) {
    margin-bottom: var(--spacing-6);
  }
`;

const GroupTitle = styled.h3`
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-semibold);
  color: var(--color-fg-tertiary);
  text-transform: uppercase;
  letter-spacing: 0.05em;
  margin-bottom: var(--spacing-3);
`;

const ShortcutList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
`;

const ShortcutItem = styled.div`
  display: flex;
  align-items: center;
  justify-content: space-between;
  padding: var(--spacing-2) 0;
`;

const ShortcutDescription = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-fg-primary);
`;

const ShortcutKeys = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
`;

const Key = styled.kbd`
  display: inline-flex;
  align-items: center;
  justify-content: center;
  min-width: 24px;
  height: 24px;
  padding: 0 var(--spacing-2);
  font-family: var(--font-mono);
  font-size: var(--font-size-xs);
  font-weight: var(--font-weight-medium);
  color: var(--color-fg-secondary);
  background-color: var(--color-bg-surface);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-sm);
  box-shadow: 0 1px 0 var(--color-border-default);
`;

const Plus = styled.span`
  font-size: var(--font-size-xs);
  color: var(--color-fg-tertiary);
`;

const Footer = styled.div`
  padding: var(--spacing-3) var(--spacing-6);
  border-top: 1px solid var(--color-border-subtle);
  background-color: var(--color-bg-secondary);
  font-size: var(--font-size-xs);
  color: var(--color-fg-tertiary);
  text-align: center;
`;

const isMac = () =>
  typeof navigator !== 'undefined' &&
  navigator.platform.toUpperCase().indexOf('MAC') >= 0;

const formatKey = (key: string): string => {
  const keyMap: Record<string, string> = {
    ArrowUp: '↑',
    ArrowDown: '↓',
    ArrowLeft: '←',
    ArrowRight: '→',
    Enter: '↵',
    Escape: 'Esc',
    ' ': 'Space',
    Backspace: '⌫',
    Delete: 'Del',
    Tab: '⇥',
  };

  return keyMap[key] ?? key.toUpperCase();
};

const formatShortcut = (shortcut: KeyboardShortcut): string[] => {
  const keys: string[] = [];
  const { modifiers = {} } = shortcut;
  const mac = isMac();

  if (modifiers.ctrl) {
    keys.push(mac ? '⌘' : 'Ctrl');
  }
  if (modifiers.meta && !mac) {
    keys.push('Win');
  }
  if (modifiers.alt) {
    keys.push(mac ? '⌥' : 'Alt');
  }
  if (modifiers.shift) {
    keys.push(mac ? '⇧' : 'Shift');
  }

  keys.push(formatKey(shortcut.key));

  return keys;
};

const groupShortcuts = (shortcuts: KeyboardShortcut[]): ShortcutGroup[] => {
  const grouped = new Map<string, KeyboardShortcut[]>();

  shortcuts.forEach((shortcut) => {
    const category = shortcut.category ?? 'General';
    const existing = grouped.get(category) ?? [];
    grouped.set(category, [...existing, shortcut]);
  });

  return Array.from(grouped.entries()).map(([category, items]) => ({
    category,
    shortcuts: items,
  }));
};

export const KeyboardShortcutsHelp = () => {
  const { shortcuts, isHelpOpen, closeHelp } = useKeyboardShortcuts();

  useLockBodyScroll(isHelpOpen);

  const groups = useMemo(
    () => groupShortcuts(shortcuts.filter((s) => s.id !== 'help')),
    [shortcuts]
  );

  if (!isHelpOpen) return null;

  if (typeof document === 'undefined') return null;

  return createPortal(
    <Overlay onClick={closeHelp}>
      <Dialog
        onClick={(e) => e.stopPropagation()}
        role="dialog"
        aria-modal="true"
        aria-labelledby="shortcuts-title"
      >
        <Header>
          <Title id="shortcuts-title">Keyboard Shortcuts</Title>
          <CloseButton onClick={closeHelp} aria-label="Close">
            <svg
              width="18"
              height="18"
              viewBox="0 0 18 18"
              fill="none"
              stroke="currentColor"
              strokeWidth="2"
            >
              <path d="M13.5 4.5L4.5 13.5M4.5 4.5l9 9" />
            </svg>
          </CloseButton>
        </Header>
        <Content>
          {groups.map((group) => (
            <Group key={group.category}>
              <GroupTitle>{group.category}</GroupTitle>
              <ShortcutList>
                {group.shortcuts.map((shortcut) => (
                  <ShortcutItem key={shortcut.id}>
                    <ShortcutDescription>
                      {shortcut.description}
                    </ShortcutDescription>
                    <ShortcutKeys>
                      {formatShortcut(shortcut).map((key, i) => (
                        <span key={i}>
                          {i > 0 && <Plus>+</Plus>}
                          <Key>{key}</Key>
                        </span>
                      ))}
                    </ShortcutKeys>
                  </ShortcutItem>
                ))}
              </ShortcutList>
            </Group>
          ))}
        </Content>
        <Footer>
          Press <Key>Shift</Key> <Plus>+</Plus> <Key>?</Key> to toggle this
          dialog
        </Footer>
      </Dialog>
    </Overlay>,
    document.body
  );
};

export default KeyboardShortcutsHelp;
