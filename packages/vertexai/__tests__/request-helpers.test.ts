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

import { expect, use } from 'chai';
import sinonChai from 'sinon-chai';
import { Content } from '../types';
import { formatGenerateContentInput } from './request-helpers';

use(sinonChai);

describe('request formatting methods', () => {
  describe('formatGenerateContentInput', () => {
    it('formats a text string into a request', () => {
      const result = formatGenerateContentInput('some text content');
      expect(result).to.deep.equal({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'some text content' }]
          }
        ]
      });
    });
    it('formats an array of strings into a request', () => {
      const result = formatGenerateContentInput(['txt1', 'txt2']);
      expect(result).to.deep.equal({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'txt1' }, { text: 'txt2' }]
          }
        ]
      });
    });
    it('formats an array of Parts into a request', () => {
      const result = formatGenerateContentInput([
        { text: 'txt1' },
        { text: 'txtB' }
      ]);
      expect(result).to.deep.equal({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'txt1' }, { text: 'txtB' }]
          }
        ]
      });
    });
    it('formats a mixed array into a request', () => {
      const result = formatGenerateContentInput(['txtA', { text: 'txtB' }]);
      expect(result).to.deep.equal({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'txtA' }, { text: 'txtB' }]
          }
        ]
      });
    });
    it('preserves other properties of request', () => {
      const result = formatGenerateContentInput({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'txtA' }]
          }
        ],
        generationConfig: { topK: 100 }
      });
      expect(result).to.deep.equal({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'txtA' }]
          }
        ],
        generationConfig: { topK: 100 }
      });
    });
    it('formats systemInstructions if provided as text', () => {
      const result = formatGenerateContentInput({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'txtA' }]
          }
        ],
        systemInstruction: 'be excited'
      });
      expect(result).to.deep.equal({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'txtA' }]
          }
        ],
        systemInstruction: { role: 'system', parts: [{ text: 'be excited' }] }
      });
    });
    it('formats systemInstructions if provided as Part', () => {
      const result = formatGenerateContentInput({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'txtA' }]
          }
        ],
        systemInstruction: { text: 'be excited' }
      });
      expect(result).to.deep.equal({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'txtA' }]
          }
        ],
        systemInstruction: { role: 'system', parts: [{ text: 'be excited' }] }
      });
    });
    it('formats systemInstructions if provided as Content (no role)', () => {
      const result = formatGenerateContentInput({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'txtA' }]
          }
        ],
        systemInstruction: { parts: [{ text: 'be excited' }] } as Content
      });
      expect(result).to.deep.equal({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'txtA' }]
          }
        ],
        systemInstruction: { role: 'system', parts: [{ text: 'be excited' }] }
      });
    });
    it('passes thru systemInstructions if provided as Content', () => {
      const result = formatGenerateContentInput({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'txtA' }]
          }
        ],
        systemInstruction: { role: 'system', parts: [{ text: 'be excited' }] }
      });
      expect(result).to.deep.equal({
        contents: [
          {
            role: 'user',
            parts: [{ text: 'txtA' }]
          }
        ],
        systemInstruction: { role: 'system', parts: [{ text: 'be excited' }] }
      });
    }),
      it('formats fileData as part if provided as part', () => {
        const result = formatGenerateContentInput([
          'What is this?',
          {
            fileData: {
              mimeType: 'image/jpeg',
              fileUri: 'gs://sample.appspot.com/image.jpeg'
            }
          }
        ]);
        expect(result).to.be.deep.equal({
          contents: [
            {
              role: 'user',
              parts: [
                { text: 'What is this?' },
                {
                  fileData: {
                    mimeType: 'image/jpeg',
                    fileUri: 'gs://sample.appspot.com/image.jpeg'
                  }
                }
              ]
            }
          ]
        });
      });
  });
});
