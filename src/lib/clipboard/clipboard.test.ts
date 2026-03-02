import { beforeEach, describe, expect, it, vi } from 'vitest';

import {
  canShare,
  clearClipboard,
  copyHtmlToClipboard,
  copyImageToClipboard,
  copyMultipleFormats,
  copyToClipboard,
  createShareUrl,
  getClipboardPermission,
  getClipboardText,
  getShareablePlatforms,
  hasClipboardText,
  isClipboardReadSupported,
  isClipboardSupported,
  isClipboardWriteSupported,
  isExecCommandSupported,
  isShareFilesSupported,
  isShareSupported,
  openShareWindow,
  readFromClipboard,
  readRichClipboard,
  share,
  shareFiles,
  shareImage,
  shareText,
  shareToSocialMedia,
  shareUrl,
  shareViaEmail,
} from './index';

describe('Clipboard Operations', () => {
  describe('Feature Detection', () => {
    it('detects clipboard support', () => {
      const result = isClipboardSupported();
      expect(typeof result).toBe('boolean');
    });

    it('detects clipboard write support', () => {
      const result = isClipboardWriteSupported();
      expect(typeof result).toBe('boolean');
    });

    it('detects clipboard read support', () => {
      const result = isClipboardReadSupported();
      expect(typeof result).toBe('boolean');
    });

    it('detects execCommand support', () => {
      const result = isExecCommandSupported();
      expect(typeof result).toBe('boolean');
    });

    it('detects share support', () => {
      const result = isShareSupported();
      expect(typeof result).toBe('boolean');
    });

    it('detects share files support', () => {
      const result = isShareFilesSupported();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('getClipboardPermission', () => {
    it('returns a valid permission state', async () => {
      const result = await getClipboardPermission('write');
      expect(['granted', 'denied', 'prompt']).toContain(result);
    });

    it('accepts read type', async () => {
      const result = await getClipboardPermission('read');
      expect(['granted', 'denied', 'prompt']).toContain(result);
    });

    it('defaults to write type', async () => {
      const result = await getClipboardPermission();
      expect(['granted', 'denied', 'prompt']).toContain(result);
    });
  });

  describe('copyToClipboard', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('returns a copy result object', async () => {
      const result = await copyToClipboard('test');
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('method');
    });

    it('calls onSuccess callback on success', async () => {
      const mockClipboard = {
        writeText: vi.fn().mockResolvedValue(undefined),
        readText: vi.fn(),
        read: vi.fn(),
        write: vi.fn(),
      };
      vi.stubGlobal('navigator', { clipboard: mockClipboard });

      const onSuccess = vi.fn();
      await copyToClipboard('test', { onSuccess });

      expect(onSuccess).toHaveBeenCalled();
      vi.unstubAllGlobals();
    });

    it('calls onError callback on error', async () => {
      const mockClipboard = {
        writeText: vi.fn().mockRejectedValue(new Error('Failed')),
        readText: vi.fn(),
        read: vi.fn(),
        write: vi.fn(),
      };
      vi.stubGlobal('navigator', { clipboard: mockClipboard });

      const onError = vi.fn();
      await copyToClipboard('test', { onError });

      expect(onError).toHaveBeenCalled();
      vi.unstubAllGlobals();
    });
  });

  describe('copyHtmlToClipboard', () => {
    it('returns a copy result object', async () => {
      const result = await copyHtmlToClipboard('<p>test</p>');
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('error');
      expect(result).toHaveProperty('method');
    });

    it('accepts optional plain text fallback', async () => {
      const result = await copyHtmlToClipboard('<p>test</p>', 'test');
      expect(result).toHaveProperty('success');
    });
  });

  describe('readFromClipboard', () => {
    it('returns clipboard content structure', async () => {
      const result = await readFromClipboard();
      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('html');
      expect(result).toHaveProperty('files');
      expect(result).toHaveProperty('hasText');
      expect(result).toHaveProperty('hasHtml');
      expect(result).toHaveProperty('hasFiles');
      expect(result).toHaveProperty('hasImages');
    });
  });

  describe('readRichClipboard', () => {
    it('returns clipboard content structure', async () => {
      const result = await readRichClipboard();
      expect(result).toHaveProperty('text');
      expect(result).toHaveProperty('html');
      expect(result).toHaveProperty('files');
    });
  });

  describe('copyImageToClipboard', () => {
    it('returns a copy result for blob input', async () => {
      const blob = new Blob(['test'], { type: 'image/png' });
      const result = await copyImageToClipboard(blob);
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('method');
    });
  });

  describe('clearClipboard', () => {
    it('returns a boolean', async () => {
      const result = await clearClipboard();
      expect(typeof result).toBe('boolean');
    });
  });

  describe('copyMultipleFormats', () => {
    it('returns a copy result', async () => {
      const result = await copyMultipleFormats({
        'text/plain': 'test',
        'text/html': '<p>test</p>',
      });
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('method');
    });
  });

  describe('getClipboardText', () => {
    it('returns text or null', async () => {
      const result = await getClipboardText();
      expect(result === null || typeof result === 'string').toBe(true);
    });
  });

  describe('hasClipboardText', () => {
    it('returns a boolean', async () => {
      const result = await hasClipboardText();
      expect(typeof result).toBe('boolean');
    });
  });
});

describe('Share Operations', () => {
  describe('canShare', () => {
    it('returns a boolean', () => {
      const result = canShare();
      expect(typeof result).toBe('boolean');
    });

    it('accepts share data parameter', () => {
      const result = canShare({ url: 'https://example.com' });
      expect(typeof result).toBe('boolean');
    });
  });

  describe('share', () => {
    it('returns a share result', async () => {
      const result = await share({ url: 'https://example.com' });
      expect(result).toHaveProperty('success');
      expect(result).toHaveProperty('method');
      expect(result).toHaveProperty('error');
    });

    it('handles fallbackToCopy option', async () => {
      const result = await share(
        { url: 'https://example.com' },
        { fallbackToCopy: true }
      );
      expect(result).toHaveProperty('success');
    });

    it('handles text sharing', async () => {
      const result = await share({ text: 'Hello world' });
      expect(result).toHaveProperty('success');
    });
  });

  describe('shareUrl', () => {
    it('shares a URL', async () => {
      const result = await shareUrl('https://example.com', 'Title');
      expect(result).toHaveProperty('success');
    });
  });

  describe('shareText', () => {
    it('shares text', async () => {
      const result = await shareText('Hello world', 'Title');
      expect(result).toHaveProperty('success');
    });
  });

  describe('shareFiles', () => {
    it('shares files', async () => {
      const file = new File(['test'], 'test.txt', { type: 'text/plain' });
      const result = await shareFiles([file], 'Title');
      expect(result).toHaveProperty('success');
    });
  });

  describe('shareImage', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('returns share result on fetch error', async () => {
      vi.stubGlobal(
        'fetch',
        vi.fn().mockRejectedValue(new Error('Network error'))
      );

      const result = await shareImage(
        'https://example.com/image.png',
        'image.png'
      );
      expect(result).toHaveProperty('success', false);
      expect(result).toHaveProperty('method', 'none');

      vi.unstubAllGlobals();
    });
  });

  describe('createShareUrl', () => {
    const testData = {
      url: 'https://example.com',
      text: 'Hello',
      title: 'Title',
    };

    it('creates Twitter share URL', () => {
      const url = createShareUrl('twitter', testData);
      expect(url).toContain('twitter.com/intent/tweet');
      expect(url).toContain('url=');
      expect(url).toContain('text=');
    });

    it('creates Facebook share URL', () => {
      const url = createShareUrl('facebook', testData);
      expect(url).toContain('facebook.com/sharer');
      expect(url).toContain('u=');
    });

    it('creates LinkedIn share URL', () => {
      const url = createShareUrl('linkedin', testData);
      expect(url).toContain('linkedin.com/sharing');
      expect(url).toContain('url=');
    });

    it('creates email share URL', () => {
      const url = createShareUrl('email', testData);
      expect(url).toContain('mailto:');
      expect(url).toContain('subject=');
      expect(url).toContain('body=');
    });

    it('creates WhatsApp share URL', () => {
      const url = createShareUrl('whatsapp', testData);
      expect(url).toContain('wa.me');
      expect(url).toContain('text=');
    });

    it('handles empty data', () => {
      const url = createShareUrl('twitter', {});
      expect(url).toContain('twitter.com');
    });
  });

  describe('openShareWindow', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('returns null in non-browser environment', () => {
      const originalWindow = globalThis.window;
      // @ts-expect-error - testing non-browser environment
      delete globalThis.window;

      const result = openShareWindow('https://example.com');
      expect(result).toBeNull();

      globalThis.window = originalWindow;
    });

    it('opens window with default dimensions', () => {
      const mockOpen = vi.fn().mockReturnValue({});
      vi.stubGlobal('window', {
        open: mockOpen,
        screenX: 0,
        screenY: 0,
        outerWidth: 1920,
        outerHeight: 1080,
      });

      openShareWindow('https://example.com');

      expect(mockOpen).toHaveBeenCalledWith(
        'https://example.com',
        'share',
        expect.stringContaining('width=600')
      );

      vi.unstubAllGlobals();
    });

    it('accepts custom dimensions', () => {
      const mockOpen = vi.fn().mockReturnValue({});
      vi.stubGlobal('window', {
        open: mockOpen,
        screenX: 0,
        screenY: 0,
        outerWidth: 1920,
        outerHeight: 1080,
      });

      openShareWindow('https://example.com', { width: 800, height: 600 });

      expect(mockOpen).toHaveBeenCalledWith(
        'https://example.com',
        'share',
        expect.stringContaining('width=800')
      );

      vi.unstubAllGlobals();
    });
  });

  describe('shareToSocialMedia', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('opens share window for Twitter', () => {
      const mockOpen = vi.fn().mockReturnValue({});
      vi.stubGlobal('window', {
        open: mockOpen,
        screenX: 0,
        screenY: 0,
        outerWidth: 1920,
        outerHeight: 1080,
      });

      shareToSocialMedia('twitter', { url: 'https://example.com' });

      expect(mockOpen).toHaveBeenCalledWith(
        expect.stringContaining('twitter.com'),
        'share',
        expect.any(String)
      );

      vi.unstubAllGlobals();
    });
  });

  describe('shareViaEmail', () => {
    beforeEach(() => {
      vi.restoreAllMocks();
    });

    it('sets window location to mailto URL', () => {
      const mockLocation = { href: '' };
      vi.stubGlobal('window', { location: mockLocation });

      shareViaEmail({ url: 'https://example.com', title: 'Test' });

      expect(mockLocation.href).toContain('mailto:');

      vi.unstubAllGlobals();
    });
  });

  describe('getShareablePlatforms', () => {
    it('returns array of platforms', () => {
      const platforms = getShareablePlatforms();
      expect(Array.isArray(platforms)).toBe(true);
      expect(platforms).toContain('email');
      expect(platforms).toContain('twitter');
      expect(platforms).toContain('facebook');
      expect(platforms).toContain('linkedin');
      expect(platforms).toContain('whatsapp');
    });
  });
});

describe('Clipboard Types', () => {
  it('CopyResult has correct shape', async () => {
    const result = await copyToClipboard('test');
    expect(result.method).toMatch(/^(clipboard-api|exec-command|fallback)$/);
    expect(result.error === null || result.error instanceof Error).toBe(true);
  });

  it('ShareResult has correct shape', async () => {
    const result = await share({ text: 'test' });
    expect(result.method).toMatch(/^(share-api|clipboard|none)$/);
    expect(result.error === null || result.error instanceof Error).toBe(true);
  });

  it('ClipboardContent has correct shape', async () => {
    const content = await readFromClipboard();
    expect(typeof content.hasText).toBe('boolean');
    expect(typeof content.hasHtml).toBe('boolean');
    expect(typeof content.hasFiles).toBe('boolean');
    expect(typeof content.hasImages).toBe('boolean');
  });
});

describe('Share Callbacks', () => {
  beforeEach(() => {
    vi.restoreAllMocks();
  });

  it('calls onSuccess when share succeeds via clipboard fallback', async () => {
    const mockClipboard = {
      writeText: vi.fn().mockResolvedValue(undefined),
      readText: vi.fn(),
      read: vi.fn(),
      write: vi.fn(),
    };
    vi.stubGlobal('navigator', { clipboard: mockClipboard });

    const onSuccess = vi.fn();
    await share({ url: 'https://example.com' }, { onSuccess });

    expect(onSuccess).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });

  it('calls onError when share fails', async () => {
    const mockClipboard = {
      writeText: vi.fn().mockRejectedValue(new Error('Failed')),
      readText: vi.fn(),
      read: vi.fn(),
      write: vi.fn(),
    };
    vi.stubGlobal('navigator', { clipboard: mockClipboard });

    const onError = vi.fn();
    await share(
      { url: 'https://example.com' },
      { onError, fallbackToCopy: true }
    );

    expect(onError).toHaveBeenCalled();
    vi.unstubAllGlobals();
  });
});

describe('Edge Cases', () => {
  it('handles empty text copy', async () => {
    const result = await copyToClipboard('');
    expect(result).toHaveProperty('success');
  });

  it('handles share with no data', async () => {
    const result = await share({});
    expect(result).toHaveProperty('success');
  });

  it('handles share with files only (no fallback possible)', async () => {
    const file = new File(['test'], 'test.txt', { type: 'text/plain' });
    const result = await share({ files: [file] }, { fallbackToCopy: true });
    expect(result).toHaveProperty('success');
  });

  it('createShareUrl handles special characters', () => {
    const url = createShareUrl('twitter', {
      text: 'Hello & Goodbye <script>',
      url: 'https://example.com?foo=bar&baz=qux',
    });
    expect(url).not.toContain('<script>');
    expect(url).toContain('%26');
  });
});

describe('URL Encoding', () => {
  it('properly encodes URL parameters', () => {
    const url = createShareUrl('twitter', {
      url: 'https://example.com/path?query=value',
      text: 'Text with spaces and "quotes"',
    });
    expect(url).toContain(
      encodeURIComponent('https://example.com/path?query=value')
    );
    expect(url).toContain(encodeURIComponent('Text with spaces and "quotes"'));
  });

  it('handles unicode characters', () => {
    const url = createShareUrl('twitter', {
      text: 'Hello 世界 🌍',
    });
    expect(url).toContain(encodeURIComponent('Hello 世界 🌍'));
  });
});
