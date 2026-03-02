'use client';

import type {
  DevtoolsConfig,
  LoggerConfig,
  Middleware,
  PersistConfig,
  SetState,
} from './types';

const logger = <T>(config: LoggerConfig = {}): Middleware<T> => {
  const {
    enabled = process.env.NODE_ENV === 'development',
    collapsed = true,
    diff = true,
    colors = {
      prevState: '#9E9E9E',
      action: '#03A9F4',
      nextState: '#4CAF50',
    },
  } = config;

  return (set, get) => {
    if (!enabled || typeof window === 'undefined') {
      return set;
    }

    return (partial, replace) => {
      const prevState = get();
      set(partial, replace);
      const nextState = get();

      const groupMethod = collapsed ? console.groupCollapsed : console.group;

      try {
        groupMethod(
          `%c state update @ ${new Date().toLocaleTimeString()}`,
          `color: ${colors.action}; font-weight: bold`
        );

        console.log(
          '%c prev state',
          `color: ${colors.prevState}; font-weight: bold`,
          prevState
        );

        if (diff) {
          const changes = getDiff(prevState as object, nextState as object);
          console.log(
            '%c changes',
            'color: #FF9800; font-weight: bold',
            changes
          );
        }

        console.log(
          '%c next state',
          `color: ${colors.nextState}; font-weight: bold`,
          nextState
        );

        console.groupEnd();
      } catch {
        // Ignore console errors
      }
    };
  };
};

const getDiff = (
  prev: object,
  next: object
): Record<string, { from: unknown; to: unknown }> => {
  const changes: Record<string, { from: unknown; to: unknown }> = {};

  const allKeys = new Set([...Object.keys(prev), ...Object.keys(next)]);

  for (const key of allKeys) {
    const prevValue = (prev as Record<string, unknown>)[key];
    const nextValue = (next as Record<string, unknown>)[key];

    if (!Object.is(prevValue, nextValue)) {
      changes[key] = { from: prevValue, to: nextValue };
    }
  }

  return changes;
};

const persist = <T extends object>(config: PersistConfig<T>): Middleware<T> => {
  const {
    name,
    storage = 'local',
    partialize = (state) => state,
    onRehydrate,
    version = 0,
    migrate,
  } = config;

  const storageApi =
    typeof window !== 'undefined'
      ? storage === 'local'
        ? localStorage
        : sessionStorage
      : null;

  return (set, get, api) => {
    if (storageApi) {
      try {
        const stored = storageApi.getItem(name);
        if (stored) {
          const parsed = JSON.parse(stored) as {
            state: Partial<T>;
            version: number;
          };
          let restoredState = parsed.state;

          if (parsed.version !== version && migrate) {
            restoredState = partialize(migrate(parsed.state, parsed.version));
          }

          setTimeout(() => {
            api.setState(restoredState as T | Partial<T>);
            onRehydrate?.(get());
          }, 0);
        }
      } catch {
        // Ignore storage errors
      }
    }

    return (partial, replace) => {
      set(partial, replace);

      if (storageApi) {
        try {
          const state = get();
          const partialState = partialize(state);
          storageApi.setItem(
            name,
            JSON.stringify({ state: partialState, version })
          );
        } catch {
          // Ignore storage errors
        }
      }
    };
  };
};

const devtools = <T>(config: DevtoolsConfig = {}): Middleware<T> => {
  const { name = 'Store', enabled = process.env.NODE_ENV === 'development' } =
    config;

  type DevToolsExtension = {
    connect: (options: { name: string }) => {
      init: (state: T) => void;
      send: (action: { type: string }, state: T) => void;
      subscribe: (
        listener: (message: { type: string; state?: string }) => void
      ) => () => void;
    };
  };

  return (set, get, api) => {
    if (!enabled || typeof window === 'undefined') {
      return set;
    }

    const extension = (
      window as unknown as { __REDUX_DEVTOOLS_EXTENSION__?: DevToolsExtension }
    ).__REDUX_DEVTOOLS_EXTENSION__;

    if (!extension) {
      return set;
    }

    const devTools = extension.connect({ name });
    devTools.init(get());

    devTools.subscribe((message) => {
      if (message.type === 'DISPATCH' && message.state) {
        try {
          const state = JSON.parse(message.state) as T;
          api.setState(state, true);
        } catch {
          // Ignore parse errors
        }
      }
    });

    let actionCount = 0;

    return (partial, replace) => {
      actionCount++;
      set(partial, replace);
      devTools.send({ type: `Update #${actionCount}` }, get());
    };
  };
};

const immer = <T extends object>(): Middleware<T> => {
  return (set) => {
    return (partial, replace) => {
      if (typeof partial === 'function') {
        const draft = partial as (state: T) => T | Partial<T>;
        set((state) => {
          const result = draft({ ...state });
          return result;
        }, replace);
      } else {
        set(partial, replace);
      }
    };
  };
};

const throttle = <T>(ms: number): Middleware<T> => {
  let lastUpdate = 0;
  let pending: {
    partial: Parameters<SetState<T>>[0];
    replace: Parameters<SetState<T>>[1];
  } | null = null;
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (set) => {
    return (partial, replace) => {
      const now = Date.now();

      if (now - lastUpdate >= ms) {
        lastUpdate = now;
        set(partial, replace);
        pending = null;
      } else {
        pending = { partial, replace };

        if (!timeoutId) {
          timeoutId = setTimeout(
            () => {
              if (pending) {
                lastUpdate = Date.now();
                set(pending.partial, pending.replace);
                pending = null;
              }
              timeoutId = null;
            },
            ms - (now - lastUpdate)
          );
        }
      }
    };
  };
};

const debounce = <T>(ms: number): Middleware<T> => {
  let timeoutId: ReturnType<typeof setTimeout> | null = null;

  return (set) => {
    return (partial, replace) => {
      if (timeoutId) {
        clearTimeout(timeoutId);
      }

      timeoutId = setTimeout(() => {
        set(partial, replace);
        timeoutId = null;
      }, ms);
    };
  };
};

type ActionRecord = {
  timestamp: number;
  type: string;
  state: unknown;
};

const actionHistory = <T>(
  maxSize = 100
): Middleware<T> & {
  getHistory: () => ActionRecord[];
  clearHistory: () => void;
} => {
  const history: ActionRecord[] = [];
  let actionCount = 0;

  const middleware: Middleware<T> = (set, get) => {
    return (partial, replace) => {
      actionCount++;
      set(partial, replace);

      history.push({
        timestamp: Date.now(),
        type: `Action #${actionCount}`,
        state: get(),
      });

      if (history.length > maxSize) {
        history.shift();
      }
    };
  };

  return Object.assign(middleware, {
    getHistory: () => [...history],
    clearHistory: () => {
      history.length = 0;
    },
  });
};

const computed = <
  T extends object,
  C extends Record<string, (state: T) => unknown>,
>(
  computedSelectors: C
): Middleware<T & { [K in keyof C]: ReturnType<C[K]> }> => {
  return (set, get) => {
    const computeValues = (
      state: T
    ): T & { [K in keyof C]: ReturnType<C[K]> } => {
      const computed = {} as { [K in keyof C]: ReturnType<C[K]> };

      for (const [key, selector] of Object.entries(computedSelectors)) {
        computed[key as keyof C] = selector(state) as ReturnType<C[keyof C]>;
      }

      return { ...state, ...computed };
    };

    return (partial, replace) => {
      set(
        partial as Parameters<
          SetState<T & { [K in keyof C]: ReturnType<C[K]> }>
        >[0],
        replace
      );

      const state = get() as unknown as T;
      const withComputed = computeValues(state);
      set(withComputed as T & { [K in keyof C]: ReturnType<C[K]> }, true);
    };
  };
};

const validate = <T>(
  validator: (state: T, prevState: T) => boolean,
  onError?: ((state: T, prevState: T) => void) | undefined
): Middleware<T> => {
  return (set, get) => {
    return (partial, replace) => {
      const prevState = get();
      set(partial, replace);
      const nextState = get();

      if (!validator(nextState, prevState)) {
        onError?.(nextState, prevState);
        set(prevState, true);
      }
    };
  };
};

export {
  actionHistory,
  computed,
  debounce,
  devtools,
  getDiff,
  immer,
  logger,
  persist,
  throttle,
  validate,
};
