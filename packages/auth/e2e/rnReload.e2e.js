const TEST_EMAIL = 'test@test.com';
const TEST_PASS = 'test1234';

const { clearAllUsers } = require('./helpers');

describe('auth()', function () {
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

  // TODO(salakar): Detox on iOS crashing app on reloads
  android.describe('firebase.auth().currentUser', () => {
    it('exists after reload', async function () {
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
