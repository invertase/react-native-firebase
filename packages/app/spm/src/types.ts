/**
 * The subset of React Native's SwiftPM autolinking plugin contract this plugin uses
 * (`react-native/scripts/spm/spm-types.js`).
 */

export interface AutolinkedDependency {
  name: string;
  root: string;
  /** `ios: null` when the dependency's react-native.config.js disables iOS autolinking. */
  platforms?: { ios?: object | null };
}

export type ReactPackageRef =
  | { name: string; path: string; relPath?: string }
  | { name: string; url: string; version: string };

export interface ReactProduct {
  name: string;
  package: string;
}

export interface ReactDescriptor {
  packageRef: ReactPackageRef;
  products: ReactProduct[];
}

export interface PluginContext {
  appRoot: string;
  projectRoot: string;
  reactNativeRoot: string;
  outputDir: string;
  autolinking: { dependencies?: Record<string, AutolinkedDependency> };
  react?: ReactDescriptor | null;
}

export interface PluginScriptPhase {
  id: string;
  name: string;
  script: string;
  position: 'beforeCompile' | 'end';
  inputPaths?: string[];
  alwaysOutOfDate?: boolean;
}

export interface PluginResult {
  packageDependencies: Array<{ name: string; path: string }>;
  productDependencies: Array<{ name: string; package: string }>;
  scriptPhases: PluginScriptPhase[];
  watchPaths: string[];
}
