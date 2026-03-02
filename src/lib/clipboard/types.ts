export type ClipboardContentType = 'text' | 'html' | 'image' | 'files';

export type ClipboardPermission = 'granted' | 'denied' | 'prompt';

export type ClipboardState = {
  isSupported: boolean;
  isReading: boolean;
  isWriting: boolean;
  lastCopied: string | null;
  lastCopiedAt: number | null;
  error: Error | null;
};

export type CopyOptions = {
  format?: 'text' | 'html' | undefined;
  onSuccess?: (() => void) | undefined;
  onError?: ((error: Error) => void) | undefined;
  showNotification?: boolean | undefined;
  notificationDuration?: number | undefined;
};

export type CopyResult = {
  success: boolean;
  error: Error | null;
  method: 'clipboard-api' | 'exec-command' | 'fallback';
};

export type PasteOptions = {
  allowedTypes?: ClipboardContentType[] | undefined;
  onSuccess?: ((content: ClipboardContent) => void) | undefined;
  onError?: ((error: Error) => void) | undefined;
};

export type ClipboardContent = {
  text: string | null;
  html: string | null;
  files: File[] | null;
  hasText: boolean;
  hasHtml: boolean;
  hasFiles: boolean;
  hasImages: boolean;
};

export type ClipboardItem = {
  type: string;
  data: string | Blob;
};

export type UseClipboardOptions = {
  timeout?: number | undefined;
  onCopy?: ((text: string) => void) | undefined;
  onError?: ((error: Error) => void) | undefined;
};

export type UseClipboardReturn = {
  copy: (text: string) => Promise<boolean>;
  paste: () => Promise<string | null>;
  copied: boolean;
  error: Error | null;
  isSupported: boolean;
  reset: () => void;
};

export type CopyButtonProps = {
  text: string;
  onCopy?: (() => void) | undefined;
  onError?: ((error: Error) => void) | undefined;
  copiedDuration?: number | undefined;
};

export type ShareData = {
  title?: string | undefined;
  text?: string | undefined;
  url?: string | undefined;
  files?: File[] | undefined;
};

export type ShareOptions = {
  fallbackToCopy?: boolean | undefined;
  onSuccess?: (() => void) | undefined;
  onError?: ((error: Error) => void) | undefined;
};

export type ShareResult = {
  success: boolean;
  method: 'share-api' | 'clipboard' | 'none';
  error: Error | null;
};
