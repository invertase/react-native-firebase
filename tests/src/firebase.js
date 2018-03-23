import { Platform } from 'react-native';

import firebase from 'firebase';
import RNfirebase from './../firebase';
import DatabaseContents from './tests/support/DatabaseContents';

// Verify logging works
RNfirebase.database.enableLogging(true);
RNfirebase.database.enableLogging(false);
RNfirebase.firestore.enableLogging(true);
RNfirebase.firestore.enableLogging(false);

// RNfirebase.utils().logLevel = 'debug';
// RNfirebase.utils().logLevel = 'info';
RNfirebase.utils().logLevel = 'warn'; // default

// Messaging and Notifications testing
const notifications = async () => {
  try {
    await RNfirebase.messaging().requestPermission();
    const instanceid = await RNfirebase.instanceid().get();
    console.log('instanceid: ', instanceid);
    const token = await RNfirebase.messaging().getToken();
    console.log('token: ', token);
    const initialNotification = await RNfirebase.notifications().getInitialNotification();
    console.log('initialNotification: ', initialNotification);

    RNfirebase.messaging().onMessage(message => {
      console.log('onMessage: ', message);
    });
    RNfirebase.messaging().onTokenRefresh(deviceToken => {
      dispatch(fcmTokenReceived(deviceToken));
    });
    RNfirebase.notifications().onNotification(notification => {
      console.log('onNotification: ', notification);
    });
    RNfirebase.notifications().onNotificationOpened(notification => {
      console.log('onNotificationOpened: ', notification);
    });
    RNfirebase.notifications().onNotificationDisplayed(notification => {
      console.log('onNotificationDisplayed: ', notification);
    });
    // RNfirebase.instanceid().delete();
    const channel = new RNfirebase.notifications.Android.Channel(
      'test',
      'test',
      RNfirebase.notifications.Android.Importance.Max
    );
    channel.setDescription('test channel');
    RNfirebase.notifications().android.createChannel(channel);
    RNfirebase.notifications().cancelAllNotifications();

    const remoteInput = new RNfirebase.notifications.Android.RemoteInput(
      'inputText'
    );
    remoteInput.setLabel('Message');
    const action = new RNfirebase.notifications.Android.Action(
      'test_action',
      'ic_launcher',
      'My Test Action'
    );
    action.addRemoteInput(remoteInput);

    const notification = new RNfirebase.notifications.Notification();
    notification
      .setTitle('Test title')
      .setBody('Test body')
      .setNotificationId('displayed')
      .android.addAction(action)
      .android.setChannelId('test')
      .android.setClickAction('action')
      .android.setPriority(RNfirebase.notifications.Android.Priority.Max);

    const date = new Date();
    date.setMinutes(date.getMinutes() + 1);
    setTimeout(() => {
      RNfirebase.notifications().displayNotification(notification);
      notification.setNotificationId('scheduled');
      RNfirebase.notifications()
        .scheduleNotification(notification, {
          fireDate: date.getTime(),
        })
        .then(() => {
          RNfirebase.notifications()
            .getScheduledNotifications()
            .then(scheduledNotifications =>
              console.log('scheduled: ', scheduledNotifications)
            );
        });
    }, 5);
  } catch (error) {
    console.error('messaging init error:', error);
  }
};

// notifications();

// Invitations testing
const invitations = async () => {
  try {
    const initialLink = await RNfirebase.links().getInitialLink();
    console.log('initialLink: ', initialLink);
    const initialInvite = await RNfirebase.invites().getInitialInvitation();
    console.log('initialInvite: ', initialInvite);

    RNfirebase.links().onLink(link => {
      console.log('onLink: ', link);
    });
    RNfirebase.invites().onInvitation(invite => {
      console.log('onInvitation: ', invite);
    });
    const invitation = new RNfirebase.invites.Invitation('Title', 'Message');
    invitation.setDeepLink('https://je786.app.goo.gl/testing');
    const invitationIds = await RNfirebase.invites().sendInvitation(invitation);
    console.log('InvitationIds: ', invitationIds);
  } catch (error) {
    console.error('invitations init error:', error);
  }
};

invitations();

const config = {
  apiKey: 'AIzaSyDnVqNhxU0Biit9nCo4RorAh5ulQQwko3E',
  authDomain: 'rnfirebase-b9ad4.firebaseapp.com',
  databaseURL: 'https://rnfirebase-b9ad4.firebaseio.com',
  storageBucket: 'rnfirebase-b9ad4.appspot.com',
  messagingSenderId: '305229645282',
};

const android = {
  // firebase android sdk completely ignores client id
  clientId:
    '305229645282-j8ij0jev9ut24odmlk9i215pas808ugn.apps.googleusercontent.com',
  appId: '1:305229645282:android:efe37851d57e1d05',
  apiKey: 'AIzaSyDnVqNhxU0Biit9nCo4RorAh5ulQQwko3E',
  databaseURL: 'https://rnfirebase-b9ad4.firebaseio.com',
  storageBucket: 'rnfirebase-b9ad4.appspot.com',
  messagingSenderId: '305229645282',
  projectId: 'rnfirebase-b9ad4',
};

const ios = {
  clientId:
    '305229645282-t29pn6o2t7se1f7rvrfsll4r0pvd6fb6.apps.googleusercontent.com',
  androidClientId: android.clientId,
  appId: '1:305229645282:ios:d9ef660bd02cc2f1',
  apiKey: 'AIzaSyAcdVLG5dRzA1ck_fa_xd4Z0cY7cga7S5A',
  databaseURL: 'https://rnfirebase-b9ad4.firebaseio.com',
  storageBucket: 'rnfirebase-b9ad4.appspot.com',
  messagingSenderId: '305229645282',
  projectId: 'rnfirebase-b9ad4',
};

const instances = {
  web: firebase.initializeApp(config),
  native: RNfirebase,
  another: RNfirebase.initializeApp(
    ios, // Platform.OS === 'ios' ? ios : android,
    'anotherApp'
  ),
};

console.log('RNApps -->', RNfirebase.apps);

// natively initialized apps are already available at app run time,
// no need for ready checks
instances.native
  .auth()
  .signInAnonymouslyAndRetrieveData()
  .then(credential => {
    if (credential) {
      console.log('anotherApp credential ->', credential.user.toJSON());
    }
  });

// dynamically initialized apps need a ready check
instances.another.onReady().then(app => {
  app
    .auth()
    .signInAnonymouslyAndRetrieveData()
    .then(credential => {
      if (credential) {
        console.log('anotherApp credential ->', credential.user.toJSON());
      }
    });
});

instances.web
  .database()
  .ref('tests/types')
  .set(DatabaseContents.DEFAULT);

instances.web
  .database()
  .ref('tests/priority')
  .setWithPriority(
    {
      foo: 'bar',
    },
    666
  );

instances.web
  .database()
  .ref('tests/query')
  .set(DatabaseContents.QUERY);

// instances.native.messaging().subscribeToTopic('fcm_test');

export default instances;
