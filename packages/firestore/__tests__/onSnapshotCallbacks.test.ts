import { afterEach, beforeEach, describe, expect, it, jest } from '@jest/globals';

import DocumentReference from '../lib/FirestoreDocumentReference';
import FirestorePath from '../lib/FirestorePath';
import { Query } from '../lib/FirestoreQuery';
import FirestoreQueryModifiers from '../lib/FirestoreQueryModifiers';
import FirestoreQuerySnapshot from '../lib/FirestoreQuerySnapshot';
import FirestoreDocumentSnapshot from '../lib/FirestoreDocumentSnapshot';
import { onSnapshot } from '../lib/modular';
import { parseSnapshotArgs } from '../lib/utils';
import type { FirestoreInternal } from '../lib/types/internal';

type EmitterListener = (event: { body: Record<string, unknown> }) => void;

const errorBody = { code: 'permission-denied', message: 'Missing or insufficient permissions.' };
const documentSnapshotBody = { path: 'foo/bar', exists: true, data: {}, metadata: [false, false] };
const querySnapshotBody = {
  source: 'server',
  excludesMetadataChanges: true,
  changes: [],
  documents: [documentSnapshotBody],
  metadata: [false, false],
};

function createFirestore() {
  const listeners: EmitterListener[] = [];
  const firestore = {
    emitter: {
      addListener: jest.fn((_eventName: string, listener: EmitterListener) => {
        listeners.push(listener);
        return { remove: jest.fn() };
      }),
    },
    eventNameForApp: (name: string) => `[DEFAULT]-${name}`,
    native: {
      documentOnSnapshot: jest.fn(),
      documentOffSnapshot: jest.fn(),
      collectionOnSnapshot: jest.fn(),
      collectionOffSnapshot: jest.fn(),
    },
    _settings: { ignoreUndefinedProperties: false },
  } as unknown as FirestoreInternal;

  const emit = (body: Record<string, unknown>): void => {
    expect(listeners).toHaveLength(1);
    listeners[0]!({ body });
  };

  return { firestore, emit };
}

const targets = [
  {
    name: 'document',
    create: (firestore: FirestoreInternal) =>
      new DocumentReference(firestore, FirestorePath.fromName('foo/bar')),
    snapshotBody: documentSnapshotBody,
    SnapshotClass: FirestoreDocumentSnapshot,
  },
  {
    name: 'query',
    create: (firestore: FirestoreInternal) =>
      new Query(firestore, FirestorePath.fromName('foo'), new FirestoreQueryModifiers()),
    snapshotBody: querySnapshotBody,
    SnapshotClass: FirestoreQuerySnapshot,
  },
] as const;

describe.each(targets)('$name onSnapshot listener callbacks', function (target) {
  let consoleError: ReturnType<typeof jest.spyOn>;

  beforeEach(function () {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(function () {
    consoleError.mockRestore();
  });

  function subscribe(...args: unknown[]) {
    const { firestore, emit } = createFirestore();
    const reference = target.create(firestore);
    const unsubscribe = (onSnapshot as unknown as (...a: unknown[]) => () => void)(
      reference,
      ...args,
    );
    return { firestore, emit, unsubscribe };
  }

  function nativeListenOptions(firestore: FirestoreInternal): unknown {
    const onSnapshotNative = (
      target.name === 'document'
        ? firestore.native.documentOnSnapshot
        : firestore.native.collectionOnSnapshot
    ) as jest.Mock;
    expect(onSnapshotNative).toHaveBeenCalledTimes(1);
    const callArgs = onSnapshotNative.mock.calls[0]!;
    return callArgs[callArgs.length - 1];
  }

  it('does not call a lone onNext with a listener error, and logs it like the firebase-js-sdk', function () {
    const onNext = jest.fn();
    const { emit } = subscribe(onNext);

    emit({ error: errorBody });

    expect(onNext).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledTimes(1);
    expect(consoleError).toHaveBeenCalledWith(
      'Uncaught Error in snapshot listener:',
      expect.stringContaining('Missing or insufficient permissions.'),
    );
  });

  it('calls a lone onNext with only the snapshot on success', function () {
    const onNext = jest.fn();
    const { emit } = subscribe(onNext);

    emit({ snapshot: target.snapshotBody });

    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onNext.mock.calls[0]).toHaveLength(1);
    expect(onNext.mock.calls[0]![0]).toBeInstanceOf(target.SnapshotClass);
  });

  it('ignores a success event without a snapshot', function () {
    const onNext = jest.fn();
    const { emit } = subscribe(onNext);

    emit({});

    expect(onNext).not.toHaveBeenCalled();
  });

  it('treats (options, onNext) the same way', function () {
    const onNext = jest.fn();
    const { firestore, emit } = subscribe({ includeMetadataChanges: true }, onNext);
    expect(nativeListenOptions(firestore)).toEqual({
      includeMetadataChanges: true,
      source: 'default',
    });

    emit({ error: errorBody });
    expect(onNext).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledTimes(1);

    emit({ snapshot: target.snapshotBody });
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onNext.mock.calls[0]![0]).toBeInstanceOf(target.SnapshotClass);
  });

  it('routes (onNext, onError) to the matching handler', function () {
    const onNext = jest.fn();
    const onError = jest.fn();
    const { emit } = subscribe(onNext, onError);

    emit({ error: errorBody });
    expect(onNext).not.toHaveBeenCalled();
    expect(onError).toHaveBeenCalledTimes(1);
    expect((onError.mock.calls[0]![0] as Error).message).toContain(
      'Missing or insufficient permissions.',
    );

    emit({ snapshot: target.snapshotBody });
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onError).toHaveBeenCalledTimes(1);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('routes (options, onNext, onError) to the matching handler', function () {
    const onNext = jest.fn();
    const onError = jest.fn();
    const { firestore, emit } = subscribe({ source: 'cache' }, onNext, onError);
    expect(nativeListenOptions(firestore)).toEqual({
      includeMetadataChanges: false,
      source: 'cache',
    });

    emit({ error: errorBody });
    emit({ snapshot: target.snapshotBody });

    expect(onError).toHaveBeenCalledTimes(1);
    expect(onNext).toHaveBeenCalledTimes(1);
    expect(onNext.mock.calls[0]![0]).toBeInstanceOf(target.SnapshotClass);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('routes an observer to next and error', function () {
    const observer = { next: jest.fn(), error: jest.fn() };
    const { emit } = subscribe(observer);

    emit({ error: errorBody });
    emit({ snapshot: target.snapshotBody });

    expect(observer.error).toHaveBeenCalledTimes(1);
    expect(observer.next).toHaveBeenCalledTimes(1);
    expect(observer.next.mock.calls[0]![0]).toBeInstanceOf(target.SnapshotClass);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('routes (options, observer) to next and error', function () {
    const observer = { next: jest.fn(), error: jest.fn() };
    const { firestore, emit } = subscribe(
      { includeMetadataChanges: true, source: 'cache' },
      observer,
    );
    expect(nativeListenOptions(firestore)).toEqual({
      includeMetadataChanges: true,
      source: 'cache',
    });

    emit({ error: errorBody });
    emit({ snapshot: target.snapshotBody });

    expect(observer.error).toHaveBeenCalledTimes(1);
    expect(observer.next).toHaveBeenCalledTimes(1);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('logs a listener error for an observer without an error handler', function () {
    const observer = { next: jest.fn() };
    const { emit } = subscribe(observer);

    emit({ error: errorBody });

    expect(observer.next).not.toHaveBeenCalled();
    expect(consoleError).toHaveBeenCalledTimes(1);
  });

  it('removes the emitter subscription and stops the native listener on unsubscribe', function () {
    const { firestore } = createFirestore();
    const reference = target.create(firestore);
    const unsubscribe = onSnapshot(reference as never, jest.fn());
    const subscription = (firestore.emitter.addListener as jest.Mock).mock.results[0]!.value as {
      remove: jest.Mock;
    };

    unsubscribe();

    expect(subscription.remove).toHaveBeenCalledTimes(1);
    const off =
      target.name === 'document'
        ? firestore.native.documentOffSnapshot
        : firestore.native.collectionOffSnapshot;
    expect(off).toHaveBeenCalledTimes(1);
  });

  it('prefixes argument errors with the reference type', function () {
    const { firestore } = createFirestore();
    const reference = target.create(firestore);

    expect(() => (reference as unknown as { onSnapshot: () => void }).onSnapshot()).toThrow(
      target.name === 'document'
        ? 'firebase.firestore().doc().onSnapshot(*) expected at least one argument.'
        : 'firebase.firestore().collection().onSnapshot(*) expected at least one argument.',
    );
  });
});

describe('named query onSnapshot', function () {
  it('subscribes through namedQueryOnSnapshot', function () {
    const { firestore } = createFirestore();
    (firestore.native as unknown as Record<string, jest.Mock>).namedQueryOnSnapshot = jest.fn();
    const query = new Query(
      firestore,
      FirestorePath.fromName('foo'),
      new FirestoreQueryModifiers(),
      'named',
    );

    onSnapshot(query, jest.fn());

    expect(
      (firestore.native as unknown as Record<string, jest.Mock>).namedQueryOnSnapshot,
    ).toHaveBeenCalledTimes(1);
    expect(firestore.native.collectionOnSnapshot).not.toHaveBeenCalled();
  });
});

describe('parseSnapshotArgs()', function () {
  let consoleError: ReturnType<typeof jest.spyOn>;

  beforeEach(function () {
    consoleError = jest.spyOn(console, 'error').mockImplementation(() => {});
  });

  afterEach(function () {
    consoleError.mockRestore();
  });

  it('throws without arguments', function () {
    expect(() => parseSnapshotArgs([])).toThrow('expected at least one argument.');
  });

  it('defaults onError to logging the error like the firebase-js-sdk', function () {
    const parsed = parseSnapshotArgs([() => {}]);

    parsed.onError(new Error('boom'));

    expect(consoleError).toHaveBeenCalledWith(
      'Uncaught Error in snapshot listener:',
      'Error: boom',
    );
  });

  it('accepts an observer with only an error handler', function () {
    const error = jest.fn();
    const parsed = parseSnapshotArgs([{ error }]);

    parsed.onNext({});
    parsed.onError(new Error('boom'));

    expect(error).toHaveBeenCalledTimes(1);
    expect(consoleError).not.toHaveBeenCalled();
  });

  it('accepts options without a listener', function () {
    const parsed = parseSnapshotArgs([{ includeMetadataChanges: true }]);

    expect(() => parsed.onNext({})).not.toThrow();
    expect(parsed.snapshotListenOptions).toEqual({
      includeMetadataChanges: true,
      source: 'default',
    });
  });

  it('accepts (options, observer) with only next or only error', function () {
    const next = jest.fn();
    const withNext = parseSnapshotArgs([{}, { next }]);
    withNext.onNext('snapshot');
    withNext.onError(new Error('boom'));
    expect(next).toHaveBeenCalledWith('snapshot');
    expect(consoleError).toHaveBeenCalledTimes(1);

    const error = jest.fn();
    const withError = parseSnapshotArgs([{}, { error }]);
    withError.onError(new Error('boom'));
    expect(error).toHaveBeenCalledTimes(1);
  });

  it.each([
    ['observer.next', [{ next: 'nope' }]],
    ['(options, observer).next', [{}, { next: 'nope' }]],
  ])('rejects a non-function %s', function (_label, args) {
    expect(() => parseSnapshotArgs(args)).toThrow(
      "'observer.next' or 'onNext' expected a function.",
    );
  });

  it.each([
    ['observer.error', [{ next: () => {}, error: 'nope' }]],
    ['(options, observer).error', [{}, { next: () => {}, error: 'nope' }]],
  ])('rejects a non-function %s', function (_label, args) {
    expect(() => parseSnapshotArgs(args)).toThrow(
      "'observer.error' or 'onError' expected a function.",
    );
  });

  it('rejects a non-boolean includeMetadataChanges', function () {
    expect(() => parseSnapshotArgs([{ includeMetadataChanges: 'yes' }, () => {}])).toThrow(
      "'options' SnapshotOptions.includeMetadataChanges must be a boolean value.",
    );
  });
});
