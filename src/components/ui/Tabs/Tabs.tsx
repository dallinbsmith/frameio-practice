'use client';

import { createContext, useContext, useState, useId } from 'react';
import styled from 'styled-components';

import type { ReactNode } from 'react';

type TabsContextValue = {
  activeTab: string;
  setActiveTab: (value: string) => void;
  baseId: string;
};

const TabsContext = createContext<TabsContextValue | null>(null);

const useTabsContext = () => {
  const context = useContext(TabsContext);
  if (!context) {
    throw new Error('Tabs compound components must be used within Tabs');
  }
  return context;
};

type TabsProps = {
  defaultValue: string;
  children: ReactNode;
  onChange?: (value: string) => void;
};

type TabsListProps = {
  children: ReactNode;
};

type TabsTriggerProps = {
  value: string;
  children: ReactNode;
  disabled?: boolean;
};

type TabsContentProps = {
  value: string;
  children: ReactNode;
};

const TabsRoot = styled.div`
  width: 100%;
`;

const TabsListWrapper = styled.div`
  display: flex;
  gap: var(--spacing-1);
  border-bottom: 1px solid var(--color-border-subtle);
  margin-bottom: var(--spacing-6);
  overflow-x: auto;
  scrollbar-width: none;

  &::-webkit-scrollbar {
    display: none;
  }
`;

const TabButton = styled.button<{ $active: boolean; $disabled: boolean }>`
  position: relative;
  padding: var(--spacing-3) var(--spacing-4);
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: ${({ $active }) =>
    $active ? 'var(--color-fg-primary)' : 'var(--color-fg-secondary)'};
  background: transparent;
  border: none;
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  opacity: ${({ $disabled }) => ($disabled ? 0.5 : 1)};
  transition: var(--transition-colors);
  white-space: nowrap;

  &::after {
    content: '';
    position: absolute;
    bottom: -1px;
    left: 0;
    right: 0;
    height: 2px;
    background-color: var(--color-interactive-primary);
    transform: scaleX(${({ $active }) => ($active ? 1 : 0)});
    transition: transform var(--duration-fast) var(--ease-out-expo);
  }

  &:hover:not(:disabled) {
    color: var(--color-fg-primary);
  }

  &:focus-visible {
    outline: none;
    box-shadow: var(--shadow-focus);
    border-radius: var(--radius-sm);
  }
`;

const TabPanel = styled.div<{ $active: boolean }>`
  display: ${({ $active }) => ($active ? 'block' : 'none')};
  animation: ${({ $active }) =>
    $active ? 'fadeIn var(--duration-normal) var(--ease-default)' : 'none'};

  @keyframes fadeIn {
    from {
      opacity: 0;
    }
    to {
      opacity: 1;
    }
  }
`;

export const Tabs = ({ defaultValue, children, onChange }: TabsProps) => {
  const [activeTab, setActiveTabState] = useState(defaultValue);
  const baseId = useId();

  const setActiveTab = (value: string) => {
    setActiveTabState(value);
    onChange?.(value);
  };

  return (
    <TabsContext.Provider value={{ activeTab, setActiveTab, baseId }}>
      <TabsRoot>{children}</TabsRoot>
    </TabsContext.Provider>
  );
};

export const TabsList = ({ children }: TabsListProps) => {
  return <TabsListWrapper role="tablist">{children}</TabsListWrapper>;
};

export const TabsTrigger = ({
  value,
  children,
  disabled = false,
}: TabsTriggerProps) => {
  const { activeTab, setActiveTab, baseId } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <TabButton
      role="tab"
      id={`${baseId}-tab-${value}`}
      aria-selected={isActive}
      aria-controls={`${baseId}-panel-${value}`}
      tabIndex={isActive ? 0 : -1}
      $active={isActive}
      $disabled={disabled}
      disabled={disabled}
      onClick={() => !disabled && setActiveTab(value)}
    >
      {children}
    </TabButton>
  );
};

export const TabsContent = ({ value, children }: TabsContentProps) => {
  const { activeTab, baseId } = useTabsContext();
  const isActive = activeTab === value;

  return (
    <TabPanel
      role="tabpanel"
      id={`${baseId}-panel-${value}`}
      aria-labelledby={`${baseId}-tab-${value}`}
      $active={isActive}
      hidden={!isActive}
    >
      {children}
    </TabPanel>
  );
};

Tabs.List = TabsList;
Tabs.Trigger = TabsTrigger;
Tabs.Content = TabsContent;

export default Tabs;
