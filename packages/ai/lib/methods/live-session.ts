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
 * See the License for the License for the specific language governing permissions and
 * limitations under the License.
 */

import {
  AIErrorCode,
  FunctionResponse,
  GenerativeContentBlob,
  LiveResponseType,
  LiveServerContent,
  LiveServerGoingAwayNotice,
  LiveServerToolCall,
  LiveServerToolCallCancellation,
  LiveSessionResumptionUpdate,
  Part,
  SessionResumptionConfig,
} from '../types';
import { formatNewContent } from '../requests/request-helpers';
import { AIError } from '../errors';
import { WebSocketHandler, WebSocketHandlerImpl } from '../websocket';
import { logger } from '../logger';
import {
  _LiveClientContent,
  _LiveClientRealtimeInput,
  _LiveClientSetup,
  _LiveClientToolResponse,
} from '../types/live-responses';
import { ReadableStream } from 'web-streams-polyfill';
import { ApiSettings } from '../types/internal';
import { WebSocketUrl } from '../requests/request';

/**
 * Represents an active, real-time, bidirectional conversation with the model.
 *
 * This class should only be instantiated by calling {@link LiveGenerativeModel.connect}.
 *
 * @beta
 */
export class LiveSession {
  /**
   * Indicates whether this Live session is closed.
   *
   * @beta
   */
  isClosed = false;
  /**
   * Indicates whether this Live session is being controlled by an `AudioConversationController`.
   *
   * @beta
   */
  inConversation = false;
  /**
   * Allows external code to await the opening of the WebSocket connection.
   *
   * @beta
   */
  connectionPromise: Promise<void>;

  /**
   * Generator yielding WebSocket messages from the server.
   */
  private _serverMessages: AsyncGenerator<unknown> | null = null;

  /**
   * @internal
   */
  constructor(
    private _setupMessage: _LiveClientSetup,
    private _apiSettings: ApiSettings,
    private _sessionResumption?: SessionResumptionConfig,
    private _webSocketHandler?: WebSocketHandler,
  ) {
    this._webSocketHandler = _webSocketHandler || new WebSocketHandlerImpl();
    this.connectionPromise = this._connectSession(this._sessionResumption);
  }

  /**
   * Initializes connection to the WebSocket. Should be called immediately
   * after instantiation.
   *
   * @internal
   */
  async _connectSession(sessionResumption?: SessionResumptionConfig): Promise<void> {
    const url = new WebSocketUrl(this._apiSettings);
    try {
      await this._webSocketHandler!.connect(url.toString());
      this._serverMessages = this._webSocketHandler!.listen();
      const setupMessage = {
        ...this._setupMessage,
        setup: {
          ...this._setupMessage.setup,
        },
      };
      if (sessionResumption) {
        setupMessage.setup.sessionResumption = sessionResumption;
      }
      this._webSocketHandler!.send(JSON.stringify(setupMessage));

      const firstMessage = (await this._serverMessages.next()).value;
      if (
        !firstMessage ||
        !(typeof firstMessage === 'object') ||
        !('setupComplete' in firstMessage)
      ) {
        await this._webSocketHandler!.close(1011, 'Handshake failure');
        throw new AIError(
          AIErrorCode.RESPONSE_ERROR,
          'Server connection handshake failed. The server did not respond with a setupComplete message.',
        );
      }
      this.isClosed = false;
    } catch (e) {
      this.isClosed = true;
      await this._webSocketHandler!.close();
      throw e;
    }
  }

  /**
   * Resumes an existing live session with the server.
   *
   * This closes the current WebSocket connection and establishes a new one using
   * the same configuration (URI, headers, model, system instruction, tools, etc.)
   * as the original session.
   *
   * @param sessionResumption - The configuration for session resumption, such as the handle to the previous session state to restore.
   * @throws If the session resumption configuration is unsupported.
   *
   * @beta
   */
  async resumeSession(sessionResumption?: SessionResumptionConfig): Promise<void> {
    if (!this._sessionResumption) {
      throw new AIError(
        AIErrorCode.UNSUPPORTED,
        'Cannot resume session: no sessionResumption config provided',
      );
    }
    await this.close();
    await this._connectSession(sessionResumption);
  }

  /**
   * Sends content to the server.
   *
   * @param request - The message to send to the model.
   * @param turnComplete - Indicates if the turn is complete. Defaults to false.
   * @throws If this session has been closed.
   *
   * @beta
   */
  async send(request: string | Array<string | Part>, turnComplete = true): Promise<void> {
    if (this.isClosed) {
      throw new AIError(
        AIErrorCode.REQUEST_ERROR,
        'This LiveSession has been closed and cannot be used.',
      );
    }

    const newContent = formatNewContent(request);

    const message: _LiveClientContent = {
      clientContent: {
        turns: [newContent],
        turnComplete,
      },
    };
    this._webSocketHandler!.send(JSON.stringify(message));
  }

  /**
   * Sends text to the server in realtime.
   *
   * @example
   * ```javascript
   * liveSession.sendTextRealtime("Hello, how are you?");
   * ```
   *
   * @param text - The text data to send.
   * @throws If this session has been closed.
   *
   * @beta
   */
  async sendTextRealtime(text: string): Promise<void> {
    if (this.isClosed) {
      throw new AIError(
        AIErrorCode.REQUEST_ERROR,
        'This LiveSession has been closed and cannot be used.',
      );
    }

    const message: _LiveClientRealtimeInput = {
      realtimeInput: {
        text,
      },
    };
    this._webSocketHandler!.send(JSON.stringify(message));
  }

  /**
   * Sends audio data to the server in realtime.
   *
   * @remarks The server requires that the audio data is base64-encoded 16-bit PCM at 16kHz
   * little-endian.
   *
   * @example
   * ```javascript
   * // const pcmData = ... base64-encoded 16-bit PCM at 16kHz little-endian.
   * const blob = { mimeType: "audio/pcm", data: pcmData };
   * liveSession.sendAudioRealtime(blob);
   * ```
   *
   * @param blob - The base64-encoded PCM data to send to the server in realtime.
   * @throws If this session has been closed.
   *
   * @beta
   */
  async sendAudioRealtime(blob: GenerativeContentBlob): Promise<void> {
    if (this.isClosed) {
      throw new AIError(
        AIErrorCode.REQUEST_ERROR,
        'This LiveSession has been closed and cannot be used.',
      );
    }

    const message: _LiveClientRealtimeInput = {
      realtimeInput: {
        audio: blob,
      },
    };
    this._webSocketHandler!.send(JSON.stringify(message));
  }

  /**
   * Sends video data to the server in realtime.
   *
   * @remarks The server requires that the video is sent as individual video frames at 1 FPS. It
   * is recommended to set `mimeType` to `image/jpeg`.
   *
   * @example
   * ```javascript
   * // const videoFrame = ... base64-encoded JPEG data
   * const blob = { mimeType: "image/jpeg", data: videoFrame };
   * liveSession.sendVideoRealtime(blob);
   * ```
   * @param blob - The base64-encoded video data to send to the server in realtime.
   * @throws If this session has been closed.
   *
   * @beta
   */
  async sendVideoRealtime(blob: GenerativeContentBlob): Promise<void> {
    if (this.isClosed) {
      throw new AIError(
        AIErrorCode.REQUEST_ERROR,
        'This LiveSession has been closed and cannot be used.',
      );
    }

    const message: _LiveClientRealtimeInput = {
      realtimeInput: {
        video: blob,
      },
    };
    this._webSocketHandler!.send(JSON.stringify(message));
  }

  /**
   * Sends function responses to the server.
   *
   * @param functionResponses - The function responses to send.
   * @throws If this session has been closed.
   *
   * @beta
   */
  async sendFunctionResponses(functionResponses: FunctionResponse[]): Promise<void> {
    if (this.isClosed) {
      throw new AIError(
        AIErrorCode.REQUEST_ERROR,
        'This LiveSession has been closed and cannot be used.',
      );
    }

    const message: _LiveClientToolResponse = {
      toolResponse: {
        functionResponses,
      },
    };
    this._webSocketHandler!.send(JSON.stringify(message));
  }

  /**
   * Yields messages received from the server.
   * This can only be used by one consumer at a time.
   *
   * @returns An `AsyncGenerator` that yields server messages as they arrive.
   * @throws If the session is already closed, or if we receive a response that we don't support.
   *
   * @beta
   */
  async *receive(): AsyncGenerator<
    | LiveServerContent
    | LiveServerToolCall
    | LiveServerToolCallCancellation
    | LiveServerGoingAwayNotice
    | LiveSessionResumptionUpdate
  > {
    if (this.isClosed) {
      throw new AIError(
        AIErrorCode.SESSION_CLOSED,
        'Cannot read from a Live session that is closed. Try starting a new Live session.',
      );
    }
    if (!this._serverMessages) {
      throw new AIError(
        AIErrorCode.SESSION_CLOSED,
        'Cannot read from a Live session that is not connected.',
      );
    }
    for await (const message of this._serverMessages) {
      if (message && typeof message === 'object') {
        if (LiveResponseType.SERVER_CONTENT in message) {
          yield {
            type: 'serverContent',
            ...(message as { serverContent: Omit<LiveServerContent, 'type'> }).serverContent,
          } as LiveServerContent;
        } else if (LiveResponseType.TOOL_CALL in message) {
          yield {
            type: 'toolCall',
            ...(message as { toolCall: Omit<LiveServerToolCall, 'type'> }).toolCall,
          } as LiveServerToolCall;
        } else if (LiveResponseType.TOOL_CALL_CANCELLATION in message) {
          yield {
            type: 'toolCallCancellation',
            ...(
              message as {
                toolCallCancellation: Omit<LiveServerToolCallCancellation, 'type'>;
              }
            ).toolCallCancellation,
          } as LiveServerToolCallCancellation;
        } else if ('goAway' in message) {
          const notice = (message as { goAway: { timeLeft?: string } }).goAway;
          yield {
            type: LiveResponseType.GOING_AWAY_NOTICE,
            timeLeft: parseDuration(notice.timeLeft),
          } as LiveServerGoingAwayNotice;
        } else if (LiveResponseType.SESSION_RESUMPTION_UPDATE in message) {
          yield {
            type: LiveResponseType.SESSION_RESUMPTION_UPDATE,
            ...(message as { sessionResumptionUpdate: object }).sessionResumptionUpdate,
          } as LiveSessionResumptionUpdate;
        } else {
          logger.warn(
            `Received an unknown message type from the server: ${JSON.stringify(message)}`,
          );
        }
      } else {
        logger.warn(`Received an invalid message from the server: ${JSON.stringify(message)}`);
      }
    }
  }

  /**
   * Closes this session.
   * All methods on this session will throw an error once this resolves.
   *
   * @beta
   */
  async close(): Promise<void> {
    if (!this.isClosed) {
      this.isClosed = true;
      await this._webSocketHandler!.close(1000, 'Client closed session.');
    }
  }

  /**
   * Sends realtime input to the server.
   *
   * @deprecated Use `sendTextRealtime()`, `sendAudioRealtime()`, and `sendVideoRealtime()` instead.
   *
   * @param mediaChunks - The media chunks to send.
   * @throws If this session has been closed.
   *
   * @beta
   */
  async sendMediaChunks(mediaChunks: GenerativeContentBlob[]): Promise<void> {
    if (this.isClosed) {
      throw new AIError(
        AIErrorCode.REQUEST_ERROR,
        'This LiveSession has been closed and cannot be used.',
      );
    }

    // The backend does not support sending more than one mediaChunk in one message.
    // Work around this limitation by sending mediaChunks in separate messages.
    mediaChunks.forEach(mediaChunk => {
      const message: _LiveClientRealtimeInput = {
        realtimeInput: { mediaChunks: [mediaChunk] },
      };
      this._webSocketHandler!.send(JSON.stringify(message));
    });
  }

  /**
   * @deprecated Use `sendTextRealtime()`, `sendAudioRealtime()`, and `sendVideoRealtime()` instead.
   *
   * Sends a stream of {@link GenerativeContentBlob}.
   *
   * @param mediaChunkStream - The stream of {@link GenerativeContentBlob} to send.
   * @throws If this session has been closed.
   *
   * @beta
   */
  async sendMediaStream(mediaChunkStream: ReadableStream<GenerativeContentBlob>): Promise<void> {
    if (this.isClosed) {
      throw new AIError(
        AIErrorCode.REQUEST_ERROR,
        'This LiveSession has been closed and cannot be used.',
      );
    }

    const reader = mediaChunkStream.getReader();
    while (true) {
      try {
        const { done, value } = await reader.read();

        if (done) {
          break;
        } else if (!value) {
          throw new Error('Missing chunk in reader, but reader is not done.');
        }

        await this.sendMediaChunks([value]);
      } catch (e) {
        // Re-throw any errors that occur during stream consumption or sending.
        const message = e instanceof Error ? e.message : 'Error processing media stream.';
        throw new AIError(AIErrorCode.REQUEST_ERROR, message);
      }
    }
  }
}

/**
 * Parses a duration string (e.g. "3.000000001s") into a number of seconds.
 */
function parseDuration(duration?: string): number {
  if (!duration || !duration.endsWith('s')) {
    return 0;
  }
  const val = Number(duration.slice(0, -1));
  return Number.isNaN(val) ? 0 : val;
}
