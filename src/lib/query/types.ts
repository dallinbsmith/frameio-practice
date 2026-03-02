'use client';

export type QueryKey = readonly unknown[];

export type QueryStatus = 'idle' | 'loading' | 'success' | 'error';

export type QueryState<TData> = {
  data: TData | undefined;
  error: Error | null;
  status: QueryStatus;
  dataUpdatedAt: number | null;
  errorUpdatedAt: number | null;
  isStale: boolean;
  fetchCount: number;
};

export type QueryOptions<TData> = {
  queryKey: QueryKey;
  queryFn: () => Promise<TData>;
  enabled?: boolean;
  staleTime?: number;
  cacheTime?: number;
  refetchOnMount?: boolean | 'always';
  refetchOnWindowFocus?: boolean;
  refetchInterval?: number | false;
  retry?: number | boolean;
  retryDelay?: number | ((attemptIndex: number) => number);
  onSuccess?: (data: TData) => void;
  onError?: (error: Error) => void;
  onSettled?: (data: TData | undefined, error: Error | null) => void;
  placeholderData?: TData | (() => TData);
  initialData?: TData | (() => TData);
  select?: (data: TData) => TData;
};

export type QueryResult<TData> = {
  data: TData | undefined;
  error: Error | null;
  status: QueryStatus;
  isLoading: boolean;
  isError: boolean;
  isSuccess: boolean;
  isFetching: boolean;
  isStale: boolean;
  refetch: () => Promise<void>;
  remove: () => void;
};

export type InfiniteQueryOptions<TData, TPageParam> = Omit<
  QueryOptions<TData>,
  'queryFn' | 'onSuccess' | 'onError' | 'onSettled'
> & {
  queryFn: (context: { pageParam: TPageParam }) => Promise<TData>;
  getNextPageParam: (
    lastPage: TData,
    allPages: TData[]
  ) => TPageParam | undefined;
  getPreviousPageParam?: (
    firstPage: TData,
    allPages: TData[]
  ) => TPageParam | undefined;
  initialPageParam: TPageParam;
  onSuccess?: (data: InfiniteData<TData>) => void;
  onError?: (error: Error) => void;
  onSettled?: (
    data: InfiniteData<TData> | undefined,
    error: Error | null
  ) => void;
};

export type InfiniteData<TData> = {
  pages: TData[];
  pageParams: unknown[];
};

export type InfiniteQueryResult<TData> = Omit<
  QueryResult<InfiniteData<TData>>,
  'data'
> & {
  data: InfiniteData<TData> | undefined;
  hasNextPage: boolean;
  hasPreviousPage: boolean;
  isFetchingNextPage: boolean;
  isFetchingPreviousPage: boolean;
  fetchNextPage: () => Promise<void>;
  fetchPreviousPage: () => Promise<void>;
};

export type PaginationState = {
  page: number;
  pageSize: number;
  total: number;
  totalPages: number;
};

export type PaginationActions = {
  setPage: (page: number) => void;
  setPageSize: (pageSize: number) => void;
  nextPage: () => void;
  prevPage: () => void;
  firstPage: () => void;
  lastPage: () => void;
};

export type PaginatedData<TData> = {
  items: TData[];
  pagination: PaginationState;
};

export type UsePaginationOptions = {
  initialPage?: number;
  initialPageSize?: number;
  total: number;
  onChange?: (page: number, pageSize: number) => void;
};

export type CacheEntry<TData> = {
  data: TData;
  dataUpdatedAt: number;
  state: QueryState<TData>;
  subscribers: Set<() => void>;
  gcTimeout?: ReturnType<typeof setTimeout>;
};

export type QueryCache = {
  get: <TData>(key: QueryKey) => CacheEntry<TData> | undefined;
  set: <TData>(key: QueryKey, entry: CacheEntry<TData>) => void;
  delete: (key: QueryKey) => void;
  clear: () => void;
  invalidate: (predicate?: (key: QueryKey) => boolean) => void;
  subscribe: (key: QueryKey, callback: () => void) => () => void;
  getAll: () => Map<string, CacheEntry<unknown>>;
};
