import { Platform } from 'react-native';
import should from 'should';

import RNFirebase from './../../../firebase/firebase';

const androidTestConfig = {
  // firebase android sdk completely ignores client id
  clientId: '305229645282-j8ij0jev9ut24odmlk9i215pas808ugn.apps.googleusercontent.com',
  appId: '1:305229645282:android:efe37851d57e1d05',
  apiKey: 'AIzaSyDnVqNhxU0Biit9nCo4RorAh5ulQQwko3E',
  databaseURL: 'https://rnfirebase-b9ad4.firebaseio.com',
  storageBucket: 'rnfirebase-b9ad4.appspot.com',
  messagingSenderId: '305229645282',
  projectId: 'rnfirebase-b9ad4',
};

const iosTestConfig = {
  clientId: '305229645282-22imndi01abc2p6esgtu1i1m9mqrd0ib.apps.googleusercontent.com',
  androidClientId: androidTestConfig.clientId,
  appId: '1:305229645282:ios:7b45748cb1117d2d',
  apiKey: 'AIzaSyDnVqNhxU0Biit9nCo4RorAh5ulQQwko3E',
  databaseURL: 'https://rnfirebase-b9ad4.firebaseio.com',
  storageBucket: 'rnfirebase-b9ad4.appspot.com',
  messagingSenderId: '305229645282',
  projectId: 'rnfirebase-b9ad4',
};

function coreTests({ before, describe, it, firebase }) {
  before(() => {
    // todo
  });

  describe('Core', () => {
    it('it should create js apps for natively initialized apps', () => {
      should.equal(RNFirebase.app()._nativeInitialized, true);
      return Promise.resolve();
    });

    it('it should resolve onReady for natively initialized apps', () => {
      return RNFirebase.app().onReady();
    });

    it('it should provide an array of apps', () => {
      should.equal(!!RNFirebase.apps.length, true);
      should.equal(RNFirebase.apps[0]._name, RNFirebase.DEFAULT_APP_NAME);
      should.equal(RNFirebase.apps[0].name, '[DEFAULT]');
      return Promise.resolve();
    });

    it('it should provide the sdk version', () => {
      should.equal(!!RNFirebase.SDK_VERSION.length, true);
      return Promise.resolve();
    });

    it('it should initialize dynamic apps', () => {
      return RNFirebase
        .initializeApp(Platform.OS === 'ios' ? iosTestConfig : androidTestConfig, 'testsCoreApp')
        .onReady()
        .then((newApp) => {
          newApp.name.should.equal('TESTSCOREAPP');
          newApp.options.apiKey.should.equal((Platform.OS === 'ios' ? iosTestConfig : androidTestConfig).apiKey);
          return newApp.delete();
        });
    });
  });
}

export default coreTests;
