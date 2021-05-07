import path from 'path';
import fs from 'fs';
import minimatch from 'minimatch';

/**
 * The root location of the documentation.
 */
export const root = path.join(__dirname, '../../../../docs');

/**
 * The root location of the packages.
 */
export const packages = path.join(__dirname, '../../../../../packages');

/**
 * The location of the sidebar.yaml file.
 */
export const sidebar = path.join(root, 'sidebar.yaml');

/**
 * Join paths together.
 */
export const join = path.join;

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
  let files = [];

  fs.readdirSync(dir).forEach(file => {
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
