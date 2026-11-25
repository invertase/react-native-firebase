import fs from 'fs';
import path from 'path';

import type { RnfbPackage } from './packages';
import type { PluginScriptPhase } from './types';

// Ids seed the Xcode build phase UUIDs, so they are pinned instead of derived from phase names,
// and a released id never changes. A package that adds an iOS script phase to its
// react-native.config.js needs an entry here; packages.test.ts fails until it has one.
const SCRIPT_PHASE_IDS: Record<string, string> = {
  '@react-native-firebase/app': '@react-native-firebase/app/core-config',
  '@react-native-firebase/crashlytics': '@react-native-firebase/crashlytics/config',
};

interface ConfigScriptPhase {
  name: string;
  path: string;
  execution_position?: 'before_compile' | 'after_compile' | 'any';
  input_files?: string[];
}

/** The iOS script phases a package declares for CocoaPods in its react-native.config.js. */
export function scriptPhasesFor(pkg: RnfbPackage, appRoot: string): PluginScriptPhase[] {
  const configPath = path.join(pkg.root, 'react-native.config.js');
  if (!fs.existsSync(configPath)) {
    return [];
  }
  const phases: ConfigScriptPhase[] =
    require(configPath).dependency?.platforms?.ios?.scriptPhases ?? [];
  if (phases.length === 0) {
    return [];
  }
  const table = 'SCRIPT_PHASE_IDS in packages/app/spm/src/scriptPhases.ts';
  if (phases.length > 1) {
    throw new Error(
      `${pkg.name}: declares ${phases.length} iOS script phases, but ${table} pins one id per package.`,
    );
  }
  const id = SCRIPT_PHASE_IDS[pkg.name];
  if (!id) {
    throw new Error(
      `${pkg.name}: its iOS script phase has no pinned id. Add '${pkg.name}' to ${table}.`,
    );
  }
  return phases.map(phase => ({
    id,
    name: phase.name,
    script: `bash "$SRCROOT/${path.relative(appRoot, path.join(pkg.root, phase.path))}"\n`,
    position: phase.execution_position === 'before_compile' ? 'beforeCompile' : 'end',
    inputPaths: phase.input_files ?? [],
    alwaysOutOfDate: true,
  }));
}
