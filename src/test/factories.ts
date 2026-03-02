import type { TestAsset, TestComment, TestProject, TestUser } from './types';

let idCounter = 0;

const generateId = (prefix = 'test'): string => {
  idCounter += 1;
  return `${prefix}_${idCounter}_${Math.random().toString(36).slice(2, 9)}`;
};

const resetIdCounter = (): void => {
  idCounter = 0;
};

type DeepPartial<T> = {
  [P in keyof T]?: T[P] extends object ? DeepPartial<T[P]> : T[P];
};

const createUser = (overrides: DeepPartial<TestUser> = {}): TestUser => ({
  id: generateId('user'),
  email: `user${idCounter}@example.com`,
  name: `Test User ${idCounter}`,
  role: 'user',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});

const createUsers = (
  count: number,
  overrides: DeepPartial<TestUser> = {}
): TestUser[] => Array.from({ length: count }, () => createUser(overrides));

const createProject = (
  overrides: DeepPartial<TestProject> = {}
): TestProject => ({
  id: generateId('project'),
  name: `Test Project ${idCounter}`,
  ownerId: generateId('user'),
  teamIds: [],
  status: 'active',
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});

const createProjects = (
  count: number,
  overrides: DeepPartial<TestProject> = {}
): TestProject[] =>
  Array.from({ length: count }, () => createProject(overrides));

const createAsset = (overrides: DeepPartial<TestAsset> = {}): TestAsset => ({
  id: generateId('asset'),
  name: `test-asset-${idCounter}.mp4`,
  type: 'video',
  url: `https://cdn.example.com/assets/${idCounter}.mp4`,
  size: 1024 * 1024 * 10,
  projectId: generateId('project'),
  uploadedBy: generateId('user'),
  createdAt: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});

const createAssets = (
  count: number,
  overrides: DeepPartial<TestAsset> = {}
): TestAsset[] => Array.from({ length: count }, () => createAsset(overrides));

const createComment = (
  overrides: DeepPartial<TestComment> = {}
): TestComment => ({
  id: generateId('comment'),
  content: `Test comment ${idCounter}`,
  authorId: generateId('user'),
  assetId: generateId('asset'),
  createdAt: new Date('2024-01-01T00:00:00Z'),
  updatedAt: new Date('2024-01-01T00:00:00Z'),
  ...overrides,
});

const createComments = (
  count: number,
  overrides: DeepPartial<TestComment> = {}
): TestComment[] =>
  Array.from({ length: count }, () => createComment(overrides));

type SequenceGenerator<T> = {
  next: () => T;
  reset: () => void;
  peek: () => T;
};

const createSequence = <T>(
  generator: (index: number) => T
): SequenceGenerator<T> => {
  let index = 0;
  return {
    next: () => generator(index++),
    reset: () => {
      index = 0;
    },
    peek: () => generator(index),
  };
};

const emailSequence = createSequence((i) => `user${i + 1}@example.com`);
const nameSequence = createSequence((i) => `User ${i + 1}`);
const projectNameSequence = createSequence((i) => `Project ${i + 1}`);

type BuilderState<T> = {
  value: T;
  traits: string[];
};

type TraitDefinition<T> = (current: T) => Partial<T>;

type Factory<T> = {
  build: (overrides?: DeepPartial<T>) => T;
  buildList: (count: number, overrides?: DeepPartial<T>) => T[];
  withTrait: (name: string, definition: TraitDefinition<T>) => Factory<T>;
  trait: (name: string) => Factory<T>;
  extend: <E extends T>(extender: (base: T) => E) => Factory<E>;
};

const createFactory = <T extends object>(
  defaultBuilder: () => T
): Factory<T> => {
  const traits = new Map<string, TraitDefinition<T>>();
  let activeTraits: string[] = [];

  const applyTraits = (base: T): T => {
    return activeTraits.reduce((acc, traitName) => {
      const traitFn = traits.get(traitName);
      if (traitFn) {
        return { ...acc, ...traitFn(acc) };
      }
      return acc;
    }, base);
  };

  const factory: Factory<T> = {
    build: (overrides = {}) => {
      const base = defaultBuilder();
      const withTraits = applyTraits(base);
      activeTraits = [];
      return { ...withTraits, ...overrides } as T;
    },

    buildList: (count, overrides = {}) =>
      Array.from({ length: count }, () => factory.build(overrides)),

    withTrait: (name, definition) => {
      traits.set(name, definition);
      return factory;
    },

    trait: (name) => {
      activeTraits.push(name);
      return factory;
    },

    extend: <E extends T>(extender: (base: T) => E): Factory<E> => {
      return createFactory(() => extender(factory.build()));
    },
  };

  return factory;
};

const userFactory = createFactory(createUser)
  .withTrait('admin', () => ({ role: 'admin' as const }))
  .withTrait('guest', () => ({ role: 'guest' as const }))
  .withTrait('withAvatar', (user) => ({
    avatar: `https://avatar.example.com/${user.id}.png`,
  }));

const projectFactory = createFactory(createProject)
  .withTrait('archived', () => ({ status: 'archived' as const }))
  .withTrait('draft', () => ({ status: 'draft' as const }))
  .withTrait('withDescription', () => ({
    description: 'A test project description',
  }));

const assetFactory = createFactory(createAsset)
  .withTrait('image', () => ({
    type: 'image' as const,
    name: `image-${idCounter}.png`,
    url: `https://cdn.example.com/images/${idCounter}.png`,
  }))
  .withTrait('audio', () => ({
    type: 'audio' as const,
    name: `audio-${idCounter}.mp3`,
    url: `https://cdn.example.com/audio/${idCounter}.mp3`,
  }))
  .withTrait('document', () => ({
    type: 'document' as const,
    name: `document-${idCounter}.pdf`,
    url: `https://cdn.example.com/docs/${idCounter}.pdf`,
  }))
  .withTrait('withThumbnail', (asset) => ({
    thumbnailUrl: `https://cdn.example.com/thumbs/${asset.id}.jpg`,
  }))
  .withTrait('withDuration', () => ({
    duration: 120,
  }));

const commentFactory = createFactory(createComment)
  .withTrait('reply', () => ({
    parentId: generateId('comment'),
  }))
  .withTrait('atTimestamp', () => ({
    timestamp: 30.5,
  }));

export {
  assetFactory,
  commentFactory,
  createAsset,
  createAssets,
  createComment,
  createComments,
  createFactory,
  createProject,
  createProjects,
  createSequence,
  createUser,
  createUsers,
  emailSequence,
  generateId,
  nameSequence,
  projectFactory,
  projectNameSequence,
  resetIdCounter,
  userFactory,
};

export type { DeepPartial, Factory, SequenceGenerator, TraitDefinition };
