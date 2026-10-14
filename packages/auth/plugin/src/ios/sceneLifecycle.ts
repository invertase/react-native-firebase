import fs from 'fs';
import path from 'path';

// Directories that never contain the app's own scene delegate but are expensive to walk.
const IGNORED_DIRECTORIES = new Set(['Pods', 'build', 'node_modules', 'DerivedData', '.git']);

const APP_DELEGATE_NAMES = new Set(['AppDelegate.swift', 'AppDelegate.m', 'AppDelegate.mm']);

export type SceneDelegateResolution =
  | { kind: 'found'; path: string }
  | { kind: 'missing' }
  | { kind: 'ambiguous'; candidates: string[] };

/**
 * Walk `platformProjectRoot` (typically `ios/`) and collect matching file paths, skipping
 * CocoaPods / build / Xcode bundle trees.
 */
function collectFilesNamed(
  platformProjectRoot: string,
  fileNamePredicate: (name: string) => boolean,
): string[] {
  if (!platformProjectRoot || !fs.existsSync(platformProjectRoot)) {
    return [];
  }

  const matches: string[] = [];
  const queue: string[] = [platformProjectRoot];
  while (queue.length > 0) {
    const directory = queue.shift() as string;

    let entries: fs.Dirent[];
    try {
      entries = fs.readdirSync(directory, { withFileTypes: true });
    } catch {
      continue;
    }

    for (const entry of entries) {
      const entryPath = path.join(directory, entry.name);
      if (entry.isDirectory()) {
        if (
          !IGNORED_DIRECTORIES.has(entry.name) &&
          !entry.name.endsWith('.xcodeproj') &&
          !entry.name.endsWith('.xcworkspace')
        ) {
          queue.push(entryPath);
        }
      } else if (fileNamePredicate(entry.name)) {
        matches.push(entryPath);
      }
    }
  }

  return matches.sort();
}

/**
 * Resolve the application target's `SceneDelegate.swift` deterministically.
 *
 * - Zero candidates → missing.
 * - Exactly one candidate → that file (Expo nested layout or bare-expo `ios/` root).
 * - Multiple candidates → prefer the one co-located with an `AppDelegate.*`; if that is not
 *   unique, reject as ambiguous rather than patching a distractor (extension / secondary target).
 */
export function resolveSceneDelegateFile(platformProjectRoot: string): SceneDelegateResolution {
  const candidates = collectFilesNamed(platformProjectRoot, name => name === 'SceneDelegate.swift');
  if (candidates.length === 0) {
    return { kind: 'missing' };
  }
  if (candidates.length === 1) {
    return { kind: 'found', path: candidates[0] };
  }

  const appDelegateDirs = new Set(
    collectFilesNamed(platformProjectRoot, name => APP_DELEGATE_NAMES.has(name)).map(p =>
      path.dirname(p),
    ),
  );
  const coLocated = candidates.filter(candidate => appDelegateDirs.has(path.dirname(candidate)));
  if (coLocated.length === 1) {
    return { kind: 'found', path: coLocated[0] };
  }

  return { kind: 'ambiguous', candidates };
}

/**
 * Locate the app's `SceneDelegate.swift`, or `null` when none exists or resolution is ambiguous.
 *
 * Expo SDK 58 writes it next to `AppDelegate.swift` (`ios/<ProjectName>/SceneDelegate.swift`), but
 * `apps/bare-expo` keeps it at `ios/SceneDelegate.swift`, so search rather than assume a layout.
 */
export function findSceneDelegateFile(platformProjectRoot: string): string | null {
  const resolution = resolveSceneDelegateFile(platformProjectRoot);
  return resolution.kind === 'found' ? resolution.path : null;
}

/**
 * Detect a `UIApplicationSceneManifest` entry in the app's `Info.plist`.
 *
 * Independent of `findSceneDelegateFile`: a project can declare the scene life cycle without shipping
 * a `SceneDelegate.swift` the plugin can patch, and callers need to tell the two cases apart.
 */
export function infoPlistDeclaresSceneManifest(platformProjectRoot: string): boolean {
  if (!platformProjectRoot) {
    return false;
  }

  let entries: fs.Dirent[];
  try {
    entries = fs.readdirSync(platformProjectRoot, { withFileTypes: true });
  } catch {
    return false;
  }

  for (const entry of entries) {
    if (!entry.isDirectory() || IGNORED_DIRECTORIES.has(entry.name)) {
      continue;
    }
    const infoPlist = path.join(platformProjectRoot, entry.name, 'Info.plist');
    try {
      if (
        fs.existsSync(infoPlist) &&
        fs.readFileSync(infoPlist, 'utf-8').includes('UIApplicationSceneManifest')
      ) {
        return true;
      }
    } catch {
      continue;
    }
  }

  return false;
}
