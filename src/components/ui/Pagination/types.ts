export type PaginationVariant = 'default' | 'compact' | 'simple';

export type PaginationProps = {
  page: number;
  totalPages: number;
  pageRange: number[];
  canGoNext: boolean;
  canGoPrev: boolean;
  onPageChange: (page: number) => void;
  onNextPage: () => void;
  onPrevPage: () => void;
  onFirstPage?: () => void;
  onLastPage?: () => void;
  variant?: PaginationVariant;
  showFirstLast?: boolean;
  showPageInfo?: boolean;
  pageInfoTemplate?: string;
  className?: string;
  disabled?: boolean;
};

export type PageSizeSelectorProps = {
  pageSize: number;
  pageSizeOptions?: number[];
  onPageSizeChange: (pageSize: number) => void;
  disabled?: boolean;
  className?: string;
};
