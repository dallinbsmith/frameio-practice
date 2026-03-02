'use client';

import { createStore } from './store';

import type { Action, Reducer } from './types';

type CaseReducer<S, P = void> = P extends void
  ? (state: S) => S | void
  : (state: S, action: Action<P>) => S | void;

type CaseReducers<S> = {
  [K: string]: CaseReducer<S, unknown>;
};

type InferPayload<R> = R extends CaseReducer<unknown, infer P> ? P : never;

type ActionCreators<S, R extends CaseReducers<S>> = {
  [K in keyof R]: InferPayload<R[K]> extends void
    ? () => Action<void>
    : (payload: InferPayload<R[K]>) => Action<InferPayload<R[K]>>;
};

type SliceConfig<S, R extends CaseReducers<S>> = {
  name: string;
  initialState: S;
  reducers: R;
};

type Slice<S, R extends CaseReducers<S>> = {
  name: string;
  reducer: Reducer<S, Action<unknown>>;
  actions: ActionCreators<S, R>;
  getInitialState: () => S;
};

const createSlice = <S, R extends CaseReducers<S>>(
  config: SliceConfig<S, R>
): Slice<S, R> => {
  const { name, initialState, reducers } = config;

  const actionCreators = {} as ActionCreators<S, R>;
  const reducerMap = new Map<string, CaseReducer<S, unknown>>();

  for (const key of Object.keys(reducers) as Array<keyof R>) {
    const type = `${name}/${String(key)}`;
    reducerMap.set(type, reducers[key] as CaseReducer<S, unknown>);

    (actionCreators as Record<string, unknown>)[key as string] = (
      payload?: unknown
    ) => ({
      type,
      payload,
    });
  }

  const reducer: Reducer<S, Action<unknown>> = (state, action) => {
    const caseReducer = reducerMap.get(action.type);
    if (caseReducer) {
      const result = caseReducer(state, action);
      return result === undefined ? state : (result as S);
    }
    return state;
  };

  return {
    name,
    reducer,
    actions: actionCreators,
    getInitialState: () => initialState,
  };
};

type SliceStore<S, R extends CaseReducers<S>> = {
  getState: () => S;
  dispatch: (action: Action<unknown>) => void;
  subscribe: (listener: (state: S, prevState: S) => void) => () => void;
  actions: ActionCreators<S, R>;
};

const createSliceStore = <S, R extends CaseReducers<S>>(
  slice: Slice<S, R>
): SliceStore<S, R> => {
  const store = createStore<S>(() => slice.getInitialState());

  const dispatch = (action: Action<unknown>) => {
    store.setState((state) => slice.reducer(state, action), true);
  };

  return {
    getState: store.getState,
    dispatch,
    subscribe: store.subscribe,
    actions: slice.actions,
  };
};

type ExtraReducers<S> = {
  [actionType: string]: CaseReducer<S, unknown>;
};

type SliceWithExtrasConfig<S, R extends CaseReducers<S>> = SliceConfig<S, R> & {
  extraReducers?: ExtraReducers<S> | undefined;
};

const createSliceWithExtras = <S, R extends CaseReducers<S>>(
  config: SliceWithExtrasConfig<S, R>
): Slice<S, R> => {
  const { name, initialState, reducers, extraReducers = {} } = config;

  const slice = createSlice({ name, initialState, reducers });

  const combinedReducer: Reducer<S, Action<unknown>> = (state, action) => {
    let nextState = slice.reducer(state, action);

    const extraReducer = extraReducers[action.type];
    if (extraReducer) {
      const result = extraReducer(nextState, action);
      nextState = result === undefined ? nextState : (result as S);
    }

    return nextState;
  };

  return {
    ...slice,
    reducer: combinedReducer,
  };
};

type AsyncThunk<Returned, ThunkArg> = {
  pending: string;
  fulfilled: string;
  rejected: string;
  (arg: ThunkArg): Promise<Action<Returned | unknown>>;
};

const createAsyncThunk = <Returned, ThunkArg = void>(
  typePrefix: string,
  payloadCreator: (arg: ThunkArg) => Promise<Returned>
): AsyncThunk<Returned, ThunkArg> => {
  const pending = `${typePrefix}/pending`;
  const fulfilled = `${typePrefix}/fulfilled`;
  const rejected = `${typePrefix}/rejected`;

  const thunk = async (arg: ThunkArg): Promise<Action<Returned | unknown>> => {
    try {
      const result = await payloadCreator(arg);
      return { type: fulfilled, payload: result };
    } catch (error) {
      return {
        type: rejected,
        payload: error instanceof Error ? error.message : 'Unknown error',
      };
    }
  };

  thunk.pending = pending;
  thunk.fulfilled = fulfilled;
  thunk.rejected = rejected;

  return thunk;
};

type EntityState<T> = {
  ids: string[];
  entities: Record<string, T>;
};

type EntityAdapter<T> = {
  getInitialState: () => EntityState<T>;
  addOne: (state: EntityState<T>, entity: T & { id: string }) => EntityState<T>;
  addMany: (
    state: EntityState<T>,
    entities: Array<T & { id: string }>
  ) => EntityState<T>;
  setOne: (state: EntityState<T>, entity: T & { id: string }) => EntityState<T>;
  setAll: (
    state: EntityState<T>,
    entities: Array<T & { id: string }>
  ) => EntityState<T>;
  removeOne: (state: EntityState<T>, id: string) => EntityState<T>;
  removeMany: (state: EntityState<T>, ids: string[]) => EntityState<T>;
  removeAll: (state: EntityState<T>) => EntityState<T>;
  updateOne: (
    state: EntityState<T>,
    update: { id: string; changes: Partial<T> }
  ) => EntityState<T>;
  selectById: (state: EntityState<T>, id: string) => T | undefined;
  selectAll: (state: EntityState<T>) => T[];
  selectIds: (state: EntityState<T>) => string[];
  selectTotal: (state: EntityState<T>) => number;
};

const createEntityAdapter = <T>(): EntityAdapter<T> => {
  const getInitialState = (): EntityState<T> => ({
    ids: [],
    entities: {},
  });

  const addOne = (
    state: EntityState<T>,
    entity: T & { id: string }
  ): EntityState<T> => {
    if (state.entities[entity.id]) {
      return state;
    }
    return {
      ids: [...state.ids, entity.id],
      entities: { ...state.entities, [entity.id]: entity },
    };
  };

  const addMany = (
    state: EntityState<T>,
    entities: Array<T & { id: string }>
  ): EntityState<T> => {
    return entities.reduce((acc, entity) => addOne(acc, entity), state);
  };

  const setOne = (
    state: EntityState<T>,
    entity: T & { id: string }
  ): EntityState<T> => {
    const isNew = !state.entities[entity.id];
    return {
      ids: isNew ? [...state.ids, entity.id] : state.ids,
      entities: { ...state.entities, [entity.id]: entity },
    };
  };

  const setAll = (
    _state: EntityState<T>,
    entities: Array<T & { id: string }>
  ): EntityState<T> => {
    const newEntities: Record<string, T> = {};
    const ids: string[] = [];

    for (const entity of entities) {
      ids.push(entity.id);
      newEntities[entity.id] = entity;
    }

    return { ids, entities: newEntities };
  };

  const removeOne = (state: EntityState<T>, id: string): EntityState<T> => {
    if (!state.entities[id]) {
      return state;
    }
    const { [id]: removed, ...entities } = state.entities;
    return {
      ids: state.ids.filter((i) => i !== id),
      entities,
    };
  };

  const removeMany = (state: EntityState<T>, ids: string[]): EntityState<T> => {
    return ids.reduce((acc, id) => removeOne(acc, id), state);
  };

  const removeAll = (_state: EntityState<T>): EntityState<T> => {
    return getInitialState();
  };

  const updateOne = (
    state: EntityState<T>,
    update: { id: string; changes: Partial<T> }
  ): EntityState<T> => {
    const existing = state.entities[update.id];
    if (!existing) {
      return state;
    }
    return {
      ...state,
      entities: {
        ...state.entities,
        [update.id]: { ...existing, ...update.changes },
      },
    };
  };

  const selectById = (state: EntityState<T>, id: string): T | undefined => {
    return state.entities[id];
  };

  const selectAll = (state: EntityState<T>): T[] => {
    return state.ids.map((id) => state.entities[id]).filter(Boolean) as T[];
  };

  const selectIds = (state: EntityState<T>): string[] => {
    return state.ids;
  };

  const selectTotal = (state: EntityState<T>): number => {
    return state.ids.length;
  };

  return {
    getInitialState,
    addOne,
    addMany,
    setOne,
    setAll,
    removeOne,
    removeMany,
    removeAll,
    updateOne,
    selectById,
    selectAll,
    selectIds,
    selectTotal,
  };
};

export {
  createAsyncThunk,
  createEntityAdapter,
  createSlice,
  createSliceStore,
  createSliceWithExtras,
};

export type {
  ActionCreators,
  AsyncThunk,
  CaseReducer,
  CaseReducers,
  EntityAdapter,
  EntityState,
  Slice,
  SliceConfig,
  SliceStore,
  SliceWithExtrasConfig,
};
