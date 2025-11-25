/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */
import { describe, expect, it, jest, afterEach } from '@jest/globals';
import {
  addHelpers,
  formatBlockErrorMessage,
  handlePredictResponse,
} from '../lib/requests/response-helpers';

import {
  BlockReason,
  Content,
  FinishReason,
  GenerateContentResponse,
  ImagenInlineImage,
  ImagenGCSImage,
} from '../lib/types';
import { getMockResponse, BackendName } from './test-utils/mock-response';

const fakeResponseText: GenerateContentResponse = {
  candidates: [
    {
      index: 0,
      content: {
        role: 'model',
        parts: [{ text: 'Some text' }, { text: ' and some more text' }],
      },
    },
  ],
};

const fakeResponseThoughts: GenerateContentResponse = {
  candidates: [
    {
      index: 0,
      content: {
        role: 'model',
        parts: [{ text: 'Some text' }, { text: 'and some thoughts', thought: true }],
      },
    },
  ],
};

const functionCallPart1 = {
  functionCall: {
    name: 'find_theaters',
    args: {
      location: 'Mountain View, CA',
      movie: 'Barbie',
    },
  },
};

const functionCallPart2 = {
  functionCall: {
    name: 'find_times',
    args: {
      location: 'Mountain View, CA',
      movie: 'Barbie',
      time: '20:00',
    },
  },
};

const fakeResponseFunctionCall: GenerateContentResponse = {
  candidates: [
    {
      index: 0,
      content: {
        role: 'model',
        parts: [functionCallPart1],
      },
    },
  ],
};

const fakeResponseFunctionCalls: GenerateContentResponse = {
  candidates: [
    {
      index: 0,
      content: {
        role: 'model',
        parts: [functionCallPart1, functionCallPart2],
      },
    },
  ],
};

const fakeResponseMixed1: GenerateContentResponse = {
  candidates: [
    {
      index: 0,
      content: {
        role: 'model',
        parts: [{ text: 'some text' }, functionCallPart2],
      },
    },
  ],
};

const fakeResponseMixed2: GenerateContentResponse = {
  candidates: [
    {
      index: 0,
      content: {
        role: 'model',
        parts: [functionCallPart1, { text: 'some text' }],
      },
    },
  ],
};

const fakeResponseMixed3: GenerateContentResponse = {
  candidates: [
    {
      index: 0,
      content: {
        role: 'model',
        parts: [{ text: 'some text' }, functionCallPart1, { text: ' and more text' }],
      },
    },
  ],
};

const badFakeResponse: GenerateContentResponse = {
  promptFeedback: {
    blockReason: BlockReason.SAFETY,
    safetyRatings: [],
  },
};

describe('response-helpers methods', () => {
  afterEach(() => {
    jest.restoreAllMocks(); // Use Jest's restore function
  });

  describe('addHelpers', () => {
    it('good response text', () => {
      const enhancedResponse = addHelpers(fakeResponseText);
      expect(enhancedResponse.text()).toBe('Some text and some more text');
      expect(enhancedResponse.functionCalls()).toBeUndefined();
      expect(enhancedResponse.thoughtSummary()).toBeUndefined();
    });

    it('good response functionCall', () => {
      const enhancedResponse = addHelpers(fakeResponseFunctionCall);
      expect(enhancedResponse.text()).toBe('');
      expect(enhancedResponse.functionCalls()).toEqual([functionCallPart1.functionCall]);
      expect(enhancedResponse.thoughtSummary()).toBeUndefined();
    });

    it('good response functionCalls', () => {
      const enhancedResponse = addHelpers(fakeResponseFunctionCalls);
      expect(enhancedResponse.text()).toBe('');
      expect(enhancedResponse.functionCalls()).toEqual([
        functionCallPart1.functionCall,
        functionCallPart2.functionCall,
      ]);
      expect(enhancedResponse.thoughtSummary()).toBeUndefined();
    });

    it('good response text/functionCall', () => {
      const enhancedResponse = addHelpers(fakeResponseMixed1);
      expect(enhancedResponse.functionCalls()).toEqual([functionCallPart2.functionCall]);
      expect(enhancedResponse.text()).toBe('some text');
      expect(enhancedResponse.thoughtSummary()).toBeUndefined();
    });

    it('good response functionCall/text', () => {
      const enhancedResponse = addHelpers(fakeResponseMixed2);
      expect(enhancedResponse.functionCalls()).toEqual([functionCallPart1.functionCall]);
      expect(enhancedResponse.text()).toBe('some text');
      expect(enhancedResponse.thoughtSummary()).toBeUndefined();
    });

    it('good response text/functionCall/text', () => {
      const enhancedResponse = addHelpers(fakeResponseMixed3);
      expect(enhancedResponse.functionCalls()).toEqual([functionCallPart1.functionCall]);
      expect(enhancedResponse.text()).toBe('some text and more text');
      expect(enhancedResponse.thoughtSummary()).toBeUndefined();
    });

    it('good response text/thought', () => {
      const enhancedResponse = addHelpers(fakeResponseThoughts);
      expect(enhancedResponse.text()).toBe('Some text');
      expect(enhancedResponse.thoughtSummary()).toBe('and some thoughts');
      expect(enhancedResponse.functionCalls()).toBeUndefined();
    });

    it('bad response safety', () => {
      const enhancedResponse = addHelpers(badFakeResponse);
      expect(() => enhancedResponse.text()).toThrow('SAFETY');
      expect(() => enhancedResponse.thoughtSummary()).toThrow('SAFETY');
    });
  });

  describe('getBlockString', () => {
    it('has no promptFeedback or bad finishReason', () => {
      const message = formatBlockErrorMessage({
        candidates: [
          {
            index: 0,
            finishReason: FinishReason.STOP,
            finishMessage: 'this was fine',
            content: {} as Content,
          },
        ],
      });
      expect(message).toBe('');
    });

    it('has promptFeedback and blockReason only', () => {
      const message = formatBlockErrorMessage({
        promptFeedback: {
          blockReason: BlockReason.SAFETY,
          safetyRatings: [],
        },
      });
      expect(message).toContain('Response was blocked due to SAFETY');
    });

    it('has promptFeedback with blockReason and blockMessage', () => {
      const message = formatBlockErrorMessage({
        promptFeedback: {
          blockReason: BlockReason.SAFETY,
          blockReasonMessage: 'safety reasons',
          safetyRatings: [],
        },
      });
      expect(message).toContain('Response was blocked due to SAFETY: safety reasons');
    });

    it('has bad finishReason only', () => {
      const message = formatBlockErrorMessage({
        candidates: [
          {
            index: 0,
            finishReason: FinishReason.SAFETY,
            content: {} as Content,
          },
        ],
      });
      expect(message).toContain('Candidate was blocked due to SAFETY');
    });

    it('has finishReason and finishMessage', () => {
      const message = formatBlockErrorMessage({
        candidates: [
          {
            index: 0,
            finishReason: FinishReason.SAFETY,
            finishMessage: 'unsafe candidate',
            content: {} as Content,
          },
        ],
      });
      expect(message).toContain('Candidate was blocked due to SAFETY: unsafe candidate');
    });
  });

  describe('handlePredictResponse', () => {
    it('returns base64 images', async () => {
      const mockResponse = getMockResponse(
        BackendName.VertexAI,
        'unary-success-generate-images-base64.json',
      ) as Response;
      const res = await handlePredictResponse<ImagenInlineImage>(mockResponse);
      expect(res.filteredReason).toBeUndefined();
      expect(res.images.length).toBe(4);
      res.images.forEach(image => {
        expect(image.mimeType).toBe('image/png');
        expect(image.bytesBase64Encoded.length).toBeGreaterThan(0);
      });
    });

    it('returns GCS images', async () => {
      const mockResponse = getMockResponse(
        BackendName.VertexAI,
        'unary-success-generate-images-gcs.json',
      ) as Response;
      const res = await handlePredictResponse<ImagenGCSImage>(mockResponse);
      expect(res.filteredReason).toBeUndefined();
      expect(res.images.length).toBe(4);
      res.images.forEach((image, i) => {
        expect(image.mimeType).toBe('image/jpeg');
        expect(image.gcsURI).toBe(
          `gs://test-project-id-1234.firebasestorage.app/images/1234567890123/sample_${i}.jpg`,
        );
      });
    });

    it('has filtered reason and no images if all images were filtered', async () => {
      const mockResponse = getMockResponse(
        BackendName.VertexAI,
        'unary-failure-generate-images-all-filtered.json',
      ) as Response;
      const res = await handlePredictResponse<ImagenInlineImage>(mockResponse);
      expect(res.filteredReason).toBe(
        "Unable to show generated images. All images were filtered out because they violated Vertex AI's usage guidelines. You will not be charged for blocked images. Try rephrasing the prompt. If you think this was an error, send feedback. Support codes: 39322892, 29310472",
      );
      expect(res.images.length).toBe(0);
    });

    it('has filtered reason and no images if all base64 images were filtered', async () => {
      const mockResponse = getMockResponse(
        BackendName.VertexAI,
        'unary-failure-generate-images-base64-some-filtered.json',
      ) as Response;
      const res = await handlePredictResponse<ImagenInlineImage>(mockResponse);
      expect(res.filteredReason).toBe(
        'Your current safety filter threshold filtered out 2 generated images. You will not be charged for blocked images. Try rephrasing the prompt. If you think this was an error, send feedback.',
      );
      expect(res.images.length).toBe(2);
      res.images.forEach(image => {
        expect(image.mimeType).toBe('image/png');
        expect(image.bytesBase64Encoded.length).toBeGreaterThan(0);
      });
    });

    it('has filtered reason and no images if all GCS images were filtered', async () => {
      const mockResponse = getMockResponse(
        BackendName.VertexAI,
        'unary-failure-generate-images-gcs-some-filtered.json',
      ) as Response;
      const res = await handlePredictResponse<ImagenGCSImage>(mockResponse);
      expect(res.filteredReason).toBe(
        'Your current safety filter threshold filtered out 2 generated images. You will not be charged for blocked images. Try rephrasing the prompt. If you think this was an error, send feedback.',
      );
      expect(res.images.length).toBe(2);
      res.images.forEach(image => {
        expect(image.mimeType).toBe('image/jpeg');
        expect(image.gcsURI.length).toBeGreaterThan(0);
      });
    });
  });
});
