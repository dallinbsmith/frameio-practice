import type {
  DurationFormat,
  FileSizeFormat,
  FileSizeInfo,
  FileSizeUnit,
} from './types';

const BINARY_UNITS: FileSizeUnit[] = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
const DECIMAL_UNITS: FileSizeUnit[] = ['B', 'KB', 'MB', 'GB', 'TB', 'PB'];
const BINARY_BASE = 1024;
const DECIMAL_BASE = 1000;

export const formatDuration = (
  seconds: number,
  format: DurationFormat = 'colon'
): string => {
  if (!isFinite(seconds) || seconds < 0) {
    return format === 'colon' ? '0:00' : '0s';
  }

  const totalSeconds = Math.floor(seconds);
  const hours = Math.floor(totalSeconds / 3600);
  const minutes = Math.floor((totalSeconds % 3600) / 60);
  const secs = totalSeconds % 60;

  switch (format) {
    case 'colon': {
      if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
      return `${minutes}:${String(secs).padStart(2, '0')}`;
    }
    case 'verbose': {
      const parts: string[] = [];
      if (hours > 0) parts.push(`${hours} hour${hours !== 1 ? 's' : ''}`);
      if (minutes > 0)
        parts.push(`${minutes} minute${minutes !== 1 ? 's' : ''}`);
      if (secs > 0 || parts.length === 0) {
        parts.push(`${secs} second${secs !== 1 ? 's' : ''}`);
      }
      return parts.join(', ');
    }
    case 'short': {
      const parts: string[] = [];
      if (hours > 0) parts.push(`${hours}h`);
      if (minutes > 0) parts.push(`${minutes}m`);
      if (secs > 0 || parts.length === 0) parts.push(`${secs}s`);
      return parts.join(' ');
    }
    case 'minimal': {
      if (hours > 0) {
        return `${hours}:${String(minutes).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;
      }
      if (minutes > 0) {
        return `${minutes}:${String(secs).padStart(2, '0')}`;
      }
      return `0:${String(secs).padStart(2, '0')}`;
    }
    default:
      return `${minutes}:${String(secs).padStart(2, '0')}`;
  }
};

export const parseDuration = (duration: string): number => {
  if (/^\d+$/.test(duration)) {
    return parseInt(duration, 10);
  }

  const colonMatch = duration.match(/^(\d+):(\d{2})(?::(\d{2}))?$/);
  if (colonMatch) {
    if (colonMatch[3]) {
      const hours = parseInt(colonMatch[1] ?? '0', 10);
      const minutes = parseInt(colonMatch[2] ?? '0', 10);
      const seconds = parseInt(colonMatch[3], 10);
      return hours * 3600 + minutes * 60 + seconds;
    }
    const minutes = parseInt(colonMatch[1] ?? '0', 10);
    const seconds = parseInt(colonMatch[2] ?? '0', 10);
    return minutes * 60 + seconds;
  }

  const shortMatch = duration.match(/(?:(\d+)h)?\s*(?:(\d+)m)?\s*(?:(\d+)s)?/i);
  if (shortMatch) {
    const hours = parseInt(shortMatch[1] ?? '0', 10);
    const minutes = parseInt(shortMatch[2] ?? '0', 10);
    const seconds = parseInt(shortMatch[3] ?? '0', 10);
    return hours * 3600 + minutes * 60 + seconds;
  }

  return 0;
};

export const formatFileSize = (
  bytes: number,
  format: FileSizeFormat = 'binary',
  decimals = 2
): FileSizeInfo => {
  if (!isFinite(bytes) || bytes < 0) {
    return {
      bytes: 0,
      value: 0,
      unit: 'B',
      formatted: '0 B',
    };
  }

  if (bytes === 0) {
    return {
      bytes: 0,
      value: 0,
      unit: 'B',
      formatted: '0 B',
    };
  }

  const base = format === 'binary' ? BINARY_BASE : DECIMAL_BASE;
  const units = format === 'binary' ? BINARY_UNITS : DECIMAL_UNITS;

  const exponent = Math.min(
    Math.floor(Math.log(bytes) / Math.log(base)),
    units.length - 1
  );
  const value = bytes / Math.pow(base, exponent);
  const unit = units[exponent] ?? 'B';

  const formatted =
    exponent === 0 ? `${bytes} ${unit}` : `${value.toFixed(decimals)} ${unit}`;

  return {
    bytes,
    value,
    unit,
    formatted,
  };
};

export const formatFileSizeShort = (
  bytes: number,
  format: FileSizeFormat = 'binary'
): string => {
  return formatFileSize(bytes, format, 1).formatted;
};

export const parseFileSize = (size: string): number => {
  const match = size.match(/^([\d.]+)\s*(B|KB|MB|GB|TB|PB)?$/i);
  if (!match) return 0;

  const value = parseFloat(match[1] ?? '0');
  const unit = (match[2] ?? 'B').toUpperCase();

  const multipliers: Record<string, number> = {
    B: 1,
    KB: BINARY_BASE,
    MB: Math.pow(BINARY_BASE, 2),
    GB: Math.pow(BINARY_BASE, 3),
    TB: Math.pow(BINARY_BASE, 4),
    PB: Math.pow(BINARY_BASE, 5),
  };

  return Math.round(value * (multipliers[unit] ?? 1));
};

export const formatBitrate = (bitsPerSecond: number): string => {
  if (!isFinite(bitsPerSecond) || bitsPerSecond < 0) {
    return '0 bps';
  }

  const kbps = bitsPerSecond / 1000;
  const mbps = kbps / 1000;

  if (mbps >= 1) {
    return `${mbps.toFixed(2)} Mbps`;
  }
  if (kbps >= 1) {
    return `${kbps.toFixed(0)} kbps`;
  }
  return `${bitsPerSecond.toFixed(0)} bps`;
};

export const formatFrameRate = (fps: number): string => {
  if (!isFinite(fps) || fps <= 0) {
    return '0 fps';
  }

  if (Math.abs(fps - 23.976) < 0.01) return '23.976 fps';
  if (Math.abs(fps - 29.97) < 0.01) return '29.97 fps';
  if (Math.abs(fps - 59.94) < 0.01) return '59.94 fps';

  if (Number.isInteger(fps)) {
    return `${fps} fps`;
  }
  return `${fps.toFixed(2)} fps`;
};

export const formatResolution = (
  width: number,
  height: number,
  format: 'dimensions' | 'label' = 'dimensions'
): string => {
  if (format === 'label') {
    if (width >= 7680 || height >= 4320) return '8K';
    if (width >= 3840 || height >= 2160) return '4K';
    if (width >= 2560 || height >= 1440) return '1440p';
    if (width >= 1920 || height >= 1080) return '1080p';
    if (width >= 1280 || height >= 720) return '720p';
    if (width >= 854 || height >= 480) return '480p';
    if (width >= 640 || height >= 360) return '360p';
    return `${height}p`;
  }

  return `${width}×${height}`;
};

export const formatTimeAgo = (seconds: number): string => {
  const absSeconds = Math.abs(seconds);

  if (absSeconds < 60) {
    return 'just now';
  }

  const minutes = Math.floor(absSeconds / 60);
  if (minutes < 60) {
    return `${minutes} minute${minutes !== 1 ? 's' : ''} ago`;
  }

  const hours = Math.floor(minutes / 60);
  if (hours < 24) {
    return `${hours} hour${hours !== 1 ? 's' : ''} ago`;
  }

  const days = Math.floor(hours / 24);
  if (days < 30) {
    return `${days} day${days !== 1 ? 's' : ''} ago`;
  }

  const months = Math.floor(days / 30);
  if (months < 12) {
    return `${months} month${months !== 1 ? 's' : ''} ago`;
  }

  const years = Math.floor(months / 12);
  return `${years} year${years !== 1 ? 's' : ''} ago`;
};

export const formatPlaybackRate = (rate: number): string => {
  if (rate === 1) return 'Normal';
  if (rate < 1) return `${rate}x (Slow)`;
  return `${rate}x (Fast)`;
};

export const formatTimestamp = (
  seconds: number,
  includeMilliseconds = false
): string => {
  if (!isFinite(seconds) || seconds < 0) {
    return includeMilliseconds ? '00:00:00.000' : '00:00:00';
  }

  const totalMs = Math.floor(seconds * 1000);
  const ms = totalMs % 1000;
  const totalSecs = Math.floor(totalMs / 1000);
  const secs = totalSecs % 60;
  const totalMins = Math.floor(totalSecs / 60);
  const mins = totalMins % 60;
  const hours = Math.floor(totalMins / 60);

  const base = `${String(hours).padStart(2, '0')}:${String(mins).padStart(2, '0')}:${String(secs).padStart(2, '0')}`;

  if (includeMilliseconds) {
    return `${base}.${String(ms).padStart(3, '0')}`;
  }

  return base;
};

export const parseTimestamp = (timestamp: string): number => {
  const match = timestamp.match(/^(\d{1,2}):(\d{2}):(\d{2})(?:\.(\d{1,3}))?$/);

  if (!match) {
    const shortMatch = timestamp.match(/^(\d{1,2}):(\d{2})$/);
    if (shortMatch) {
      const mins = parseInt(shortMatch[1] ?? '0', 10);
      const secs = parseInt(shortMatch[2] ?? '0', 10);
      return mins * 60 + secs;
    }
    return 0;
  }

  const hours = parseInt(match[1] ?? '0', 10);
  const mins = parseInt(match[2] ?? '0', 10);
  const secs = parseInt(match[3] ?? '0', 10);
  const ms = match[4] ? parseInt(match[4].padEnd(3, '0'), 10) : 0;

  return hours * 3600 + mins * 60 + secs + ms / 1000;
};

export const formatProgress = (
  current: number,
  total: number,
  format: 'percentage' | 'fraction' | 'both' = 'percentage'
): string => {
  if (!isFinite(total) || total <= 0) {
    return format === 'fraction' ? '0/0' : '0%';
  }

  const percentage = Math.min(100, Math.max(0, (current / total) * 100));

  switch (format) {
    case 'percentage':
      return `${percentage.toFixed(1)}%`;
    case 'fraction':
      return `${formatDuration(current)}/${formatDuration(total)}`;
    case 'both':
      return `${formatDuration(current)}/${formatDuration(total)} (${percentage.toFixed(0)}%)`;
    default:
      return `${percentage.toFixed(1)}%`;
  }
};
