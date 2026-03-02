'use client';

export {
  useFocusTrap,
  useFocusReturn,
  useFocusOnMount,
  getFocusableElements,
  getFirstFocusable,
  getLastFocusable,
} from './useFocusTrap';

export { useRovingTabIndex, useArrowNavigation } from './useRovingTabIndex';

export {
  useAnnounce,
  AnnouncerProvider,
  useAnnouncementOnChange,
} from './useAnnounce';

export {
  useKeyboardNavigation,
  useEscapeKey,
  useHotkey,
  useTypeahead,
} from './useKeyboard';

export {
  generateId,
  useGeneratedId,
  useAriaIds,
  useAriaExpanded,
  useAriaSelected,
  combineAriaDescribedBy,
} from './aria';

export {
  useFocusVisible,
  useFocusWithin,
  useAutoFocus,
} from './useFocusVisible';

export { VisuallyHidden, visuallyHiddenStyles } from './VisuallyHidden';
export { SkipLink, SkipLinks } from './SkipLink';

export {
  Field,
  FieldLabel,
  FieldDescription,
  FieldError,
  FieldInput,
  AccessibleFormGroup,
} from './AccessibleForm';

export type {
  FocusTrapOptions,
  FocusTrapReturn,
  RovingTabIndexOptions,
  RovingTabIndexReturn,
  AnnounceOptions,
  UseAnnounceReturn,
  SkipLinkProps,
  VisuallyHiddenProps,
  FocusableElement,
  KeyboardNavigationOptions,
} from './types';
