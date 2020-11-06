/**
 * @flow
 * DynamicLink representation wrapper
 */
import AnalyticsParameters from './AnalyticsParameters';
import AndroidParameters from './AndroidParameters';
import IOSParameters from './IOSParameters';
import ITunesParameters from './ITunesParameters';
import NavigationParameters from './NavigationParameters';
import SocialParameters from './SocialParameters';

import type { NativeDynamicLink } from './types';

export default class DynamicLink {
  _analytics: AnalyticsParameters;

  _android: AndroidParameters;

  _domainURIPrefix: string;

  _ios: IOSParameters;

  _itunes: ITunesParameters;

  _link: string;

  _navigation: NavigationParameters;

  _social: SocialParameters;

  constructor(link: string, domainURIPrefix: string) {
    this._analytics = new AnalyticsParameters(this);
    this._android = new AndroidParameters(this);
    this._domainURIPrefix = domainURIPrefix;
    this._ios = new IOSParameters(this);
    this._itunes = new ITunesParameters(this);
    this._link = link;
    this._navigation = new NavigationParameters(this);
    this._social = new SocialParameters(this);
  }

  get analytics(): AnalyticsParameters {
    return this._analytics;
  }

  get android(): AndroidParameters {
    return this._android;
  }

  get ios(): IOSParameters {
    return this._ios;
  }

  get itunes(): ITunesParameters {
    return this._itunes;
  }

  get navigation(): NavigationParameters {
    return this._navigation;
  }

  get social(): SocialParameters {
    return this._social;
  }

  build(): NativeDynamicLink {
    if (!this._link) {
      throw new Error('DynamicLink: Missing required `link` property');
    } else if (!this._domainURIPrefix) {
      throw new Error(
        'DynamicLink: Missing required `domainURIPrefix` property'
      );
    }

    return {
      analytics: this._analytics.build(),
      android: this._android.build(),
      domainURIPrefix: this._domainURIPrefix,
      ios: this._ios.build(),
      itunes: this._itunes.build(),
      link: this._link,
      navigation: this._navigation.build(),
      social: this._social.build(),
    };
  }
}
