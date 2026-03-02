export type MediaCategory =
  | 'video'
  | 'audio'
  | 'image'
  | 'document'
  | 'unknown';

export type VideoProvider =
  | 'youtube'
  | 'vimeo'
  | 'wistia'
  | 'dailymotion'
  | 'loom'
  | 'frameio'
  | 'native'
  | 'unknown';

export type ImageFormat =
  | 'jpeg'
  | 'jpg'
  | 'png'
  | 'gif'
  | 'webp'
  | 'avif'
  | 'svg'
  | 'ico'
  | 'bmp'
  | 'tiff';

export type VideoFormat =
  | 'mp4'
  | 'webm'
  | 'mov'
  | 'avi'
  | 'mkv'
  | 'flv'
  | 'm4v'
  | 'wmv'
  | 'ogv';

export type AudioFormat =
  | 'mp3'
  | 'wav'
  | 'ogg'
  | 'aac'
  | 'm4a'
  | 'flac'
  | 'wma'
  | 'opus';

export type DocumentFormat =
  | 'pdf'
  | 'doc'
  | 'docx'
  | 'xls'
  | 'xlsx'
  | 'ppt'
  | 'pptx'
  | 'txt'
  | 'rtf'
  | 'csv';

export type MediaFormat =
  | ImageFormat
  | VideoFormat
  | AudioFormat
  | DocumentFormat;

export type MimeTypeCategory = MediaCategory;

export type MimeTypeInfo = {
  type: string;
  category: MediaCategory;
  extension: string;
  description: string;
};

export type MediaInfo = {
  category: MediaCategory;
  format: MediaFormat | null;
  mimeType: string | null;
  extension: string;
};

export type VideoEmbedInfo = {
  provider: VideoProvider;
  videoId: string;
  embedUrl: string;
  thumbnailUrl: string | null;
  originalUrl: string;
};

export type VideoEmbedOptions = {
  autoplay?: boolean | undefined;
  muted?: boolean | undefined;
  loop?: boolean | undefined;
  controls?: boolean | undefined;
  showTitle?: boolean | undefined;
  showByline?: boolean | undefined;
  showPortrait?: boolean | undefined;
  color?: string | undefined;
  quality?:
    | 'auto'
    | 'small'
    | 'medium'
    | 'large'
    | 'hd720'
    | 'hd1080'
    | undefined;
  startTime?: number | undefined;
  endTime?: number | undefined;
};

export type AspectRatio = {
  width: number;
  height: number;
  value: number;
  label: string;
};

export type AspectRatioPreset =
  | '16:9'
  | '4:3'
  | '1:1'
  | '9:16'
  | '21:9'
  | '3:2'
  | '2:3'
  | '5:4'
  | '4:5';

export type Dimensions = {
  width: number;
  height: number;
};

export type DurationFormat = 'colon' | 'verbose' | 'short' | 'minimal';

export type FileSizeFormat = 'binary' | 'decimal';

export type FileSizeUnit = 'B' | 'KB' | 'MB' | 'GB' | 'TB' | 'PB';

export type FileSizeInfo = {
  bytes: number;
  value: number;
  unit: FileSizeUnit;
  formatted: string;
};

export type ThumbnailSize = 'small' | 'medium' | 'large' | 'original';

export type ThumbnailOptions = {
  size?: ThumbnailSize | undefined;
  width?: number | undefined;
  height?: number | undefined;
  quality?: number | undefined;
  format?: 'jpeg' | 'png' | 'webp' | undefined;
};

export type VideoPlayerState = {
  isPlaying: boolean;
  isPaused: boolean;
  isBuffering: boolean;
  isMuted: boolean;
  isFullscreen: boolean;
  currentTime: number;
  duration: number;
  volume: number;
  playbackRate: number;
  buffered: number;
};

export type MediaLoadState = 'idle' | 'loading' | 'loaded' | 'error';

export type MediaError = {
  code: number;
  message: string;
  type: 'network' | 'decode' | 'src_not_supported' | 'unknown';
};

export type MediaMetadata = {
  title?: string | undefined;
  artist?: string | undefined;
  album?: string | undefined;
  artwork?: Array<{ src: string; sizes?: string; type?: string }> | undefined;
};

export type VideoQuality = {
  label: string;
  width: number;
  height: number;
  bitrate?: number | undefined;
};

export type VideoSource = {
  src: string;
  type: string;
  quality?: VideoQuality | undefined;
};

export type CaptionTrack = {
  src: string;
  srclang: string;
  label: string;
  kind: 'subtitles' | 'captions' | 'descriptions' | 'chapters' | 'metadata';
  default?: boolean | undefined;
};
