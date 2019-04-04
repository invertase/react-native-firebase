import '@react-native-firebase/config';
import '@react-native-firebase/functions';
import '@react-native-firebase/invites';
import { firebase } from '@react-native-firebase/analytics';

async () => {
  await firebase.config().activateFetched();
  await firebase.config().fetch(0);
  await firebase.config().fetch();
  const settings = await firebase.config().getConfigSettings();
  console.log(settings.isDeveloperModeEnabled);
  console.log(settings.lastFetchStatus);
  console.log(settings.lastFetchTime);

  await firebase.config().setConfigSettings({ isDeveloperModeEnabled: false });
  await firebase.config().setDefaults({ foo: null });
};
