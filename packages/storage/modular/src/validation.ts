import StorageServiceImpl from 'implementations/storageService';
import StorageReferenceImpl from 'implementations/storageReference';
import { StorageReference, StorageService } from './types';

export function isStorageService(storage: any): storage is StorageService {
  return storage instanceof StorageServiceImpl;
}

export function isStorageReference(reference: any): reference is StorageReference {
  return reference instanceof StorageReferenceImpl;
}
