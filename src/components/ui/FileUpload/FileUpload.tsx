'use client';

import { useEffect } from 'react';
import styled, { css, keyframes } from 'styled-components';

import { formatBytes, useFileUpload } from '@/lib/forms';

import type {
  FilePreviewProps,
  FileUploadProps,
  FileUploadVariant,
} from './types';

const fadeIn = keyframes`
  from { opacity: 0; transform: scale(0.95); }
  to { opacity: 1; transform: scale(1); }
`;

const Container = styled.div`
  width: 100%;
`;

const Label = styled.label`
  display: block;
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-fg-primary);
  margin-bottom: var(--spacing-2);
`;

const DropZone = styled.div<{
  $isDragOver: boolean;
  $disabled: boolean;
  $variant: FileUploadVariant;
  $hasError: boolean;
}>`
  position: relative;
  display: flex;
  flex-direction: column;
  align-items: center;
  justify-content: center;
  border: 2px dashed
    ${({ $isDragOver, $hasError }) =>
      $hasError
        ? 'var(--color-status-error)'
        : $isDragOver
          ? 'var(--color-brand-500)'
          : 'var(--color-border-default)'};
  border-radius: var(--radius-lg);
  background-color: ${({ $isDragOver }) =>
    $isDragOver ? 'var(--color-brand-50)' : 'var(--color-bg-secondary)'};
  cursor: ${({ $disabled }) => ($disabled ? 'not-allowed' : 'pointer')};
  transition: all var(--duration-fast) var(--ease-default);
  opacity: ${({ $disabled }) => ($disabled ? 0.6 : 1)};

  ${({ $variant }) => {
    switch ($variant) {
      case 'compact':
        return css`
          padding: var(--spacing-4);
          min-height: 80px;
        `;
      case 'inline':
        return css`
          padding: var(--spacing-3);
          flex-direction: row;
          gap: var(--spacing-3);
          min-height: auto;
        `;
      default:
        return css`
          padding: var(--spacing-8);
          min-height: 160px;
        `;
    }
  }}

  &:hover:not([disabled]) {
    border-color: var(--color-brand-400);
    background-color: var(--color-brand-50);
  }

  &:focus-within {
    outline: 2px solid var(--color-brand-500);
    outline-offset: 2px;
  }
`;

const UploadIcon = styled.div<{ $variant: FileUploadVariant }>`
  color: var(--color-fg-secondary);
  margin-bottom: ${({ $variant }) =>
    $variant === 'inline' ? '0' : 'var(--spacing-3)'};

  svg {
    width: ${({ $variant }) => ($variant === 'compact' ? '24px' : '40px')};
    height: ${({ $variant }) => ($variant === 'compact' ? '24px' : '40px')};
  }
`;

const UploadText = styled.div<{ $variant: FileUploadVariant }>`
  text-align: ${({ $variant }) => ($variant === 'inline' ? 'left' : 'center')};
`;

const MainText = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-fg-primary);
  margin: 0 0 var(--spacing-1) 0;

  span {
    color: var(--color-brand-500);
    font-weight: var(--font-weight-medium);
  }
`;

const SubText = styled.p`
  font-size: var(--font-size-xs);
  color: var(--color-fg-tertiary);
  margin: 0;
`;

const ErrorText = styled.p`
  font-size: var(--font-size-sm);
  color: var(--color-status-error);
  margin-top: var(--spacing-2);
`;

const FileList = styled.div`
  display: flex;
  flex-direction: column;
  gap: var(--spacing-2);
  margin-top: var(--spacing-4);
`;

const FileItem = styled.div`
  display: flex;
  align-items: center;
  gap: var(--spacing-3);
  padding: var(--spacing-3);
  background-color: var(--color-bg-secondary);
  border-radius: var(--radius-md);
  animation: ${fadeIn} var(--duration-fast) var(--ease-default);
`;

const FilePreviewImage = styled.img`
  width: 48px;
  height: 48px;
  object-fit: cover;
  border-radius: var(--radius-sm);
`;

const FileIcon = styled.div`
  width: 48px;
  height: 48px;
  display: flex;
  align-items: center;
  justify-content: center;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-sm);
  color: var(--color-fg-secondary);
`;

const FileInfo = styled.div`
  flex: 1;
  min-width: 0;
`;

const FileName = styled.p`
  font-size: var(--font-size-sm);
  font-weight: var(--font-weight-medium);
  color: var(--color-fg-primary);
  margin: 0;
  white-space: nowrap;
  overflow: hidden;
  text-overflow: ellipsis;
`;

const FileSize = styled.p`
  font-size: var(--font-size-xs);
  color: var(--color-fg-tertiary);
  margin: var(--spacing-1) 0 0 0;
`;

const FileError = styled.p`
  font-size: var(--font-size-xs);
  color: var(--color-status-error);
  margin: var(--spacing-1) 0 0 0;
`;

const ProgressBar = styled.div`
  height: 4px;
  background-color: var(--color-bg-tertiary);
  border-radius: var(--radius-full);
  overflow: hidden;
  margin-top: var(--spacing-2);
`;

const ProgressFill = styled.div<{ $progress: number }>`
  height: 100%;
  width: ${({ $progress }) => $progress}%;
  background-color: var(--color-brand-500);
  border-radius: var(--radius-full);
  transition: width var(--duration-normal) var(--ease-out-expo);
`;

const FileActions = styled.div`
  display: flex;
  gap: var(--spacing-2);
`;

const ActionButton = styled.button<{ $variant?: 'danger' | 'default' }>`
  display: flex;
  align-items: center;
  justify-content: center;
  width: 28px;
  height: 28px;
  border: none;
  border-radius: var(--radius-sm);
  background-color: ${({ $variant }) =>
    $variant === 'danger'
      ? 'var(--color-status-error-bg)'
      : 'var(--color-bg-tertiary)'};
  color: ${({ $variant }) =>
    $variant === 'danger'
      ? 'var(--color-status-error)'
      : 'var(--color-fg-secondary)'};
  cursor: pointer;
  transition: all var(--duration-fast) var(--ease-default);

  &:hover {
    background-color: ${({ $variant }) =>
      $variant === 'danger'
        ? 'var(--color-status-error)'
        : 'var(--color-bg-elevated)'};
    color: ${({ $variant }) =>
      $variant === 'danger' ? 'white' : 'var(--color-fg-primary)'};
  }
`;

const StatusIcon = styled.div<{ $status: 'complete' | 'error' }>`
  color: ${({ $status }) =>
    $status === 'complete'
      ? 'var(--color-status-success)'
      : 'var(--color-status-error)'};
`;

const UploadSvgIcon = () => (
  <svg
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="1.5"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M21 15v4a2 2 0 0 1-2 2H5a2 2 0 0 1-2-2v-4" />
    <polyline points="17 8 12 3 7 8" />
    <line x1="12" y1="3" x2="12" y2="15" />
  </svg>
);

const FileIconSvg = () => (
  <svg
    width="20"
    height="20"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <path d="M14 2H6a2 2 0 0 0-2 2v16a2 2 0 0 0 2 2h12a2 2 0 0 0 2-2V8z" />
    <polyline points="14 2 14 8 20 8" />
  </svg>
);

const CloseIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <line x1="18" y1="6" x2="6" y2="18" />
    <line x1="6" y1="6" x2="18" y2="18" />
  </svg>
);

const RetryIcon = () => (
  <svg
    width="14"
    height="14"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="2"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="23 4 23 10 17 10" />
    <path d="M20.49 15a9 9 0 1 1-2.12-9.36L23 10" />
  </svg>
);

const CheckIcon = () => (
  <svg
    width="16"
    height="16"
    viewBox="0 0 24 24"
    fill="none"
    stroke="currentColor"
    strokeWidth="3"
    strokeLinecap="round"
    strokeLinejoin="round"
  >
    <polyline points="20 6 9 17 4 12" />
  </svg>
);

const FilePreview = ({
  name,
  size,
  preview,
  progress,
  status,
  error: fileError,
  onRemove,
  onRetry,
}: FilePreviewProps) => {
  return (
    <FileItem>
      {preview ? (
        <FilePreviewImage src={preview} alt={name} />
      ) : (
        <FileIcon>
          <FileIconSvg />
        </FileIcon>
      )}
      <FileInfo>
        <FileName>{name}</FileName>
        <FileSize>{formatBytes(size)}</FileSize>
        {fileError && <FileError>{fileError}</FileError>}
        {status === 'uploading' && (
          <ProgressBar>
            <ProgressFill $progress={progress} />
          </ProgressBar>
        )}
      </FileInfo>
      <FileActions>
        {status === 'complete' && (
          <StatusIcon $status="complete">
            <CheckIcon />
          </StatusIcon>
        )}
        {status === 'error' && onRetry && (
          <ActionButton onClick={onRetry} title="Retry upload">
            <RetryIcon />
          </ActionButton>
        )}
        <ActionButton $variant="danger" onClick={onRemove} title="Remove file">
          <CloseIcon />
        </ActionButton>
      </FileActions>
    </FileItem>
  );
};

export const FileUpload = ({
  accept = [],
  maxSize = 10 * 1024 * 1024,
  maxFiles = 10,
  multiple = true,
  variant = 'default',
  label,
  description,
  error: externalError,
  disabled = false,
  onUpload,
  onFilesChange,
  onError,
  className,
}: FileUploadProps) => {
  const {
    files,
    isDragOver,
    error: uploadError,
    removeFile,
    retryFile,
    getRootProps,
    getInputProps,
  } = useFileUpload({
    accept,
    maxSize,
    maxFiles,
    multiple,
    onUpload,
    onError,
  });

  useEffect(() => {
    if (onFilesChange) {
      onFilesChange(files.map((f) => f.file));
    }
  }, [files, onFilesChange]);

  const rootProps = getRootProps();
  const inputProps = getInputProps();

  const acceptText = accept.length > 0 ? accept.join(', ') : 'Any file type';
  const sizeText = `Max ${formatBytes(maxSize)}`;
  const error = externalError ?? uploadError;

  return (
    <Container className={className}>
      {label && <Label>{label}</Label>}
      <DropZone
        {...rootProps}
        $isDragOver={isDragOver}
        $disabled={disabled}
        $variant={variant}
        $hasError={!!error}
        aria-disabled={disabled}
      >
        <input {...inputProps} disabled={disabled} />
        <UploadIcon $variant={variant}>
          <UploadSvgIcon />
        </UploadIcon>
        <UploadText $variant={variant}>
          <MainText>
            <span>Click to upload</span> or drag and drop
          </MainText>
          <SubText>{description ?? `${acceptText} (${sizeText})`}</SubText>
        </UploadText>
      </DropZone>
      {error && <ErrorText>{error}</ErrorText>}
      {files.length > 0 && (
        <FileList>
          {files.map((file) => (
            <FilePreview
              key={file.id}
              id={file.id}
              name={file.name}
              size={file.size}
              type={file.type}
              preview={file.preview}
              progress={file.progress}
              status={file.status}
              error={file.error}
              onRemove={() => removeFile(file.id)}
              onRetry={() => retryFile(file.id)}
            />
          ))}
        </FileList>
      )}
    </Container>
  );
};

export default FileUpload;
