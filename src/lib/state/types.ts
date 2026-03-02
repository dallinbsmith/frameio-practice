'use client';

export type Listener<T> = (state: T, prevState: T) => void;

export type Unsubscribe = () => void;

export type SetState<T> = (
  partial: T | Partial<T> | ((state: T) => T | Partial<T>),
  replace?: boolean | undefined
) => void;

export type GetState<T> = () => T;

export type Subscribe<T> = (listener: Listener<T>) => Unsubscribe;

export type StoreApi<T> = {
  getState: GetState<T>;
  setState: SetState<T>;
  subscribe: Subscribe<T>;
  destroy: () => void;
};

export type StateCreator<T> = (
  set: SetState<T>,
  get: GetState<T>,
  api: StoreApi<T>
) => T;

export type Middleware<T> = (
  set: SetState<T>,
  get: GetState<T>,
  api: StoreApi<T>
) => SetState<T>;

export type Selector<T, U> = (state: T) => U;

export type EqualityFn<T> = (a: T, b: T) => boolean;

export type StorageType = 'local' | 'session';

export type PersistConfig<T> = {
  name: string;
  storage?: StorageType | undefined;
  partialize?: ((state: T) => Partial<T>) | undefined;
  onRehydrate?: ((state: T) => void) | undefined;
  version?: number | undefined;
  migrate?: ((persisted: unknown, version: number) => T) | undefined;
};

export type Action<T = void> = T extends void
  ? { type: string }
  : { type: string; payload: T };

export type ActionCreator<T = void> = T extends void
  ? () => Action<T>
  : (payload: T) => Action<T>;

export type Reducer<S, A> = (state: S, action: A) => S;

export type SliceConfig<
  S,
  A extends Record<string, Reducer<S, Action<unknown>>>,
> = {
  name: string;
  initialState: S;
  reducers: A;
};

export type InferActionPayload<R> =
  R extends Reducer<unknown, Action<infer P>> ? P : never;

export type SliceActions<
  A extends Record<string, Reducer<unknown, Action<unknown>>>,
> = {
  [K in keyof A]: InferActionPayload<A[K]> extends void
    ? () => Action<void>
    : (payload: InferActionPayload<A[K]>) => Action<InferActionPayload<A[K]>>;
};

export type Atom<T> = {
  key: string;
  default: T | (() => T);
};

export type AtomConfig<T> = {
  key: string;
  default: T | (() => T);
  persist?: boolean | undefined;
};

export type AtomStore = {
  get: <T>(atom: Atom<T>) => T;
  set: <T>(atom: Atom<T>, value: T | ((prev: T) => T)) => void;
  subscribe: <T>(atom: Atom<T>, listener: (value: T) => void) => Unsubscribe;
  reset: <T>(atom: Atom<T>) => void;
};

export type ComputedAtom<T> = {
  key: string;
  get: (get: <U>(atom: Atom<U>) => U) => T;
};

export type DevtoolsConfig = {
  name?: string | undefined;
  enabled?: boolean | undefined;
  anonymize?: boolean | undefined;
};

export type LoggerConfig = {
  enabled?: boolean | undefined;
  collapsed?: boolean | undefined;
  diff?: boolean | undefined;
  colors?:
    | {
        prevState?: string | undefined;
        action?: string | undefined;
        nextState?: string | undefined;
      }
    | undefined;
};

export type HistoryState<T> = {
  past: T[];
  present: T;
  future: T[];
};

export type HistoryActions = {
  undo: () => void;
  redo: () => void;
  canUndo: () => boolean;
  canRedo: () => boolean;
  clear: () => void;
};

export type ImmerDraft<T> = {
  [K in keyof T]: T[K];
};

export type BatchUpdate<T> = {
  updates: Array<T | Partial<T> | ((state: T) => T | Partial<T>)>;
  apply: () => void;
};
