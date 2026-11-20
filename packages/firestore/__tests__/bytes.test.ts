import { afterAll, beforeAll, describe, expect, it, jest } from '@jest/globals';

import { Bytes } from '../lib';

// Every byte value, not in sorted order.
function testBytes(length: number): Uint8Array {
  return Uint8Array.from({ length }, (_, i) => (i * 167 + 13) & 255);
}

// Up to 64 bytes covers each padding case many times over. The large length spans many
// String.fromCharCode chunks and ends part-way through one.
const LENGTHS = [...Array.from({ length: 65 }, (_, n) => n), 100_001];

function expectSameBytes(actual: Uint8Array, expected: Uint8Array): void {
  expect(actual).toBeInstanceOf(Uint8Array);
  // toEqual is slow on a large typed array.
  expect(Buffer.from(actual).equals(Buffer.from(expected))).toBe(true);
}

function expectRoundTrip(length: number): void {
  // Odd lengths are a view one byte into a larger buffer, so byteOffset has to be respected.
  const offset = length % 2;
  const bytes = testBytes(length + offset).subarray(offset);
  const base64 = Buffer.from(bytes).toString('base64');

  const written = Bytes.fromUint8Array(bytes);
  expect(written.toBase64()).toBe(base64);
  expectSameBytes(written.toUint8Array(), bytes);

  // An empty string is rejected before decoding.
  if (length === 0) {
    return;
  }

  const read = Bytes.fromBase64String(base64);
  expect(read.toBase64()).toBe(base64);
  expectSameBytes(read.toUint8Array(), bytes);
  expect(read.isEqual(written)).toBe(true);
}

describe('Bytes base64 conversions', function () {
  describe('with the global atob and btoa', function () {
    it('uses them', function () {
      const atobSpy = jest.spyOn(globalThis, 'atob');
      const btoaSpy = jest.spyOn(globalThis, 'btoa');
      try {
        Bytes.fromBase64String('AAEC').toBase64();
        expect(atobSpy).toHaveBeenCalledWith('AAEC');
        expect(btoaSpy).toHaveBeenCalledWith('\x00\x01\x02');
      } finally {
        atobSpy.mockRestore();
        btoaSpy.mockRestore();
      }
    });

    it.each(LENGTHS)('round-trips %i bytes', function (length) {
      expectRoundTrip(length);
    });

    it.each(['A', 'AA*A'])('rejects %p', function (base64) {
      expect(() => Bytes.fromBase64String(base64)).toThrow(
        'firestore.Blob.fromBase64String expects a valid base64 string',
      );
    });
  });

  describe('without them, on the Base64 fallback', function () {
    const { atob, btoa } = globalThis;

    beforeAll(function () {
      Reflect.deleteProperty(globalThis, 'atob');
      Reflect.deleteProperty(globalThis, 'btoa');
    });

    afterAll(function () {
      Object.assign(globalThis, { atob, btoa });
    });

    it('has neither', function () {
      expect(typeof globalThis.atob).toBe('undefined');
      expect(typeof globalThis.btoa).toBe('undefined');
    });

    it.each(LENGTHS)('round-trips %i bytes', function (length) {
      expectRoundTrip(length);
    });

    it('rejects base64 of an impossible length', function () {
      expect(() => Bytes.fromBase64String('A')).toThrow(
        'firestore.Blob.fromBase64String expects a valid base64 string',
      );
    });
  });
});
