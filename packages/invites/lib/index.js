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

import version from './version';

const statics = {};

const namespace = 'invites';

const nativeModuleName = 'RNFBInvitesModule';

const nativeEvents = ['invites_invitation_received'];

class FirebaseInvitesModule extends FirebaseModule {
  getInitialInvitation() {
    return this.native.getInitialInvitation();
  }

  onInvitation(listener) {
    const subscription = this.emitter.addListener('invites_invitation_received', listener);
    return () => {
      subscription.remove();
    };
  }

  sendInvitation(invite) {
    // TODO(salakar) validate invite
    return this.native.sendInvitation(invite);
  }
}

// import { SDK_VERSION } from '@react-native-firebase/invites';
export const SDK_VERSION = version;

// import invites from '@react-native-firebase/invites';
// invites().X(...);
export default createModuleNamespace({
  statics,
  version,
  namespace,
  nativeEvents,
  nativeModuleName,
  hasMultiAppSupport: false,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebaseInvitesModule,
});

// import invites, { firebase } from '@react-native-firebase/invites';
// invites().X(...);
// firebase.invites().X(...);
export const firebase = getFirebaseRoot();
