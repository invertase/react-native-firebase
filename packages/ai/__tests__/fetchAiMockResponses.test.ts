import { execFileSync } from 'child_process';
import { existsSync, readdirSync } from 'fs';
import { rimrafSync } from 'rimraf';
import { afterEach, describe, expect, it, jest } from '@jest/globals';

import { fetchAiMockResponses } from '../../../scripts/fetch_ai_mock_responses';

jest.mock('child_process', () => ({
  execFileSync: jest.fn(),
}));
jest.mock('fs', () => ({
  existsSync: jest.fn(),
  readdirSync: jest.fn(),
}));
jest.mock('rimraf', () => ({
  rimrafSync: jest.fn(),
}));

describe('fetchAiMockResponses', () => {
  afterEach(() => {
    jest.clearAllMocks();
  });

  it('passes a repository-controlled tag to git without shell interpretation', () => {
    const maliciousTag = 'v17.0;id';
    jest.mocked(existsSync).mockReturnValue(false);
    jest
      .mocked(execFileSync)
      .mockReturnValueOnce(`hash refs/tags/${maliciousTag}`)
      .mockReturnValueOnce('');

    fetchAiMockResponses();

    expect(execFileSync).toHaveBeenNthCalledWith(
      1,
      'git',
      ['ls-remote', '--tags', '--sort=version:refname', expect.any(String)],
      { encoding: 'utf8' },
    );
    expect(execFileSync).toHaveBeenNthCalledWith(2, 'git', [
      '-c',
      'advice.detachedHead=false',
      'clone',
      '--branch',
      maliciousTag,
      '--',
      expect.any(String),
      expect.any(String),
    ]);
    expect(rimrafSync).toHaveBeenCalledTimes(1);
  });

  it('exits early without touching git when a matching clone already exists locally', () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    jest.mocked(existsSync).mockReturnValue(true);
    jest
      .mocked(readdirSync)
      .mockReturnValue([
        { name: 'vertexai-sdk-test-data_v17.0', isDirectory: () => true },
      ] as unknown as ReturnType<typeof readdirSync>);

    expect(() => fetchAiMockResponses()).toThrow('process.exit called');

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(execFileSync).not.toHaveBeenCalled();
    exitSpy.mockRestore();
  });

  it('exits early without cloning when the target directory for the latest tag already exists', () => {
    const exitSpy = jest.spyOn(process, 'exit').mockImplementation(() => {
      throw new Error('process.exit called');
    });
    jest
      .mocked(existsSync)
      .mockReturnValueOnce(false) // no existing clone dir found yet
      .mockReturnValueOnce(true); // target dir for the latest tag already exists
    jest.mocked(execFileSync).mockReturnValueOnce('hash refs/tags/v18.0');

    expect(() => fetchAiMockResponses()).toThrow('process.exit called');

    expect(exitSpy).toHaveBeenCalledWith(0);
    expect(execFileSync).toHaveBeenCalledTimes(1); // ls-remote only, never clone
    exitSpy.mockRestore();
  });

  it('cleans stale fixture data while preserving TypeScript sources and the latest tag directory', () => {
    jest.mocked(existsSync).mockReturnValue(false);
    jest.mocked(execFileSync).mockReturnValueOnce('hash refs/tags/v19.0').mockReturnValueOnce('');

    fetchAiMockResponses();

    const [, rimrafOptions] = jest.mocked(rimrafSync).mock.calls[0];
    const { filter } = rimrafOptions as unknown as {
      filter: (path: string, stat: unknown) => boolean;
    };

    // filter returns true for entries rimraf should delete, false to keep them.
    expect(filter('/root/keep.ts', {})).toBe(false);
    expect(filter('/root/vertexai-sdk-test-data_v19.0/fixture.json', {})).toBe(false);
    expect(filter('/root/vertexai-sdk-test-data_v18.0/stale.json', {})).toBe(true);
  });
});
