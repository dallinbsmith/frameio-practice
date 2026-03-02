import type { BroadcastMessage, SyncOptions } from './types';

const generateTabId = (): string => {
  return `${Date.now()}-${Math.random().toString(36).slice(2, 11)}`;
};

let tabId: string | null = null;

export const getTabId = (): string => {
  if (tabId) return tabId;
  if (typeof window === 'undefined') return 'server';

  tabId = generateTabId();
  return tabId;
};

type StorageEventCallback = (event: StorageEvent) => void;
const storageListeners = new Map<string, Set<StorageEventCallback>>();
let globalStorageListener: ((event: StorageEvent) => void) | null = null;

const ensureGlobalStorageListener = () => {
  if (typeof window === 'undefined' || globalStorageListener) return;

  globalStorageListener = (event: StorageEvent) => {
    if (!event.key) return;

    const listeners = storageListeners.get(event.key);
    if (listeners) {
      listeners.forEach((callback) => callback(event));
    }

    const wildcardListeners = storageListeners.get('*');
    if (wildcardListeners) {
      wildcardListeners.forEach((callback) => callback(event));
    }
  };

  window.addEventListener('storage', globalStorageListener);
};

export const onStorageChange = (
  key: string | '*',
  callback: StorageEventCallback
): (() => void) => {
  ensureGlobalStorageListener();

  if (!storageListeners.has(key)) {
    storageListeners.set(key, new Set());
  }
  storageListeners.get(key)!.add(callback);

  return () => {
    const listeners = storageListeners.get(key);
    if (listeners) {
      listeners.delete(callback);
      if (listeners.size === 0) {
        storageListeners.delete(key);
      }
    }
  };
};

export const createBroadcastChannel = <T = unknown>(channelName: string) => {
  const subscribers = new Set<(message: BroadcastMessage<T>) => void>();
  let channel: BroadcastChannel | null = null;

  const init = () => {
    if (typeof BroadcastChannel === 'undefined' || channel) return;

    channel = new BroadcastChannel(channelName);
    channel.onmessage = (event: MessageEvent<BroadcastMessage<T>>) => {
      if (event.data.tabId !== getTabId()) {
        subscribers.forEach((callback) => callback(event.data));
      }
    };
  };

  const send = (type: string, payload: T): void => {
    init();
    const message: BroadcastMessage<T> = {
      type,
      payload,
      timestamp: Date.now(),
      tabId: getTabId(),
    };

    channel?.postMessage(message);
  };

  const subscribe = (
    callback: (message: BroadcastMessage<T>) => void
  ): (() => void) => {
    init();
    subscribers.add(callback);

    return () => {
      subscribers.delete(callback);
    };
  };

  const close = (): void => {
    channel?.close();
    channel = null;
    subscribers.clear();
  };

  return {
    send,
    subscribe,
    close,
    get isSupported() {
      return typeof BroadcastChannel !== 'undefined';
    },
  };
};

export const createStorageSync = <T>(
  key: string,
  options: SyncOptions = {}
) => {
  const { debounceMs = 0 } = options;
  const subscribers = new Set<
    (value: T | null, source: 'local' | 'remote') => void
  >();
  let debounceTimer: ReturnType<typeof setTimeout> | null = null;

  const unsubscribeStorage = onStorageChange(key, (event) => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }

    const notify = () => {
      const newValue = event.newValue
        ? (JSON.parse(event.newValue) as T)
        : null;
      subscribers.forEach((callback) => callback(newValue, 'remote'));
    };

    if (debounceMs > 0) {
      debounceTimer = setTimeout(notify, debounceMs);
    } else {
      notify();
    }
  });

  const subscribe = (
    callback: (value: T | null, source: 'local' | 'remote') => void
  ): (() => void) => {
    subscribers.add(callback);

    return () => {
      subscribers.delete(callback);
    };
  };

  const notifyLocal = (value: T | null): void => {
    subscribers.forEach((callback) => callback(value, 'local'));
  };

  const destroy = (): void => {
    if (debounceTimer) {
      clearTimeout(debounceTimer);
    }
    unsubscribeStorage();
    subscribers.clear();
  };

  return {
    subscribe,
    notifyLocal,
    destroy,
  };
};

export const createCrossTabLock = (lockName: string) => {
  const lockKey = `__lock__${lockName}`;
  const lockTimeout = 30000;

  type LockInfo = {
    tabId: string;
    timestamp: number;
    expires: number;
  };

  const acquireLock = (): boolean => {
    if (typeof localStorage === 'undefined') return true;

    const now = Date.now();
    const existing = localStorage.getItem(lockKey);

    if (existing) {
      try {
        const lock = JSON.parse(existing) as LockInfo;
        if (lock.expires > now && lock.tabId !== getTabId()) {
          return false;
        }
      } catch {
        // Invalid lock, proceed
      }
    }

    const lock: LockInfo = {
      tabId: getTabId(),
      timestamp: now,
      expires: now + lockTimeout,
    };

    localStorage.setItem(lockKey, JSON.stringify(lock));

    const verification = localStorage.getItem(lockKey);
    if (verification) {
      try {
        const verifiedLock = JSON.parse(verification) as LockInfo;
        return verifiedLock.tabId === getTabId();
      } catch {
        return false;
      }
    }

    return false;
  };

  const releaseLock = (): void => {
    if (typeof localStorage === 'undefined') return;

    const existing = localStorage.getItem(lockKey);
    if (existing) {
      try {
        const lock = JSON.parse(existing) as LockInfo;
        if (lock.tabId === getTabId()) {
          localStorage.removeItem(lockKey);
        }
      } catch {
        // Invalid lock, remove it
        localStorage.removeItem(lockKey);
      }
    }
  };

  const isLocked = (): boolean => {
    if (typeof localStorage === 'undefined') return false;

    const existing = localStorage.getItem(lockKey);
    if (!existing) return false;

    try {
      const lock = JSON.parse(existing) as LockInfo;
      return lock.expires > Date.now();
    } catch {
      return false;
    }
  };

  const isOwnLock = (): boolean => {
    if (typeof localStorage === 'undefined') return false;

    const existing = localStorage.getItem(lockKey);
    if (!existing) return false;

    try {
      const lock = JSON.parse(existing) as LockInfo;
      return lock.tabId === getTabId() && lock.expires > Date.now();
    } catch {
      return false;
    }
  };

  const refreshLock = (): boolean => {
    if (!isOwnLock()) return false;

    const lock: LockInfo = {
      tabId: getTabId(),
      timestamp: Date.now(),
      expires: Date.now() + lockTimeout,
    };

    localStorage.setItem(lockKey, JSON.stringify(lock));
    return true;
  };

  const withLock = async <R>(
    fn: () => Promise<R> | R,
    retries = 3,
    retryDelay = 100
  ): Promise<R | null> => {
    for (let i = 0; i < retries; i++) {
      if (acquireLock()) {
        try {
          return await fn();
        } finally {
          releaseLock();
        }
      }
      await new Promise((resolve) => setTimeout(resolve, retryDelay));
    }
    return null;
  };

  return {
    acquire: acquireLock,
    release: releaseLock,
    isLocked,
    isOwnLock,
    refresh: refreshLock,
    withLock,
  };
};

export const createLeaderElection = (electionKey: string) => {
  const heartbeatInterval = 5000;
  const leaderTimeout = 10000;
  const storageKey = `__leader__${electionKey}`;

  type LeaderInfo = {
    tabId: string;
    timestamp: number;
  };

  let isLeaderFlag = false;
  let heartbeatTimer: ReturnType<typeof setInterval> | null = null;
  const leaderChangeCallbacks = new Set<(isLeader: boolean) => void>();

  const becomeLeader = (): void => {
    if (typeof localStorage === 'undefined') return;

    const info: LeaderInfo = {
      tabId: getTabId(),
      timestamp: Date.now(),
    };

    localStorage.setItem(storageKey, JSON.stringify(info));
    isLeaderFlag = true;

    leaderChangeCallbacks.forEach((callback) => callback(true));

    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
    }

    heartbeatTimer = setInterval(() => {
      if (isLeaderFlag) {
        const info: LeaderInfo = {
          tabId: getTabId(),
          timestamp: Date.now(),
        };
        localStorage.setItem(storageKey, JSON.stringify(info));
      }
    }, heartbeatInterval);
  };

  const checkLeadership = (): void => {
    if (typeof localStorage === 'undefined') return;

    const existing = localStorage.getItem(storageKey);
    const now = Date.now();

    if (!existing) {
      becomeLeader();
      return;
    }

    try {
      const info = JSON.parse(existing) as LeaderInfo;

      if (info.tabId === getTabId()) {
        if (!isLeaderFlag) {
          isLeaderFlag = true;
          leaderChangeCallbacks.forEach((callback) => callback(true));
        }
        return;
      }

      if (now - info.timestamp > leaderTimeout) {
        becomeLeader();
        return;
      }

      if (isLeaderFlag) {
        isLeaderFlag = false;
        leaderChangeCallbacks.forEach((callback) => callback(false));

        if (heartbeatTimer) {
          clearInterval(heartbeatTimer);
          heartbeatTimer = null;
        }
      }
    } catch {
      becomeLeader();
    }
  };

  let checkInterval: ReturnType<typeof setInterval> | null = null;
  let unsubscribeStorage: (() => void) | null = null;

  const start = (): void => {
    checkLeadership();

    checkInterval = setInterval(checkLeadership, heartbeatInterval);

    unsubscribeStorage = onStorageChange(storageKey, () => {
      checkLeadership();
    });
  };

  const stop = (): void => {
    if (checkInterval) {
      clearInterval(checkInterval);
      checkInterval = null;
    }

    if (heartbeatTimer) {
      clearInterval(heartbeatTimer);
      heartbeatTimer = null;
    }

    if (unsubscribeStorage) {
      unsubscribeStorage();
      unsubscribeStorage = null;
    }

    if (isLeaderFlag && typeof localStorage !== 'undefined') {
      localStorage.removeItem(storageKey);
    }

    isLeaderFlag = false;
  };

  const onLeaderChange = (
    callback: (isLeader: boolean) => void
  ): (() => void) => {
    leaderChangeCallbacks.add(callback);
    callback(isLeaderFlag);

    return () => {
      leaderChangeCallbacks.delete(callback);
    };
  };

  return {
    start,
    stop,
    onLeaderChange,
    get isLeader() {
      return isLeaderFlag;
    },
  };
};
