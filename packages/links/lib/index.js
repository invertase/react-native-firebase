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

import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/lib/internal';

import DynamicLinkParameters from './DynamicLinkParameters';

import version from './version';

const statics = {
  DynamicLink: DynamicLinkParameters, // TODO deprecate
};

const namespace = 'links';

const nativeModuleName = 'RNFBLinksModule';

const nativeEvents = ['links_link_received'];

class FirebaseLinksModule extends FirebaseModule {
  newDynamicLinkParameters(link, domainURIPrefix) {
    // todo validate args
    //    link string must start with http:// or https://
    //    domainUriPrefix string, must not start with http:// or https:// - without these
    return new DynamicLinkParameters(link, domainURIPrefix);
  }

  buildLink(dynamicLinkParams) {
    // TODO(salakar) instance of link validate
    return this.native.buildLink(dynamicLinkParams.build());
  }

  createDynamicLink(dynamicLinkParams) {
    // eslint-disable-next-line no-console
    console.warn(`firebase.links().createDynamicLink() is deprecated in favour of buildLink()`);
    return this.buildLink(dynamicLinkParams);
  }

  buildShortLink(dynamicLinkParams, shortLinkType = 'DEFAULT') {
    // TODO(salakar) instance of link validate
    // TODO(salakar) shortLinkType validate
    return this.native.buildLink(dynamicLinkParams.build(), shortLinkType);
  }

  createShortDynamicLink(dynamicLinkParams, shortLinkType) {
    // eslint-disable-next-line no-console
    console.warn(
      `firebase.links().createShortDynamicLink() is deprecated in favour of buildShortLink()`,
    );
    return this.buildShortLink(dynamicLinkParams, shortLinkType);
  }

  getInitialLink() {
    return this.native.getInitialLink();
  }

  onLink(listener) {
    const subscription = this.emitter.subscribe('links_link_received', event =>
      listener(event.url),
    );
    return () => {
      subscription.remove();
    };
  }
}

// import { SDK_VERSION } from '@react-native-firebase/links';
export const SDK_VERSION = version;

// import links from '@react-native-firebase/links';
// links().X(...);
export default createModuleNamespace({
  statics,
  version,
  namespace,
  nativeEvents,
  nativeModuleName,
  hasMultiAppSupport: false,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseLinksModule,
});

// import links, { firebase } from '@react-native-firebase/links';
// links().X(...);
// firebase.links().X(...);
export const firebase = getFirebaseRoot();
