import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  createExpiringStorage,
  createNamespacedStorage,
  exportStorage,
  getMemoryStorage,
  getStorage,
  getStorageKeys,
  getStorageSize,
  importStorage,
} from './adapters';
import { parseCookies, parseSetCookieHeader, serializeCookie } from './cookies';
import {
  createStorageKey,
  createStorageMap,
  createTypedStorage,
  migrateStorageValue,
} from './typed-storage';

describe('Storage Utilities', () => {
  let memoryStorage: ReturnType<typeof getMemoryStorage>;

  beforeEach(() => {
    memoryStorage = getMemoryStorage();
    memoryStorage.clear();
  });

  afterEach(() => {
    vi.restoreAllMocks();
  });

  describe('Storage Adapters', () => {
    describe('getMemoryStorage', () => {
      it('creates a functional memory storage', () => {
        const storage = memoryStorage;

        storage.setItem('key1', 'value1');
        expect(storage.getItem('key1')).toBe('value1');
        expect(storage.length).toBe(1);

        storage.setItem('key2', 'value2');
        expect(storage.length).toBe(2);

        storage.removeItem('key1');
        expect(storage.getItem('key1')).toBeNull();
        expect(storage.length).toBe(1);

        storage.clear();
        expect(storage.length).toBe(0);
      });

      it('supports key() method', () => {
        const storage = memoryStorage;

        storage.setItem('a', '1');
        storage.setItem('b', '2');

        expect(storage.key(0)).toBe('a');
        expect(storage.key(1)).toBe('b');
        expect(storage.key(2)).toBeNull();
      });

      it('returns null for missing keys', () => {
        expect(memoryStorage.getItem('nonexistent')).toBeNull();
      });

      it('overwrites existing values', () => {
        memoryStorage.setItem('key', 'value1');
        memoryStorage.setItem('key', 'value2');
        expect(memoryStorage.getItem('key')).toBe('value2');
        expect(memoryStorage.length).toBe(1);
      });
    });

    describe('getStorage', () => {
      it('returns memory storage for memory type', () => {
        const memory = getStorage('memory');
        expect(memory).toBeDefined();
        expect(typeof memory.getItem).toBe('function');
        expect(typeof memory.setItem).toBe('function');
      });
    });

    describe('createNamespacedStorage', () => {
      it('prefixes all keys', () => {
        const namespaced = createNamespacedStorage(memoryStorage, 'app');

        namespaced.setItem('user', 'john');
        expect(memoryStorage.getItem('app:user')).toBe('john');
        expect(namespaced.getItem('user')).toBe('john');
      });

      it('only clears namespaced keys', () => {
        memoryStorage.setItem('other', 'value');

        const namespaced = createNamespacedStorage(memoryStorage, 'app');
        namespaced.setItem('key1', 'value1');
        namespaced.setItem('key2', 'value2');

        namespaced.clear();

        expect(memoryStorage.getItem('other')).toBe('value');
        expect(namespaced.getItem('key1')).toBeNull();
      });

      it('returns correct length', () => {
        memoryStorage.setItem('other', 'value');

        const namespaced = createNamespacedStorage(memoryStorage, 'app');
        namespaced.setItem('key1', 'value1');
        namespaced.setItem('key2', 'value2');

        expect(namespaced.length).toBe(2);
      });

      it('supports custom separator', () => {
        const namespaced = createNamespacedStorage(memoryStorage, 'app', '-');
        namespaced.setItem('key', 'value');
        expect(memoryStorage.getItem('app-key')).toBe('value');
      });

      it('removes namespaced items', () => {
        const namespaced = createNamespacedStorage(memoryStorage, 'app');
        namespaced.setItem('key', 'value');
        namespaced.removeItem('key');
        expect(namespaced.getItem('key')).toBeNull();
      });
    });

    describe('createExpiringStorage', () => {
      it('stores and retrieves values', () => {
        const expiring = createExpiringStorage(memoryStorage, 60000);

        expiring.setItem('key', 'value');
        expect(expiring.getItem('key')).toBe('value');
      });

      it('returns null for expired values', () => {
        const expiring = createExpiringStorage(memoryStorage, 1);

        expiring.setItem('key', 'value');

        vi.useFakeTimers();
        vi.advanceTimersByTime(100);

        expect(expiring.getItem('key')).toBeNull();

        vi.useRealTimers();
      });

      it('cleans expired items', () => {
        const expiring = createExpiringStorage(memoryStorage, 1);

        expiring.setItem('key', 'value');

        vi.useFakeTimers();
        vi.advanceTimersByTime(100);

        expiring.cleanExpired();
        expect(memoryStorage.length).toBe(0);

        vi.useRealTimers();
      });

      it('removes items', () => {
        const expiring = createExpiringStorage(memoryStorage, 60000);
        expiring.setItem('key', 'value');
        expiring.removeItem('key');
        expect(expiring.getItem('key')).toBeNull();
      });

      it('clears all items', () => {
        const expiring = createExpiringStorage(memoryStorage, 60000);
        expiring.setItem('a', '1');
        expiring.setItem('b', '2');
        expiring.clear();
        expect(expiring.length).toBe(0);
      });
    });

    describe('getStorageSize', () => {
      it('calculates storage size', () => {
        memoryStorage.setItem('key', 'value');
        const size = getStorageSize(memoryStorage);

        expect(size).toBeGreaterThan(0);
        expect(size).toBe(('key'.length + 'value'.length) * 2);
      });

      it('returns 0 for empty storage', () => {
        expect(getStorageSize(memoryStorage)).toBe(0);
      });
    });

    describe('getStorageKeys', () => {
      it('returns all keys', () => {
        memoryStorage.setItem('a', '1');
        memoryStorage.setItem('b', '2');

        const keys = getStorageKeys(memoryStorage);
        expect(keys).toContain('a');
        expect(keys).toContain('b');
        expect(keys.length).toBe(2);
      });

      it('returns empty array for empty storage', () => {
        expect(getStorageKeys(memoryStorage)).toEqual([]);
      });
    });

    describe('exportStorage / importStorage', () => {
      it('exports all data', () => {
        memoryStorage.setItem('a', '1');
        memoryStorage.setItem('b', '2');

        const data = exportStorage(memoryStorage);
        expect(data).toEqual({ a: '1', b: '2' });
      });

      it('exports empty object for empty storage', () => {
        expect(exportStorage(memoryStorage)).toEqual({});
      });

      it('imports data', () => {
        importStorage(memoryStorage, { x: '10', y: '20' });

        expect(memoryStorage.getItem('x')).toBe('10');
        expect(memoryStorage.getItem('y')).toBe('20');
      });

      it('merges with existing data by default', () => {
        memoryStorage.setItem('existing', 'value');

        importStorage(memoryStorage, { new: 'data' });

        expect(memoryStorage.getItem('existing')).toBe('value');
        expect(memoryStorage.getItem('new')).toBe('data');
      });

      it('can overwrite on import', () => {
        memoryStorage.setItem('existing', 'value');

        importStorage(memoryStorage, { new: 'data' }, true);

        expect(memoryStorage.getItem('existing')).toBeNull();
        expect(memoryStorage.getItem('new')).toBe('data');
      });
    });
  });

  describe('Typed Storage', () => {
    describe('createTypedStorage', () => {
      it('stores and retrieves typed values', () => {
        const typed = createTypedStorage<{ name: string; age: number }>();

        typed.set('user', { name: 'John', age: 30 }, memoryStorage);
        const value = typed.get('user', memoryStorage);

        expect(value).toEqual({ name: 'John', age: 30 });
      });

      it('returns null for missing keys', () => {
        const typed = createTypedStorage<string>();

        expect(typed.get('missing', memoryStorage)).toBeNull();
      });

      it('checks if key exists', () => {
        const typed = createTypedStorage<string>();

        typed.set('exists', 'value', memoryStorage);

        expect(typed.has('exists', memoryStorage)).toBe(true);
        expect(typed.has('missing', memoryStorage)).toBe(false);
      });

      it('removes values', () => {
        const typed = createTypedStorage<string>();

        typed.set('key', 'value', memoryStorage);
        typed.remove('key', memoryStorage);

        expect(typed.get('key', memoryStorage)).toBeNull();
      });

      it('uses prefix', () => {
        const typed = createTypedStorage<string>({ prefix: 'test' });

        typed.set('key', 'value', memoryStorage);

        expect(memoryStorage.getItem('test:key')).not.toBeNull();
      });

      it('respects TTL', () => {
        const typed = createTypedStorage<string>({ ttl: 1 });

        typed.set('key', 'value', memoryStorage);

        vi.useFakeTimers();
        vi.advanceTimersByTime(100);

        expect(typed.get('key', memoryStorage)).toBeNull();

        vi.useRealTimers();
      });

      it('respects version', () => {
        const typedV1 = createTypedStorage<string>({ version: 1 });
        const typedV2 = createTypedStorage<string>({ version: 2 });

        typedV1.set('key', 'value', memoryStorage);

        expect(typedV2.get('key', memoryStorage)).toBeNull();
      });

      it('returns metadata', () => {
        const typed = createTypedStorage<string>({ version: 1 });

        typed.set('key', 'value', memoryStorage);
        const meta = typed.getMetadata('key', memoryStorage);

        expect(meta).not.toBeNull();
        expect(meta?.version).toBe(1);
        expect(meta?.timestamp).toBeDefined();
      });

      it('supports subscribers', () => {
        const typed = createTypedStorage<string>();
        const callback = vi.fn();

        const unsubscribe = typed.subscribe('key', callback);
        typed.set('key', 'value', memoryStorage);

        expect(callback).toHaveBeenCalled();
        unsubscribe();
      });
    });

    describe('createStorageKey', () => {
      it('creates a typed storage key', () => {
        const countKey = createStorageKey('count', 0, { storage: 'memory' });

        countKey.set(5);
        expect(countKey.get()).toBe(5);

        countKey.remove();
        expect(countKey.get()).toBe(0);
      });

      it('supports update function', () => {
        const countKey = createStorageKey('updateTest', 0, {
          storage: 'memory',
        });

        countKey.set(5);
        countKey.update((n) => n + 1);

        expect(countKey.get()).toBe(6);
      });

      it('checks existence', () => {
        const key = createStorageKey('existTest', 'default', {
          storage: 'memory',
        });

        expect(key.has()).toBe(false);
        key.set('value');
        expect(key.has()).toBe(true);
      });

      it('returns default when no value', () => {
        const key = createStorageKey('defaultTest', 'default', {
          storage: 'memory',
        });

        expect(key.get()).toBe('default');
      });

      it('supports getWithDefault', () => {
        const key = createStorageKey('fallbackTest', 'default', {
          storage: 'memory',
        });

        expect(key.getWithDefault('custom')).toBe('custom');
        key.set('stored');
        expect(key.getWithDefault('custom')).toBe('stored');
      });
    });

    describe('createStorageMap', () => {
      it('manages multiple keys', () => {
        const settings = createStorageMap(
          {
            theme: { defaultValue: 'light' },
            fontSize: { defaultValue: 14 },
          },
          { storage: 'memory' }
        );

        settings.keys.theme.set('dark');
        settings.keys.fontSize.set(16);

        const all = settings.getAll();
        expect(all.theme).toBe('dark');
        expect(all.fontSize).toBe(16);
      });

      it('sets all values at once', () => {
        const settings = createStorageMap(
          {
            a: { defaultValue: 1 },
            b: { defaultValue: 2 },
          },
          { storage: 'memory' }
        );

        settings.setAll({ a: 10, b: 20 });

        expect(settings.keys.a.get()).toBe(10);
        expect(settings.keys.b.get()).toBe(20);
      });

      it('clears all values', () => {
        const settings = createStorageMap(
          {
            clearA: { defaultValue: 1 },
            clearB: { defaultValue: 2 },
          },
          { storage: 'memory' }
        );

        settings.keys.clearA.set(10);
        settings.keys.clearB.set(20);
        settings.clearAll();

        expect(settings.keys.clearA.get()).toBe(1);
        expect(settings.keys.clearB.get()).toBe(2);
      });

      it('checks hasAll', () => {
        const settings = createStorageMap(
          {
            hasA: { defaultValue: 1 },
            hasB: { defaultValue: 2 },
          },
          { storage: 'memory' }
        );

        expect(settings.hasAll()).toBe(false);

        settings.keys.hasA.set(10);
        expect(settings.hasAll()).toBe(false);

        settings.keys.hasB.set(20);
        expect(settings.hasAll()).toBe(true);
      });

      it('checks hasAny', () => {
        const settings = createStorageMap(
          {
            anyA: { defaultValue: 1 },
            anyB: { defaultValue: 2 },
          },
          { storage: 'memory' }
        );

        expect(settings.hasAny()).toBe(false);

        settings.keys.anyA.set(10);
        expect(settings.hasAny()).toBe(true);
      });
    });

    describe('migrateStorageValue', () => {
      it('migrates values between versions', () => {
        memoryStorage.setItem(
          'data',
          JSON.stringify({
            value: { oldField: 'test' },
            timestamp: Date.now(),
            expiry: null,
            version: 1,
          })
        );

        const migrated = migrateStorageValue<{ newField: string }>(
          'data',
          memoryStorage,
          [
            {
              fromVersion: 1,
              toVersion: 2,
              migrate: (value: unknown) => ({
                newField: (value as { oldField: string }).oldField,
              }),
            },
          ],
          2
        );

        expect(migrated).toEqual({ newField: 'test' });
      });

      it('returns null for missing data', () => {
        const result = migrateStorageValue('missing', memoryStorage, [], 1);
        expect(result).toBeNull();
      });

      it('returns null for invalid JSON', () => {
        memoryStorage.setItem('invalid', 'not json');
        const result = migrateStorageValue('invalid', memoryStorage, [], 1);
        expect(result).toBeNull();
      });

      it('chains multiple migrations', () => {
        memoryStorage.setItem(
          'chain',
          JSON.stringify({
            value: 1,
            timestamp: Date.now(),
            expiry: null,
            version: 1,
          })
        );

        const migrated = migrateStorageValue<number>(
          'chain',
          memoryStorage,
          [
            {
              fromVersion: 1,
              toVersion: 2,
              migrate: (v: unknown) => (v as number) * 2,
            },
            {
              fromVersion: 2,
              toVersion: 3,
              migrate: (v: unknown) => (v as number) + 10,
            },
          ],
          3
        );

        expect(migrated).toBe(12);
      });
    });
  });

  describe('Cookies (parsing only)', () => {
    describe('parseCookies', () => {
      it('parses cookie string', () => {
        const cookies = parseCookies('name=value; other=data');
        expect(cookies).toEqual({ name: 'value', other: 'data' });
      });

      it('handles empty string', () => {
        expect(parseCookies('')).toEqual({});
      });

      it('decodes values', () => {
        const cookies = parseCookies('encoded=hello%20world');
        expect(cookies.encoded).toBe('hello world');
      });

      it('handles cookies with equals in value', () => {
        const cookies = parseCookies('token=abc=123=def');
        expect(cookies.token).toBe('abc=123=def');
      });

      it('trims whitespace', () => {
        const cookies = parseCookies('  name  =  value  ');
        expect(cookies.name).toBe('value');
      });

      it('handles multiple cookies', () => {
        const cookies = parseCookies('a=1; b=2; c=3');
        expect(cookies).toEqual({ a: '1', b: '2', c: '3' });
      });
    });

    describe('serializeCookie', () => {
      it('serializes basic cookie', () => {
        const cookie = serializeCookie('name', 'value');
        expect(cookie).toContain('name=value');
        expect(cookie).toContain('Path=/');
      });

      it('includes domain option', () => {
        const cookie = serializeCookie('name', 'value', {
          domain: 'example.com',
        });
        expect(cookie).toContain('Domain=example.com');
      });

      it('includes secure option', () => {
        const cookie = serializeCookie('name', 'value', { secure: true });
        expect(cookie).toContain('Secure');
      });

      it('includes sameSite option', () => {
        const cookie = serializeCookie('name', 'value', { sameSite: 'strict' });
        expect(cookie).toContain('SameSite=strict');
      });

      it('includes maxAge option', () => {
        const cookie = serializeCookie('name', 'value', { maxAge: 3600 });
        expect(cookie).toContain('Max-Age=3600');
      });

      it('includes expires option with Date', () => {
        const date = new Date('2030-01-01');
        const cookie = serializeCookie('name', 'value', { expires: date });
        expect(cookie).toContain('Expires=');
      });

      it('includes httpOnly option', () => {
        const cookie = serializeCookie('name', 'value', { httpOnly: true });
        expect(cookie).toContain('HttpOnly');
      });

      it('includes partitioned option', () => {
        const cookie = serializeCookie('name', 'value', { partitioned: true });
        expect(cookie).toContain('Partitioned');
      });

      it('encodes special characters', () => {
        const cookie = serializeCookie('name', 'hello world');
        expect(cookie).toContain('hello%20world');
      });
    });

    describe('parseSetCookieHeader', () => {
      it('parses basic Set-Cookie header', () => {
        const result = parseSetCookieHeader('session=abc123');
        expect(result).toEqual({
          name: 'session',
          value: 'abc123',
        });
      });

      it('parses header with path', () => {
        const result = parseSetCookieHeader('session=abc123; Path=/app');
        expect(result?.path).toBe('/app');
      });

      it('parses header with secure flag', () => {
        const result = parseSetCookieHeader('session=abc123; Secure');
        expect(result?.secure).toBe(true);
      });

      it('parses header with sameSite', () => {
        const result = parseSetCookieHeader('session=abc123; SameSite=Strict');
        expect(result?.sameSite).toBe('strict');
      });

      it('parses header with expires', () => {
        const result = parseSetCookieHeader(
          'session=abc123; Expires=Wed, 01 Jan 2030 00:00:00 GMT'
        );
        expect(result?.expires).toBeInstanceOf(Date);
      });

      it('parses complex header', () => {
        const result = parseSetCookieHeader(
          'session=abc123; Path=/; Domain=example.com; Secure; SameSite=Strict'
        );

        expect(result).toEqual({
          name: 'session',
          value: 'abc123',
          path: '/',
          domain: 'example.com',
          secure: true,
          sameSite: 'strict',
        });
      });

      it('returns null for empty header', () => {
        expect(parseSetCookieHeader('')).toBeNull();
      });

      it('decodes encoded values', () => {
        const result = parseSetCookieHeader('name=hello%20world');
        expect(result?.value).toBe('hello world');
      });
    });
  });
});
