import { describe, expect, it, jest } from '@jest/globals';

import FirestoreTransactionHandler from '../lib/FirestoreTransactionHandler';
import type { FirestoreInternal } from '../lib/types/internal';

function createHandler(transactionBegin: jest.Mock) {
  const firestore = {
    native: { transactionBegin, transactionDispose: jest.fn(), transactionApplyBuffer: jest.fn() },
    emitter: { addListener: jest.fn() },
    eventNameForApp: jest.fn((name: string) => name),
  } as unknown as FirestoreInternal;

  return new FirestoreTransactionHandler(firestore);
}

describe('runTransaction options passthrough', function () {
  it('passes maxAttempts to native transactionBegin when provided', function () {
    const transactionBegin = jest.fn();
    const handler = createHandler(transactionBegin);

    void handler._add(async () => 'ok', { maxAttempts: 5 });

    expect(transactionBegin).toHaveBeenCalledWith(0, 5);
  });

  it('passes zero maxAttempts when options are omitted', function () {
    const transactionBegin = jest.fn();
    const handler = createHandler(transactionBegin);

    void handler._add(async () => 'ok');

    expect(transactionBegin).toHaveBeenCalledWith(expect.any(Number), 0);
  });

  it.each([0, -1])('throws when maxAttempts is %s', function (maxAttempts) {
    const transactionBegin = jest.fn();
    const handler = createHandler(transactionBegin);

    expect(() => handler._add(async () => 'ok', { maxAttempts })).toThrow(
      'Max attempts must be at least 1',
    );
    expect(transactionBegin).not.toHaveBeenCalled();
  });
});
