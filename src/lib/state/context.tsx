'use client';

import {
  createContext,
  useCallback,
  useContext,
  useMemo,
  useRef,
  useSyncExternalStore,
} from 'react';

import type { EqualityFn, Selector, Unsubscribe } from './types';
import type { ReactNode } from 'react';

type ContextStore<T> = {
  getState: () => T;
  setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  subscribe: (listener: () => void) => Unsubscribe;
};

type CreateContextStoreReturn<T> = {
  Provider: React.FC<{
    initialState?: Partial<T> | undefined;
    children: ReactNode;
  }>;
  useStore: () => T;
  useStoreSelector: <U>(
    selector: Selector<T, U>,
    equalityFn?: EqualityFn<U>
  ) => U;
  useStoreActions: () => {
    setState: (partial: Partial<T> | ((state: T) => Partial<T>)) => void;
  };
};

const createContextStore = <T extends object>(
  defaultState: T
): CreateContextStoreReturn<T> => {
  const StoreContext = createContext<ContextStore<T> | null>(null);

  const Provider: React.FC<{
    initialState?: Partial<T> | undefined;
    children: ReactNode;
  }> = ({ initialState, children }) => {
    const storeRef = useRef<ContextStore<T> | null>(null);

    if (!storeRef.current) {
      let state = { ...defaultState, ...initialState };
      const listeners = new Set<() => void>();

      storeRef.current = {
        getState: () => state,
        setState: (partial) => {
          const nextPartial =
            typeof partial === 'function' ? partial(state) : partial;
          state = { ...state, ...nextPartial };
          listeners.forEach((listener) => listener());
        },
        subscribe: (listener) => {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
      };
    }

    return (
      <StoreContext.Provider value={storeRef.current}>
        {children}
      </StoreContext.Provider>
    );
  };

  const useContextStore = (): ContextStore<T> => {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error('useStore must be used within a Provider');
    }
    return store;
  };

  const useStore = (): T => {
    const store = useContextStore();
    return useSyncExternalStore(
      store.subscribe,
      store.getState,
      store.getState
    );
  };

  const useStoreSelector = <U,>(
    selector: Selector<T, U>,
    equalityFn: EqualityFn<U> = Object.is
  ): U => {
    const store = useContextStore();
    const selectorRef = useRef(selector);
    const equalityFnRef = useRef(equalityFn);

    selectorRef.current = selector;
    equalityFnRef.current = equalityFn;

    const subscribe = useCallback(
      (onStoreChange: () => void) => {
        let currentSlice = selectorRef.current(store.getState());

        return store.subscribe(() => {
          const nextSlice = selectorRef.current(store.getState());
          if (!equalityFnRef.current(currentSlice, nextSlice)) {
            currentSlice = nextSlice;
            onStoreChange();
          }
        });
      },
      [store]
    );

    const getSnapshot = useCallback(
      () => selectorRef.current(store.getState()),
      [store]
    );

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  };

  const useStoreActions = () => {
    const store = useContextStore();
    return useMemo(
      () => ({
        setState: store.setState,
      }),
      [store]
    );
  };

  return {
    Provider,
    useStore,
    useStoreSelector,
    useStoreActions,
  };
};

type SplitContextReturn<T, A> = {
  Provider: React.FC<{ value: T; children: ReactNode }>;
  StateProvider: React.FC<{ value: T; children: ReactNode }>;
  ActionsProvider: React.FC<{ value: A; children: ReactNode }>;
  useState: () => T;
  useActions: () => A;
};

const createSplitContext = <T, A>(
  defaultState: T,
  defaultActions: A
): SplitContextReturn<T, A> => {
  const StateContext = createContext<T>(defaultState);
  const ActionsContext = createContext<A>(defaultActions);

  const StateProvider: React.FC<{ value: T; children: ReactNode }> = ({
    value,
    children,
  }) => {
    return (
      <StateContext.Provider value={value}>{children}</StateContext.Provider>
    );
  };

  const ActionsProvider: React.FC<{ value: A; children: ReactNode }> = ({
    value,
    children,
  }) => {
    return (
      <ActionsContext.Provider value={value}>
        {children}
      </ActionsContext.Provider>
    );
  };

  const Provider: React.FC<{ value: T; children: ReactNode }> = ({
    value,
    children,
  }) => {
    return (
      <StateContext.Provider value={value}>
        <ActionsContext.Provider value={defaultActions}>
          {children}
        </ActionsContext.Provider>
      </StateContext.Provider>
    );
  };

  const useState = (): T => useContext(StateContext);
  const useActions = (): A => useContext(ActionsContext);

  return {
    Provider,
    StateProvider,
    ActionsProvider,
    useState,
    useActions,
  };
};

type FastContextReturn<T> = {
  Provider: React.FC<{ value: T; children: ReactNode }>;
  useValue: () => T;
  useSelector: <U>(selector: Selector<T, U>) => U;
};

const createFastContext = <T extends object>(
  defaultValue: T
): FastContextReturn<T> => {
  type Subscription = {
    value: T;
    listeners: Set<() => void>;
  };

  const SubscriptionContext = createContext<Subscription | null>(null);

  const Provider: React.FC<{ value: T; children: ReactNode }> = ({
    value,
    children,
  }) => {
    const subscriptionRef = useRef<Subscription | null>(null);

    if (!subscriptionRef.current) {
      subscriptionRef.current = {
        value,
        listeners: new Set(),
      };
    }

    subscriptionRef.current.value = value;

    const notifyListeners = useCallback(() => {
      subscriptionRef.current?.listeners.forEach((listener) => listener());
    }, []);

    const prevValueRef = useRef(value);
    if (prevValueRef.current !== value) {
      prevValueRef.current = value;
      notifyListeners();
    }

    return (
      <SubscriptionContext.Provider value={subscriptionRef.current}>
        {children}
      </SubscriptionContext.Provider>
    );
  };

  const useSubscription = (): Subscription => {
    const subscription = useContext(SubscriptionContext);
    if (!subscription) {
      return { value: defaultValue, listeners: new Set() };
    }
    return subscription;
  };

  const useValue = (): T => {
    const subscription = useSubscription();

    const subscribe = useCallback(
      (onStoreChange: () => void) => {
        subscription.listeners.add(onStoreChange);
        return () => subscription.listeners.delete(onStoreChange);
      },
      [subscription]
    );

    const getSnapshot = useCallback(() => subscription.value, [subscription]);

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  };

  const useSelector = <U,>(selector: Selector<T, U>): U => {
    const subscription = useSubscription();
    const selectorRef = useRef(selector);
    selectorRef.current = selector;

    const subscribe = useCallback(
      (onStoreChange: () => void) => {
        let currentSlice = selectorRef.current(subscription.value);

        const listener = () => {
          const nextSlice = selectorRef.current(subscription.value);
          if (!Object.is(currentSlice, nextSlice)) {
            currentSlice = nextSlice;
            onStoreChange();
          }
        };

        subscription.listeners.add(listener);
        return () => subscription.listeners.delete(listener);
      },
      [subscription]
    );

    const getSnapshot = useCallback(
      () => selectorRef.current(subscription.value),
      [subscription]
    );

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  };

  return {
    Provider,
    useValue,
    useSelector,
  };
};

type ContextWithReducerReturn<S, A> = {
  Provider: React.FC<{
    initialState?: S | undefined;
    children: ReactNode;
  }>;
  useStateContext: () => S;
  useDispatch: () => (action: A) => void;
  useSelector: <U>(selector: Selector<S, U>) => U;
};

const createContextWithReducer = <S extends object, A>(
  defaultState: S,
  reducer: (state: S, action: A) => S
): ContextWithReducerReturn<S, A> => {
  type Store = {
    state: S;
    dispatch: (action: A) => void;
    subscribe: (listener: () => void) => Unsubscribe;
  };

  const StoreContext = createContext<Store | null>(null);

  const Provider: React.FC<{
    initialState?: S | undefined;
    children: ReactNode;
  }> = ({ initialState, children }) => {
    const storeRef = useRef<Store | null>(null);

    if (!storeRef.current) {
      let state = initialState ?? defaultState;
      const listeners = new Set<() => void>();

      storeRef.current = {
        get state() {
          return state;
        },
        dispatch: (action: A) => {
          state = reducer(state, action);
          listeners.forEach((listener) => listener());
        },
        subscribe: (listener) => {
          listeners.add(listener);
          return () => listeners.delete(listener);
        },
      };
    }

    return (
      <StoreContext.Provider value={storeRef.current}>
        {children}
      </StoreContext.Provider>
    );
  };

  const useStore = (): Store => {
    const store = useContext(StoreContext);
    if (!store) {
      throw new Error('useStore must be used within Provider');
    }
    return store;
  };

  const useStateContext = (): S => {
    const store = useStore();
    return useSyncExternalStore(
      store.subscribe,
      () => store.state,
      () => store.state
    );
  };

  const useDispatch = (): ((action: A) => void) => {
    const store = useStore();
    return store.dispatch;
  };

  const useSelector = <U,>(selector: Selector<S, U>): U => {
    const store = useStore();
    const selectorRef = useRef(selector);
    selectorRef.current = selector;

    const subscribe = useCallback(
      (onStoreChange: () => void) => {
        let currentSlice = selectorRef.current(store.state);

        return store.subscribe(() => {
          const nextSlice = selectorRef.current(store.state);
          if (!Object.is(currentSlice, nextSlice)) {
            currentSlice = nextSlice;
            onStoreChange();
          }
        });
      },
      [store]
    );

    const getSnapshot = useCallback(
      () => selectorRef.current(store.state),
      [store]
    );

    return useSyncExternalStore(subscribe, getSnapshot, getSnapshot);
  };

  return {
    Provider,
    useStateContext,
    useDispatch,
    useSelector,
  };
};

export {
  createContextStore,
  createContextWithReducer,
  createFastContext,
  createSplitContext,
};

export type {
  ContextStore,
  ContextWithReducerReturn,
  CreateContextStoreReturn,
  FastContextReturn,
  SplitContextReturn,
};
