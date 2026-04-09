import { onCall, CallableRequest, CallableResponse, HttpsError } from 'firebase-functions/v2/https';
import { logger } from 'firebase-functions/v2';
import SAMPLE_DATA from './sample-data';

/**
 * Test streaming callable function that sends multiple chunks of data
 * This function demonstrates Server-Sent Events (SSE) streaming
 */
export const testStreamingCallable = onCall(
  async (
    req: CallableRequest<{ count?: number; delay?: number }>,
    response?: CallableResponse<any>,
  ) => {
    const count = req.data.count || 5;
    const delay = req.data.delay || 500;

    logger.info('testStreamingCallable called', { count, delay });

    // Send chunks of data over time
    for (let i = 0; i < count; i++) {
      // Wait for the specified delay
      await new Promise(resolve => setTimeout(resolve, delay));

      if (response) {
        await response.sendChunk({
          index: i,
          message: `Chunk ${i + 1} of ${count}`,
          timestamp: new Date().toISOString(),
          data: {
            value: i * 10,
            isEven: i % 2 === 0,
          },
        });
        logger.info(`testStreamingCallable send chunk ${i + 1}`);
      }
    }

    // Return final result
    return { totalCount: count, message: 'Stream complete' };
  },
);

/**
 * Test streaming callable that sends progressive updates
 */
export const testProgressStream = onCall(
  async (req: CallableRequest<{ task?: string }>, response?: CallableResponse<any>) => {
    const task = req.data.task || 'Processing';

    logger.info('testProgressStream called', { task });

    const updates = [
      { progress: 0, status: 'Starting...', task },
      { progress: 25, status: 'Loading data...', task },
      { progress: 50, status: 'Processing data...', task },
      { progress: 75, status: 'Finalizing...', task },
      { progress: 100, status: 'Complete!', task },
    ];

    for (const update of updates) {
      await new Promise(resolve => setTimeout(resolve, 300));
      if (response) {
        await response.sendChunk(update);
      }
    }

    return { success: true };
  },
);

/**
 * Test streaming with complex data types
 */
export const testComplexDataStream = onCall(
  async (req: CallableRequest, response?: CallableResponse<any>) => {
    logger.info('testComplexDataStream called');

    const items = [
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
    ];

    // Stream each item individually
    for (const item of items) {
      await new Promise(resolve => setTimeout(resolve, 200));
      if (response) {
        await response.sendChunk(item);
      }
    }

    // Return summary
    return {
      summary: {
        totalItems: items.length,
        processedAt: new Date().toISOString(),
      },
    };
  },
);

/**
 * Test streaming with error handling
 */
export const testStreamWithError = onCall(
  async (
    req: CallableRequest<{ shouldError?: boolean; errorAfter?: number }>,
    response?: CallableResponse<any>,
  ) => {
    const shouldError = req.data.shouldError !== false;
    const errorAfter = req.data.errorAfter || 2;

    logger.info('testStreamWithError called', { shouldError, errorAfter });

    for (let i = 0; i < 5; i++) {
      if (shouldError && i === errorAfter) {
        throw new Error('Simulated streaming error after chunk ' + errorAfter);
      }

      await new Promise(resolve => setTimeout(resolve, 300));
      if (response) {
        await response.sendChunk({
          chunk: i,
          message: `Processing chunk ${i + 1}`,
        });
      }
    }

    return {
      success: true,
      message: 'All chunks processed successfully',
    };
  },
);

/**
 * Test streaming callable that returns the type of data sent
 * Similar to Dart's testStreamResponse - sends back the type of input data
 */
export const testStreamResponse = onCall(
  async (req: CallableRequest<any>, response?: CallableResponse<any>) => {
    logger.info('testStreamResponse called', { data: req.data });

    // Determine the type of the input data
    let partialData: string;
    if (req.data === null || req.data === undefined) {
      partialData = 'null';
    } else if (typeof req.data === 'string') {
      partialData = 'string';
    } else if (typeof req.data === 'number') {
      partialData = 'number';
    } else if (typeof req.data === 'boolean') {
      partialData = 'boolean';
    } else if (Array.isArray(req.data)) {
      partialData = 'array';
    } else if (typeof req.data === 'object') {
      // For deep maps, check if it has the expected structure
      if (req.data.type === 'deepMap' && req.data.inputData) {
        partialData = req.data.inputData;
      } else {
        partialData = 'object';
      }
    } else {
      partialData = 'unknown';
    }

    // Send chunk with the type information
    if (response) {
      await response.sendChunk({
        partialData,
      });
    }

    // Return final result
    return {
      partialData,
      type: typeof req.data,
    };
  },
);

/**
 * Test streaming callable that handles null data
 * This function specifically accepts null and returns success: true
 */
export const testStreamingCallableWithNull = onCall(
  async (req: CallableRequest<any>, response?: CallableResponse<any>) => {
    logger.info('testStreamingCallableWithNull called', { data: req.data });

    // Send a chunk indicating null data was received
    if (response) {
      await response.sendChunk({
        message: 'Null data received',
        dataType: req.data === null || req.data === undefined ? 'null' : typeof req.data,
      });
    }

    // Return success
    return { success: true };
  },
);

/**
 * Streaming callable that throws HttpsError (for testing stream-by-name).
 * Only throws: invalid-argument (bad/missing type), or cancelled with details (when asError).
 */
export const testStreamWithHttpsError = onCall(
  async (
    req: CallableRequest<{ type?: string; asError?: boolean; inputData?: any }>,
    response?: CallableResponse<any>,
  ) => {
    logger.info('testStreamWithHttpsError called', { data: req.data });

    const data = req.data;
    if (data === undefined || data === null || typeof data !== 'object' || Array.isArray(data)) {
      throw new HttpsError('invalid-argument', 'Invalid test requested.');
    }

    const { type, asError } = data;
    if (!type || !Object.hasOwnProperty.call(SAMPLE_DATA, type)) {
      throw new HttpsError('invalid-argument', 'Invalid test requested.');
    }

    const outputData = SAMPLE_DATA[type as keyof typeof SAMPLE_DATA];

    if (asError) {
      throw new HttpsError(
        'cancelled',
        'Response data was requested to be sent as part of an Error payload, so here we are!',
        outputData,
      );
    }

    return outputData;
  },
);

/**
 * Streaming callable that throws HttpsError (for testing stream-from-URL).
 * Same behaviour as testStreamWithHttpsError; separate export for httpsCallableFromUrl.stream() e2e.
 */
export const testStreamWithHttpsErrorFromUrl = onCall(
  async (
    req: CallableRequest<{ type?: string; asError?: boolean; inputData?: any }>,
    response?: CallableResponse<any>,
  ) => {
    logger.info('testStreamWithHttpsErrorFromUrl called', { data: req.data });

    const data = req.data;
    if (data === undefined || data === null || typeof data !== 'object' || Array.isArray(data)) {
      throw new HttpsError('invalid-argument', 'Invalid test requested.');
    }

    const { type, asError } = data;
    if (!type || !Object.hasOwnProperty.call(SAMPLE_DATA, type)) {
      throw new HttpsError('invalid-argument', 'Invalid test requested.');
    }

    const outputData = SAMPLE_DATA[type as keyof typeof SAMPLE_DATA];

    if (asError) {
      throw new HttpsError(
        'cancelled',
        'Response data was requested to be sent as part of an Error payload, so here we are!',
        outputData,
      );
    }

    return outputData;
  },
);
