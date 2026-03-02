import {
  copyToClipboard,
  isShareFilesSupported,
  isShareSupported,
} from './operations';

import type { ShareData, ShareOptions, ShareResult } from './types';

const toNativeShareData = (data: ShareData): globalThis.ShareData => {
  const native: globalThis.ShareData = {};
  if (data.title !== undefined) native.title = data.title;
  if (data.text !== undefined) native.text = data.text;
  if (data.url !== undefined) native.url = data.url;
  if (data.files !== undefined) native.files = data.files;
  return native;
};

export const canShare = (data?: ShareData): boolean => {
  if (!isShareSupported()) return false;

  if (!data) return true;

  if (data.files && data.files.length > 0) {
    if (!isShareFilesSupported()) return false;

    try {
      return navigator.canShare({ files: data.files });
    } catch {
      return false;
    }
  }

  try {
    return navigator.canShare(toNativeShareData(data));
  } catch {
    return false;
  }
};

export const share = async (
  data: ShareData,
  options: ShareOptions = {}
): Promise<ShareResult> => {
  const { fallbackToCopy = true, onSuccess, onError } = options;

  if (canShare(data)) {
    try {
      await navigator.share(toNativeShareData(data));
      onSuccess?.();
      return { success: true, method: 'share-api', error: null };
    } catch (error) {
      if (error instanceof Error && error.name === 'AbortError') {
        return { success: false, method: 'share-api', error: null };
      }

      const err = error instanceof Error ? error : new Error(String(error));

      if (fallbackToCopy && (data.url || data.text)) {
        const textToCopy = data.url ?? data.text ?? '';
        const copyResult = await copyToClipboard(textToCopy);

        if (copyResult.success) {
          onSuccess?.();
          return { success: true, method: 'clipboard', error: null };
        }
      }

      onError?.(err);
      return { success: false, method: 'share-api', error: err };
    }
  }

  if (fallbackToCopy && (data.url || data.text)) {
    const textToCopy = data.url ?? data.text ?? '';
    const copyResult = await copyToClipboard(textToCopy);

    if (copyResult.success) {
      onSuccess?.();
      return { success: true, method: 'clipboard', error: null };
    }

    const err = copyResult.error ?? new Error('Copy failed');
    onError?.(err);
    return { success: false, method: 'clipboard', error: err };
  }

  const err = new Error('Share not supported and no fallback available');
  onError?.(err);
  return { success: false, method: 'none', error: err };
};

export const shareUrl = async (
  url: string,
  title?: string,
  text?: string,
  options?: ShareOptions
): Promise<ShareResult> => {
  return share({ url, title, text }, options);
};

export const shareText = async (
  text: string,
  title?: string,
  options?: ShareOptions
): Promise<ShareResult> => {
  return share({ text, title }, options);
};

export const shareFiles = async (
  files: File[],
  title?: string,
  text?: string,
  options?: ShareOptions
): Promise<ShareResult> => {
  return share({ files, title, text }, options);
};

export const shareImage = async (
  imageUrl: string,
  filename: string,
  title?: string,
  options?: ShareOptions
): Promise<ShareResult> => {
  try {
    const response = await fetch(imageUrl);
    const blob = await response.blob();
    const file = new File([blob], filename, { type: blob.type });

    return shareFiles([file], title, undefined, options);
  } catch (error) {
    const err = error instanceof Error ? error : new Error(String(error));
    return { success: false, method: 'none', error: err };
  }
};

export const createShareUrl = (
  platform: 'twitter' | 'facebook' | 'linkedin' | 'email' | 'whatsapp',
  data: { url?: string; text?: string; title?: string }
): string => {
  const { url = '', text = '', title = '' } = data;
  const encodedUrl = encodeURIComponent(url);
  const encodedText = encodeURIComponent(text);
  const encodedTitle = encodeURIComponent(title);

  switch (platform) {
    case 'twitter':
      return `https://twitter.com/intent/tweet?url=${encodedUrl}&text=${encodedText}`;

    case 'facebook':
      return `https://www.facebook.com/sharer/sharer.php?u=${encodedUrl}`;

    case 'linkedin':
      return `https://www.linkedin.com/sharing/share-offsite/?url=${encodedUrl}`;

    case 'email':
      return `mailto:?subject=${encodedTitle}&body=${encodedText}%0A%0A${encodedUrl}`;

    case 'whatsapp':
      return `https://wa.me/?text=${encodedText}%20${encodedUrl}`;

    default:
      return '';
  }
};

export const openShareWindow = (
  url: string,
  options: { width?: number; height?: number } = {}
): Window | null => {
  const { width = 600, height = 400 } = options;

  if (typeof window === 'undefined') return null;

  const left = window.screenX + (window.outerWidth - width) / 2;
  const top = window.screenY + (window.outerHeight - height) / 2;

  return window.open(
    url,
    'share',
    `width=${width},height=${height},left=${left},top=${top},toolbar=no,menubar=no,scrollbars=yes`
  );
};

export const shareToSocialMedia = (
  platform: 'twitter' | 'facebook' | 'linkedin' | 'whatsapp',
  data: { url?: string; text?: string; title?: string }
): Window | null => {
  const shareUrl = createShareUrl(platform, data);
  return openShareWindow(shareUrl);
};

export const shareViaEmail = (data: {
  url?: string;
  text?: string;
  title?: string;
}): void => {
  const emailUrl = createShareUrl('email', data);
  if (typeof window !== 'undefined') {
    window.location.href = emailUrl;
  }
};

export const getShareablePlatforms = (): string[] => {
  const platforms: string[] = ['email'];

  if (isShareSupported()) {
    platforms.unshift('native');
  }

  platforms.push('twitter', 'facebook', 'linkedin', 'whatsapp');

  return platforms;
};
