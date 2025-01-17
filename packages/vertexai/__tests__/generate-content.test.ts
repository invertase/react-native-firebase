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

import { expect, use } from 'chai';
import { match, restore, stub } from 'sinon';
import sinonChai from 'sinon-chai';
import chaiAsPromised from 'chai-as-promised';
import { getMockResponse } from '../../test-utils/mock-response';
import * as request from '../requests/request';
import { generateContent } from './generate-content';
import {
  GenerateContentRequest,
  HarmBlockMethod,
  HarmBlockThreshold,
  HarmCategory
} from '../types';
import { ApiSettings } from '../types/internal';
import { Task } from '../requests/request';

use(sinonChai);
use(chaiAsPromised);

const fakeApiSettings: ApiSettings = {
  apiKey: 'key',
  project: 'my-project',
  location: 'us-central1'
};

const fakeRequestParams: GenerateContentRequest = {
  contents: [{ parts: [{ text: 'hello' }], role: 'user' }],
  generationConfig: {
    topK: 16
  },
  safetySettings: [
    {
      category: HarmCategory.HARM_CATEGORY_DANGEROUS_CONTENT,
      threshold: HarmBlockThreshold.BLOCK_LOW_AND_ABOVE,
      method: HarmBlockMethod.SEVERITY
    }
  ]
};

describe('generateContent()', () => {
  afterEach(() => {
    restore();
  });
  it('short response', async () => {
    const mockResponse = getMockResponse(
      'unary-success-basic-reply-short.json'
    );
    const makeRequestStub = stub(request, 'makeRequest').resolves(
      mockResponse as Response
    );
    const result = await generateContent(
      fakeApiSettings,
      'model',
      fakeRequestParams
    );
    expect(result.response.text()).to.include('Mountain View, California');
    expect(makeRequestStub).to.be.calledWith(
      'model',
      Task.GENERATE_CONTENT,
      fakeApiSettings,
      false,
      match((value: string) => {
        return value.includes('contents');
      }),
      undefined
    );
  });
  it('long response', async () => {
    const mockResponse = getMockResponse('unary-success-basic-reply-long.json');
    const makeRequestStub = stub(request, 'makeRequest').resolves(
      mockResponse as Response
    );
    const result = await generateContent(
      fakeApiSettings,
      'model',
      fakeRequestParams
    );
    expect(result.response.text()).to.include('Use Freshly Ground Coffee');
    expect(result.response.text()).to.include('30 minutes of brewing');
    expect(makeRequestStub).to.be.calledWith(
      'model',
      Task.GENERATE_CONTENT,
      fakeApiSettings,
      false,
      match.any
    );
  });
  it('citations', async () => {
    const mockResponse = getMockResponse('unary-success-citations.json');
    const makeRequestStub = stub(request, 'makeRequest').resolves(
      mockResponse as Response
    );
    const result = await generateContent(
      fakeApiSettings,
      'model',
      fakeRequestParams
    );
    expect(result.response.text()).to.include(
      'Some information cited from an external source'
    );
    expect(
      result.response.candidates?.[0].citationMetadata?.citations.length
    ).to.equal(3);
    expect(makeRequestStub).to.be.calledWith(
      'model',
      Task.GENERATE_CONTENT,
      fakeApiSettings,
      false,
      match.any
    );
  });
  it('blocked prompt', async () => {
    const mockResponse = getMockResponse(
      'unary-failure-prompt-blocked-safety.json'
    );
    const makeRequestStub = stub(request, 'makeRequest').resolves(
      mockResponse as Response
    );
    const result = await generateContent(
      fakeApiSettings,
      'model',
      fakeRequestParams
    );
    expect(result.response.text).to.throw('SAFETY');
    expect(makeRequestStub).to.be.calledWith(
      'model',
      Task.GENERATE_CONTENT,
      fakeApiSettings,
      false,
      match.any
    );
  });
  it('finishReason safety', async () => {
    const mockResponse = getMockResponse(
      'unary-failure-finish-reason-safety.json'
    );
    const makeRequestStub = stub(request, 'makeRequest').resolves(
      mockResponse as Response
    );
    const result = await generateContent(
      fakeApiSettings,
      'model',
      fakeRequestParams
    );
    expect(result.response.text).to.throw('SAFETY');
    expect(makeRequestStub).to.be.calledWith(
      'model',
      Task.GENERATE_CONTENT,
      fakeApiSettings,
      false,
      match.any
    );
  });
  it('empty content', async () => {
    const mockResponse = getMockResponse('unary-failure-empty-content.json');
    const makeRequestStub = stub(request, 'makeRequest').resolves(
      mockResponse as Response
    );
    const result = await generateContent(
      fakeApiSettings,
      'model',
      fakeRequestParams
    );
    expect(result.response.text()).to.equal('');
    expect(makeRequestStub).to.be.calledWith(
      'model',
      Task.GENERATE_CONTENT,
      fakeApiSettings,
      false,
      match.any
    );
  });
  it('unknown enum - should ignore', async () => {
    const mockResponse = getMockResponse(
      'unary-success-unknown-enum-safety-ratings.json'
    );
    const makeRequestStub = stub(request, 'makeRequest').resolves(
      mockResponse as Response
    );
    const result = await generateContent(
      fakeApiSettings,
      'model',
      fakeRequestParams
    );
    expect(result.response.text()).to.include('Some text');
    expect(makeRequestStub).to.be.calledWith(
      'model',
      Task.GENERATE_CONTENT,
      fakeApiSettings,
      false,
      match.any
    );
  });
  it('image rejected (400)', async () => {
    const mockResponse = getMockResponse('unary-failure-image-rejected.json');
    const mockFetch = stub(globalThis, 'fetch').resolves({
      ok: false,
      status: 400,
      json: mockResponse.json
    } as Response);
    await expect(
      generateContent(fakeApiSettings, 'model', fakeRequestParams)
    ).to.be.rejectedWith(/400.*invalid argument/);
    expect(mockFetch).to.be.called;
  });
  it('api not enabled (403)', async () => {
    const mockResponse = getMockResponse(
      'unary-failure-firebasevertexai-api-not-enabled.json'
    );
    const mockFetch = stub(globalThis, 'fetch').resolves({
      ok: false,
      status: 403,
      json: mockResponse.json
    } as Response);
    await expect(
      generateContent(fakeApiSettings, 'model', fakeRequestParams)
    ).to.be.rejectedWith(
      /firebasevertexai\.googleapis[\s\S]*my-project[\s\S]*api-not-enabled/
    );
    expect(mockFetch).to.be.called;
  });
});
