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

import { isAndroid, isFunction, isIOS, promiseDefer } from '@react-native-firebase/app/lib/common';
import NativeFirebaseError from '@react-native-firebase/app/lib/internal/NativeFirebaseError';

let REQUEST_ID = 0;

export default class PhoneAuthListener {
  constructor(auth, phoneNumber, timeout, forceResend) {
    this._auth = auth;
    this._reject = null;
    this._resolve = null;
    this._promise = null;
    this._jsStack = new Error().stack;

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

  _subscribeToEvents() {
    const events = Object.keys(this._internalEvents);

    for (let i = 0, len = events.length; i < len; i++) {
      const type = events[i];
      const subscription = this._auth.emitter.addListener(this._internalEvents[type], event => {
        this[`_${type}Handler`](event);
        subscription.remove();
      });
    }
  }

  _addUserObserver(observer) {
    this._auth.emitter.addListener(this._publicEvents.event, observer);
  }

  _emitToObservers(snapshot) {
    this._auth.emitter.emit(this._publicEvents.event, snapshot);
  }

  _emitToErrorCb(snapshot) {
    const { error } = snapshot;
    if (this._reject) {
      this._reject(error);
    }
    this._auth.emitter.emit(this._publicEvents.error, error);
  }

  _emitToSuccessCb(snapshot) {
    if (this._resolve) {
      this._resolve(snapshot);
    }
    this._auth.emitter.emit(this._publicEvents.success, snapshot);
  }

  _removeAllListeners() {
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

  _promiseDeferred() {
    if (!this._promise) {
      const { promise, resolve, reject } = promiseDefer();
      this._promise = promise;
      this._resolve = resolve;
      this._reject = reject;
    }
  }

  /* --------------------------
   --- INTERNAL EVENT HANDLERS
   ---------------------------- */

  _codeSentHandler(credential) {
    const snapshot = {
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

  _codeAutoRetrievalTimeoutHandler(credential) {
    const snapshot = {
      verificationId: credential.verificationId,
      code: null,
      error: null,
      state: 'timeout',
    };

    this._emitToObservers(snapshot);
    this._emitToSuccessCb(snapshot);
  }

  _verificationCompleteHandler(credential) {
    const snapshot = {
      verificationId: credential.verificationId,
      code: credential.code || null,
      error: null,
      state: 'verified',
    };

    this._emitToObservers(snapshot);
    this._emitToSuccessCb(snapshot);
    this._removeAllListeners();
  }

  _verificationFailedHandler(state) {
    const snapshot = {
      verificationId: state.verificationId,
      code: null,
      error: null,
      state: 'error',
    };

    snapshot.error = new NativeFirebaseError({ userInfo: state.error }, this._jsStack, 'auth');

    this._emitToObservers(snapshot);
    this._emitToErrorCb(snapshot);
    this._removeAllListeners();
  }

  /* -------------
   -- PUBLIC API
   --------------*/

  on(event, observer, errorCb, successCb) {
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
      const subscription = this._auth.emitter.addListener(this._publicEvents.error, () => {
        errorCb;
        subscription.remove();
      });
    }

    if (isFunction(successCb)) {
      const subscription = this._auth.emitter.addListener(this._publicEvents.success, () => {
        successCb;
        subscription.remove();
      });
    }

    return this;
  }

  then(fn) {
    this._promiseDeferred();
    if (this._promise) {
      return this._promise.then.bind(this._promise)(fn);
    }
    return undefined;
  }

  catch(fn) {
    this._promiseDeferred();
    if (this._promise) {
      return this._promise.catch.bind(this._promise)(fn);
    }
    return undefined;
  }
}
