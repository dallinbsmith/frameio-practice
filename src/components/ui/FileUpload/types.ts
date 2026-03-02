import type { ReactNode } from 'react';

export type FileUploadVariant = 'default' | 'compact' | 'inline';

export type FileUploadProps = {
  accept?: string[];
  maxSize?: number;
  maxFiles?: number;
  multiple?: boolean;
  variant?: FileUploadVariant;
  label?: string;
  description?: string;
  error?: string;
  disabled?: boolean;
  onUpload?: (
    file: File,
    onProgress: (progress: number) => void
  ) => Promise<string | void>;
  onFilesChange?: (files: File[]) => void;
  onError?: (error: string, file: File) => void;
  className?: string;
};

export type FilePreviewProps = {
  id: string;
  name: string;
  size: number;
  type: string;
  preview?: string | undefined;
  progress: number;
  status: 'pending' | 'uploading' | 'complete' | 'error';
  error?: string | undefined;
  onRemove: () => void;
  onRetry?: (() => void) | undefined;
};

export type DropZoneProps = {
  isDragOver: boolean;
  disabled?: boolean;
  children: ReactNode;
};
