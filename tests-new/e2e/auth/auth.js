const sinon = require('sinon');
require('should-sinon');
const should = require('should');

const randomString = (length, chars) => {
  let mask = '';
  if (chars.indexOf('a') > -1) mask += 'abcdefghijklmnopqrstuvwxyz';
  if (chars.indexOf('A') > -1) mask += 'ABCDEFGHIJKLMNOPQRSTUVWXYZ';
  if (chars.indexOf('#') > -1) mask += '0123456789';
  if (chars.indexOf('!') > -1) mask += '~`!@#$%^&*()_+-={}[]:";\'<>?,./|\\';
  let result = '';
  for (let i = length; i > 0; --i) {
    result += mask[Math.round(Math.random() * (mask.length - 1))];
  }
  return result;
};

describe('.auth()', () => {
  beforeEach(async () => {
    await device.reloadReactNative();
  });

  describe('.signInAnonymously()', () => {
    it('it should sign in anonymously', () => {
      const successCb = currentUser => {
        debugger;
        currentUser.should.be.an.Object();
        currentUser.uid.should.be.a.String();
        currentUser.toJSON().should.be.an.Object();
        should.equal(currentUser.toJSON().email, null);
        currentUser.isAnonymous.should.equal(true);
        currentUser.providerId.should.equal('firebase');

        currentUser.should.equal(bridge.module.auth().currentUser);

        return bridge.module.auth().signOut();
      };

      return bridge.module
        .auth()
        .signInAnonymously()
        .then(successCb);
    });
  });

  describe('.signInAnonymouslyAndRetrieveData()', () => {
    it('it should sign in anonymously', () => {
      const successCb = currentUserCredential => {
        const currentUser = currentUserCredential.user;
        currentUser.should.be.an.Object();
        currentUser.uid.should.be.a.String();
        currentUser.toJSON().should.be.an.Object();
        should.equal(currentUser.toJSON().email, null);
        currentUser.isAnonymous.should.equal(true);
        currentUser.providerId.should.equal('firebase');
        currentUser.should.equal(bridge.module.auth().currentUser);

        const { additionalUserInfo } = currentUserCredential;
        additionalUserInfo.should.be.an.Object();

        return bridge.module.auth().signOut();
      };

      return bridge.module
        .auth()
        .signInAnonymouslyAndRetrieveData()
        .then(successCb);
    });
  });

  describe('.signInWithEmailAndPassword()', () => {
    it('it should login with email and password', () => {
      const email = 'test@test.com';
      const pass = 'test1234';

      const successCb = currentUser => {
        currentUser.should.be.an.Object();
        currentUser.uid.should.be.a.String();
        currentUser.toJSON().should.be.an.Object();
        currentUser.toJSON().email.should.eql('test@test.com');
        currentUser.isAnonymous.should.equal(false);
        currentUser.providerId.should.equal('firebase');
        currentUser.should.equal(bridge.module.auth().currentUser);

        return bridge.module.auth().signOut();
      };

      return bridge.module
        .auth()
        .signInWithEmailAndPassword(email, pass)
        .then(successCb);
    });

    it('it should error on login if user is disabled', () => {
      const email = 'disabled@account.com';
      const pass = 'test1234';

      const successCb = () => Promise.reject(new Error('Did not error.'));

      const failureCb = error => {
        error.code.should.equal('auth/user-disabled');
        error.message.should.equal(
          'The user account has been disabled by an administrator.'
        );
        return Promise.resolve();
      };

      return bridge.module
        .auth()
        .signInWithEmailAndPassword(email, pass)
        .then(successCb)
        .catch(failureCb);
    });

    it('it should error on login if password incorrect', () => {
      const email = 'test@test.com';
      const pass = 'test1234666';

      const successCb = () => Promise.reject(new Error('Did not error.'));

      const failureCb = error => {
        error.code.should.equal('auth/wrong-password');
        error.message.should.equal(
          'The password is invalid or the user does not have a password.'
        );
        return Promise.resolve();
      };

      return bridge.module
        .auth()
        .signInWithEmailAndPassword(email, pass)
        .then(successCb)
        .catch(failureCb);
    });

    it('it should error on login if user not found', () => {
      const email = 'randomSomeone@fourOhFour.com';
      const pass = 'test1234';

      const successCb = () => Promise.reject(new Error('Did not error.'));

      const failureCb = error => {
        error.code.should.equal('auth/user-not-found');
        error.message.should.equal(
          'There is no user record corresponding to this identifier. The user may have been deleted.'
        );
        return Promise.resolve();
      };

      return bridge.module
        .auth()
        .signInWithEmailAndPassword(email, pass)
        .then(successCb)
        .catch(failureCb);
    });
  });

  describe('.onAuthStateChanged()', () => {
    it('calls callback with the current user and when auth state changes', async () => {
      await bridge.module.auth().signInAnonymouslyAndRetrieveData();

      // Test
      const callback = sinon.spy();

      let unsubscribe;
      await new Promise(resolve => {
        unsubscribe = bridge.module.auth().onAuthStateChanged(user => {
          callback(user);
          resolve();
        });
      });

      callback.should.be.calledWith(bridge.module.auth().currentUser);
      callback.should.be.calledOnce();

      // Sign out

      await bridge.module.auth().signOut();

      await new Promise(resolve => {
        setTimeout(() => resolve(), 100);
      });

      // Assertions

      callback.should.be.calledWith(null);
      callback.should.be.calledTwice();

      // Tear down

      unsubscribe();
    });

    it('stops listening when unsubscribe called', async () => {
      await bridge.module.auth().signInAnonymouslyAndRetrieveData();

      // Test
      const callback = sinon.spy();

      let unsubscribe;
      await new Promise(resolve => {
        unsubscribe = bridge.module.auth().onAuthStateChanged(user => {
          callback(user);
          resolve();
        });
      });

      callback.should.be.calledWith(bridge.module.auth().currentUser);
      callback.should.be.calledOnce();

      // Sign out

      await bridge.module.auth().signOut();

      await new Promise(resolve => {
        setTimeout(() => resolve(), 100);
      });

      // Assertions

      // callback.should.be.calledWith(null);
      callback.should.be.calledTwice();

      // Unsubscribe

      unsubscribe();

      // Sign back in

      await bridge.module.auth().signInAnonymouslyAndRetrieveData();

      // Assertions

      callback.should.be.calledTwice();

      // Tear down

      await bridge.module.auth().signOut();
    });
  });
});
