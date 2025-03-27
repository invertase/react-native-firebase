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
  let schemaVersion = 1;

  try {
    // Identity toolkit API endpoint for password policy. Ensure this is enabled on Google cloud.
    const baseURL = 'https://identitytoolkit.googleapis.com/v2/passwordPolicy?key=';
    const apiKey = auth.app.options.apiKey;

    const response = await fetch(`${baseURL}${apiKey}`);
    if (!response.ok) {
      const errorDetails = await response.text();
      throw new Error(
        `firebase.auth().validatePassword(*) failed to fetch password policy from Firebase Console: ${response.statusText}. Details: ${errorDetails}`,
      );
    }
    const passwordPolicy = await response.json();

    if (passwordPolicy.schemaVersion !== schemaVersion) {
      throw new Error(
        `Password policy schema version mismatch. Expected: ${schemaVersion}, received: ${passwordPolicy.schemaVersion}`,
      );
    }
    return passwordPolicy;
  } catch (error) {
    throw new Error(
      `firebase.auth().validatePassword(*) Failed to fetch password policy: ${error.message}`,
    );
  }
}

module.exports = { fetchPasswordPolicy };
