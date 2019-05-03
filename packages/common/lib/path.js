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
  const canonicalChildPath = childPath
    .split('/')
    .filter($ => $.length > 0)
    .join('/');

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
