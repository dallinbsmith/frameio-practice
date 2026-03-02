'use client';

import { useCallback, useMemo, useSyncExternalStore } from 'react';

import { createStore } from './store';

import type { HistoryActions, HistoryState, StoreApi } from './types';

type HistoryConfig = {
  maxHistory?: number | undefined;
  filter?: ((state: unknown, prevState: unknown) => boolean) | undefined;
};

const createHistoryStore = <T>(
  initialState: T,
  config: HistoryConfig = {}
): StoreApi<HistoryState<T>> & HistoryActions => {
  const { maxHistory = 100, filter } = config;

  const store = createStore<HistoryState<T>>(() => ({
    past: [],
    present: initialState,
    future: [],
  }));

  const shouldRecord = (state: T, prevState: T): boolean => {
    if (filter) {
      return filter(state, prevState);
    }
    return !Object.is(state, prevState);
  };

  const set = (state: T): void => {
    store.setState((history) => {
      if (!shouldRecord(state, history.present)) {
        return { ...history, present: state };
      }

      const newPast = [...history.past, history.present];
      if (newPast.length > maxHistory) {
        newPast.shift();
      }

      return {
        past: newPast,
        present: state,
        future: [],
      };
    });
  };

  const undo = (): void => {
    store.setState((history) => {
      if (history.past.length === 0) {
        return history;
      }

      const previous = history.past[history.past.length - 1];
      const newPast = history.past.slice(0, -1);

      return {
        past: newPast,
        present: previous!,
        future: [history.present, ...history.future],
      };
    });
  };

  const redo = (): void => {
    store.setState((history) => {
      if (history.future.length === 0) {
        return history;
      }

      const next = history.future[0];
      const newFuture = history.future.slice(1);

      return {
        past: [...history.past, history.present],
        present: next!,
        future: newFuture,
      };
    });
  };

  const canUndo = (): boolean => {
    return store.getState().past.length > 0;
  };

  const canRedo = (): boolean => {
    return store.getState().future.length > 0;
  };

  const clear = (): void => {
    store.setState((history) => ({
      past: [],
      present: history.present,
      future: [],
    }));
  };

  return {
    ...store,
    setState: (partial, replace) => {
      if (typeof partial === 'function') {
        const nextState = partial(store.getState());
        if ('present' in (nextState as object)) {
          store.setState(nextState as HistoryState<T>, replace);
        } else {
          set(nextState as T);
        }
      } else if ('present' in (partial as object)) {
        store.setState(partial as HistoryState<T>, replace);
      } else {
        set(partial as T);
      }
    },
    undo,
    redo,
    canUndo,
    canRedo,
    clear,
  };
};

const useHistoryStore = <T>(
  store: StoreApi<HistoryState<T>> & HistoryActions
): {
  state: T;
  set: (state: T) => void;
  undo: () => void;
  redo: () => void;
  canUndo: boolean;
  canRedo: boolean;
  clear: () => void;
  history: HistoryState<T>;
} => {
  const subscribe = useCallback(
    (onStoreChange: () => void) => store.subscribe(onStoreChange),
    [store]
  );

  const getSnapshot = useCallback(() => store.getState(), [store]);

  const history = useSyncExternalStore(subscribe, getSnapshot, getSnapshot);

  const actions = useMemo(
    () => ({
      set: (state: T) => store.setState({ present: state } as HistoryState<T>),
      undo: store.undo,
      redo: store.redo,
      clear: store.clear,
    }),
    [store]
  );

  return {
    state: history.present,
    ...actions,
    canUndo: history.past.length > 0,
    canRedo: history.future.length > 0,
    history,
  };
};

type HistoryMiddleware<T> = {
  wrapStore: (store: StoreApi<T>) => StoreApi<T> & HistoryActions;
};

const historyMiddleware = <T extends object>(
  config: HistoryConfig = {}
): HistoryMiddleware<T> => {
  const { maxHistory = 100, filter } = config;

  return {
    wrapStore: (store: StoreApi<T>): StoreApi<T> & HistoryActions => {
      let past: T[] = [];
      let future: T[] = [];

      const shouldRecord = (state: T, prevState: T): boolean => {
        if (filter) {
          return filter(state, prevState);
        }
        return !Object.is(state, prevState);
      };

      const originalSetState = store.setState;

      const wrappedSetState: typeof store.setState = (partial, replace) => {
        const prevState = store.getState();
        originalSetState(partial, replace);
        const nextState = store.getState();

        if (shouldRecord(nextState, prevState)) {
          past = [...past, prevState];
          if (past.length > maxHistory) {
            past.shift();
          }
          future = [];
        }
      };

      const undo = (): void => {
        if (past.length === 0) return;

        const previous = past[past.length - 1]!;
        past = past.slice(0, -1);
        future = [store.getState(), ...future];

        originalSetState(previous, true);
      };

      const redo = (): void => {
        if (future.length === 0) return;

        const next = future[0]!;
        future = future.slice(1);
        past = [...past, store.getState()];

        originalSetState(next, true);
      };

      return {
        ...store,
        setState: wrappedSetState,
        undo,
        redo,
        canUndo: () => past.length > 0,
        canRedo: () => future.length > 0,
        clear: () => {
          past = [];
          future = [];
        },
      };
    },
  };
};

type Checkpoint<T> = {
  id: string;
  state: T;
  timestamp: number;
  label?: string | undefined;
};

type CheckpointStore<T> = {
  save: (label?: string | undefined) => string;
  restore: (id: string) => boolean;
  getCheckpoints: () => Checkpoint<T>[];
  deleteCheckpoint: (id: string) => void;
  clearCheckpoints: () => void;
};

const createCheckpointStore = <T>(
  store: StoreApi<T>,
  maxCheckpoints = 10
): CheckpointStore<T> => {
  const checkpoints: Checkpoint<T>[] = [];

  const generateId = (): string => {
    return `checkpoint_${Date.now()}_${Math.random().toString(36).slice(2, 9)}`;
  };

  const save = (label?: string): string => {
    const id = generateId();
    const checkpoint: Checkpoint<T> = {
      id,
      state: store.getState(),
      timestamp: Date.now(),
      label,
    };

    checkpoints.unshift(checkpoint);

    if (checkpoints.length > maxCheckpoints) {
      checkpoints.pop();
    }

    return id;
  };

  const restore = (id: string): boolean => {
    const checkpoint = checkpoints.find((c) => c.id === id);
    if (!checkpoint) {
      return false;
    }

    store.setState(checkpoint.state, true);
    return true;
  };

  const getCheckpoints = (): Checkpoint<T>[] => {
    return [...checkpoints];
  };

  const deleteCheckpoint = (id: string): void => {
    const index = checkpoints.findIndex((c) => c.id === id);
    if (index !== -1) {
      checkpoints.splice(index, 1);
    }
  };

  const clearCheckpoints = (): void => {
    checkpoints.length = 0;
  };

  return {
    save,
    restore,
    getCheckpoints,
    deleteCheckpoint,
    clearCheckpoints,
  };
};

const useCheckpoints = <T>(
  store: StoreApi<T>,
  maxCheckpoints = 10
): CheckpointStore<T> => {
  return useMemo(
    () => createCheckpointStore(store, maxCheckpoints),
    [store, maxCheckpoints]
  );
};

export {
  createCheckpointStore,
  createHistoryStore,
  historyMiddleware,
  useCheckpoints,
  useHistoryStore,
};

export type { Checkpoint, CheckpointStore, HistoryConfig, HistoryMiddleware };
