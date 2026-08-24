import fs from 'fs';
import path from 'path';
import { describe, expect, it } from '@jest/globals';

const APP_ROOT = path.resolve(__dirname, '..');
const GENERATED_HEADER = path.join(
  APP_ROOT,
  'ios/generated/RNFBAppTurboModules/RNFBAppTurboModules.h',
);

function extractReturnType(content: string, methodName: string): string {
  const match = content.match(
    new RegExp(`-\\s*\\((facebook::react::ModuleConstants<[^)]+>)\\)\\s*${methodName}\\b`),
  );
  if (!match) {
    throw new Error(`Could not find return type for ${methodName}`);
  }
  return match[1].replace(/\s+/g, '');
}

function extractGeneratedProtocol(header: string, moduleName: string): string {
  const start = header.indexOf(`@protocol ${moduleName}Spec`);
  const end = header.indexOf('\n@end', start);
  if (start === -1 || end === -1) {
    throw new Error(`Could not find generated protocol for ${moduleName}`);
  }
  return header.slice(start, end);
}

describe('iOS TurboModule constants return types', () => {
  const generatedHeader = fs.readFileSync(GENERATED_HEADER, 'utf8');
  const modules = [
    {
      moduleName: 'NativeRNFBTurboApp',
      implementation: 'ios/RNFBApp/RNFBAppModule.mm',
    },
    {
      moduleName: 'NativeRNFBTurboUtils',
      implementation: 'ios/RNFBApp/RNFBUtilsModule.mm',
    },
  ];

  for (const { moduleName, implementation } of modules) {
    it(`${moduleName} matches its generated constants protocol`, () => {
      const protocol = extractGeneratedProtocol(generatedHeader, moduleName);
      const implementationSource = fs.readFileSync(path.join(APP_ROOT, implementation), 'utf8');

      for (const methodName of ['constantsToExport', 'getConstants']) {
        expect(extractReturnType(implementationSource, methodName)).toBe(
          extractReturnType(protocol, methodName),
        );
      }
    });
  }
});
