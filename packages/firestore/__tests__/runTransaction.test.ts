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

describe('runTransaction dead-id guard', function () {
  function nativeMocks(handler: FirestoreTransactionHandler) {
    return handler._firestore.native as unknown as {
      transactionApplyBuffer: jest.Mock;
      transactionDispose: jest.Mock;
    };
  }

  it('does not applyBuffer or reject again after the id is already finished', async function () {
    const handler = createHandler(jest.fn());
    const { transactionApplyBuffer } = nativeMocks(handler);

    let releaseUpdate: (value?: unknown) => void = () => undefined;
    const pending = handler._add(
      () =>
        new Promise(resolve => {
          releaseUpdate = resolve;
        }),
    );

    const id = Number(Object.keys(handler._pending)[0]);
    const updateWork = handler._handleUpdate({ listenerId: id, body: { type: 'update' } });

    handler._handleError({
      listenerId: id,
      body: {
        type: 'error',
        error: { code: 'deadline-exceeded', message: 'timeout' },
      },
    });

    await expect(pending).rejects.toMatchObject({
      code: 'firestore/deadline-exceeded',
    });

    releaseUpdate('late');
    await updateWork;

    expect(transactionApplyBuffer).not.toHaveBeenCalled();
  });

  it('does not applyBuffer after complete has already settled the id', async function () {
    const handler = createHandler(jest.fn());
    const { transactionApplyBuffer } = nativeMocks(handler);

    let releaseUpdate: (value?: unknown) => void = () => undefined;
    const pending = handler._add(
      () =>
        new Promise(resolve => {
          releaseUpdate = resolve;
        }),
    );

    const id = Number(Object.keys(handler._pending)[0]);
    const updateWork = handler._handleUpdate({ listenerId: id, body: { type: 'update' } });

    handler._handleComplete({ listenerId: id, body: { type: 'complete' } });
    await expect(pending).resolves.toBeUndefined();

    releaseUpdate('late');
    await updateWork;

    expect(transactionApplyBuffer).not.toHaveBeenCalled();
  });

  it('still applyBuffers when a second update event arrives while the id is pending', async function () {
    const handler = createHandler(jest.fn());
    const { transactionApplyBuffer } = nativeMocks(handler);

    void handler._add(async () => 'ok');
    const id = Number(Object.keys(handler._pending)[0]);

    await handler._handleUpdate({ listenerId: id, body: { type: 'update' } });
    await handler._handleUpdate({ listenerId: id, body: { type: 'update' } });

    expect(transactionApplyBuffer).toHaveBeenCalledTimes(2);
    expect(transactionApplyBuffer).toHaveBeenNthCalledWith(1, id, []);
    expect(transactionApplyBuffer).toHaveBeenNthCalledWith(2, id, []);
  });

  it('rejects when updateFunction does not return a Promise', async function () {
    const handler = createHandler(jest.fn());
    const pending = handler._add((() => 123) as never);
    const id = Number(Object.keys(handler._pending)[0]);

    await handler._handleUpdate({ listenerId: id, body: { type: 'update' } });

    await expect(pending).rejects.toThrow("'updateFunction' must return a Promise");
    expect(nativeMocks(handler).transactionApplyBuffer).not.toHaveBeenCalled();
  });

  it('rejects when updateFunction throws while the id is still pending', async function () {
    const handler = createHandler(jest.fn());
    const pending = handler._add(async () => {
      throw new Error('user boom');
    });
    const id = Number(Object.keys(handler._pending)[0]);

    await handler._handleUpdate({ listenerId: id, body: { type: 'update' } });

    await expect(pending).rejects.toThrow('user boom');
    expect(nativeMocks(handler).transactionApplyBuffer).not.toHaveBeenCalled();
  });

  it('ignores update events for unknown ids', async function () {
    const handler = createHandler(jest.fn());
    const { transactionApplyBuffer, transactionDispose } = nativeMocks(handler);

    await handler._handleUpdate({ listenerId: 99, body: { type: 'update' } });

    expect(transactionApplyBuffer).not.toHaveBeenCalled();
    expect(transactionDispose).toHaveBeenCalledWith(99);
  });

  it('ignores update events without a listener id', async function () {
    const handler = createHandler(jest.fn());
    await handler._handleUpdate({ body: { type: 'update' } });
    expect(nativeMocks(handler).transactionApplyBuffer).not.toHaveBeenCalled();
  });

  it('ignores error events for unknown ids', function () {
    const handler = createHandler(jest.fn());
    const { transactionDispose } = nativeMocks(handler);

    handler._handleError({
      listenerId: 99,
      body: {
        type: 'error',
        error: { code: 'deadline-exceeded', message: 'timeout' },
      },
    });

    expect(transactionDispose).not.toHaveBeenCalled();
    expect(handler._pending).toEqual({});
  });

  it('ignores complete events for unknown ids', function () {
    const handler = createHandler(jest.fn());
    const { transactionDispose } = nativeMocks(handler);

    handler._handleComplete({ listenerId: 99, body: { type: 'complete' } });

    expect(transactionDispose).not.toHaveBeenCalled();
    expect(handler._pending).toEqual({});
  });

  it('ignores error events without a listener id', function () {
    const handler = createHandler(jest.fn());
    handler._handleError({
      body: {
        type: 'error',
        error: { code: 'deadline-exceeded', message: 'timeout' },
      },
    });
    expect(nativeMocks(handler).transactionDispose).not.toHaveBeenCalled();
  });

  it('ignores complete events without a listener id', function () {
    const handler = createHandler(jest.fn());
    handler._handleComplete({ body: { type: 'complete' } });
    expect(nativeMocks(handler).transactionDispose).not.toHaveBeenCalled();
  });
});
