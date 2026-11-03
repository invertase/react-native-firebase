import { createHash } from 'crypto';

import type { ObjcTarget, SwiftTarget, Target } from './targets';
import type { ReactDescriptor, ReactPackageRef } from './types';

export const PACKAGE_NAME = 'ReactNativeFirebase';
const FIREBASE_PACKAGE = 'firebase-ios-sdk';
const REACT_CODEGEN_PACKAGE = 'React-GeneratedCode';

export interface IosSdkVersions {
  firebase: string;
  firebaseSpmUrl: string;
  iosTarget: string;
  macosTarget: string;
  tvosTarget: string;
}

export interface ManifestInput {
  targets: Target[];
  react: ReactDescriptor;
  /** Where React Native writes the app's codegen package. */
  reactCodegenPath: string;
  sdk: IosSdkVersions;
  /** Header farm file names per module: part of the layout, but not listed in the manifest. */
  headers: Record<string, string[]>;
}

const swift = (value: string) => JSON.stringify(value);
const list = (values: string[]) => `[${values.map(swift).join(', ')}]`;

export function renderManifest(input: ManifestInput): string {
  const body = renderBody(input);
  const layoutHash = createHash('sha256')
    .update(JSON.stringify({ body, headers: input.headers }))
    .digest('hex')
    .slice(0, 16);
  return `// swift-tools-version: 6.0
// Written by @react-native-firebase/app on every React Native SwiftPM sync. Do not edit.
// Layout: ${layoutHash}
${body}`;
}

function renderBody({ targets, react, reactCodegenPath, sdk }: ManifestInput): string {
  const packages = [
    reactPackage(react.packageRef),
    ...(react.products.some(product => product.package === REACT_CODEGEN_PACKAGE)
      ? [`.package(name: ${swift(REACT_CODEGEN_PACKAGE)}, path: ${swift(reactCodegenPath)})`]
      : []),
    `.package(url: ${swift(sdk.firebaseSpmUrl)}, exact: ${swift(sdk.firebase)})`,
  ];

  return `import PackageDescription

let react: [Target.Dependency] = [
${react.products.map(p => `    .product(name: ${swift(p.name)}, package: ${swift(p.package)}),`).join('\n')}
]

func firebase(_ products: String...) -> [Target.Dependency] {
    products.map { .product(name: $0, package: ${swift(FIREBASE_PACKAGE)}) }
}

func cSettings(_ headerSearchPaths: [String]) -> [CSetting] {
    headerSearchPaths.map { .headerSearchPath($0) } + [
        .define("DEBUG", .when(configuration: .debug)),
        .define("NDEBUG", .when(configuration: .release)),
    ]
}

func cxxSettings(_ headerSearchPaths: [String]) -> [CXXSetting] {
    headerSearchPaths.map { .headerSearchPath($0) } + [
        .define("DEBUG", .when(configuration: .debug)),
        .define("NDEBUG", .when(configuration: .release)),
    ]
}

func objcTarget(
    _ name: String,
    sources: [String],
    headerSearchPaths: [String],
    dependencies: [Target.Dependency],
    frameworks: [String] = []
) -> Target {
    .target(
        name: name,
        dependencies: dependencies + react,
        path: "Targets/\\(name)",
        sources: sources,
        publicHeadersPath: "Public",
        cSettings: cSettings(headerSearchPaths),
        cxxSettings: cxxSettings(headerSearchPaths),
        linkerSettings: (["UIKit", "Foundation", "CoreGraphics"] + frameworks).map { .linkedFramework($0) }
    )
}

func swiftTarget(_ name: String, sources: [String], dependencies: [Target.Dependency]) -> Target {
    .target(name: name, dependencies: dependencies, path: "Targets/\\(name)", sources: sources)
}

let package = Package(
    name: ${swift(PACKAGE_NAME)},
    platforms: [.iOS(${swift(sdk.iosTarget)}), .macOS(${swift(sdk.macosTarget)}), .tvOS(${swift(sdk.tvosTarget)})],
    products: [
        .library(name: ${swift(PACKAGE_NAME)}, targets: ${list(targets.map(t => t.name))}),
    ],
    dependencies: [
${packages.map(declaration => `        ${declaration},`).join('\n')}
    ],
    targets: [
${targets.map(t => (t.kind === 'swift' ? renderSwiftTarget(t) : renderObjcTarget(t))).join('\n')}
    ],
    swiftLanguageModes: [.v5],
    cxxLanguageStandard: .cxx20
)
`;
}

function reactPackage(ref: ReactPackageRef): string {
  return 'path' in ref
    ? `.package(name: ${swift(ref.name)}, path: ${swift(ref.path)})`
    : `.package(url: ${swift(ref.url)}, exact: ${swift(ref.version)})`;
}

function renderSwiftTarget(target: SwiftTarget): string {
  return call('swiftTarget', target.name, [
    `sources: ${sourceList(target.sources)}`,
    `dependencies: ${dependencies(target)}`,
  ]);
}

function renderObjcTarget(target: ObjcTarget): string {
  return call('objcTarget', target.name, [
    `sources: ${sourceList(target.sources)}`,
    `headerSearchPaths: ${list(target.headerSearchPaths)}`,
    `dependencies: ${dependencies(target)}`,
    ...(target.frameworks.length > 0 ? [`frameworks: ${list(target.frameworks)}`] : []),
  ]);
}

function call(helper: string, name: string, args: string[]): string {
  return `        ${helper}(
            ${swift(name)},
${args.map(arg => `            ${arg}`).join(',\n')}
        ),`;
}

function sourceList(sources: string[]): string {
  return `[
${sources.map(source => `                ${swift(source)},`).join('\n')}
            ]`;
}

function dependencies({ dependencies: targets, firebaseProducts }: Target): string {
  const parts = [
    ...(targets.length > 0 || firebaseProducts.length === 0 ? [list(targets)] : []),
    ...(firebaseProducts.length > 0 ? [`firebase(${firebaseProducts.map(swift).join(', ')})`] : []),
  ];
  return parts.join(' + ');
}
