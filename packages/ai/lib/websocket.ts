/**
 * @license
 * Copyright 2025 Google LLC
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

import { AIError } from './errors';
import { logger } from './logger';
import { AIErrorCode } from './types';

/**
 * A standardized interface for interacting with a WebSocket connection.
 * This abstraction allows the SDK to use the appropriate WebSocket implementation
 * for the current JS environment (Browser vs. Node) without
 * changing the core logic of the `LiveSession`.
 * @internal
 */

export interface WebSocketHandler {
  /**
   * Establishes a connection to the given URL.
   *
   * @param url The WebSocket URL (e.g., wss://...).
   * @returns A promise that resolves on successful connection or rejects on failure.
   */
  connect(url: string): Promise<void>;

  /**
   * Sends data over the WebSocket.
   *
   * @param data The string or binary data to send.
   */
  send(data: string | ArrayBuffer): void;

  /**
   * Returns an async generator that yields parsed JSON objects from the server.
   * The yielded type is `unknown` because the handler cannot guarantee the shape of the data.
   * The consumer is responsible for type validation.
   * The generator terminates when the connection is closed.
   *
   * @returns A generator that allows consumers to pull messages using a `for await...of` loop.
   */
  listen(): AsyncGenerator<unknown>;

  /**
   * Closes the WebSocket connection.
   *
   * @param code - A numeric status code explaining why the connection is closing.
   * @param reason - A human-readable string explaining why the connection is closing.
   */
  close(code?: number, reason?: string): Promise<void>;
}

/**
 * A wrapper for the native `WebSocket` available in both Browsers and Node >= 22.
 *
 * @internal
 */
export class WebSocketHandlerImpl implements WebSocketHandler {
  private ws?: WebSocket;

  constructor() {
    if (typeof WebSocket === 'undefined') {
      throw new AIError(
        AIErrorCode.UNSUPPORTED,
        'The WebSocket API is not available in this environment. ' +
          'The "Live" feature is not supported here. It is supported in ' +
          'modern browser windows, Web Workers with WebSocket support, and Node >= 22.',
      );
    }
  }

  connect(url: string): Promise<void> {
    return new Promise((resolve, reject) => {
      this.ws = new WebSocket(url);
      // Note: binaryType is not supported in React Native's WebSocket implementation.
      // We handle ArrayBuffer, Blob, and string data types in the message listener instead.

      const openHandler = (): void => {
        resolve();
        this.ws?.removeEventListener('open', openHandler);
      };

      const errorHandler = (): void => {
        reject(new AIError(AIErrorCode.FETCH_ERROR, `Error event raised on WebSocket`));
        this.ws?.removeEventListener('error', errorHandler);
      };

      this.ws.addEventListener('open', openHandler);
      this.ws.addEventListener('error', errorHandler);

      this.ws.addEventListener('close', (event: any) => {
        if (event?.reason) {
          logger.warn(`WebSocket connection closed by server. Reason: '${event.reason}'`);
        }
      });
    });
  }

  send(data: string | ArrayBuffer): void {
    if (!this.ws || this.ws.readyState !== WebSocket.OPEN) {
      throw new AIError(AIErrorCode.REQUEST_ERROR, 'WebSocket is not open.');
    }
    this.ws.send(data);
  }

  async *listen(): AsyncGenerator<unknown> {
    if (!this.ws) {
      throw new AIError(AIErrorCode.REQUEST_ERROR, 'WebSocket is not connected.');
    }

    const messageQueue: unknown[] = [];
    const errorQueue: Error[] = [];
    let resolvePromise: (() => void) | null = null;
    let isClosed = false;

    const messageListener = async (event: any): Promise<void> => {
      let data: string;

      // Handle different data types across environments
      if (event.data instanceof Blob) {
        // Browser environment
        data = await event.data.text();
      } else if (event.data instanceof ArrayBuffer) {
        // React Native environment - binary data comes as ArrayBuffer
        const decoder = new TextDecoder('utf-8');
        data = decoder.decode(event.data);
      } else if (typeof event.data === 'string') {
        // String data in all environments
        data = event.data;
      } else {
        errorQueue.push(
          new AIError(
            AIErrorCode.PARSE_FAILED,
            `Failed to parse WebSocket response. Expected data to be a Blob, ArrayBuffer, or string, but was ${typeof event.data}.`,
          ),
        );
        if (resolvePromise) {
          resolvePromise();
          resolvePromise = null;
        }
        return;
      }

      try {
        const obj = JSON.parse(data) as unknown;
        messageQueue.push(obj);
      } catch (e) {
        const err = e as Error;
        errorQueue.push(
          new AIError(
            AIErrorCode.PARSE_FAILED,
            `Error parsing WebSocket message to JSON: ${err.message}`,
          ),
        );
      }

      if (resolvePromise) {
        resolvePromise();
        resolvePromise = null;
      }
    };

    const errorListener = (): void => {
      errorQueue.push(new AIError(AIErrorCode.FETCH_ERROR, 'WebSocket connection error.'));
      if (resolvePromise) {
        resolvePromise();
        resolvePromise = null;
      }
    };

    const closeListener = (event: any): void => {
      if (event?.reason) {
        logger.warn(`WebSocket connection closed by the server with reason: ${event.reason}`);
      }
      isClosed = true;
      if (resolvePromise) {
        resolvePromise();
        resolvePromise = null;
      }
      // Clean up listeners to prevent memory leaks
      this.ws?.removeEventListener('message', messageListener as any);
      this.ws?.removeEventListener('close', closeListener as any);
      this.ws?.removeEventListener('error', errorListener as any);
    };

    this.ws.addEventListener('message', messageListener as any);
    this.ws.addEventListener('close', closeListener as any);
    this.ws.addEventListener('error', errorListener as any);

    while (!isClosed) {
      if (errorQueue.length > 0) {
        const error = errorQueue.shift()!;
        throw error;
      }
      if (messageQueue.length > 0) {
        yield messageQueue.shift()!;
      } else {
        await new Promise<void>(resolve => {
          resolvePromise = resolve;
        });
      }
    }

    // If the loop terminated because isClosed is true, check for any final errors
    if (errorQueue.length > 0) {
      const error = errorQueue.shift()!;
      throw error;
    }
  }

  close(code?: number, reason?: string): Promise<void> {
    return new Promise(resolve => {
      if (!this.ws) {
        return resolve();
      }

      const closeHandler = (): void => {
        resolve();
        this.ws?.removeEventListener('close', closeHandler as any);
      };

      this.ws.addEventListener('close', closeHandler as any);
      // Calling 'close' during these states results in an error.
      if (this.ws.readyState === WebSocket.CLOSED || this.ws.readyState === WebSocket.CONNECTING) {
        return resolve();
      }

      if (this.ws.readyState !== WebSocket.CLOSING) {
        this.ws.close(code, reason);
      }
    });
  }
}
