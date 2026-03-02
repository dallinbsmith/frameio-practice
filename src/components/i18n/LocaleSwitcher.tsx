'use client';

import styled from 'styled-components';

import { Dropdown } from '@/components/ui/Dropdown';
import { localeConfigs, useI18n } from '@/lib/i18n';

import type { Locale } from '@/lib/i18n';

const TriggerButton = styled.button`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
  padding: var(--spacing-2) var(--spacing-3);
  background: transparent;
  border: 1px solid var(--color-border-subtle);
  border-radius: var(--radius-md);
  color: var(--color-fg-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: var(--transition-interactive);

  &:hover {
    border-color: var(--color-border-emphasis);
    background-color: var(--color-bg-surface-hover);
  }

  &:focus-visible {
    outline: 2px solid var(--color-interactive-primary);
    outline-offset: 2px;
  }
`;

const GlobeIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <circle cx="12" cy="12" r="10" />
    <path d="M2 12h20" />
    <path d="M12 2a15.3 15.3 0 0 1 4 10 15.3 15.3 0 0 1-4 10 15.3 15.3 0 0 1-4-10 15.3 15.3 0 0 1 4-10z" />
  </svg>
);

const ChevronIcon = () => (
  <svg
    width="12"
    height="12"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
  >
    <path d="M6 9l6 6 6-6" />
  </svg>
);

export const LocaleSwitcher = () => {
  const { setLocale, config } = useI18n();

  const items = Object.values(localeConfigs).map((localeConfig) => ({
    label: `${localeConfig.nativeName} (${localeConfig.code.toUpperCase()})`,
    value: localeConfig.code,
  }));

  const handleSelect = (value: string) => {
    setLocale(value as Locale);
  };

  return (
    <Dropdown
      trigger={
        <TriggerButton aria-label="Change language">
          <GlobeIcon />
          <span>{config.nativeName}</span>
          <ChevronIcon />
        </TriggerButton>
      }
      items={items}
      onSelect={handleSelect}
      align="right"
    />
  );
};

export default LocaleSwitcher;
