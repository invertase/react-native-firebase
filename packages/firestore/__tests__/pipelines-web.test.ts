import { beforeEach, describe, expect, it, jest } from '@jest/globals';
import { execute } from '@react-native-firebase/app/dist/module/internal/web/firebaseFirestorePipelines';
import { executeWebSdkPipeline } from '../lib/web/pipeline';

jest.mock('@react-native-firebase/app/dist/module/internal/web/firebaseFirestorePipelines', () => {
  const actual = jest.requireActual(
    '@react-native-firebase/app/dist/module/internal/web/firebaseFirestorePipelines',
  ) as Record<string, unknown>;

  return {
    ...actual,
    execute: jest.fn(),
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
});
