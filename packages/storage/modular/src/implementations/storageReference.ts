import { StorageReference, StorageService } from '../types';

export default class StorageReferenceImpl implements StorageReference {
  public static fromPath(storage: StorageService, path: string): StorageReferenceImpl {
    return new StorageReferenceImpl(storage, '');
  }

  public static fromUrl(storage: StorageService, url: string): StorageReferenceImpl {
    return new StorageReferenceImpl(storage, '');
  }

  private constructor(storage: StorageService, fullPath: string) {
    this.fullPath = fullPath;
    this.bucket = storage.bucket;
    this.name = fullPath;
    this.parent = null;
    this.root = {} as StorageReference;
    this.storage = storage;
  }

  readonly bucket: string;
  readonly fullPath: string;
  readonly name: string;
  readonly parent: StorageReference | null;
  readonly root: StorageReference;
  readonly storage: StorageService;
}
