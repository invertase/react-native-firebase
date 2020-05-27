import firebase from '../helpers/firebase';
import {
  Account,
  ProjectDetailAndroidApp,
  ProjectDetailIOSApp,
  ProjectDetail,
} from '../types/firebase';
import { AndroidProjectConfig, IOSProjectConfig } from '@react-native-community/cli-types';
import prompt from '../helpers/prompt';

async function getDisplayName() {
  return await prompt.input('Enter a display name for the App:');
}

export async function createAndroidApp(
  account: Account,
  androidReactNativeConfig: AndroidProjectConfig,
  projectDetail: ProjectDetail,
): Promise<ProjectDetailAndroidApp> {
  const displayName = await getDisplayName();
  const result = await firebase
    .api(account)
    .management.createAndroidApp(
      projectDetail.projectId,
      androidReactNativeConfig.packageName,
      displayName,
    );
  console.info(result);
  throw new Error();
}

export async function createIosApp(
  account: Account,
  iosProjectConfig: IOSProjectConfig,
  projectDetail: ProjectDetail,
): Promise<ProjectDetailIOSApp> {
  const displayName = await getDisplayName();
  const result = await firebase
    .api(account)
    .management.createIosApp(projectDetail.projectId, iosProjectConfig, displayName);
  console.info(result);
  throw new Error();
}
