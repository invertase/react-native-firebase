import { ConfigPlugin, withDangerousMod } from '@expo/config-plugins';

import { DEFAULT_TARGET_PATH } from './constants';
import path from 'path';
import fs from 'fs';

/**
 * Copy `google-services.json`
 */
export const withCopyAndroidGoogleServices: ConfigPlugin = config => {
  return withDangerousMod(config, [
    'android',
    async config => {
      if (!config.android?.googleServicesFile) {
        throw new Error(
          'Path to google-services.json is not defined. Please specify the `expo.android.googleServicesFile` field in app.json.',
        );
      }

      const srcPath = path.resolve(
        config.modRequest.projectRoot,
        config.android.googleServicesFile,
      );
      const destPath = path.resolve(config.modRequest.platformProjectRoot, DEFAULT_TARGET_PATH);

      try {
        await fs.promises.copyFile(srcPath, destPath);
      } catch (e) {
        throw new Error(
          `Cannot copy google-services.json, because the file ${srcPath} doesn't exist. Please provide a valid path in \`app.json\`.`,
        );
      }
      return config;
    },
  ]);
};
