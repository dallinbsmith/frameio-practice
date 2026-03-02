import { describe, expect, it, vi } from 'vitest';

import {
  createAbortController,
  createDeferred,
  createFetchMock,
  createMockTimer,
  createProject,
  createPromiseQueue,
  createSequence,
  createStorageMock,
  createUser,
  createUsers,
  delay,
  expectToReject,
  expectToResolve,
  flushPromises,
  generateId,
  projectFactory,
  resetIdCounter,
  retry,
  userFactory,
  waitForCondition,
  waitForValue,
  withTimeout,
} from './index';

describe('Test Factories', () => {
  describe('createUser', () => {
    it('creates a user with default values', () => {
      resetIdCounter();
      const user = createUser();

      expect(user.id).toMatch(/^user_/);
      expect(user.email).toMatch(/@example\.com$/);
      expect(user.role).toBe('user');
    });

    it('allows overriding specific properties', () => {
      const user = createUser({ name: 'Custom Name', role: 'admin' });

      expect(user.name).toBe('Custom Name');
      expect(user.role).toBe('admin');
    });
  });

  describe('createUsers', () => {
    it('creates multiple users', () => {
      const users = createUsers(3);

      expect(users).toHaveLength(3);
      users.forEach((user) => {
        expect(user.id).toMatch(/^user_/);
      });
    });
  });

  describe('Factory with traits', () => {
    it('applies traits to users', () => {
      const admin = userFactory.trait('admin').build();
      expect(admin.role).toBe('admin');

      const guest = userFactory.trait('guest').build();
      expect(guest.role).toBe('guest');
    });

    it('applies traits to projects', () => {
      const archived = projectFactory.trait('archived').build();
      expect(archived.status).toBe('archived');
    });

    it('combines traits with overrides', () => {
      const admin = userFactory.trait('admin').build({ name: 'Admin User' });

      expect(admin.role).toBe('admin');
      expect(admin.name).toBe('Admin User');
    });
  });

  describe('Sequences', () => {
    it('generates sequential values', () => {
      const seq = createSequence((i) => `item-${i}`);

      expect(seq.next()).toBe('item-0');
      expect(seq.next()).toBe('item-1');
      expect(seq.next()).toBe('item-2');
    });

    it('can peek without advancing', () => {
      const seq = createSequence((i) => i * 10);

      expect(seq.peek()).toBe(0);
      expect(seq.peek()).toBe(0);
      expect(seq.next()).toBe(0);
      expect(seq.peek()).toBe(10);
    });

    it('can be reset', () => {
      const seq = createSequence((i) => i);

      seq.next();
      seq.next();
      seq.reset();

      expect(seq.next()).toBe(0);
    });
  });

  describe('generateId', () => {
    it('generates unique IDs', () => {
      const id1 = generateId('test');
      const id2 = generateId('test');

      expect(id1).not.toBe(id2);
      expect(id1).toMatch(/^test_/);
    });
  });
});

describe('Mock Utilities', () => {
  describe('createFetchMock', () => {
    it('mocks fetch responses', async () => {
      const fetchMock = createFetchMock();
      fetchMock.mockResponse('/api/users', { users: [] });

      const response = await fetchMock.mock('/api/users');
      const data = await response.json();

      expect(data).toEqual({ users: [] });
    });

    it('mocks specific HTTP methods', async () => {
      const fetchMock = createFetchMock();
      fetchMock.mockPost('/api/users', { id: '123' });

      const response = await fetchMock.mock('/api/users', { method: 'POST' });
      const data = await response.json();

      expect(data).toEqual({ id: '123' });
    });

    it('mocks error responses', async () => {
      const fetchMock = createFetchMock();
      fetchMock.mockError('/api/error', { status: 404, message: 'Not Found' });

      const response = await fetchMock.mock('/api/error');

      expect(response.ok).toBe(false);
      expect(response.status).toBe(404);
    });
  });

  describe('createStorageMock', () => {
    it('provides localStorage-like interface', () => {
      const storage = createStorageMock();

      storage.mock.setItem('key', 'value');
      expect(storage.mock.getItem('key')).toBe('value');

      storage.mock.removeItem('key');
      expect(storage.mock.getItem('key')).toBeNull();
    });

    it('tracks store contents', () => {
      const storage = createStorageMock();

      storage.mock.setItem('a', '1');
      storage.mock.setItem('b', '2');

      expect(storage.getStore()).toEqual({ a: '1', b: '2' });
    });

    it('can be reset', () => {
      const storage = createStorageMock();

      storage.mock.setItem('key', 'value');
      storage.reset();

      expect(storage.mock.getItem('key')).toBeNull();
    });
  });
});

describe('Async Utilities', () => {
  describe('delay', () => {
    it('waits for specified time', async () => {
      const start = Date.now();
      await delay(50);
      const elapsed = Date.now() - start;

      expect(elapsed).toBeGreaterThanOrEqual(45);
    });
  });

  describe('flushPromises', () => {
    it('resolves pending promises', async () => {
      let resolved = false;
      Promise.resolve().then(() => {
        resolved = true;
      });

      expect(resolved).toBe(false);
      await flushPromises();
      expect(resolved).toBe(true);
    });
  });

  describe('waitForCondition', () => {
    it('waits until condition is true', async () => {
      let value = false;
      setTimeout(() => {
        value = true;
      }, 50);

      await waitForCondition(() => value, { timeout: 200 });
      expect(value).toBe(true);
    });
  });

  describe('waitForValue', () => {
    it('waits until value matches expected', async () => {
      let count = 0;
      setTimeout(() => {
        count = 5;
      }, 50);

      await waitForValue(() => count, 5, { timeout: 500, interval: 10 });

      expect(count).toBe(5);
    });
  });

  describe('createDeferred', () => {
    it('creates a deferred promise', async () => {
      const deferred = createDeferred<string>();

      expect(deferred.isPending()).toBe(true);

      deferred.resolve('done');
      const result = await deferred.promise;

      expect(result).toBe('done');
      expect(deferred.isResolved()).toBe(true);
    });

    it('can reject', async () => {
      const deferred = createDeferred<string>();

      deferred.reject(new Error('fail'));

      await expect(deferred.promise).rejects.toThrow('fail');
      expect(deferred.isRejected()).toBe(true);
    });
  });

  describe('retry', () => {
    it('retries on failure', async () => {
      let attempts = 0;
      const fn = async () => {
        attempts++;
        if (attempts < 3) {
          throw new Error('not yet');
        }
        return 'success';
      };

      const result = await retry(fn, { maxAttempts: 5, delay: 10 });

      expect(result).toBe('success');
      expect(attempts).toBe(3);
    });

    it('throws after max attempts', async () => {
      const fn = async () => {
        throw new Error('always fails');
      };

      await expect(retry(fn, { maxAttempts: 2, delay: 10 })).rejects.toThrow(
        'always fails'
      );
    });
  });

  describe('withTimeout', () => {
    it('resolves if within timeout', async () => {
      const result = await withTimeout(Promise.resolve('fast'), 1000);

      expect(result).toBe('fast');
    });

    it('rejects if timeout exceeded', async () => {
      await expect(withTimeout(delay(500), 50, 'Too slow')).rejects.toThrow(
        'Too slow'
      );
    });
  });

  describe('createPromiseQueue', () => {
    it('tracks pending promises', async () => {
      const queue = createPromiseQueue();

      queue.add(() => delay(50));
      queue.add(() => delay(50));

      expect(queue.size()).toBe(2);

      await queue.waitForAll();
      expect(queue.size()).toBe(0);
    });
  });

  describe('expectToResolve', () => {
    it('expects promise to resolve', async () => {
      const result = await expectToResolve(Promise.resolve('value'), 'value');
      expect(result).toBe('value');
    });
  });

  describe('expectToReject', () => {
    it('expects promise to reject', async () => {
      const error = await expectToReject(
        Promise.reject(new Error('oops')),
        'oops'
      );
      expect(error.message).toBe('oops');
    });

    it('fails if promise resolves', async () => {
      await expect(expectToReject(Promise.resolve('success'))).rejects.toThrow(
        'Expected promise to reject, but it resolved'
      );
    });
  });

  describe('createAbortController', () => {
    it('provides abort functionality', () => {
      const { signal, abort, isAborted } = createAbortController();

      expect(isAborted()).toBe(false);
      abort();
      expect(isAborted()).toBe(true);
      expect(signal.aborted).toBe(true);
    });
  });

  describe('createMockTimer', () => {
    it('controls Date.now()', () => {
      const timer = createMockTimer(1000);

      expect(timer.now()).toBe(1000);

      timer.advance(500);
      expect(timer.now()).toBe(1500);

      timer.set(3000);
      expect(timer.now()).toBe(3000);

      timer.reset();
      expect(timer.now()).toBe(1000);
    });
  });
});

describe('Custom Matchers', () => {
  describe('toBeWithinRange', () => {
    it('passes for values within range', () => {
      expect(5).toBeWithinRange(1, 10);
      expect(1).toBeWithinRange(1, 10);
      expect(10).toBeWithinRange(1, 10);
    });

    it('fails for values outside range', () => {
      expect(() => {
        expect(0).toBeWithinRange(1, 10);
      }).toThrow();
    });
  });

  describe('toBeValidEmail', () => {
    it('validates email addresses', () => {
      expect('test@example.com').toBeValidEmail();
      expect('user.name@domain.co.uk').toBeValidEmail();
    });

    it('rejects invalid emails', () => {
      expect(() => {
        expect('notanemail').toBeValidEmail();
      }).toThrow();
    });
  });

  describe('toBeValidURL', () => {
    it('validates URLs', () => {
      expect('https://example.com').toBeValidURL();
      expect('http://localhost:3000/path').toBeValidURL();
    });

    it('rejects invalid URLs', () => {
      expect(() => {
        expect('not a url').toBeValidURL();
      }).toThrow();
    });
  });

  describe('toBeValidDate', () => {
    it('validates dates', () => {
      expect(new Date()).toBeValidDate();
      expect(new Date('2024-01-01')).toBeValidDate();
    });

    it('rejects invalid dates', () => {
      expect(() => {
        expect(new Date('invalid')).toBeValidDate();
      }).toThrow();
    });
  });

  describe('toBeEmptyArray', () => {
    it('passes for empty arrays', () => {
      expect([]).toBeEmptyArray();
    });

    it('fails for non-empty arrays', () => {
      expect(() => {
        expect([1]).toBeEmptyArray();
      }).toThrow();
    });
  });

  describe('toBeOneOf', () => {
    it('passes when value is in array', () => {
      expect('a').toBeOneOf(['a', 'b', 'c']);
      expect(2).toBeOneOf([1, 2, 3]);
    });

    it('fails when value is not in array', () => {
      expect(() => {
        expect('d').toBeOneOf(['a', 'b', 'c']);
      }).toThrow();
    });
  });

  describe('toHaveBeenCalledBefore', () => {
    it('checks call order', () => {
      const first = vi.fn();
      const second = vi.fn();

      first();
      second();

      expect(first).toHaveBeenCalledBefore(second);
    });
  });

  describe('toHaveBeenCalledAfter', () => {
    it('checks call order', () => {
      const first = vi.fn();
      const second = vi.fn();

      first();
      second();

      expect(second).toHaveBeenCalledAfter(first);
    });
  });

  describe('toHaveErrorMessage', () => {
    it('matches exact error message', () => {
      const error = new Error('Something went wrong');
      expect(error).toHaveErrorMessage('Something went wrong');
    });

    it('matches error message with regex', () => {
      const error = new Error('Error code: 404');
      expect(error).toHaveErrorMessage(/code: \d+/);
    });
  });
});
