/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

/**
 * Returns the next parent of the path e.g. /foo/bar/car -> /foo/bar
 */
export function pathParent(path) {
  if (path.length === 0) {
    return null;
  }

  const index = path.lastIndexOf('/');
  if (index <= 0) {
    return null;
  }

  return path.slice(0, index);
}

/**
 * Joins a parent and a child path
 */
export function pathChild(path, childPath) {
  const canonicalChildPath = pathPieces(childPath).join('/');

  if (path.length === 0) {
    return canonicalChildPath;
  }

  return `${path}/${canonicalChildPath}`;
}

/**
 * Returns the last component of a path, e.g /foo/bar.jpeg -> bar.jpeg
 */
export function pathLastComponent(path) {
  const index = path.lastIndexOf('/', path.length - 2);
  if (index === -1) {
    return path;
  }

  return path.slice(index + 1);
}

/**
 * Returns all none empty pieces of the path
 * @param path
 * @returns {*}
 */
export function pathPieces(path) {
  return path.split('/').filter($ => $.length > 0);
}

/**
 * Returns whether a given path is empty
 * @param path
 * @returns {boolean}
 */
export function pathIsEmpty(path) {
  return !pathPieces(path).length;
}

/**
 * Converts a given path to a URL encoded string
 * @param path
 * @returns {string|string}
 */
export function pathToUrlEncodedString(path) {
  const pieces = pathPieces(path);
  let pathString = '';
  for (let i = 0; i < pieces.length; i++) {
    pathString += `/${encodeURIComponent(String(pieces[i]))}`;
  }
  return pathString || '/';
}

// eslint-disable-next-line no-control-regex
export const INVALID_PATH_REGEX = /[[\].#$\u0000-\u001F\u007F]/;

/**
 * Ensures a given path is a valid Firebase path
 * @param path
 * @returns {boolean}
 */
export function isValidPath(path) {
  return typeof path === 'string' && path.length !== 0 && !INVALID_PATH_REGEX.test(path);
}

// eslint-disable-next-line no-control-regex
export const INVALID_KEY_REGEX = /[\[\].#$\/\u0000-\u001F\u007F]/;

/**
 * Ensures a given key is a valid Firebase key
 * @param key
 * @returns {boolean}
 */
export function isValidKey(key) {
  return typeof key === 'string' && key.length !== 0 && !INVALID_KEY_REGEX.test(path);
}

/**
 * Converts a file path to a standardized string path
 * @param path
 * @returns {*}
 */
export function toFilePath(path) {
  let _filePath = path.replace('file://', '');
  if (_filePath.includes('%')) {
    _filePath = decodeURIComponent(_filePath);
  }
  return _filePath;
}
