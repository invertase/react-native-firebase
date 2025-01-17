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
import { countTokens } from './count-tokens';
import { CountTokensRequest } from '../types';
import { ApiSettings } from '../types/internal';
import { Task } from '../requests/request';

use(sinonChai);
use(chaiAsPromised);

const fakeApiSettings: ApiSettings = {
  apiKey: 'key',
  project: 'my-project',
  location: 'us-central1'
};

const fakeRequestParams: CountTokensRequest = {
  contents: [{ parts: [{ text: 'hello' }], role: 'user' }]
};

describe('countTokens()', () => {
  afterEach(() => {
    restore();
  });
  it('total tokens', async () => {
    const mockResponse = getMockResponse('unary-success-total-tokens.json');
    const makeRequestStub = stub(request, 'makeRequest').resolves(
      mockResponse as Response
    );
    const result = await countTokens(
      fakeApiSettings,
      'model',
      fakeRequestParams
    );
    expect(result.totalTokens).to.equal(6);
    expect(result.totalBillableCharacters).to.equal(16);
    expect(makeRequestStub).to.be.calledWith(
      'model',
      Task.COUNT_TOKENS,
      fakeApiSettings,
      false,
      match((value: string) => {
        return value.includes('contents');
      }),
      undefined
    );
  });
  it('total tokens no billable characters', async () => {
    const mockResponse = getMockResponse(
      'unary-success-no-billable-characters.json'
    );
    const makeRequestStub = stub(request, 'makeRequest').resolves(
      mockResponse as Response
    );
    const result = await countTokens(
      fakeApiSettings,
      'model',
      fakeRequestParams
    );
    expect(result.totalTokens).to.equal(258);
    expect(result).to.not.have.property('totalBillableCharacters');
    expect(makeRequestStub).to.be.calledWith(
      'model',
      Task.COUNT_TOKENS,
      fakeApiSettings,
      false,
      match((value: string) => {
        return value.includes('contents');
      }),
      undefined
    );
  });
  it('model not found', async () => {
    const mockResponse = getMockResponse('unary-failure-model-not-found.json');
    const mockFetch = stub(globalThis, 'fetch').resolves({
      ok: false,
      status: 404,
      json: mockResponse.json
    } as Response);
    await expect(
      countTokens(fakeApiSettings, 'model', fakeRequestParams)
    ).to.be.rejectedWith(/404.*not found/);
    expect(mockFetch).to.be.called;
  });
});
