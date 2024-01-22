import path from 'path';
import fs from 'fs';
import { minimatch } from 'minimatch';

export const modules = {
    app: 'App',
    firestore: 'Firestore',
    storage: 'Storage',
};

/**
 * Join paths together.
 */
export const join = path.join;

/**
 * The root location of the documentation.
 */
export const root = path.join(process.cwd(), '../docs');

/**
 * The root location of the packages.
 */
export const packages = path.join(process.cwd(), '../packages');

/**
 * Location to the screencasts file.
 */
export const screencasts = join(root, 'screencasts.json');

/**
 * Returns the path from the root docs
 * @param slug
 * @returns
 */
export const docsPath = (slug: string) => {
    // Check if slug is a markdown file or directory. If it's a directory, we
    // assume it's an index.md file.
    const path = join(root, slug);
    const isDirectory = fs
        .lstatSync(path, { throwIfNoEntry: false })
        ?.isDirectory();
    const filePath = isDirectory ? join(path, 'index.md') : `${path}.md`;
    return filePath;
};

export const removeMdExtensionFromFile = (fileContents: string): string => {
    return fileContents.replace(/(?<=\]\()(.*)(\.md)/gm, `$1`);
};

/**
 * Returns the path to a module overview document
 * @param module
 * @returns
 */
export const modulesPath = (module: string) => {
    const modulesPath = join(packages, module, 'docs', 'modules');
    const modulesFilePaths = listFiles(modulesPath);
    return modulesFilePaths[0];
};

/**
 * Paths to hosted icons for modules.
 */
export const icons = {
    admob: 'https://static.invertase.io/assets/firebase/google-admob.svg',
    analytics: 'https://static.invertase.io/assets/firebase/analytics.svg',
    auth: 'https://static.invertase.io/assets/firebase/authentication.svg',
    firestore:
        'https://static.invertase.io/assets/firebase/cloud-firestore.svg',
    functions:
        'https://static.invertase.io/assets/firebase/cloud-functions.svg',
    messaging:
        'https://static.invertase.io/assets/firebase/cloud-messaging.svg',
    storage: 'https://static.invertase.io/assets/firebase/cloud-storage.svg',
    app: 'https://static.invertase.io/assets/social/firebase-logo.png',
    crashlytics: 'https://static.invertase.io/assets/firebase/crashlytics.svg',
    database:
        'https://static.invertase.io/assets/firebase/realtime-database.svg',
    'dynamic-links':
        'https://static.invertase.io/assets/firebase/dynamic-links.svg',
    iid: 'https://static.invertase.io/assets/social/firebase-logo.png',
    'in-app-messaging':
        'https://static.invertase.io/assets/firebase/in-app-messaging.svg',
    ml: 'https://static.invertase.io/assets/firebase/ml-kit.svg',
    'remote-conifg':
        'https://static.invertase.io/assets/firebase/remote-config.svg',
    perf: 'https://static.invertase.io/assets/firebase/performance-monitoring.svg',
};

/**
 * The location of the sidebar.yaml file.
 */
export const sidebar = path.join(root, 'sidebar.yaml');

/**
 * Returns whether a file at a given path exists.
 * @param path
 * @returns
 */
export function exists(path: string) {
    return fs.existsSync(path);
}

/**
 * Reads a file as a string.
 * @param path
 * @returns
 */
export function readFile(path: string) {
    return fs.readFileSync(path, 'utf-8');
}

/**
 * Lists files in a directory, optionally using a glob matcher.
 * @param dir
 * @param match
 * @returns
 */
export function listFiles(dir: string, match?: string[]): string[] {
    let files: string[] = [];

    fs.readdirSync(dir).forEach((file) => {
        const fullPath = path.join(dir, file);
        if (fs.lstatSync(fullPath).isDirectory()) {
            files = [...files, ...listFiles(fullPath, match)];
        } else {
            if (!match) {
                files.push(fullPath);
            } else {
                for (const matcher of match) {
                    if (minimatch(fullPath, matcher)) {
                        files.push(fullPath);
                        break;
                    }
                }
            }
        }
    });

    return files;
}
