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
import { getGenerativeModel } from '../lib/index';

const fakeVertexAI = {
  app: {
    name: 'DEFAULT',
    options: {
      appId: 'appId',
      projectId: 'my-project',
      apiKey: 'key',
    },
  },
  location: 'us-central1',
};
// See emulator setup: packages/vertexai/lib/requests/request.ts
globalThis.RNFB_VERTEXAI_EMULATOR_URL = true;

// It calls firebase functions emulator that mimics responses from VertexAI server
describe('fetch requests()', function () {
  it('should fetch', async function () {
    const model = getGenerativeModel(fakeVertexAI, { model: 'gemini-1.5-flash' });
    const result = await model.generateContent("What is google's mission statement?");
    const text = result.response.text();
    // See vertexAI function emulator for response
    text.should.containEql(
      'Google\'s mission is to "organize the world\'s information and make it universally accessible and useful."',
    );
  });

  it('should fetch stream', async function () {
    const model = getGenerativeModel(fakeVertexAI, { model: 'gemini-1.5-flash' });
    // See vertexAI function emulator for response
    const poem = [
      'The wind whispers secrets through the trees,',
      'Rustling leaves in a gentle breeze.',
      'Sunlight dances on the grass,',
      'A fleeting moment, sure to pass.',
      'Birdsong fills the air so bright,',
      'A symphony of pure delight.',
      'Time stands still, a peaceful pause,',
      "In nature's beauty, no flaws.",
    ];
    const result = await model.generateContentStream('Write me a short poem');

    const text = [];
    for await (const chunk of result.stream) {
      const chunkText = chunk.text();
      text.push(chunkText);
    }
    text.should.deepEqual(poem);
  });
});
