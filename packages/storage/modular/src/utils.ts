import { btoa, dataUrlParts, isUndefined } from '@react-native-firebase/app-exp/internal';
import { toUploadMetadata } from './validation';
import { StringFormat, UploadMetadata } from './types';

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

export function decodeFilePath(filePath: string): string {
  let _filePath = filePath.replace('file://', '');
  if (_filePath.includes('%')) {
    _filePath = decodeURIComponent(_filePath);
  }
  return _filePath;
}

type DecodedStringFormat = {
  value: string;
  format: StringFormat;
  metadata: UploadMetadata;
};

export function decodeStringFormat(
  value: string,
  format: StringFormat,
  metadata?: UploadMetadata,
): DecodedStringFormat {
  if (format === StringFormat.RAW) {
    return {
      value: btoa(value),
      format: StringFormat.BASE64,
      metadata: metadata || toUploadMetadata({}),
    };
  } else if (format === StringFormat.DATA_URL) {
    const [base64String, mediaType] = dataUrlParts(value);

    if (isUndefined(base64String)) {
      throw new Error('decodeStringFormat: an invalid data_url string was provided');
    }

    if (metadata) {
      return {
        value: base64String,
        format: StringFormat.BASE64,
        metadata,
      };
    }

    return {
      value: base64String,
      format: StringFormat.BASE64,
      metadata: toUploadMetadata({
        contentType: mediaType,
      }),
    };
  }

  return { value, format, metadata: metadata || toUploadMetadata({}) };
}
