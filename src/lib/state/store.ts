'use client';

import type {
  GetState,
  Listener,
  Middleware,
  SetState,
  StateCreator,
  StoreApi,
  Unsubscribe,
} from './types';

const createStoreImpl = <T>(createState: StateCreator<T>): StoreApi<T> => {
  let state: T;
  const listeners = new Set<Listener<T>>();
  let isDispatching = false;

  const getState: GetState<T> = () => state;

  const setState: SetState<T> = (partial, replace) => {
    if (isDispatching) {
      throw new Error('Cannot call setState while dispatching');
    }

    const prevState = state;
    const nextState =
      typeof partial === 'function'
        ? (partial as (state: T) => T | Partial<T>)(state)
        : partial;

    if (!Object.is(nextState, state)) {
      state = replace
        ? (nextState as T)
        : typeof nextState === 'object' && nextState !== null
          ? { ...state, ...nextState }
          : (nextState as T);

      isDispatching = true;
      try {
        listeners.forEach((listener) => listener(state, prevState));
      } finally {
        isDispatching = false;
      }
    }
  };

  const subscribe: (listener: Listener<T>) => Unsubscribe = (listener) => {
    listeners.add(listener);
    return () => {
      listeners.delete(listener);
    };
  };

  const destroy = () => {
    listeners.clear();
  };

  const api: StoreApi<T> = { getState, setState, subscribe, destroy };
  state = createState(setState, getState, api);

  return api;
};

const createStore = <T>(createState: StateCreator<T>): StoreApi<T> => {
  return createStoreImpl(createState);
};

const applyMiddleware = <T>(
  ...middlewares: Array<Middleware<T>>
): ((createState: StateCreator<T>) => StoreApi<T>) => {
  return (createState: StateCreator<T>) => {
    const api = createStoreImpl<T>((set, get, storeApi) => {
      const enhancedSet = middlewares.reduce(
        (acc, middleware) => middleware(acc, get, storeApi),
        set
      );
      return createState(enhancedSet, get, storeApi);
    });
    return api;
  };
};

const combine = <T extends object, U extends object>(
  initialState: T,
  create: (
    set: SetState<T & U>,
    get: GetState<T & U>,
    api: StoreApi<T & U>
  ) => U
): StateCreator<T & U> => {
  return (set, get, api) => ({
    ...initialState,
    ...create(set, get, api),
  });
};

const subscribeWithSelector = <T, U>(
  api: StoreApi<T>,
  selector: (state: T) => U,
  listener: (selectedState: U, prevSelectedState: U) => void,
  equalityFn: (a: U, b: U) => boolean = Object.is
): Unsubscribe => {
  let currentSlice = selector(api.getState());

  return api.subscribe((state) => {
    const nextSlice = selector(state);
    if (!equalityFn(currentSlice, nextSlice)) {
      const prevSlice = currentSlice;
      currentSlice = nextSlice;
      listener(currentSlice, prevSlice);
    }
  });
};

type BatchCallback<T> = (set: SetState<T>) => void;

const batch = <T>(api: StoreApi<T>, callback: BatchCallback<T>): void => {
  const updates: Array<Parameters<SetState<T>>> = [];

  const batchedSet: SetState<T> = (partial, replace) => {
    updates.push([partial, replace]);
  };

  callback(batchedSet);

  if (updates.length > 0) {
    const state = api.getState();
    let nextState = state;

    for (const [partial, replace] of updates) {
      const update =
        typeof partial === 'function'
          ? (partial as (state: T) => T | Partial<T>)(nextState)
          : partial;

      nextState = replace
        ? (update as T)
        : typeof update === 'object' && update !== null
          ? { ...nextState, ...update }
          : (update as T);
    }

    api.setState(nextState, true);
  }
};

const resetStore = <T>(api: StoreApi<T>, initialState: T): void => {
  api.setState(initialState, true);
};

export {
  applyMiddleware,
  batch,
  combine,
  createStore,
  resetStore,
  subscribeWithSelector,
};
