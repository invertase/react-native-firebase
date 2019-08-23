/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

import { ReactNativeFirebase } from '@react-native-firebase/app';

/**
 * Firebase Notifications package for React Native.
 *
 * #### Example 1
 *
 * Access the firebase export from the `notifications` package:
 *
 * ```js
 * import { firebase } from '@react-native-firebase/notifications';
 *
 * // firebase.notifications().X
 * ```
 *
 * #### Example 2
 *
 * Using the default export from the `notifications` package:
 *
 * ```js
 * import notifications from '@react-native-firebase/notifications';
 *
 * // notifications().X
 * ```
 *
 * #### Example 3
 *
 * Using the default export from the `app` package:
 *
 * ```js
 * import firebase from '@react-native-firebase/app';
 * import '@react-native-firebase/notifications';
 *
 * // firebase.notifications().X
 * ```
 *
 * @firebase notifications
 */
export namespace Notifications {
  import FirebaseModule = ReactNativeFirebase.FirebaseModule;

  export interface Statics {
    AndroidBadgeIconType: AndroidBadgeIconType;
    AndroidCategory: AndroidCategory;
    AndroidGroupAlertBehavior: AndroidGroupAlertBehavior;
    AndroidPriority: AndroidPriority;
    AndroidVisibility: AndroidVisibility;
    AndroidRepeatInterval: AndroidRepeatInterval;
    AndroidDefaults: AndroidDefaults;
  }

  export interface Notification {
    notificationId?: string;
    title?: string;
    subtitle?: string;
    body: string;
    data?: { [key: string]: string };
    ios?: IOSNotification;
    android?: AndroidNotification;
    sound?: string;
  }

  export interface IOSNotification {
    /**
     * @ios iOS 10+
     */
    attachment?: IOSAttachment;

    /**
     * @ios iOS 9 Only
     */
    alertAction?: string;

    badge?: number;

    // todo ios categories?
    category?: string;

    /**
     * @ios iOS 9 Only
     */
    hasAction?: boolean;

    launchImage?: string;

    /**
     * @ios iOS 10+
     */
    threadIdentifier?: string;

    // todo
    complete?: Function;
  }

  export interface IOSAttachment {
    identifier: string;
    url: string;
    options?: IOSAttachmentOptions;
  }

  // TODO whats required here?
  export interface IOSAttachmentOptions {
    typeHint: string;
    thumbnailHidden?: boolean;
    thumbnailClippingRect?: object;
    thumbnailTime: number;
  }

  export interface AndroidNotification {
    actions?: AndroidAction[];

    /**
     * Setting this flag will make it so the notification is automatically canceled when the user
     * clicks it in the panel.
     *
     * Defaults to `false`.
     */
    autoCancel?: boolean;

    /**
     * Sets which icon to display as a badge for this notification.
     *
     * **Note**: This value might be ignored, for launchers that don't support badge icons.
     */
    badgeIconType?:
      | AndroidBadgeIconType.NONE
      | AndroidBadgeIconType.SMALL
      | AndroidBadgeIconType.LARGE;

    bigPictureStyle?: AndroidBigPictureStyle;

    bigTextStyle?: AndroidBigTextStyle;

    category?:
      | AndroidCategory.ALARM
      | AndroidCategory.CALL
      | AndroidCategory.EMAIL
      | AndroidCategory.ERROR
      | AndroidCategory.EVENT
      | AndroidCategory.MESSAGE
      | AndroidCategory.NAVIGATION
      | AndroidCategory.PROGRESS
      | AndroidCategory.PROMO
      | AndroidCategory.RECOMMENDATION
      | AndroidCategory.REMINDER
      | AndroidCategory.SERVICE
      | AndroidCategory.SOCIAL
      | AndroidCategory.STATUS
      | AndroidCategory.SYSTEM
      | AndroidCategory.TRANSPORT;

    channelId?: string;

    clickAction?: string; // todo

    /**
     * Set an custom accent color for the notification. If not provided, the default notification
     * system color will be used.
     *
     * The color can be a predefined system `AndroidColor` or [hexadecimal](https://gist.github.com/lopspower/03fb1cc0ac9f32ef38f4).
     *
     * #### Example
     *
     * Using a predefined color.
     *
     * ```js
     * import notification, { AndroidColor } from '@react-native-firebase/notifications';
     *
     * await notification.displayNotification({
     *   android: {
     *     color: AndroidColor.AQUA,
     *   },
     * });
     * ```
     *
     * #### Example
     *
     * Using a hexadecimal color.
     *
     * ```js
     * import notification, { AndroidColor } from '@react-native-firebase/notifications';
     *
     * await notification.displayNotification({
     *   android: {
     *     color: '#2196f3', // material blue
     *     // color: '#802196f3', // 50% opacity material blue
     *   },
     * });
     * ```
     */
    color?: AndroidColor;

    /**
     *
     */
    colorized?: boolean;

    contentInfo?: string;

    defaults?: AndroidDefaults[];

    group?: string;

    groupAlertBehaviour?:
      | AndroidGroupAlertBehavior.ALL
      | AndroidGroupAlertBehavior.SUMMARY
      | AndroidGroupAlertBehavior.CHILDREN;

    groupSummary?: boolean;

    largeIcon?: string;

    lights?: [string, number, number];

    localOnly?: boolean;

    number?: number;

    ongoing?: boolean;

    onlyAlertOnce?: boolean;

    priority?:
      | AndroidPriority.DEFAULT
      | AndroidPriority.HIGH
      | AndroidPriority.LOW
      | AndroidPriority.MAX
      | AndroidPriority.MIN
      | AndroidPriority.NONE;

    progress?: AndroidProgress;

    remoteInputHistory?: string[];

    shortcutId?: string;

    showWhenTimestamp?: boolean;

    // missing level? deprecate it?
    smallIcon?: string;

    sortKey?: string;

    ticker?: string;

    timeoutAfter?: number;

    usesChronometer?: boolean;

    vibrate?: boolean;

    vibratePattern?: number[];

    visibility?: AndroidVisibility.PRIVATE | AndroidVisibility.PUBLIC | AndroidVisibility.SECRET;

    when?: number;
  }

  export interface AndroidAction {
    action: string;
    icon: string;
    title: string;
    allowGeneratedReplies?: boolean;
    remoteInputs?: AndroidRemoteInput[];
    semanticAction?: AndroidSemanticAction;
    showUserInterface?: boolean; // true
  }

  export interface AndroidRemoteInput {
    key: string;
    extras?: { [key: string]: string };
    allowDataTypes?: string[];
    allowFreeFormTextInput?: boolean; // true
    choices?: string[];
    label?: string;
  }

  export interface AndroidSemanticAction {
    ARCHIVE: 5;
    CALL: 10;
    DELETE: 4;
    MARK_AS_READ: 2;
    MARK_AS_UNREAD: 3;
    MUTE: 6;
    NONE: 0;
    REPLY: 1;
    THUMBS_DOWN: 9;
    THUMBS_UP: 8;
    UNMUTE: 7;
  }

  export interface AndroidBadgeIconType {
    NONE: 0;
    SMALL: 1;
    LARGE: 2;
  }

  export interface AndroidBigPictureStyle {
    picture: string;
    largeIcon?: string;
    contentTitle?: string;
    summaryText?: string;
  }

  export interface AndroidBigTextStyle {
    text: string;
    contentTitle?: string;
    summaryText?: string;
  }

  export interface AndroidCategory {
    ALARM: 'alarm';
    CALL: 'call';
    EMAIL: 'email';
    ERROR: 'error';
    EVENT: 'event';
    MESSAGE: 'msg';
    NAVIGATION: 'navigation';
    PROGRESS: 'progress';
    PROMO: 'promo';
    RECOMMENDATION: 'recommendation';
    REMINDER: 'reminder';
    SERVICE: 'service';
    SOCIAL: 'social';
    STATUS: 'status';
    SYSTEM: 'sys';
    TRANSPORT: 'transport';
  }

  type AndroidColor =
    | string
    | 'red'
    | 'blue'
    | 'green'
    | 'black'
    | 'white'
    | 'gray'
    | 'cyan'
    | 'magenta'
    | 'yellow'
    | 'lightgray'
    | 'darkgray'
    | 'gray'
    | 'lightgrey'
    | 'darkgrey'
    | 'aqua'
    | 'fuchsia'
    | 'lime'
    | 'maroon'
    | 'navy'
    | 'olive'
    | 'purple'
    | 'silver'
    | 'teal';

  export interface AndroidDefaults {
    ALL: -1;
    SOUND: 1;
    VIBRATE: 2;
    LIGHTS: 4;
  }

  export interface AndroidGroupAlertBehavior {
    ALL: 0;
    SUMMARY: 1;
    CHILDREN: 2;
  }

  export interface AndroidPriority {
    DEFAULT: 3;
    HIGH: 4;
    LOW: 2;
    MAX: 5;
    MIN: 1;
    NONE: 0;
  }

  export interface AndroidProgress {
    max: number;
    progress: number;
    indeterminate?: boolean;
  }

  export interface AndroidVisibility {
    PRIVATE: 0;
    PUBLIC: 1;
    SECRET: -1;
  }

  export interface AndroidRepeatInterval {
    MINUTE: 'minute';
    HOUR: 'hour';
    DAY: 'day';
    WEEK: 'week';
  }

  export interface NotificationObserver {}

  export interface Schedule {
    /**
     * The date when the notification should first be shown, in milliseconds since 1970.
     *
     * #### Example
     *
     * Schedule notification to display 10 minutes from now.
     *
     * ```js
     * await firebase.notifications().scheduleNotification(notification, {
     *   fireDate: Date.now() + 600000,
     * });
     * ```
     */
    fireDate: number;

    /**
     * Whether the `fireDate` should be respected exactly.
     *
     * To help save battery, only set to `true` under scenarios where the notification
     * `fireDate` is critical.
     *
     * Defaults to `false`. Has no effect on iOS.
     *
     * @android
     */
    exact?: boolean;

    /**
     * How frequently after  the `fireDate` should the notification be repeated.
     *
     * If not present, the notification will only be displayed once on the given `fireDate`.
     *
     * #### Example
     *
     * Schedule notification to display 10 minutes from now, and repeat
     * every week
     *
     * ```js
     * import notifications, { AndroidRepeatInterval } from '@react-native-firebase/notifications';
     *
     * await firebase.notifications().scheduleNotification(notification, {
     *   fireDate: Date.now() + 600000,
     *   repeatInterval: AndroidRepeatInterval.WEEK,
     * });
     */
    repeatInterval?:
      | AndroidRepeatInterval.MINUTE
      | AndroidRepeatInterval.HOUR
      | AndroidRepeatInterval.DAY
      | AndroidRepeatInterval.WEEK;
  }

  export interface AndroidChannel {
    channelId: string;
    name: string;
    allowBubbles?: boolean; // todo not in v5
    bypassDnd?: boolean;
    description?: string;
    enableLights?: boolean;
    enableVibration?: boolean;
    groupId?: string;
    importance?: string; // todo importance or priority?
    lightColor?: string;
    lockscreenVisibility?: string; // todo
    showBadge?: boolean;
    sound?: string; // audio attributes?
    vibrationPattern?: number[];
  }

  export interface AndroidChannelGroup {
    channelGroupId: string;
    name: string;
    description?: string;
  }

  /**
   *
   * The Firebase Notifications service interface.
   *
   * > This module is available for the default app only.
   *
   * #### Example
   *
   * Get the Notifications service for the default app:
   *
   * ```js
   * const defaultAppNotifications = firebase.notifications();
   * ```
   */
  export class Module extends FirebaseModule {
    cancelAllNotifications(): Promise<void>;

    cancelNotification(notificationId: string): Promise<void>;

    createChannel(channel: AndroidChannel): Promise<void>;

    createChannels(channels: AndroidChannel[]): Promise<void>;

    createChannelGroup(channelGroup: AndroidChannelGroup): Promise<void>;

    createChannelGroups(channelGroups: AndroidChannelGroup[]): Promise<void>;

    deleteChannel(channelId: string): Promise<void>;

    deleteChannelGroup(channelGroupId: string): Promise<void>;

    displayNotification(notification: Notification): Promise<void>;

    // todo null if no badge?
    getBadge(): Promise<number | null>;

    getInitialNotification(): Promise<Notification | null>;

    getScheduledNotifications(): Promise<Notification[]>;

    onNotification(observer: NotificationObserver): Function;

    onNotificationDisplayed(observer: NotificationObserver): Function;

    onNotificationOpened(observer: NotificationObserver): Function;

    removeAllDeliveredNotifications(): Promise<void>;

    removeDeliveredNotification(notificationId: string): Promise<void>;

    scheduleNotification(notification: Notification, schedule: Schedule): Promise<void>;

    setBadge(badge: number): Promise<void>;
  }
}

declare module '@react-native-firebase/notifications' {
  import ReactNativeFirebaseModule = ReactNativeFirebase.Module;
  import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;

  const firebaseNamedExport: {} & ReactNativeFirebaseModule;
  export const firebase = firebaseNamedExport;

  const module: FirebaseModuleWithStaticsAndApp<Notifications.Module, Notifications.Statics>;
  export default module;
}

/**
 * Attach namespace to `firebase.` and `FirebaseApp.`.
 */
declare module '@react-native-firebase/app' {
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;
    interface Module {
      notifications: FirebaseModuleWithStaticsAndApp<Notifications.Module, Notifications.Statics>;
    }
    interface FirebaseApp {
      notifications(): Notifications.Module;
    }
  }
}
