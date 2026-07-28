import { describe, expect, it } from '@jest/globals';
import {
  MIGRATED_TURBO_PACKAGES,
  collectSpecNativeParity,
  diffSets,
  discoverPackageSpecContexts,
  formatSetDiff,
} from './specNativeParityHelper';

describe('Spec↔native parity (NewArch-AD-17.2)', function () {
  for (const packageName of MIGRATED_TURBO_PACKAGES) {
    describe(packageName, function () {
      const contexts = discoverPackageSpecContexts(packageName);

      it('has no duplicate method names across package specs (NewArch-AD-11)', function () {
        const allMethods = contexts.flatMap(context => collectSpecNativeParity(context).spec);
        expect(new Set(allMethods).size).toBe(allMethods.length);
      });

      for (const context of contexts) {
        it(`${context.moduleName} spec matches Android @ReactMethod + iOS TurboModule protocol`, function () {
          const { spec, android, ios, nativeUnion } = collectSpecNativeParity(context);

          const specVsUnion = diffSets(spec, nativeUnion);
          expect(specVsUnion).toEqual({ missing: [], extra: [] });

          const specVsAndroid = diffSets(spec, android);
          const specVsIos = diffSets(spec, ios);

          if (specVsUnion.missing.length || specVsUnion.extra.length) {
            throw new Error(
              [
                `${context.packageName}/${context.moduleName} parity mismatch`,
                formatSetDiff('spec vs native union', specVsUnion),
                formatSetDiff('spec vs android', specVsAndroid),
                formatSetDiff('spec vs ios', specVsIos),
              ]
                .filter(Boolean)
                .join('\n'),
            );
          }

          expect(android).toEqual(spec);
          expect(ios).toEqual(spec);
          expect(nativeUnion).toEqual(spec);
        });
      }
    });
  }
});
