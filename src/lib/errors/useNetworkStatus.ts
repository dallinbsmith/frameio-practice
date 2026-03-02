'use client';

import { useCallback, useEffect, useMemo, useState } from 'react';

import type { NetworkStatus } from './types';

type NetworkConnection = {
  effectiveType?: 'slow-2g' | '2g' | '3g' | '4g';
  downlink?: number;
  rtt?: number;
  saveData?: boolean;
  addEventListener?: (type: string, listener: () => void) => void;
  removeEventListener?: (type: string, listener: () => void) => void;
};

const getNavigatorConnection = (): NetworkConnection | undefined => {
  if (typeof navigator === 'undefined') return undefined;

  return (
    (navigator as Navigator & { connection?: NetworkConnection }).connection ??
    (navigator as Navigator & { mozConnection?: NetworkConnection })
      .mozConnection ??
    (navigator as Navigator & { webkitConnection?: NetworkConnection })
      .webkitConnection
  );
};

const getNetworkInfo = (): NetworkStatus => {
  if (typeof navigator === 'undefined') {
    return { isOnline: true };
  }

  const connection = getNavigatorConnection();

  return {
    isOnline: navigator.onLine,
    effectiveType: connection?.effectiveType,
    downlink: connection?.downlink,
    rtt: connection?.rtt,
    saveData: connection?.saveData,
  };
};

export const useNetworkStatus = (): NetworkStatus => {
  const [status, setStatus] = useState<NetworkStatus>(getNetworkInfo);

  const handleChange = useCallback(() => {
    setStatus(getNetworkInfo());
  }, []);

  useEffect(() => {
    if (typeof window === 'undefined') return;

    window.addEventListener('online', handleChange);
    window.addEventListener('offline', handleChange);

    const connection = getNavigatorConnection();
    connection?.addEventListener?.('change', handleChange);

    return () => {
      window.removeEventListener('online', handleChange);
      window.removeEventListener('offline', handleChange);
      connection?.removeEventListener?.('change', handleChange);
    };
  }, [handleChange]);

  return status;
};

export const useIsOnline = (): boolean => {
  const { isOnline } = useNetworkStatus();
  return isOnline;
};

export const useIsSlowConnection = (threshold: '2g' | '3g' = '3g'): boolean => {
  const { effectiveType, saveData } = useNetworkStatus();

  return useMemo(() => {
    if (saveData) return true;
    if (!effectiveType) return false;

    const speedOrder = ['slow-2g', '2g', '3g', '4g'];
    const thresholdIndex = speedOrder.indexOf(threshold);
    const currentIndex = speedOrder.indexOf(effectiveType);

    return currentIndex <= thresholdIndex;
  }, [effectiveType, saveData, threshold]);
};

export type UseOnlineCallbackOptions = {
  immediate?: boolean;
};

export const useOnlineCallback = (
  callback: () => void,
  options: UseOnlineCallbackOptions = {}
): void => {
  const { immediate = true } = options;
  const { isOnline } = useNetworkStatus();
  const wasOfflineRef = { current: false };

  useEffect(() => {
    if (!isOnline) {
      wasOfflineRef.current = true;
      return;
    }

    if (wasOfflineRef.current || immediate) {
      callback();
      wasOfflineRef.current = false;
    }
  }, [isOnline, callback, immediate]);
};
