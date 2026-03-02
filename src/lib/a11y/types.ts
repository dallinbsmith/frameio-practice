'use client';

export type FocusTrapOptions = {
  initialFocus?: React.RefObject<HTMLElement> | 'first' | 'container';
  returnFocus?: boolean;
  escapeDeactivates?: boolean;
  clickOutsideDeactivates?: boolean;
  onEscape?: () => void;
  onClickOutside?: () => void;
};

export type FocusTrapReturn = {
  containerRef: React.RefObject<HTMLDivElement>;
  activate: () => void;
  deactivate: () => void;
  isActive: boolean;
};

export type RovingTabIndexOptions = {
  orientation?: 'horizontal' | 'vertical' | 'both';
  loop?: boolean;
  onSelect?: (index: number) => void;
  initialIndex?: number;
};

export type RovingTabIndexReturn<T extends HTMLElement> = {
  items: Array<{
    ref: React.RefObject<T>;
    tabIndex: number;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onFocus: () => void;
  }>;
  activeIndex: number;
  setActiveIndex: (index: number) => void;
  getItemProps: (index: number) => {
    ref: React.RefObject<T>;
    tabIndex: number;
    onKeyDown: (e: React.KeyboardEvent) => void;
    onFocus: () => void;
  };
};

export type AnnounceOptions = {
  politeness?: 'polite' | 'assertive';
  clearAfter?: number;
};

export type UseAnnounceReturn = {
  announce: (message: string, options?: AnnounceOptions) => void;
  clear: () => void;
  AnnouncerPortal: React.FC;
};

export type SkipLinkProps = {
  href?: string;
  children?: React.ReactNode;
  className?: string;
};

export type VisuallyHiddenProps = {
  children: React.ReactNode;
  as?: keyof JSX.IntrinsicElements;
  isFocusable?: boolean;
};

export type FocusableElement =
  | HTMLAnchorElement
  | HTMLButtonElement
  | HTMLInputElement
  | HTMLSelectElement
  | HTMLTextAreaElement
  | HTMLElement;

export type KeyboardNavigationOptions = {
  onArrowUp?: () => void;
  onArrowDown?: () => void;
  onArrowLeft?: () => void;
  onArrowRight?: () => void;
  onEnter?: () => void;
  onSpace?: () => void;
  onEscape?: () => void;
  onHome?: () => void;
  onEnd?: () => void;
  onTab?: (e: React.KeyboardEvent) => void;
  preventDefault?: boolean;
};
