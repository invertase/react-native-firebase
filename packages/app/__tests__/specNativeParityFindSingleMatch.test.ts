import { afterEach, beforeEach, describe, expect, it } from '@jest/globals';
import fs from 'fs';
import os from 'os';
import path from 'path';
import { findSingleMatch } from './specNativeParityHelper';

const HEADER = /^RNFB.*TurboModules\.h$/;

describe('specNativeParityHelper findSingleMatch', function () {
  let rootDir: string;

  function touch(relativePath: string): string {
    const fullPath = path.join(rootDir, relativePath);
    fs.mkdirSync(path.dirname(fullPath), { recursive: true });
    fs.writeFileSync(fullPath, '');
    return fullPath;
  }

  beforeEach(function () {
    rootDir = fs.mkdtempSync(path.join(os.tmpdir(), 'rnfb-find-single-match-'));
  });

  afterEach(function () {
    fs.rmSync(rootDir, { recursive: true, force: true });
  });

  it('returns the single real match', function () {
    const generated = touch('generated/RNFBAppTurboModules/RNFBAppTurboModules.h');

    expect(findSingleMatch(rootDir, HEADER, 'header')).toBe(generated);
  });

  it('ignores look-alike files under HostStubs directories', function () {
    const generated = touch('generated/RNFBAppTurboModules/RNFBAppTurboModules.h');
    touch('RNFBAppUnitTests/HostStubs/RNFBAppTurboModules.h');

    expect(findSingleMatch(rootDir, HEADER, 'header')).toBe(generated);
  });

  it('still throws when two real matches exist', function () {
    touch('generated/RNFBAppTurboModules/RNFBAppTurboModules.h');
    touch('other/RNFBAppTurboModules.h');
    touch('RNFBAppUnitTests/HostStubs/RNFBAppTurboModules.h');

    expect(() => findSingleMatch(rootDir, HEADER, 'header')).toThrow(/found 2/);
  });

  it('throws when the only match is under HostStubs', function () {
    touch('RNFBAppUnitTests/HostStubs/RNFBAppTurboModules.h');

    expect(() => findSingleMatch(rootDir, HEADER, 'header')).toThrow(/found 0/);
  });
});
