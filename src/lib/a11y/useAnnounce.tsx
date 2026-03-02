'use client';

import {
  createContext,
  useCallback,
  useContext,
  useEffect,
  useRef,
  useState,
} from 'react';
import { createPortal } from 'react-dom';

import type { AnnounceOptions } from './types';

type AnnouncerContextValue = {
  announce: (message: string, options?: AnnounceOptions) => void;
  clear: () => void;
};

const AnnouncerContext = createContext<AnnouncerContextValue | null>(null);

export const useAnnounce = (): AnnouncerContextValue => {
  const context = useContext(AnnouncerContext);

  if (!context) {
    return {
      announce: () => {
        if (process.env.NODE_ENV === 'development') {
          console.warn(
            'useAnnounce: No AnnouncerProvider found. Wrap your app with <AnnouncerProvider>.'
          );
        }
      },
      clear: () => {},
    };
  }

  return context;
};

type AnnouncerProviderProps = {
  children: React.ReactNode;
};

const visuallyHiddenStyle: React.CSSProperties = {
  position: 'absolute',
  width: '1px',
  height: '1px',
  padding: '0',
  margin: '-1px',
  overflow: 'hidden',
  clip: 'rect(0, 0, 0, 0)',
  whiteSpace: 'nowrap',
  border: '0',
};

export const AnnouncerProvider = ({
  children,
}: AnnouncerProviderProps): React.ReactNode => {
  const [politeMessage, setPoliteMessage] = useState('');
  const [assertiveMessage, setAssertiveMessage] = useState('');
  const clearTimeoutRef = useRef<NodeJS.Timeout | null>(null);
  const [mounted, setMounted] = useState(false);

  useEffect(() => {
    setMounted(true);
    return () => setMounted(false);
  }, []);

  const clear = useCallback(() => {
    setPoliteMessage('');
    setAssertiveMessage('');
    if (clearTimeoutRef.current) {
      clearTimeout(clearTimeoutRef.current);
      clearTimeoutRef.current = null;
    }
  }, []);

  const announce = useCallback(
    (message: string, options: AnnounceOptions = {}) => {
      const { politeness = 'polite', clearAfter = 5000 } = options;

      clear();

      requestAnimationFrame(() => {
        if (politeness === 'assertive') {
          setAssertiveMessage(message);
        } else {
          setPoliteMessage(message);
        }

        if (clearAfter > 0) {
          clearTimeoutRef.current = setTimeout(clear, clearAfter);
        }
      });
    },
    [clear]
  );

  useEffect(() => {
    return () => {
      if (clearTimeoutRef.current) {
        clearTimeout(clearTimeoutRef.current);
      }
    };
  }, []);

  const announcerElement = mounted
    ? [
        <div
          key="polite"
          role="status"
          aria-live="polite"
          aria-atomic="true"
          style={visuallyHiddenStyle}
        >
          {politeMessage}
        </div>,
        <div
          key="assertive"
          role="alert"
          aria-live="assertive"
          aria-atomic="true"
          style={visuallyHiddenStyle}
        >
          {assertiveMessage}
        </div>,
      ]
    : null;

  return (
    <AnnouncerContext.Provider value={{ announce, clear }}>
      {children}
      {mounted && createPortal(announcerElement, document.body)}
    </AnnouncerContext.Provider>
  );
};

export const useAnnouncementOnChange = (
  value: unknown,
  getMessage: (value: unknown) => string,
  options?: AnnounceOptions
): void => {
  const { announce } = useAnnounce();
  const isFirstRender = useRef(true);

  useEffect(() => {
    if (isFirstRender.current) {
      isFirstRender.current = false;
      return;
    }

    const message = getMessage(value);
    if (message) {
      announce(message, options);
    }
  }, [value, getMessage, announce, options]);
};
