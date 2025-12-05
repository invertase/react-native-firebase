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

import { describe, expect, it, beforeEach, afterEach, jest } from '@jest/globals';
import { WebSocketHandlerImpl } from '../lib/websocket';
import { AIError } from '../lib/errors';

class MockWebSocket {
  static CONNECTING = 0;
  static OPEN = 1;
  static CLOSING = 2;
  static CLOSED = 3;

  readyState: number = MockWebSocket.CONNECTING;
  sentMessages: Array<string | ArrayBuffer> = [];
  url: string;
  binaryType: string = 'blob';
  private listeners: Map<string, Set<(event: any) => void>> = new Map();

  constructor(url: string) {
    this.url = url;
  }

  send(data: string | ArrayBuffer): void {
    if (this.readyState !== MockWebSocket.OPEN) {
      throw new Error('WebSocket is not in OPEN state');
    }
    this.sentMessages.push(data);
  }

  close(): void {
    if (this.readyState === MockWebSocket.CLOSED || this.readyState === MockWebSocket.CLOSING) {
      return;
    }
    this.readyState = MockWebSocket.CLOSING;
    setTimeout(() => {
      this.readyState = MockWebSocket.CLOSED;
      this.dispatchEvent(new Event('close'));
    }, 10);
  }

  addEventListener(type: string, listener: (event: any) => void): void {
    if (!this.listeners.has(type)) {
      this.listeners.set(type, new Set());
    }
    this.listeners.get(type)!.add(listener);
  }

  removeEventListener(type: string, listener: (event: any) => void): void {
    this.listeners.get(type)?.delete(listener);
  }

  dispatchEvent(event: Event): void {
    this.listeners.get(event.type)?.forEach(listener => listener(event));
  }

  triggerOpen(): void {
    this.readyState = MockWebSocket.OPEN;
    this.dispatchEvent(new Event('open'));
  }

  triggerMessage(data: unknown): void {
    const event = new Event('message');
    (event as any).data = data;
    this.dispatchEvent(event);
  }

  triggerError(): void {
    this.dispatchEvent(new Event('error'));
  }
}

describe('WebSocketHandlerImpl', function () {
  let handler: WebSocketHandlerImpl;
  let mockWebSocket: MockWebSocket;

  beforeEach(function () {
    // @ts-ignore - Mock WebSocket in global scope
    global.WebSocket = jest.fn((url: string) => {
      mockWebSocket = new MockWebSocket(url);
      return mockWebSocket as unknown as WebSocket;
    }) as unknown as typeof WebSocket;

    // Set WebSocket constants on the global mock
    // @ts-ignore
    global.WebSocket.CONNECTING = 0;
    // @ts-ignore
    global.WebSocket.OPEN = 1;
    // @ts-ignore
    global.WebSocket.CLOSING = 2;
    // @ts-ignore
    global.WebSocket.CLOSED = 3;

    jest.useFakeTimers();
    handler = new WebSocketHandlerImpl();
  });

  afterEach(function () {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  describe('connect()', function () {
    it('should resolve on open event', async function () {
      const connectPromise = handler.connect('ws://test-url');
      expect(global.WebSocket).toHaveBeenCalledWith('ws://test-url');

      await jest.advanceTimersByTimeAsync(1);
      mockWebSocket.triggerOpen();

      await expect(connectPromise).resolves.toBeUndefined();
    });

    it('should reject on error event', async function () {
      const connectPromise = handler.connect('ws://test-url');
      await jest.advanceTimersByTimeAsync(1);
      mockWebSocket.triggerError();

      await expect(connectPromise).rejects.toThrow(AIError);
      await expect(connectPromise).rejects.toThrow(/Error event raised on WebSocket/);
    });
  });

  describe('listen()', function () {
    beforeEach(async function () {
      const connectPromise = handler.connect('ws://test');
      mockWebSocket.triggerOpen();
      await connectPromise;
    });

    it('should yield multiple messages as they arrive', async function () {
      const generator = handler.listen();

      const received: unknown[] = [];
      const listenPromise = (async () => {
        for await (const msg of generator) {
          received.push(msg);
        }
      })();

      // Use advanceTimersByTimeAsync to allow the consumer to start listening
      await jest.advanceTimersByTimeAsync(1);
      mockWebSocket.triggerMessage(new Blob([JSON.stringify({ foo: 1 })]));

      await jest.advanceTimersByTimeAsync(10);
      mockWebSocket.triggerMessage(new Blob([JSON.stringify({ foo: 2 })]));

      await jest.advanceTimersByTimeAsync(5);
      mockWebSocket.close();
      await jest.runAllTimersAsync(); // Let timers finish

      await listenPromise; // Wait for the consumer to finish

      expect(received).toEqual([{ foo: 1 }, { foo: 2 }]);
    });

    it('should buffer messages that arrive before the consumer calls .next()', async function () {
      const generator = handler.listen();

      // Create a promise that will consume the generator in a separate async context
      const received: unknown[] = [];
      const consumptionPromise = (async () => {
        for await (const message of generator) {
          received.push(message);
        }
      })();

      await jest.advanceTimersByTimeAsync(1);

      mockWebSocket.triggerMessage(new Blob([JSON.stringify({ foo: 1 })]));
      mockWebSocket.triggerMessage(new Blob([JSON.stringify({ foo: 2 })]));

      await jest.advanceTimersByTimeAsync(1);
      mockWebSocket.close();
      await jest.runAllTimersAsync();

      await consumptionPromise;

      expect(received).toEqual([{ foo: 1 }, { foo: 2 }]);
    });
  });

  describe('close()', function () {
    it('should be idempotent and not throw if called multiple times', async function () {
      const connectPromise = handler.connect('ws://test');
      mockWebSocket.triggerOpen();
      await connectPromise;

      const closePromise1 = handler.close();
      await jest.runAllTimersAsync();
      await closePromise1;

      await expect(handler.close()).resolves.toBeUndefined();
    });

    it('should wait for the onclose event before resolving', async function () {
      const connectPromise = handler.connect('ws://test');
      mockWebSocket.triggerOpen();
      await connectPromise;

      let closed = false;
      const closePromise = handler.close().then(() => {
        closed = true;
      });

      // The promise should not have resolved yet
      await jest.advanceTimersByTimeAsync(5);
      expect(closed).toBe(false);

      // Now, let the mock's setTimeout for closing run, which triggers onclose
      await jest.advanceTimersByTimeAsync(10);

      await expect(closePromise).resolves.toBeUndefined();
      expect(closed).toBe(true);
    });
  });

  describe('Interaction between listen() and close()', function () {
    it('should allow close() to take precedence and resolve correctly, while also terminating the listener', async function () {
      const connectPromise = handler.connect('ws://test');
      mockWebSocket.triggerOpen();
      await connectPromise;

      const generator = handler.listen();
      const listenPromise = (async () => {
        for await (const _ of generator) {
        }
      })();

      const closePromise = handler.close();

      await jest.runAllTimersAsync();

      await expect(closePromise).resolves.toBeUndefined();
      await expect(listenPromise).resolves.toBeUndefined();

      expect(mockWebSocket.readyState).toBe(MockWebSocket.CLOSED);
    });
  });
});
