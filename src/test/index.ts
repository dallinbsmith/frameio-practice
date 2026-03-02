export * from './test-utils';

export * from './types';

export {
  assetFactory,
  commentFactory,
  createAsset,
  createAssets,
  createComment,
  createComments,
  createFactory,
  createProject,
  createProjects,
  createSequence,
  createUser,
  createUsers,
  emailSequence,
  generateId,
  nameSequence,
  projectFactory,
  projectNameSequence,
  resetIdCounter,
  userFactory,
} from './factories';

export type {
  DeepPartial,
  Factory,
  SequenceGenerator,
  TraitDefinition,
} from './factories';

export {
  customMatchers,
  setupCustomMatchers,
  toBeEmptyArray,
  toBeOneOf,
  toBeValidDate,
  toBeValidEmail,
  toBeValidURL,
  toBeValidUUID,
  toBeWithinRange,
  toContainObject,
  toHaveBeenCalledAfter,
  toHaveBeenCalledBefore,
  toHaveBeenCalledWithMatch,
  toHaveClass,
  toHaveErrorMessage,
  toHaveLength,
  toHaveStyleProperty,
} from './matchers';

export {
  createFetchMock,
  createIntersectionObserverMock,
  createMatchMediaMock,
  createResizeObserverMock,
  createStorageMock,
  createTimerMock,
} from './mocks';

export {
  createAsyncHookTester,
  createEffectTracker,
  createHookTestHarness,
  createMockHookState,
  renderHookWithSetup,
  spyOnUseState,
  useTestEffect,
  waitForHookToSettle,
} from './hooks';

export type {
  EffectTracker,
  HookRenderOptions,
  MockHookState,
  UseStateSpyResult,
} from './hooks';

export {
  assertAccessible,
  assertDescribedBy,
  assertFocusable,
  assertHasRole,
  assertLiveRegion,
  checkAriaAttributes,
  checkColorContrast,
  checkFormAccessibility,
  checkHeadingOrder,
  checkImageAccessibility,
  getAccessibleName,
  getAllByRole as a11yGetAllByRole,
  getImplicitRole,
  queryByRole as a11yQueryByRole,
  runA11yAudit,
} from './a11y';

export {
  blur,
  clearAndType,
  click,
  copy,
  createKeyboardEvent,
  createPointerEvent,
  doubleClick,
  dragEnd,
  dragOver,
  dragStart,
  drop,
  focus,
  hover,
  paste,
  pinch,
  pressArrowDown,
  pressArrowLeft,
  pressArrowRight,
  pressArrowUp,
  pressEnd,
  pressEnter,
  pressEscape,
  pressHome,
  pressKey,
  pressSpace,
  pressTab,
  resize,
  rightClick,
  scroll,
  scrollTo,
  simulateDragAndDrop,
  swipe,
  touch,
  typeText,
  unhover,
} from './events';

export {
  collectAsyncIterable,
  createAbortController,
  createDeferred,
  createMockTimer,
  createPromiseQueue,
  delay,
  expectToReject,
  expectToResolve,
  flushPromises,
  mockAsyncIterable,
  retry,
  waitForAbort,
  waitForCondition,
  waitForElement,
  waitForElementToBeRemoved,
  waitForValue,
  withTimeout,
} from './async';

export type { Deferred, MockTimer, PromiseQueue, RetryOptions } from './async';
