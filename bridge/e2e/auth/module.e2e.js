describe('.auth()', () => {
  describe('.signInAnonymously()', () => {
    it('it should sign in anonymously', () => {
      const successCb = currentUser => {
        currentUser.should.be.an.Object();
        currentUser.uid.should.be.a.String();
        currentUser.toJSON().should.be.an.Object();
        should.equal(currentUser.toJSON().email, null);
        currentUser.isAnonymous.should.equal(true);
        currentUser.providerId.should.equal('firebase');
        currentUser.should.equal(firebase.auth().currentUser);
        return firebase.auth().signOut();
      };

      return firebase
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
        currentUser.should.equal(firebase.auth().currentUser);

        const { additionalUserInfo } = currentUserCredential;
        additionalUserInfo.should.be.an.Object();

        return firebase.auth().signOut();
      };

      return firebase
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
        currentUser.should.equal(firebase.auth().currentUser);

        return firebase.auth().signOut();
      };

      return firebase
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

      return firebase
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

      return firebase
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

      return firebase
        .auth()
        .signInWithEmailAndPassword(email, pass)
        .then(successCb)
        .catch(failureCb);
    });
  });

  describe('.onAuthStateChanged()', () => {
    it('calls callback with the current user and when auth state changes', async () => {
      await firebase.auth().signInAnonymouslyAndRetrieveData();

      // Test
      const callback = sinon.spy();

      let unsubscribe;
      await new Promise(resolve => {
        unsubscribe = firebase.auth().onAuthStateChanged(user => {
          callback(user);
          resolve();
        });
      });

      callback.should.be.calledWith(firebase.auth().currentUser);
      callback.should.be.calledOnce();

      // Sign out

      await firebase.auth().signOut();

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
      await firebase.auth().signInAnonymouslyAndRetrieveData();

      // Test
      const callback = sinon.spy();

      let unsubscribe;
      await new Promise(resolve => {
        unsubscribe = firebase.auth().onAuthStateChanged(user => {
          callback(user);
          resolve();
        });
      });

      callback.should.be.calledWith(firebase.auth().currentUser);
      callback.should.be.calledOnce();

      // Sign out

      await firebase.auth().signOut();

      await new Promise(resolve => {
        setTimeout(() => resolve(), 100);
      });

      // Assertions

      // callback.should.be.calledWith(null);
      callback.should.be.calledTwice();

      // Unsubscribe

      unsubscribe();

      // Sign back in

      await firebase.auth().signInAnonymouslyAndRetrieveData();

      // Assertions

      callback.should.be.calledTwice();

      // Tear down

      await firebase.auth().signOut();
    });
  });
});
