import { describe, expect, it } from '@jest/globals';

import Reference from '../lib/StorageReference';
import { StringFormat } from '../lib/StorageStatics';
import type { StorageInternal } from '../lib/types/internal';

describe('StorageReference string uploads', () => {
  it('decodes a data URL when metadata already provides a content type', () => {
    const reference = new Reference({} as StorageInternal, '/file.txt');
    const metadata = { contentType: 'text/custom' };

    expect(
      reference._updateString('data:text/plain;base64,aGVsbG8=', StringFormat.DATA_URL, metadata),
    ).toEqual({
      _format: StringFormat.BASE64,
      _metadata: metadata,
      _string: 'aGVsbG8=',
    });
  });
});
