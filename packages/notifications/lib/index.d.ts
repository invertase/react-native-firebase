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
    AndroidImportance: AndroidImportance;
    AndroidColor: typeof AndroidColor;
    AndroidStyle: AndroidStyle;
  }

  /**
   * Interface for building a local notification for both Android & iOS devices.
   *
   * #### Example
   *
   * ```js
   * const notification = {
   *   body: 'Hello World!',
   *   title: 'Welcome',
   *   data: {
   *     user: '123',
   *   },
   *   android: {
   *     color: '#3f51b5',
   *   },
   *   ios: {
   *     alertAction: 'Open App',
   *   },
   * };
   *
   * await firebase.notifications().displayNotification(notification);
   * ```
   */
  export interface Notification {
    /**
     * The main body content of a notification. This field required and is the main body of your notification.
     *
     * On Android, if you wish to read the body when the notification is opened, add it to the `data` object.
     *
     * #### Example
     *
     * ![Body Text](https://prismic-io.s3.amazonaws.com/invertase%2F7f9cc068-c618-44f0-88da-6041c6d55f48_new+project+%2817%29.jpg)
     *
     * ```js
     * const notification = {
     *   body: 'Hello World!',
     * };
     *
     * await firebase.notifications().displayNotification(notification);
     * ```
     */
    body: string;

    /**
     * A unique identifier for your notification.
     *
     * Defaults to a random string.
     */
    notificationId?: string;

    /**
     * The notification title which appears above the body text.
     *
     * On Android, if you wish to read the title when the notification is opened, add it to the `data` object.
     *
     * #### Example
     *
     * ![Title Text](https://prismic-io.s3.amazonaws.com/invertase%2F6fa1dea9-8cf6-4e9a-b318-8d8f73d568cf_new+project+%2818%29.jpg)
     *
     * ```js
     * const notification = {
     *   title: 'Welcome!',
     *   body: 'Hello World!',
     * };
     *
     * await firebase.notifications().displayNotification(notification);
     * ```
     */
    title?: string;

    /**
     * The notification subtitle, which appears on a new line below the title.
     *
     * #### Example
     *
     * ![Title Text](https://prismic-io.s3.amazonaws.com/invertase%2F6fa1dea9-8cf6-4e9a-b318-8d8f73d568cf_new+project+%2818%29.jpg)
     *
     * ```js
     * const notification = {
     *   title: 'Welcome!',
     *   subtitle: 'Learn more...',
     *   body: 'Hello World!',
     * };
     *
     * await firebase.notifications().displayNotification(notification);
     * ```
     */
    subtitle?: string;

    /**
     * Additional data to store on the notification. Only `string` values can be stored.
     *
     * #### Example
     *
     * ```js
     * const notification = {
     *   body: 'Hello World!',
     *   data: {
     *     user: '123',
     *   }
     * };
     *
     * await firebase.notifications().displayNotification(notification);
     * ```
     */
    data?: { [key: string]: string };

    /**
     * iOS specific notification options. See the `IOSNotification` interface for more information
     * and default options which are applied to a notification.
     *
     * #### Example
     *
     * ```js
     * const notification = {
     *   body: 'Hello World!',
     *   ios: {
     *     alertAction: 'Open App',
     *   },
     * };
     *
     * await firebase.notifications().displayNotification(notification);
     * ```
     */
    ios?: IOSNotification;

    /**
     * Android specific notification options. See the `AndroidNotification` interface for more
     * information and default options which are applied to a notification.
     *
     * #### Example
     *
     * ```js
     * const notification = {
     *   body: 'Hello World!',
     *   android: {
     *     color: '#3f51b5',
     *   },
     * };
     *
     * await firebase.notifications().displayNotification(notification);
     * ```
     */
    android?: AndroidNotification;

    /**
     * Overrides the sound the notification is displayed with.
     *
     * The default value is `default`, which is the system default sound.
     *
     * TODO @ehesp FAQ/Guide on custom sounds
     */
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

  /**
   * The interface for Android specific options which are applied to a notification.
   *
   * #### Example
   *
   * ```js
   * const notification = {
   *   body: 'Hello World!',
   *   android: {
   *     color: '#3F51B5',
   *     autoCancel: false,
   *     ongoing: true,
   *   },
   * };
   *
   * await firebase.notifications().displayNotification(notification);
   * ```
   *
   * @android
   */
  export interface AndroidNotification {
    /**
     *
     */
    actions?: AndroidAction[];

    /**
     * Setting this flag will make it so the notification is automatically canceled when the user
     * clicks it in the panel.
     *
     * By default when the user taps a notification it is automatically removed from the notification
     * panel. Setting this to `false` will keep the notification in the panel.
     *
     * If `false`, the notification will persist in the notification panel after being pressed. It will
     * remain there until the user removes (e.g. swipes away) or is cancelled via `removeDeliveredNotification`.
     *
     * Defaults to `true`.
     */
    autoCancel?: boolean;

    /**
     * Starting with 8.0 (API level 26), notification badges (also known as notification dots) appear
     * on a launcher icon when the associated app has an active notification. Users can long-press
     * on the app icon to reveal the notifications (alongside any app shortcuts).
     *
     * ![Badges](https://developer.android.com/images/ui/notifications/badges-open_2x.png)
     *
     * If the notification is shown as a badge, this option can be set to control how the badge icon
     * is shown:
     *
     * - `NONE`: Always shows as a number.
     * - `SMALL`: Uses the icon provided to `smallIcon`.
     * - `LARGE`: Uses the icon provided to `largeIcon`.
     *
     * Defaults to `AndroidBadgeIconType.NONE`.
     */
    badgeIconType?:
      | AndroidBadgeIconType.NONE
      | AndroidBadgeIconType.SMALL
      | AndroidBadgeIconType.LARGE;

    /**
     * Assigns the notification to a category. Use the one which best describes the notification.
     *
     * The category may be used by the device for ranking and filtering.
     *
     * ```js
     * const notification = {
     *   body: 'Congratulations...',
     *   android: {
     *     category: firebase.notifications.AndroidCategory.MESSAGE,
     *   },
     * };
     *
     * await firebase.notifications().displayNotification(notification);
     * ```
     */
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

    /**
     * Specified the `AndroidChannel` which the notification will be delivered on.
     *
     * TODO required on some APIs
     */
    channelId?: string;

    /**
     * A click action is used to help identify a notification which is being handled by your application.
     *
     * #### Example
     *
     * ```js
     * const notification = {
     *   body: 'Update your settings',
     *   android: {
     *     channelId: 'open_settings',
     *   },
     * };
     *
     * await firebase.notifications().displayNotification(notification);
     *
     * ...
     *
     * // The user taps the notification....
     * const notification = await firebase.notifications().getInitialNotification();
     *
     * if (notification.android.clickAction === 'open_settings') {
     *   // open settings view
     * }
     * ```
     */
    clickAction?: string;

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
    color?: AndroidColor | string;

    /**
     * Set whether this notification should be colorized. When set, the color set with `color`
     * will be used as the background color of this notification.
     *
     * This should only be used for high priority ongoing tasks like navigation, an ongoing call,
     * or other similarly high-priority events for the user.
     *
     * For most styles, the coloring will only be applied if the notification is for a foreground service notification.
     */
    colorized?: boolean;

    // TODO is this needed? https://stackoverflow.com/a/40753998/11760094 - use subtext instead?
    contentInfo?: string;

    // todo
    defaults?: AndroidDefaults[];

    /**
     * Set this notification to be part of a group of notifications sharing the same key. Grouped notifications may
     * display in a cluster or stack on devices which support such rendering.
     *
     * To make this notification the summary for its group, set `groupSummary` to `true`.
     *
     * ![Grouped Notifications](https://developer.android.com/images/ui/notifications/notification-group_2x.png)
     *
     * ```js
     * import notification from '@react-native-firebase/notifications';
     *
     * await notification.displayNotification({
     *   android: {
     *     group: message.group.id,
     *   },
     * });
     * ```
     */
    group?: string;

    /**
     * Sets the group alert behavior for this notification. Use this method to mute this notification
     * if alerts for this notification's group should be handled by a different notification. This is
     * only applicable for notifications that belong to a `group`. This must be called on all notifications
     * you want to mute. For example, if you want only the summary of your group to make noise, all
     * children in the group should have the group alert behavior `AndroidGroupAlertBehavior.SUMMARY`.
     *
     * See `AndroidGroupAlertBehavior` for more information on different behaviours.
     *
     * Defaults to `AndroidGroupAlertBehavior.ALL`.
     *
     * #### Example
     *
     * ```js
     * import notification, { AndroidGroupAlertBehavior } from '@react-native-firebase/notifications';
     *
     * await notification.displayNotification({
     *   android: {
     *     group: message.group.id,
     *     groupAlertBehaviour: AndroidGroupAlertBehavior.CHILDREN,
     *   },
     * });
     * ```
     */
    groupAlertBehaviour?:
      | AndroidGroupAlertBehavior.ALL
      | AndroidGroupAlertBehavior.SUMMARY
      | AndroidGroupAlertBehavior.CHILDREN;

    /**
     * Whether this notification should be a group summary.
     *
     * If `true`, Set this notification to be the group summary for a group of notifications. Grouped notifications may display in
     * a cluster or stack on devices which support such rendering. Requires a `group` key to be set.
     *
     * Defaults to `false`.
     */
    groupSummary?: boolean;

    /**
     * Sets a large icon on the notification.
     *
     * ![Large Icon](https://prismic-io.s3.amazonaws.com/invertase%2F3f2f803e-b9ae-4e6b-8b58-f0b8ab01aa52_new+project+%2819%29.jpg)
     *
     * TODO: example, URL?
     */
    largeIcon?: string;

    /**
     * Sets the color and frequency of the light pattern. This only has effect on supported devices.
     *
     * The option takes an array containing a hexadecimal color value or predefined `AndroidColor`,
     * along with the number of milliseconds to show the light, and the number of milliseconds to
     * turn off the light. The light frequency pattern is repeated.
     *
     * #### Example
     *
     * Show a red light, for 300ms and turn it off for 600ms.
     *
     * ```js
     * await notification.displayNotification({
     *   android: {
     *     lights: ['#f44336', 300, 600],
     *   },
     * });
     * ```
     */
    lights?: [string, number, number];

    /**
     * Set whether or not this notification is only relevant to the current device.
     *
     * Some notifications can be bridged to other devices for remote display. This hint can be set to recommend this notification not be bridged.
     *
     * Defaults to `false`.
     */
    localOnly?: boolean;

    // todo example
    number?: number;

    /**
     * Set whether this is an on-going notification.
     *
     * - Ongoing notifications are sorted above the regular notifications in the notification panel.
     * - Ongoing notifications do not have an 'X' close button, and are not affected by the "Clear all" button.
     */
    ongoing?: boolean;

    /**
     * Set this flag if you would only like the sound, vibrate and ticker to be played if the notification is not already showing.
     */
    onlyAlertOnce?: boolean;

    /**
     * Set the relative priority for this notification. Priority is an indication of how much of the
     * user's valuable attention should be consumed by this notification. Low-priority notifications
     * may be hidden from the user in certain situations, while the user might be interrupted for a
     * higher-priority notification. The system sets a notification's priority based on various
     * factors including the setPriority value. The effect may differ slightly on different platforms.
     *
     * Defaults to `AndroidPriority.DEFAULT`.
     *
     * See `AndroidPriority` for descriptions of each priority settings.
     *
     * #### Example
     *
     * ```js
     * await notification.displayNotification({
     *   android: {
     *     priority: firebase.notifications.AndroidPriority.LOW,
     *   },
     * });
     * ```
     */
    priority?:
      | AndroidPriority.DEFAULT
      | AndroidPriority.HIGH
      | AndroidPriority.LOW
      | AndroidPriority.MAX
      | AndroidPriority.MIN
      | AndroidPriority.NONE;

    /**
     * A notification can show current progress of a task. The progress state can either be fixed or
     * indeterminate (unknown).
     *
     * #### Example - Fixed Progress
     *
     * ![Fixed Progress](https://miro.medium.com/max/480/1*OHOY45cU27NaYkF0MU3hrw.gif)
     *
     * ```js
     * await notification.displayNotification({
     *   android: {
     *     progress: {
     *       max: 10,
     *       current: 5,
     *     }
     *   },
     * });
     * ```
     *
     * #### Example - Indeterminate Progress
     *
     * Setting `indeterminate` to `true` overrides the `max`/`current` settings.
     *
     * ![Progress](https://miro.medium.com/max/480/1*mW-_3PUxAG1unAZOf0IuoQ.gif)
     *
     * ```js
     * await notification.displayNotification({
     *   android: {
     *     progress: {
     *       max: 10,
     *       current: 5,
     *       indeterminate: true,
     *     }
     *   },
     * });
     * ```
     *
     * // TODO how to update the progess over time?
     */
    progress?: AndroidProgress;

    // todo
    remoteInputHistory?: string[];

    /**
     * If this notification is duplicative of a Launcher shortcut, sets the id of the shortcut,
     * in case the Launcher wants to hide the shortcut.
     *
     * Note: This field will be ignored by Launchers that don't support badging or shortcuts.
     */
    shortcutId?: string;

    /**
     * Sets whether the timestamp provided to `when` is shown in the notification.
     *
     * Setting this field is useful for notifications which are more informative with a timestamp,
     * such as a message.
     *
     * #### Example
     *
     * Assuming the current notification has delivered to the user 8 minutes ago, the timestamp
     * will be displayed to the user in the notification, for example:
     *
     * ![When Timestamp](https://prismic-io.s3.amazonaws.com/invertase%2F3f2f803e-b9ae-4e6b-8b58-f0b8ab01aa52_new+project+%2819%29.jpg)
     *
     * ```js
     * await notification.displayNotification({
     *   android: {
     *     when: Date.now(),
     *     showWhenTimestamp: true,
     *   },
     * });
     * ```
     */
    showWhenTimestamp?: boolean;

    /**
     * The small icon for the notification.
     *
     * To set custom small icon levels (e.g. for battery levels), see below.
     *
     * ![Small Icon](https://prismic-io.s3.amazonaws.com/invertase%2F566dd0e6-99bc-4e58-82c1-755f0225ec0b_new+project+%2820%29.jpg)
     */
    smallIcon?: string;

    /**
     * The small icon for the notification with various levels.
     *
     * Icon levels can be used to show different icons. For example if displaying a notification about the
     * device battery level, 4 different levels can be defined (4 = full battery icon, 1 = low battery icon).
     *
     * TODO @ehesp guide on how to set levels
     */
    smallIcon?: [string, number];

    /**
     * Set a sort key that orders this notification among other notifications from the same package.
     * This can be useful if an external sort was already applied and an app would like to preserve
     * this. Notifications will be sorted lexicographically using this value, although providing
     * different priorities in addition to providing sort key may cause this value to be ignored.
     *
     * If a `group` has been set, the sort key can also be used to order members of a notification group.
     */
    sortKey?: string;

    /**
     * Styled notifications provide users with more informative content and additional functionality.
     * The current supported formats are:
     *
     * 1. **Big Picture Style**: Shows a large picture when expanded. See `AndroidBigPictureStyle` for more information and examples.
     * 2. **Big Text Style**: Shows a large volume of text when expanded. See `AndroidBigTextStyle` for more information and examples.
     *
     * #### Example - Big Text Style
     *
     * TODO better example
     *
     * ```js
     * await notification.displayNotification({
     *   body: 'Congratulations you have won a prize...',
     *   android: {
     *     style: {
     *       type: firebase.notifications.AndroidStyle.BIGTEXT,
     *       text: 'Congratulations you have won a prize. To claim the prize please login to your account...'
     *     }
     *   },
     * });
     * ```
     **/
    style?: AndroidBigPictureStyle | AndroidBigTextStyle;

    /**
     * A ticker is used for accessibility purposes for devices with accessibility services enabled. Text passed
     * to `ticker` will be audibly announced.
     *
     * Ticker text does not show in the notification.
     *
     * #### Example
     *
     * ```js
     * await notification.displayNotification({
     *   android: {
     *     body: 'You have 1 new message',
     *     ticker: 'A new message has been received',
     *   },
     * });
     * ```
     */
    ticker?: string;

    /**
     * Sets the time in milliseconds at which the notification should be
     * cancelled, if it is not already cancelled.
     *
     * #### Example
     *
     * Time out in 10 minutes.
     *
     * ```js
     * await notification.displayNotification({
     *   android: {
     *     body: 'Limited time prize available',
     *     timeoutAfter: Date.now() + 600000,
     *   },
     * });
     * ```
     */
    timeoutAfter?: number;

    /**
     * Show the `when` field as a stopwatch. Instead of presenting when as a timestamp, the
     * notification will show an automatically updating display of the minutes and seconds since when.
     * Useful when showing an elapsed time (like an ongoing phone call).
     *
     * Defaults to `false`.
     *
     * // TODO example
     */
    usesChronometer?: boolean;

    /**
     * Whether the notification should vibrate.
     *
     * Defaults to `true`.
     */
    vibrate?: boolean;

    /**
     * The vibrate pattern in milliseconds. Must be an even amount of numbers.
     *
     * #### Example
     *
     * Vibrate for 300ms with a 300ms delay.
     *
     * ```js
     * await notification.displayNotification({
     *   android: {
     *     body: 'Limited time prize available',
     *     vibratePattern: [300, 300],
     *   },
     * });
     * ```
     */
    vibratePattern?: number[];

    /**
     * Sets the visibility for this notification. This may be used for apps which show user
     * sensitive information (e.g. a banking app).
     *
     * Defaults to `AndroidVisibility.PRIVATE`.
     *
     * See `AndroidVisibility` for more information.
     */
    visibility?: AndroidVisibility.PRIVATE | AndroidVisibility.PUBLIC | AndroidVisibility.SECRET;

    /**
     * The timestamp in milliseconds for this notification. Notifications in the panel are sorted by this time.
     *
     * - Use with `showWhenTimestamp` to show the timestamp to the users.
     * - Use with `usesChronometer` to create a on-going timer.
     *
     * #### Example
     *
     * Show the length of time the notification has been showing for.
     *
     * ```js
     * await notification.displayNotification({
     *   android: {
     *     body: 'Phone call in progress',
     *     ongoing: true,
     *     when: Date.now(),
     *     usesChronometer: true,
     *   },
     * });
     * ```
     */
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

  /**
   *
   */
  export interface AndroidBadgeIconType {
    NONE: 0;
    SMALL: 1;
    LARGE: 2;
  }

  /**
   * Available Android Notification Styles.
   *
   * Used when providing a `style` to a notification builder with `displayNotification`.
   */
  export interface AndroidStyle {
    BIGPICTURE: 0;
    BIGTEXT: 1;
  }

  /**
   * Notifications can show a large image when expanded, which is useful for apps with a heavy media
   * focus, such as Instagram.
   *
   * ![Big Picture Style](https://developer.android.com/images/ui/notifications/template-image_2x.png)
   *
   * #### Example
   *
   * ```js
   * TODO example
   * ```
   */
  export interface AndroidBigPictureStyle {
    type: AndroidStyle.BIGPICTURE;
    picture: string;
    title?: string;
    largeIcon?: string;
    summary?: string;
  }

  /**
   * Notifications can show a large amount of text when expanded, for example when displaying new
   * messages.
   *
   * By default, messages are not expanded, causing any overflowing notification `body` next to be
   * truncated. Setting a `bigTextStyle` allows the notification to be expandable showing the full
   * text body.
   *
   * ![Big Text Style](https://developer.android.com/images/ui/notifications/template-large-text_2x.png)
   *
   * #### Example
   *
   * ```js
   * TODO example
   * ```
   */
  export interface AndroidBigTextStyle {
    type: AndroidStyle.BIGTEXT;
    text: string;
    title?: string;
    summary?: string;
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

  /**
   * A set or predefined colors which can be used with Android Notifications.
   */
  export enum AndroidColor {
    RED = 'red',
    BLUE = 'blue',
    GREEN = 'green',
    BLACK = 'black',
    WHITE = 'white',
    GRAY = 'gray',
    CYAN = 'cyan',
    MAGENTA = 'magenta',
    YELLOW = 'yellow',
    LIGHTGRAY = 'lightgray',
    DARKGRAY = 'darkgray',
    GRAY = 'gray',
    LIGHTGREY = 'lightgrey',
    DARKGREY = 'darkgrey',
    AQUA = 'aqua',
    FUCHSIA = 'fuchsia',
    LIME = 'lime',
    MAROON = 'maroon',
    NAVY = 'navy',
    OLIVE = 'olive',
    PURPLE = 'purple',
    SILVER = 'silver',
    TEAL = 'teal',
  }

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

  export interface AndroidImportance {
    DEFAULT: 3;
    HIGH: 4;
    LOW: 2;
    MAX: 5;
    MIN: 1;
    NONE: 0;
  }

  /**
   * Interface for defining the progress of an Android Notification.
   *
   * A notification can show current progress of a task. The progress state can either be fixed or
   * indeterminate (unknown).
   *
   * #### Example - Fixed Progress
   *
   * ![Fixed Progress](https://miro.medium.com/max/480/1*OHOY45cU27NaYkF0MU3hrw.gif)
   *
   * ```js
   * await notification.displayNotification({
   *   android: {
   *     progress: {
   *       max: 10,
   *       current: 5,
   *     }
   *   },
   * });
   * ```
   *
   * #### Example - Indeterminate Progress
   *
   * Setting `indeterminate` to `true` overrides the `max`/`current` settings.
   *
   * ![Progress](https://miro.medium.com/max/480/1*mW-_3PUxAG1unAZOf0IuoQ.gif)
   *
   * ```js
   * await notification.displayNotification({
   *   android: {
   *     progress: {
   *       max: 10,
   *       current: 5,
   *       indeterminate: true,
   *     }
   *   },
   * });
   * ```
   */
  export interface AndroidProgress {
    /**
     * The maximum progress number. E.g `10`.
     *
     * Must be greater than the `current` value.
     */
    max: number;

    /**
     * The current progress.
     *
     * E.g. setting to `4` with a `max` value of `10` would set a fixed progress bar on the notification at 40% complete.
     */
    current: number;

    /**
     * If `true`, overrides the `max` and `current` values and displays an unknown progress style. Useful when you have no
     * knowledge of a tasks completion state.
     *
     * Defaults to `false`.
     */
    indeterminate?: boolean;
  }

  /**
   * Interface used to define the visibility of an Android notification.
   *
   * Use with the `visibility` property on the notification.
   *
   * Default value is `AndroidVisibility.PRIVATE`.
   */
  export interface AndroidVisibility {
    /**
     * Show the notification on all lockscreens, but conceal sensitive or private information on secure lockscreens.
     */
    PRIVATE: 0;

    /**
     * Show this notification in its entirety on all lockscreens.
     */
    PUBLIC: 1;

    /**
     * Do not reveal any part of this notification on a secure lockscreen.
     *
     * Useful for notifications showing sensitive information such as banking apps.
     */
    SECRET: -1;
  }

  /**
   * Interface used when defining the `repeatInterval` on a scheduled notification.
   */
  export interface AndroidRepeatInterval {
    MINUTE: 'minute';
    HOUR: 'hour';
    DAY: 'day';
    WEEK: 'week';
  }

  /**
   * TODO
   */
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
    bypassDnd?: boolean;
    description?: string;
    enableLights?: boolean;
    enableVibration?: boolean;
    groupId?: string;
    importance?:
      | AndroidImportance.DEFAULT
      | AndroidImportance.HIGH
      | AndroidImportance.LOW
      | AndroidImportance.MAX
      | AndroidImportance.MIN
      | AndroidImportance.NONE;
    lightColor?: AndroidColor | string;
    lockscreenVisibility?:
      | AndroidVisibility.PRIVATE
      | AndroidVisibility.PUBLIC
      | AndroidVisibility.SECRET;
    showBadge?: boolean;
    sensitive?: string; // audio attributes?
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

    getChannel(channelId: string): Promise<AndroidChannel | null>;

    getChannels(): Promise<AndroidChannel[]>;

    getChannelGroup(channelGroupId: string): Promise<AndroidChannelGroup | null>;

    getChannelGroups(): Promise<AndroidChannelGroup[]>;

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
  import AndroidColor = Notifications.AndroidColor;

  const firebaseNamedExport: {} & ReactNativeFirebaseModule;
  export const firebase = firebaseNamedExport;

  export const AndroidColor = AndroidColor;

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
