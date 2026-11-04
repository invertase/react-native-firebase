import type { ExternalProduct, RnfbPackage } from './packages';

const APP_MODULE = 'RNFBApp';
const APP_OBJC = `${APP_MODULE}ObjC`;

// Swift in these modules uses these ObjC classes. A Swift target cannot import the ObjC target
// that imports its generated header, so the classes move to a `<Module>Core` ObjC target below both.
const CORE_CLASSES: Record<string, string[]> = {
  RNFBFirestore: ['RNFBFirestoreCommon', 'RNFBFirestoreQuery', 'RNFBFirestoreSerialize'],
};

interface TargetBase {
  name: string;
  /** Module whose `ios/` folder the target's `root` link points at. */
  module: string;
  /** Paths relative to the target folder. */
  sources: string[];
  dependencies: string[];
  firebaseProducts: string[];
  externalProducts: ExternalProduct[];
}

export interface SwiftTarget extends TargetBase {
  kind: 'swift';
  /** A module re-exported to every Swift file through a generated source. */
  exportedImport?: string;
}

export interface ObjcTarget extends TargetBase {
  kind: 'objc';
  headerSearchPaths: string[];
  frameworks: string[];
  /** Headers of the target's explicit module, relative to the target folder; empty for none. */
  moduleHeaders: string[];
}

export type Target = SwiftTarget | ObjcTarget;

export const exportedImportSource = (module: string) => `Generated/${module}Import.swift`;

export function targetsFor(pkg: RnfbPackage): Target[] {
  const { module, sourceFolder, firebaseProducts, externalProducts } = pkg;
  const root = (iosPath: string) => `root/${iosPath}`;
  const isApp = module === APP_MODULE;
  const coreClasses = CORE_CLASSES[module] ?? [];
  const coreSources = coreClasses.map(name => `${sourceFolder}/${name}.m`);
  const core = coreClasses.length > 0 ? `${module}Core` : undefined;
  const swift = pkg.swiftSources.length > 0 ? module : undefined;
  const targets: Target[] = [];

  if (core) {
    targets.push({
      kind: 'objc',
      name: core,
      module,
      sources: coreSources.map(root),
      headerSearchPaths: [root(sourceFolder), 'headers', `headers/${APP_MODULE}`],
      dependencies: [APP_OBJC],
      firebaseProducts,
      externalProducts,
      frameworks: [],
      moduleHeaders: coreClasses.map(name => root(`${sourceFolder}/${name}.h`)),
    });
  }

  if (swift) {
    targets.push({
      kind: 'swift',
      name: swift,
      module,
      sources: [...pkg.swiftSources.map(root), ...(core ? [exportedImportSource(core)] : [])],
      dependencies: compact([core, isApp ? undefined : APP_MODULE]),
      // Swift sources import at most the package's primary (first) Firebase product.
      firebaseProducts: firebaseProducts.slice(0, 1),
      externalProducts,
      exportedImport: core,
    });
  }

  targets.push({
    kind: 'objc',
    name: swift ? `${module}ObjC` : module,
    module,
    sources: pkg.objcSources.filter(source => !coreSources.includes(source)).map(root),
    headerSearchPaths: [
      root(sourceFolder),
      'root/generated',
      `root/generated/${module}TurboModules`,
      'headers',
      `headers/${APP_MODULE}`,
    ],
    dependencies: compact([swift, core, ...(isApp ? [] : [APP_MODULE, APP_OBJC])]),
    firebaseProducts,
    externalProducts,
    frameworks: pkg.frameworks,
    moduleHeaders: [],
  });

  return targets;
}

const compact = (names: Array<string | undefined>) =>
  names.filter((name): name is string => name !== undefined);
