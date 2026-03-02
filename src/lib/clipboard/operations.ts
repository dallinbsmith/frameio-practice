import type {
  ClipboardContent,
  ClipboardPermission,
  CopyOptions,
  CopyResult,
  PasteOptions,
} from './types';

export const isClipboardSupported = (): boolean => {
  return (
    typeof navigator !== 'undefined' &&
    typeof navigator.clipboard !== 'undefined'
  );
};

export const isClipboardWriteSupported = (): boolean => {
  return (
    isClipboardSupported() &&
    typeof navigator.clipboard.writeText === 'function'
  );
};

export const isClipboardReadSupported = (): boolean => {
  return (
    isClipboardSupported() && typeof navigator.clipboard.readText === 'function'
  );
};

export const isExecCommandSupported = (): boolean => {
  return (
    typeof document !== 'undefined' &&
    typeof document.execCommand === 'function'
  );
};

export const isShareSupported = (): boolean => {
  return (
    typeof navigator !== 'undefined' && typeof navigator.share === 'function'
  );
};

export const isShareFilesSupported = (): boolean => {
  return (
    isShareSupported() &&
    typeof navigator.canShare === 'function' &&
    navigator.canShare({ files: [] })
  );
};

export const getClipboardPermission = async (
  type: 'read' | 'write' = 'write'
): Promise<ClipboardPermission> => {
  if (typeof navigator === 'undefined' || !navigator.permissions) {
    return 'prompt';
  }

  try {
    const permissionName =
      type === 'read' ? 'clipboard-read' : 'clipboard-write';
    const result = await navigator.permissions.query({
      name: permissionName as PermissionName,
    });
    return result.state as ClipboardPermission;
  } catch {
    return 'prompt';
  }
};

const copyWithClipboardApi = async (text: string): Promise<void> => {
  await navigator.clipboard.writeText(text);
};

const copyWithExecCommand = (text: string): boolean => {
  const textarea = document.createElement('textarea');
  textarea.value = text;

  textarea.style.position = 'fixed';
  textarea.style.left = '-9999px';
  textarea.style.top = '-9999px';
  textarea.style.opacity = '0';
  textarea.setAttribute('readonly', '');
  textarea.setAttribute('aria-hidden', 'true');

  document.body.appendChild(textarea);

  const selection = document.getSelection();
  const originalRange =
    selection && selection.rangeCount > 0 ? selection.getRangeAt(0) : null;

  textarea.select();
  textarea.setSelectionRange(0, text.length);

  let success = false;
  try {
    success = document.execCommand('copy');
  } finally {
    document.body.removeChild(textarea);

    if (originalRange && selection) {
      selection.removeAllRanges();
      selection.addRange(originalRange);
    }
  }

  return success;
};

export const copyToClipboard = async (
  text: string,
  options: CopyOptions = {}
): Promise<CopyResult> => {
  const { onSuccess, onError } = options;

  if (isClipboardWriteSupported()) {
    try {
      await copyWithClipboardApi(text);
      onSuccess?.();
      return { success: true, error: null, method: 'clipboard-api' };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));

      if (isExecCommandSupported()) {
        const success = copyWithExecCommand(text);
        if (success) {
          onSuccess?.();
          return { success: true, error: null, method: 'exec-command' };
        }
      }

      onError?.(err);
      return { success: false, error: err, method: 'clipboard-api' };
    }
  }

  if (isExecCommandSupported()) {
    try {
      const success = copyWithExecCommand(text);
      if (success) {
        onSuccess?.();
        return { success: true, error: null, method: 'exec-command' };
      }
      const err = new Error('execCommand copy failed');
      onError?.(err);
      return { success: false, error: err, method: 'exec-command' };
    } catch (error) {
      const err = error instanceof Error ? error : new Error(String(error));
      onError?.(err);
      return { success: false, error: err, method: 'exec-command' };
    }
  }

  const err = new Error('Clipboard operations are not supported');
  onError?.(err);
  return { success: false, error: err, method: 'fallback' };
};

export const copyHtmlToClipboard = async (
  html: string,
  plainText?: string
): Promise<CopyResult> => {
  if (!isClipboardSupported()) {
    return copyToClipboard(plainText ?? html);
  }

  try {
    const htmlBlob = new Blob([html], { type: 'text/html' });
    const textBlob = new Blob([plainText ?? html], { type: 'text/plain' });

    const clipboardItem = new ClipboardItem({
      'text/html': htmlBlob,
      'text/plain': textBlob,
    });

    await navigator.clipboard.write([clipboardItem]);
    return { success: true, error: null, method: 'clipboard-api' };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return { success: false, error: err, method: 'clipboard-api' };
  }
};

export const readFromClipboard = async (
  options: PasteOptions = {}
): Promise<ClipboardContent> => {
  const emptyContent: ClipboardContent = {
    text: null,
    html: null,
    files: null,
    hasText: false,
    hasHtml: false,
    hasFiles: false,
    hasImages: false,
  };

  if (!isClipboardReadSupported()) {
    options.onError?.(new Error('Clipboard read is not supported'));
    return emptyContent;
  }

  try {
    const text = await navigator.clipboard.readText();

    const content: ClipboardContent = {
      text,
      html: null,
      files: null,
      hasText: text.length > 0,
      hasHtml: false,
      hasFiles: false,
      hasImages: false,
    };

    options.onSuccess?.(content);
    return content;
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    options.onError?.(err);
    return emptyContent;
  }
};

export const readRichClipboard = async (): Promise<ClipboardContent> => {
  const emptyContent: ClipboardContent = {
    text: null,
    html: null,
    files: null,
    hasText: false,
    hasHtml: false,
    hasFiles: false,
    hasImages: false,
  };

  if (
    !isClipboardSupported() ||
    typeof navigator.clipboard.read !== 'function'
  ) {
    return emptyContent;
  }

  try {
    const items = await navigator.clipboard.read();
    let text: string | null = null;
    let html: string | null = null;
    const files: File[] = [];

    for (const item of items) {
      for (const type of item.types) {
        const blob = await item.getType(type);

        if (type === 'text/plain') {
          text = await blob.text();
        } else if (type === 'text/html') {
          html = await blob.text();
        } else if (type.startsWith('image/')) {
          const file = new File([blob], `image.${type.split('/')[1]}`, {
            type,
          });
          files.push(file);
        }
      }
    }

    const hasImages = files.some((f) => f.type.startsWith('image/'));

    return {
      text,
      html,
      files: files.length > 0 ? files : null,
      hasText: text !== null && text.length > 0,
      hasHtml: html !== null && html.length > 0,
      hasFiles: files.length > 0,
      hasImages,
    };
  } catch {
    return emptyContent;
  }
};

export const copyImageToClipboard = async (
  imageSource: string | Blob
): Promise<CopyResult> => {
  if (!isClipboardSupported()) {
    return {
      success: false,
      error: new Error('Clipboard API not supported'),
      method: 'fallback',
    };
  }

  try {
    let blob: Blob;

    if (typeof imageSource === 'string') {
      const response = await fetch(imageSource);
      blob = await response.blob();
    } else {
      blob = imageSource;
    }

    const clipboardItem = new ClipboardItem({
      [blob.type]: blob,
    });

    await navigator.clipboard.write([clipboardItem]);
    return { success: true, error: null, method: 'clipboard-api' };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return { success: false, error: err, method: 'clipboard-api' };
  }
};

export const clearClipboard = async (): Promise<boolean> => {
  const result = await copyToClipboard('');
  return result.success;
};

export const copyMultipleFormats = async (
  formats: Record<string, string | Blob>
): Promise<CopyResult> => {
  if (!isClipboardSupported()) {
    if ('text/plain' in formats) {
      const text = formats['text/plain'];
      return copyToClipboard(typeof text === 'string' ? text : '');
    }
    return {
      success: false,
      error: new Error('Clipboard API not supported'),
      method: 'fallback',
    };
  }

  try {
    const blobFormats: Record<string, Blob> = {};

    for (const [type, data] of Object.entries(formats)) {
      if (typeof data === 'string') {
        blobFormats[type] = new Blob([data], { type });
      } else {
        blobFormats[type] = data;
      }
    }

    const clipboardItem = new ClipboardItem(blobFormats);
    await navigator.clipboard.write([clipboardItem]);

    return { success: true, error: null, method: 'clipboard-api' };
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return { success: false, error: err, method: 'clipboard-api' };
  }
};

export const getClipboardText = async (): Promise<string | null> => {
  if (!isClipboardReadSupported()) {
    return null;
  }

  try {
    const text = await navigator.clipboard.readText();
    return text ?? null;
  } catch {
    return null;
  }
};

export const hasClipboardText = async (): Promise<boolean> => {
  const text = await getClipboardText();
  return typeof text === 'string' && text.length > 0;
};
