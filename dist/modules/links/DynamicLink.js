/**
 * 
 * DynamicLink representation wrapper
 */
import AnalyticsParameters from './AnalyticsParameters';
import AndroidParameters from './AndroidParameters';
import IOSParameters from './IOSParameters';
import ITunesParameters from './ITunesParameters';
import NavigationParameters from './NavigationParameters';
import SocialParameters from './SocialParameters';
export default class DynamicLink {
  constructor(link, domainURIPrefix) {
    this._analytics = new AnalyticsParameters(this);
    this._android = new AndroidParameters(this);
    this._domainURIPrefix = domainURIPrefix;
    this._ios = new IOSParameters(this);
    this._itunes = new ITunesParameters(this);
    this._link = link;
    this._navigation = new NavigationParameters(this);
    this._social = new SocialParameters(this);
  }

  get analytics() {
    return this._analytics;
  }

  get android() {
    return this._android;
  }

  get ios() {
    return this._ios;
  }

  get itunes() {
    return this._itunes;
  }

  get navigation() {
    return this._navigation;
  }

  get social() {
    return this._social;
  }

  build() {
    if (!this._link) {
      throw new Error('DynamicLink: Missing required `link` property');
    } else if (!this._domainURIPrefix) {
      throw new Error('DynamicLink: Missing required `domainURIPrefix` property');
    }

    return {
      analytics: this._analytics.build(),
      android: this._android.build(),
      domainURIPrefix: this._domainURIPrefix,
      ios: this._ios.build(),
      itunes: this._itunes.build(),
      link: this._link,
      navigation: this._navigation.build(),
      social: this._social.build()
    };
  }

}