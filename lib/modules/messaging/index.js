import { NativeModules, NativeEventEmitter } from 'react-native';
import { Base } from './../base';
import { promisify } from './../../utils';

const FirebaseMessaging = NativeModules.RNFirebaseMessaging;
const FirebaseMessagingEvt = new NativeEventEmitter(FirebaseMessaging);

type RemoteMessage = {
  id: string,
  type: string,
  ttl?: number,
  sender: string,
  collapseKey?: string,
  data: Object,
};

/**
 * @class Messaging
 */
export default class Messaging extends Base {
  constructor(firebase, options = {}) {
    super(firebase, options);
    this.namespace = 'firebase:messaging';
  }

  /*
   * WEB API
   */
  // TODO move to new event emitter logic
  onMessage(callback) {
    this.log.info('Setting up onMessage callback');
    const sub = this._on('FirebaseReceiveNotification', callback, FirebaseMessagingEvt);
    return promisify(() => sub, FirebaseMessaging)(sub);
  }

  // TODO this is wrong - also there is no 'off' onMessage should return the unsubscribe function?
  offMessage() {
    this.log.info('Unlistening from onMessage (offMessage)');
    this._off('FirebaseReceiveNotification');
  }

  offMessageReceived(...args) {
    return this.offMessage(...args);
  }

  getToken() {
    return FirebaseMessaging.getToken();
  }

  send(remoteMessage: RemoteMessage) {
    if (!remoteMessage || !remoteMessage.data) return Promise.reject(new Error('Invalid remote message format provided.'));
    return promisify('send', FirebaseMessaging)(remoteMessage);
  }

  //
  listenForTokenRefresh(callback) {
    this.log.info('Setting up listenForTokenRefresh callback');
    const sub = this._on('FirebaseRefreshToken', callback, FirebaseMessagingEvt);
    return promisify(() => sub, FirebaseMessaging)(sub);
  }

  unlistenForTokenRefresh() {
    this.log.info('Unlistening for TokenRefresh');
    this._off('FirebaseRefreshToken');
  }

  subscribeToTopic(topic) {
    this.log.info(`subscribeToTopic ${topic}`);
    const finalTopic = `/topics/${topic}`;
    return promisify('subscribeToTopic', FirebaseMessaging)(finalTopic);
  }

  unsubscribeFromTopic(topic) {
    this.log.info(`unsubscribeFromTopic ${topic}`);
    const finalTopic = `/topics/${topic}`;
    return promisify('unsubscribeFromTopic', FirebaseMessaging)(finalTopic);
  }

  // New api
  onRemoteMessage(callback) {
    this.log.info('On remote message callback');
    const sub = this._on('messaging_remote_event_received', callback, FirebaseMessagingEvt);
    return promisify(() => sub, FirebaseMessaging)(sub);
  }

  onLocalMessage(callback) {
    this.log.info('on local callback');
    const sub = this._on('messaging_local_event_received', callback, FirebaseMessagingEvt);
    return promisify(() => sub, FirebaseMessaging)(sub);
  }

  listenForReceiveUpstreamSend(callback) {
    this.log.info('Setting up send callback');
    const sub = this._on('FirebaseUpstreamSend', callback, FirebaseMessagingEvt);
    return promisify(() => sub, FirebaseMessaging)(sub);
  }

  unlistenForReceiveUpstreamSend() {
    this.log.info('Unlistening for send');
    this._off('FirebaseUpstreamSend');
  }
}
