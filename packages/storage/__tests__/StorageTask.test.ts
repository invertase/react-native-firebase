import { describe, expect, it, jest } from '@jest/globals';

import StorageUploadTask from '../lib/StorageUploadTask';
import type { StorageReferenceInternal, StorageInternal } from '../lib/types/internal';
import type { TaskSnapshot } from '../lib/types/storage';

function createTask(setTaskStatus: jest.Mock<(taskId: number, status: number) => boolean>) {
  const storage = {
    native: { setTaskStatus },
    emitter: { addListener: jest.fn() },
    eventNameForApp: jest.fn(),
  } as unknown as StorageInternal;

  const ref = {
    _storage: storage,
    bucket: 'test-bucket',
    fullPath: 'path/file.json',
    name: 'file.json',
    toString: () => 'gs://test-bucket/path/file.json',
  } as StorageReferenceInternal;

  return new StorageUploadTask(ref, () => Promise.resolve({} as TaskSnapshot));
}

describe('StorageTask pause/resume/cancel', function () {
  it('pause, resume, and cancel return synchronous booleans from native setTaskStatus', function () {
    const setTaskStatus = jest
      .fn<(taskId: number, status: number) => boolean>()
      .mockImplementation((_taskId, status) => status !== 2);
    const task = createTask(setTaskStatus);

    expect(task.pause()).toBe(true);
    expect(setTaskStatus).toHaveBeenCalledWith(0, 0);
    expect(task.pause()).not.toBeInstanceOf(Promise);

    expect(task.resume()).toBe(true);
    expect(setTaskStatus).toHaveBeenCalledWith(0, 1);

    expect(task.cancel()).toBe(false);
    expect(setTaskStatus).toHaveBeenCalledWith(0, 2);
  });

  it('returns false when native setTaskStatus rejects the operation', function () {
    const setTaskStatus = jest.fn(() => false);
    const task = createTask(setTaskStatus);

    expect(task.pause()).toBe(false);
    expect(task.resume()).toBe(false);
    expect(task.cancel()).toBe(false);
  });
});
