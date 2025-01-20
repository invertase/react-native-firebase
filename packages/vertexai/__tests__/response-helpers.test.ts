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

import { addHelpers, formatBlockErrorMessage } from './response-helpers';
import { expect, use } from 'chai';
import { restore } from 'sinon';
import sinonChai from 'sinon-chai';
import {
  BlockReason,
  Content,
  FinishReason,
  GenerateContentResponse
} from '../types';

use(sinonChai);

const fakeResponseText: GenerateContentResponse = {
  candidates: [
    {
      index: 0,
      content: {
        role: 'model',
        parts: [{ text: 'Some text' }, { text: ' and some more text' }]
      }
    }
  ]
};

const functionCallPart1 = {
  functionCall: {
    name: 'find_theaters',
    args: {
      location: 'Mountain View, CA',
      movie: 'Barbie'
    }
  }
};

const functionCallPart2 = {
  functionCall: {
    name: 'find_times',
    args: {
      location: 'Mountain View, CA',
      movie: 'Barbie',
      time: '20:00'
    }
  }
};

const fakeResponseFunctionCall: GenerateContentResponse = {
  candidates: [
    {
      index: 0,
      content: {
        role: 'model',
        parts: [functionCallPart1]
      }
    }
  ]
};

const fakeResponseFunctionCalls: GenerateContentResponse = {
  candidates: [
    {
      index: 0,
      content: {
        role: 'model',
        parts: [functionCallPart1, functionCallPart2]
      }
    }
  ]
};

const fakeResponseMixed1: GenerateContentResponse = {
  candidates: [
    {
      index: 0,
      content: {
        role: 'model',
        parts: [{ text: 'some text' }, functionCallPart2]
      }
    }
  ]
};

const fakeResponseMixed2: GenerateContentResponse = {
  candidates: [
    {
      index: 0,
      content: {
        role: 'model',
        parts: [functionCallPart1, { text: 'some text' }]
      }
    }
  ]
};

const fakeResponseMixed3: GenerateContentResponse = {
  candidates: [
    {
      index: 0,
      content: {
        role: 'model',
        parts: [
          { text: 'some text' },
          functionCallPart1,
          { text: ' and more text' }
        ]
      }
    }
  ]
};

const badFakeResponse: GenerateContentResponse = {
  promptFeedback: {
    blockReason: BlockReason.SAFETY,
    safetyRatings: []
  }
};

describe('response-helpers methods', () => {
  afterEach(() => {
    restore();
  });
  describe('addHelpers', () => {
    it('good response text', async () => {
      const enhancedResponse = addHelpers(fakeResponseText);
      expect(enhancedResponse.text()).to.equal('Some text and some more text');
      expect(enhancedResponse.functionCalls()).to.be.undefined;
    });
    it('good response functionCall', async () => {
      const enhancedResponse = addHelpers(fakeResponseFunctionCall);
      expect(enhancedResponse.text()).to.equal('');
      expect(enhancedResponse.functionCalls()).to.deep.equal([
        functionCallPart1.functionCall
      ]);
    });
    it('good response functionCalls', async () => {
      const enhancedResponse = addHelpers(fakeResponseFunctionCalls);
      expect(enhancedResponse.text()).to.equal('');
      expect(enhancedResponse.functionCalls()).to.deep.equal([
        functionCallPart1.functionCall,
        functionCallPart2.functionCall
      ]);
    });
    it('good response text/functionCall', async () => {
      const enhancedResponse = addHelpers(fakeResponseMixed1);
      expect(enhancedResponse.functionCalls()).to.deep.equal([
        functionCallPart2.functionCall
      ]);
      expect(enhancedResponse.text()).to.equal('some text');
    });
    it('good response functionCall/text', async () => {
      const enhancedResponse = addHelpers(fakeResponseMixed2);
      expect(enhancedResponse.functionCalls()).to.deep.equal([
        functionCallPart1.functionCall
      ]);
      expect(enhancedResponse.text()).to.equal('some text');
    });
    it('good response text/functionCall/text', async () => {
      const enhancedResponse = addHelpers(fakeResponseMixed3);
      expect(enhancedResponse.functionCalls()).to.deep.equal([
        functionCallPart1.functionCall
      ]);
      expect(enhancedResponse.text()).to.equal('some text and more text');
    });
    it('bad response safety', async () => {
      const enhancedResponse = addHelpers(badFakeResponse);
      expect(enhancedResponse.text).to.throw('SAFETY');
    });
  });
  describe('getBlockString', () => {
    it('has no promptFeedback or bad finishReason', async () => {
      const message = formatBlockErrorMessage({
        candidates: [
          {
            index: 0,
            finishReason: FinishReason.STOP,
            finishMessage: 'this was fine',
            content: {} as Content
          }
        ]
      });
      expect(message).to.equal('');
    });
    it('has promptFeedback and blockReason only', async () => {
      const message = formatBlockErrorMessage({
        promptFeedback: {
          blockReason: BlockReason.SAFETY,
          safetyRatings: []
        }
      });
      expect(message).to.include('Response was blocked due to SAFETY');
    });
    it('has promptFeedback with blockReason and blockMessage', async () => {
      const message = formatBlockErrorMessage({
        promptFeedback: {
          blockReason: BlockReason.SAFETY,
          blockReasonMessage: 'safety reasons',
          safetyRatings: []
        }
      });
      expect(message).to.include(
        'Response was blocked due to SAFETY: safety reasons'
      );
    });
    it('has bad finishReason only', async () => {
      const message = formatBlockErrorMessage({
        candidates: [
          {
            index: 0,
            finishReason: FinishReason.SAFETY,
            content: {} as Content
          }
        ]
      });
      expect(message).to.include('Candidate was blocked due to SAFETY');
    });
    it('has finishReason and finishMessage', async () => {
      const message = formatBlockErrorMessage({
        candidates: [
          {
            index: 0,
            finishReason: FinishReason.SAFETY,
            finishMessage: 'unsafe candidate',
            content: {} as Content
          }
        ]
      });
      expect(message).to.include(
        'Candidate was blocked due to SAFETY: unsafe candidate'
      );
    });
  });
});
