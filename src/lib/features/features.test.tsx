import { renderHook, act } from '@testing-library/react';
import { describe, it, expect, vi } from 'vitest';

import {
  FeatureFlagsProvider,
  useFeatureFlags,
  useFeatureFlag,
} from './context';

import type { FeatureFlagsConfig } from './types';
import type { ReactNode } from 'react';

const testFlags: FeatureFlagsConfig['flags'] = {
  enabledFlag: {
    key: 'enabledFlag',
    enabled: true,
    description: 'An enabled flag',
  },
  disabledFlag: {
    key: 'disabledFlag',
    enabled: false,
    description: 'A disabled flag',
  },
  percentageFlag: {
    key: 'percentageFlag',
    enabled: true,
    percentage: 50,
  },
  userSpecificFlag: {
    key: 'userSpecificFlag',
    enabled: true,
    enabledFor: ['user-123', 'user-456'],
  },
};

const createWrapper = (config: FeatureFlagsConfig) => {
  const Wrapper = ({ children }: { children: ReactNode }) => (
    <FeatureFlagsProvider config={config}>{children}</FeatureFlagsProvider>
  );
  return Wrapper;
};

describe('useFeatureFlags', () => {
  it('returns true for enabled flags', () => {
    const wrapper = createWrapper({ flags: testFlags });
    const { result } = renderHook(() => useFeatureFlags(), { wrapper });

    expect(result.current.isEnabled('enabledFlag')).toBe(true);
  });

  it('returns false for disabled flags', () => {
    const wrapper = createWrapper({ flags: testFlags });
    const { result } = renderHook(() => useFeatureFlags(), { wrapper });

    expect(result.current.isEnabled('disabledFlag')).toBe(false);
  });

  it('returns false for non-existent flags', () => {
    const wrapper = createWrapper({ flags: testFlags });
    const { result } = renderHook(() => useFeatureFlags(), { wrapper });

    expect(result.current.isEnabled('nonExistentFlag')).toBe(false);
  });

  it('returns flag details with getFlag', () => {
    const wrapper = createWrapper({ flags: testFlags });
    const { result } = renderHook(() => useFeatureFlags(), { wrapper });

    const flag = result.current.getFlag('enabledFlag');
    expect(flag).toEqual(testFlags['enabledFlag']);
  });

  it('returns all flags with getAllFlags', () => {
    const wrapper = createWrapper({ flags: testFlags });
    const { result } = renderHook(() => useFeatureFlags(), { wrapper });

    expect(result.current.getAllFlags()).toEqual(testFlags);
  });

  it('allows setting overrides', () => {
    const wrapper = createWrapper({ flags: testFlags });
    const { result } = renderHook(() => useFeatureFlags(), { wrapper });

    expect(result.current.isEnabled('disabledFlag')).toBe(false);

    act(() => {
      result.current.setOverride('disabledFlag', true);
    });

    expect(result.current.isEnabled('disabledFlag')).toBe(true);
  });

  it('allows clearing overrides', () => {
    const wrapper = createWrapper({ flags: testFlags });
    const { result } = renderHook(() => useFeatureFlags(), { wrapper });

    act(() => {
      result.current.setOverride('disabledFlag', true);
    });

    expect(result.current.isEnabled('disabledFlag')).toBe(true);

    act(() => {
      result.current.clearOverrides();
    });

    expect(result.current.isEnabled('disabledFlag')).toBe(false);
  });

  it('respects user-specific flags', () => {
    const wrapperWithUser = createWrapper({
      flags: testFlags,
      userId: 'user-123',
    });

    const { result: resultWithUser } = renderHook(() => useFeatureFlags(), {
      wrapper: wrapperWithUser,
    });

    expect(resultWithUser.current.isEnabled('userSpecificFlag')).toBe(true);

    const wrapperWithOtherUser = createWrapper({
      flags: testFlags,
      userId: 'user-999',
    });

    const { result: resultWithOtherUser } = renderHook(
      () => useFeatureFlags(),
      {
        wrapper: wrapperWithOtherUser,
      }
    );

    expect(resultWithOtherUser.current.isEnabled('userSpecificFlag')).toBe(
      false
    );
  });

  it('throws error when used outside provider', () => {
    const consoleSpy = vi.spyOn(console, 'error').mockImplementation(() => {});

    expect(() => {
      renderHook(() => useFeatureFlags());
    }).toThrow('useFeatureFlags must be used within a FeatureFlagsProvider');

    consoleSpy.mockRestore();
  });
});

describe('useFeatureFlag', () => {
  it('returns boolean for specific flag', () => {
    const wrapper = createWrapper({ flags: testFlags });
    const { result } = renderHook(() => useFeatureFlag('enabledFlag'), {
      wrapper,
    });

    expect(result.current).toBe(true);
  });
});
