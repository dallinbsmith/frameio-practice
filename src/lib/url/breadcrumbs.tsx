'use client';

import { usePathname } from 'next/navigation';
import { createContext, useCallback, useContext, useMemo } from 'react';

import { extractPathSegments, matchRoute } from './route-matching';

import type { BreadcrumbConfig, BreadcrumbItem } from './types';
import type { ReactNode } from 'react';

type BreadcrumbContextValue = {
  config: BreadcrumbConfig[];
  generateBreadcrumbs: (path: string) => BreadcrumbItem[];
};

const BreadcrumbContext = createContext<BreadcrumbContextValue | null>(null);

type BreadcrumbProviderProps = {
  config: BreadcrumbConfig[];
  children: ReactNode;
};

export const BreadcrumbProvider = ({
  config,
  children,
}: BreadcrumbProviderProps): JSX.Element => {
  const generateBreadcrumbs = useCallback(
    (path: string): BreadcrumbItem[] => {
      const segments = extractPathSegments(path);
      const breadcrumbs: BreadcrumbItem[] = [];

      let currentPath = '';

      for (let i = 0; i < segments.length; i++) {
        currentPath += `/${segments[i]}`;
        const isCurrent = i === segments.length - 1;

        let label: string | undefined;
        let params: Record<string, string> = {};

        for (const route of config) {
          const match = matchRoute(currentPath, route.path);
          if (match) {
            params = match.params;
            label =
              typeof route.label === 'function'
                ? route.label(params)
                : route.label;
            break;
          }
        }

        if (!label) {
          const segment = segments[i] ?? '';
          label = segment
            .replace(/-/g, ' ')
            .replace(/\b\w/g, (char) => char.toUpperCase());
        }

        breadcrumbs.push({
          label,
          href: currentPath,
          current: isCurrent,
        });
      }

      return breadcrumbs;
    },
    [config]
  );

  const value = useMemo(
    () => ({ config, generateBreadcrumbs }),
    [config, generateBreadcrumbs]
  );

  return (
    <BreadcrumbContext.Provider value={value}>
      {children}
    </BreadcrumbContext.Provider>
  );
};

export const useBreadcrumbs = (): BreadcrumbItem[] => {
  const pathname = usePathname();
  const context = useContext(BreadcrumbContext);

  return useMemo(() => {
    if (!context) {
      const segments = extractPathSegments(pathname);
      const breadcrumbs: BreadcrumbItem[] = [];
      let currentPath = '';

      for (let i = 0; i < segments.length; i++) {
        currentPath += `/${segments[i]}`;
        const segment = segments[i] ?? '';
        const label = segment
          .replace(/-/g, ' ')
          .replace(/\b\w/g, (char) => char.toUpperCase());

        breadcrumbs.push({
          label,
          href: currentPath,
          current: i === segments.length - 1,
        });
      }

      return breadcrumbs;
    }

    return context.generateBreadcrumbs(pathname);
  }, [context, pathname]);
};

export const useBreadcrumbsWithHome = (
  homeLabel = 'Home'
): BreadcrumbItem[] => {
  const breadcrumbs = useBreadcrumbs();
  const pathname = usePathname();

  return useMemo(() => {
    const home: BreadcrumbItem = {
      label: homeLabel,
      href: '/',
      current: pathname === '/',
    };

    if (pathname === '/') {
      return [home];
    }

    return [home, ...breadcrumbs];
  }, [breadcrumbs, homeLabel, pathname]);
};

type BreadcrumbsProps = {
  separator?: ReactNode | undefined;
  homeLabel?: string | undefined;
  className?: string | undefined;
  itemClassName?: string | undefined;
  linkClassName?: string | undefined;
  currentClassName?: string | undefined;
  renderItem?: ((item: BreadcrumbItem, index: number) => ReactNode) | undefined;
  renderSeparator?: (() => ReactNode) | undefined;
};

export const Breadcrumbs = ({
  separator = '/',
  homeLabel = 'Home',
  className = '',
  itemClassName = '',
  linkClassName = '',
  currentClassName = '',
  renderItem,
  renderSeparator,
}: BreadcrumbsProps): JSX.Element => {
  const breadcrumbs = useBreadcrumbsWithHome(homeLabel);

  const renderDefaultItem = (item: BreadcrumbItem, index: number) => {
    if (item.current) {
      return (
        <span
          key={index}
          className={`${itemClassName} ${currentClassName}`.trim()}
          aria-current="page"
        >
          {item.label}
        </span>
      );
    }

    return (
      <a
        key={index}
        href={item.href}
        className={`${itemClassName} ${linkClassName}`.trim()}
      >
        {item.label}
      </a>
    );
  };

  const renderDefaultSeparator = () => (
    <span aria-hidden="true">{separator}</span>
  );

  return (
    <nav aria-label="Breadcrumb" className={className}>
      <ol style={{ display: 'flex', listStyle: 'none', margin: 0, padding: 0 }}>
        {breadcrumbs.map((item, index) => (
          <li key={item.href} style={{ display: 'flex', alignItems: 'center' }}>
            {index > 0 && (renderSeparator?.() ?? renderDefaultSeparator())}
            {renderItem?.(item, index) ?? renderDefaultItem(item, index)}
          </li>
        ))}
      </ol>
    </nav>
  );
};

export const generateBreadcrumbsFromPath = (
  path: string,
  config?: BreadcrumbConfig[] | undefined
): BreadcrumbItem[] => {
  const segments = extractPathSegments(path);
  const breadcrumbs: BreadcrumbItem[] = [];

  let currentPath = '';

  for (let i = 0; i < segments.length; i++) {
    currentPath += `/${segments[i]}`;
    const isCurrent = i === segments.length - 1;

    let label: string | undefined;

    if (config) {
      for (const route of config) {
        const match = matchRoute(currentPath, route.path);
        if (match) {
          label =
            typeof route.label === 'function'
              ? route.label(match.params)
              : route.label;
          break;
        }
      }
    }

    if (!label) {
      const segment = segments[i] ?? '';
      label = segment
        .replace(/-/g, ' ')
        .replace(/\b\w/g, (char) => char.toUpperCase());
    }

    breadcrumbs.push({
      label,
      href: currentPath,
      current: isCurrent,
    });
  }

  return breadcrumbs;
};

export const getBreadcrumbStructuredData = (
  breadcrumbs: BreadcrumbItem[],
  baseUrl: string
): object => {
  return {
    '@context': 'https://schema.org',
    '@type': 'BreadcrumbList',
    itemListElement: breadcrumbs.map((item, index) => ({
      '@type': 'ListItem',
      position: index + 1,
      name: item.label,
      item: `${baseUrl}${item.href}`,
    })),
  };
};
