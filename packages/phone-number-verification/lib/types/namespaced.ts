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

import type {
  VerificationSupportInfo,
  VerifiedPhoneNumberResult,
} from './pnv';
import type { ReactNativeFirebase } from '@react-native-firebase/app';

/* eslint-disable @typescript-eslint/no-namespace */
export namespace FirebasePhoneNumberVerificationTypes {
  export interface Module {
    app: ReactNativeFirebase.FirebaseApp;
    enableTestSession(token: string): Promise<void>;
    getVerificationSupportInfo(): Promise<VerificationSupportInfo[]>;
    getVerifiedPhoneNumber(): Promise<VerifiedPhoneNumberResult>;
    getDigitalCredentialPayload(nonce: string): Promise<string>;
    exchangeCredentialResponseForPhoneNumber(
      dcApiResponse: string,
    ): Promise<VerifiedPhoneNumberResult>;
  }

  export interface Statics {}
}
/* eslint-enable @typescript-eslint/no-namespace */

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

declare const defaultExport: PnvNamespace;

export declare const firebase: ReactNativeFirebase.Module & {
  phoneNumberVerification: typeof defaultExport;
  app(
    name?: string,
  ): ReactNativeFirebase.FirebaseApp & {
    phoneNumberVerification(): FirebasePhoneNumberVerificationTypes.Module;
  };
};

export default defaultExport;

declare module '@react-native-firebase/app' {
  /* eslint-disable @typescript-eslint/no-namespace */
  namespace ReactNativeFirebase {
    import FirebaseModuleWithStaticsAndApp = ReactNativeFirebase.FirebaseModuleWithStaticsAndApp;
    interface Module {
      phoneNumberVerification: FirebaseModuleWithStaticsAndApp<
        FirebasePhoneNumberVerificationTypes.Module,
        FirebasePhoneNumberVerificationTypes.Statics
      >;
    }
    interface FirebaseApp {
      phoneNumberVerification(): FirebasePhoneNumberVerificationTypes.Module;
    }
  }
  /* eslint-enable @typescript-eslint/no-namespace */
}
