'use client';

import { useCallback, useRef, useState } from 'react';

import type { FileUploadConfig, FileUploadState, UploadedFile } from './types';

type UploadHandler = (
  file: File,
  onProgress: (progress: number) => void
) => Promise<string | void>;

type UseFileUploadConfig = FileUploadConfig & {
  onUpload?: UploadHandler | undefined;
  onError?: ((error: string, file: File) => void) | undefined;
  onComplete?: ((file: UploadedFile) => void) | undefined;
  onRemove?: ((file: UploadedFile) => void) | undefined;
};

type UseFileUploadReturn = FileUploadState & {
  addFiles: (files: FileList | File[]) => void;
  removeFile: (id: string) => void;
  clearFiles: () => void;
  retryFile: (id: string) => void;
  uploadFile: (id: string) => Promise<void>;
  uploadAll: () => Promise<void>;
  getRootProps: () => {
    onDrop: (e: React.DragEvent) => void;
    onDragOver: (e: React.DragEvent) => void;
    onDragEnter: (e: React.DragEvent) => void;
    onDragLeave: (e: React.DragEvent) => void;
    onClick: () => void;
  };
  getInputProps: () => {
    type: 'file';
    ref: React.RefObject<HTMLInputElement>;
    onChange: (e: React.ChangeEvent<HTMLInputElement>) => void;
    accept: string | undefined;
    multiple: boolean;
    style: { display: 'none' };
  };
};

const generateFileId = (): string =>
  `file-${Date.now()}-${Math.random().toString(36).slice(2, 9)}`;

const formatBytes = (bytes: number): string => {
  if (bytes === 0) return '0 Bytes';
  const k = 1024;
  const sizes = ['Bytes', 'KB', 'MB', 'GB'];
  const i = Math.floor(Math.log(bytes) / Math.log(k));
  return parseFloat((bytes / Math.pow(k, i)).toFixed(2)) + ' ' + sizes[i];
};

const createPreview = (file: File): Promise<string | undefined> => {
  return new Promise((resolve) => {
    if (!file.type.startsWith('image/')) {
      resolve(undefined);
      return;
    }

    const reader = new FileReader();
    reader.onload = () => resolve(reader.result as string);
    reader.onerror = () => resolve(undefined);
    reader.readAsDataURL(file);
  });
};

export const useFileUpload = ({
  accept = [],
  maxSize = 10 * 1024 * 1024,
  maxFiles = 10,
  multiple = true,
  onUpload,
  onError,
  onComplete,
  onRemove,
}: UseFileUploadConfig = {}): UseFileUploadReturn => {
  const [files, setFiles] = useState<UploadedFile[]>([]);
  const [isUploading, setIsUploading] = useState(false);
  const [isDragOver, setIsDragOver] = useState(false);
  const inputRef = useRef<HTMLInputElement>(null);

  const progress =
    files.length === 0
      ? 0
      : Math.round(
          files.reduce((acc, f) => acc + f.progress, 0) / files.length
        );

  const error = files.find((f) => f.status === 'error')?.error ?? null;

  const validateFile = useCallback(
    (file: File): string | null => {
      if (accept.length > 0) {
        const fileType = file.type;
        const fileExt = `.${file.name.split('.').pop()?.toLowerCase()}`;
        const isAccepted = accept.some(
          (type) =>
            type === fileType ||
            type === fileExt ||
            (type.endsWith('/*') && fileType.startsWith(type.slice(0, -1)))
        );
        if (!isAccepted) {
          return `File type not accepted. Allowed: ${accept.join(', ')}`;
        }
      }

      if (file.size > maxSize) {
        return `File too large. Maximum size: ${formatBytes(maxSize)}`;
      }

      return null;
    },
    [accept, maxSize]
  );

  const addFiles = useCallback(
    async (newFiles: FileList | File[]) => {
      const fileArray = Array.from(newFiles);

      if (!multiple && fileArray.length > 1) {
        fileArray.splice(1);
      }

      const remainingSlots = maxFiles - files.length;
      if (remainingSlots <= 0) {
        const firstFile = fileArray[0];
        if (firstFile) {
          onError?.(`Maximum ${maxFiles} files allowed`, firstFile);
        }
        return;
      }

      const filesToAdd = fileArray.slice(0, remainingSlots);
      const uploadedFiles: UploadedFile[] = [];

      for (const file of filesToAdd) {
        const validationError = validateFile(file);
        const preview = await createPreview(file);

        const uploadedFile: UploadedFile = {
          id: generateFileId(),
          file,
          name: file.name,
          size: file.size,
          type: file.type,
          preview,
          progress: validationError ? 0 : 0,
          status: validationError ? 'error' : 'pending',
          error: validationError ?? undefined,
        };

        if (validationError) {
          onError?.(validationError, file);
        }

        uploadedFiles.push(uploadedFile);
      }

      if (!multiple) {
        setFiles(uploadedFiles);
      } else {
        setFiles((prev) => [...prev, ...uploadedFiles]);
      }
    },
    [files.length, maxFiles, multiple, onError, validateFile]
  );

  const removeFile = useCallback(
    (id: string) => {
      const file = files.find((f) => f.id === id);
      if (file) {
        if (file.preview) {
          URL.revokeObjectURL(file.preview);
        }
        onRemove?.(file);
      }
      setFiles((prev) => prev.filter((f) => f.id !== id));
    },
    [files, onRemove]
  );

  const clearFiles = useCallback(() => {
    files.forEach((file) => {
      if (file.preview) {
        URL.revokeObjectURL(file.preview);
      }
    });
    setFiles([]);
  }, [files]);

  const updateFileProgress = useCallback((id: string, fileProgress: number) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, progress: fileProgress, status: 'uploading' as const }
          : f
      )
    );
  }, []);

  const uploadFile = useCallback(
    async (id: string) => {
      const file = files.find((f) => f.id === id);
      if (!file || file.status === 'complete' || file.status === 'error') {
        return;
      }

      if (!onUpload) {
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id
              ? { ...f, progress: 100, status: 'complete' as const }
              : f
          )
        );
        onComplete?.(file);
        return;
      }

      setFiles((prev) =>
        prev.map((f) =>
          f.id === id ? { ...f, status: 'uploading' as const } : f
        )
      );

      try {
        await onUpload(file.file, (p) => updateFileProgress(id, p));
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id
              ? { ...f, progress: 100, status: 'complete' as const }
              : f
          )
        );
        const updatedFile = files.find((f) => f.id === id);
        if (updatedFile) {
          onComplete?.({ ...updatedFile, progress: 100, status: 'complete' });
        }
      } catch (err) {
        const errorMessage =
          err instanceof Error ? err.message : 'Upload failed';
        setFiles((prev) =>
          prev.map((f) =>
            f.id === id
              ? { ...f, status: 'error' as const, error: errorMessage }
              : f
          )
        );
        onError?.(errorMessage, file.file);
      }
    },
    [files, onUpload, onComplete, onError, updateFileProgress]
  );

  const retryFile = useCallback((id: string) => {
    setFiles((prev) =>
      prev.map((f) =>
        f.id === id
          ? { ...f, status: 'pending' as const, progress: 0, error: undefined }
          : f
      )
    );
  }, []);

  const uploadAll = useCallback(async () => {
    const pendingFiles = files.filter((f) => f.status === 'pending');
    if (pendingFiles.length === 0) return;

    setIsUploading(true);

    for (const file of pendingFiles) {
      await uploadFile(file.id);
    }

    setIsUploading(false);
  }, [files, uploadFile]);

  const handleDrop = useCallback(
    (e: React.DragEvent) => {
      e.preventDefault();
      e.stopPropagation();
      setIsDragOver(false);

      const droppedFiles = e.dataTransfer.files;
      if (droppedFiles.length > 0) {
        addFiles(droppedFiles);
      }
    },
    [addFiles]
  );

  const handleDragOver = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
  }, []);

  const handleDragEnter = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(true);
  }, []);

  const handleDragLeave = useCallback((e: React.DragEvent) => {
    e.preventDefault();
    e.stopPropagation();
    setIsDragOver(false);
  }, []);

  const handleClick = useCallback(() => {
    inputRef.current?.click();
  }, []);

  const handleInputChange = useCallback(
    (e: React.ChangeEvent<HTMLInputElement>) => {
      const selectedFiles = e.target.files;
      if (selectedFiles && selectedFiles.length > 0) {
        addFiles(selectedFiles);
      }
      if (inputRef.current) {
        inputRef.current.value = '';
      }
    },
    [addFiles]
  );

  const getRootProps = useCallback(
    () => ({
      onDrop: handleDrop,
      onDragOver: handleDragOver,
      onDragEnter: handleDragEnter,
      onDragLeave: handleDragLeave,
      onClick: handleClick,
    }),
    [handleDrop, handleDragOver, handleDragEnter, handleDragLeave, handleClick]
  );

  const getInputProps = useCallback(
    () => ({
      type: 'file' as const,
      ref: inputRef,
      onChange: handleInputChange,
      accept: accept.length > 0 ? accept.join(',') : undefined,
      multiple,
      style: { display: 'none' as const },
    }),
    [handleInputChange, accept, multiple]
  );

  return {
    files,
    isUploading,
    progress,
    error,
    isDragOver,
    addFiles,
    removeFile,
    clearFiles,
    retryFile,
    uploadFile,
    uploadAll,
    getRootProps,
    getInputProps,
  };
};

export { formatBytes };
