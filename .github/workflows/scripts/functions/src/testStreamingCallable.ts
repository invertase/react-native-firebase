import { onCall, CallableRequest } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';

/**
 * Test streaming callable function that sends multiple chunks of data
 * This function demonstrates Server-Sent Events (SSE) streaming
 */
export const testStreamingCallable = onCall(
  async (req: CallableRequest<{ count?: number; delay?: number }>) => {
    const count = req.data.count || 5;
    const delay = req.data.delay || 500;

    logger.info('testStreamingCallable called', { count, delay });

    // For streaming, we need to return a stream response
    // The Firebase SDK will handle the streaming protocol
    const chunks = [];
    for (let i = 0; i < count; i++) {
      chunks.push({
        index: i,
        message: `Chunk ${i + 1} of ${count}`,
        timestamp: new Date().toISOString(),
        data: {
          value: i * 10,
          isEven: i % 2 === 0,
        },
      });
    }

    return { chunks, totalCount: count };
  },
);

/**
 * Test streaming callable that sends progressive updates
 */
export const testProgressStream = onCall(
  async (req: CallableRequest<{ task?: string }>) => {
    const task = req.data.task || 'Processing';

    logger.info('testProgressStream called', { task });

    const updates = [
      { progress: 0, status: 'Starting...', task },
      { progress: 25, status: 'Loading data...', task },
      { progress: 50, status: 'Processing data...', task },
      { progress: 75, status: 'Finalizing...', task },
      { progress: 100, status: 'Complete!', task },
    ];

    return { updates };
  },
);

/**
 * Test streaming with complex data types
 */
export const testComplexDataStream = onCall(async (req: CallableRequest) => {
  logger.info('testComplexDataStream called');

  return {
    items: [
      {
        id: 1,
        name: 'Item One',
        tags: ['test', 'streaming', 'firebase'],
        metadata: {
          created: new Date().toISOString(),
          version: '1.0.0',
        },
      },
      {
        id: 2,
        name: 'Item Two',
        tags: ['react-native', 'functions'],
        metadata: {
          created: new Date().toISOString(),
          version: '1.0.1',
        },
      },
      {
        id: 3,
        name: 'Item Three',
        tags: ['cloud', 'streaming'],
        metadata: {
          created: new Date().toISOString(),
          version: '2.0.0',
        },
      },
    ],
    summary: {
      totalItems: 3,
      processedAt: new Date().toISOString(),
    },
  };
});

/**
 * Test streaming with error handling
 */
export const testStreamWithError = onCall(
  async (req: CallableRequest<{ shouldError?: boolean; errorAfter?: number }>) => {
    const shouldError = req.data.shouldError || false;
    const errorAfter = req.data.errorAfter || 2;

    logger.info('testStreamWithError called', { shouldError, errorAfter });

    if (shouldError) {
      throw new Error('Simulated streaming error after chunk ' + errorAfter);
    }

    return {
      success: true,
      message: 'No error occurred',
    };
  },
);
