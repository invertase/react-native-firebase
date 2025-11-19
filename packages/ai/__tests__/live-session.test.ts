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

import { describe, expect, it, beforeEach, jest } from '@jest/globals';
import {
  FunctionResponse,
  LiveResponseType,
  LiveServerContent,
  LiveServerToolCall,
  LiveServerToolCallCancellation,
} from '../lib/types';
import { LiveSession } from '../lib/methods/live-session';
import { WebSocketHandler } from '../lib/websocket';
import { AIError } from '../lib/errors';
import { logger } from '../lib/logger';
import { ReadableStream } from 'web-streams-polyfill';

class MockWebSocketHandler implements WebSocketHandler {
  connect = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
  send = jest.fn<(data: string | ArrayBuffer) => void>();
  close = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);

  private messageQueue: unknown[] = [];
  private streamClosed = false;
  private listenerPromiseResolver: (() => void) | null = null;

  async *listen(): AsyncGenerator<unknown> {
    while (!this.streamClosed) {
      if (this.messageQueue.length > 0) {
        yield this.messageQueue.shift();
      } else {
        // Wait until a new message is pushed or the stream is ended.
        await new Promise<void>(resolve => {
          this.listenerPromiseResolver = resolve;
        });
      }
    }
  }

  simulateServerMessage(message: object): void {
    this.messageQueue.push(message);
    if (this.listenerPromiseResolver) {
      // listener is waiting for our message
      this.listenerPromiseResolver();
      this.listenerPromiseResolver = null;
    }
  }

  endStream(): void {
    this.streamClosed = true;
    if (this.listenerPromiseResolver) {
      this.listenerPromiseResolver();
      this.listenerPromiseResolver = null;
    }
  }
}

describe('LiveSession', function () {
  let mockHandler: MockWebSocketHandler;
  let session: LiveSession;
  let serverMessagesGenerator: AsyncGenerator<unknown>;

  beforeEach(function () {
    mockHandler = new MockWebSocketHandler();
    serverMessagesGenerator = mockHandler.listen();
    session = new LiveSession(mockHandler, serverMessagesGenerator);
  });

  describe('send()', function () {
    it('should format and send a valid text message', async function () {
      await session.send('Hello there');
      expect(mockHandler.send).toHaveBeenCalledTimes(1);
      const sentData = JSON.parse((mockHandler.send as jest.Mock).mock.calls[0]![0] as string);
      expect(sentData).toEqual({
        clientContent: {
          turns: [{ role: 'user', parts: [{ text: 'Hello there' }] }],
          turnComplete: true,
        },
      });
    });

    it('should format and send a message with an array of Parts', async function () {
      const parts = [
        { text: 'Part 1' },
        { inlineData: { mimeType: 'image/png', data: 'base64==' } },
      ];
      await session.send(parts);
      expect(mockHandler.send).toHaveBeenCalledTimes(1);
      const sentData = JSON.parse((mockHandler.send as jest.Mock).mock.calls[0]![0] as string);
      expect(sentData.clientContent.turns[0].parts).toEqual(parts);
    });
  });

  describe('sendTextRealtime()', function () {
    it('should send a correctly formatted realtimeInput message', async function () {
      const text = 'foo';
      await session.sendTextRealtime(text);
      expect(mockHandler.send).toHaveBeenCalledTimes(1);
      const sentData = JSON.parse((mockHandler.send as jest.Mock).mock.calls[0]![0] as string);
      expect(sentData).toEqual({
        realtimeInput: { text },
      });
    });
  });

  describe('sendAudioRealtime()', function () {
    it('should send a correctly formatted realtimeInput message', async function () {
      const blob = { data: 'abcdef', mimeType: 'audio/pcm' };
      await session.sendAudioRealtime(blob);
      expect(mockHandler.send).toHaveBeenCalledTimes(1);
      const sentData = JSON.parse((mockHandler.send as jest.Mock).mock.calls[0]![0] as string);
      expect(sentData).toEqual({
        realtimeInput: { audio: blob },
      });
    });
  });

  describe('sendVideoRealtime()', function () {
    it('should send a correctly formatted realtimeInput message', async function () {
      const blob = { data: 'abcdef', mimeType: 'image/jpeg' };
      await session.sendVideoRealtime(blob);
      expect(mockHandler.send).toHaveBeenCalledTimes(1);
      const sentData = JSON.parse((mockHandler.send as jest.Mock).mock.calls[0]![0] as string);
      expect(sentData).toEqual({
        realtimeInput: { video: blob },
      });
    });
  });

  describe('sendMediaChunks()', function () {
    it('should send a correctly formatted realtimeInput message', async function () {
      const chunks = [{ data: 'base64', mimeType: 'audio/webm' }];
      await session.sendMediaChunks(chunks);
      expect(mockHandler.send).toHaveBeenCalledTimes(1);
      const sentData = JSON.parse((mockHandler.send as jest.Mock).mock.calls[0]![0] as string);
      expect(sentData).toEqual({
        realtimeInput: { mediaChunks: chunks },
      });
    });
  });

  describe('sendMediaStream()', function () {
    it('should send multiple chunks from a stream', async function () {
      const stream = new ReadableStream({
        start(controller) {
          controller.enqueue({ data: 'chunk1', mimeType: 'audio/webm' });
          controller.enqueue({ data: 'chunk2', mimeType: 'audio/webm' });
          controller.close();
        },
      });

      await session.sendMediaStream(stream);

      expect(mockHandler.send).toHaveBeenCalledTimes(2);
      const firstCall = JSON.parse((mockHandler.send as jest.Mock).mock.calls[0]![0] as string);
      const secondCall = JSON.parse((mockHandler.send as jest.Mock).mock.calls[1]![0] as string);
      expect(firstCall.realtimeInput.mediaChunks[0].data).toBe('chunk1');
      expect(secondCall.realtimeInput.mediaChunks[0].data).toBe('chunk2');
    });

    it('should re-throw an AIError if the stream reader throws', async function () {
      const errorStream = new ReadableStream({
        pull(controller) {
          controller.error(new Error('Stream failed!'));
        },
      });
      const promise = session.sendMediaStream(errorStream);
      await expect(promise).rejects.toThrow(AIError);
      await expect(promise).rejects.toThrow(/Stream failed!/);
    });
  });

  describe('sendFunctionResponses()', function () {
    it('should send all function responses', async function () {
      const functionResponses: FunctionResponse[] = [
        {
          id: 'function-call-1',
          name: 'function-name',
          response: {
            result: 'foo',
          },
        },
        {
          id: 'function-call-2',
          name: 'function-name-2',
          response: {
            result: 'bar',
          },
        },
      ];
      await session.sendFunctionResponses(functionResponses);
      expect(mockHandler.send).toHaveBeenCalledTimes(1);
      const sentData = JSON.parse((mockHandler.send as jest.Mock).mock.calls[0]![0] as string);
      expect(sentData).toEqual({
        toolResponse: {
          functionResponses,
        },
      });
    });
  });

  describe('receive()', function () {
    it('should correctly parse and transform all server message types', async function () {
      const receivePromise = (async () => {
        const responses = [];
        for await (const response of session.receive()) {
          responses.push(response);
        }
        return responses;
      })();

      mockHandler.simulateServerMessage({
        serverContent: { modelTurn: { parts: [{ text: 'response 1' }] } },
      });
      mockHandler.simulateServerMessage({
        toolCall: { functionCalls: [{ name: 'test_func' }] },
      });
      mockHandler.simulateServerMessage({
        toolCallCancellation: { functionIds: ['123'] },
      });
      mockHandler.simulateServerMessage({
        serverContent: { turnComplete: true },
      });
      await new Promise<void>(r => setTimeout(() => r(), 10)); // Wait for the listener to process messages
      mockHandler.endStream();

      const responses = await receivePromise;
      expect(responses).toHaveLength(4);
      expect(responses[0]).toEqual({
        type: LiveResponseType.SERVER_CONTENT,
        modelTurn: { parts: [{ text: 'response 1' }] },
      } as LiveServerContent);
      expect(responses[1]).toEqual({
        type: LiveResponseType.TOOL_CALL,
        functionCalls: [{ name: 'test_func' }],
      } as LiveServerToolCall);
      expect(responses[2]).toEqual({
        type: LiveResponseType.TOOL_CALL_CANCELLATION,
        functionIds: ['123'],
      } as LiveServerToolCallCancellation);
    });

    it('should log a warning and skip messages that are not objects', async function () {
      const loggerSpy = jest.spyOn(logger, 'warn');
      const receivePromise = (async () => {
        const responses = [];
        for await (const response of session.receive()) {
          responses.push(response);
        }
        return responses;
      })();

      mockHandler.simulateServerMessage(null as unknown as object);
      mockHandler.simulateServerMessage('not an object' as unknown as object);
      await new Promise<void>(r => setTimeout(() => r(), 10)); // Wait for the listener to process messages
      mockHandler.endStream();

      const responses = await receivePromise;
      expect(responses).toHaveLength(0);
      expect(loggerSpy).toHaveBeenCalledTimes(2);
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Received an invalid message'),
      );

      loggerSpy.mockRestore();
    });

    it('should log a warning and skip objects of unknown type', async function () {
      const loggerSpy = jest.spyOn(logger, 'warn');
      const receivePromise = (async () => {
        const responses = [];
        for await (const response of session.receive()) {
          responses.push(response);
        }
        return responses;
      })();

      mockHandler.simulateServerMessage({ unknownType: { data: 'test' } });
      await new Promise<void>(r => setTimeout(() => r(), 10)); // Wait for the listener to process messages
      mockHandler.endStream();

      const responses = await receivePromise;
      expect(responses).toHaveLength(0);
      expect(loggerSpy).toHaveBeenCalledTimes(1);
      expect(loggerSpy).toHaveBeenCalledWith(
        expect.stringContaining('Received an unknown message type'),
      );

      loggerSpy.mockRestore();
    });
  });

  describe('close()', function () {
    it('should call the handler, set the isClosed flag, and be idempotent', async function () {
      expect(session.isClosed).toBe(false);
      await session.close();
      expect(mockHandler.close).toHaveBeenCalledTimes(1);
      expect(session.isClosed).toBe(true);

      // Call again to test idempotency
      await session.close();
      expect(mockHandler.close).toHaveBeenCalledTimes(1); // Should not be called again
    });

    it('should terminate an active receive() loop', async function () {
      const received: unknown[] = [];
      const receivePromise = (async () => {
        for await (const msg of session.receive()) {
          received.push(msg);
        }
      })();

      mockHandler.simulateServerMessage({
        serverContent: { modelTurn: { parts: [{ text: 'one' }] } },
      });
      // Allow the first message to be processed
      await new Promise(r => setTimeout(r, 10));
      expect(received).toHaveLength(1);

      await session.close();
      mockHandler.endStream(); // End the mock stream

      await receivePromise; // This should now resolve

      // No more messages should have been processed
      expect(received).toHaveLength(1);
    });

    it('methods should throw after session is closed', async function () {
      await session.close();
      await expect(session.send('test')).rejects.toThrow(AIError);
      await expect(session.send('test')).rejects.toThrow(/closed/);
      await expect(session.sendMediaChunks([])).rejects.toThrow(AIError);
      await expect(session.sendMediaChunks([])).rejects.toThrow(/closed/);
      const generator = session.receive();
      const nextPromise = generator.next();
      await expect(nextPromise).rejects.toThrow(AIError);
      await expect(nextPromise).rejects.toThrow(/closed/);
    });
  });
});
