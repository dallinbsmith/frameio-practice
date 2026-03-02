'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useState,
} from 'react';

import type {
  FeatureFlag,
  FeatureFlagsConfig,
  FeatureFlagsContextValue,
} from './types';
import type { ReactNode } from 'react';

const FeatureFlagsContext = createContext<FeatureFlagsContextValue | undefined>(
  undefined
);

const hashString = (str: string): number => {
  let hash = 0;
  for (let i = 0; i < str.length; i++) {
    const char = str.charCodeAt(i);
    hash = (hash << 5) - hash + char;
    hash = hash & hash;
  }
  return Math.abs(hash);
};

const isEnabledForUser = (flag: FeatureFlag, userId?: string): boolean => {
  if (!flag.enabled) return false;

  if (flag.enabledFor && flag.enabledFor.length > 0) {
    if (!userId) return false;
    return flag.enabledFor.includes(userId);
  }

  if (flag.percentage !== undefined && flag.percentage < 100) {
    if (!userId) return false;
    const hash = hashString(`${flag.key}-${userId}`);
    const userPercentage = hash % 100;
    return userPercentage < flag.percentage;
  }

  return true;
};

type FeatureFlagsProviderProps = {
  children: ReactNode;
  config: FeatureFlagsConfig;
};

export const FeatureFlagsProvider = ({
  children,
  config,
}: FeatureFlagsProviderProps) => {
  const [overrides, setOverrides] = useState<Record<string, boolean>>(
    config.overrides ?? {}
  );

  const isEnabled = useCallback(
    (key: string): boolean => {
      if (key in overrides) {
        return overrides[key] ?? false;
      }

      const flag = config.flags[key];
      if (!flag) return false;

      return isEnabledForUser(flag, config.userId);
    },
    [config.flags, config.userId, overrides]
  );

  const getFlag = useCallback(
    (key: string): FeatureFlag | undefined => {
      return config.flags[key];
    },
    [config.flags]
  );

  const getAllFlags = useCallback((): Record<string, FeatureFlag> => {
    return config.flags;
  }, [config.flags]);

  const setOverride = useCallback((key: string, enabled: boolean) => {
    setOverrides((prev) => ({ ...prev, [key]: enabled }));
  }, []);

  const clearOverrides = useCallback(() => {
    setOverrides({});
  }, []);

  const value = useMemo(
    () => ({
      isEnabled,
      getFlag,
      getAllFlags,
      setOverride,
      clearOverrides,
    }),
    [isEnabled, getFlag, getAllFlags, setOverride, clearOverrides]
  );

  return (
    <FeatureFlagsContext.Provider value={value}>
      {children}
    </FeatureFlagsContext.Provider>
  );
};

export const useFeatureFlags = (): FeatureFlagsContextValue => {
  const context = useContext(FeatureFlagsContext);
  if (context === undefined) {
    throw new Error(
      'useFeatureFlags must be used within a FeatureFlagsProvider'
    );
  }
  return context;
};

export const useFeatureFlag = (key: string): boolean => {
  const { isEnabled } = useFeatureFlags();
  return isEnabled(key);
};
