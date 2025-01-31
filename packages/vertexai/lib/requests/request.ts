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
import { Platform } from 'react-native';
import { ErrorDetails, RequestOptions, VertexAIErrorCode } from '../types';
import { VertexAIError } from '../errors';
import { ApiSettings } from '../types/internal';
import {
  DEFAULT_API_VERSION,
  DEFAULT_BASE_URL,
  DEFAULT_FETCH_TIMEOUT_MS,
  LANGUAGE_TAG,
  PACKAGE_VERSION,
} from '../constants';
import { logger } from '../logger';

export enum Task {
  GENERATE_CONTENT = 'generateContent',
  STREAM_GENERATE_CONTENT = 'streamGenerateContent',
  COUNT_TOKENS = 'countTokens',
}

export class RequestUrl {
  constructor(
    public model: string,
    public task: Task,
    public apiSettings: ApiSettings,
    public stream: boolean,
    public requestOptions?: RequestOptions,
  ) {}
  toString(): string {
    const isTestEnvironment = process.env.RNFB_VERTEXAI_EMULATOR_URL;
    if (isTestEnvironment) {
      let emulatorUrl;
      logger.info(
        'Running VertexAI in test environment, pointing to Firebase Functions emulator URL',
      );
      const isAndroid = Platform.OS === 'android';

      if (this.stream) {
        emulatorUrl = `http://${isAndroid ? '10.0.2.2' : '127.0.0.1'}:5001/react-native-firebase-testing/us-central1/testFetchStream`;
      } else {
        emulatorUrl = `http://${isAndroid ? '10.0.2.2' : '127.0.0.1'}:5001/react-native-firebase-testing/us-central1/testFetch`;
      }
      return emulatorUrl;
    }
    // TODO: allow user-set option if that feature becomes available
    const apiVersion = DEFAULT_API_VERSION;
    const baseUrl = this.requestOptions?.baseUrl || DEFAULT_BASE_URL;
    let url = `${baseUrl}/${apiVersion}`;
    url += `/projects/${this.apiSettings.project}`;
    url += `/locations/${this.apiSettings.location}`;
    url += `/${this.model}`;
    url += `:${this.task}`;
    if (this.stream) {
      url += '?alt=sse';
    }
    return url;
  }

  /**
   * If the model needs to be passed to the backend, it needs to
   * include project and location path.
   */
  get fullModelString(): string {
    let modelString = `projects/${this.apiSettings.project}`;
    modelString += `/locations/${this.apiSettings.location}`;
    modelString += `/${this.model}`;
    return modelString;
  }
}

/**
 * Log language and "fire/version" to x-goog-api-client
 */
function getClientHeaders(): string {
  const loggingTags = [];
  loggingTags.push(`${LANGUAGE_TAG}/${PACKAGE_VERSION}`);
  loggingTags.push(`fire/${PACKAGE_VERSION}`);
  return loggingTags.join(' ');
}

export async function getHeaders(url: RequestUrl): Promise<Headers> {
  const headers = new Headers();
  headers.append('Content-Type', 'application/json');
  headers.append('x-goog-api-client', getClientHeaders());
  headers.append('x-goog-api-key', url.apiSettings.apiKey);
  if (url.apiSettings.getAppCheckToken) {
    let appCheckToken;

    try {
      appCheckToken = await url.apiSettings.getAppCheckToken();
    } catch (e) {
      logger.warn(`Unable to obtain a valid App Check token: ${e}`);
    }
    if (appCheckToken) {
      headers.append('X-Firebase-AppCheck', appCheckToken.token);
    }
  }

  if (url.apiSettings.getAuthToken) {
    const authToken = await url.apiSettings.getAuthToken();
    if (authToken) {
      headers.append('Authorization', `Firebase ${authToken}`);
    }
  }

  return headers;
}

export async function constructRequest(
  model: string,
  task: Task,
  apiSettings: ApiSettings,
  stream: boolean,
  body: string,
  requestOptions?: RequestOptions,
): Promise<{ url: string; fetchOptions: RequestInit }> {
  const url = new RequestUrl(model, task, apiSettings, stream, requestOptions);
  return {
    url: url.toString(),
    fetchOptions: {
      method: 'POST',
      headers: await getHeaders(url),
      body,
    },
  };
}

export async function makeRequest(
  model: string,
  task: Task,
  apiSettings: ApiSettings,
  stream: boolean,
  body: string,
  requestOptions?: RequestOptions,
): Promise<Response> {
  const url = new RequestUrl(model, task, apiSettings, stream, requestOptions);
  let response;
  let fetchTimeoutId: string | number | NodeJS.Timeout | undefined;
  try {
    const request = await constructRequest(model, task, apiSettings, stream, body, requestOptions);
    // Timeout is 180s by default
    const timeoutMillis =
      requestOptions?.timeout != null && requestOptions.timeout >= 0
        ? requestOptions.timeout
        : DEFAULT_FETCH_TIMEOUT_MS;
    const abortController = new AbortController();
    fetchTimeoutId = setTimeout(() => abortController.abort(), timeoutMillis);
    request.fetchOptions.signal = abortController.signal;
    const fetchOptions = stream
      ? {
          ...request.fetchOptions,
          reactNative: {
            textStreaming: true,
          },
        }
      : request.fetchOptions;
    response = await fetch(request.url, fetchOptions);
    if (!response.ok) {
      let message = '';
      let errorDetails;
      try {
        const json = await response.json();
        message = json.error.message;
        if (json.error.details) {
          message += ` ${JSON.stringify(json.error.details)}`;
          errorDetails = json.error.details;
        }
      } catch (e) {
        // ignored
      }
      if (
        response.status === 403 &&
        errorDetails.some((detail: ErrorDetails) => detail.reason === 'SERVICE_DISABLED') &&
        errorDetails.some((detail: ErrorDetails) =>
          (detail.links as Array<Record<string, string>>)?.[0]?.description?.includes(
            'Google developers console API activation',
          ),
        )
      ) {
        throw new VertexAIError(
          VertexAIErrorCode.API_NOT_ENABLED,
          `The Vertex AI in Firebase SDK requires the Vertex AI in Firebase ` +
            `API ('firebasevertexai.googleapis.com') to be enabled in your ` +
            `Firebase project. Enable this API by visiting the Firebase Console ` +
            `at https://console.firebase.google.com/project/${url.apiSettings.project}/genai/ ` +
            `and clicking "Get started". If you enabled this API recently, ` +
            `wait a few minutes for the action to propagate to our systems and ` +
            `then retry.`,
          {
            status: response.status,
            statusText: response.statusText,
            errorDetails,
          },
        );
      }
      throw new VertexAIError(
        VertexAIErrorCode.FETCH_ERROR,
        `Error fetching from ${url}: [${response.status} ${response.statusText}] ${message}`,
        {
          status: response.status,
          statusText: response.statusText,
          errorDetails,
        },
      );
    }
  } catch (e) {
    let err = e as Error;
    if (
      (e as VertexAIError).code !== VertexAIErrorCode.FETCH_ERROR &&
      (e as VertexAIError).code !== VertexAIErrorCode.API_NOT_ENABLED &&
      e instanceof Error
    ) {
      err = new VertexAIError(
        VertexAIErrorCode.ERROR,
        `Error fetching from ${url.toString()}: ${e.message}`,
      );
      err.stack = e.stack;
    }

    throw err;
  } finally {
    if (fetchTimeoutId) {
      clearTimeout(fetchTimeoutId);
    }
  }
  return response;
}
