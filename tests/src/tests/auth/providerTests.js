export default (providerTests = ({ context, describe, it, firebase }) => {
  describe('EmailAuthProvider', () => {
    context('constructor', () => {
      it('should throw an unsupported error', () => {
        (() => new firebase.native.auth.EmailAuthProvider()).should.throw(
          '`new EmailAuthProvider()` is not supported on the native Firebase SDKs.'
        );
      });
    });

    context('credential', () => {
      it('should return a credential object', () => {
        const email = 'email@email.com';
        const password = 'password';
        const credential = firebase.native.auth.EmailAuthProvider.credential(
          email,
          password
        );
        credential.providerId.should.equal('password');
        credential.token.should.equal(email);
        credential.secret.should.equal(password);
      });
    });

    context('PROVIDER_ID', () => {
      it('should return password', () => {
        firebase.native.auth.EmailAuthProvider.PROVIDER_ID.should.equal(
          'password'
        );
      });
    });
  });

  describe('FacebookAuthProvider', () => {
    context('constructor', () => {
      it('should throw an unsupported error', () => {
        (() => new firebase.native.auth.FacebookAuthProvider()).should.throw(
          '`new FacebookAuthProvider()` is not supported on the native Firebase SDKs.'
        );
      });
    });

    context('credential', () => {
      it('should return a credential object', () => {
        const token = '123456';
        const credential = firebase.native.auth.FacebookAuthProvider.credential(
          token
        );
        credential.providerId.should.equal('facebook.com');
        credential.token.should.equal(token);
        credential.secret.should.equal('');
      });
    });

    context('PROVIDER_ID', () => {
      it('should return facebook.com', () => {
        firebase.native.auth.FacebookAuthProvider.PROVIDER_ID.should.equal(
          'facebook.com'
        );
      });
    });
  });

  describe('GithubAuthProvider', () => {
    context('constructor', () => {
      it('should throw an unsupported error', () => {
        (() => new firebase.native.auth.GithubAuthProvider()).should.throw(
          '`new GithubAuthProvider()` is not supported on the native Firebase SDKs.'
        );
      });
    });

    context('credential', () => {
      it('should return a credential object', () => {
        const token = '123456';
        const credential = firebase.native.auth.GithubAuthProvider.credential(
          token
        );
        credential.providerId.should.equal('github.com');
        credential.token.should.equal(token);
        credential.secret.should.equal('');
      });
    });

    context('PROVIDER_ID', () => {
      it('should return github.com', () => {
        firebase.native.auth.GithubAuthProvider.PROVIDER_ID.should.equal(
          'github.com'
        );
      });
    });
  });

  describe('GoogleAuthProvider', () => {
    context('constructor', () => {
      it('should throw an unsupported error', () => {
        (() => new firebase.native.auth.GoogleAuthProvider()).should.throw(
          '`new GoogleAuthProvider()` is not supported on the native Firebase SDKs.'
        );
      });
    });

    context('credential', () => {
      it('should return a credential object', () => {
        const token = '123456';
        const secret = '654321';
        const credential = firebase.native.auth.GoogleAuthProvider.credential(
          token,
          secret
        );
        credential.providerId.should.equal('google.com');
        credential.token.should.equal(token);
        credential.secret.should.equal(secret);
      });
    });

    context('PROVIDER_ID', () => {
      it('should return google.com', () => {
        firebase.native.auth.GoogleAuthProvider.PROVIDER_ID.should.equal(
          'google.com'
        );
      });
    });
  });

  describe('OAuthProvider', () => {
    context('constructor', () => {
      it('should throw an unsupported error', () => {
        (() => new firebase.native.auth.OAuthProvider()).should.throw(
          '`new OAuthProvider()` is not supported on the native Firebase SDKs.'
        );
      });
    });

    context('credential', () => {
      it('should return a credential object', () => {
        const idToken = '123456';
        const accessToken = '654321';
        const credential = firebase.native.auth.OAuthProvider.credential(
          idToken,
          accessToken
        );
        credential.providerId.should.equal('oauth');
        credential.token.should.equal(idToken);
        credential.secret.should.equal(accessToken);
      });
    });

    context('PROVIDER_ID', () => {
      it('should return oauth', () => {
        firebase.native.auth.OAuthProvider.PROVIDER_ID.should.equal('oauth');
      });
    });
  });

  describe('PhoneAuthProvider', () => {
    context('constructor', () => {
      it('should throw an unsupported error', () => {
        (() => new firebase.native.auth.PhoneAuthProvider()).should.throw(
          '`new PhoneAuthProvider()` is not supported on the native Firebase SDKs.'
        );
      });
    });

    context('credential', () => {
      it('should return a credential object', () => {
        const verificationId = '123456';
        const code = '654321';
        const credential = firebase.native.auth.PhoneAuthProvider.credential(
          verificationId,
          code
        );
        credential.providerId.should.equal('phone');
        credential.token.should.equal(verificationId);
        credential.secret.should.equal(code);
      });
    });

    context('PROVIDER_ID', () => {
      it('should return phone', () => {
        firebase.native.auth.PhoneAuthProvider.PROVIDER_ID.should.equal(
          'phone'
        );
      });
    });
  });

  describe('TwitterAuthProvider', () => {
    context('constructor', () => {
      it('should throw an unsupported error', () => {
        (() => new firebase.native.auth.TwitterAuthProvider()).should.throw(
          '`new TwitterAuthProvider()` is not supported on the native Firebase SDKs.'
        );
      });
    });

    context('credential', () => {
      it('should return a credential object', () => {
        const token = '123456';
        const secret = '654321';
        const credential = firebase.native.auth.TwitterAuthProvider.credential(
          token,
          secret
        );
        credential.providerId.should.equal('twitter.com');
        credential.token.should.equal(token);
        credential.secret.should.equal(secret);
      });
    });

    context('PROVIDER_ID', () => {
      it('should return twitter.com', () => {
        firebase.native.auth.TwitterAuthProvider.PROVIDER_ID.should.equal(
          'twitter.com'
        );
      });
    });
  });
});
