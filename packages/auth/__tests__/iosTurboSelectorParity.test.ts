/**
 * iOS New Architecture TurboModule selector parity for auth.
 *
 * Method-name parity (NewArch-AD-17.2) does not catch ObjC argument-label
 * mismatches. Codegen emits @selector(signInWithCustomToken:token:resolve:reject:)
 * while a mislabeled implementation (customToken:) is a different selector and
 * crashes at runtime with unrecognized selector (#9145).
 */
import fs from 'fs';
import path from 'path';
import { describe, expect, it } from '@jest/globals';
import {
  diffSets,
  extractIosGeneratedSelectors,
  extractIosImplementedSelectors,
  formatSetDiff,
} from '../../app/__tests__/specNativeParityHelper';

const REPO_ROOT = path.resolve(__dirname, '../../..');
const GENERATED_MM = path.join(
  REPO_ROOT,
  'packages/auth/ios/generated/RNFBAuthTurboModules/RNFBAuthTurboModules-generated.mm',
);
const IMPL_MM = path.join(REPO_ROOT, 'packages/auth/ios/RNFBAuth/RNFBAuthModule.mm');

describe('auth iOS TurboModule selector parity (#9145)', function () {
  it('implements every codegen @selector including argument labels', function () {
    const generated = extractIosGeneratedSelectors(fs.readFileSync(GENERATED_MM, 'utf8'));
    const implemented = extractIosImplementedSelectors(fs.readFileSync(IMPL_MM, 'utf8'));

    const diff = diffSets(generated, implemented);
    if (diff.missing.length || diff.extra.length) {
      throw new Error(
        [
          'auth iOS TurboModule selector mismatch (codegen vs RNFBAuthModule.mm)',
          formatSetDiff('codegen selectors vs implementation', diff),
          'Argument labels are part of the ObjC selector — renaming a param label',
          'without matching the TurboModule spec causes unrecognized-selector crashes.',
        ].join('\n'),
      );
    }

    expect(diff).toEqual({ missing: [], extra: [] });
    expect(implemented).toEqual(expect.arrayContaining(generated));
  });

  it('uses signInWithCustomToken:token: (not customToken:) per NativeRNFBTurboAuth', function () {
    const implemented = extractIosImplementedSelectors(fs.readFileSync(IMPL_MM, 'utf8'));
    expect(implemented).toContain('signInWithCustomToken:token:resolve:reject:');
    expect(implemented).not.toContain('signInWithCustomToken:customToken:resolve:reject:');
  });
});
