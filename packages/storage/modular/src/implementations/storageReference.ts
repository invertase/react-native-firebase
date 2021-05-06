import { pathParsed, pathLastComponent, pathParent } from '@react-native-firebase/app-exp/internal';
import { StorageReference, StorageService } from '../types';

export default class StorageReferenceImpl implements StorageReference {
  constructor(storage: StorageService, path: string) {
    this._storage = storage;
    this._path = path;
  }

  private _storage: StorageService;
  private _path: string;

  public get bucket() {
    return this._storage.bucket;
  }

  public get fullPath() {
    return pathParsed(this._path);
  }

  public get name() {
    return pathLastComponent(this._path);
  }

  public get parent() {
    const parent = pathParent(this._path);
    return parent ? new StorageReferenceImpl(this._storage, parent) : null;
  }

  public get root() {
    return new StorageReferenceImpl(this._storage, '/');
  }

  public get storage() {
    return this._storage;
  }

  // TODO(ehesp): Confirm correct format
  public toString(): string {
    return `gs://${this.bucket}/${this.fullPath}`;
  }
}
