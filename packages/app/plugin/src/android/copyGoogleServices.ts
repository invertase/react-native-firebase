import { ConfigPlugin } from '@expo/config-plugins';

import { withCopyFile } from '../utils';
import { DEFAULT_TARGET_PATH } from './constants';

/**
 * Copy `google-services.json`
 */
export const withCopyAndroidGoogleServices: ConfigPlugin<{
  relativePath: string;
}> = (config, { relativePath }) => {
  try {
    return withCopyFile(config, {
      platform: 'android',
      from: relativePath,
      to: DEFAULT_TARGET_PATH,
    });
  } catch (e) {
    throw new Error(
      `Cannot copy google-services.json, because the file ${relativePath} doesn't exist. Please provide a valid path in \`app.json\`.`,
    );
  }
};
