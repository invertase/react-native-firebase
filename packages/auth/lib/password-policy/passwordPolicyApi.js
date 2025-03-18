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

/**
 * Performs an API request to Firebase Console to get password policy json.
 *
 * @param {Object} auth - The authentication instance
 * @returns {Promise<Response>} A promise that resolves to the API response.
 * @throws {Error} Throws an error if the request fails or encounters an issue.
 */
export async function fetchPasswordPolicy(auth) {
  try {
    const baseURL = 'https://identitytoolkit.googleapis.com/v2/passwordPolicy?key=';
    const apiKey = auth.app.config.apiKey;
    //const apiKey = 'AIzaSyAgUhHU8wSJgO5MVNy95tMT07NEjzMOfz0';

    const response = await fetch(`${baseURL}${apiKey}`);
    if (!response.ok) {
      throw new Error(`Failed to fetch password policy: ${response.statusText}`);
    }
    const passwordPolicy = await response.json();
    return passwordPolicy;
  } catch (error) {
    throw new Error(`Failed to fetch password policy: ${error.message}`);
  }
}

module.exports = { fetchPasswordPolicy };
