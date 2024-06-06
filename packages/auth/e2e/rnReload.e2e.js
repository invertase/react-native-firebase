const TEST_EMAIL = 'test@test.com';
const TEST_PASS = 'test1234';

const { clearAllUsers } = require('./helpers');

describe('auth()', function () {
  !skipCompatTests &&
    describe('firebase v8 compatibility', function () {
      before(async function () {
        try {
          await clearAllUsers();
        } catch (e) {
          throw e;
        }
        try {
          await firebase.auth().createUserWithEmailAndPassword(TEST_EMAIL, TEST_PASS);
        } catch (e) {
          // they may already exist, that's fine
        }
      });

      beforeEach(async function () {
        if (firebase.auth().currentUser) {
          await firebase.auth().signOut();
          await Utils.sleep(50);
        }
      });

      describe('firebase.auth().currentUser', function () {
        it('exists after reload', async function () {
          // Detox on iOS crashing app on reloads, documented
          // https://github.com/wix/detox/blob/master/docs/APIRef.DeviceObjectAPI.md#devicereloadreactnative
          if (device.getPlatform() === 'ios') {
            this.skip();
          }
          let currentUser;
          // before reload
          await firebase.auth().signInAnonymously();

          ({ currentUser } = firebase.auth());
          currentUser.should.be.an.Object();
          currentUser.uid.should.be.a.String();
          currentUser.toJSON().should.be.an.Object();
          should.equal(currentUser.toJSON().email, null);
          currentUser.isAnonymous.should.equal(true);
          currentUser.providerId.should.equal('firebase');
          currentUser.should.equal(firebase.auth().currentUser);

          // RELOAD
          await device.reloadReactNative();

          // after reload
          ({ currentUser } = firebase.auth());
          currentUser.should.be.an.Object();
          currentUser.uid.should.be.a.String();
          currentUser.toJSON().should.be.an.Object();
          should.equal(currentUser.toJSON().email, null);
          currentUser.isAnonymous.should.equal(true);
          currentUser.providerId.should.equal('firebase');
          currentUser.should.equal(firebase.auth().currentUser);

          // test correct user is returned after signing
          // in with a different user then reloading
          await firebase.auth().signOut();

          await firebase.auth().signInWithEmailAndPassword(TEST_EMAIL, TEST_PASS);

          ({ currentUser } = firebase.auth());
          currentUser.should.be.an.Object();
          currentUser.uid.should.be.a.String();
          currentUser.toJSON().should.be.an.Object();
          currentUser.toJSON().email.should.eql(TEST_EMAIL);
          currentUser.isAnonymous.should.equal(false);
          currentUser.providerId.should.equal('firebase');
          currentUser.should.equal(firebase.auth().currentUser);

          // RELOAD
          await device.reloadReactNative();

          // after reload
          ({ currentUser } = firebase.auth());
          currentUser.should.be.an.Object();
          currentUser.uid.should.be.a.String();
          currentUser.toJSON().should.be.an.Object();
          currentUser.toJSON().email.should.eql(TEST_EMAIL);
          currentUser.isAnonymous.should.equal(false);
          currentUser.providerId.should.equal('firebase');
          currentUser.should.equal(firebase.auth().currentUser);
        }).timeout(15000);
      });
    });

  describe('modular', function () {
    before(async function () {
      const { createUserWithEmailAndPassword, getAuth } = authModular;

      const defaultApp = firebase.app();
      const defaultAuth = getAuth(defaultApp);

      try {
        await clearAllUsers();
      } catch (e) {
        throw e;
      }
      try {
        await createUserWithEmailAndPassword(defaultAuth, TEST_EMAIL, TEST_PASS);
      } catch (e) {
        // they may already exist, that's fine
      }
    });

    beforeEach(async function () {
      const { getAuth, signOut } = authModular;

      const defaultApp = firebase.app();
      const defaultAuth = getAuth(defaultApp);

      if (defaultAuth.currentUser) {
        await signOut(defaultAuth);
        await Utils.sleep(50);
      }
    });

    describe('firebase.auth().currentUser', function () {
      it('exists after reload', async function () {
        let { getAuth, signOut, signInAnonymously, signInWithEmailAndPassword } = authModular;

        let defaultAuth = getAuth(firebase.app());

        // Detox on iOS crashing app on reloads, documented
        // https://github.com/wix/detox/blob/master/docs/APIRef.DeviceObjectAPI.md#devicereloadreactnative
        if (device.getPlatform() === 'ios') {
          this.skip();
        }
        let currentUser;
        // before reload
        await signInAnonymously(defaultAuth);

        currentUser = defaultAuth.currentUser;
        currentUser.should.be.an.Object();
        currentUser.uid.should.be.a.String();
        currentUser.toJSON().should.be.an.Object();
        should.equal(currentUser.toJSON().email, null);
        currentUser.isAnonymous.should.equal(true);
        currentUser.providerId.should.equal('firebase');
        currentUser.should.equal(defaultAuth.currentUser);

        // RELOAD
        await device.reloadReactNative();
        // After reload, we have to fetch the exported methods and auth again...
        ({ getAuth, signOut, signInAnonymously, signInWithEmailAndPassword } = authModular);
        defaultAuth = getAuth(firebase.app());

        // after reload
        currentUser = defaultAuth.currentUser;
        currentUser.should.be.an.Object();
        currentUser.uid.should.be.a.String();
        currentUser.toJSON().should.be.an.Object();
        should.equal(currentUser.toJSON().email, null);
        currentUser.isAnonymous.should.equal(true);
        currentUser.providerId.should.equal('firebase');
        currentUser.should.equal(defaultAuth.currentUser);

        // test correct user is returned after signing
        // in with a different user then reloading
        await signOut(defaultAuth);

        await signInWithEmailAndPassword(defaultAuth, TEST_EMAIL, TEST_PASS);

        currentUser = defaultAuth.currentUser;
        currentUser.should.be.an.Object();
        currentUser.uid.should.be.a.String();
        currentUser.toJSON().should.be.an.Object();
        currentUser.toJSON().email.should.eql(TEST_EMAIL);
        currentUser.isAnonymous.should.equal(false);
        currentUser.providerId.should.equal('firebase');
        currentUser.should.equal(defaultAuth.currentUser);

        // RELOAD
        await device.reloadReactNative();
        // defaultAuth = getAuth(firebase.app());

        // after reload
        currentUser = defaultAuth.currentUser;
        currentUser.should.be.an.Object();
        currentUser.uid.should.be.a.String();
        currentUser.toJSON().should.be.an.Object();
        currentUser.toJSON().email.should.eql(TEST_EMAIL);
        currentUser.isAnonymous.should.equal(false);
        currentUser.providerId.should.equal('firebase');
        currentUser.should.equal(defaultAuth.currentUser);
      }).timeout(15000);
    });
  });
});
