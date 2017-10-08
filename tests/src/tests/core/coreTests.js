import { Platform } from 'react-native';
import should from 'should';

import RNFirebase from './../../../firebase/firebase';

const androidTestConfig = {
  // firebase android sdk completely ignores client id
  clientId: '305229645282-j8ij0jev9ut24odmlk9i215pas808ugn.apps.googleusercontent.com',
  appId: '1:305229645282:android:efe37851d57e1d05',
  apiKey: 'AIzaSyCzbBYFyX8d6VdSu7T4s10IWYbPc-dguwM',
  databaseURL: 'https://rnfirebase-b9ad4.firebaseio.com',
  storageBucket: 'rnfirebase-b9ad4.appspot.com',
  messagingSenderId: '305229645282',
  projectId: 'rnfirebase-b9ad4',
};

const iosTestConfig = {
  clientId: '305229645282-22imndi01abc2p6esgtu1i1m9mqrd0ib.apps.googleusercontent.com',
  androidClientId: androidTestConfig.clientId,
  appId: '1:305229645282:ios:7b45748cb1117d2d',
  apiKey: 'AIzaSyAcdVLG5dRzA1ck_fa_xd4Z0cY7cga7S5A',
  databaseURL: 'https://rnfirebase-b9ad4.firebaseio.com',
  storageBucket: 'rnfirebase-b9ad4.appspot.com',
  messagingSenderId: '305229645282',
  projectId: 'rnfirebase-b9ad4',
};

function coreTests({ describe, it }) {
  describe('Core', () => {
    it('it should create js apps for natively initialized apps', () => {
      should.equal(RNFirebase.app()._nativeInitialized, true);
      return Promise.resolve();
    });

    it('natively initialized apps should have options available in js', () => {
      should.equal(RNFirebase.app().options.apiKey, Platform.OS === 'ios' ? iosTestConfig.apiKey : androidTestConfig.apiKey);
      should.equal(RNFirebase.app().options.appId, Platform.OS === 'ios' ? iosTestConfig.appId : androidTestConfig.appId);
      should.equal(RNFirebase.app().options.databaseURL, iosTestConfig.databaseURL);
      should.equal(RNFirebase.app().options.messagingSenderId, iosTestConfig.messagingSenderId);
      should.equal(RNFirebase.app().options.projectId, iosTestConfig.projectId);
      should.equal(RNFirebase.app().options.storageBucket, iosTestConfig.storageBucket);
      return Promise.resolve();
    });

    it('it should resolve onReady for natively initialized apps', () => {
      return RNFirebase.app().onReady();
    });

    it('it should provide an array of apps', () => {
      should.equal(!!RNFirebase.apps.length, true);
      should.equal(RNFirebase.apps[0]._name, RNFirebase.utils.DEFAULT_APP_NAME);
      should.equal(RNFirebase.apps[0].name, '[DEFAULT]');
      return Promise.resolve();
    });

    // todo move to UTILS module tests
    it('it should provide the sdk version', () => {
      should.equal(!!RNFirebase.utils.VERSIONS['react-native-firebase'].length, true);
      return Promise.resolve();
    });

    // TODO add back in when android sdk support becomes available
    // it('it should initialize dynamic apps', () => {
    //   return RNFirebase
    //     .initializeApp(Platform.OS === 'ios' ? iosTestConfig : androidTestConfig, 'testsCoreApp')
    //     .onReady()
    //     .then((newApp) => {
    //       newApp.name.should.equal('TESTSCOREAPP');
    //       newApp.options.apiKey.should.equal((Platform.OS === 'ios' ? iosTestConfig : androidTestConfig).apiKey);
    //       return newApp.delete();
    //     });
    // });
  });
}

export default coreTests;
