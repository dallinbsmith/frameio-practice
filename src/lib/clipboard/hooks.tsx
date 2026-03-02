'use client';

import { useCallback, useEffect, useRef, useState } from 'react';

import {
  copyHtmlToClipboard,
  copyToClipboard,
  getClipboardText,
  isClipboardReadSupported,
  isClipboardWriteSupported,
  readFromClipboard,
} from './operations';
import { canShare, share } from './share';

import type {
  ClipboardContent,
  ShareData,
  ShareOptions,
  ShareResult,
  UseClipboardOptions,
  UseClipboardReturn,
} from './types';

export const useClipboard = (
  options: UseClipboardOptions = {}
): UseClipboardReturn => {
  const { timeout = 2000, onCopy, onError } = options;

  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const isSupported = isClipboardWriteSupported();

  const reset = useCallback(() => {
    setCopied(false);
    setError(null);
    if (timeoutRef.current) {
      clearTimeout(timeoutRef.current);
      timeoutRef.current = null;
    }
  }, []);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      reset();

      const result = await copyToClipboard(text);

      if (result.success) {
        setCopied(true);
        onCopy?.(text);

        if (timeout > 0) {
          timeoutRef.current = setTimeout(() => {
            setCopied(false);
          }, timeout);
        }

        return true;
      }

      setError(result.error);
      onError?.(result.error ?? new Error('Copy failed'));
      return false;
    },
    [timeout, onCopy, onError, reset]
  );

  const paste = useCallback(async (): Promise<string | null> => {
    const text = await getClipboardText();
    return text;
  }, []);

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return {
    copy,
    paste,
    copied,
    error,
    isSupported,
    reset,
  };
};

export const useCopyToClipboard = (
  options: { timeout?: number } = {}
): [boolean, (text: string) => Promise<boolean>] => {
  const { timeout = 2000 } = options;
  const [copied, setCopied] = useState(false);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(
    async (text: string): Promise<boolean> => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      const result = await copyToClipboard(text);

      if (result.success) {
        setCopied(true);

        if (timeout > 0) {
          timeoutRef.current = setTimeout(() => {
            setCopied(false);
          }, timeout);
        }

        return true;
      }

      return false;
    },
    [timeout]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return [copied, copy];
};

export const usePasteFromClipboard = (): {
  paste: () => Promise<ClipboardContent>;
  isSupported: boolean;
  isLoading: boolean;
  error: Error | null;
} => {
  const [isLoading, setIsLoading] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const isSupported = isClipboardReadSupported();

  const paste = useCallback(async (): Promise<ClipboardContent> => {
    setIsLoading(true);
    setError(null);

    try {
      const content = await readFromClipboard();
      return content;
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
      return {
        text: null,
        html: null,
        files: null,
        hasText: false,
        hasHtml: false,
        hasFiles: false,
        hasImages: false,
      };
    } finally {
      setIsLoading(false);
    }
  }, []);

  return { paste, isSupported, isLoading, error };
};

export const useClipboardText = (): {
  text: string | null;
  read: () => Promise<void>;
  write: (text: string) => Promise<boolean>;
  isReading: boolean;
  isWriting: boolean;
  error: Error | null;
} => {
  const [text, setText] = useState<string | null>(null);
  const [isReading, setIsReading] = useState(false);
  const [isWriting, setIsWriting] = useState(false);
  const [error, setError] = useState<Error | null>(null);

  const read = useCallback(async () => {
    setIsReading(true);
    setError(null);

    try {
      const clipboardText = await getClipboardText();
      setText(clipboardText);
    } catch (err) {
      const error = err instanceof Error ? err : new Error(String(err));
      setError(error);
    } finally {
      setIsReading(false);
    }
  }, []);

  const write = useCallback(async (newText: string): Promise<boolean> => {
    setIsWriting(true);
    setError(null);

    try {
      const result = await copyToClipboard(newText);
      if (result.success) {
        setText(newText);
        return true;
      }
      setError(result.error);
      return false;
    } finally {
      setIsWriting(false);
    }
  }, []);

  return { text, read, write, isReading, isWriting, error };
};

export const useCopyHtml = (
  options: { timeout?: number } = {}
): {
  copy: (html: string, plainText?: string) => Promise<boolean>;
  copied: boolean;
  error: Error | null;
} => {
  const { timeout = 2000 } = options;
  const [copied, setCopied] = useState(false);
  const [error, setError] = useState<Error | null>(null);
  const timeoutRef = useRef<ReturnType<typeof setTimeout> | null>(null);

  const copy = useCallback(
    async (html: string, plainText?: string): Promise<boolean> => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }

      setError(null);
      const result = await copyHtmlToClipboard(html, plainText);

      if (result.success) {
        setCopied(true);

        if (timeout > 0) {
          timeoutRef.current = setTimeout(() => {
            setCopied(false);
          }, timeout);
        }

        return true;
      }

      setError(result.error);
      return false;
    },
    [timeout]
  );

  useEffect(() => {
    return () => {
      if (timeoutRef.current) {
        clearTimeout(timeoutRef.current);
      }
    };
  }, []);

  return { copy, copied, error };
};

export const useShare = (): {
  share: (data: ShareData, options?: ShareOptions) => Promise<ShareResult>;
  canShare: (data?: ShareData) => boolean;
  isSharing: boolean;
  lastResult: ShareResult | null;
} => {
  const [isSharing, setIsSharing] = useState(false);
  const [lastResult, setLastResult] = useState<ShareResult | null>(null);

  const shareData = useCallback(
    async (data: ShareData, options?: ShareOptions): Promise<ShareResult> => {
      setIsSharing(true);

      try {
        const result = await share(data, options);
        setLastResult(result);
        return result;
      } finally {
        setIsSharing(false);
      }
    },
    []
  );

  const checkCanShare = useCallback((data?: ShareData): boolean => {
    return canShare(data);
  }, []);

  return {
    share: shareData,
    canShare: checkCanShare,
    isSharing,
    lastResult,
  };
};

export const useCopyWithNotification = (
  notification: { show: (message: string) => void },
  options: {
    successMessage?: string;
    errorMessage?: string;
    timeout?: number;
  } = {}
): [(text: string) => Promise<boolean>, boolean] => {
  const {
    successMessage = 'Copied to clipboard',
    errorMessage = 'Failed to copy',
    timeout = 2000,
  } = options;

  const [copied, copy] = useCopyToClipboard({ timeout });

  const copyWithNotification = useCallback(
    async (text: string): Promise<boolean> => {
      const success = await copy(text);

      if (success) {
        notification.show(successMessage);
      } else {
        notification.show(errorMessage);
      }

      return success;
    },
    [copy, notification, successMessage, errorMessage]
  );

  return [copyWithNotification, copied];
};

export const useClipboardHistory = (
  maxItems = 10
): {
  history: string[];
  add: (text: string) => void;
  remove: (index: number) => void;
  clear: () => void;
  copyFromHistory: (index: number) => Promise<boolean>;
} => {
  const [history, setHistory] = useState<string[]>([]);

  const add = useCallback(
    (text: string) => {
      setHistory((prev) => {
        const filtered = prev.filter((item) => item !== text);
        return [text, ...filtered].slice(0, maxItems);
      });
    },
    [maxItems]
  );

  const remove = useCallback((index: number) => {
    setHistory((prev) => prev.filter((_, i) => i !== index));
  }, []);

  const clear = useCallback(() => {
    setHistory([]);
  }, []);

  const copyFromHistory = useCallback(
    async (index: number): Promise<boolean> => {
      const text = history[index];
      if (!text) return false;

      const result = await copyToClipboard(text);
      return result.success;
    },
    [history]
  );

  return { history, add, remove, clear, copyFromHistory };
};

export const useClipboardSupport = (): {
  canWrite: boolean;
  canRead: boolean;
  canShare: boolean;
} => {
  const [support, setSupport] = useState({
    canWrite: false,
    canRead: false,
    canShare: false,
  });

  useEffect(() => {
    setSupport({
      canWrite: isClipboardWriteSupported(),
      canRead: isClipboardReadSupported(),
      canShare: canShare(),
    });
  }, []);

  return support;
};
