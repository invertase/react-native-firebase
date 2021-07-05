import { ModPlatform, withDangerousMod, ConfigPlugin } from '@expo/config-plugins';
import { ExpoConfig } from '@expo/config-types';
import fs from 'fs/promises';
import path from 'path';

interface CopyFileProps {
  platform: ModPlatform;
  from: string;
  to: string;
}

export const withCopyFile: ConfigPlugin<CopyFileProps> = (
  config: ExpoConfig,
  { platform, from, to },
) =>
  withDangerousMod(config, [
    platform,
    async config => {
      const srcPath = path.resolve(config.modRequest.projectRoot, from);
      const destPath = path.resolve(config.modRequest.platformProjectRoot, to);
      await fs.copyFile(srcPath, destPath);
      return config;
    },
  ]);
