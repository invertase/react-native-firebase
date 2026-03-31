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
import NativeFirebaseError from '@react-native-firebase/app/dist/module/internal/NativeFirebaseError';
import type { AuthInternal } from './types/internal';

let REQUEST_ID = 0;

export interface PhoneAuthSnapshot {
  verificationId: string;
  code: string | null;
  error: unknown;
  state: 'sent' | 'timeout' | 'verified' | 'error';
}

export default class PhoneAuthListener {
  _auth: AuthInternal;
  _reject: ((error: unknown) => void) | null;
  _resolve: ((snapshot: PhoneAuthSnapshot) => void) | null;
  _promise: Promise<PhoneAuthSnapshot> | null;
  _jsStack: string | undefined;
  _timeout: number;
  _phoneAuthRequestId: number;
  _forceResending: boolean;
  _internalEvents: Record<string, string>;
  _publicEvents: Record<string, string>;

  constructor(auth: AuthInternal, phoneNumber: string, timeout?: number, forceResend?: boolean) {
    this._auth = auth;
    this._reject = null;
    this._resolve = null;
    this._promise = null;
    this._jsStack = new Error().stack;

    this._timeout = timeout ?? 20;
    this._phoneAuthRequestId = REQUEST_ID++;
    this._forceResending = forceResend ?? false;

    this._internalEvents = {
      codeSent: `phone:auth:${this._phoneAuthRequestId}:onCodeSent`,
      verificationFailed: `phone:auth:${this._phoneAuthRequestId}:onVerificationFailed`,
      verificationComplete: `phone:auth:${this._phoneAuthRequestId}:onVerificationComplete`,
      codeAutoRetrievalTimeout: `phone:auth:${this._phoneAuthRequestId}:onCodeAutoRetrievalTimeout`,
    };

    this._publicEvents = {
      error: `phone:auth:${this._phoneAuthRequestId}:error`,
      event: `phone:auth:${this._phoneAuthRequestId}:event`,
      success: `phone:auth:${this._phoneAuthRequestId}:success`,
    };

    this._subscribeToEvents();

    if (isAndroid) {
      this._auth.native.verifyPhoneNumber(
        phoneNumber,
        String(this._phoneAuthRequestId),
        this._timeout,
        this._forceResending,
      );
    }

    if (isIOS) {
      this._auth.native.verifyPhoneNumber(phoneNumber, String(this._phoneAuthRequestId));
    }
  }

  _subscribeToEvents(): void {
    const events = Object.keys(this._internalEvents);

    for (let i = 0, len = events.length; i < len; i++) {
      const type = events[i]!;
      const eventName = this._internalEvents[type as keyof typeof this._internalEvents]!;
      const handler = (this as unknown as Record<string, (e: unknown) => void>)[`_${type}Handler`];
      const subscription = this._auth.emitter.addListener(eventName, (event: unknown) => {
        if (typeof handler === 'function') handler.call(this, event);
        subscription.remove();
      });
    }
  }

  _addUserObserver(observer: (snapshot: PhoneAuthSnapshot) => void): void {
    this._auth.emitter.addListener(this._publicEvents.event!, observer);
  }

  _emitToObservers(snapshot: PhoneAuthSnapshot): void {
    this._auth.emitter.emit(this._publicEvents.event!, snapshot);
  }

  _emitToErrorCb(snapshot: { error: unknown }): void {
    const { error } = snapshot;
    if (this._reject) {
      this._reject(error);
    }
    this._auth.emitter.emit(this._publicEvents.error!, error);
  }

  _emitToSuccessCb(snapshot: PhoneAuthSnapshot): void {
    if (this._resolve) {
      this._resolve(snapshot);
    }
    this._auth.emitter.emit(this._publicEvents.success!, snapshot);
  }

  _removeAllListeners(): void {
    setTimeout(() => {
      Object.values(this._internalEvents).forEach(event => {
        this._auth.emitter.removeAllListeners(event);
      });

      Object.values(this._publicEvents).forEach(publicEvent => {
        this._auth.emitter.removeAllListeners(publicEvent);
      });
    }, 0);
  }

  _promiseDeferred(): void {
    if (!this._promise) {
      const { promise, resolve, reject } = promiseDefer<PhoneAuthSnapshot>();
      this._promise = promise;
      this._resolve = resolve;
      this._reject = reject;
    }
  }

  _codeSentHandler(credential: { verificationId: string }): void {
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
  }

  _codeAutoRetrievalTimeoutHandler(credential: { verificationId: string }): void {
    const snapshot: PhoneAuthSnapshot = {
      verificationId: credential.verificationId,
      code: null,
      error: null,
      state: 'timeout',
    };

    this._emitToObservers(snapshot);
    this._emitToSuccessCb(snapshot);
  }

  _verificationCompleteHandler(credential: { verificationId: string; code?: string }): void {
    const snapshot: PhoneAuthSnapshot = {
      verificationId: credential.verificationId,
      code: credential.code ?? null,
      error: null,
      state: 'verified',
    };

    this._emitToObservers(snapshot);
    this._emitToSuccessCb(snapshot);
    this._removeAllListeners();
  }

  _verificationFailedHandler(state: { verificationId: string; error: unknown }): void {
    const snapshot: PhoneAuthSnapshot = {
      verificationId: state.verificationId,
      code: null,
      error: null,
      state: 'error',
    };

    (snapshot as { error: unknown }).error = new NativeFirebaseError(
      { userInfo: state.error } as never,
      this._jsStack ?? '',
      'auth',
    );

    this._emitToObservers(snapshot);
    this._emitToErrorCb(snapshot);
    this._removeAllListeners();
  }

  on(
    event: string,
    observer: (snapshot: PhoneAuthSnapshot) => void,
    errorCb?: (error: unknown) => void,
    successCb?: (snapshot: PhoneAuthSnapshot) => void,
  ): this {
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
      const onError = errorCb;
      const subscription = this._auth.emitter.addListener(
        this._publicEvents.error!,
        (event: unknown) => {
          subscription.remove();
          onError(event);
        },
      );
    }

    if (isFunction(successCb)) {
      const onSuccess = successCb;
      const subscription = this._auth.emitter.addListener(
        this._publicEvents.success!,
        (event: PhoneAuthSnapshot) => {
          subscription.remove();
          onSuccess(event);
        },
      );
    }

    return this;
  }

  then(
    onFulfilled?: ((a: PhoneAuthSnapshot) => unknown) | null,
    onRejected?: ((a: unknown) => unknown) | null,
  ): Promise<unknown> | undefined {
    this._promiseDeferred();
    if (this._promise) {
      return this._promise.then.bind(this._promise)(onFulfilled, onRejected);
    }
    return undefined;
  }

  catch(onRejected: (a: unknown) => unknown): Promise<unknown> | undefined {
    this._promiseDeferred();
    if (this._promise) {
      return this._promise.catch.bind(this._promise)(onRejected);
    }
    return undefined;
  }
}
