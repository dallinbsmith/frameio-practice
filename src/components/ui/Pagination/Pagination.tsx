'use client';

import { useCallback } from 'react';
import styled, { css } from 'styled-components';

import type {
  PageSizeSelectorProps,
  PaginationProps,
  PaginationVariant,
} from './types';

const Container = styled.nav<{ $variant: PaginationVariant }>`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);

  ${({ $variant }) =>
    $variant === 'compact' &&
    css`
      gap: var(--spacing-1);
    `}
`;

const PageList = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-1);
`;

const PageButton = styled.button<{
  $isActive?: boolean;
  $variant: PaginationVariant;
}>`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: ${({ $variant }) => ($variant === 'compact' ? '32px' : '36px')};
  height: ${({ $variant }) => ($variant === 'compact' ? '32px' : '36px')};
  padding: 0 var(--spacing-2);
  border: 1px solid
    ${({ $isActive }) =>
      $isActive ? 'var(--color-brand-500)' : 'var(--color-border-default)'};
  border-radius: var(--radius-md);
  background-color: ${({ $isActive }) =>
    $isActive ? 'var(--color-brand-500)' : 'var(--color-bg-primary)'};
  color: ${({ $isActive }) =>
    $isActive ? 'white' : 'var(--color-fg-primary)'};
  font-size: var(--font-size-sm);
  font-weight: ${({ $isActive }) =>
    $isActive ? 'var(--font-weight-medium)' : 'var(--font-weight-normal)'};
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-default);

  &:hover:not(:disabled) {
    border-color: var(--color-brand-400);
    background-color: ${({ $isActive }) =>
      $isActive ? 'var(--color-brand-600)' : 'var(--color-brand-50)'};
  }

  &:focus-visible {
    outline: 2px solid var(--color-brand-500);
    outline-offset: 2px;
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

const NavButton = styled(PageButton)`
  min-width: auto;
  padding: 0 var(--spacing-3);
`;

const Ellipsis = styled.span`
  display: flex;
  align-items: center;
  justify-content: center;
  min-width: 32px;
  height: 32px;
  color: var(--color-fg-tertiary);
  font-size: var(--font-size-sm);
`;

const PageInfo = styled.span`
  font-size: var(--font-size-sm);
  color: var(--color-fg-secondary);
  white-space: nowrap;
`;

const ChevronLeft = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="15 18 9 12 15 6" />
  </svg>
);

const ChevronRight = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="9 18 15 12 9 6" />
  </svg>
);

const ChevronsLeft = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="11 17 6 12 11 7" />
    <polyline points="18 17 13 12 18 7" />
  </svg>
);

const ChevronsRight = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="13 17 18 12 13 7" />
    <polyline points="6 17 11 12 6 7" />
  </svg>
);

export const Pagination = ({
  page,
  totalPages,
  pageRange,
  canGoNext,
  canGoPrev,
  onPageChange,
  onNextPage,
  onPrevPage,
  onFirstPage,
  onLastPage,
  variant = 'default',
  showFirstLast = false,
  showPageInfo = false,
  pageInfoTemplate = 'Page {page} of {totalPages}',
  className,
  disabled = false,
}: PaginationProps) => {
  const handlePageClick = useCallback(
    (pageNum: number) => {
      if (!disabled && pageNum !== page) {
        onPageChange(pageNum);
      }
    },
    [disabled, page, onPageChange]
  );

  if (variant === 'simple') {
    return (
      <Container
        $variant={variant}
        className={className}
        aria-label="Pagination"
      >
        <NavButton
          $variant={variant}
          onClick={onPrevPage}
          disabled={!canGoPrev || disabled}
          aria-label="Previous page"
        >
          <ChevronLeft />
          Previous
        </NavButton>
        {showPageInfo && (
          <PageInfo>
            {pageInfoTemplate
              .replace('{page}', String(page))
              .replace('{totalPages}', String(totalPages))}
          </PageInfo>
        )}
        <NavButton
          $variant={variant}
          onClick={onNextPage}
          disabled={!canGoNext || disabled}
          aria-label="Next page"
        >
          Next
          <ChevronRight />
        </NavButton>
      </Container>
    );
  }

  return (
    <Container $variant={variant} className={className} aria-label="Pagination">
      {showFirstLast && onFirstPage && (
        <PageButton
          $variant={variant}
          onClick={onFirstPage}
          disabled={!canGoPrev || disabled}
          aria-label="First page"
        >
          <ChevronsLeft />
        </PageButton>
      )}

      <PageButton
        $variant={variant}
        onClick={onPrevPage}
        disabled={!canGoPrev || disabled}
        aria-label="Previous page"
      >
        <ChevronLeft />
      </PageButton>

      <PageList>
        {pageRange.map((pageNum, index) =>
          pageNum === -1 ? (
            <Ellipsis key={`ellipsis-${index}`}>...</Ellipsis>
          ) : (
            <PageButton
              key={pageNum}
              $variant={variant}
              $isActive={pageNum === page}
              onClick={() => handlePageClick(pageNum)}
              disabled={disabled}
              aria-label={`Page ${pageNum}`}
              aria-current={pageNum === page ? 'page' : undefined}
            >
              {pageNum}
            </PageButton>
          )
        )}
      </PageList>

      <PageButton
        $variant={variant}
        onClick={onNextPage}
        disabled={!canGoNext || disabled}
        aria-label="Next page"
      >
        <ChevronRight />
      </PageButton>

      {showFirstLast && onLastPage && (
        <PageButton
          $variant={variant}
          onClick={onLastPage}
          disabled={!canGoNext || disabled}
          aria-label="Last page"
        >
          <ChevronsRight />
        </PageButton>
      )}

      {showPageInfo && (
        <PageInfo>
          {pageInfoTemplate
            .replace('{page}', String(page))
            .replace('{totalPages}', String(totalPages))}
        </PageInfo>
      )}
    </Container>
  );
};

const SelectorContainer = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-2);
`;

const SelectorLabel = styled.label`
  font-size: var(--font-size-sm);
  color: var(--color-fg-secondary);
`;

const SelectorSelect = styled.select`
  padding: var(--spacing-2) var(--spacing-3);
  border: 1px solid var(--color-border-default);
  border-radius: var(--radius-md);
  background-color: var(--color-bg-primary);
  color: var(--color-fg-primary);
  font-size: var(--font-size-sm);
  cursor: pointer;
  transition: border-color var(--duration-fast) var(--ease-default);

  &:hover:not(:disabled) {
    border-color: var(--color-brand-400);
  }

  &:focus {
    outline: none;
    border-color: var(--color-brand-500);
    box-shadow: 0 0 0 3px var(--color-brand-100);
  }

  &:disabled {
    opacity: 0.5;
    cursor: not-allowed;
  }
`;

export const PageSizeSelector = ({
  pageSize,
  pageSizeOptions = [10, 25, 50, 100],
  onPageSizeChange,
  disabled = false,
  className,
}: PageSizeSelectorProps) => {
  return (
    <SelectorContainer className={className}>
      <SelectorLabel htmlFor="page-size">Show</SelectorLabel>
      <SelectorSelect
        id="page-size"
        value={pageSize}
        onChange={(e) => onPageSizeChange(Number(e.target.value))}
        disabled={disabled}
      >
        {pageSizeOptions.map((option) => (
          <option key={option} value={option}>
            {option}
          </option>
        ))}
      </SelectorSelect>
      <SelectorLabel>per page</SelectorLabel>
    </SelectorContainer>
  );
};

export default Pagination;
