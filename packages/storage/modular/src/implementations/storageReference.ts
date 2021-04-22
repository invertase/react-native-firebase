import { StorageReference, StorageService } from '../types';

export default class StorageReferenceImpl implements StorageReference {
  constructor(storage: StorageService, fullPath: string) {
    this.fullPath = fullPath;
    this.bucket = storage.bucket;
    this.name = fullPath;
    this.parent = null;
    this.root = new StorageReferenceImpl(storage, '/');
    this.storage = storage;
  }

  readonly bucket: string;
  readonly fullPath: string;
  readonly name: string;
  readonly parent: StorageReference | null;
  readonly root: StorageReference;
  readonly storage: StorageService;

  // TODO(ehesp): Confirm correct format
  public toString(): string {
    return `gs://${this.bucket}/${this.fullPath}`;
  }
}
