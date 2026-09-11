import { describe, expect, it } from '@jest/globals';

import { Base64, getDataUrlParts } from '../lib/common';
import { deepSet } from '../lib/common/deeps';

describe('common utilities', () => {
  describe('getDataUrlParts', () => {
    it('preserves commas after the data URL delimiter', () => {
      expect(getDataUrlParts('data:text/plain,one,two')).toEqual({
        base64String: Base64.btoa('one,two'),
        mediaType: 'text/plain',
      });
    });

    it('allows an empty data URL payload', () => {
      expect(getDataUrlParts('data:text/plain,')).toEqual({
        base64String: '',
        mediaType: 'text/plain',
      });
    });

    it('encodes decoded text as UTF-8 bytes', () => {
      expect(getDataUrlParts('data:text/plain,%E2%9C%93')).toEqual({
        base64String: '4pyT',
        mediaType: 'text/plain',
      });
    });

    it('only recognizes a base64 marker in the metadata suffix', () => {
      expect(getDataUrlParts('data:text/plain,value;base64')).toEqual({
        base64String: Base64.btoa('value;base64'),
        mediaType: 'text/plain',
      });
    });

    it.each(['text/plain,value', 'data:text/plain', 'data:text/plain,%E0%A4%A'])(
      'rejects malformed data URL %s',
      value => {
        expect(getDataUrlParts(value)).toEqual({
          base64String: undefined,
          mediaType: undefined,
        });
      },
    );
  });

  describe('deepSet', () => {
    it('rejects paths that mutate the target prototype', () => {
      const target = {};

      expect(deepSet(target, '__proto__.polluted', true)).toBe(false);
      expect((target as Record<string, unknown>).polluted).toBeUndefined();
    });

    it('rejects paths that mutate Object.prototype', () => {
      expect(deepSet({}, 'constructor.prototype.polluted', true, false)).toBe(false);
      expect(({} as Record<string, unknown>).polluted).toBeUndefined();
    });

    it('still assigns values along an ordinary nested path', () => {
      const target: Record<string, unknown> = {};

      expect(deepSet(target, 'a.b', 5)).toBe(true);
      expect(target).toEqual({ a: { b: 5 } });
    });
  });
});
