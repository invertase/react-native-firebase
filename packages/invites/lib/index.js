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

import { isString } from '@react-native-firebase/app/lib/common';
import {
  createModuleNamespace,
  FirebaseModule,
  getFirebaseRoot,
} from '@react-native-firebase/app/lib/internal';
import Invite from './Invite';
import version from './version';

const statics = {
  Invite,
};

const namespace = 'invites';

const nativeModuleName = 'RNFBInvitesModule';

const EVENT_INVITE_RECEIVED = 'invites_invitation_received';

const nativeEvents = [EVENT_INVITE_RECEIVED];

class FirebaseInvitesModule extends FirebaseModule {
  createInvitation(title, message) {
    if (!isString(title)) {
      throw new Error("firebase.invites().createInvite(*, _) 'title' must be a string value.");
    }

    if (!isString(message)) {
      throw new Error("firebase.invites().createInvite(_, *) 'message' must be a string value.");
    }

    return new Invite(title, message);
  }

  onInvitation(listener) {
    const subscription = this.emitter.addListener(EVENT_INVITE_RECEIVED, listener);
    return () => {
      subscription.remove();
    };
  }

  getInitialInvitation() {
    return this.native.getInitialInvitation();
  }

  sendInvitation(invite) {
    if (invite instanceof Invite) {
      return this.native.sendInvitation(invite.build());
    }

    throw new Error('firebase.invites().sendInvitation(*) expects and instance of Invite.');
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
