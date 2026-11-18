import { describe, expect, it, jest } from '@jest/globals';

import { FieldPath } from '../lib/FieldPath';
import DocumentReference from '../lib/FirestoreDocumentReference';
import FirestorePath from '../lib/FirestorePath';
import { updateDoc } from '../lib/modular';
import type { FirestoreInternal } from '../lib/types/internal';
import { buildNativeMap } from '../lib/utils/serialize';

function createRef() {
  const documentUpdate = jest.fn((_path: string, _data: unknown) => Promise.resolve());
  const firestore = {
    native: { documentUpdate },
    _settings: { ignoreUndefinedProperties: false },
  } as unknown as FirestoreInternal;
  const ref = new DocumentReference(firestore, FirestorePath.fromName('foo/bar'));
  return { ref, documentUpdate };
}

describe('updateDoc variadic form', function () {
  it.each([0, false, '', null])('passes the falsy value %p through', async function (value) {
    const { ref, documentUpdate } = createRef();

    await updateDoc(ref, 'n', value);

    expect(documentUpdate).toHaveBeenCalledWith('foo/bar', buildNativeMap({ n: value }, false));
  });

  it('passes falsy values in additional field/value pairs', async function () {
    const { ref, documentUpdate } = createRef();

    await updateDoc(ref, 'a', false, 'b', null);

    expect(documentUpdate).toHaveBeenCalledWith(
      'foo/bar',
      buildNativeMap({ a: false, b: null }, false),
    );
  });

  it('accepts a FieldPath with a falsy value', async function () {
    const { ref, documentUpdate } = createRef();

    await updateDoc(ref, new FieldPath('a', 'b'), 0);

    expect(documentUpdate).toHaveBeenCalledWith('foo/bar', buildNativeMap({ 'a.b': 0 }, false));
  });

  it('keeps the object form unchanged', async function () {
    const { ref, documentUpdate } = createRef();

    await updateDoc(ref, { count: 0 });

    expect(documentUpdate).toHaveBeenCalledWith('foo/bar', buildNativeMap({ count: 0 }, false));
  });

  it('throws the argument-less update error when called with no data', function () {
    const { ref, documentUpdate } = createRef();

    expect(() => (updateDoc as unknown as (reference: typeof ref) => Promise<void>)(ref)).toThrow(
      'expected at least 1 argument but was called with 0 arguments',
    );
    expect(documentUpdate).not.toHaveBeenCalled();
  });

  it('rejects explicit undefined update data as a non-object instead of an argument-less update', function () {
    const { ref, documentUpdate } = createRef();

    expect(() => updateDoc(ref, undefined as unknown as { a: number })).toThrow(
      'if using a single update argument, it must be an object.',
    );
    expect(documentUpdate).not.toHaveBeenCalled();
  });

  it('rejects null update data as a non-object instead of an argument-less update', function () {
    const { ref, documentUpdate } = createRef();

    expect(() => updateDoc(ref, null as unknown as { a: number })).toThrow(
      'if using a single update argument, it must be an object.',
    );
    expect(documentUpdate).not.toHaveBeenCalled();
  });

  it('rejects an empty field with no value as an undefined field value', function () {
    const { ref, documentUpdate } = createRef();

    expect(() =>
      (updateDoc as unknown as (r: typeof ref, f: string) => Promise<void>)(ref, ''),
    ).toThrow('Unsupported field value: undefined');
    expect(documentUpdate).not.toHaveBeenCalled();
  });

  // firebase-js-sdk rejects an empty field name; RNFB forwards it to native.
  it('forwards an empty field path with a value instead of an argument-less update', async function () {
    const { ref, documentUpdate } = createRef();

    await updateDoc(ref, '', 1);

    expect(documentUpdate).toHaveBeenCalledWith('foo/bar', buildNativeMap({ '': 1 }, false));
  });

  it('rejects an explicit undefined value in the variadic form', function () {
    const { ref, documentUpdate } = createRef();

    expect(() => updateDoc(ref, 'a', undefined)).toThrow('Unsupported field value: undefined');
    expect(documentUpdate).not.toHaveBeenCalled();
  });

  it.each([
    ['a value', [1]],
    ['a falsy value', [0]],
    ['more field/value pairs', [undefined, 'b', 2]],
  ])('ignores %s following update data, as firebase-js-sdk does', async function (_, extra) {
    const { ref, documentUpdate } = createRef();

    await (updateDoc as unknown as (r: typeof ref, ...args: unknown[]) => Promise<void>)(
      ref,
      { a: 1 },
      ...extra,
    );

    expect(documentUpdate).toHaveBeenCalledTimes(1);
    expect(documentUpdate).toHaveBeenCalledWith('foo/bar', buildNativeMap({ a: 1 }, false));
  });
});
