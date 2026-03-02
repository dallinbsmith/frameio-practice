import { vi } from 'vitest';

import type {
  MockFetchError,
  MockFetchResponse,
  MockIntersectionObserverEntry,
  MockTimerControls,
} from './types';

type FetchMockConfig = {
  responses: Map<string, MockFetchResponse<unknown> | MockFetchError>;
  defaultDelay: number;
  defaultStatus: number;
};

const createFetchMock = () => {
  const config: FetchMockConfig = {
    responses: new Map(),
    defaultDelay: 0,
    defaultStatus: 200,
  };

  const isError = (
    response: MockFetchResponse<unknown> | MockFetchError
  ): response is MockFetchError => {
    return (
      'message' in response && 'status' in response && !('data' in response)
    );
  };

  const mockFetch = vi.fn(
    async (input: RequestInfo | URL, init?: RequestInit) => {
      const url = typeof input === 'string' ? input : input.toString();
      const method = init?.method ?? 'GET';
      const key = `${method}:${url}`;

      const response = config.responses.get(key) ?? config.responses.get(url);

      if (!response) {
        return {
          ok: true,
          status: config.defaultStatus,
          statusText: 'OK',
          json: async () => ({}),
          text: async () => '',
          headers: new Headers(),
        };
      }

      if (isError(response)) {
        const errorResponse = {
          ok: false,
          status: response.status,
          statusText: response.message,
          json: async () => ({
            error: response.message,
            code: response.code,
          }),
          text: async () => response.message,
          headers: new Headers(),
        };

        if (response.status >= 500) {
          throw new Error(response.message);
        }

        return errorResponse;
      }

      const delay = response.delay ?? config.defaultDelay;
      if (delay > 0) {
        await new Promise((resolve) => setTimeout(resolve, delay));
      }

      return {
        ok: (response.status ?? 200) < 400,
        status: response.status ?? 200,
        statusText: 'OK',
        json: async () => response.data,
        text: async () => JSON.stringify(response.data),
        headers: new Headers(response.headers ?? {}),
      };
    }
  );

  return {
    mock: mockFetch,

    mockResponse: <T>(
      url: string,
      data: T,
      options: Partial<MockFetchResponse<T>> = {}
    ) => {
      config.responses.set(url, { data, ...options });
      return mockFetch;
    },

    mockGet: <T>(
      url: string,
      data: T,
      options: Partial<MockFetchResponse<T>> = {}
    ) => {
      config.responses.set(`GET:${url}`, { data, ...options });
      return mockFetch;
    },

    mockPost: <T>(
      url: string,
      data: T,
      options: Partial<MockFetchResponse<T>> = {}
    ) => {
      config.responses.set(`POST:${url}`, { data, ...options });
      return mockFetch;
    },

    mockPut: <T>(
      url: string,
      data: T,
      options: Partial<MockFetchResponse<T>> = {}
    ) => {
      config.responses.set(`PUT:${url}`, { data, ...options });
      return mockFetch;
    },

    mockDelete: <T>(
      url: string,
      data: T,
      options: Partial<MockFetchResponse<T>> = {}
    ) => {
      config.responses.set(`DELETE:${url}`, { data, ...options });
      return mockFetch;
    },

    mockError: (url: string, error: MockFetchError) => {
      config.responses.set(url, error);
      return mockFetch;
    },

    mockNetworkError: (url: string) => {
      mockFetch.mockImplementationOnce(() => {
        throw new TypeError('Failed to fetch');
      });
      return mockFetch;
    },

    setDefaultDelay: (delay: number) => {
      config.defaultDelay = delay;
    },

    reset: () => {
      config.responses.clear();
      config.defaultDelay = 0;
      mockFetch.mockClear();
    },

    install: () => {
      vi.stubGlobal('fetch', mockFetch);
      return () => vi.unstubAllGlobals();
    },
  };
};

const createTimerMock = (): MockTimerControls => {
  vi.useFakeTimers();

  return {
    advanceBy: (ms: number) => {
      vi.advanceTimersByTime(ms);
    },
    advanceTo: (date: Date) => {
      vi.setSystemTime(date);
    },
    runAll: () => {
      vi.runAllTimers();
    },
    runNext: () => {
      vi.runOnlyPendingTimers();
    },
    clear: () => {
      vi.clearAllTimers();
      vi.useRealTimers();
    },
  };
};

const createStorageMock = () => {
  let store: Record<string, string> = {};

  const mock = {
    getItem: vi.fn((key: string) => store[key] ?? null),
    setItem: vi.fn((key: string, value: string) => {
      store[key] = value;
    }),
    removeItem: vi.fn((key: string) => {
      delete store[key];
    }),
    clear: vi.fn(() => {
      store = {};
    }),
    key: vi.fn((index: number) => Object.keys(store)[index] ?? null),
    get length() {
      return Object.keys(store).length;
    },
  };

  return {
    mock,
    getStore: () => ({ ...store }),
    reset: () => {
      store = {};
      mock.getItem.mockClear();
      mock.setItem.mockClear();
      mock.removeItem.mockClear();
      mock.clear.mockClear();
    },
    install: (type: 'local' | 'session' = 'local') => {
      const key = type === 'local' ? 'localStorage' : 'sessionStorage';
      Object.defineProperty(window, key, { value: mock, writable: true });
      return () => {
        Object.defineProperty(window, key, {
          value: window[key],
          writable: true,
        });
      };
    },
  };
};

type IntersectionObserverCallback = (
  entries: IntersectionObserverEntry[]
) => void;

const createIntersectionObserverMock = () => {
  const instances: Array<{
    callback: IntersectionObserverCallback;
    elements: Set<Element>;
    options: IntersectionObserverInit | undefined;
  }> = [];

  const MockIntersectionObserver = vi.fn(
    (
      callback: IntersectionObserverCallback,
      options?: IntersectionObserverInit
    ) => {
      const instance = {
        callback,
        elements: new Set<Element>(),
        options,
      };
      instances.push(instance);

      return {
        observe: vi.fn((element: Element) => {
          instance.elements.add(element);
        }),
        unobserve: vi.fn((element: Element) => {
          instance.elements.delete(element);
        }),
        disconnect: vi.fn(() => {
          instance.elements.clear();
        }),
        takeRecords: vi.fn(() => []),
        root: options?.root ?? null,
        rootMargin: options?.rootMargin ?? '0px',
        thresholds: Array.isArray(options?.threshold)
          ? options.threshold
          : [options?.threshold ?? 0],
      };
    }
  );

  return {
    mock: MockIntersectionObserver,

    triggerIntersection: (
      element: Element,
      entry: MockIntersectionObserverEntry
    ) => {
      instances.forEach((instance) => {
        if (instance.elements.has(element)) {
          instance.callback([
            {
              ...entry,
              target: element,
              boundingClientRect:
                entry.boundingClientRect ?? element.getBoundingClientRect(),
              intersectionRect: entry.boundingClientRect ?? new DOMRect(),
              rootBounds: null,
              time: Date.now(),
            } as IntersectionObserverEntry,
          ]);
        }
      });
    },

    triggerAllVisible: () => {
      instances.forEach((instance) => {
        const entries = Array.from(instance.elements).map(
          (element) =>
            ({
              isIntersecting: true,
              intersectionRatio: 1,
              target: element,
              boundingClientRect: element.getBoundingClientRect(),
              intersectionRect: element.getBoundingClientRect(),
              rootBounds: null,
              time: Date.now(),
            }) as IntersectionObserverEntry
        );
        if (entries.length > 0) {
          instance.callback(entries);
        }
      });
    },

    triggerAllHidden: () => {
      instances.forEach((instance) => {
        const entries = Array.from(instance.elements).map(
          (element) =>
            ({
              isIntersecting: false,
              intersectionRatio: 0,
              target: element,
              boundingClientRect: element.getBoundingClientRect(),
              intersectionRect: new DOMRect(),
              rootBounds: null,
              time: Date.now(),
            }) as IntersectionObserverEntry
        );
        if (entries.length > 0) {
          instance.callback(entries);
        }
      });
    },

    getInstances: () => instances,

    reset: () => {
      instances.length = 0;
      MockIntersectionObserver.mockClear();
    },

    install: () => {
      Object.defineProperty(window, 'IntersectionObserver', {
        value: MockIntersectionObserver,
        writable: true,
      });
      return () => {
        Object.defineProperty(window, 'IntersectionObserver', {
          value: IntersectionObserver,
          writable: true,
        });
      };
    },
  };
};

type ResizeObserverCallback = (entries: ResizeObserverEntry[]) => void;

const createResizeObserverMock = () => {
  const instances: Array<{
    callback: ResizeObserverCallback;
    elements: Set<Element>;
  }> = [];

  const MockResizeObserver = vi.fn((callback: ResizeObserverCallback) => {
    const instance = {
      callback,
      elements: new Set<Element>(),
    };
    instances.push(instance);

    return {
      observe: vi.fn((element: Element) => {
        instance.elements.add(element);
      }),
      unobserve: vi.fn((element: Element) => {
        instance.elements.delete(element);
      }),
      disconnect: vi.fn(() => {
        instance.elements.clear();
      }),
    };
  });

  return {
    mock: MockResizeObserver,

    triggerResize: (
      element: Element,
      contentRect: Partial<DOMRectReadOnly>
    ) => {
      instances.forEach((instance) => {
        if (instance.elements.has(element)) {
          instance.callback([
            {
              target: element,
              contentRect: {
                x: 0,
                y: 0,
                width: 0,
                height: 0,
                top: 0,
                right: 0,
                bottom: 0,
                left: 0,
                toJSON: () => ({}),
                ...contentRect,
              } as DOMRectReadOnly,
              borderBoxSize: [],
              contentBoxSize: [],
              devicePixelContentBoxSize: [],
            },
          ]);
        }
      });
    },

    reset: () => {
      instances.length = 0;
      MockResizeObserver.mockClear();
    },

    install: () => {
      Object.defineProperty(window, 'ResizeObserver', {
        value: MockResizeObserver,
        writable: true,
      });
      return () => {
        Object.defineProperty(window, 'ResizeObserver', {
          value: ResizeObserver,
          writable: true,
        });
      };
    },
  };
};

const createMatchMediaMock = () => {
  let currentMatches: Record<string, boolean> = {};

  const MockMatchMedia = vi.fn((query: string) => ({
    matches: currentMatches[query] ?? false,
    media: query,
    onchange: null,
    addListener: vi.fn(),
    removeListener: vi.fn(),
    addEventListener: vi.fn(),
    removeEventListener: vi.fn(),
    dispatchEvent: vi.fn(),
  }));

  return {
    mock: MockMatchMedia,

    setMatches: (query: string, matches: boolean) => {
      currentMatches[query] = matches;
    },

    setPrefersDark: (prefersDark: boolean) => {
      currentMatches['(prefers-color-scheme: dark)'] = prefersDark;
    },

    setPrefersReducedMotion: (prefersReduced: boolean) => {
      currentMatches['(prefers-reduced-motion: reduce)'] = prefersReduced;
    },

    setViewport: (width: number) => {
      currentMatches['(max-width: 640px)'] = width <= 640;
      currentMatches['(max-width: 768px)'] = width <= 768;
      currentMatches['(max-width: 1024px)'] = width <= 1024;
      currentMatches['(min-width: 640px)'] = width >= 640;
      currentMatches['(min-width: 768px)'] = width >= 768;
      currentMatches['(min-width: 1024px)'] = width >= 1024;
    },

    reset: () => {
      currentMatches = {};
      MockMatchMedia.mockClear();
    },

    install: () => {
      Object.defineProperty(window, 'matchMedia', {
        value: MockMatchMedia,
        writable: true,
      });
      return () => {
        Object.defineProperty(window, 'matchMedia', {
          value: window.matchMedia,
          writable: true,
        });
      };
    },
  };
};

export {
  createFetchMock,
  createIntersectionObserverMock,
  createMatchMediaMock,
  createResizeObserverMock,
  createStorageMock,
  createTimerMock,
};
