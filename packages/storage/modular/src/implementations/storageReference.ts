import { pathParsed, pathLastComponent, pathParent } from '@react-native-firebase/app-exp/internal';
import { StorageReference, StorageService } from '../types';

export default class StorageReferenceImpl implements StorageReference {
  constructor(storage: StorageService, path: string) {
    const parent = pathParent(path);

    this.fullPath = pathParsed(path);
    this.bucket = storage.bucket;
    this.name = pathLastComponent(path);
    this.parent = parent ? new StorageReferenceImpl(storage, parent) : null;
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
