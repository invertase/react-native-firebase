import fs from 'fs';
import path from 'path';
import ts from 'typescript';

const REPO_ROOT = path.resolve(__dirname, '../../..');

/** TurboModule infrastructure methods excluded from parity comparison. */
const EXCLUDED_METHODS = new Set(['getConstants', 'constantsToExport']);

export const MIGRATED_TURBO_PACKAGES = [
  'app',
  'firestore',
  'installations',
  'perf',
  'in-app-messaging',
  'app-distribution',
  'ml',
  'app-check',
  'remote-config',
  'analytics',
  'crashlytics',
  'storage',
  'functions',
  'messaging',
  'database',
  'auth',
] as const;

export type MigratedTurboPackage = (typeof MIGRATED_TURBO_PACKAGES)[number];

export type SpecParityContext = {
  packageName: MigratedTurboPackage;
  moduleName: string;
  specPath: string;
  androidSpecPath: string;
  iosHeaderPath: string;
};

export type SpecParityContextEntry = {
  moduleName: string;
  specPath: string;
  androidSpecPath: string;
  iosHeaderPath: string;
};

/** Explicit spec/native paths for packages with non-default codegen layout (see database/messaging guardrail commits). */
export const PACKAGE_SPEC_PARITY_CONTEXTS: Partial<
  Record<MigratedTurboPackage, readonly SpecParityContextEntry[]>
> = {
  auth: [
    {
      moduleName: 'NativeRNFBTurboAuth',
      specPath: 'packages/auth/specs/NativeRNFBTurboAuth.ts',
      androidSpecPath:
        'packages/auth/android/src/main/java/io/invertase/firebase/auth/generated/java/com/facebook/fbreact/specs/NativeRNFBTurboAuthSpec.java',
      iosHeaderPath:
        'packages/auth/ios/generated/RNFBAuthTurboModules/RNFBAuthTurboModules.h',
    },
  ],
};
export function extractSpecMethods(specContent: string, fileName = 'spec.ts'): string[] {
  const sourceFile = ts.createSourceFile(
    fileName,
    specContent,
    ts.ScriptTarget.Latest,
    true,
    ts.ScriptKind.TS,
  );

  let specInterface: ts.InterfaceDeclaration | undefined;

  const visit = (node: ts.Node): void => {
    if (ts.isInterfaceDeclaration(node) && node.name.text === 'Spec') {
      specInterface = node;
      return;
    }
    ts.forEachChild(node, visit);
  };

  visit(sourceFile);

  if (!specInterface) {
    throw new Error('Could not find Spec interface');
  }

  const methods: string[] = [];

  for (const member of specInterface.members) {
    if (!ts.isMethodSignature(member)) {
      continue;
    }

    const name = member.name;
    if (!ts.isIdentifier(name)) {
      continue;
    }

    const methodName = name.text;
    if (!EXCLUDED_METHODS.has(methodName)) {
      methods.push(methodName);
    }
  }

  return sortUnique(methods);
}

export function extractAndroidReactMethods(javaContent: string): string[] {
  const methods: string[] = [];
  const methodRegex = /@ReactMethod\s+(?:@DoNotStrip\s+)?public abstract void (\w+)\s*\(/g;
  let match = methodRegex.exec(javaContent);
  while (match) {
    const name = match[1];
    if (!EXCLUDED_METHODS.has(name)) {
      methods.push(name);
    }
    match = methodRegex.exec(javaContent);
  }

  return sortUnique(methods);
}

/** ObjC TurboModule protocol methods from generated RNFB*TurboModules.h headers. */
export function extractIosTurboMethods(headerContent: string, moduleName: string): string[] {
  const protocolName = `${moduleName}Spec`;
  const start = headerContent.indexOf(`@protocol ${protocolName}`);
  if (start === -1) {
    throw new Error(`Could not find @protocol ${protocolName}`);
  }

  const end = headerContent.indexOf('\n@end', start);
  if (end === -1) {
    throw new Error(`Could not find @end for @protocol ${protocolName}`);
  }

  const block = headerContent.slice(start, end);
  const methods: string[] = [];
  const methodRegex = /- \([^)]+\)(\w+)(?::|;)/g;
  let match = methodRegex.exec(block);
  while (match) {
    const name = match[1];
    if (!EXCLUDED_METHODS.has(name)) {
      methods.push(name);
    }
    match = methodRegex.exec(block);
  }

  return sortUnique(methods);
}

function sortUnique(values: string[]): string[] {
  return [...new Set(values)].sort();
}

function readFileOrThrow(filePath: string): string {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Missing file: ${filePath}`);
  }
  return fs.readFileSync(filePath, 'utf8');
}

function findSingleMatch(rootDir: string, pattern: RegExp, label: string): string {
  const matches: string[] = [];

  function walk(dir: string): void {
    if (!fs.existsSync(dir)) {
      return;
    }
    for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
      const fullPath = path.join(dir, entry.name);
      if (entry.isDirectory()) {
        walk(fullPath);
      } else if (pattern.test(entry.name)) {
        matches.push(fullPath);
      }
    }
  }

  walk(rootDir);

  if (matches.length !== 1) {
    throw new Error(
      `${label}: expected exactly one match under ${rootDir}, found ${matches.length}${
        matches.length ? `: ${matches.join(', ')}` : ''
      }`,
    );
  }

  return matches[0];
}

export function discoverPackageSpecContexts(
  packageName: MigratedTurboPackage,
): SpecParityContext[] {
  const packageDir = path.join(REPO_ROOT, 'packages', packageName);
  const specsDir = path.join(packageDir, 'specs');
  const specFiles = fs
    .readdirSync(specsDir)
    .filter(file => file.startsWith('NativeRNFBTurbo') && file.endsWith('.ts'))
    .sort();

  const iosHeaderPath = findSingleMatch(
    path.join(packageDir, 'ios'),
    /^RNFB.*TurboModules\.h$/,
    `${packageName} iOS TurboModules header`,
  );

  return specFiles.map(specFile => {
    const moduleName = specFile.replace(/\.ts$/, '');
    const androidSpecPath = findSingleMatch(
      path.join(packageDir, 'android'),
      new RegExp(`^${moduleName}Spec\\.java$`),
      `${packageName} Android spec for ${moduleName}`,
    );

    return {
      packageName,
      moduleName,
      specPath: path.join(specsDir, specFile),
      androidSpecPath,
      iosHeaderPath,
    };
  });
}

export function collectSpecNativeParity(context: SpecParityContext): {
  spec: string[];
  android: string[];
  ios: string[];
  nativeUnion: string[];
} {
  const spec = extractSpecMethods(
    readFileOrThrow(context.specPath),
    path.basename(context.specPath),
  );
  const android = extractAndroidReactMethods(readFileOrThrow(context.androidSpecPath));
  const ios = extractIosTurboMethods(readFileOrThrow(context.iosHeaderPath), context.moduleName);
  const nativeUnion = sortUnique([...android, ...ios]);

  return { spec, android, ios, nativeUnion };
}

export function diffSets(left: string[], right: string[]): { missing: string[]; extra: string[] } {
  const leftSet = new Set(left);
  const rightSet = new Set(right);
  return {
    missing: left.filter(name => !rightSet.has(name)),
    extra: right.filter(name => !leftSet.has(name)),
  };
}

export function formatSetDiff(label: string, diff: { missing: string[]; extra: string[] }): string {
  const parts: string[] = [];
  if (diff.missing.length) {
    parts.push(`${label} missing: ${diff.missing.join(', ')}`);
  }
  if (diff.extra.length) {
    parts.push(`${label} extra: ${diff.extra.join(', ')}`);
  }
  return parts.join('; ');
}
