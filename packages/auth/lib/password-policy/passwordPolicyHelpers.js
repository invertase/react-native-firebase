/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

const { Endpoint } = require('../../../src/api');
const { TEST_HOST, TEST_KEY, TEST_SCHEME } = require('../mock_auth');
const { mock, Route } = require('../mock_fetch');

function endpointUrl(endpoint) {
    return `${TEST_SCHEME}://${TEST_HOST}${endpoint}?key=${TEST_KEY}`;
}

function endpointUrlWithParams(endpoint, params) {
    let url = `${TEST_SCHEME}://${TEST_HOST}${endpoint}?key=${TEST_KEY}`;
    for (const key in params) {
        if (Object.prototype.hasOwnProperty.call(params, key)) {
            url += '&';
            url += key;
            url += '=';
            url += encodeURIComponent(params[key]);
        }
    }
    return url;
}

function mockEndpoint(endpoint, response, status = 200) {
    return mockEndpointWithParams(endpoint, {}, response, status);
}

function mockEndpointWithParams(endpoint, params, response, status = 200) {
    return mock(endpointUrlWithParams(endpoint, params), response, status);
}

module.exports = {
    endpointUrl,
    endpointUrlWithParams,
    mockEndpoint,
    mockEndpointWithParams
};
