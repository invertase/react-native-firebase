import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { execute } from '@react-native-firebase/app/dist/module/internal/web/firebaseFirestorePipelines';
import * as firebaseFirestorePipelines from '@react-native-firebase/app/dist/module/internal/web/firebaseFirestorePipelines';
import { executeWebSdkPipeline } from '../lib/web/pipelines/pipeline';

jest.mock('@react-native-firebase/app/dist/module/internal/web/firebaseFirestorePipelines', () => {
  const actual = jest.requireActual(
    '@react-native-firebase/app/dist/module/internal/web/firebaseFirestorePipelines',
  ) as Record<string, unknown>;

  return {
    ...actual,
    execute: jest.fn(),
    array: jest.fn(actual.array as (...args: unknown[]) => unknown),
    conditional: jest.fn(actual.conditional as (...args: unknown[]) => unknown),
    isType: jest.fn(actual.isType as (...args: unknown[]) => unknown),
    mapGet: jest.fn(actual.mapGet as (...args: unknown[]) => unknown),
    euclideanDistance: jest.fn(actual.euclideanDistance as (...args: unknown[]) => unknown),
  };
});

describe('Firestore web pipeline bridge', function () {
  beforeEach(function () {
    (execute as jest.Mock).mockReset();
  });

  it('rehydrates serialized expression nodes before applying stages', async function () {
    const pipelineInstance: any = {};
    pipelineInstance.where = jest.fn(() => pipelineInstance);
    pipelineInstance.select = jest.fn(() => pipelineInstance);
    pipelineInstance.sort = jest.fn(() => pipelineInstance);

    const pipelineSource = {
      collection: jest.fn(() => pipelineInstance),
    };

    const firestore = {
      pipeline: jest.fn(() => pipelineSource),
    } as any;

    (execute as jest.Mock).mockImplementation(async () => ({
      executionTime: { seconds: 7, nanoseconds: 0 },
      results: [],
    }));

    await executeWebSdkPipeline(
      firestore,
      {
        source: { source: 'collection', path: 'books' },
        stages: [
          {
            stage: 'where',
            options: {
              condition: {
                __kind: 'expression',
                exprType: 'Function',
                name: 'and',
                args: [
                  {
                    __kind: 'expression',
                    exprType: 'Function',
                    name: 'equal',
                    args: [
                      { __kind: 'expression', exprType: 'Field', path: 'genre' },
                      { __kind: 'expression', exprType: 'Constant', value: 'Fantasy' },
                    ],
                  },
                  {
                    __kind: 'expression',
                    exprType: 'Function',
                    name: 'greaterThan',
                    args: [
                      { __kind: 'expression', exprType: 'Field', path: 'rating' },
                      { __kind: 'expression', exprType: 'Constant', value: 3 },
                    ],
                  },
                ],
              },
            },
          },
          {
            stage: 'select',
            options: {
              selections: [
                {
                  path: 'title',
                  alias: 'title',
                  as: 'title',
                },
                {
                  // Runtime serialization drops __kind for non-field aliased expressions.
                  alias: 'boostedRating',
                  as: 'boostedRating',
                  expr: {
                    __kind: 'expression',
                    exprType: 'Function',
                    name: 'add',
                    args: [
                      { __kind: 'expression', exprType: 'Field', path: 'rating' },
                      { __kind: 'expression', exprType: 'Constant', value: 1 },
                    ],
                  },
                },
              ],
            },
          },
          {
            stage: 'sort',
            options: {
              orderings: [
                {
                  __kind: 'ordering',
                  direction: 'descending',
                  expr: { __kind: 'expression', exprType: 'Field', path: 'rating' },
                },
              ],
            },
          },
        ],
      },
      undefined,
    );

    const whereArg = (pipelineInstance.where as jest.Mock).mock.calls[0][0] as any;
    expect(whereArg).toBeDefined();
    expect(whereArg.__kind).toBeUndefined();

    const selectArg = (pipelineInstance.select as jest.Mock).mock.calls[0][0] as any;
    expect(selectArg).toBeDefined();
    expect(selectArg.__kind).toBeUndefined();

    const sortArg = (pipelineInstance.sort as jest.Mock).mock.calls[0][0] as any;
    expect(sortArg).toBeDefined();
    expect(sortArg.__kind).toBeUndefined();
  });

  it('rebuilds pipeline, executes via web SDK, and maps snapshot shape', async function () {
    const pipelineInstance: any = {};
    pipelineInstance.select = jest.fn(() => pipelineInstance);
    pipelineInstance.limit = jest.fn(() => pipelineInstance);

    const pipelineSource = {
      collection: jest.fn(() => pipelineInstance),
    };

    const firestore = {
      pipeline: jest.fn(() => pipelineSource),
    } as any;

    (execute as jest.Mock).mockImplementation(async () => ({
      executionTime: { seconds: 11, nanoseconds: 42 },
      results: [
        {
          ref: { path: 'books/alpha' },
          id: 'alpha',
          data: () => ({ title: 'RNFB', rating: 5 }),
          createTime: { seconds: 1, nanoseconds: 2 },
          updateTime: { seconds: 3, nanoseconds: 4 },
        },
      ],
    }));

    const response = await executeWebSdkPipeline(
      firestore,
      {
        source: { source: 'collection', path: 'books' },
        stages: [
          { stage: 'select', options: { selections: ['title', 'rating'] } },
          { stage: 'limit', options: { limit: 1 } },
        ],
      },
      {
        indexMode: 'recommended',
        rawOptions: { request_label: 'jest' },
      },
    );

    expect(pipelineSource.collection as jest.Mock).toHaveBeenCalledWith({
      collection: 'books',
    });
    expect(pipelineInstance.select).toHaveBeenCalledWith('title', 'rating');
    expect(pipelineInstance.limit).toHaveBeenCalledWith(1);
    expect(execute as jest.Mock).toHaveBeenCalledWith(pipelineInstance);

    expect(response).toEqual({
      executionTime: { seconds: 11, nanoseconds: 42 },
      results: [
        {
          path: 'books/alpha',
          id: 'alpha',
          data: { title: [8, 'RNFB'], rating: [7, 5] },
          createTime: { seconds: 1, nanoseconds: 2 },
          updateTime: { seconds: 3, nanoseconds: 4 },
        },
      ],
    });
  });

  it('throws when web Firestore instance does not expose pipeline()', async function () {
    const serializedPipeline = {
      source: { source: 'documents', documents: ['books/alpha'] },
      stages: [],
    } as const;

    await expect(
      executeWebSdkPipeline({} as any, serializedPipeline as any, undefined),
    ).rejects.toThrow('pipelineExecute() expected a Firestore instance with pipeline() support.');
  });

  it('throws when the web SDK snapshot omits executionTime', async function () {
    const pipelineInstance: any = {};
    const firestore = {
      pipeline: jest.fn(() => ({
        documents: jest.fn(() => pipelineInstance),
      })),
    } as any;

    (execute as jest.Mock).mockImplementation(async () => ({
      results: [],
    }));

    await expect(
      executeWebSdkPipeline(
        firestore,
        {
          source: { source: 'documents', documents: ['books/alpha'] },
          stages: [],
        },
        undefined,
      ),
    ).rejects.toThrow('pipelineExecute() expected the web SDK snapshot to include executionTime.');
  });

  it('falls back to documents source paths when projection results omit refs', async function () {
    const pipelineInstance: any = {};
    pipelineInstance.select = jest.fn(() => pipelineInstance);
    const firestore = {
      pipeline: jest.fn(() => ({
        documents: jest.fn(() => pipelineInstance),
      })),
    } as any;

    (execute as jest.Mock).mockImplementation(async () => ({
      executionTime: { seconds: 5, nanoseconds: 0 },
      results: [
        {
          data: () => ({ title: 'One' }),
        },
        {
          data: () => ({ title: 'Two' }),
        },
      ],
    }));

    const response = await executeWebSdkPipeline(
      firestore,
      {
        source: { source: 'documents', documents: ['books/one', 'books/two'] },
        stages: [{ stage: 'select', options: { selections: ['title'] } }],
      },
      undefined,
    );

    expect(response).toEqual({
      executionTime: { seconds: 5, nanoseconds: 0 },
      results: [
        {
          path: 'books/one',
          id: 'one',
          data: { title: [8, 'One'] },
          createTime: undefined,
          updateTime: undefined,
        },
        {
          path: 'books/two',
          id: 'two',
          data: { title: [8, 'Two'] },
          createTime: undefined,
          updateTime: undefined,
        },
      ],
    });
  });

  it('rejects invalid execute options before calling the web SDK', async function () {
    const firestore = {
      pipeline: jest.fn(),
    } as any;

    await expect(
      executeWebSdkPipeline(
        firestore,
        {
          source: { source: 'collection', path: 'books' },
          stages: [],
        },
        { indexMode: 'invalid' } as any,
      ),
    ).rejects.toThrow('pipelineExecute() expected options.indexMode to equal "recommended".');

    expect(firestore.pipeline).not.toHaveBeenCalled();
    expect(execute as jest.Mock).not.toHaveBeenCalled();
  });

  it('rejects empty addFields and removeFields stage arrays during request parsing', async function () {
    const firestore = {
      pipeline: jest.fn(),
    } as any;

    await expect(
      executeWebSdkPipeline(
        firestore,
        {
          source: { source: 'collection', path: 'books' },
          stages: [{ stage: 'addFields', options: { fields: [] } }],
        } as any,
        undefined,
      ),
    ).rejects.toThrow(
      'pipelineExecute() expected stage.options.fields to contain at least one value.',
    );

    await expect(
      executeWebSdkPipeline(
        firestore,
        {
          source: { source: 'collection', path: 'books' },
          stages: [{ stage: 'removeFields', options: { fields: [] } }],
        } as any,
        undefined,
      ),
    ).rejects.toThrow(
      'pipelineExecute() expected stage.options.fields to contain at least one value.',
    );
  });

  it('passes source rawOptions to collection and documents inputs with SDK option keys', async function () {
    const collectionPipeline: any = {};
    const documentsPipeline: any = {};
    const pipelineSource = {
      collection: jest.fn(() => collectionPipeline),
      documents: jest.fn(() => documentsPipeline),
    };
    const firestore = {
      pipeline: jest.fn(() => pipelineSource),
    } as any;

    (execute as jest.Mock).mockImplementation(async () => ({
      executionTime: { seconds: 1, nanoseconds: 0 },
      results: [],
    }));
    await executeWebSdkPipeline(
      firestore,
      {
        source: {
          source: 'collection',
          path: 'books',
          rawOptions: { force_index: 'idx_books' },
        },
        stages: [],
      },
      undefined,
    );

    expect(pipelineSource.collection as jest.Mock).toHaveBeenCalledWith({
      collection: 'books',
      rawOptions: { force_index: 'idx_books' },
    });

    (execute as jest.Mock).mockImplementation(async () => ({
      executionTime: { seconds: 2, nanoseconds: 0 },
      results: [],
    }));
    await executeWebSdkPipeline(
      firestore,
      {
        source: {
          source: 'documents',
          documents: ['books/one', 'books/two'],
          rawOptions: { read_time: '2026-03-17T00:00:00Z' },
        },
        stages: [],
      },
      undefined,
    );

    expect(pipelineSource.documents as jest.Mock).toHaveBeenCalledWith({
      docs: ['books/one', 'books/two'],
      rawOptions: { read_time: '2026-03-17T00:00:00Z' },
    });
  });

  it('rebuilds helper arguments using raw helper inputs instead of wrapped constants', async function () {
    const pipelineInstance: any = {};
    pipelineInstance.select = jest.fn(() => pipelineInstance);
    const firestore = {
      pipeline: jest.fn(() => ({
        collection: jest.fn(() => pipelineInstance),
      })),
    } as any;

    const isTypeMock = firebaseFirestorePipelines.isType as jest.Mock;
    const mapGetMock = firebaseFirestorePipelines.mapGet as jest.Mock;
    const euclideanDistanceMock = firebaseFirestorePipelines.euclideanDistance as jest.Mock;

    isTypeMock.mockClear();
    mapGetMock.mockClear();
    euclideanDistanceMock.mockClear();

    (execute as jest.Mock).mockImplementation(async () => ({
      executionTime: { seconds: 9, nanoseconds: 0 },
      results: [],
    }));

    await executeWebSdkPipeline(
      firestore,
      {
        source: { source: 'collection', path: 'books' },
        stages: [
          {
            stage: 'select',
            options: {
              selections: [
                {
                  alias: 'valueType',
                  as: 'valueType',
                  expr: {
                    __kind: 'expression',
                    exprType: 'Function',
                    name: 'isType',
                    args: [
                      { __kind: 'expression', exprType: 'Field', path: 'value' },
                      { __kind: 'expression', exprType: 'Constant', value: 'string' },
                    ],
                  },
                },
                {
                  alias: 'theme',
                  as: 'theme',
                  expr: {
                    __kind: 'expression',
                    exprType: 'Function',
                    name: 'mapGet',
                    args: [
                      { __kind: 'expression', exprType: 'Field', path: 'settings' },
                      { __kind: 'expression', exprType: 'Constant', value: 'theme' },
                    ],
                  },
                },
                {
                  alias: 'distance',
                  as: 'distance',
                  expr: {
                    __kind: 'expression',
                    exprType: 'Function',
                    name: 'euclideanDistance',
                    args: [
                      { __kind: 'expression', exprType: 'Field', path: 'embedding' },
                      { __kind: 'expression', exprType: 'Constant', value: [1, 0] },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
      undefined,
    );

    expect(isTypeMock.mock.calls.at(-1)?.[1]).toBe('string');
    expect(mapGetMock.mock.calls.at(-1)?.[1]).toBe('theme');
    expect(euclideanDistanceMock.mock.calls.at(-1)?.[1]).toEqual([1, 0]);
  });

  it('preserves helper-specific shapes for conditional and array builders', async function () {
    const pipelineInstance: any = {};
    pipelineInstance.select = jest.fn(() => pipelineInstance);
    const firestore = {
      pipeline: jest.fn(() => ({
        collection: jest.fn(() => pipelineInstance),
      })),
    } as any;

    const arrayMock = firebaseFirestorePipelines.array as jest.Mock;
    const conditionalMock = firebaseFirestorePipelines.conditional as jest.Mock;

    arrayMock.mockClear();
    conditionalMock.mockClear();

    (execute as jest.Mock).mockImplementation(async () => ({
      executionTime: { seconds: 10, nanoseconds: 0 },
      results: [],
    }));

    await executeWebSdkPipeline(
      firestore,
      {
        source: { source: 'collection', path: 'books' },
        stages: [
          {
            stage: 'select',
            options: {
              selections: [
                {
                  alias: 'fixedArr',
                  as: 'fixedArr',
                  expr: {
                    __kind: 'expression',
                    exprType: 'Function',
                    name: 'array',
                    args: [
                      { __kind: 'expression', exprType: 'Constant', value: 1 },
                      { __kind: 'expression', exprType: 'Constant', value: 2 },
                      { __kind: 'expression', exprType: 'Constant', value: 3 },
                    ],
                  },
                },
                {
                  alias: 'availability',
                  as: 'availability',
                  expr: {
                    __kind: 'expression',
                    exprType: 'Function',
                    name: 'conditional',
                    args: [
                      {
                        __kind: 'expression',
                        exprType: 'Function',
                        name: 'greaterThan',
                        args: [
                          { __kind: 'expression', exprType: 'Field', path: 'stock' },
                          { __kind: 'expression', exprType: 'Constant', value: 0 },
                        ],
                      },
                      { __kind: 'expression', exprType: 'Constant', value: 'in-stock' },
                      { __kind: 'expression', exprType: 'Constant', value: 'out-of-stock' },
                    ],
                  },
                },
              ],
            },
          },
        ],
      },
      undefined,
    );

    expect(arrayMock.mock.calls.at(-1)?.[0]).toEqual([1, 2, 3]);
    expect(typeof conditionalMock.mock.calls.at(-1)?.[1]).toBe('object');
    expect(typeof conditionalMock.mock.calls.at(-1)?.[2]).toBe('object');
  });

  it('keeps malformed union validation on the serialized-pipeline contract', async function () {
    const firestore = {
      pipeline: jest.fn(() => ({
        collection: jest.fn(),
      })),
    } as any;

    await expect(
      executeWebSdkPipeline(
        firestore,
        {
          source: { source: 'collection', path: 'books' },
          stages: [{ stage: 'union', options: { other: {} } }],
        } as any,
        undefined,
      ),
    ).rejects.toThrow(
      'pipelineExecute() expected stage.options.other to be a serialized pipeline object.',
    );
  });
});
