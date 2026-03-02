'use client';

import { createQueryCache } from './cache';

import type { QueryCache } from './types';

export const createTestCache = (): QueryCache => {
  return createQueryCache(1000);
};
