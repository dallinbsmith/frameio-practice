import type { MediaCategory, MimeTypeInfo } from './types';

const mimeTypeDatabase: Record<string, MimeTypeInfo> = {
  'image/jpeg': {
    type: 'image/jpeg',
    category: 'image',
    extension: 'jpg',
    description: 'JPEG Image',
  },
  'image/png': {
    type: 'image/png',
    category: 'image',
    extension: 'png',
    description: 'PNG Image',
  },
  'image/gif': {
    type: 'image/gif',
    category: 'image',
    extension: 'gif',
    description: 'GIF Image',
  },
  'image/webp': {
    type: 'image/webp',
    category: 'image',
    extension: 'webp',
    description: 'WebP Image',
  },
  'image/avif': {
    type: 'image/avif',
    category: 'image',
    extension: 'avif',
    description: 'AVIF Image',
  },
  'image/svg+xml': {
    type: 'image/svg+xml',
    category: 'image',
    extension: 'svg',
    description: 'SVG Image',
  },
  'image/x-icon': {
    type: 'image/x-icon',
    category: 'image',
    extension: 'ico',
    description: 'ICO Icon',
  },
  'image/bmp': {
    type: 'image/bmp',
    category: 'image',
    extension: 'bmp',
    description: 'Bitmap Image',
  },
  'image/tiff': {
    type: 'image/tiff',
    category: 'image',
    extension: 'tiff',
    description: 'TIFF Image',
  },
  'video/mp4': {
    type: 'video/mp4',
    category: 'video',
    extension: 'mp4',
    description: 'MP4 Video',
  },
  'video/webm': {
    type: 'video/webm',
    category: 'video',
    extension: 'webm',
    description: 'WebM Video',
  },
  'video/quicktime': {
    type: 'video/quicktime',
    category: 'video',
    extension: 'mov',
    description: 'QuickTime Video',
  },
  'video/x-msvideo': {
    type: 'video/x-msvideo',
    category: 'video',
    extension: 'avi',
    description: 'AVI Video',
  },
  'video/x-matroska': {
    type: 'video/x-matroska',
    category: 'video',
    extension: 'mkv',
    description: 'Matroska Video',
  },
  'video/x-flv': {
    type: 'video/x-flv',
    category: 'video',
    extension: 'flv',
    description: 'Flash Video',
  },
  'video/x-m4v': {
    type: 'video/x-m4v',
    category: 'video',
    extension: 'm4v',
    description: 'M4V Video',
  },
  'video/x-ms-wmv': {
    type: 'video/x-ms-wmv',
    category: 'video',
    extension: 'wmv',
    description: 'Windows Media Video',
  },
  'video/ogg': {
    type: 'video/ogg',
    category: 'video',
    extension: 'ogv',
    description: 'Ogg Video',
  },
  'audio/mpeg': {
    type: 'audio/mpeg',
    category: 'audio',
    extension: 'mp3',
    description: 'MP3 Audio',
  },
  'audio/wav': {
    type: 'audio/wav',
    category: 'audio',
    extension: 'wav',
    description: 'WAV Audio',
  },
  'audio/ogg': {
    type: 'audio/ogg',
    category: 'audio',
    extension: 'ogg',
    description: 'Ogg Audio',
  },
  'audio/aac': {
    type: 'audio/aac',
    category: 'audio',
    extension: 'aac',
    description: 'AAC Audio',
  },
  'audio/x-m4a': {
    type: 'audio/x-m4a',
    category: 'audio',
    extension: 'm4a',
    description: 'M4A Audio',
  },
  'audio/flac': {
    type: 'audio/flac',
    category: 'audio',
    extension: 'flac',
    description: 'FLAC Audio',
  },
  'audio/x-ms-wma': {
    type: 'audio/x-ms-wma',
    category: 'audio',
    extension: 'wma',
    description: 'Windows Media Audio',
  },
  'audio/opus': {
    type: 'audio/opus',
    category: 'audio',
    extension: 'opus',
    description: 'Opus Audio',
  },
  'application/pdf': {
    type: 'application/pdf',
    category: 'document',
    extension: 'pdf',
    description: 'PDF Document',
  },
  'application/msword': {
    type: 'application/msword',
    category: 'document',
    extension: 'doc',
    description: 'Word Document',
  },
  'application/vnd.openxmlformats-officedocument.wordprocessingml.document': {
    type: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
    category: 'document',
    extension: 'docx',
    description: 'Word Document',
  },
  'application/vnd.ms-excel': {
    type: 'application/vnd.ms-excel',
    category: 'document',
    extension: 'xls',
    description: 'Excel Spreadsheet',
  },
  'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet': {
    type: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
    category: 'document',
    extension: 'xlsx',
    description: 'Excel Spreadsheet',
  },
  'application/vnd.ms-powerpoint': {
    type: 'application/vnd.ms-powerpoint',
    category: 'document',
    extension: 'ppt',
    description: 'PowerPoint Presentation',
  },
  'application/vnd.openxmlformats-officedocument.presentationml.presentation': {
    type: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
    category: 'document',
    extension: 'pptx',
    description: 'PowerPoint Presentation',
  },
  'text/plain': {
    type: 'text/plain',
    category: 'document',
    extension: 'txt',
    description: 'Text File',
  },
  'text/rtf': {
    type: 'text/rtf',
    category: 'document',
    extension: 'rtf',
    description: 'Rich Text Format',
  },
  'text/csv': {
    type: 'text/csv',
    category: 'document',
    extension: 'csv',
    description: 'CSV File',
  },
};

const extensionToMimeType: Record<string, string> = {
  jpg: 'image/jpeg',
  jpeg: 'image/jpeg',
  png: 'image/png',
  gif: 'image/gif',
  webp: 'image/webp',
  avif: 'image/avif',
  svg: 'image/svg+xml',
  ico: 'image/x-icon',
  bmp: 'image/bmp',
  tiff: 'image/tiff',
  tif: 'image/tiff',
  mp4: 'video/mp4',
  webm: 'video/webm',
  mov: 'video/quicktime',
  avi: 'video/x-msvideo',
  mkv: 'video/x-matroska',
  flv: 'video/x-flv',
  m4v: 'video/x-m4v',
  wmv: 'video/x-ms-wmv',
  ogv: 'video/ogg',
  mp3: 'audio/mpeg',
  wav: 'audio/wav',
  ogg: 'audio/ogg',
  aac: 'audio/aac',
  m4a: 'audio/x-m4a',
  flac: 'audio/flac',
  wma: 'audio/x-ms-wma',
  opus: 'audio/opus',
  pdf: 'application/pdf',
  doc: 'application/msword',
  docx: 'application/vnd.openxmlformats-officedocument.wordprocessingml.document',
  xls: 'application/vnd.ms-excel',
  xlsx: 'application/vnd.openxmlformats-officedocument.spreadsheetml.sheet',
  ppt: 'application/vnd.ms-powerpoint',
  pptx: 'application/vnd.openxmlformats-officedocument.presentationml.presentation',
  txt: 'text/plain',
  rtf: 'text/rtf',
  csv: 'text/csv',
};

export const getMimeTypeInfo = (mimeType: string): MimeTypeInfo | null => {
  return mimeTypeDatabase[mimeType] ?? null;
};

export const getMimeTypeFromExtension = (extension: string): string | null => {
  const ext = extension.toLowerCase().replace(/^\./, '');
  return extensionToMimeType[ext] ?? null;
};

export const getExtensionFromMimeType = (mimeType: string): string | null => {
  const info = mimeTypeDatabase[mimeType];
  return info?.extension ?? null;
};

export const getCategoryFromMimeType = (mimeType: string): MediaCategory => {
  const info = mimeTypeDatabase[mimeType];
  if (info) return info.category;

  if (mimeType.startsWith('image/')) return 'image';
  if (mimeType.startsWith('video/')) return 'video';
  if (mimeType.startsWith('audio/')) return 'audio';
  if (mimeType.startsWith('application/') || mimeType.startsWith('text/')) {
    return 'document';
  }

  return 'unknown';
};

export const getCategoryFromExtension = (extension: string): MediaCategory => {
  const mimeType = getMimeTypeFromExtension(extension);
  if (mimeType) return getCategoryFromMimeType(mimeType);
  return 'unknown';
};

export const isImageMimeType = (mimeType: string): boolean => {
  return getCategoryFromMimeType(mimeType) === 'image';
};

export const isVideoMimeType = (mimeType: string): boolean => {
  return getCategoryFromMimeType(mimeType) === 'video';
};

export const isAudioMimeType = (mimeType: string): boolean => {
  return getCategoryFromMimeType(mimeType) === 'audio';
};

export const isDocumentMimeType = (mimeType: string): boolean => {
  return getCategoryFromMimeType(mimeType) === 'document';
};

export const isMediaMimeType = (mimeType: string): boolean => {
  const category = getCategoryFromMimeType(mimeType);
  return category === 'image' || category === 'video' || category === 'audio';
};

export const getAcceptString = (categories: MediaCategory[]): string => {
  const mimeTypes: string[] = [];

  for (const category of categories) {
    if (category === 'image') {
      mimeTypes.push('image/*');
    } else if (category === 'video') {
      mimeTypes.push('video/*');
    } else if (category === 'audio') {
      mimeTypes.push('audio/*');
    } else if (category === 'document') {
      mimeTypes.push(
        'application/pdf',
        '.doc',
        '.docx',
        '.xls',
        '.xlsx',
        '.ppt',
        '.pptx',
        '.txt',
        '.rtf',
        '.csv'
      );
    }
  }

  return mimeTypes.join(',');
};

export const getAllMimeTypes = (): MimeTypeInfo[] => {
  return Object.values(mimeTypeDatabase);
};

export const getMimeTypesByCategory = (
  category: MediaCategory
): MimeTypeInfo[] => {
  return Object.values(mimeTypeDatabase).filter(
    (info) => info.category === category
  );
};

export const isValidMimeType = (mimeType: string): boolean => {
  return (
    mimeType in mimeTypeDatabase ||
    /^(image|video|audio|application|text)\//.test(mimeType)
  );
};

export const normalizeMimeType = (mimeType: string): string => {
  const lower = mimeType.toLowerCase().trim();
  const semicolonIndex = lower.indexOf(';');
  return semicolonIndex !== -1 ? lower.slice(0, semicolonIndex) : lower;
};
