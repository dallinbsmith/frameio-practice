'use client';

import type { RenderResult } from '@testing-library/react';
import type { UserEvent } from '@testing-library/user-event';
import type { ReactElement, ReactNode } from 'react';

export type TestUser = {
  id: string;
  email: string;
  name: string;
  avatar?: string | undefined;
  role: 'admin' | 'user' | 'guest';
  createdAt: Date;
  metadata?: Record<string, unknown> | undefined;
};

export type TestProject = {
  id: string;
  name: string;
  description?: string | undefined;
  ownerId: string;
  teamIds: string[];
  status: 'active' | 'archived' | 'draft';
  createdAt: Date;
  updatedAt: Date;
};

export type TestAsset = {
  id: string;
  name: string;
  type: 'video' | 'image' | 'audio' | 'document';
  url: string;
  thumbnailUrl?: string | undefined;
  size: number;
  duration?: number | undefined;
  projectId: string;
  uploadedBy: string;
  createdAt: Date;
};

export type TestComment = {
  id: string;
  content: string;
  authorId: string;
  assetId: string;
  timestamp?: number | undefined;
  parentId?: string | undefined;
  createdAt: Date;
  updatedAt: Date;
};

export type MockFetchResponse<T> = {
  data: T;
  status?: number | undefined;
  headers?: Record<string, string> | undefined;
  delay?: number | undefined;
};

export type MockFetchError = {
  status: number;
  message: string;
  code?: string | undefined;
};

export type RenderWithProvidersResult = RenderResult & {
  user: UserEvent;
};

export type WrapperProps = {
  children: ReactNode;
};

export type CustomRenderOptions = {
  wrapper?: React.ComponentType<WrapperProps> | undefined;
  route?: string | undefined;
  initialState?: Record<string, unknown> | undefined;
};

export type MockTimerControls = {
  advanceBy: (ms: number) => void;
  advanceTo: (date: Date) => void;
  runAll: () => void;
  runNext: () => void;
  clear: () => void;
};

export type AsyncTestOptions = {
  timeout?: number | undefined;
  interval?: number | undefined;
};

export type HookTestResult<T> = {
  result: { current: T };
  rerender: (props?: unknown) => void;
  unmount: () => void;
  waitForNextUpdate: (options?: AsyncTestOptions | undefined) => Promise<void>;
};

export type MockIntersectionObserverEntry = {
  isIntersecting: boolean;
  intersectionRatio: number;
  boundingClientRect?: DOMRectReadOnly | undefined;
  target?: Element | undefined;
};

export type AccessibilityViolation = {
  id: string;
  impact: 'minor' | 'moderate' | 'serious' | 'critical';
  description: string;
  help: string;
  helpUrl: string;
  nodes: Array<{
    html: string;
    target: string[];
    failureSummary: string;
  }>;
};

export type A11yTestResult = {
  violations: AccessibilityViolation[];
  passes: number;
  incomplete: number;
};

export type MatcherContext = {
  isNot: boolean;
  promise: string;
  equals: (a: unknown, b: unknown) => boolean;
  utils: {
    matcherHint: (name: string, received?: string, expected?: string) => string;
    printReceived: (value: unknown) => string;
    printExpected: (value: unknown) => string;
    diff: (expected: unknown, received: unknown) => string | null;
  };
};

export type MatcherResult = {
  pass: boolean;
  message: () => string;
};

export type EventSimulatorOptions = {
  bubbles?: boolean | undefined;
  cancelable?: boolean | undefined;
  composed?: boolean | undefined;
};

export type KeyboardEventOptions = EventSimulatorOptions & {
  key: string;
  code?: string | undefined;
  ctrlKey?: boolean | undefined;
  shiftKey?: boolean | undefined;
  altKey?: boolean | undefined;
  metaKey?: boolean | undefined;
};

export type PointerEventOptions = EventSimulatorOptions & {
  clientX?: number | undefined;
  clientY?: number | undefined;
  button?: number | undefined;
  pointerType?: 'mouse' | 'pen' | 'touch' | undefined;
};

export type TestProviderConfig = {
  theme?: 'light' | 'dark' | undefined;
  locale?: string | undefined;
  user?: TestUser | null | undefined;
  features?: Record<string, boolean> | undefined;
};

export type SnapshotSerializerOptions = {
  ignoreProps?: string[] | undefined;
  sortProps?: boolean | undefined;
  maxDepth?: number | undefined;
};
