describe('auth()', () => {
  beforeEach(async () => {
    if (firebase.auth().currentUser) {
      await firebase.auth().signOut();
      await sleep(50);
    }
  });

  describe('firebase.auth().currentUser', () => {
    it('exists after reload', async () => {
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

      const email = 'test@test.com';
      const pass = 'test1234';
      await firebase.auth().signInWithEmailAndPassword(email, pass);

      ({ currentUser } = firebase.auth());
      currentUser.should.be.an.Object();
      currentUser.uid.should.be.a.String();
      currentUser.toJSON().should.be.an.Object();
      currentUser.toJSON().email.should.eql(email);
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
      currentUser.toJSON().email.should.eql(email);
      currentUser.isAnonymous.should.equal(false);
      currentUser.providerId.should.equal('firebase');
      currentUser.should.equal(firebase.auth().currentUser);
    }).timeout(15000);
  });
});
