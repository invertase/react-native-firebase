/**
 * 
 * AndroidNotifications representation wrapper
 */
import { Platform } from 'react-native';
import AndroidChannel from './AndroidChannel';
import AndroidChannelGroup from './AndroidChannelGroup';
import { getNativeModule } from '../../utils/native';
export default class AndroidNotifications {
  constructor(notifications) {
    this._notifications = notifications;
  }

  createChannel(channel) {
    if (Platform.OS === 'android') {
      if (!(channel instanceof AndroidChannel)) {
        throw new Error(`AndroidNotifications:createChannel expects an 'AndroidChannel' but got type ${typeof channel}`);
      }

      return getNativeModule(this._notifications).createChannel(channel.build());
    }

    return Promise.resolve();
  }

  createChannelGroup(channelGroup) {
    if (Platform.OS === 'android') {
      if (!(channelGroup instanceof AndroidChannelGroup)) {
        throw new Error(`AndroidNotifications:createChannelGroup expects an 'AndroidChannelGroup' but got type ${typeof channelGroup}`);
      }

      return getNativeModule(this._notifications).createChannelGroup(channelGroup.build());
    }

    return Promise.resolve();
  }

  createChannelGroups(channelGroups) {
    if (Platform.OS === 'android') {
      if (!Array.isArray(channelGroups)) {
        throw new Error(`AndroidNotifications:createChannelGroups expects an 'Array' but got type ${typeof channelGroups}`);
      }

      const nativeChannelGroups = [];

      for (let i = 0; i < channelGroups.length; i++) {
        const channelGroup = channelGroups[i];

        if (!(channelGroup instanceof AndroidChannelGroup)) {
          throw new Error(`AndroidNotifications:createChannelGroups expects array items of type 'AndroidChannelGroup' but got type ${typeof channelGroup}`);
        }

        nativeChannelGroups.push(channelGroup.build());
      }

      return getNativeModule(this._notifications).createChannelGroups(nativeChannelGroups);
    }

    return Promise.resolve();
  }

  createChannels(channels) {
    if (Platform.OS === 'android') {
      if (!Array.isArray(channels)) {
        throw new Error(`AndroidNotifications:createChannels expects an 'Array' but got type ${typeof channels}`);
      }

      const nativeChannels = [];

      for (let i = 0; i < channels.length; i++) {
        const channel = channels[i];

        if (!(channel instanceof AndroidChannel)) {
          throw new Error(`AndroidNotifications:createChannels expects array items of type 'AndroidChannel' but got type ${typeof channel}`);
        }

        nativeChannels.push(channel.build());
      }

      return getNativeModule(this._notifications).createChannels(nativeChannels);
    }

    return Promise.resolve();
  }

  removeDeliveredNotificationsByTag(tag) {
    if (Platform.OS === 'android') {
      if (typeof tag !== 'string') {
        throw new Error(`AndroidNotifications:removeDeliveredNotificationsByTag expects an 'string' but got type ${typeof tag}`);
      }

      return getNativeModule(this._notifications).removeDeliveredNotificationsByTag(tag);
    }

    return Promise.resolve();
  }

  deleteChannelGroup(groupId) {
    if (Platform.OS === 'android') {
      if (typeof groupId !== 'string') {
        throw new Error(`AndroidNotifications:deleteChannelGroup expects an 'string' but got type ${typeof groupId}`);
      }

      return getNativeModule(this._notifications).deleteChannelGroup(groupId);
    }

    return Promise.resolve();
  }

  deleteChannel(channelId) {
    if (Platform.OS === 'android') {
      if (typeof channelId !== 'string') {
        throw new Error(`AndroidNotifications:deleteChannel expects an 'string' but got type ${typeof channelId}`);
      }

      return getNativeModule(this._notifications).deleteChannel(channelId);
    }

    return Promise.resolve();
  }

  getChannel(channelId) {
    if (Platform.OS === 'android') {
      if (typeof channelId !== 'string') {
        throw new Error(`AndroidNotifications:getChannel expects an 'string' but got type ${typeof channelId}`);
      }

      return Promise.resolve(getNativeModule(this._notifications).getChannel(channelId));
    }

    return Promise.resolve(null);
  }

  getChannels() {
    if (Platform.OS === 'android') {
      return Promise.resolve(getNativeModule(this._notifications).getChannels());
    }

    return Promise.resolve([]);
  }

  getChannelGroup(channelGroupId) {
    if (Platform.OS === 'android') {
      if (typeof channelGroupId !== 'string') {
        throw new Error(`AndroidNotifications:getChannel expects an 'string' but got type ${typeof channelGroupId}`);
      }

      return Promise.resolve(getNativeModule(this._notifications).getChannelGroup(channelGroupId));
    }

    return Promise.resolve(null);
  }

  getChannelGroups() {
    if (Platform.OS === 'android') {
      return Promise.resolve(getNativeModule(this._notifications).getChannelGroups());
    }

    return Promise.resolve([]);
  }

}