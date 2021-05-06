import { isObject, isString } from '@react-native-firebase/app-exp/internal';
import StorageServiceImpl from './implementations/storageService';
import StorageReferenceImpl from './implementations/storageReference';
import {
  FullMetadata,
  SettableMetadata,
  StorageReference,
  StorageService,
  UploadMetadata,
  UploadResult,
  StringFormat,
} from './types';

/**
 * Returns whether a value is a StorageService instance.
 *
 * @param storage
 * @returns
 */
export function isStorageService(storage: any): storage is StorageService {
  return storage instanceof StorageServiceImpl;
}

/**
 * Returns whether a value is a StorageReference instance.
 * @param reference
 * @returns
 */
export function isStorageReference(reference: any): reference is StorageReference {
  return reference instanceof StorageReferenceImpl;
}

/**
 * Returns whether a value is a StringFormat value.
 * @param format
 * @returns
 */
export function isStringFormat(format: any): format is StringFormat {
  return Object.values(StringFormat).includes(format);
}

/**
 * Returns a SettableMetadata object from a value.
 *
 * @param metadata
 * @returns
 */
export function toSettableMetadata(metadata: any): SettableMetadata {
  const customMetadata: { [key: string]: string } = {};

  if (isObject(metadata?.customMetadata)) {
    Object.entries(metadata.customMetadata).forEach(([key, value]) => {
      if (isString(value)) {
        customMetadata[key] = value;
      }
    });
  }

  return {
    cacheControl: metadata?.cacheControl ?? undefined,
    contentDisposition: metadata?.contentDisposition ?? undefined,
    contentEncoding: metadata?.contentEncoding ?? undefined,
    contentLanguage: metadata?.contentLanguage ?? undefined,
    contentType: metadata?.contentType ?? undefined,
    customMetadata,
  };
}

/**
 * Returns a UploadMetadata object from a value.
 *
 * @param metadata
 * @returns
 */
export function toUploadMetadata(metadata: any): UploadMetadata {
  return {
    ...toSettableMetadata(metadata),
    md5Hash: metadata?.md5Hash ?? undefined,
  };
}

/**
 * Returns a FullMetadata from a value.
 *
 * @param metadata
 * @returns
 */
export function toFullMetadata(metadata: any, ref?: StorageReference): FullMetadata {
  return {
    ...toUploadMetadata(metadata),
    bucket: metadata?.bucket ?? '',
    downloadTokens: metadata?.downloadTokens ?? [],
    fullPath: metadata?.fullPath ?? '',
    generation: metadata?.generation ?? '',
    metageneration: metadata?.generation ?? '',
    name: metadata?.name ?? '',
    ref,
    size: metadata?.size ?? 0,
    timeCreated: metadata?.timeCreated ?? '',
    updated: metadata?.updated ?? '',
  };
}

/**
 * Returns a UploadResult from a value.
 *
 * @param ref
 * @param value
 * @returns
 */
export function toUploadResult(ref: StorageReference, metadata: any): UploadResult {
  return {
    ref,
    metadata: toFullMetadata(metadata),
  };
}
