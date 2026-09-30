import fs from 'fs';
import path from 'path';

// Directories that never contain the app's own scene delegate but are expensive to walk.
const IGNORED_DIRECTORIES = new Set(['Pods', 'build', 'node_modules', 'DerivedData', '.git']);

/**
 * Locate the app's `SceneDelegate.swift`.
 *
 * Expo SDK 58 writes it next to `AppDelegate.swift` (`ios/<ProjectName>/SceneDelegate.swift`), but
 * `apps/bare-expo` keeps it at `ios/SceneDelegate.swift`, so search rather than assume a layout.
 */
export function findSceneDelegateFile(platformProjectRoot: string): string | null {
  if (!platformProjectRoot || !fs.existsSync(platformProjectRoot)) {
    return null;
  }

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
      } else if (entry.name === 'SceneDelegate.swift') {
        return entryPath;
      }
    }
  }

  return null;
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
