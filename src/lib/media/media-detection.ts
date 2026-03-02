import {
  getCategoryFromExtension,
  getCategoryFromMimeType,
  getMimeTypeFromExtension,
} from './mime-types';

import type { MediaCategory, MediaFormat, MediaInfo } from './types';

const imageExtensions = new Set([
  'jpeg',
  'jpg',
  'png',
  'gif',
  'webp',
  'avif',
  'svg',
  'ico',
  'bmp',
  'tiff',
  'tif',
]);

const videoExtensions = new Set([
  'mp4',
  'webm',
  'mov',
  'avi',
  'mkv',
  'flv',
  'm4v',
  'wmv',
  'ogv',
]);

const audioExtensions = new Set([
  'mp3',
  'wav',
  'ogg',
  'aac',
  'm4a',
  'flac',
  'wma',
  'opus',
]);

const documentExtensions = new Set([
  'pdf',
  'doc',
  'docx',
  'xls',
  'xlsx',
  'ppt',
  'pptx',
  'txt',
  'rtf',
  'csv',
]);

export const getExtensionFromUrl = (url: string): string => {
  try {
    const parsedUrl = new URL(url, 'http://localhost');
    const pathname = parsedUrl.pathname;
    const lastDot = pathname.lastIndexOf('.');
    const lastSlash = pathname.lastIndexOf('/');

    if (lastDot === -1 || lastDot < lastSlash) {
      return '';
    }

    return pathname.slice(lastDot + 1).toLowerCase();
  } catch {
    const questionIndex = url.indexOf('?');
    const hashIndex = url.indexOf('#');
    const endIndex = Math.min(
      questionIndex !== -1 ? questionIndex : url.length,
      hashIndex !== -1 ? hashIndex : url.length
    );
    const path = url.slice(0, endIndex);
    const lastDot = path.lastIndexOf('.');
    const lastSlash = path.lastIndexOf('/');

    if (lastDot === -1 || lastDot < lastSlash) {
      return '';
    }

    return path.slice(lastDot + 1).toLowerCase();
  }
};

export const getExtensionFromFilename = (filename: string): string => {
  const lastDot = filename.lastIndexOf('.');
  if (lastDot === -1 || lastDot === 0) {
    return '';
  }
  return filename.slice(lastDot + 1).toLowerCase();
};

export const isImageExtension = (extension: string): boolean => {
  return imageExtensions.has(extension.toLowerCase());
};

export const isVideoExtension = (extension: string): boolean => {
  return videoExtensions.has(extension.toLowerCase());
};

export const isAudioExtension = (extension: string): boolean => {
  return audioExtensions.has(extension.toLowerCase());
};

export const isDocumentExtension = (extension: string): boolean => {
  return documentExtensions.has(extension.toLowerCase());
};

export const isMediaExtension = (extension: string): boolean => {
  const ext = extension.toLowerCase();
  return (
    isImageExtension(ext) || isVideoExtension(ext) || isAudioExtension(ext)
  );
};

export const getMediaCategory = (input: string): MediaCategory => {
  if (input.includes('/')) {
    return getCategoryFromMimeType(input);
  }

  return getCategoryFromExtension(input);
};

export const detectMediaFromUrl = (url: string): MediaInfo => {
  const extension = getExtensionFromUrl(url);
  const mimeType = getMimeTypeFromExtension(extension);
  const category = mimeType
    ? getCategoryFromMimeType(mimeType)
    : getCategoryFromExtension(extension);

  return {
    category,
    format: extension ? (extension as MediaFormat) : null,
    mimeType,
    extension,
  };
};

export const detectMediaFromFilename = (filename: string): MediaInfo => {
  const extension = getExtensionFromFilename(filename);
  const mimeType = getMimeTypeFromExtension(extension);
  const category = mimeType
    ? getCategoryFromMimeType(mimeType)
    : getCategoryFromExtension(extension);

  return {
    category,
    format: extension ? (extension as MediaFormat) : null,
    mimeType,
    extension,
  };
};

export const detectMediaFromMimeType = (mimeType: string): MediaInfo => {
  const category = getCategoryFromMimeType(mimeType);
  const parts = mimeType.split('/');
  const subtype = parts[1] ?? '';
  const extension = subtype.replace(/^x-/, '').replace(/\+.*$/, '');

  return {
    category,
    format: extension ? (extension as MediaFormat) : null,
    mimeType,
    extension,
  };
};

export const isImageUrl = (url: string): boolean => {
  const extension = getExtensionFromUrl(url);
  return isImageExtension(extension);
};

export const isVideoUrl = (url: string): boolean => {
  const extension = getExtensionFromUrl(url);
  return isVideoExtension(extension);
};

export const isAudioUrl = (url: string): boolean => {
  const extension = getExtensionFromUrl(url);
  return isAudioExtension(extension);
};

export const isDocumentUrl = (url: string): boolean => {
  const extension = getExtensionFromUrl(url);
  return isDocumentExtension(extension);
};

export const isMediaUrl = (url: string): boolean => {
  const extension = getExtensionFromUrl(url);
  return isMediaExtension(extension);
};

export const isImageFile = (file: File): boolean => {
  if (file.type) {
    return getCategoryFromMimeType(file.type) === 'image';
  }
  return isImageExtension(getExtensionFromFilename(file.name));
};

export const isVideoFile = (file: File): boolean => {
  if (file.type) {
    return getCategoryFromMimeType(file.type) === 'video';
  }
  return isVideoExtension(getExtensionFromFilename(file.name));
};

export const isAudioFile = (file: File): boolean => {
  if (file.type) {
    return getCategoryFromMimeType(file.type) === 'audio';
  }
  return isAudioExtension(getExtensionFromFilename(file.name));
};

export const isDocumentFile = (file: File): boolean => {
  if (file.type) {
    return getCategoryFromMimeType(file.type) === 'document';
  }
  return isDocumentExtension(getExtensionFromFilename(file.name));
};

export const isMediaFile = (file: File): boolean => {
  return isImageFile(file) || isVideoFile(file) || isAudioFile(file);
};

export const getMediaInfoFromFile = (file: File): MediaInfo => {
  const extension = getExtensionFromFilename(file.name);
  const mimeType = file.type || getMimeTypeFromExtension(extension);
  const category = mimeType
    ? getCategoryFromMimeType(mimeType)
    : getCategoryFromExtension(extension);

  return {
    category,
    format: extension ? (extension as MediaFormat) : null,
    mimeType,
    extension,
  };
};

export const canPlayVideoType = (mimeType: string): boolean => {
  if (typeof document === 'undefined') return false;

  const video = document.createElement('video');
  const canPlay = video.canPlayType(mimeType);
  return canPlay === 'probably' || canPlay === 'maybe';
};

export const canPlayAudioType = (mimeType: string): boolean => {
  if (typeof document === 'undefined') return false;

  const audio = document.createElement('audio');
  const canPlay = audio.canPlayType(mimeType);
  return canPlay === 'probably' || canPlay === 'maybe';
};

export const getSupportedVideoTypes = (): string[] => {
  if (typeof document === 'undefined') return [];

  const types = [
    'video/mp4',
    'video/webm',
    'video/ogg',
    'video/quicktime',
    'video/x-m4v',
  ];

  return types.filter(canPlayVideoType);
};

export const getSupportedAudioTypes = (): string[] => {
  if (typeof document === 'undefined') return [];

  const types = [
    'audio/mpeg',
    'audio/ogg',
    'audio/wav',
    'audio/aac',
    'audio/flac',
    'audio/x-m4a',
  ];

  return types.filter(canPlayAudioType);
};

export const getSupportedImageTypes = (): string[] => {
  return [
    'image/jpeg',
    'image/png',
    'image/gif',
    'image/webp',
    'image/svg+xml',
  ];
};
