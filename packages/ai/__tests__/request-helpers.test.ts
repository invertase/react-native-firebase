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
import { describe, expect, it } from '@jest/globals';
import { Content, AIErrorCode } from '../lib/types';
import { AIError } from '../lib/errors';
import {
  assignPartType,
  cleanContentForWire,
  cleanGenerateContentRequestForWire,
  formatGenerateContentInput,
  formatNewContent,
  formatSystemInstruction,
  stripPartType,
} from '../lib/requests/request-helpers';

describe('request formatting methods', () => {
  describe('formatGenerateContentInput', () => {
    it('formats a text string into a request', () => {
      const result = formatGenerateContentInput('some text content');
      expect(result).toEqual({
        contents: [
          {
            role: 'user',
            parts: [{ type: 'text', text: 'some text content' }],
          },
        ],
      });
    });

    it('formats an array of strings into a request', () => {
      const result = formatGenerateContentInput(['txt1', 'txt2']);
      expect(result).toEqual({
        contents: [
          {
            role: 'user',
            parts: [
              { type: 'text', text: 'txt1' },
              { type: 'text', text: 'txt2' },
            ],
          },
        ],
      });
    });

    it('formats an array of Parts into a request', () => {
      const result = formatGenerateContentInput([
        { type: 'text', text: 'txt1' },
        { type: 'text', text: 'txtB' },
      ]);
      expect(result).toEqual({
        contents: [
          {
            role: 'user',
            parts: [
              { type: 'text', text: 'txt1' },
              { type: 'text', text: 'txtB' },
            ],
          },
        ],
      });
    });

    it('formats a mixed array into a request', () => {
      const result = formatGenerateContentInput(['txtA', { type: 'text', text: 'txtB' }]);
      expect(result).toEqual({
        contents: [
          {
            role: 'user',
            parts: [
              { type: 'text', text: 'txtA' },
              { type: 'text', text: 'txtB' },
            ],
          },
        ],
      });
    });

    it('preserves other properties of request', () => {
      const result = formatGenerateContentInput({
        contents: [
          {
            role: 'user',
            parts: [{ type: 'text', text: 'txtA' }],
          },
        ],
        generationConfig: { topK: 100 },
      });
      expect(result).toEqual({
        contents: [
          {
            role: 'user',
            parts: [{ type: 'text', text: 'txtA' }],
          },
        ],
        generationConfig: { topK: 100 },
      });
    });

    it('formats systemInstructions if provided as text', () => {
      const result = formatGenerateContentInput({
        contents: [
          {
            role: 'user',
            parts: [{ type: 'text', text: 'txtA' }],
          },
        ],
        systemInstruction: 'be excited',
      });
      expect(result).toEqual({
        contents: [
          {
            role: 'user',
            parts: [{ type: 'text', text: 'txtA' }],
          },
        ],
        systemInstruction: { role: 'system', parts: [{ type: 'text', text: 'be excited' }] },
      });
    });

    it('formats systemInstructions if provided as Part', () => {
      const result = formatGenerateContentInput({
        contents: [
          {
            role: 'user',
            parts: [{ type: 'text', text: 'txtA' }],
          },
        ],
        systemInstruction: { type: 'text', text: 'be excited' },
      });
      expect(result).toEqual({
        contents: [
          {
            role: 'user',
            parts: [{ type: 'text', text: 'txtA' }],
          },
        ],
        systemInstruction: { role: 'system', parts: [{ type: 'text', text: 'be excited' }] },
      });
    });

    it('formats systemInstructions if provided as Content (no role)', () => {
      const result = formatGenerateContentInput({
        contents: [
          {
            role: 'user',
            parts: [{ type: 'text', text: 'txtA' }],
          },
        ],
        systemInstruction: { parts: [{ type: 'text', text: 'be excited' }] } as Content,
      });
      expect(result).toEqual({
        contents: [
          {
            role: 'user',
            parts: [{ type: 'text', text: 'txtA' }],
          },
        ],
        systemInstruction: { role: 'system', parts: [{ type: 'text', text: 'be excited' }] },
      });
    });

    it('passes thru systemInstructions if provided as Content', () => {
      const result = formatGenerateContentInput({
        contents: [
          {
            role: 'user',
            parts: [{ type: 'text', text: 'txtA' }],
          },
        ],
        systemInstruction: { role: 'system', parts: [{ type: 'text', text: 'be excited' }] },
      });
      expect(result).toEqual({
        contents: [
          {
            role: 'user',
            parts: [{ type: 'text', text: 'txtA' }],
          },
        ],
        systemInstruction: { role: 'system', parts: [{ type: 'text', text: 'be excited' }] },
      });
    });

    it('formats fileData as part if provided as part', () => {
      const result = formatGenerateContentInput([
        'What is this?',
        {
          type: 'fileData' as const,
          fileData: {
            mimeType: 'image/jpeg',
            fileUri: 'gs://sample.appspot.com/image.jpeg',
          },
        },
      ]);
      expect(result).toEqual({
        contents: [
          {
            role: 'user',
            parts: [
              { type: 'text', text: 'What is this?' },
              {
                type: 'fileData',
                fileData: {
                  mimeType: 'image/jpeg',
                  fileUri: 'gs://sample.appspot.com/image.jpeg',
                },
              },
            ],
          },
        ],
      });
    });

    it('assigns missing Part type discriminators for user Part kinds', () => {
      const result = formatGenerateContentInput([
        { inlineData: { mimeType: 'image/png', data: 'abc' } } as any,
        { fileData: { mimeType: 'text/plain', fileUri: 'gs://b/f' } } as any,
        { executableCode: { language: 'PYTHON', code: 'print(1)' } } as any,
        { codeExecutionResult: { outcome: 'OUTCOME_OK', output: '1' } } as any,
      ]);
      expect(result.contents[0].role).toBe('user');
      expect(result.contents[0].parts.map(p => p.type)).toEqual([
        'inlineData',
        'fileData',
        'executableCode',
        'codeExecutionResult',
      ]);
    });

    it('assigns missing functionResponse type into a function-role message', () => {
      const result = formatGenerateContentInput([
        { functionResponse: { name: 'fn', response: { ok: true } } } as any,
      ]);
      expect(result.contents[0]).toEqual({
        role: 'function',
        parts: [
          { type: 'functionResponse', functionResponse: { name: 'fn', response: { ok: true } } },
        ],
      });
    });

    it('rejects mixing functionResponse with other Part kinds', () => {
      expect(() =>
        formatGenerateContentInput([
          'hello',
          { functionResponse: { name: 'fn', response: { ok: true } } } as any,
        ]),
      ).toThrow(AIError);
      try {
        formatGenerateContentInput([
          'hello',
          { functionResponse: { name: 'fn', response: { ok: true } } } as any,
        ]);
      } catch (e) {
        expect((e as AIError).code).toBe(AIErrorCode.INVALID_CONTENT);
      }
    });

    it('rejects empty Part arrays', () => {
      expect(() => formatGenerateContentInput([])).toThrow(/No Content is provided/);
    });
  });

  describe('assignPartType / stripPartType', () => {
    it('returns already-typed parts unchanged', () => {
      const part = { type: 'text' as const, text: 'hi' };
      expect(assignPartType(part)).toBe(part);
    });

    it('infers type from untyped Part fields', () => {
      expect(assignPartType({ text: 'hi' } as any).type).toBe('text');
      expect(assignPartType({ inlineData: { mimeType: 'image/png', data: 'x' } } as any).type).toBe(
        'inlineData',
      );
      expect(assignPartType({ functionCall: { name: 'f', args: {} } } as any).type).toBe(
        'functionCall',
      );
      expect(assignPartType({ functionResponse: { name: 'f', response: {} } } as any).type).toBe(
        'functionResponse',
      );
      expect(
        assignPartType({ fileData: { mimeType: 'text/plain', fileUri: 'gs://b/f' } } as any).type,
      ).toBe('fileData');
      expect(
        assignPartType({ executableCode: { language: 'PYTHON', code: 'x' } } as any).type,
      ).toBe('executableCode');
      expect(
        assignPartType({ codeExecutionResult: { outcome: 'OUTCOME_OK', output: 'x' } } as any).type,
      ).toBe('codeExecutionResult');
    });

    it('strips type and nested functionResponse part types for the wire', () => {
      const wire = stripPartType({
        type: 'functionResponse',
        functionResponse: {
          name: 'fn',
          response: { ok: true },
          parts: [{ type: 'text', text: 'nested' }],
        },
      } as any);
      expect(wire).not.toHaveProperty('type');
      expect((wire as any).functionResponse.parts[0]).toEqual({ text: 'nested' });
    });

    it('copies untyped parts when stripping for the wire', () => {
      expect(stripPartType({ text: 'hi' } as any)).toEqual({ text: 'hi' });
      expect(
        stripPartType({
          functionResponse: { name: 'fn', response: { ok: true } },
        } as any),
      ).toEqual({
        functionResponse: { name: 'fn', response: { ok: true } },
      });
    });

    it('cleans content and generateContent requests for the wire', () => {
      const cleaned = cleanContentForWire({
        role: 'user',
        parts: [{ type: 'text', text: 'hi' }],
      });
      expect(cleaned.parts[0]).toEqual({ text: 'hi' });
      expect(cleanContentForWire({ role: 'user' } as any)).toEqual({ role: 'user' });
      expect(
        cleanGenerateContentRequestForWire({
          contents: [{ role: 'user', parts: [{ type: 'text', text: 'hi' }] }],
          systemInstruction: { type: 'text', text: 'sys' } as any,
        }).contents[0].parts[0],
      ).toEqual({ text: 'hi' });
    });
  });

  describe('formatSystemInstruction / formatNewContent', () => {
    it('returns undefined for nullish or unrecognized system instructions', () => {
      expect(formatSystemInstruction(undefined)).toBeUndefined();
      expect(formatSystemInstruction(null as any)).toBeUndefined();
      expect(formatSystemInstruction({ role: 'system' } as any)).toBeUndefined();
    });

    it('formats Part-shaped system instructions without role', () => {
      expect(formatSystemInstruction({ text: 'be brief' } as any)).toEqual({
        role: 'system',
        parts: [{ type: 'text', text: 'be brief' }],
      });
    });

    it('formats Content system instructions that already have a role', () => {
      expect(
        formatSystemInstruction({
          role: 'system',
          parts: [{ text: 'be brief' } as any],
        }),
      ).toEqual({
        role: 'system',
        parts: [{ type: 'text', text: 'be brief' }],
      });
    });

    it('builds user content from a string via formatNewContent', () => {
      expect(formatNewContent('hello')).toEqual({
        role: 'user',
        parts: [{ type: 'text', text: 'hello' }],
      });
    });
  });
});
