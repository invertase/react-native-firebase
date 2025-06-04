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
import { ReadableStream } from 'web-streams-polyfill';
import { mocksLookup } from './mocks-lookup';

export enum BackendName {
  VertexAI = 'vertexai',
  GoogleAI = 'googleai',
}

/**
 * Mock native Response.body
 * Streams contents of json file in 20 character chunks
 */
export function getChunkedStream(input: string, chunkLength = 20): ReadableStream<Uint8Array> {
  const encoder = new TextEncoder();
  let currentChunkStart = 0;

  const stream = new ReadableStream<Uint8Array>({
    start(controller) {
      while (currentChunkStart < input.length) {
        const substring = input.slice(currentChunkStart, currentChunkStart + chunkLength);
        currentChunkStart += chunkLength;
        const chunk = encoder.encode(substring);
        controller.enqueue(chunk);
      }
      controller.close();
    },
  });

  return stream;
}
export function getMockResponseStreaming(
  backendName: BackendName,
  filename: string,
  chunkLength: number = 20,
): Partial<Response> {
  // @ts-ignore
  const backendMocksLookup: Record<string, string> = mocksLookup[backendName];
  if (!backendMocksLookup[filename]) {
    throw Error(`${backendName} mock response file '${filename}' not found.`);
  }
  const fullText = backendMocksLookup[filename] as string;

  return {
    // Really tangled typescript error here from our transitive dependencies.
    // Ignoring it now, but uncomment and run `yarn lerna:prepare` in top-level
    // of the repo to see if you get it or if it has gone away.
    //
    // last stack frame of the error is from node_modules/undici-types/fetch.d.ts
    //
    // > Property 'value' is optional in type 'ReadableStreamReadDoneResult<T>' but required in type '{ done: true; value: T | undefined; }'.
    //
    // @ts-ignore
    body: getChunkedStream(fullText!, chunkLength),
  };
}

export function getMockResponse(backendName: BackendName, filename: string): Partial<Response> {
  // @ts-ignore
  const backendMocksLookup: Record<string, string> = mocksLookup[backendName];
  if (!backendMocksLookup[filename]) {
    throw Error(`${backendName} mock response file '${filename}' not found.`);
  }
  const fullText = backendMocksLookup[filename] as string;

  return {
    ok: true,
    json: () => Promise.resolve(JSON.parse(fullText)),
  };
}
