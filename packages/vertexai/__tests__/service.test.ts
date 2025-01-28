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
import { describe, expect, it } from '@jest/globals';
import { ReactNativeFirebase } from '@react-native-firebase/app';
import { DEFAULT_LOCATION } from '../lib/constants';
import { VertexAIService } from '../lib/service';

const fakeApp = {
  name: 'DEFAULT',
  options: {
    apiKey: 'key',
    projectId: 'my-project',
  },
} as ReactNativeFirebase.FirebaseApp;

describe('VertexAIService', () => {
  it('uses default location if not specified', () => {
    const vertexAI = new VertexAIService(fakeApp);
    expect(vertexAI.location).toBe(DEFAULT_LOCATION);
  });

  it('uses custom location if specified', () => {
    const vertexAI = new VertexAIService(
      fakeApp,
      /* authProvider */ undefined,
      /* appCheckProvider */ undefined,
      { location: 'somewhere' },
    );
    expect(vertexAI.location).toBe('somewhere');
  });
});
