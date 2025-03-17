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

import { _performApiRequest,
    Endpoint,
    HttpMethod,
    _addTidIfNecessary
} from '../index';


/**
 * Fetches the password policy for the currently set tenant or the project if no tenant is set.
 *
 * @param {object} auth Auth object.
 * @param {object} [request={}] Password policy request.
 * @param {string} [request.tenantId] Optional tenant ID.
 * @returns {Promise<object>} Password policy response.
 */
export async function _getPasswordPolicy(auth, request = {}) {
    return _performApiRequest(
        auth,
        HttpMethod.GET,
        Endpoint.GET_PASSWORD_POLICY,
        _addTidIfNecessary(auth, request)
    );
}