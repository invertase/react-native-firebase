import ModuleBase from '../../utils/ModuleBase';
import RemoteMessage from './RemoteMessage';
import App from '../core/firebase-app';
export interface Notification {
    id: string | number;
    local_notification?: boolean;
}
export interface MessageData {
    finish: (data: any) => void;
}
export declare const MODULE_NAME = "RNFirebaseMessaging";
/**
 * @class Messaging
 */
export default class Messaging extends ModuleBase {
    static NAMESPACE: string;
    constructor(app: App);
    readonly EVENT_TYPE: {
        RefreshToken: string;
        Notification: string;
    };
    readonly NOTIFICATION_TYPE: {
        Remote: string;
        NotificationResponse: string;
        WillPresent: string;
        Local: string;
    };
    readonly REMOTE_NOTIFICATION_RESULT: {
        NewData: string;
        NoData: string;
        ResultFailed: string;
    };
    readonly WILL_PRESENT_RESULT: {
        All: string;
        None: string;
    };
    /**
     * Returns the notification that triggered application open
     * @returns {*}
     */
    getInitialNotification(): Promise<any>;
    /**
     * Returns the fcm token for the current device
     * @returns {*|Promise.<String>}
     */
    getToken(): Promise<string>;
    /**
     * Reset Instance ID and revokes all tokens.
     * @returns {*|Promise.<*>}
     */
    deleteInstanceId(): Promise<void>;
    /**
     * Create and display a local notification
     * @param notification
     * @returns {*}
     */
    createLocalNotification(notification: Notification): Promise<void>;
    /**
     *
     * @param notification
     * @returns {*}
     */
    scheduleLocalNotification(notification: Notification): Promise<void>;
    /**
     * Returns an array of all scheduled notifications
     * @returns {Promise.<Array>}
     */
    getScheduledLocalNotifications(): Promise<Object[]>;
    /**
     * Cancel a local notification by id - using '*' will cancel
     * all local notifications.
     * @param id
     * @returns {*}
     */
    cancelLocalNotification(id: string): Promise<void>;
    /**
     * Remove a delivered notification - using '*' will remove
     * all delivered notifications.
     * @param id
     * @returns {*}
     */
    removeDeliveredNotification(id: string): Promise<void>;
    /**
     * Request notification permission
     * @platforms ios
     * @returns {*|Promise.<*>}
     */
    requestPermissions(): Promise<void>;
    /**
     * Set notification count badge number
     * @param n
     */
    setBadgeNumber(n: number): void;
    /**
     * set notification count badge number
     * @returns {Promise.<Number>}
     */
    getBadgeNumber(): Promise<number>;
    /**
     * Subscribe to messages / notifications
     * @param listener
     * @returns {*}
     */
    onMessage(listener: (data: MessageData) => any): () => any;
    /**
     * Subscribe to token refresh events
     * @param listener
     * @returns {*}
     */
    onTokenRefresh(listener: (string) => any): () => any;
    /**
     * Subscribe to a topic
     * @param topic
     */
    subscribeToTopic(topic: string): void;
    /**
     * Unsubscribe from a topic
     * @param topic
     */
    unsubscribeFromTopic(topic: string): void;
    /**
     * Send an upstream message
     * @param remoteMessage
     */
    send(remoteMessage: RemoteMessage): Promise<void>;
}
export declare const statics: {
    EVENT_TYPE: {
        RefreshToken: string;
        Notification: string;
    };
    NOTIFICATION_TYPE: {
        Remote: string;
        NotificationResponse: string;
        WillPresent: string;
        Local: string;
    };
    REMOTE_NOTIFICATION_RESULT: {
        NewData: string;
        NoData: string;
        ResultFailed: string;
    };
    WILL_PRESENT_RESULT: {
        All: string;
        None: string;
    };
    RemoteMessage: typeof RemoteMessage;
};
