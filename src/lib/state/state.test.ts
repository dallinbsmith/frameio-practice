'use client';

import { act, renderHook, waitFor } from '@testing-library/react';
import { afterEach, beforeEach, describe, expect, it, vi } from 'vitest';

import {
  applyMiddleware,
  atom,
  atomFamily,
  batch,
  clearAtomRegistry,
  computedAtom,
  createAsyncThunk,
  createCheckpointStore,
  createEntityAdapter,
  createHistoryStore,
  createSlice,
  createSliceStore,
  createStore,
  getAtom,
  historyMiddleware,
  logger,
  persist,
  resetAtom,
  resetStore,
  setAtom,
  shallow,
  subscribeAtom,
  subscribeWithSelector,
  throttle,
  useAtom,
  useAtomReducer,
  useAtomValue,
  useCheckpoints,
  useHistoryStore,
  useResetAtom,
  useSetAtom,
  useShallowStore,
  useStore,
  useStoreSubscription,
  validate,
} from './index';

describe('State Management', () => {
  describe('createStore', () => {
    it('creates a store with initial state', () => {
      const store = createStore(() => ({ count: 0 }));
      expect(store.getState()).toEqual({ count: 0 });
    });

    it('updates state with setState', () => {
      const store = createStore(() => ({ count: 0 }));
      store.setState({ count: 1 });
      expect(store.getState()).toEqual({ count: 1 });
    });

    it('updates state with function updater', () => {
      const store = createStore(() => ({ count: 0 }));
      store.setState((state) => ({ count: state.count + 1 }));
      expect(store.getState()).toEqual({ count: 1 });
    });

    it('replaces state when replace flag is true', () => {
      const store = createStore(() => ({ count: 0, name: 'test' }));
      store.setState({ count: 5 } as { count: number; name: string }, true);
      expect(store.getState()).toEqual({ count: 5 });
    });

    it('merges partial state by default', () => {
      const store = createStore(() => ({ count: 0, name: 'test' }));
      store.setState({ count: 5 });
      expect(store.getState()).toEqual({ count: 5, name: 'test' });
    });

    it('notifies subscribers on state change', () => {
      const store = createStore(() => ({ count: 0 }));
      const listener = vi.fn();
      store.subscribe(listener);
      store.setState({ count: 1 });
      expect(listener).toHaveBeenCalledWith({ count: 1 }, { count: 0 });
    });

    it('does not notify when state is unchanged', () => {
      const store = createStore(() => ({ count: 0 }));
      const listener = vi.fn();
      store.subscribe(listener);
      const state = store.getState();
      store.setState(state);
      expect(listener).not.toHaveBeenCalled();
    });

    it('unsubscribes correctly', () => {
      const store = createStore(() => ({ count: 0 }));
      const listener = vi.fn();
      const unsubscribe = store.subscribe(listener);
      unsubscribe();
      store.setState({ count: 1 });
      expect(listener).not.toHaveBeenCalled();
    });

    it('destroys all subscriptions', () => {
      const store = createStore(() => ({ count: 0 }));
      const listener1 = vi.fn();
      const listener2 = vi.fn();
      store.subscribe(listener1);
      store.subscribe(listener2);
      store.destroy();
      store.setState({ count: 1 });
      expect(listener1).not.toHaveBeenCalled();
      expect(listener2).not.toHaveBeenCalled();
    });

    it('throws when setState called during dispatch', () => {
      const store = createStore<{ count: number }>(() => ({ count: 0 }));
      store.subscribe(() => {
        expect(() => store.setState({ count: 2 })).toThrow(
          'Cannot call setState while dispatching'
        );
      });
      store.setState({ count: 1 });
    });
  });

  describe('subscribeWithSelector', () => {
    it('only notifies when selected value changes', () => {
      const store = createStore(() => ({ count: 0, name: 'test' }));
      const listener = vi.fn();

      subscribeWithSelector(store, (state) => state.count, listener);

      store.setState({ name: 'updated' });
      expect(listener).not.toHaveBeenCalled();

      store.setState({ count: 1 });
      expect(listener).toHaveBeenCalledWith(1, 0);
    });

    it('uses custom equality function', () => {
      const store = createStore(() => ({ items: [1, 2, 3] }));
      const listener = vi.fn();

      subscribeWithSelector(
        store,
        (state) => state.items,
        listener,
        (a, b) => a.length === b.length
      );

      store.setState({ items: [4, 5, 6] });
      expect(listener).not.toHaveBeenCalled();

      store.setState({ items: [1, 2, 3, 4] });
      expect(listener).toHaveBeenCalled();
    });
  });

  describe('batch', () => {
    it('batches multiple updates into single notification', () => {
      const store = createStore(() => ({ a: 0, b: 0, c: 0 }));
      const listener = vi.fn();
      store.subscribe(listener);

      batch(store, (set) => {
        set({ a: 1 });
        set({ b: 2 });
        set({ c: 3 });
      });

      expect(listener).toHaveBeenCalledTimes(1);
      expect(store.getState()).toEqual({ a: 1, b: 2, c: 3 });
    });
  });

  describe('resetStore', () => {
    it('resets store to initial state', () => {
      const initialState = { count: 0, name: 'initial' };
      const store = createStore(() => initialState);

      store.setState({ count: 10, name: 'updated' });
      resetStore(store, initialState);

      expect(store.getState()).toEqual(initialState);
    });
  });

  describe('useStore hook', () => {
    it('returns current state', () => {
      const store = createStore(() => ({ count: 5 }));

      const { result } = renderHook(() => useStore(store));

      expect(result.current).toEqual({ count: 5 });
    });

    it('updates when store changes', async () => {
      const store = createStore(() => ({ count: 0 }));

      const { result } = renderHook(() => useStore(store));

      act(() => {
        store.setState({ count: 1 });
      });

      await waitFor(() => {
        expect(result.current).toEqual({ count: 1 });
      });
    });

    it('uses selector to derive value', () => {
      const store = createStore(() => ({ count: 5, name: 'test' }));

      const { result } = renderHook(() =>
        useStore(store, (state) => state.count)
      );

      expect(result.current).toBe(5);
    });

    it('uses equality function to prevent re-renders', async () => {
      const store = createStore(() => ({ items: [1, 2, 3] }));
      let renderCount = 0;

      const { result } = renderHook(() => {
        renderCount++;
        return useStore(
          store,
          (state) => state.items,
          (a, b) => a.length === b.length
        );
      });

      const initialRenderCount = renderCount;

      act(() => {
        store.setState({ items: [4, 5, 6] });
      });

      expect(renderCount).toBe(initialRenderCount);
      expect(result.current).toEqual([1, 2, 3]);
    });
  });

  describe('useShallowStore', () => {
    it('uses shallow comparison for objects', () => {
      const store = createStore(() => ({ count: 5, name: 'test' }));

      const { result } = renderHook(() =>
        useShallowStore(store, (state) => state.count)
      );

      expect(result.current).toBe(5);
    });
  });

  describe('useStoreSubscription', () => {
    it('calls callback on state change', async () => {
      const store = createStore(() => ({ count: 0 }));
      const callback = vi.fn();

      renderHook(() => useStoreSubscription(store, callback));

      act(() => {
        store.setState({ count: 1 });
      });

      await waitFor(() => {
        expect(callback).toHaveBeenCalledWith({ count: 1 }, { count: 0 });
      });
    });
  });

  describe('shallow equality', () => {
    it('returns true for identical objects', () => {
      const obj = { a: 1, b: 2 };
      expect(shallow(obj, obj)).toBe(true);
    });

    it('returns true for shallowly equal objects', () => {
      expect(shallow({ a: 1, b: 2 }, { a: 1, b: 2 })).toBe(true);
    });

    it('returns false for different values', () => {
      expect(shallow({ a: 1 }, { a: 2 })).toBe(false);
    });

    it('returns false for different keys', () => {
      expect(shallow({ a: 1 }, { b: 1 })).toBe(false);
    });

    it('returns false for nested differences', () => {
      expect(shallow({ a: { b: 1 } }, { a: { b: 1 } })).toBe(false);
    });

    it('handles primitives', () => {
      expect(shallow(1, 1)).toBe(true);
      expect(shallow(1, 2)).toBe(false);
      expect(shallow('a', 'a')).toBe(true);
    });
  });

  describe('Middleware', () => {
    describe('applyMiddleware', () => {
      it('applies middleware to store', () => {
        const store = createStore(() => ({ count: 0 }));
        expect(store.getState()).toEqual({ count: 0 });

        store.setState({ count: 1 });
        expect(store.getState()).toEqual({ count: 1 });
      });
    });

    describe('logger', () => {
      it('creates logger middleware', () => {
        const loggerMiddleware = logger({ enabled: false });
        expect(loggerMiddleware).toBeDefined();
      });
    });

    describe('persist', () => {
      it('creates persist middleware', () => {
        const persistMiddleware = persist<{ count: number }>({
          name: 'test-store',
        });
        expect(persistMiddleware).toBeDefined();
      });
    });

    describe('throttle', () => {
      it('creates throttle middleware', () => {
        const throttleMiddleware = throttle<{ count: number }>(100);
        expect(throttleMiddleware).toBeDefined();
      });
    });

    describe('validate', () => {
      it('creates validate middleware', () => {
        const validateMiddleware = validate<{ count: number }>(
          (state) => state.count >= 0
        );
        expect(validateMiddleware).toBeDefined();
      });
    });
  });

  describe('Slice', () => {
    describe('createSlice', () => {
      it('creates a slice with actions', () => {
        const counterSlice = createSlice({
          name: 'counter',
          initialState: { value: 0 },
          reducers: {
            increment: (state) => ({ value: state.value + 1 }),
            decrement: (state) => ({ value: state.value - 1 }),
            incrementBy: (state, action: { payload: number }) => ({
              value: state.value + action.payload,
            }),
          },
        });

        expect(counterSlice.name).toBe('counter');
        expect(counterSlice.actions.increment()).toEqual({
          type: 'counter/increment',
          payload: undefined,
        });
        expect(counterSlice.actions.incrementBy(5)).toEqual({
          type: 'counter/incrementBy',
          payload: 5,
        });
      });

      it('reduces state correctly', () => {
        const counterSlice = createSlice({
          name: 'counter',
          initialState: { value: 0 },
          reducers: {
            increment: (state) => ({ value: state.value + 1 }),
          },
        });

        const initialState = counterSlice.getInitialState();
        const action = counterSlice.actions.increment();
        const nextState = counterSlice.reducer(initialState, action);

        expect(nextState).toEqual({ value: 1 });
      });
    });

    describe('createSliceStore', () => {
      it('creates a store from a slice', () => {
        const counterSlice = createSlice({
          name: 'counter',
          initialState: { value: 0 },
          reducers: {
            increment: (state) => ({ value: state.value + 1 }),
          },
        });

        const store = createSliceStore(counterSlice);

        expect(store.getState()).toEqual({ value: 0 });

        store.dispatch(store.actions.increment());

        expect(store.getState()).toEqual({ value: 1 });
      });
    });

    describe('createAsyncThunk', () => {
      it('creates async thunk with pending/fulfilled/rejected types', () => {
        const fetchUser = createAsyncThunk('user/fetch', async (id: number) => {
          return { id, name: 'Test User' };
        });

        expect(fetchUser.pending).toBe('user/fetch/pending');
        expect(fetchUser.fulfilled).toBe('user/fetch/fulfilled');
        expect(fetchUser.rejected).toBe('user/fetch/rejected');
      });

      it('returns fulfilled action on success', async () => {
        const fetchUser = createAsyncThunk('user/fetch', async (id: number) => {
          return { id, name: 'Test User' };
        });

        const action = await fetchUser(1);

        expect(action).toEqual({
          type: 'user/fetch/fulfilled',
          payload: { id: 1, name: 'Test User' },
        });
      });

      it('returns rejected action on error', async () => {
        const failingThunk = createAsyncThunk('fail', async () => {
          throw new Error('Failed');
        });

        const action = await failingThunk();

        expect(action.type).toBe('fail/rejected');
        expect(action.payload).toBe('Failed');
      });
    });

    describe('createEntityAdapter', () => {
      type User = { id: string; name: string; age: number };

      it('creates initial entity state', () => {
        const adapter = createEntityAdapter<User>();
        const state = adapter.getInitialState();

        expect(state).toEqual({ ids: [], entities: {} });
      });

      it('adds one entity', () => {
        const adapter = createEntityAdapter<User>();
        let state = adapter.getInitialState();

        state = adapter.addOne(state, { id: '1', name: 'Test', age: 25 });

        expect(state.ids).toEqual(['1']);
        expect(state.entities['1']).toEqual({ id: '1', name: 'Test', age: 25 });
      });

      it('does not add duplicate entities', () => {
        const adapter = createEntityAdapter<User>();
        let state = adapter.getInitialState();

        state = adapter.addOne(state, { id: '1', name: 'Test', age: 25 });
        const stateAfterDupe = adapter.addOne(state, {
          id: '1',
          name: 'Different',
          age: 30,
        });

        expect(stateAfterDupe).toBe(state);
      });

      it('adds many entities', () => {
        const adapter = createEntityAdapter<User>();
        let state = adapter.getInitialState();

        state = adapter.addMany(state, [
          { id: '1', name: 'User 1', age: 20 },
          { id: '2', name: 'User 2', age: 25 },
        ]);

        expect(state.ids).toEqual(['1', '2']);
      });

      it('sets one entity (upsert)', () => {
        const adapter = createEntityAdapter<User>();
        let state = adapter.getInitialState();

        state = adapter.addOne(state, { id: '1', name: 'Old', age: 20 });
        state = adapter.setOne(state, { id: '1', name: 'New', age: 21 });

        expect(state.entities['1']?.name).toBe('New');
        expect(state.ids.length).toBe(1);
      });

      it('sets all entities', () => {
        const adapter = createEntityAdapter<User>();
        let state = adapter.getInitialState();

        state = adapter.addOne(state, { id: '1', name: 'Old', age: 20 });
        state = adapter.setAll(state, [
          { id: '2', name: 'User 2', age: 25 },
          { id: '3', name: 'User 3', age: 30 },
        ]);

        expect(state.ids).toEqual(['2', '3']);
      });

      it('removes one entity', () => {
        const adapter = createEntityAdapter<User>();
        let state = adapter.getInitialState();

        state = adapter.addMany(state, [
          { id: '1', name: 'User 1', age: 20 },
          { id: '2', name: 'User 2', age: 25 },
        ]);
        state = adapter.removeOne(state, '1');

        expect(state.ids).toEqual(['2']);
        expect(state.entities['1']).toBeUndefined();
      });

      it('removes many entities', () => {
        const adapter = createEntityAdapter<User>();
        let state = adapter.getInitialState();

        state = adapter.addMany(state, [
          { id: '1', name: 'User 1', age: 20 },
          { id: '2', name: 'User 2', age: 25 },
          { id: '3', name: 'User 3', age: 30 },
        ]);
        state = adapter.removeMany(state, ['1', '3']);

        expect(state.ids).toEqual(['2']);
      });

      it('removes all entities', () => {
        const adapter = createEntityAdapter<User>();
        let state = adapter.getInitialState();

        state = adapter.addMany(state, [
          { id: '1', name: 'User 1', age: 20 },
          { id: '2', name: 'User 2', age: 25 },
        ]);
        state = adapter.removeAll(state);

        expect(state).toEqual({ ids: [], entities: {} });
      });

      it('updates one entity', () => {
        const adapter = createEntityAdapter<User>();
        let state = adapter.getInitialState();

        state = adapter.addOne(state, { id: '1', name: 'Original', age: 20 });
        state = adapter.updateOne(state, { id: '1', changes: { age: 21 } });

        expect(state.entities['1']).toEqual({
          id: '1',
          name: 'Original',
          age: 21,
        });
      });

      it('selects entities', () => {
        const adapter = createEntityAdapter<User>();
        let state = adapter.getInitialState();

        state = adapter.addMany(state, [
          { id: '1', name: 'User 1', age: 20 },
          { id: '2', name: 'User 2', age: 25 },
        ]);

        expect(adapter.selectById(state, '1')).toEqual({
          id: '1',
          name: 'User 1',
          age: 20,
        });
        expect(adapter.selectAll(state)).toHaveLength(2);
        expect(adapter.selectIds(state)).toEqual(['1', '2']);
        expect(adapter.selectTotal(state)).toBe(2);
      });
    });
  });

  describe('Atoms', () => {
    beforeEach(() => {
      clearAtomRegistry();
    });

    describe('atom', () => {
      it('creates an atom with default value', () => {
        const countAtom = atom({ key: 'count', default: 0 });
        expect(getAtom(countAtom)).toBe(0);
      });

      it('creates an atom with lazy default', () => {
        const lazyAtom = atom({ key: 'lazy', default: () => 'computed' });
        expect(getAtom(lazyAtom)).toBe('computed');
      });
    });

    describe('getAtom/setAtom', () => {
      it('gets and sets atom value', () => {
        const countAtom = atom({ key: 'count', default: 0 });

        expect(getAtom(countAtom)).toBe(0);

        setAtom(countAtom, 5);

        expect(getAtom(countAtom)).toBe(5);
      });

      it('sets atom with updater function', () => {
        const countAtom = atom({ key: 'count', default: 10 });

        setAtom(countAtom, (prev) => prev * 2);

        expect(getAtom(countAtom)).toBe(20);
      });
    });

    describe('subscribeAtom', () => {
      it('notifies on value change', () => {
        const countAtom = atom({ key: 'count', default: 0 });
        const listener = vi.fn();

        subscribeAtom(countAtom, listener);
        setAtom(countAtom, 1);

        expect(listener).toHaveBeenCalled();
      });

      it('does not notify when value unchanged', () => {
        const countAtom = atom({ key: 'count', default: 0 });
        const listener = vi.fn();

        subscribeAtom(countAtom, listener);
        setAtom(countAtom, 0);

        expect(listener).not.toHaveBeenCalled();
      });

      it('unsubscribes correctly', () => {
        const countAtom = atom({ key: 'count', default: 0 });
        const listener = vi.fn();

        const unsubscribe = subscribeAtom(countAtom, listener);
        unsubscribe();
        setAtom(countAtom, 1);

        expect(listener).not.toHaveBeenCalled();
      });
    });

    describe('resetAtom', () => {
      it('resets atom to default value', () => {
        const countAtom = atom({ key: 'count', default: 0 });

        setAtom(countAtom, 100);
        resetAtom(countAtom);

        expect(getAtom(countAtom)).toBe(0);
      });
    });

    describe('atomFamily', () => {
      it('creates parameterized atoms', () => {
        const userAtom = atomFamily(
          (id: number) => `user-${id}`,
          (id: number) => ({ id, name: '' })
        );

        const user1 = userAtom(1);
        const user2 = userAtom(2);

        expect(getAtom(user1)).toEqual({ id: 1, name: '' });
        expect(getAtom(user2)).toEqual({ id: 2, name: '' });

        setAtom(user1, { id: 1, name: 'Alice' });

        expect(getAtom(user1)).toEqual({ id: 1, name: 'Alice' });
        expect(getAtom(user2)).toEqual({ id: 2, name: '' });
      });

      it('returns same atom for same parameter', () => {
        const countAtom = atomFamily(
          (id: string) => `count-${id}`,
          () => 0
        );

        const atom1 = countAtom('a');
        const atom2 = countAtom('a');

        expect(atom1).toBe(atom2);
      });
    });

    describe('computed', () => {
      it('creates computed atom config', () => {
        const countAtom = atom({ key: 'computed-count', default: 5 });
        const doubleConfig = computedAtom({
          key: 'double',
          get: (get) => get(countAtom) * 2,
        });

        expect(doubleConfig.key).toBe('double');
        expect(typeof doubleConfig.get).toBe('function');

        const result = doubleConfig.get((a) => getAtom(a));
        expect(result).toBe(10);
      });
    });

    describe('useAtom hook', () => {
      beforeEach(() => {
        clearAtomRegistry();
      });

      it('returns atom value and setter', () => {
        const countAtom = atom({ key: 'hook-count', default: 0 });

        const { result } = renderHook(() => useAtom(countAtom));

        expect(result.current[0]).toBe(0);

        act(() => {
          result.current[1](5);
        });

        expect(result.current[0]).toBe(5);
      });
    });

    describe('useAtomValue hook', () => {
      beforeEach(() => {
        clearAtomRegistry();
      });

      it('returns only atom value', () => {
        const countAtom = atom({ key: 'value-count', default: 10 });

        const { result } = renderHook(() => useAtomValue(countAtom));

        expect(result.current).toBe(10);
      });
    });

    describe('useSetAtom hook', () => {
      beforeEach(() => {
        clearAtomRegistry();
      });

      it('returns only setter', () => {
        const countAtom = atom({ key: 'set-count', default: 0 });

        const { result } = renderHook(() => useSetAtom(countAtom));

        act(() => {
          result.current(25);
        });

        expect(getAtom(countAtom)).toBe(25);
      });
    });

    describe('useResetAtom hook', () => {
      beforeEach(() => {
        clearAtomRegistry();
      });

      it('returns reset function', () => {
        const countAtom = atom({ key: 'reset-count', default: 0 });
        setAtom(countAtom, 100);

        const { result } = renderHook(() => useResetAtom(countAtom));

        act(() => {
          result.current();
        });

        expect(getAtom(countAtom)).toBe(0);
      });
    });

    describe('useAtomReducer hook', () => {
      beforeEach(() => {
        clearAtomRegistry();
      });

      it('uses reducer pattern with atom', () => {
        type Action = { type: 'increment' } | { type: 'decrement' };

        const countAtom = atom({ key: 'reducer-count', default: 0 });
        const reducer = (state: number, action: Action): number => {
          switch (action.type) {
            case 'increment':
              return state + 1;
            case 'decrement':
              return state - 1;
            default:
              return state;
          }
        };

        const { result } = renderHook(() => useAtomReducer(countAtom, reducer));

        expect(result.current[0]).toBe(0);

        act(() => {
          result.current[1]({ type: 'increment' });
        });

        expect(result.current[0]).toBe(1);

        act(() => {
          result.current[1]({ type: 'decrement' });
        });

        expect(result.current[0]).toBe(0);
      });
    });
  });

  describe('History', () => {
    describe('createHistoryStore', () => {
      it('creates history store with initial state', () => {
        const store = createHistoryStore({ count: 0 });

        expect(store.getState()).toEqual({
          past: [],
          present: { count: 0 },
          future: [],
        });
      });

      it('records history on state changes', () => {
        const store = createHistoryStore({ count: 0 });

        store.setState({ count: 1 });
        store.setState({ count: 2 });

        expect(store.getState().past).toHaveLength(2);
        expect(store.getState().present).toEqual({ count: 2 });
      });

      it('supports undo', () => {
        const store = createHistoryStore({ count: 0 });

        store.setState({ count: 1 });
        store.setState({ count: 2 });

        store.undo();

        expect(store.getState().present).toEqual({ count: 1 });
        expect(store.getState().future).toHaveLength(1);
      });

      it('supports redo', () => {
        const store = createHistoryStore({ count: 0 });

        store.setState({ count: 1 });
        store.undo();
        store.redo();

        expect(store.getState().present).toEqual({ count: 1 });
      });

      it('reports canUndo/canRedo correctly', () => {
        const store = createHistoryStore({ count: 0 });

        expect(store.canUndo()).toBe(false);
        expect(store.canRedo()).toBe(false);

        store.setState({ count: 1 });

        expect(store.canUndo()).toBe(true);
        expect(store.canRedo()).toBe(false);

        store.undo();

        expect(store.canUndo()).toBe(false);
        expect(store.canRedo()).toBe(true);
      });

      it('clears history', () => {
        const store = createHistoryStore({ count: 0 });

        store.setState({ count: 1 });
        store.setState({ count: 2 });
        store.undo();
        store.clear();

        expect(store.getState().past).toHaveLength(0);
        expect(store.getState().future).toHaveLength(0);
        expect(store.getState().present).toEqual({ count: 1 });
      });

      it('respects maxHistory limit', () => {
        const store = createHistoryStore({ count: 0 }, { maxHistory: 3 });

        for (let i = 1; i <= 10; i++) {
          store.setState({ count: i });
        }

        expect(store.getState().past.length).toBeLessThanOrEqual(3);
      });
    });

    describe('useHistoryStore hook', () => {
      it('provides history controls', async () => {
        const store = createHistoryStore({ count: 0 });

        const { result } = renderHook(() => useHistoryStore(store));

        expect(result.current.state).toEqual({ count: 0 });
        expect(result.current.canUndo).toBe(false);

        act(() => {
          store.setState({ count: 1 });
        });

        await waitFor(() => {
          expect(result.current.canUndo).toBe(true);
        });
      });
    });

    describe('historyMiddleware', () => {
      it('wraps store with history capabilities', () => {
        const store = createStore(() => ({ count: 0 }));
        const middleware = historyMiddleware<{ count: number }>();
        const wrappedStore = middleware.wrapStore(store);

        wrappedStore.setState({ count: 1 });
        wrappedStore.setState({ count: 2 });

        expect(wrappedStore.canUndo()).toBe(true);

        wrappedStore.undo();

        expect(wrappedStore.getState()).toEqual({ count: 1 });
      });
    });

    describe('Checkpoints', () => {
      describe('createCheckpointStore', () => {
        it('saves and restores checkpoints', () => {
          const store = createStore(() => ({ count: 0 }));
          const checkpoints = createCheckpointStore(store);

          store.setState({ count: 5 });
          const id = checkpoints.save('checkpoint-1');

          store.setState({ count: 10 });

          expect(store.getState().count).toBe(10);

          checkpoints.restore(id);

          expect(store.getState().count).toBe(5);
        });

        it('lists checkpoints', () => {
          const store = createStore(() => ({ count: 0 }));
          const checkpoints = createCheckpointStore(store);

          checkpoints.save('first');
          checkpoints.save('second');

          const list = checkpoints.getCheckpoints();

          expect(list).toHaveLength(2);
          expect(list[0].label).toBe('second');
          expect(list[1].label).toBe('first');
        });

        it('deletes checkpoints', () => {
          const store = createStore(() => ({ count: 0 }));
          const checkpoints = createCheckpointStore(store);

          const id = checkpoints.save();
          checkpoints.deleteCheckpoint(id);

          expect(checkpoints.getCheckpoints()).toHaveLength(0);
        });

        it('respects max checkpoints limit', () => {
          const store = createStore(() => ({ count: 0 }));
          const checkpoints = createCheckpointStore(store, 3);

          for (let i = 0; i < 5; i++) {
            checkpoints.save();
          }

          expect(checkpoints.getCheckpoints()).toHaveLength(3);
        });

        it('clears all checkpoints', () => {
          const store = createStore(() => ({ count: 0 }));
          const checkpoints = createCheckpointStore(store);

          checkpoints.save();
          checkpoints.save();
          checkpoints.clearCheckpoints();

          expect(checkpoints.getCheckpoints()).toHaveLength(0);
        });

        it('returns false when restoring non-existent checkpoint', () => {
          const store = createStore(() => ({ count: 0 }));
          const checkpoints = createCheckpointStore(store);

          const result = checkpoints.restore('non-existent');

          expect(result).toBe(false);
        });
      });

      describe('useCheckpoints hook', () => {
        it('creates checkpoint store from hook', () => {
          const store = createStore(() => ({ count: 0 }));

          const { result } = renderHook(() => useCheckpoints(store));

          expect(result.current.save).toBeDefined();
          expect(result.current.restore).toBeDefined();
        });
      });
    });
  });
});
