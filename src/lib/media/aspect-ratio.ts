import type { AspectRatio, AspectRatioPreset, Dimensions } from './types';

const ASPECT_RATIO_PRESETS: Record<AspectRatioPreset, AspectRatio> = {
  '16:9': { width: 16, height: 9, value: 16 / 9, label: '16:9 (Widescreen)' },
  '4:3': { width: 4, height: 3, value: 4 / 3, label: '4:3 (Standard)' },
  '1:1': { width: 1, height: 1, value: 1, label: '1:1 (Square)' },
  '9:16': { width: 9, height: 16, value: 9 / 16, label: '9:16 (Vertical)' },
  '21:9': { width: 21, height: 9, value: 21 / 9, label: '21:9 (Ultrawide)' },
  '3:2': { width: 3, height: 2, value: 3 / 2, label: '3:2 (Classic Photo)' },
  '2:3': { width: 2, height: 3, value: 2 / 3, label: '2:3 (Portrait Photo)' },
  '5:4': { width: 5, height: 4, value: 5 / 4, label: '5:4 (Large Format)' },
  '4:5': {
    width: 4,
    height: 5,
    value: 4 / 5,
    label: '4:5 (Instagram Portrait)',
  },
};

const gcd = (a: number, b: number): number => {
  a = Math.abs(Math.round(a));
  b = Math.abs(Math.round(b));
  while (b !== 0) {
    const t = b;
    b = a % b;
    a = t;
  }
  return a;
};

export const calculateAspectRatio = (
  width: number,
  height: number
): AspectRatio => {
  if (width <= 0 || height <= 0) {
    return { width: 0, height: 0, value: 0, label: 'Invalid' };
  }

  const divisor = gcd(width, height);
  const simplifiedWidth = width / divisor;
  const simplifiedHeight = height / divisor;
  const value = width / height;

  return {
    width: simplifiedWidth,
    height: simplifiedHeight,
    value,
    label: `${simplifiedWidth}:${simplifiedHeight}`,
  };
};

export const getAspectRatioPreset = (
  preset: AspectRatioPreset
): AspectRatio => {
  return ASPECT_RATIO_PRESETS[preset];
};

export const getAllAspectRatioPresets = (): AspectRatio[] => {
  return Object.values(ASPECT_RATIO_PRESETS);
};

export const findClosestAspectRatio = (
  width: number,
  height: number,
  tolerance = 0.05
): AspectRatioPreset | null => {
  if (width <= 0 || height <= 0) return null;

  const targetValue = width / height;
  let closestPreset: AspectRatioPreset | null = null;
  let closestDifference = Infinity;

  for (const [preset, ratio] of Object.entries(ASPECT_RATIO_PRESETS)) {
    const difference = Math.abs(ratio.value - targetValue);
    if (difference < closestDifference && difference <= tolerance) {
      closestDifference = difference;
      closestPreset = preset as AspectRatioPreset;
    }
  }

  return closestPreset;
};

export const dimensionsFromAspectRatio = (
  aspectRatio: AspectRatio | AspectRatioPreset,
  constraint: { width: number } | { height: number }
): Dimensions => {
  const ratio =
    typeof aspectRatio === 'string'
      ? ASPECT_RATIO_PRESETS[aspectRatio]
      : aspectRatio;

  if (!ratio || ratio.value <= 0) {
    return { width: 0, height: 0 };
  }

  if ('width' in constraint) {
    return {
      width: constraint.width,
      height: Math.round(constraint.width / ratio.value),
    };
  }

  return {
    width: Math.round(constraint.height * ratio.value),
    height: constraint.height,
  };
};

export const fitToContainer = (
  mediaWidth: number,
  mediaHeight: number,
  containerWidth: number,
  containerHeight: number,
  mode: 'contain' | 'cover' = 'contain'
): Dimensions => {
  if (
    mediaWidth <= 0 ||
    mediaHeight <= 0 ||
    containerWidth <= 0 ||
    containerHeight <= 0
  ) {
    return { width: 0, height: 0 };
  }

  const mediaRatio = mediaWidth / mediaHeight;
  const containerRatio = containerWidth / containerHeight;

  let width: number;
  let height: number;

  if (mode === 'contain') {
    if (mediaRatio > containerRatio) {
      width = containerWidth;
      height = containerWidth / mediaRatio;
    } else {
      height = containerHeight;
      width = containerHeight * mediaRatio;
    }
  } else {
    if (mediaRatio > containerRatio) {
      height = containerHeight;
      width = containerHeight * mediaRatio;
    } else {
      width = containerWidth;
      height = containerWidth / mediaRatio;
    }
  }

  return {
    width: Math.round(width),
    height: Math.round(height),
  };
};

export const scaleToFit = (
  width: number,
  height: number,
  maxWidth: number,
  maxHeight: number
): Dimensions => {
  if (width <= 0 || height <= 0) {
    return { width: 0, height: 0 };
  }

  if (width <= maxWidth && height <= maxHeight) {
    return { width, height };
  }

  const widthRatio = maxWidth / width;
  const heightRatio = maxHeight / height;
  const scale = Math.min(widthRatio, heightRatio);

  return {
    width: Math.round(width * scale),
    height: Math.round(height * scale),
  };
};

export const scaleByFactor = (
  width: number,
  height: number,
  factor: number
): Dimensions => {
  if (width <= 0 || height <= 0 || factor <= 0) {
    return { width: 0, height: 0 };
  }

  return {
    width: Math.round(width * factor),
    height: Math.round(height * factor),
  };
};

export const scaleToWidth = (
  width: number,
  height: number,
  targetWidth: number
): Dimensions => {
  if (width <= 0 || height <= 0 || targetWidth <= 0) {
    return { width: 0, height: 0 };
  }

  const ratio = height / width;
  return {
    width: targetWidth,
    height: Math.round(targetWidth * ratio),
  };
};

export const scaleToHeight = (
  width: number,
  height: number,
  targetHeight: number
): Dimensions => {
  if (width <= 0 || height <= 0 || targetHeight <= 0) {
    return { width: 0, height: 0 };
  }

  const ratio = width / height;
  return {
    width: Math.round(targetHeight * ratio),
    height: targetHeight,
  };
};

export const isLandscape = (width: number, height: number): boolean => {
  return width > height;
};

export const isPortrait = (width: number, height: number): boolean => {
  return height > width;
};

export const isSquare = (
  width: number,
  height: number,
  tolerance = 0.01
): boolean => {
  if (width <= 0 || height <= 0) return false;
  const ratio = width / height;
  return Math.abs(ratio - 1) <= tolerance;
};

export const getOrientation = (
  width: number,
  height: number
): 'landscape' | 'portrait' | 'square' => {
  if (isSquare(width, height)) return 'square';
  if (isLandscape(width, height)) return 'landscape';
  return 'portrait';
};

export const parseAspectRatioString = (ratio: string): AspectRatio | null => {
  const match = ratio.match(/^(\d+(?:\.\d+)?):(\d+(?:\.\d+)?)$/);
  if (!match) return null;

  const width = parseFloat(match[1] ?? '0');
  const height = parseFloat(match[2] ?? '0');

  if (width <= 0 || height <= 0) return null;

  return {
    width,
    height,
    value: width / height,
    label: ratio,
  };
};

export const formatAspectRatio = (
  width: number,
  height: number,
  simplify = true
): string => {
  if (width <= 0 || height <= 0) return 'Invalid';

  if (simplify) {
    const ratio = calculateAspectRatio(width, height);
    return ratio.label;
  }

  return `${width}:${height}`;
};

export const getPaddingBottomForAspectRatio = (
  aspectRatio: AspectRatio | AspectRatioPreset
): string => {
  const ratio =
    typeof aspectRatio === 'string'
      ? ASPECT_RATIO_PRESETS[aspectRatio]
      : aspectRatio;

  if (!ratio || ratio.value <= 0) return '100%';

  const percentage = (1 / ratio.value) * 100;
  return `${percentage.toFixed(4)}%`;
};

export const getCommonVideoAspectRatios = (): AspectRatio[] => {
  return [
    ASPECT_RATIO_PRESETS['16:9'],
    ASPECT_RATIO_PRESETS['4:3'],
    ASPECT_RATIO_PRESETS['21:9'],
    ASPECT_RATIO_PRESETS['9:16'],
    ASPECT_RATIO_PRESETS['1:1'],
  ];
};

export const getCommonImageAspectRatios = (): AspectRatio[] => {
  return [
    ASPECT_RATIO_PRESETS['3:2'],
    ASPECT_RATIO_PRESETS['4:3'],
    ASPECT_RATIO_PRESETS['16:9'],
    ASPECT_RATIO_PRESETS['1:1'],
    ASPECT_RATIO_PRESETS['2:3'],
    ASPECT_RATIO_PRESETS['4:5'],
  ];
};

export const cropToAspectRatio = (
  sourceWidth: number,
  sourceHeight: number,
  targetRatio: AspectRatio | AspectRatioPreset
): { x: number; y: number; width: number; height: number } => {
  const ratio =
    typeof targetRatio === 'string'
      ? ASPECT_RATIO_PRESETS[targetRatio]
      : targetRatio;

  if (sourceWidth <= 0 || sourceHeight <= 0 || !ratio || ratio.value <= 0) {
    return { x: 0, y: 0, width: 0, height: 0 };
  }

  const sourceRatio = sourceWidth / sourceHeight;
  let cropWidth: number;
  let cropHeight: number;

  if (sourceRatio > ratio.value) {
    cropHeight = sourceHeight;
    cropWidth = sourceHeight * ratio.value;
  } else {
    cropWidth = sourceWidth;
    cropHeight = sourceWidth / ratio.value;
  }

  const x = (sourceWidth - cropWidth) / 2;
  const y = (sourceHeight - cropHeight) / 2;

  return {
    x: Math.round(x),
    y: Math.round(y),
    width: Math.round(cropWidth),
    height: Math.round(cropHeight),
  };
};
