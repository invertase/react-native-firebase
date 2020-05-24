import firebase from '../helpers/firebase';
import { Account, ProjectDetailAndroidApp, ProjectDetail } from '../types/firebase';
import { AndroidProjectConfig } from '@react-native-community/cli-types';
import prompt from '../helpers/prompt';

export default async function createAndroidApp(
  account: Account,
  androidReactNativeConfig: AndroidProjectConfig,
  projectDetail: ProjectDetail,
): Promise<ProjectDetailAndroidApp> {
  const displayName = await prompt.input('Enter a display name for the App:');
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
