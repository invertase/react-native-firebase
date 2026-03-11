import { describe, expect, it, jest } from '@jest/globals';
import { executeWebSdkPipeline } from '../lib/web/pipeline';
import { createPipelineUnsupportedMessage } from '../lib/pipelines/pipeline_support';

describe('Firestore web pipeline bridge', function () {
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

    const execute = jest.fn(async () => ({
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
      { execute },
    );

    expect(pipelineSource.collection as jest.Mock).toHaveBeenCalledWith('books');
    expect(pipelineInstance.select).toHaveBeenCalledWith('title', 'rating');
    expect(pipelineInstance.limit).toHaveBeenCalledWith(1);
    expect(execute as jest.Mock).toHaveBeenCalledWith({
      pipeline: pipelineInstance,
      indexMode: 'recommended',
      rawOptions: { request_label: 'jest' },
    });

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

  it('throws deterministic unsupported error when web SDK pipeline entrypoint is unavailable', async function () {
    const serializedPipeline = {
      source: { source: 'documents', documents: ['books/alpha'] },
      stages: [],
    } as const;

    await expect(
      executeWebSdkPipeline({} as any, serializedPipeline as any, undefined, {}),
    ).rejects.toMatchObject({
      code: 'unsupported',
      message: createPipelineUnsupportedMessage(serializedPipeline as any),
    });
  });
});
