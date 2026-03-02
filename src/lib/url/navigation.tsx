'use client';

import Link from 'next/link';
import { usePathname, useRouter, useSearchParams } from 'next/navigation';
import {
  createContext,
  forwardRef,
  useCallback,
  useContext,
  useEffect,
  useMemo,
  useRef,
  useState,
} from 'react';

import { getPathname } from './url-utils';

import type { NavigateOptions, RouteGuard, RouteMatch } from './types';
import type { ComponentProps, ReactNode } from 'react';

type NavigationContextValue = {
  guards: RouteGuard[];
  addGuard: (guard: RouteGuard) => () => void;
  isNavigating: boolean;
  blockedNavigation: { to: string; resolve: (allow: boolean) => void } | null;
};

const NavigationContext = createContext<NavigationContextValue | null>(null);

type NavigationProviderProps = {
  children: ReactNode;
};

export const NavigationProvider = ({
  children,
}: NavigationProviderProps): JSX.Element => {
  const [guards, setGuards] = useState<RouteGuard[]>([]);
  const [isNavigating] = useState(false);
  const [blockedNavigation] = useState<{
    to: string;
    resolve: (allow: boolean) => void;
  } | null>(null);

  const addGuard = useCallback((guard: RouteGuard) => {
    setGuards((prev) => [...prev, guard]);
    return () => {
      setGuards((prev) => prev.filter((g) => g !== guard));
    };
  }, []);

  const value = useMemo(
    () => ({
      guards,
      addGuard,
      isNavigating,
      blockedNavigation,
    }),
    [guards, addGuard, isNavigating, blockedNavigation]
  );

  return (
    <NavigationContext.Provider value={value}>
      {children}
    </NavigationContext.Provider>
  );
};

export const useNavigationGuard = (guard: RouteGuard, enabled = true): void => {
  const context = useContext(NavigationContext);

  useEffect(() => {
    if (!enabled || !context) return;

    const removeGuard = context.addGuard(guard);
    return removeGuard;
  }, [context, enabled, guard]);
};

export const useUnsavedChangesGuard = (
  hasUnsavedChanges: boolean,
  message = 'You have unsaved changes. Are you sure you want to leave?'
): void => {
  const guard = useCallback(
    async (_to: RouteMatch, _from: RouteMatch | null) => {
      if (!hasUnsavedChanges) return true;

      if (typeof window !== 'undefined') {
        return window.confirm(message);
      }

      return true;
    },
    [hasUnsavedChanges, message]
  );

  useNavigationGuard(guard, hasUnsavedChanges);

  useEffect(() => {
    if (!hasUnsavedChanges) return;

    const handleBeforeUnload = (e: BeforeUnloadEvent) => {
      e.preventDefault();
      e.returnValue = message;
      return message;
    };

    window.addEventListener('beforeunload', handleBeforeUnload);

    return () => {
      window.removeEventListener('beforeunload', handleBeforeUnload);
    };
  }, [hasUnsavedChanges, message]);
};

export const useNavigationState = (): {
  isNavigating: boolean;
  blockedNavigation: { to: string; resolve: (allow: boolean) => void } | null;
} => {
  const context = useContext(NavigationContext);

  return {
    isNavigating: context?.isNavigating ?? false,
    blockedNavigation: context?.blockedNavigation ?? null,
  };
};

type NavLinkProps = Omit<ComponentProps<typeof Link>, 'className'> & {
  className?: string | ((isActive: boolean) => string) | undefined;
  activeClassName?: string | undefined;
  exact?: boolean | undefined;
  children?: ReactNode | ((isActive: boolean) => ReactNode) | undefined;
};

export const NavLink = forwardRef<HTMLAnchorElement, NavLinkProps>(
  (
    {
      className,
      activeClassName = '',
      exact = false,
      children,
      href,
      ...props
    },
    ref
  ) => {
    const pathname = usePathname();
    const hrefString = typeof href === 'string' ? href : (href.pathname ?? '');

    const isActive = useMemo(() => {
      const targetPath = getPathname(hrefString);
      const currentPath = pathname;

      if (exact) {
        return currentPath === targetPath;
      }

      return (
        currentPath === targetPath || currentPath.startsWith(targetPath + '/')
      );
    }, [exact, hrefString, pathname]);

    const computedClassName = useMemo(() => {
      if (typeof className === 'function') {
        return className(isActive);
      }

      if (isActive && activeClassName) {
        return `${className ?? ''} ${activeClassName}`.trim();
      }

      return className ?? '';
    }, [className, isActive, activeClassName]);

    const renderedChildren = useMemo(() => {
      if (typeof children === 'function') {
        return children(isActive);
      }
      return children;
    }, [children, isActive]);

    return (
      <Link
        ref={ref}
        href={href}
        className={computedClassName}
        aria-current={isActive ? 'page' : undefined}
        {...props}
      >
        {renderedChildren}
      </Link>
    );
  }
);

NavLink.displayName = 'NavLink';

type ExternalLinkProps = ComponentProps<'a'> & {
  openInNewTab?: boolean | undefined;
  noReferrer?: boolean | undefined;
  showExternalIcon?: boolean | undefined;
};

export const ExternalLink = forwardRef<HTMLAnchorElement, ExternalLinkProps>(
  (
    {
      openInNewTab = true,
      noReferrer = true,
      showExternalIcon = false,
      children,
      ...props
    },
    ref
  ) => {
    const relParts: string[] = [];
    if (noReferrer) {
      relParts.push('noopener', 'noreferrer');
    }

    return (
      <a
        ref={ref}
        target={openInNewTab ? '_blank' : undefined}
        rel={relParts.length > 0 ? relParts.join(' ') : undefined}
        {...props}
      >
        {children}
        {showExternalIcon && (
          <svg
            style={{
              display: 'inline-block',
              marginLeft: '0.25em',
              width: '0.875em',
              height: '0.875em',
              verticalAlign: 'middle',
            }}
            fill="none"
            stroke="currentColor"
            viewBox="0 0 24 24"
            aria-hidden="true"
          >
            <path
              strokeLinecap="round"
              strokeLinejoin="round"
              strokeWidth={2}
              d="M10 6H6a2 2 0 00-2 2v10a2 2 0 002 2h10a2 2 0 002-2v-4M14 4h6m0 0v6m0-6L10 14"
            />
          </svg>
        )}
      </a>
    );
  }
);

ExternalLink.displayName = 'ExternalLink';

type PrefetchLinkProps = ComponentProps<typeof Link> & {
  prefetchOn?: 'hover' | 'visible' | 'mount' | undefined;
};

export const PrefetchLink = forwardRef<HTMLAnchorElement, PrefetchLinkProps>(
  ({ prefetchOn = 'hover', onMouseEnter, ...props }, ref) => {
    const [shouldPrefetch, setShouldPrefetch] = useState(
      prefetchOn === 'mount'
    );
    const linkRef = useRef<HTMLAnchorElement>(null);

    useEffect(() => {
      if (prefetchOn !== 'visible') return;

      const element = linkRef.current;
      if (!element) return;

      const observer = new IntersectionObserver(
        (entries) => {
          if (entries[0]?.isIntersecting) {
            setShouldPrefetch(true);
            observer.disconnect();
          }
        },
        { threshold: 0 }
      );

      observer.observe(element);

      return () => {
        observer.disconnect();
      };
    }, [prefetchOn]);

    const handleMouseEnter = useCallback(
      (e: React.MouseEvent<HTMLAnchorElement>) => {
        if (prefetchOn === 'hover') {
          setShouldPrefetch(true);
        }
        onMouseEnter?.(e);
      },
      [onMouseEnter, prefetchOn]
    );

    return (
      <Link
        ref={(node) => {
          (
            linkRef as React.MutableRefObject<HTMLAnchorElement | null>
          ).current = node;
          if (typeof ref === 'function') {
            ref(node);
          } else if (ref) {
            ref.current = node;
          }
        }}
        prefetch={shouldPrefetch}
        onMouseEnter={handleMouseEnter}
        {...props}
      />
    );
  }
);

PrefetchLink.displayName = 'PrefetchLink';

export const useNavigateWithParams = (): {
  navigate: (
    path: string,
    params?: Record<string, string>,
    options?: NavigateOptions
  ) => void;
  navigatePreserveParams: (
    path: string,
    keysToPreserve?: string[],
    options?: NavigateOptions
  ) => void;
} => {
  const router = useRouter();
  const searchParams = useSearchParams();

  const navigate = useCallback(
    (
      path: string,
      params?: Record<string, string>,
      options: NavigateOptions = {}
    ) => {
      let url = path;

      if (params && Object.keys(params).length > 0) {
        const queryString = new URLSearchParams(params).toString();
        url = `${path}?${queryString}`;
      }

      if (options.replace) {
        router.replace(url, { scroll: options.scroll ?? true });
      } else {
        router.push(url, { scroll: options.scroll ?? true });
      }
    },
    [router]
  );

  const navigatePreserveParams = useCallback(
    (
      path: string,
      keysToPreserve?: string[],
      options: NavigateOptions = {}
    ) => {
      const currentParams = new URLSearchParams(searchParams.toString());
      const newParams = new URLSearchParams();

      if (keysToPreserve) {
        for (const key of keysToPreserve) {
          const value = currentParams.get(key);
          if (value !== null) {
            newParams.set(key, value);
          }
        }
      } else {
        currentParams.forEach((value, key) => {
          newParams.set(key, value);
        });
      }

      const queryString = newParams.toString();
      const url = queryString ? `${path}?${queryString}` : path;

      if (options.replace) {
        router.replace(url, { scroll: options.scroll ?? true });
      } else {
        router.push(url, { scroll: options.scroll ?? true });
      }
    },
    [router, searchParams]
  );

  return { navigate, navigatePreserveParams };
};

export const useBackNavigation = (): {
  canGoBack: boolean;
  goBack: (fallbackPath?: string) => void;
} => {
  const router = useRouter();
  const [historyLength, setHistoryLength] = useState(0);

  useEffect(() => {
    setHistoryLength(window.history.length);
  }, []);

  const canGoBack = historyLength > 1;

  const goBack = useCallback(
    (fallbackPath = '/') => {
      if (canGoBack) {
        router.back();
      } else {
        router.push(fallbackPath);
      }
    },
    [canGoBack, router]
  );

  return { canGoBack, goBack };
};

export const useRedirect = (
  to: string,
  options: { when?: boolean; replace?: boolean } = {}
): void => {
  const router = useRouter();
  const { when = true, replace = true } = options;

  useEffect(() => {
    if (!when) return;

    if (replace) {
      router.replace(to);
    } else {
      router.push(to);
    }
  }, [router, to, when, replace]);
};
