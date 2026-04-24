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
  isAndroid,
  isFunction,
  isIOS,
  promiseDefer,
} from '@react-native-firebase/app/dist/module/common';
import type { ReactNativeFirebase } from '@react-native-firebase/app';
import NativeFirebaseError from '@react-native-firebase/app/dist/module/internal/NativeFirebaseError';
import type { FirebaseAuthTypes } from './types/namespaced';
import type {
  AuthInternal,
  NativePhoneAuthCredentialInternal,
  NativePhoneAuthErrorInternal,
} from './types/internal';

type PhoneAuthInternalEventType =
  | 'codeSent'
  | 'verificationFailed'
  | 'verificationComplete'
  | 'codeAutoRetrievalTimeout';

type InternalEvents = Record<PhoneAuthInternalEventType, string>;
type PublicEvents = Record<'error' | 'event' | 'success', string>;
type PhoneAuthSnapshot = FirebaseAuthTypes.PhoneAuthSnapshot;
type PhoneAuthError = FirebaseAuthTypes.PhoneAuthError;

let REQUEST_ID = 0;

export default class PhoneAuthListener {
  private readonly _auth: AuthInternal;
  private _reject: ((error: ReactNativeFirebase.NativeFirebaseError) => void) | null;
  private _resolve: ((snapshot: PhoneAuthSnapshot) => void) | null;
  private _promise: Promise<PhoneAuthSnapshot> | null;
  private readonly _jsStack: string;
  private readonly _timeout: number;
  private readonly _phoneAuthRequestId: number;
  private readonly _forceResending: boolean;
  private readonly _internalEvents: InternalEvents;
  private readonly _publicEvents: PublicEvents;

  constructor(auth: AuthInternal, phoneNumber: string, timeout?: number, forceResend?: boolean) {
    this._auth = auth;
    this._reject = null;
    this._resolve = null;
    this._promise = null;
    this._jsStack = new Error().stack ?? '';

    this._timeout = timeout || 20;
    this._phoneAuthRequestId = REQUEST_ID++;
    this._forceResending = forceResend || false;

    // internal events
    this._internalEvents = {
      codeSent: `phone:auth:${this._phoneAuthRequestId}:onCodeSent`,
      verificationFailed: `phone:auth:${this._phoneAuthRequestId}:onVerificationFailed`,
      verificationComplete: `phone:auth:${this._phoneAuthRequestId}:onVerificationComplete`,
      codeAutoRetrievalTimeout: `phone:auth:${this._phoneAuthRequestId}:onCodeAutoRetrievalTimeout`,
    };

    // user observer events
    this._publicEvents = {
      error: `phone:auth:${this._phoneAuthRequestId}:error`,
      event: `phone:auth:${this._phoneAuthRequestId}:event`,
      success: `phone:auth:${this._phoneAuthRequestId}:success`,
    };

    this._subscribeToEvents();

    if (isAndroid) {
      this._auth.native.verifyPhoneNumber(
        phoneNumber,
        this._phoneAuthRequestId + '',
        this._timeout,
        this._forceResending,
      );
    }

    if (isIOS) {
      this._auth.native.verifyPhoneNumber(phoneNumber, this._phoneAuthRequestId + '');
    }
  }

  private _subscribeToEvents(): void {
    const events: PhoneAuthInternalEventType[] = [
      'codeSent',
      'verificationFailed',
      'verificationComplete',
      'codeAutoRetrievalTimeout',
    ];

    for (const type of events) {
      const subscription = this._auth.emitter.addListener(this._internalEvents[type], event => {
        switch (type) {
          case 'codeSent':
            this._codeSentHandler(event as NativePhoneAuthCredentialInternal);
            break;
          case 'verificationFailed':
            this._verificationFailedHandler(event as NativePhoneAuthErrorInternal);
            break;
          case 'verificationComplete':
            this._verificationCompleteHandler(event as NativePhoneAuthCredentialInternal);
            break;
          case 'codeAutoRetrievalTimeout':
            this._codeAutoRetrievalTimeoutHandler(event as NativePhoneAuthCredentialInternal);
            break;
        }
        subscription.remove();
      });
    }
  }

  private _addUserObserver(observer: (snapshot: PhoneAuthSnapshot) => void): void {
    this._auth.emitter.addListener(this._publicEvents.event, observer);
  }

  private _emitToObservers(snapshot: PhoneAuthSnapshot): void {
    this._auth.emitter.emit(this._publicEvents.event, snapshot);
  }

  private _emitToErrorCb(snapshot: PhoneAuthSnapshot): void {
    const { error } = snapshot;
    if (this._reject && error) {
      this._reject(error);
    }
    this._auth.emitter.emit(this._publicEvents.error, {
      code: error?.code ?? null,
      verificationId: snapshot.verificationId,
      message: error?.message ?? null,
      stack: error?.stack ?? null,
    } as PhoneAuthError);
  }

  private _emitToSuccessCb(snapshot: PhoneAuthSnapshot): void {
    if (this._resolve) {
      this._resolve(snapshot);
    }
    this._auth.emitter.emit(this._publicEvents.success, snapshot);
  }

  private _removeAllListeners(): void {
    setTimeout(() => {
      // move to next event loop - not sure if needed
      // internal listeners
      Object.values(this._internalEvents).forEach(event => {
        this._auth.emitter.removeAllListeners(event);
      });

      // user observer listeners
      Object.values(this._publicEvents).forEach(publicEvent => {
        this._auth.emitter.removeAllListeners(publicEvent);
      });
    }, 0);
  }

  private _promiseDeferred(): void {
    if (!this._promise) {
      const { promise, resolve, reject } = promiseDefer() as {
        promise: Promise<PhoneAuthSnapshot>;
        resolve: (snapshot: PhoneAuthSnapshot) => void;
        reject: (error: ReactNativeFirebase.NativeFirebaseError) => void;
      };
      this._promise = promise;
      this._resolve = resolve;
      this._reject = reject;
    }
  }

  /* --------------------------
   --- INTERNAL EVENT HANDLERS
   ---------------------------- */

  private _codeSentHandler(credential: NativePhoneAuthCredentialInternal): void {
    const snapshot: PhoneAuthSnapshot = {
      verificationId: credential.verificationId,
      code: null,
      error: null,
      state: 'sent',
    };

    this._emitToObservers(snapshot);

    if (isIOS) {
      this._emitToSuccessCb(snapshot);
    }

    if (isAndroid) {
      // android can auto retrieve so we don't emit to successCb immediately,
      // if auto retrieve times out then that will emit to successCb
    }
  }

  private _codeAutoRetrievalTimeoutHandler(credential: NativePhoneAuthCredentialInternal): void {
    const snapshot: PhoneAuthSnapshot = {
      verificationId: credential.verificationId,
      code: null,
      error: null,
      state: 'timeout',
    };

    this._emitToObservers(snapshot);
    this._emitToSuccessCb(snapshot);
  }

  private _verificationCompleteHandler(credential: NativePhoneAuthCredentialInternal): void {
    const snapshot: PhoneAuthSnapshot = {
      verificationId: credential.verificationId,
      code: credential.code || null,
      error: null,
      state: 'verified',
    };

    this._emitToObservers(snapshot);
    this._emitToSuccessCb(snapshot);
    this._removeAllListeners();
  }

  private _verificationFailedHandler(state: NativePhoneAuthErrorInternal): void {
    const snapshot: PhoneAuthSnapshot = {
      verificationId: state.verificationId,
      code: null,
      error: null,
      state: 'error',
    };

    snapshot.error = new NativeFirebaseError(
      { userInfo: state.error },
      this._jsStack,
      'auth',
    ) as ReactNativeFirebase.NativeFirebaseError;

    this._emitToObservers(snapshot);
    this._emitToErrorCb(snapshot);
    this._removeAllListeners();
  }

  /* -------------
   -- PUBLIC API
   --------------*/

  on(
    event: string,
    observer: (snapshot: PhoneAuthSnapshot) => void,
    errorCb?: (error: PhoneAuthError) => void,
    successCb?: (snapshot: PhoneAuthSnapshot) => void,
  ): PhoneAuthListener {
    if (event !== 'state_changed') {
      throw new Error(
        "firebase.auth.PhoneAuthListener.on(*, _, _, _) 'event' must equal 'state_changed'.",
      );
    }

    if (!isFunction(observer)) {
      throw new Error(
        "firebase.auth.PhoneAuthListener.on(_, *, _, _) 'observer' must be a function.",
      );
    }

    this._addUserObserver(observer);

    if (isFunction(errorCb)) {
      const subscription = this._auth.emitter.addListener(this._publicEvents.error, event => {
        subscription.remove();
        errorCb(event as PhoneAuthError);
      });
    }

    if (isFunction(successCb)) {
      const subscription = this._auth.emitter.addListener(this._publicEvents.success, event => {
        subscription.remove();
        successCb(event as PhoneAuthSnapshot);
      });
    }

    return this;
  }

  then<TResult1 = PhoneAuthSnapshot, TResult2 = never>(
    onFulfilled?: ((value: PhoneAuthSnapshot) => TResult1 | PromiseLike<TResult1>) | null,
    onRejected?:
      | ((reason: ReactNativeFirebase.NativeFirebaseError) => TResult2 | PromiseLike<TResult2>)
      | null,
  ): Promise<TResult1 | TResult2> {
    this._promiseDeferred();
    return this._promise!.then(onFulfilled ?? undefined, onRejected ?? undefined);
  }

  catch<TResult = never>(
    onRejected?:
      | ((reason: ReactNativeFirebase.NativeFirebaseError) => TResult | PromiseLike<TResult>)
      | null,
  ): Promise<PhoneAuthSnapshot | TResult> {
    this._promiseDeferred();
    return this._promise!.catch(onRejected ?? undefined);
  }
}
