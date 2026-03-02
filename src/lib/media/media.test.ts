import { describe, expect, it } from 'vitest';

import {
  calculateAspectRatio,
  cropToAspectRatio,
  dimensionsFromAspectRatio,
  findClosestAspectRatio,
  fitToContainer,
  formatAspectRatio,
  getAllAspectRatioPresets,
  getAspectRatioPreset,
  getCommonImageAspectRatios,
  getCommonVideoAspectRatios,
  getOrientation,
  getPaddingBottomForAspectRatio,
  isLandscape,
  isPortrait,
  isSquare,
  parseAspectRatioString,
  scaleByFactor,
  scaleToFit,
  scaleToHeight,
  scaleToWidth,
} from './aspect-ratio';
import {
  formatBitrate,
  formatDuration,
  formatFileSize,
  formatFileSizeShort,
  formatFrameRate,
  formatPlaybackRate,
  formatProgress,
  formatResolution,
  formatTimeAgo,
  formatTimestamp,
  parseDuration,
  parseFileSize,
  parseTimestamp,
} from './formatting';
import {
  detectMediaFromFilename,
  detectMediaFromUrl,
  getExtensionFromFilename,
  getExtensionFromUrl,
  getMediaCategory,
  isAudioExtension,
  isAudioUrl,
  isDocumentExtension,
  isDocumentUrl,
  isImageExtension,
  isImageUrl,
  isMediaExtension,
  isMediaUrl,
  isVideoExtension,
  isVideoUrl,
} from './media-detection';
import {
  getAcceptString,
  getCategoryFromExtension,
  getCategoryFromMimeType,
  getExtensionFromMimeType,
  getMimeTypeFromExtension,
  getMimeTypeInfo,
  getMimeTypesByCategory,
  isAudioMimeType,
  isDocumentMimeType,
  isImageMimeType,
  isMediaMimeType,
  isValidMimeType,
  isVideoMimeType,
  normalizeMimeType,
} from './mime-types';
import {
  buildEmbedUrl,
  detectVideoProvider,
  extractVideoId,
  generateIframeHtml,
  getThumbnailUrl,
  getVideoTimestamp,
  getYouTubeThumbnailUrl,
  isDailymotionUrl,
  isEmbeddableVideo,
  isFrameioUrl,
  isLoomUrl,
  isVimeoUrl,
  isWistiaUrl,
  isYouTubeUrl,
  parseVideoUrl,
} from './video-embeds';

describe('Media Utilities', () => {
  describe('MIME Types', () => {
    describe('getMimeTypeInfo', () => {
      it('returns info for known mime types', () => {
        const info = getMimeTypeInfo('image/jpeg');
        expect(info).toEqual({
          type: 'image/jpeg',
          category: 'image',
          extension: 'jpg',
          description: 'JPEG Image',
        });
      });

      it('returns null for unknown mime types', () => {
        expect(getMimeTypeInfo('unknown/type')).toBeNull();
      });
    });

    describe('getMimeTypeFromExtension', () => {
      it('returns mime type for jpg', () => {
        expect(getMimeTypeFromExtension('jpg')).toBe('image/jpeg');
        expect(getMimeTypeFromExtension('jpeg')).toBe('image/jpeg');
      });

      it('returns mime type for mp4', () => {
        expect(getMimeTypeFromExtension('mp4')).toBe('video/mp4');
      });

      it('returns mime type for mp3', () => {
        expect(getMimeTypeFromExtension('mp3')).toBe('audio/mpeg');
      });

      it('handles extensions with dot prefix', () => {
        expect(getMimeTypeFromExtension('.png')).toBe('image/png');
      });

      it('returns null for unknown extensions', () => {
        expect(getMimeTypeFromExtension('xyz')).toBeNull();
      });
    });

    describe('getExtensionFromMimeType', () => {
      it('returns extension for image/jpeg', () => {
        expect(getExtensionFromMimeType('image/jpeg')).toBe('jpg');
      });

      it('returns extension for video/mp4', () => {
        expect(getExtensionFromMimeType('video/mp4')).toBe('mp4');
      });

      it('returns null for unknown mime types', () => {
        expect(getExtensionFromMimeType('unknown/type')).toBeNull();
      });
    });

    describe('getCategoryFromMimeType', () => {
      it('returns image for image mime types', () => {
        expect(getCategoryFromMimeType('image/png')).toBe('image');
        expect(getCategoryFromMimeType('image/gif')).toBe('image');
      });

      it('returns video for video mime types', () => {
        expect(getCategoryFromMimeType('video/mp4')).toBe('video');
        expect(getCategoryFromMimeType('video/webm')).toBe('video');
      });

      it('returns audio for audio mime types', () => {
        expect(getCategoryFromMimeType('audio/mpeg')).toBe('audio');
        expect(getCategoryFromMimeType('audio/wav')).toBe('audio');
      });

      it('returns document for document mime types', () => {
        expect(getCategoryFromMimeType('application/pdf')).toBe('document');
        expect(getCategoryFromMimeType('text/plain')).toBe('document');
      });

      it('returns unknown for unrecognized mime types', () => {
        expect(getCategoryFromMimeType('foo/bar')).toBe('unknown');
      });
    });

    describe('getCategoryFromExtension', () => {
      it('returns correct category for extensions', () => {
        expect(getCategoryFromExtension('jpg')).toBe('image');
        expect(getCategoryFromExtension('mp4')).toBe('video');
        expect(getCategoryFromExtension('mp3')).toBe('audio');
        expect(getCategoryFromExtension('pdf')).toBe('document');
        expect(getCategoryFromExtension('xyz')).toBe('unknown');
      });
    });

    describe('mime type category checks', () => {
      it('isImageMimeType', () => {
        expect(isImageMimeType('image/jpeg')).toBe(true);
        expect(isImageMimeType('video/mp4')).toBe(false);
      });

      it('isVideoMimeType', () => {
        expect(isVideoMimeType('video/mp4')).toBe(true);
        expect(isVideoMimeType('audio/mpeg')).toBe(false);
      });

      it('isAudioMimeType', () => {
        expect(isAudioMimeType('audio/mpeg')).toBe(true);
        expect(isAudioMimeType('image/png')).toBe(false);
      });

      it('isDocumentMimeType', () => {
        expect(isDocumentMimeType('application/pdf')).toBe(true);
        expect(isDocumentMimeType('text/plain')).toBe(true);
        expect(isDocumentMimeType('image/png')).toBe(false);
      });

      it('isMediaMimeType', () => {
        expect(isMediaMimeType('image/png')).toBe(true);
        expect(isMediaMimeType('video/mp4')).toBe(true);
        expect(isMediaMimeType('audio/mpeg')).toBe(true);
        expect(isMediaMimeType('application/pdf')).toBe(false);
      });
    });

    describe('getAcceptString', () => {
      it('returns correct accept string for images', () => {
        expect(getAcceptString(['image'])).toBe('image/*');
      });

      it('returns correct accept string for multiple categories', () => {
        const result = getAcceptString(['image', 'video']);
        expect(result).toBe('image/*,video/*');
      });
    });

    describe('getMimeTypesByCategory', () => {
      it('returns all image mime types', () => {
        const images = getMimeTypesByCategory('image');
        expect(images.length).toBeGreaterThan(0);
        expect(images.every((m) => m.category === 'image')).toBe(true);
      });
    });

    describe('isValidMimeType', () => {
      it('returns true for known mime types', () => {
        expect(isValidMimeType('image/jpeg')).toBe(true);
        expect(isValidMimeType('video/mp4')).toBe(true);
      });

      it('returns true for valid but unknown subtypes', () => {
        expect(isValidMimeType('image/custom')).toBe(true);
      });

      it('returns false for invalid mime types', () => {
        expect(isValidMimeType('invalid')).toBe(false);
      });
    });

    describe('normalizeMimeType', () => {
      it('lowercases and trims', () => {
        expect(normalizeMimeType('  IMAGE/JPEG  ')).toBe('image/jpeg');
      });

      it('removes charset and parameters', () => {
        expect(normalizeMimeType('text/html; charset=utf-8')).toBe('text/html');
      });
    });
  });

  describe('Media Detection', () => {
    describe('getExtensionFromUrl', () => {
      it('extracts extension from simple URL', () => {
        expect(getExtensionFromUrl('https://example.com/image.jpg')).toBe(
          'jpg'
        );
      });

      it('handles URLs with query strings', () => {
        expect(
          getExtensionFromUrl('https://example.com/video.mp4?token=abc')
        ).toBe('mp4');
      });

      it('handles URLs with fragments', () => {
        expect(getExtensionFromUrl('https://example.com/doc.pdf#page=2')).toBe(
          'pdf'
        );
      });

      it('returns empty string for URLs without extension', () => {
        expect(getExtensionFromUrl('https://example.com/path')).toBe('');
      });
    });

    describe('getExtensionFromFilename', () => {
      it('extracts extension from filename', () => {
        expect(getExtensionFromFilename('image.jpg')).toBe('jpg');
        expect(getExtensionFromFilename('document.PDF')).toBe('pdf');
      });

      it('handles files without extension', () => {
        expect(getExtensionFromFilename('README')).toBe('');
      });

      it('handles hidden files', () => {
        expect(getExtensionFromFilename('.gitignore')).toBe('');
      });
    });

    describe('extension type checks', () => {
      it('isImageExtension', () => {
        expect(isImageExtension('jpg')).toBe(true);
        expect(isImageExtension('png')).toBe(true);
        expect(isImageExtension('gif')).toBe(true);
        expect(isImageExtension('mp4')).toBe(false);
      });

      it('isVideoExtension', () => {
        expect(isVideoExtension('mp4')).toBe(true);
        expect(isVideoExtension('webm')).toBe(true);
        expect(isVideoExtension('mov')).toBe(true);
        expect(isVideoExtension('jpg')).toBe(false);
      });

      it('isAudioExtension', () => {
        expect(isAudioExtension('mp3')).toBe(true);
        expect(isAudioExtension('wav')).toBe(true);
        expect(isAudioExtension('ogg')).toBe(true);
        expect(isAudioExtension('jpg')).toBe(false);
      });

      it('isDocumentExtension', () => {
        expect(isDocumentExtension('pdf')).toBe(true);
        expect(isDocumentExtension('docx')).toBe(true);
        expect(isDocumentExtension('jpg')).toBe(false);
      });

      it('isMediaExtension', () => {
        expect(isMediaExtension('jpg')).toBe(true);
        expect(isMediaExtension('mp4')).toBe(true);
        expect(isMediaExtension('mp3')).toBe(true);
        expect(isMediaExtension('pdf')).toBe(false);
      });
    });

    describe('URL type checks', () => {
      it('isImageUrl', () => {
        expect(isImageUrl('https://example.com/image.jpg')).toBe(true);
        expect(isImageUrl('https://example.com/video.mp4')).toBe(false);
      });

      it('isVideoUrl', () => {
        expect(isVideoUrl('https://example.com/video.mp4')).toBe(true);
        expect(isVideoUrl('https://example.com/image.jpg')).toBe(false);
      });

      it('isAudioUrl', () => {
        expect(isAudioUrl('https://example.com/audio.mp3')).toBe(true);
        expect(isAudioUrl('https://example.com/video.mp4')).toBe(false);
      });

      it('isDocumentUrl', () => {
        expect(isDocumentUrl('https://example.com/doc.pdf')).toBe(true);
        expect(isDocumentUrl('https://example.com/video.mp4')).toBe(false);
      });

      it('isMediaUrl', () => {
        expect(isMediaUrl('https://example.com/image.jpg')).toBe(true);
        expect(isMediaUrl('https://example.com/video.mp4')).toBe(true);
        expect(isMediaUrl('https://example.com/doc.pdf')).toBe(false);
      });
    });

    describe('getMediaCategory', () => {
      it('detects category from mime type', () => {
        expect(getMediaCategory('image/jpeg')).toBe('image');
        expect(getMediaCategory('video/mp4')).toBe('video');
      });

      it('detects category from extension', () => {
        expect(getMediaCategory('jpg')).toBe('image');
        expect(getMediaCategory('mp4')).toBe('video');
      });
    });

    describe('detectMediaFromUrl', () => {
      it('returns media info for image URL', () => {
        const info = detectMediaFromUrl('https://example.com/image.png');
        expect(info.category).toBe('image');
        expect(info.extension).toBe('png');
        expect(info.mimeType).toBe('image/png');
      });

      it('returns media info for video URL', () => {
        const info = detectMediaFromUrl('https://example.com/video.mp4');
        expect(info.category).toBe('video');
        expect(info.extension).toBe('mp4');
      });
    });

    describe('detectMediaFromFilename', () => {
      it('returns media info for filename', () => {
        const info = detectMediaFromFilename('photo.jpg');
        expect(info.category).toBe('image');
        expect(info.extension).toBe('jpg');
      });
    });
  });

  describe('Video Embeds', () => {
    describe('detectVideoProvider', () => {
      it('detects YouTube', () => {
        expect(
          detectVideoProvider('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
        ).toBe('youtube');
        expect(detectVideoProvider('https://youtu.be/dQw4w9WgXcQ')).toBe(
          'youtube'
        );
        expect(
          detectVideoProvider('https://www.youtube.com/embed/dQw4w9WgXcQ')
        ).toBe('youtube');
        expect(
          detectVideoProvider('https://www.youtube.com/shorts/dQw4w9WgXcQ')
        ).toBe('youtube');
      });

      it('detects Vimeo', () => {
        expect(detectVideoProvider('https://vimeo.com/123456789')).toBe(
          'vimeo'
        );
        expect(
          detectVideoProvider('https://player.vimeo.com/video/123456789')
        ).toBe('vimeo');
      });

      it('detects Wistia', () => {
        expect(
          detectVideoProvider('https://company.wistia.com/medias/abc123')
        ).toBe('wistia');
      });

      it('detects Dailymotion', () => {
        expect(
          detectVideoProvider('https://www.dailymotion.com/video/x2abc123')
        ).toBe('dailymotion');
        expect(detectVideoProvider('https://dai.ly/x2abc123')).toBe(
          'dailymotion'
        );
      });

      it('detects Loom', () => {
        expect(
          detectVideoProvider('https://www.loom.com/share/abc123def456')
        ).toBe('loom');
      });

      it('detects Frame.io', () => {
        expect(
          detectVideoProvider('https://app.frame.io/reviews/abc-123-def')
        ).toBe('frameio');
      });

      it('detects native video files', () => {
        expect(detectVideoProvider('https://example.com/video.mp4')).toBe(
          'native'
        );
      });

      it('returns unknown for unrecognized URLs', () => {
        expect(detectVideoProvider('https://example.com/page')).toBe('unknown');
      });
    });

    describe('extractVideoId', () => {
      it('extracts YouTube video ID', () => {
        expect(
          extractVideoId('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
        ).toBe('dQw4w9WgXcQ');
        expect(extractVideoId('https://youtu.be/dQw4w9WgXcQ')).toBe(
          'dQw4w9WgXcQ'
        );
      });

      it('extracts Vimeo video ID', () => {
        expect(extractVideoId('https://vimeo.com/123456789')).toBe('123456789');
      });

      it('returns null for invalid URLs', () => {
        expect(extractVideoId('https://example.com/page')).toBeNull();
      });
    });

    describe('buildEmbedUrl', () => {
      it('builds YouTube embed URL', () => {
        const url = buildEmbedUrl('youtube', 'dQw4w9WgXcQ');
        expect(url).toBe('https://www.youtube.com/embed/dQw4w9WgXcQ');
      });

      it('builds YouTube embed URL with options', () => {
        const url = buildEmbedUrl('youtube', 'dQw4w9WgXcQ', {
          autoplay: true,
          muted: true,
        });
        expect(url).toContain('autoplay=1');
        expect(url).toContain('mute=1');
      });

      it('builds Vimeo embed URL', () => {
        const url = buildEmbedUrl('vimeo', '123456789');
        expect(url).toBe('https://player.vimeo.com/video/123456789');
      });

      it('builds Vimeo embed URL with options', () => {
        const url = buildEmbedUrl('vimeo', '123456789', {
          showTitle: false,
          color: 'ff0000',
        });
        expect(url).toContain('title=0');
        expect(url).toContain('color=ff0000');
      });
    });

    describe('getYouTubeThumbnailUrl', () => {
      it('returns default quality thumbnail', () => {
        expect(getYouTubeThumbnailUrl('dQw4w9WgXcQ', 'default')).toBe(
          'https://img.youtube.com/vi/dQw4w9WgXcQ/default.jpg'
        );
      });

      it('returns high quality thumbnail', () => {
        expect(getYouTubeThumbnailUrl('dQw4w9WgXcQ', 'high')).toBe(
          'https://img.youtube.com/vi/dQw4w9WgXcQ/hqdefault.jpg'
        );
      });
    });

    describe('getThumbnailUrl', () => {
      it('returns YouTube thumbnail', () => {
        const url = getThumbnailUrl('youtube', 'dQw4w9WgXcQ');
        expect(url).toContain('youtube.com');
      });

      it('returns null for unsupported providers', () => {
        expect(getThumbnailUrl('wistia', 'abc123')).toBeNull();
      });
    });

    describe('parseVideoUrl', () => {
      it('parses YouTube URL', () => {
        const result = parseVideoUrl(
          'https://www.youtube.com/watch?v=dQw4w9WgXcQ'
        );
        expect(result).not.toBeNull();
        expect(result?.provider).toBe('youtube');
        expect(result?.videoId).toBe('dQw4w9WgXcQ');
        expect(result?.embedUrl).toContain('embed');
        expect(result?.thumbnailUrl).not.toBeNull();
      });

      it('returns null for non-embeddable URLs', () => {
        expect(parseVideoUrl('https://example.com/page')).toBeNull();
      });
    });

    describe('provider checks', () => {
      it('isYouTubeUrl', () => {
        expect(
          isYouTubeUrl('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
        ).toBe(true);
        expect(isYouTubeUrl('https://vimeo.com/123')).toBe(false);
      });

      it('isVimeoUrl', () => {
        expect(isVimeoUrl('https://vimeo.com/123456789')).toBe(true);
        expect(isVimeoUrl('https://youtube.com/watch?v=abc')).toBe(false);
      });

      it('isWistiaUrl', () => {
        expect(isWistiaUrl('https://company.wistia.com/medias/abc')).toBe(true);
        expect(isWistiaUrl('https://youtube.com/watch?v=abc')).toBe(false);
      });

      it('isDailymotionUrl', () => {
        expect(isDailymotionUrl('https://dailymotion.com/video/abc')).toBe(
          true
        );
        expect(isDailymotionUrl('https://youtube.com/watch?v=abc')).toBe(false);
      });

      it('isLoomUrl', () => {
        expect(isLoomUrl('https://www.loom.com/share/abc123')).toBe(true);
        expect(isLoomUrl('https://youtube.com/watch?v=abc')).toBe(false);
      });

      it('isFrameioUrl', () => {
        expect(isFrameioUrl('https://app.frame.io/reviews/abc-123')).toBe(true);
        expect(isFrameioUrl('https://youtube.com/watch?v=abc')).toBe(false);
      });

      it('isEmbeddableVideo', () => {
        expect(
          isEmbeddableVideo('https://www.youtube.com/watch?v=dQw4w9WgXcQ')
        ).toBe(true);
        expect(isEmbeddableVideo('https://example.com/video.mp4')).toBe(false);
      });
    });

    describe('generateIframeHtml', () => {
      it('generates valid iframe HTML', () => {
        const embedInfo = {
          provider: 'youtube' as const,
          videoId: 'dQw4w9WgXcQ',
          embedUrl: 'https://www.youtube.com/embed/dQw4w9WgXcQ',
          thumbnailUrl: null,
          originalUrl: 'https://www.youtube.com/watch?v=dQw4w9WgXcQ',
        };
        const html = generateIframeHtml(embedInfo);
        expect(html).toContain('<iframe');
        expect(html).toContain(
          'src="https://www.youtube.com/embed/dQw4w9WgXcQ"'
        );
        expect(html).toContain('allowfullscreen');
      });
    });

    describe('getVideoTimestamp', () => {
      it('extracts timestamp from YouTube URL', () => {
        expect(
          getVideoTimestamp('https://www.youtube.com/watch?v=abc&t=123')
        ).toBe(123);
      });

      it('parses formatted timestamps', () => {
        expect(
          getVideoTimestamp('https://www.youtube.com/watch?v=abc&t=1h30m45s')
        ).toBe(5445);
      });

      it('returns null when no timestamp', () => {
        expect(
          getVideoTimestamp('https://www.youtube.com/watch?v=abc')
        ).toBeNull();
      });
    });
  });

  describe('Formatting', () => {
    describe('formatDuration', () => {
      it('formats seconds in colon format', () => {
        expect(formatDuration(0)).toBe('0:00');
        expect(formatDuration(30)).toBe('0:30');
        expect(formatDuration(90)).toBe('1:30');
        expect(formatDuration(3661)).toBe('1:01:01');
      });

      it('formats in verbose format', () => {
        expect(formatDuration(0, 'verbose')).toBe('0 seconds');
        expect(formatDuration(1, 'verbose')).toBe('1 second');
        expect(formatDuration(61, 'verbose')).toBe('1 minute, 1 second');
        expect(formatDuration(3661, 'verbose')).toBe(
          '1 hour, 1 minute, 1 second'
        );
      });

      it('formats in short format', () => {
        expect(formatDuration(3661, 'short')).toBe('1h 1m 1s');
      });

      it('formats in minimal format', () => {
        expect(formatDuration(30, 'minimal')).toBe('0:30');
        expect(formatDuration(90, 'minimal')).toBe('1:30');
      });

      it('handles negative and invalid values', () => {
        expect(formatDuration(-1)).toBe('0:00');
        expect(formatDuration(NaN)).toBe('0:00');
        expect(formatDuration(Infinity)).toBe('0:00');
      });
    });

    describe('parseDuration', () => {
      it('parses plain seconds', () => {
        expect(parseDuration('123')).toBe(123);
      });

      it('parses colon format', () => {
        expect(parseDuration('1:30')).toBe(90);
        expect(parseDuration('1:01:01')).toBe(3661);
      });

      it('parses short format', () => {
        expect(parseDuration('1h 30m 45s')).toBe(5445);
        expect(parseDuration('30m')).toBe(1800);
      });
    });

    describe('formatFileSize', () => {
      it('formats bytes', () => {
        expect(formatFileSize(0).formatted).toBe('0 B');
        expect(formatFileSize(500).formatted).toBe('500 B');
      });

      it('formats kilobytes', () => {
        expect(formatFileSize(1024).formatted).toBe('1.00 KB');
        expect(formatFileSize(1536).formatted).toBe('1.50 KB');
      });

      it('formats megabytes', () => {
        expect(formatFileSize(1048576).formatted).toBe('1.00 MB');
      });

      it('formats gigabytes', () => {
        expect(formatFileSize(1073741824).formatted).toBe('1.00 GB');
      });

      it('returns full info object', () => {
        const info = formatFileSize(1536);
        expect(info.bytes).toBe(1536);
        expect(info.unit).toBe('KB');
        expect(info.value).toBeCloseTo(1.5);
      });
    });

    describe('formatFileSizeShort', () => {
      it('formats with 1 decimal place', () => {
        expect(formatFileSizeShort(1536)).toBe('1.5 KB');
      });
    });

    describe('parseFileSize', () => {
      it('parses file sizes', () => {
        expect(parseFileSize('500 B')).toBe(500);
        expect(parseFileSize('1.5 KB')).toBe(1536);
        expect(parseFileSize('1 MB')).toBe(1048576);
      });
    });

    describe('formatBitrate', () => {
      it('formats bitrate', () => {
        expect(formatBitrate(500)).toBe('500 bps');
        expect(formatBitrate(5000)).toBe('5 kbps');
        expect(formatBitrate(5000000)).toBe('5.00 Mbps');
      });
    });

    describe('formatFrameRate', () => {
      it('formats common frame rates', () => {
        expect(formatFrameRate(24)).toBe('24 fps');
        expect(formatFrameRate(23.976)).toBe('23.976 fps');
        expect(formatFrameRate(29.97)).toBe('29.97 fps');
      });
    });

    describe('formatResolution', () => {
      it('formats dimensions', () => {
        expect(formatResolution(1920, 1080)).toBe('1920×1080');
      });

      it('formats as label', () => {
        expect(formatResolution(1920, 1080, 'label')).toBe('1080p');
        expect(formatResolution(3840, 2160, 'label')).toBe('4K');
        expect(formatResolution(1280, 720, 'label')).toBe('720p');
      });
    });

    describe('formatTimeAgo', () => {
      it('formats relative time', () => {
        expect(formatTimeAgo(30)).toBe('just now');
        expect(formatTimeAgo(120)).toBe('2 minutes ago');
        expect(formatTimeAgo(7200)).toBe('2 hours ago');
        expect(formatTimeAgo(172800)).toBe('2 days ago');
      });
    });

    describe('formatPlaybackRate', () => {
      it('formats playback rates', () => {
        expect(formatPlaybackRate(1)).toBe('Normal');
        expect(formatPlaybackRate(0.5)).toBe('0.5x (Slow)');
        expect(formatPlaybackRate(2)).toBe('2x (Fast)');
      });
    });

    describe('formatTimestamp', () => {
      it('formats timestamp', () => {
        expect(formatTimestamp(0)).toBe('00:00:00');
        expect(formatTimestamp(3661)).toBe('01:01:01');
      });

      it('includes milliseconds when requested', () => {
        expect(formatTimestamp(3661.5, true)).toBe('01:01:01.500');
      });
    });

    describe('parseTimestamp', () => {
      it('parses timestamps', () => {
        expect(parseTimestamp('01:01:01')).toBe(3661);
        expect(parseTimestamp('01:30')).toBe(90);
        expect(parseTimestamp('01:01:01.500')).toBeCloseTo(3661.5);
      });
    });

    describe('formatProgress', () => {
      it('formats as percentage', () => {
        expect(formatProgress(50, 100)).toBe('50.0%');
      });

      it('formats as fraction', () => {
        expect(formatProgress(50, 100, 'fraction')).toBe('0:50/1:40');
      });
    });
  });

  describe('Aspect Ratio', () => {
    describe('calculateAspectRatio', () => {
      it('calculates simplified aspect ratio', () => {
        const ratio = calculateAspectRatio(1920, 1080);
        expect(ratio.width).toBe(16);
        expect(ratio.height).toBe(9);
        expect(ratio.value).toBeCloseTo(16 / 9);
        expect(ratio.label).toBe('16:9');
      });

      it('handles square dimensions', () => {
        const ratio = calculateAspectRatio(100, 100);
        expect(ratio.width).toBe(1);
        expect(ratio.height).toBe(1);
      });

      it('handles invalid dimensions', () => {
        const ratio = calculateAspectRatio(0, 0);
        expect(ratio.value).toBe(0);
      });
    });

    describe('getAspectRatioPreset', () => {
      it('returns preset aspect ratios', () => {
        expect(getAspectRatioPreset('16:9').value).toBeCloseTo(16 / 9);
        expect(getAspectRatioPreset('4:3').value).toBeCloseTo(4 / 3);
        expect(getAspectRatioPreset('1:1').value).toBe(1);
      });
    });

    describe('getAllAspectRatioPresets', () => {
      it('returns all presets', () => {
        const presets = getAllAspectRatioPresets();
        expect(presets.length).toBeGreaterThan(5);
      });
    });

    describe('findClosestAspectRatio', () => {
      it('finds closest preset', () => {
        expect(findClosestAspectRatio(1920, 1080)).toBe('16:9');
        expect(findClosestAspectRatio(1024, 768)).toBe('4:3');
        expect(findClosestAspectRatio(500, 500)).toBe('1:1');
      });

      it('returns null when no close match', () => {
        expect(findClosestAspectRatio(1000, 1, 0.01)).toBeNull();
      });
    });

    describe('dimensionsFromAspectRatio', () => {
      it('calculates dimensions from width', () => {
        const dims = dimensionsFromAspectRatio('16:9', { width: 1920 });
        expect(dims.width).toBe(1920);
        expect(dims.height).toBe(1080);
      });

      it('calculates dimensions from height', () => {
        const dims = dimensionsFromAspectRatio('16:9', { height: 1080 });
        expect(dims.width).toBe(1920);
        expect(dims.height).toBe(1080);
      });
    });

    describe('fitToContainer', () => {
      it('fits landscape media to container (contain)', () => {
        const dims = fitToContainer(1920, 1080, 800, 600);
        expect(dims.width).toBe(800);
        expect(dims.height).toBe(450);
      });

      it('fits portrait media to container (contain)', () => {
        const dims = fitToContainer(1080, 1920, 800, 600);
        expect(dims.width).toBe(338);
        expect(dims.height).toBe(600);
      });

      it('covers container (cover mode)', () => {
        const dims = fitToContainer(1920, 1080, 800, 600, 'cover');
        expect(dims.width).toBe(1067);
        expect(dims.height).toBe(600);
      });
    });

    describe('scaleToFit', () => {
      it('scales down when larger than max', () => {
        const dims = scaleToFit(2000, 1000, 800, 600);
        expect(dims.width).toBe(800);
        expect(dims.height).toBe(400);
      });

      it('preserves original when smaller than max', () => {
        const dims = scaleToFit(400, 300, 800, 600);
        expect(dims.width).toBe(400);
        expect(dims.height).toBe(300);
      });
    });

    describe('scaleByFactor', () => {
      it('scales dimensions by factor', () => {
        const dims = scaleByFactor(100, 50, 2);
        expect(dims.width).toBe(200);
        expect(dims.height).toBe(100);
      });
    });

    describe('scaleToWidth', () => {
      it('scales to target width', () => {
        const dims = scaleToWidth(1920, 1080, 960);
        expect(dims.width).toBe(960);
        expect(dims.height).toBe(540);
      });
    });

    describe('scaleToHeight', () => {
      it('scales to target height', () => {
        const dims = scaleToHeight(1920, 1080, 540);
        expect(dims.width).toBe(960);
        expect(dims.height).toBe(540);
      });
    });

    describe('orientation checks', () => {
      it('isLandscape', () => {
        expect(isLandscape(1920, 1080)).toBe(true);
        expect(isLandscape(1080, 1920)).toBe(false);
      });

      it('isPortrait', () => {
        expect(isPortrait(1080, 1920)).toBe(true);
        expect(isPortrait(1920, 1080)).toBe(false);
      });

      it('isSquare', () => {
        expect(isSquare(100, 100)).toBe(true);
        expect(isSquare(100, 101)).toBe(true); // within tolerance
        expect(isSquare(100, 200)).toBe(false);
      });

      it('getOrientation', () => {
        expect(getOrientation(1920, 1080)).toBe('landscape');
        expect(getOrientation(1080, 1920)).toBe('portrait');
        expect(getOrientation(100, 100)).toBe('square');
      });
    });

    describe('parseAspectRatioString', () => {
      it('parses valid ratio strings', () => {
        const ratio = parseAspectRatioString('16:9');
        expect(ratio?.width).toBe(16);
        expect(ratio?.height).toBe(9);
      });

      it('parses decimal ratios', () => {
        const ratio = parseAspectRatioString('2.35:1');
        expect(ratio?.value).toBeCloseTo(2.35);
      });

      it('returns null for invalid strings', () => {
        expect(parseAspectRatioString('invalid')).toBeNull();
      });
    });

    describe('formatAspectRatio', () => {
      it('formats as simplified ratio', () => {
        expect(formatAspectRatio(1920, 1080)).toBe('16:9');
      });

      it('formats without simplification', () => {
        expect(formatAspectRatio(1920, 1080, false)).toBe('1920:1080');
      });
    });

    describe('getPaddingBottomForAspectRatio', () => {
      it('returns correct percentage for 16:9', () => {
        expect(getPaddingBottomForAspectRatio('16:9')).toBe('56.2500%');
      });

      it('returns correct percentage for 1:1', () => {
        expect(getPaddingBottomForAspectRatio('1:1')).toBe('100.0000%');
      });
    });

    describe('getCommonVideoAspectRatios', () => {
      it('returns common video ratios', () => {
        const ratios = getCommonVideoAspectRatios();
        expect(ratios.some((r) => r.label.includes('16:9'))).toBe(true);
      });
    });

    describe('getCommonImageAspectRatios', () => {
      it('returns common image ratios', () => {
        const ratios = getCommonImageAspectRatios();
        expect(ratios.some((r) => r.label.includes('3:2'))).toBe(true);
      });
    });

    describe('cropToAspectRatio', () => {
      it('crops landscape to 1:1', () => {
        const crop = cropToAspectRatio(1920, 1080, '1:1');
        expect(crop.width).toBe(1080);
        expect(crop.height).toBe(1080);
        expect(crop.x).toBe(420);
        expect(crop.y).toBe(0);
      });

      it('crops portrait to 1:1', () => {
        const crop = cropToAspectRatio(1080, 1920, '1:1');
        expect(crop.width).toBe(1080);
        expect(crop.height).toBe(1080);
        expect(crop.x).toBe(0);
        expect(crop.y).toBe(420);
      });
    });
  });
});
