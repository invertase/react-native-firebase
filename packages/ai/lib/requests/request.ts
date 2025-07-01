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
import { Platform } from 'react-native';
import { AIErrorCode, ErrorDetails, RequestOptions } from '../types';
import { AIError } from '../errors';
import { ApiSettings } from '../types/internal';
import {
  DEFAULT_API_VERSION,
  DEFAULT_BASE_URL,
  DEFAULT_FETCH_TIMEOUT_MS,
  LANGUAGE_TAG,
  PACKAGE_VERSION,
} from '../constants';
import { logger } from '../logger';
import { GoogleAIBackend, VertexAIBackend } from '../backend';

export enum Task {
  GENERATE_CONTENT = 'generateContent',
  STREAM_GENERATE_CONTENT = 'streamGenerateContent',
  COUNT_TOKENS = 'countTokens',
  PREDICT = 'predict',
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
    // @ts-ignore
    const isTestEnvironment = globalThis.RNFB_VERTEXAI_EMULATOR_URL;
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

    // Manually construct URL to avoid React Native URL API issues
    let baseUrl = this.baseUrl;
    // Remove trailing slash if present
    if (baseUrl.endsWith('/')) {
      baseUrl = baseUrl.slice(0, -1);
    }

    const pathname = `/${this.apiVersion}/${this.modelPath}:${this.task}`;
    const queryString = this.queryParams;

    return `${baseUrl}${pathname}${queryString ? `?${queryString}` : ''}`;
  }

  private get baseUrl(): string {
    return this.requestOptions?.baseUrl || DEFAULT_BASE_URL;
  }

  private get apiVersion(): string {
    return DEFAULT_API_VERSION;
  }

  private get modelPath(): string {
    if (this.apiSettings.backend instanceof GoogleAIBackend) {
      return `projects/${this.apiSettings.project}/${this.model}`;
    } else if (this.apiSettings.backend instanceof VertexAIBackend) {
      return `projects/${this.apiSettings.project}/locations/${this.apiSettings.backend.location}/${this.model}`;
    } else {
      throw new AIError(
        AIErrorCode.ERROR,
        `Invalid backend: ${JSON.stringify(this.apiSettings.backend)}`,
      );
    }
  }

  private get queryParams(): string {
    let params = '';
    if (this.stream) {
      params += 'alt=sse';
    }

    return params;
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
  if (url.apiSettings.automaticDataCollectionEnabled) {
    headers.append('X-Firebase-Appid', url.apiSettings.appId);
  }
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
      } catch (_) {
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
        throw new AIError(
          AIErrorCode.API_NOT_ENABLED,
          `The Firebase AI SDK requires the Firebase AI ` +
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
      throw new AIError(
        AIErrorCode.FETCH_ERROR,
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
      (e as AIError).code !== AIErrorCode.FETCH_ERROR &&
      (e as AIError).code !== AIErrorCode.API_NOT_ENABLED &&
      e instanceof Error
    ) {
      err = new AIError(AIErrorCode.ERROR, `Error fetching from ${url.toString()}: ${e.message}`);
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
