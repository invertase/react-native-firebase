import fs from 'fs';
import path from 'path';
import { describe, expect, it } from '@jest/globals';

// Guards against the class of bug in issue #9212: a package's committed codegen
// output (`packages/*/ios/generated/**`, `includesGeneratedCode: true`) declares
// `constantsToExport`/`getConstants` returning `ModuleConstants<Foo>`, but the
// hand-written .mm implementation returns `ModuleConstants<Foo::Builder>` (or any
// other stale return type) instead. Objective-C only warns on a return-type
// mismatch against a conformed protocol (-Wmismatched-return-types) rather than
// failing the build, so this drifts silently until something crashes or a user
// hits a stricter compiler.
//
// This complements (does not replace) the `-Werror=mismatched-return-types` build
// setting scoped to RNFB targets in tests/ios/Podfile, which is the durable,
// build-level guardrail for this same failure mode across every current and
// future TurboModule package. This test exists because it runs in the fast Jest
// CI lane, with no Xcode build required, so drift is caught before a native build
// is even attempted.
const REPO_ROOT = path.resolve(__dirname, '../../..');

function extractReturnType(source: string, methodName: string): string {
  const match = source.match(
    new RegExp(`-\\s*\\((facebook::react::ModuleConstants<[^)]+>)\\)\\s*${methodName}\\b`),
  );
  if (!match) {
    throw new Error(`Could not find a "${methodName}" return type in the given source`);
  }
  return match[1].replace(/\s+/g, '');
}

function extractGeneratedProtocol(header: string, moduleName: string): string {
  const start = header.indexOf(`@protocol ${moduleName}Spec`);
  const end = header.indexOf('\n@end', start);
  if (start === -1 || end === -1) {
    throw new Error(`Could not find the generated "${moduleName}Spec" protocol in the header`);
  }
  return header.slice(start, end);
}

// Every package whose iOS TurboModule implementation hand-writes
// `constantsToExport`/`getConstants` against a committed, codegen-generated Spec
// protocol. Add new entries here whenever a package gains a hand-written
// constants-exporting TurboModule, do not assume codegen churn can't touch it.
const constantsExportingModules = [
  {
    package: 'app',
    moduleName: 'NativeRNFBTurboApp',
    generatedHeader: 'app/ios/generated/RNFBAppTurboModules/RNFBAppTurboModules.h',
    implementation: 'app/ios/RNFBApp/RNFBAppModule.mm',
  },
  {
    package: 'app',
    moduleName: 'NativeRNFBTurboUtils',
    generatedHeader: 'app/ios/generated/RNFBAppTurboModules/RNFBAppTurboModules.h',
    implementation: 'app/ios/RNFBApp/RNFBUtilsModule.mm',
  },
  {
    package: 'auth',
    moduleName: 'NativeRNFBTurboAuth',
    generatedHeader: 'auth/ios/generated/RNFBAuthTurboModules/RNFBAuthTurboModules.h',
    implementation: 'auth/ios/RNFBAuth/RNFBAuthModule.mm',
  },
  {
    package: 'crashlytics',
    moduleName: 'NativeRNFBTurboCrashlytics',
    generatedHeader:
      'crashlytics/ios/generated/RNFBCrashlyticsTurboModules/RNFBCrashlyticsTurboModules.h',
    implementation: 'crashlytics/ios/RNFBCrashlytics/RNFBCrashlyticsModule.mm',
  },
  {
    package: 'in-app-messaging',
    moduleName: 'NativeRNFBTurboFiam',
    generatedHeader:
      'in-app-messaging/ios/generated/RNFBInAppMessagingTurboModules/RNFBInAppMessagingTurboModules.h',
    implementation: 'in-app-messaging/ios/RNFBFiam/RNFBFiamModule.mm',
  },
  {
    package: 'messaging',
    moduleName: 'NativeRNFBTurboMessaging',
    generatedHeader:
      'messaging/ios/generated/RNFBMessagingTurboModules/RNFBMessagingTurboModules.h',
    implementation: 'messaging/ios/RNFBMessaging/RNFBMessagingModule.mm',
  },
  {
    package: 'perf',
    moduleName: 'NativeRNFBTurboPerf',
    generatedHeader: 'perf/ios/generated/RNFBPerfTurboModules/RNFBPerfTurboModules.h',
    implementation: 'perf/ios/RNFBPerf/RNFBPerfModule.mm',
  },
  {
    package: 'remote-config',
    moduleName: 'NativeRNFBTurboConfig',
    generatedHeader:
      'remote-config/ios/generated/RNFBRemoteConfigTurboModules/RNFBRemoteConfigTurboModules.h',
    implementation: 'remote-config/ios/RNFBConfig/RNFBConfigModule.mm',
  },
  {
    package: 'storage',
    moduleName: 'NativeRNFBTurboStorage',
    generatedHeader: 'storage/ios/generated/RNFBStorageTurboModules/RNFBStorageTurboModules.h',
    implementation: 'storage/ios/RNFBStorage/RNFBStorageModule.mm',
  },
] as const;

describe('iOS TurboModule constants return types match their generated Spec protocol', () => {
  for (const {
    package: pkg,
    moduleName,
    generatedHeader,
    implementation,
  } of constantsExportingModules) {
    it(`${pkg}: ${moduleName} constantsToExport/getConstants match generated protocol`, () => {
      const header = fs.readFileSync(path.join(REPO_ROOT, 'packages', generatedHeader), 'utf8');
      const protocol = extractGeneratedProtocol(header, moduleName);
      const implementationSource = fs.readFileSync(
        path.join(REPO_ROOT, 'packages', implementation),
        'utf8',
      );

      for (const methodName of ['constantsToExport', 'getConstants']) {
        expect(extractReturnType(implementationSource, methodName)).toBe(
          extractReturnType(protocol, methodName),
        );
      }
    });
  }
});
