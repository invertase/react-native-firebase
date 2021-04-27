type PathParts = {
  bucket: string;
  path: string;
};

export function partsFromHttpUrl(url: string): PathParts | null {
  const decoded = decodeURIComponent(url);
  const parts = decoded.match(/\/b\/(.*)\/o\/([a-zA-Z0-9./\-_]+)(.*)/);

  if (!parts || parts.length < 3) {
    return null;
  }

  return { bucket: `gs://${parts[1]}`, path: parts[2] };
}

export function partsFromGsUrl(url: string): PathParts | null {
  const bucket = url.substring(0, url.indexOf('/', 5)) || url;
  const path =
    (url.indexOf('/', 5) > -1 ? url.substring(url.indexOf('/', 5) + 1, url.length) : '/') || '/';

  return { bucket, path };
}
