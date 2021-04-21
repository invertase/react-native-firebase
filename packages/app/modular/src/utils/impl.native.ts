import { isIOS, isNull, stripTrailingSlash } from '../common';
import { getNativeModule } from '../internal/native';
import { PlayServicesStatus, PlayServicesConnectionStatus, FilePaths } from './types';

type UtilsModule = {
  readonly isRunningInTestLab: boolean;
  readonly androidPlayServices: boolean;
  androidGetPlayServicesStatus(): Promise<PlayServicesStatus>;
  androidPromptForPlayServices(): Promise<void>;
  androidMakePlayServicesAvailable(): Promise<void>;
  androidResolutionForPlayServices(): Promise<void>;
} & FilePaths;

const bridge = getNativeModule<UtilsModule>({
  namespace: 'utils',
  nativeModule: 'RNFBUtilsModule',
  config: {
    events: [],
    // hasMultiAppSupport: true,
    hasCustomUrlOrRegionSupport: false,
  },
});

// Cached object of file paths.
let _paths: FilePaths | null = null;

/**
 * Returns a cached or new version of the native FilePaths.
 */
function processPathConstants(): FilePaths {
  if (!isNull(_paths)) {
    return _paths;
  }

  function getFilePath(path: keyof FilePaths): string | undefined {
    const value = bridge.module[path];
    if (value) return stripTrailingSlash(value);
  }

  _paths = {
    MAIN_BUNDLE: getFilePath('MAIN_BUNDLE'),
    CACHES_DIRECTORY: getFilePath('CACHES_DIRECTORY'),
    DOCUMENT_DIRECTORY: getFilePath('DOCUMENT_DIRECTORY'),
    EXTERNAL_DIRECTORY: getFilePath('EXTERNAL_DIRECTORY'),
    EXTERNAL_STORAGE_DIRECTORY: getFilePath('EXTERNAL_STORAGE_DIRECTORY'),
    TEMP_DIRECTORY: getFilePath('TEMP_DIRECTORY'),
    LIBRARY_DIRECTORY: getFilePath('LIBRARY_DIRECTORY'),
    PICTURES_DIRECTORY: getFilePath('PICTURES_DIRECTORY'),
    MOVIES_DIRECTORY: getFilePath('MOVIES_DIRECTORY'),
    FILE_TYPE_REGULAR: getFilePath('MOVIES_DIRECTORY'),
    FILE_TYPE_DIRECTORY: getFilePath('MOVIES_DIRECTORY'),
  };

  return _paths;
}

export const isRunningInTestLab = bridge.module.isRunningInTestLab;

export const playServicesAvailability = bridge.module.androidPlayServices;

export const FilePath = processPathConstants();

export async function getPlayServicesStatus(): Promise<PlayServicesStatus> {
  if (isIOS) {
    return {
      isAvailable: true,
      status: PlayServicesConnectionStatus.SUCCESS,
    };
  }

  return bridge.module.androidGetPlayServicesStatus();
}

export async function promptForPlayServices(): Promise<void> {
  return bridge.module.androidPromptForPlayServices();
}

export async function makePlayServicesAvailable(): Promise<void> {
  if (isIOS) {
    return;
  }

  return bridge.module.androidMakePlayServicesAvailable();
}

export async function resolutionForPlayServices(): Promise<void> {
  if (isIOS) {
    return;
  }

  return bridge.module.androidResolutionForPlayServices();
}
