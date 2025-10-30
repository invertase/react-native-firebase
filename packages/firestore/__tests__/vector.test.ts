/* eslint-env jest */
import { describe, it, expect } from '@jest/globals';

describe('firestore() VectorValue', function () {
  const { default: FirestoreVectorValue } = require('../lib/FirestoreVectorValue');
  const serialize = require('../lib/utils/serialize');
  const { getTypeMapName } = require('../lib/utils/typemap');

  it('constructs and validates values', function () {
    const v = new FirestoreVectorValue([0, 1.5, -2]);
    expect(v.values).toEqual([0, 1.5, -2]);
    expect(v.isEqual(new FirestoreVectorValue([0, 1.5, -2]))).toBe(true);
    expect(v.isEqual(new FirestoreVectorValue([0, 1.5]))).toBe(false);
  });

  it('serializes to type map and parses back', function () {
    const v = new FirestoreVectorValue([0.1, 0.2, 0.3]);
    const typed = serialize.generateNativeData(v, false);
    // [INT_VECTOR, [0.1,0.2,0.3]]
    expect(Array.isArray(typed)).toBe(true);
    expect(getTypeMapName(typed[0])).toBe('vector');
    const parsed = serialize.parseNativeData(null, typed);
    expect(parsed instanceof FirestoreVectorValue).toBe(true);
    expect(parsed.values).toEqual([0.1, 0.2, 0.3]);
  });

  it('serializes inside objects and arrays', function () {
    const v = new FirestoreVectorValue([1, 2, 3]);
    const map = serialize.buildNativeMap({ a: v }, false);
    expect(getTypeMapName(map.a[0])).toBe('vector');

    const arr = serialize.buildNativeArray([v], false);
    expect(getTypeMapName(arr[0][0])).toBe('vector');
  });
});
