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
import { type ReactNativeFirebase } from '@react-native-firebase/app';
import { AI } from '../lib/public-types';
import { LiveSession } from '../lib/methods/live-session';
import { WebSocketHandler } from '../lib/websocket';
import { GoogleAIBackend } from '../lib/backend';
import { LiveGenerativeModel } from '../lib/models/live-generative-model';
import { AIError } from '../lib/errors';

// A controllable mock for the WebSocketHandler interface
class MockWebSocketHandler implements WebSocketHandler {
  connect = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);
  send = jest.fn<(data: string | ArrayBuffer) => void>();
  close = jest.fn<() => Promise<void>>().mockResolvedValue(undefined);

  private serverMessages: unknown[] = [];
  private generatorController: {
    resolve: () => void;
    promise: Promise<void>;
  } | null = null;

  async *listen(): AsyncGenerator<unknown> {
    while (true) {
      if (this.serverMessages.length > 0) {
        yield this.serverMessages.shift();
      } else {
        const promise = new Promise<void>(resolve => {
          this.generatorController = { resolve, promise: null! };
        });
        await promise;
      }
    }
  }

  // Test method to simulate a message from the server
  simulateServerMessage(message: object): void {
    this.serverMessages.push(message);
    if (this.generatorController) {
      this.generatorController.resolve();
      this.generatorController = null;
    }
  }
}

const fakeAI: AI = {
  app: {
    name: 'DEFAULT',
    automaticDataCollectionEnabled: true,
    options: {
      apiKey: 'key',
      projectId: 'my-project',
      appId: 'my-appid',
    },
  } as ReactNativeFirebase.FirebaseApp,
  backend: new GoogleAIBackend(),
  location: 'us-central1',
};

describe('LiveGenerativeModel', function () {
  let mockHandler: MockWebSocketHandler;

  beforeEach(function () {
    mockHandler = new MockWebSocketHandler();
    jest.useFakeTimers();
  });

  afterEach(function () {
    jest.restoreAllMocks();
    jest.useRealTimers();
  });

  it('connect() should call handler.connect and send setup message', async function () {
    const model = new LiveGenerativeModel(fakeAI, { model: 'my-model' }, mockHandler);
    const connectPromise = model.connect();

    // Ensure connect was called before simulating server response
    expect(mockHandler.connect).toHaveBeenCalledTimes(1);

    // Wait for the setup message to be sent
    await jest.runAllTimersAsync();

    expect(mockHandler.send).toHaveBeenCalledTimes(1);
    const setupMessage = JSON.parse((mockHandler.send as jest.Mock).mock.calls[0]![0] as string);
    expect(setupMessage.setup.model).toContain('my-model');

    // Simulate successful handshake and resolve the promise
    mockHandler.simulateServerMessage({ setupComplete: true });
    const session = await connectPromise;
    expect(session).toBeInstanceOf(LiveSession);
    await session.close();
  });

  it('connect() should throw if handshake fails', async function () {
    const model = new LiveGenerativeModel(fakeAI, { model: 'my-model' }, mockHandler);
    const connectPromise = model.connect();

    // Wait for setup message
    await jest.runAllTimersAsync();

    // Simulate a failed handshake
    mockHandler.simulateServerMessage({ error: 'handshake failed' });
    await expect(connectPromise).rejects.toThrow(AIError);
    await expect(connectPromise).rejects.toThrow(/Server connection handshake failed/);
  });

  it('connect() should pass through connection errors', async function () {
    (mockHandler.connect as jest.Mock<() => Promise<void>>).mockRejectedValue(
      new Error('Connection refused'),
    );
    const model = new LiveGenerativeModel(fakeAI, { model: 'my-model' }, mockHandler);
    await expect(model.connect()).rejects.toThrow('Connection refused');
  });

  it('connect() should pass through setup parameters correctly', async function () {
    const model = new LiveGenerativeModel(
      fakeAI,
      {
        model: 'gemini-pro',
        generationConfig: { temperature: 0.8 },
        systemInstruction: { role: 'system', parts: [{ text: 'Be a pirate' }] },
      },
      mockHandler,
    );
    const connectPromise = model.connect();

    // Wait for setup message
    await jest.runAllTimersAsync();

    const sentData = JSON.parse((mockHandler.send as jest.Mock).mock.calls[0]![0] as string);
    expect(sentData.setup.generationConfig).toEqual({ temperature: 0.8 });
    expect(sentData.setup.systemInstruction.parts[0].text).toBe('Be a pirate');
    mockHandler.simulateServerMessage({ setupComplete: true });
    await connectPromise;
  });

  it('connect() should deconstruct generationConfig to send transcription configs in top level setup', async function () {
    const model = new LiveGenerativeModel(
      fakeAI,
      {
        model: 'gemini-pro',
        generationConfig: {
          temperature: 0.8,
          inputAudioTranscription: {},
          outputAudioTranscription: {},
        },
        systemInstruction: { role: 'system', parts: [{ text: 'Be a pirate' }] },
      },
      mockHandler,
    );
    const connectPromise = model.connect();

    // Wait for setup message
    await jest.runAllTimersAsync();

    const sentData = JSON.parse((mockHandler.send as jest.Mock).mock.calls[0]![0] as string);
    // inputAudioTranscription and outputAudioTranscription should be at the top-level setup message,
    // rather than in the generationConfig.
    expect(sentData.setup.generationConfig).toEqual({ temperature: 0.8 });
    expect(sentData.setup.inputAudioTranscription).toEqual({});
    expect(sentData.setup.outputAudioTranscription).toEqual({});
    expect(sentData.setup.systemInstruction.parts[0].text).toBe('Be a pirate');
    mockHandler.simulateServerMessage({ setupComplete: true });
    await connectPromise;
  });
});
