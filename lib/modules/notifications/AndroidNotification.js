/**
 * @flow
 * AndroidNotification representation wrapper
 */
import type Notification from './Notification';

type Lights = {
  argb: number,
  onMs: number,
  offMs: number,
};

type Progress = {
  max: number,
  progress: number,
  indeterminate: boolean,
};

type SmallIcon = {
  icon: number,
  level?: number,
};

export type NativeAndroidNotification = {
  // TODO actions: Action[],
  autoCancel: boolean,
  badgeIconType: BadgeIconTypeType,
  category: CategoryType,
  channelId: string,
  color: number,
  colorized: boolean,
  contentInfo: string,
  defaults: DefaultsType[],
  group: string,
  groupAlertBehaviour: GroupAlertType,
  groupSummary: boolean,
  largeIcon: string,
  lights: Lights,
  localOnly: boolean,
  number: number,
  ongoing: boolean,
  onlyAlertOnce: boolean,
  people: string[],
  priority: PriorityType,
  progress: Progress,
  publicVersion: Notification,
  remoteInputHistory: string[],
  shortcutId: string,
  showWhen: boolean,
  smallIcon: SmallIcon,
  sortKey: string,
  // TODO: style: Style,
  ticker: string,
  timeoutAfter: number,
  usesChronometer: boolean,
  vibrate: number[],
  visibility: VisibilityType,
  when: number,
};

export const BadgeIconType = {
  Large: 2,
  None: 0,
  Small: 1,
};

export const Category = {
  Alarm: 'alarm',
  Call: 'call',
  Email: 'email',
  Error: 'err',
  Event: 'event',
  Message: 'msg',
  Progress: 'progress',
  Promo: 'promo',
  Recommendation: 'recommendation',
  Reminder: 'reminder',
  Service: 'service',
  Social: 'social',
  Status: 'status',
  System: 'system',
  Transport: 'transport',
};

export const Defaults = {
  All: -1,
  Lights: 4,
  Sound: 1,
  Vibrate: 2,
};

export const GroupAlert = {
  All: 0,
  Children: 2,
  Summary: 1,
};

export const Priority = {
  Default: 0,
  High: 1,
  Low: -1,
  Max: 2,
  Min: -2,
};

export const Visibility = {
  Private: 0,
  Public: 1,
  Secret: -1,
};

type BadgeIconTypeType = $Values<typeof BadgeIconType>;
type CategoryType = $Values<typeof Category>;
type DefaultsType = $Values<typeof Defaults>;
type GroupAlertType = $Values<typeof GroupAlert>;
type PriorityType = $Values<typeof Priority>;
type VisibilityType = $Values<typeof Visibility>;

export default class AndroidNotification {
  // TODO actions: Action[]; // icon, title, ??pendingIntent??, allowGeneratedReplies, extender, extras, remoteinput (ugh)
  _autoCancel: boolean;
  _badgeIconType: BadgeIconTypeType;
  _category: CategoryType;
  _channelId: string;
  _color: number;
  _colorized: boolean;
  _contentInfo: string;
  _defaults: DefaultsType[];
  _group: string;
  _groupAlertBehaviour: GroupAlertType;
  _groupSummary: boolean;
  _largeIcon: string;
  _lights: Lights;
  _localOnly: boolean;
  _notification: Notification;
  _number: number;
  _ongoing: boolean;
  _onlyAlertOnce: boolean;
  _people: string[];
  _priority: PriorityType;
  _progress: Progress;
  _publicVersion: Notification;
  _remoteInputHistory: string[];
  _shortcutId: string;
  _showWhen: boolean;
  _smallIcon: SmallIcon;
  _sortKey: string;
  // TODO: style: Style; // Need to figure out if this can work
  _ticker: string;
  _timeoutAfter: number;
  _usesChronometer: boolean;
  _vibrate: number[];
  _visibility: VisibilityType;
  _when: number;

  // android unsupported
  // content: RemoteViews
  // contentIntent: PendingIntent - need to look at what this is
  // customBigContentView: RemoteViews
  // customContentView: RemoteViews
  // customHeadsUpContentView: RemoteViews
  // deleteIntent: PendingIntent
  // fullScreenIntent: PendingIntent
  // sound.streamType

  constructor(notification: Notification) {
    this._notification = notification;
    this._people = [];
  }

  /**
   *
   * @param identifier
   * @param identifier
   * @param identifier
   * @returns {Notification}
   */
  addPerson(person: string): Notification {
    this._people.push(person);
    return this._notification;
  }

  /**
   *
   * @param autoCancel
   * @returns {Notification}
   */
  setAutoCancel(autoCancel: boolean): Notification {
    this._autoCancel = autoCancel;
    return this._notification;
  }

  /**
   *
   * @param badgeIconType
   * @returns {Notification}
   */
  setBadgeIconType(badgeIconType: BadgeIconTypeType): Notification {
    this._badgeIconType = badgeIconType;
    return this._notification;
  }

  /**
   *
   * @param category
   * @returns {Notification}
   */
  setCategory(category: CategoryType): Notification {
    if (!Object.values(Category).includes(category)) {
      throw new Error(`AndroidNotification: Invalid Category: ${category}`);
    }
    this._category = category;
    return this._notification;
  }

  /**
   *
   * @param channelId
   * @returns {Notification}
   */
  setChannelId(channelId: string): Notification {
    this._channelId = channelId;
    return this._notification;
  }

  /**
   *
   * @param color
   * @returns {Notification}
   */
  setColor(color: number): Notification {
    this._color = color;
    return this._notification;
  }

  /**
   *
   * @param colorized
   * @returns {Notification}
   */
  setColorized(colorized: boolean): Notification {
    this._colorized = colorized;
    return this._notification;
  }

  /**
   *
   * @param contentInfo
   * @returns {Notification}
   */
  setContentInfo(contentInfo: string): Notification {
    this._contentInfo = contentInfo;
    return this._notification;
  }

  /**
   *
   * @param defaults
   * @returns {Notification}
   */
  setDefaults(defaults: DefaultsType[]): Notification {
    this._defaults = defaults;
    return this._notification;
  }

  /**
   *
   * @param group
   * @returns {Notification}
   */
  setGroup(group: string): Notification {
    this._group = group;
    return this._notification;
  }

  /**
   *
   * @param groupAlertBehaviour
   * @returns {Notification}
   */
  setGroupAlertBehaviour(groupAlertBehaviour: GroupAlertType): Notification {
    this._groupAlertBehaviour = groupAlertBehaviour;
    return this._notification;
  }

  /**
   *
   * @param groupSummary
   * @returns {Notification}
   */
  setGroupSummary(groupSummary: boolean): Notification {
    this._groupSummary = groupSummary;
    return this._notification;
  }

  /**
   *
   * @param largeIcon
   * @returns {Notification}
   */
  setLargeIcon(largeIcon: string): Notification {
    this._largeIcon = largeIcon;
    return this._notification;
  }

  /**
   *
   * @param argb
   * @param onMs
   * @param offMs
   * @returns {Notification}
   */
  setLights(argb: number, onMs: number, offMs: number): Notification {
    this._lights = {
      argb,
      onMs,
      offMs,
    };
    return this._notification;
  }

  /**
   *
   * @param localOnly
   * @returns {Notification}
   */
  setLocalOnly(localOnly: boolean): Notification {
    this._localOnly = localOnly;
    return this._notification;
  }

  /**
   *
   * @param number
   * @returns {Notification}
   */
  setNumber(number: number): Notification {
    this._number = number;
    return this._notification;
  }

  /**
   *
   * @param ongoing
   * @returns {Notification}
   */
  setOngoing(ongoing: boolean): Notification {
    this._ongoing = ongoing;
    return this._notification;
  }

  /**
   *
   * @param onlyAlertOnce
   * @returns {Notification}
   */
  setOnlyAlertOnce(onlyAlertOnce: boolean): Notification {
    this._onlyAlertOnce = onlyAlertOnce;
    return this._notification;
  }

  /**
   *
   * @param priority
   * @returns {Notification}
   */
  setPriority(priority: PriorityType): Notification {
    this._priority = priority;
    return this._notification;
  }

  /**
   *
   * @param max
   * @param progress
   * @param indeterminate
   * @returns {Notification}
   */
  setProgress(
    max: number,
    progress: number,
    indeterminate: boolean
  ): Notification {
    this._progress = {
      max,
      progress,
      indeterminate,
    };
    return this._notification;
  }

  /**
   *
   * @param publicVersion
   * @returns {Notification}
   */
  setPublicVersion(publicVersion: Notification): Notification {
    this._publicVersion = publicVersion;
    return this._notification;
  }

  /**
   *
   * @param remoteInputHistory
   * @returns {Notification}
   */
  setRemoteInputHistory(remoteInputHistory: string[]): Notification {
    this._remoteInputHistory = remoteInputHistory;
    return this._notification;
  }

  /**
   *
   * @param shortcutId
   * @returns {Notification}
   */
  setShortcutId(shortcutId: string): Notification {
    this._shortcutId = shortcutId;
    return this._notification;
  }

  /**
   *
   * @param showWhen
   * @returns {Notification}
   */
  setShowWhen(showWhen: boolean): Notification {
    this._showWhen = showWhen;
    return this._notification;
  }

  /**
   *
   * @param icon
   * @param level
   * @returns {Notification}
   */
  setSmallIcon(icon: number, level?: number): Notification {
    this._smallIcon = {
      icon,
      level,
    };
    return this._notification;
  }

  /**
   *
   * @param sortKey
   * @returns {Notification}
   */
  setSortKey(sortKey: string): Notification {
    this._sortKey = sortKey;
    return this._notification;
  }

  /**
   *
   * @param ticker
   * @returns {Notification}
   */
  setTicker(ticker: string): Notification {
    this._ticker = ticker;
    return this._notification;
  }

  /**
   *
   * @param timeoutAfter
   * @returns {Notification}
   */
  setTimeoutAfter(timeoutAfter: number): Notification {
    this._timeoutAfter = timeoutAfter;
    return this._notification;
  }

  /**
   *
   * @param usesChronometer
   * @returns {Notification}
   */
  setUsesChronometer(usesChronometer: boolean): Notification {
    this._usesChronometer = usesChronometer;
    return this._notification;
  }

  /**
   *
   * @param vibrate
   * @returns {Notification}
   */
  setVibrate(vibrate: number[]): Notification {
    this._vibrate = vibrate;
    return this._notification;
  }

  /**
   *
   * @param when
   * @returns {Notification}
   */
  setWhen(when: number): Notification {
    this._when = when;
    return this._notification;
  }

  build(): NativeAndroidNotification {
    // TODO: Validation
    if (!this._channelId) {
      throw new Error(
        'AndroidNotification: Missing required `channelId` property'
      );
    }

    return {
      // TODO actions: Action[],
      autoCancel: this._autoCancel,
      badgeIconType: this._badgeIconType,
      category: this._category,
      channelId: this._channelId,
      color: this._color,
      colorized: this._colorized,
      contentInfo: this._contentInfo,
      defaults: this._defaults,
      group: this._group,
      groupAlertBehaviour: this._groupAlertBehaviour,
      groupSummary: this._groupSummary,
      largeIcon: this._largeIcon,
      lights: this._lights,
      localOnly: this._localOnly,
      number: this._number,
      ongoing: this._ongoing,
      onlyAlertOnce: this._onlyAlertOnce,
      people: this._people,
      priority: this._priority,
      progress: this._progress,
      publicVersion: this._publicVersion,
      remoteInputHistory: this._remoteInputHistory,
      shortcutId: this._shortcutId,
      showWhen: this._showWhen,
      smallIcon: this._smallIcon,
      sortKey: this._sortKey,
      // TODO: style: Style,
      ticker: this._ticker,
      timeoutAfter: this._timeoutAfter,
      usesChronometer: this._usesChronometer,
      vibrate: this._vibrate,
      visibility: this._visibility,
      when: this._when,
    };
  }
}
