import { NativeModules } from 'react-native';

import { isObject } from '@react-native-firebase/common';

export default class FirebaseApp {
  constructor(name, options = {}, fromNative = false) {
    this._name = name;
    this._options = Object.assign({}, options);
    if (fromNative) {
      this._initialized = true;
      this._nativeInitialized = true;
    }
  }

  /**
   *
   * @return {*}
   */
  get name(): string {
    return this._name;
  }

  /**
   *
   * @return {*}
   */
  get options() {
    return Object.assign({}, this._options);
  }

  /**
   * Undocumented firebase web sdk method that allows adding additional properties onto
   * a firebase app instance.
   *
   * See: https://github.com/firebase/firebase-js-sdk/blob/master/tests/app/firebase_app.test.ts#L328
   *
   * @param props
   */
  extendApp(props: Object) {
    if (!isObject(props)) {
      throw new Error(INTERNALS.STRINGS.ERROR_MISSING_ARG('Object', 'extendApp'));
    }

    const keys = Object.keys(props);

    for (let i = 0, len = keys.length; i < len; i++) {
      const key = keys[i];

      if (!this._extendedProps[key] && Object.hasOwnProperty.call(this, key)) {
        throw new Error(INTERNALS.STRINGS.ERROR_PROTECTED_PROP(key));
      }

      this[key] = props[key];
      this._extendedProps[key] = true;
    }
  }

  /**
   *
   * @return {Promise}
   */
  delete(): Promise<void> {
    if (this._name === APPS.DEFAULT_APP_NAME && this._nativeInitialized) {
      return Promise.reject(
        new Error('Unable to delete the default native firebase app instance.'),
      );
    }

    return FirebaseCoreModule.deleteApp(this._name).then(() => APPS.deleteApp(this._name));
  }

  /**
   *
   * @return {*}
   */
  onReady(): Promise<App> {
    if (this._initialized) return Promise.resolve(this);

    return new Promise((resolve, reject) => {
      SharedEventEmitter.once(`AppReady:${this._name}`, ({ error }) => {
        if (error) return reject(new Error(error)); // error is a string as it's from native
        return resolve(this); // return app
      });
    });
  }

  /**
   * toString returns the name of the app.
   *
   * @return {string}
   */
  toString() {
    return this._name;
  }
}
