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
} from '@react-native-firebase/app/dist/module/internal';
import { setReactNativeModule } from '@react-native-firebase/app/dist/module/internal/nativeModule';
import fallBackModule from './web/RNFBPnvModule';
import { version } from './version';
import type {
  VerificationSupportInfo,
  VerifiedPhoneNumberResult,
} from './types/pnv';
import './types/internal';
import type { FirebasePhoneNumberVerificationTypes } from './types/namespaced';
import type { ReactNativeFirebase } from '@react-native-firebase/app';

const namespace = 'phoneNumberVerification';

const nativeModuleName = 'RNFBPnvModule';

const statics = {};

class FirebasePhoneNumberVerificationModule extends FirebaseModule<typeof nativeModuleName> {
  enableTestSession(token: string): Promise<void> {
    return this.native.enableTestSession(token);
  }

  getVerificationSupportInfo(): Promise<VerificationSupportInfo[]> {
    return this.native.getVerificationSupportInfo();
  }

  getVerifiedPhoneNumber(): Promise<VerifiedPhoneNumberResult> {
    return this.native.getVerifiedPhoneNumber();
  }

  getDigitalCredentialPayload(nonce: string): Promise<string> {
    return this.native.getDigitalCredentialPayload(nonce);
  }

  exchangeCredentialResponseForPhoneNumber(
    dcApiResponse: string,
  ): Promise<VerifiedPhoneNumberResult> {
    return this.native.exchangeCredentialResponseForPhoneNumber(dcApiResponse);
  }
}

export const SDK_VERSION = version;

const pnvNamespace = createModuleNamespace({
  statics,
  version,
  namespace,
  nativeModuleName,
  nativeEvents: false,
  hasMultiAppSupport: false,
  hasCustomUrlOrRegionSupport: false,
  ModuleClass: FirebasePhoneNumberVerificationModule,
});

type PnvNamespace = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
  FirebasePhoneNumberVerificationTypes.Module,
  FirebasePhoneNumberVerificationTypes.Statics
> & {
  phoneNumberVerification: ReactNativeFirebase.FirebaseModuleWithStaticsAndApp<
    FirebasePhoneNumberVerificationTypes.Module,
    FirebasePhoneNumberVerificationTypes.Statics
  >;
  firebase: ReactNativeFirebase.Module;
  app(name?: string): ReactNativeFirebase.FirebaseApp;
};

export default pnvNamespace as unknown as PnvNamespace;

export const firebase =
  getFirebaseRoot() as unknown as ReactNativeFirebase.FirebaseNamespacedExport<
    'phoneNumberVerification',
    FirebasePhoneNumberVerificationTypes.Module,
    FirebasePhoneNumberVerificationTypes.Statics,
    false
  >;

setReactNativeModule(nativeModuleName, fallBackModule as unknown as Record<string, unknown>);
