import type { VideoEmbedInfo, VideoEmbedOptions, VideoProvider } from './types';

const youtubePatterns = [
  /(?:youtube\.com\/watch\?v=|youtu\.be\/|youtube\.com\/embed\/|youtube\.com\/v\/)([a-zA-Z0-9_-]{11})/,
  /youtube\.com\/shorts\/([a-zA-Z0-9_-]{11})/,
];

const vimeoPatterns = [/vimeo\.com\/(\d+)/, /player\.vimeo\.com\/video\/(\d+)/];

const wistiaPatterns = [
  /wistia\.com\/medias\/([a-zA-Z0-9]+)/,
  /fast\.wistia\.net\/embed\/iframe\/([a-zA-Z0-9]+)/,
  /fast\.wistia\.com\/embed\/iframe\/([a-zA-Z0-9]+)/,
];

const dailymotionPatterns = [
  /dailymotion\.com\/video\/([a-zA-Z0-9]+)/,
  /dai\.ly\/([a-zA-Z0-9]+)/,
];

const loomPatterns = [
  /loom\.com\/share\/([a-zA-Z0-9]+)/,
  /loom\.com\/embed\/([a-zA-Z0-9]+)/,
];

const frameioPatterns = [
  /app\.frame\.io\/reviews\/([a-zA-Z0-9-]+)/,
  /app\.frame\.io\/player\/([a-zA-Z0-9-]+)/,
];

export const detectVideoProvider = (url: string): VideoProvider => {
  for (const pattern of youtubePatterns) {
    if (pattern.test(url)) return 'youtube';
  }
  for (const pattern of vimeoPatterns) {
    if (pattern.test(url)) return 'vimeo';
  }
  for (const pattern of wistiaPatterns) {
    if (pattern.test(url)) return 'wistia';
  }
  for (const pattern of dailymotionPatterns) {
    if (pattern.test(url)) return 'dailymotion';
  }
  for (const pattern of loomPatterns) {
    if (pattern.test(url)) return 'loom';
  }
  for (const pattern of frameioPatterns) {
    if (pattern.test(url)) return 'frameio';
  }

  if (/\.(mp4|webm|mov|avi|mkv|m4v|ogv)(\?|#|$)/i.test(url)) {
    return 'native';
  }

  return 'unknown';
};

export const extractVideoId = (
  url: string,
  provider?: VideoProvider
): string | null => {
  const detectedProvider = provider ?? detectVideoProvider(url);

  const patterns: Record<VideoProvider, RegExp[]> = {
    youtube: youtubePatterns,
    vimeo: vimeoPatterns,
    wistia: wistiaPatterns,
    dailymotion: dailymotionPatterns,
    loom: loomPatterns,
    frameio: frameioPatterns,
    native: [],
    unknown: [],
  };

  const providerPatterns = patterns[detectedProvider];
  if (!providerPatterns) return null;

  for (const pattern of providerPatterns) {
    const match = url.match(pattern);
    if (match?.[1]) {
      return match[1];
    }
  }

  return null;
};

const buildYouTubeEmbedUrl = (
  videoId: string,
  options: VideoEmbedOptions = {}
): string => {
  const params = new URLSearchParams();

  if (options.autoplay) params.set('autoplay', '1');
  if (options.muted) params.set('mute', '1');
  if (options.loop) {
    params.set('loop', '1');
    params.set('playlist', videoId);
  }
  if (options.controls === false) params.set('controls', '0');
  if (options.startTime) params.set('start', String(options.startTime));
  if (options.endTime) params.set('end', String(options.endTime));
  if (options.color) params.set('color', options.color);

  const queryString = params.toString();
  return `https://www.youtube.com/embed/${videoId}${queryString ? `?${queryString}` : ''}`;
};

const buildVimeoEmbedUrl = (
  videoId: string,
  options: VideoEmbedOptions = {}
): string => {
  const params = new URLSearchParams();

  if (options.autoplay) params.set('autoplay', '1');
  if (options.muted) params.set('muted', '1');
  if (options.loop) params.set('loop', '1');
  if (options.showTitle === false) params.set('title', '0');
  if (options.showByline === false) params.set('byline', '0');
  if (options.showPortrait === false) params.set('portrait', '0');
  if (options.color) params.set('color', options.color.replace('#', ''));
  if (options.startTime) params.set('t', `${options.startTime}s`);

  const queryString = params.toString();
  return `https://player.vimeo.com/video/${videoId}${queryString ? `?${queryString}` : ''}`;
};

const buildWistiaEmbedUrl = (
  videoId: string,
  options: VideoEmbedOptions = {}
): string => {
  const params = new URLSearchParams();

  if (options.autoplay) params.set('autoPlay', 'true');
  if (options.muted) params.set('muted', 'true');
  if (options.loop) params.set('endVideoBehavior', 'loop');
  if (options.controls === false) params.set('controlsVisibleOnLoad', 'false');
  if (options.startTime) params.set('time', String(options.startTime));

  const queryString = params.toString();
  return `https://fast.wistia.net/embed/iframe/${videoId}${queryString ? `?${queryString}` : ''}`;
};

const buildDailymotionEmbedUrl = (
  videoId: string,
  options: VideoEmbedOptions = {}
): string => {
  const params = new URLSearchParams();

  if (options.autoplay) params.set('autoplay', '1');
  if (options.muted) params.set('mute', '1');
  if (options.loop) params.set('loop', '1');
  if (options.controls === false) params.set('controls', '0');
  if (options.startTime) params.set('start', String(options.startTime));
  if (options.quality) params.set('quality', options.quality);

  const queryString = params.toString();
  return `https://www.dailymotion.com/embed/video/${videoId}${queryString ? `?${queryString}` : ''}`;
};

const buildLoomEmbedUrl = (
  videoId: string,
  options: VideoEmbedOptions = {}
): string => {
  const params = new URLSearchParams();

  if (options.autoplay) params.set('autoplay', '1');
  if (options.muted) params.set('muted', '1');
  if (options.startTime) params.set('t', String(options.startTime));

  const queryString = params.toString();
  return `https://www.loom.com/embed/${videoId}${queryString ? `?${queryString}` : ''}`;
};

const buildFrameioEmbedUrl = (videoId: string): string => {
  return `https://app.frame.io/player/${videoId}`;
};

export const buildEmbedUrl = (
  provider: VideoProvider,
  videoId: string,
  options: VideoEmbedOptions = {}
): string => {
  switch (provider) {
    case 'youtube':
      return buildYouTubeEmbedUrl(videoId, options);
    case 'vimeo':
      return buildVimeoEmbedUrl(videoId, options);
    case 'wistia':
      return buildWistiaEmbedUrl(videoId, options);
    case 'dailymotion':
      return buildDailymotionEmbedUrl(videoId, options);
    case 'loom':
      return buildLoomEmbedUrl(videoId, options);
    case 'frameio':
      return buildFrameioEmbedUrl(videoId);
    default:
      return '';
  }
};

export const getYouTubeThumbnailUrl = (
  videoId: string,
  quality: 'default' | 'medium' | 'high' | 'standard' | 'maxres' = 'high'
): string => {
  const qualityMap: Record<string, string> = {
    default: 'default',
    medium: 'mqdefault',
    high: 'hqdefault',
    standard: 'sddefault',
    maxres: 'maxresdefault',
  };

  return `https://img.youtube.com/vi/${videoId}/${qualityMap[quality]}.jpg`;
};

export const getVimeoThumbnailUrl = async (
  videoId: string
): Promise<string | null> => {
  try {
    const response = await fetch(
      `https://vimeo.com/api/v2/video/${videoId}.json`
    );
    if (!response.ok) return null;

    const data = (await response.json()) as Array<{ thumbnail_large: string }>;
    return data[0]?.thumbnail_large ?? null;
  } catch {
    return null;
  }
};

export const getThumbnailUrl = (
  provider: VideoProvider,
  videoId: string
): string | null => {
  switch (provider) {
    case 'youtube':
      return getYouTubeThumbnailUrl(videoId);
    case 'dailymotion':
      return `https://www.dailymotion.com/thumbnail/video/${videoId}`;
    default:
      return null;
  }
};

export const parseVideoUrl = (url: string): VideoEmbedInfo | null => {
  const provider = detectVideoProvider(url);
  if (provider === 'unknown' || provider === 'native') {
    return null;
  }

  const videoId = extractVideoId(url, provider);
  if (!videoId) {
    return null;
  }

  const embedUrl = buildEmbedUrl(provider, videoId);
  const thumbnailUrl = getThumbnailUrl(provider, videoId);

  return {
    provider,
    videoId,
    embedUrl,
    thumbnailUrl,
    originalUrl: url,
  };
};

export const isEmbeddableVideo = (url: string): boolean => {
  const provider = detectVideoProvider(url);
  return provider !== 'unknown' && provider !== 'native';
};

export const isYouTubeUrl = (url: string): boolean => {
  return detectVideoProvider(url) === 'youtube';
};

export const isVimeoUrl = (url: string): boolean => {
  return detectVideoProvider(url) === 'vimeo';
};

export const isWistiaUrl = (url: string): boolean => {
  return detectVideoProvider(url) === 'wistia';
};

export const isDailymotionUrl = (url: string): boolean => {
  return detectVideoProvider(url) === 'dailymotion';
};

export const isLoomUrl = (url: string): boolean => {
  return detectVideoProvider(url) === 'loom';
};

export const isFrameioUrl = (url: string): boolean => {
  return detectVideoProvider(url) === 'frameio';
};

export const generateIframeHtml = (
  embedInfo: VideoEmbedInfo,
  options: {
    width?: number | string | undefined;
    height?: number | string | undefined;
    title?: string | undefined;
    allowFullscreen?: boolean | undefined;
    loading?: 'lazy' | 'eager' | undefined;
  } = {}
): string => {
  const {
    width = '100%',
    height = '100%',
    title = 'Video player',
    allowFullscreen = true,
    loading = 'lazy',
  } = options;

  const widthAttr = typeof width === 'number' ? `${width}px` : width;
  const heightAttr = typeof height === 'number' ? `${height}px` : height;

  return `<iframe
  src="${embedInfo.embedUrl}"
  width="${widthAttr}"
  height="${heightAttr}"
  title="${title}"
  frameborder="0"
  ${allowFullscreen ? 'allowfullscreen' : ''}
  loading="${loading}"
  allow="accelerometer; autoplay; clipboard-write; encrypted-media; gyroscope; picture-in-picture"
></iframe>`;
};

export const getVideoTimestamp = (url: string): number | null => {
  try {
    const parsed = new URL(url);
    const t = parsed.searchParams.get('t') ?? parsed.searchParams.get('start');
    if (t) {
      if (/^\d+$/.test(t)) {
        return parseInt(t, 10);
      }
      const match = t.match(/(?:(\d+)h)?(?:(\d+)m)?(?:(\d+)s?)?/);
      if (match) {
        const hours = parseInt(match[1] ?? '0', 10);
        const minutes = parseInt(match[2] ?? '0', 10);
        const seconds = parseInt(match[3] ?? '0', 10);
        return hours * 3600 + minutes * 60 + seconds;
      }
    }
  } catch {
    return null;
  }
  return null;
};
