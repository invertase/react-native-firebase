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
import { RequestUrl, Task, getHeaders, makeRequest } from './request';
import { ApiSettings } from '../types/internal';
import { DEFAULT_API_VERSION } from '../constants';
import { VertexAIErrorCode } from '../types';
import { VertexAIError } from '../errors';
import { getMockResponse } from '../../test-utils/mock-response';

use(sinonChai);
use(chaiAsPromised);

const fakeApiSettings: ApiSettings = {
  apiKey: 'key',
  project: 'my-project',
  location: 'us-central1'
};

describe('request methods', () => {
  afterEach(() => {
    restore();
  });
  describe('RequestUrl', () => {
    it('stream', async () => {
      const url = new RequestUrl(
        'models/model-name',
        Task.GENERATE_CONTENT,
        fakeApiSettings,
        true,
        {}
      );
      expect(url.toString()).to.include('models/model-name:generateContent');
      expect(url.toString()).to.not.include(fakeApiSettings);
      expect(url.toString()).to.include('alt=sse');
    });
    it('non-stream', async () => {
      const url = new RequestUrl(
        'models/model-name',
        Task.GENERATE_CONTENT,
        fakeApiSettings,
        false,
        {}
      );
      expect(url.toString()).to.include('models/model-name:generateContent');
      expect(url.toString()).to.not.include(fakeApiSettings);
      expect(url.toString()).to.not.include('alt=sse');
    });
    it('default apiVersion', async () => {
      const url = new RequestUrl(
        'models/model-name',
        Task.GENERATE_CONTENT,
        fakeApiSettings,
        false,
        {}
      );
      expect(url.toString()).to.include(DEFAULT_API_VERSION);
    });
    it('custom baseUrl', async () => {
      const url = new RequestUrl(
        'models/model-name',
        Task.GENERATE_CONTENT,
        fakeApiSettings,
        false,
        { baseUrl: 'https://my.special.endpoint' }
      );
      expect(url.toString()).to.include('https://my.special.endpoint');
    });
    it('non-stream - tunedModels/', async () => {
      const url = new RequestUrl(
        'tunedModels/model-name',
        Task.GENERATE_CONTENT,
        fakeApiSettings,
        false,
        {}
      );
      expect(url.toString()).to.include(
        'tunedModels/model-name:generateContent'
      );
      expect(url.toString()).to.not.include(fakeApiSettings);
      expect(url.toString()).to.not.include('alt=sse');
    });
  });
  describe('getHeaders', () => {
    const fakeApiSettings: ApiSettings = {
      apiKey: 'key',
      project: 'myproject',
      location: 'moon',
      getAuthToken: () => Promise.resolve({ accessToken: 'authtoken' }),
      getAppCheckToken: () => Promise.resolve({ token: 'appchecktoken' })
    };
    const fakeUrl = new RequestUrl(
      'models/model-name',
      Task.GENERATE_CONTENT,
      fakeApiSettings,
      true,
      {}
    );
    it('adds client headers', async () => {
      const headers = await getHeaders(fakeUrl);
      expect(headers.get('x-goog-api-client')).to.match(
        /gl-js\/[0-9\.]+ fire\/[0-9\.]+/
      );
    });
    it('adds api key', async () => {
      const headers = await getHeaders(fakeUrl);
      expect(headers.get('x-goog-api-key')).to.equal('key');
    });
    it('adds app check token if it exists', async () => {
      const headers = await getHeaders(fakeUrl);
      expect(headers.get('X-Firebase-AppCheck')).to.equal('appchecktoken');
    });
    it('ignores app check token header if no appcheck service', async () => {
      const fakeUrl = new RequestUrl(
        'models/model-name',
        Task.GENERATE_CONTENT,
        {
          apiKey: 'key',
          project: 'myproject',
          location: 'moon'
        },
        true,
        {}
      );
      const headers = await getHeaders(fakeUrl);
      expect(headers.has('X-Firebase-AppCheck')).to.be.false;
    });
    it('ignores app check token header if returned token was undefined', async () => {
      const fakeUrl = new RequestUrl(
        'models/model-name',
        Task.GENERATE_CONTENT,
        {
          apiKey: 'key',
          project: 'myproject',
          location: 'moon',
          //@ts-ignore
          getAppCheckToken: () => Promise.resolve()
        },
        true,
        {}
      );
      const headers = await getHeaders(fakeUrl);
      expect(headers.has('X-Firebase-AppCheck')).to.be.false;
    });
    it('ignores app check token header if returned token had error', async () => {
      const fakeUrl = new RequestUrl(
        'models/model-name',
        Task.GENERATE_CONTENT,
        {
          apiKey: 'key',
          project: 'myproject',
          location: 'moon',
          getAppCheckToken: () =>
            Promise.resolve({ token: 'dummytoken', error: Error('oops') })
        },
        true,
        {}
      );
      const warnStub = stub(console, 'warn');
      const headers = await getHeaders(fakeUrl);
      expect(headers.get('X-Firebase-AppCheck')).to.equal('dummytoken');
      expect(warnStub).to.be.calledWith(
        match(/vertexai/),
        match(/App Check.*oops/)
      );
    });
    it('adds auth token if it exists', async () => {
      const headers = await getHeaders(fakeUrl);
      expect(headers.get('Authorization')).to.equal('Firebase authtoken');
    });
    it('ignores auth token header if no auth service', async () => {
      const fakeUrl = new RequestUrl(
        'models/model-name',
        Task.GENERATE_CONTENT,
        {
          apiKey: 'key',
          project: 'myproject',
          location: 'moon'
        },
        true,
        {}
      );
      const headers = await getHeaders(fakeUrl);
      expect(headers.has('Authorization')).to.be.false;
    });
    it('ignores auth token header if returned token was undefined', async () => {
      const fakeUrl = new RequestUrl(
        'models/model-name',
        Task.GENERATE_CONTENT,
        {
          apiKey: 'key',
          project: 'myproject',
          location: 'moon',
          //@ts-ignore
          getAppCheckToken: () => Promise.resolve()
        },
        true,
        {}
      );
      const headers = await getHeaders(fakeUrl);
      expect(headers.has('Authorization')).to.be.false;
    });
  });
  describe('makeRequest', () => {
    it('no error', async () => {
      const fetchStub = stub(globalThis, 'fetch').resolves({
        ok: true
      } as Response);
      const response = await makeRequest(
        'models/model-name',
        Task.GENERATE_CONTENT,
        fakeApiSettings,
        false,
        ''
      );
      expect(fetchStub).to.be.calledOnce;
      expect(response.ok).to.be.true;
    });
    it('error with timeout', async () => {
      const fetchStub = stub(globalThis, 'fetch').resolves({
        ok: false,
        status: 500,
        statusText: 'AbortError'
      } as Response);

      try {
        await makeRequest(
          'models/model-name',
          Task.GENERATE_CONTENT,
          fakeApiSettings,
          false,
          '',
          {
            timeout: 180000
          }
        );
      } catch (e) {
        expect((e as VertexAIError).code).to.equal(
          VertexAIErrorCode.FETCH_ERROR
        );
        expect((e as VertexAIError).customErrorData?.status).to.equal(500);
        expect((e as VertexAIError).customErrorData?.statusText).to.equal(
          'AbortError'
        );
        expect((e as VertexAIError).message).to.include('500 AbortError');
      }

      expect(fetchStub).to.be.calledOnce;
    });
    it('Network error, no response.json()', async () => {
      const fetchStub = stub(globalThis, 'fetch').resolves({
        ok: false,
        status: 500,
        statusText: 'Server Error'
      } as Response);
      try {
        await makeRequest(
          'models/model-name',
          Task.GENERATE_CONTENT,
          fakeApiSettings,
          false,
          ''
        );
      } catch (e) {
        expect((e as VertexAIError).code).to.equal(
          VertexAIErrorCode.FETCH_ERROR
        );
        expect((e as VertexAIError).customErrorData?.status).to.equal(500);
        expect((e as VertexAIError).customErrorData?.statusText).to.equal(
          'Server Error'
        );
        expect((e as VertexAIError).message).to.include('500 Server Error');
      }
      expect(fetchStub).to.be.calledOnce;
    });
    it('Network error, includes response.json()', async () => {
      const fetchStub = stub(globalThis, 'fetch').resolves({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        json: () => Promise.resolve({ error: { message: 'extra info' } })
      } as Response);
      try {
        await makeRequest(
          'models/model-name',
          Task.GENERATE_CONTENT,
          fakeApiSettings,
          false,
          ''
        );
      } catch (e) {
        expect((e as VertexAIError).code).to.equal(
          VertexAIErrorCode.FETCH_ERROR
        );
        expect((e as VertexAIError).customErrorData?.status).to.equal(500);
        expect((e as VertexAIError).customErrorData?.statusText).to.equal(
          'Server Error'
        );
        expect((e as VertexAIError).message).to.include('500 Server Error');
        expect((e as VertexAIError).message).to.include('extra info');
      }
      expect(fetchStub).to.be.calledOnce;
    });
    it('Network error, includes response.json() and details', async () => {
      const fetchStub = stub(globalThis, 'fetch').resolves({
        ok: false,
        status: 500,
        statusText: 'Server Error',
        json: () =>
          Promise.resolve({
            error: {
              message: 'extra info',
              details: [
                {
                  '@type': 'type.googleapis.com/google.rpc.DebugInfo',
                  detail:
                    '[ORIGINAL ERROR] generic::invalid_argument: invalid status photos.thumbnailer.Status.Code::5: Source image 0 too short'
                }
              ]
            }
          })
      } as Response);
      try {
        await makeRequest(
          'models/model-name',
          Task.GENERATE_CONTENT,
          fakeApiSettings,
          false,
          ''
        );
      } catch (e) {
        expect((e as VertexAIError).code).to.equal(
          VertexAIErrorCode.FETCH_ERROR
        );
        expect((e as VertexAIError).customErrorData?.status).to.equal(500);
        expect((e as VertexAIError).customErrorData?.statusText).to.equal(
          'Server Error'
        );
        expect((e as VertexAIError).message).to.include('500 Server Error');
        expect((e as VertexAIError).message).to.include('extra info');
        expect((e as VertexAIError).message).to.include(
          'generic::invalid_argument'
        );
      }
      expect(fetchStub).to.be.calledOnce;
    });
  });
  it('Network error, API not enabled', async () => {
    const mockResponse = getMockResponse(
      'unary-failure-firebasevertexai-api-not-enabled.json'
    );
    const fetchStub = stub(globalThis, 'fetch').resolves(
      mockResponse as Response
    );
    try {
      await makeRequest(
        'models/model-name',
        Task.GENERATE_CONTENT,
        fakeApiSettings,
        false,
        ''
      );
    } catch (e) {
      expect((e as VertexAIError).code).to.equal(
        VertexAIErrorCode.API_NOT_ENABLED
      );
      expect((e as VertexAIError).message).to.include('my-project');
      expect((e as VertexAIError).message).to.include('googleapis.com');
    }
    expect(fetchStub).to.be.calledOnce;
  });
});
