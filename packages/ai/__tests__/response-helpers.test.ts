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
import { addHelpers, formatBlockErrorMessage } from '../lib/requests/response-helpers';

import { BlockReason, Content, FinishReason, GenerateContentResponse } from '../lib/types';

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
    });

    it('good response functionCall', () => {
      const enhancedResponse = addHelpers(fakeResponseFunctionCall);
      expect(enhancedResponse.text()).toBe('');
      expect(enhancedResponse.functionCalls()).toEqual([functionCallPart1.functionCall]);
    });

    it('good response functionCalls', () => {
      const enhancedResponse = addHelpers(fakeResponseFunctionCalls);
      expect(enhancedResponse.text()).toBe('');
      expect(enhancedResponse.functionCalls()).toEqual([
        functionCallPart1.functionCall,
        functionCallPart2.functionCall,
      ]);
    });

    it('good response text/functionCall', () => {
      const enhancedResponse = addHelpers(fakeResponseMixed1);
      expect(enhancedResponse.functionCalls()).toEqual([functionCallPart2.functionCall]);
      expect(enhancedResponse.text()).toBe('some text');
    });

    it('good response functionCall/text', () => {
      const enhancedResponse = addHelpers(fakeResponseMixed2);
      expect(enhancedResponse.functionCalls()).toEqual([functionCallPart1.functionCall]);
      expect(enhancedResponse.text()).toBe('some text');
    });

    it('good response text/functionCall/text', () => {
      const enhancedResponse = addHelpers(fakeResponseMixed3);
      expect(enhancedResponse.functionCalls()).toEqual([functionCallPart1.functionCall]);
      expect(enhancedResponse.text()).toBe('some text and more text');
    });

    it('bad response safety', () => {
      const enhancedResponse = addHelpers(badFakeResponse);
      expect(() => enhancedResponse.text()).toThrow('SAFETY');
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
});
