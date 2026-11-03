import fs from 'fs';
import path from 'path';

import type { RnfbPackage } from './packages';
import type { PluginScriptPhase } from './types';

// Ids seed the Xcode build phase UUIDs, so they are pinned instead of derived from phase names.
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
  const id = SCRIPT_PHASE_IDS[pkg.name];
  if (!id || phases.length > 1) {
    throw new Error(`${pkg.name}: no pinned SwiftPM script phase id for its iOS script phases.`);
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
