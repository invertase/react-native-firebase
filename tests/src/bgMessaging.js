import RNfirebase from './../firebase';

export default async message => {
  console.log('Message', message);

  const notification = new RNfirebase.notifications.Notification();
  notification
    .setTitle('Background notification')
    .setBody('Background body')
    .setNotificationId('background')
    .android.setChannelId('test')
    .android.setClickAction('action')
    .android.setPriority(RNfirebase.notifications.Android.Priority.Max);

  await RNfirebase.notifications().displayNotification(notification);
  return Promise.resolve();
};
