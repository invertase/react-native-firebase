/**
 * Parses a given path, returning a default value or ensuring any trailing/starting `/` characters
 * are removed.
 *
 * @param path
 * @returns
 */
export function pathParsed(path?: string): string {
  if (path) {
    // Remove any trailing `/`.
    let _path = (path =
      path.length > 1 && path.endsWith('/') ? path.substring(0, path.length - 1) : path);

    // Remove any starting `/`.
    if (_path.startsWith('/') && _path.length > 1) {
      _path = _path.substring(1, path.length);
    }

    return _path;
  }

  return '/';
}

/**
 * Returns all none empty pieces of the path.
 *
 * @param path
 * @returns
 */
export function pathPieces(path?: string) {
  return pathParsed(path)
    .split('/')
    .filter(p => p.length > 0);
}

/**
 * Returns the last element of a path (after the last `/`).
 *
 * @param path
 * @returns
 */
export function pathKey(path?: string): string | null {
  const parsed = pathParsed(path);
  return parsed === '/' ? null : parsed.substring(parsed.lastIndexOf('/') + 1);
}

/**
 * Returns the next parent of the path e.g. /foo/bar/car -> /foo/bar
 *
 * @param path
 * @returns
 */
export function pathParent(path?: string): string | null {
  const parsed = pathParsed(path);

  if (parsed === '/') {
    return null;
  }

  const index = parsed.lastIndexOf('/');
  if (index <= 0) {
    return null;
  }

  return parsed.slice(0, index);
}

/**
 * Returns the last component of a path, e.g /foo/bar.jpeg -> bar.jpeg
 *
 * @param path
 * @returns
 */
export function pathLastComponent(path?: string): string {
  const parsed = pathParsed(path);
  const index = parsed.lastIndexOf('/', parsed.length - 2);

  if (index === -1) {
    return parsed;
  }

  return parsed.slice(index + 1);
}

/**
 * Joins a parent and child path together.
 *
 * @param parent
 * @param child
 * @returns
 */
export function pathJoin(parent: string, child?: string) {
  const parentParsed = pathParsed(parent);
  const childParsed = pathParsed(child);

  const canonicalChildPath = pathPieces(childParsed).join('/');

  if (parentParsed === '/') {
    return canonicalChildPath;
  }

  return `${parentParsed}/${canonicalChildPath}`;
}
