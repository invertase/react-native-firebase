/**
 * @flow
 */

export const MessageType = {
  InitialMessage: 'InitialMessage',
  NotificationResponse: 'NotificationResponse',
  PresentNotification: 'PresentNotification',
  RemoteMessage: 'RemoteMessage',
  RemoteNotification: 'RemoteNotification',
  RemoteNotificationHandler: 'RemoteNotificationHandler',
};

export const PresentNotificationResult = {
  All: 'UNNotificationPresentationOptionAll',
  None: 'UNNotificationPresentationOptionNone',
};

export const RemoteNotificationResult = {
  NewData: 'UIBackgroundFetchResultNewData',
  NoData: 'UIBackgroundFetchResultNoData',
  ResultFailed: 'UIBackgroundFetchResultFailed',
};

export type MessageTypeType = $Values<typeof MessageType>;
export type PresentNotificationResultType = $Values<
  typeof PresentNotificationResult
>;
export type RemoteNotificationResultType = $Values<
  typeof RemoteNotificationResult
>;

export type Notification = {
  body: string,
  bodyLocalizationArgs?: string[],
  bodyLocalizationKey?: string,
  clickAction?: string,
  color?: string,
  icon?: string,
  link?: string,
  sound: string,
  subtitle?: string,
  tag?: string,
  title: string,
  titleLocalizationArgs?: string[],
  titleLocalizationKey?: string,
};

export type NativeMessage = {
  collapseKey?: string,
  data: { [string]: string },
  from?: string,
  messageId: string,
  messageType?: MessageTypeType,
  openedFromTray: boolean,
  notification?: Notification,
  sentTime?: number,
  to?: string,
  ttl?: number,
};
