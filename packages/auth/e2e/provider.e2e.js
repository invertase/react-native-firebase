describe('auth() -> Providers', function () {
  describe('firebase v8 compatibility', function () {
    beforeEach(async function beforeEachTest() {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = true;

      if (firebase.auth().currentUser) {
        await firebase.auth().signOut();
        await Utils.sleep(50);
      }
    });

    afterEach(async function afterEachTest() {
      // @ts-ignore
      globalThis.RNFB_SILENCE_MODULAR_DEPRECATION_WARNINGS = false;
    });

    describe('EmailAuthProvider', function () {
      describe('constructor', function () {
        it('should throw an unsupported error', function () {
          (() => new firebase.auth.EmailAuthProvider()).should.throw(
            '`new EmailAuthProvider()` is not supported on the native Firebase SDKs.',
          );
        });
      });

      describe('credential', function () {
        it('should return a credential object', function () {
          const email = 'email@email.com';
          const password = 'password';
          const credential = firebase.auth.EmailAuthProvider.credential(email, password);
          credential.providerId.should.equal('password');
          credential.token.should.equal(email);
          credential.secret.should.equal(password);
        });
      });

      describe('credentialWithLink', function () {
        it('should return a credential object', function () {
          const email = 'email@email.com';
          const link = 'link';
          const credential = firebase.auth.EmailAuthProvider.credentialWithLink(email, link);
          credential.providerId.should.equal('emailLink');
          credential.token.should.equal(email);
          credential.secret.should.equal(link);
        });
      });

      describe('EMAIL_PASSWORD_SIGN_IN_METHOD', function () {
        it('should return password', function () {
          firebase.auth.EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD.should.equal('password');
        });
      });

      describe('EMAIL_LINK_SIGN_IN_METHOD', function () {
        it('should return emailLink', function () {
          firebase.auth.EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD.should.equal('emailLink');
        });
      });

      describe('PROVIDER_ID', function () {
        it('should return password', function () {
          firebase.auth.EmailAuthProvider.PROVIDER_ID.should.equal('password');
        });
      });
    });

    describe('FacebookAuthProvider', function () {
      describe('constructor', function () {
        it('should throw an unsupported error', function () {
          (() => new firebase.auth.FacebookAuthProvider()).should.throw(
            '`new FacebookAuthProvider()` is not supported on the native Firebase SDKs.',
          );
        });
      });

      describe('credential', function () {
        it('should return a credential object', function () {
          const token = '123456';
          const credential = firebase.auth.FacebookAuthProvider.credential(token);
          credential.providerId.should.equal('facebook.com');
          credential.signInMethod.should.equal('facebook.com');
          credential.token.should.equal(token);
          credential.secret.should.equal('');
          credential.accessToken.should.equal(token);
          credential.toJSON().accessToken.should.equal(token);
        });
      });

      describe('credentialLimitedLogin', function () {
        it('should return a credential object', function () {
          const token = '123456';
          const nonce = '654321';
          const credential = firebase.auth.FacebookAuthProvider.credential(token, nonce);
          credential.providerId.should.equal('facebook.com');
          credential.token.should.equal(token);
          credential.secret.should.equal(nonce);
          credential.rawNonce.should.equal(nonce);
          credential.toJSON().nonce.should.equal(nonce);
        });
      });

      describe('credential extraction helpers', function () {
        it('should return null for native provider results and errors', function () {
          should.equal(firebase.auth.FacebookAuthProvider.credentialFromResult({}), null);
          should.equal(firebase.auth.FacebookAuthProvider.credentialFromError({}), null);
        });
      });

      describe('PROVIDER_ID', function () {
        it('should return facebook.com', function () {
          firebase.auth.FacebookAuthProvider.PROVIDER_ID.should.equal('facebook.com');
        });
      });

      describe('FACEBOOK_SIGN_IN_METHOD', function () {
        it('should return facebook.com', function () {
          firebase.auth.FacebookAuthProvider.FACEBOOK_SIGN_IN_METHOD.should.equal('facebook.com');
        });
      });
    });

    describe('GithubAuthProvider', function () {
      describe('constructor', function () {
        it('should throw an unsupported error', function () {
          (() => new firebase.auth.GithubAuthProvider()).should.throw(
            '`new GithubAuthProvider()` is not supported on the native Firebase SDKs.',
          );
        });
      });

      describe('credential', function () {
        it('should return a credential object', function () {
          const token = '123456';
          const credential = firebase.auth.GithubAuthProvider.credential(token);
          credential.providerId.should.equal('github.com');
          credential.token.should.equal(token);
          credential.secret.should.equal('');
        });
      });

      describe('credential extraction helpers', function () {
        it('should return null for native provider results and errors', function () {
          should.equal(firebase.auth.GithubAuthProvider.credentialFromResult({}), null);
          should.equal(firebase.auth.GithubAuthProvider.credentialFromError({}), null);
        });
      });

      describe('PROVIDER_ID', function () {
        it('should return github.com', function () {
          firebase.auth.GithubAuthProvider.PROVIDER_ID.should.equal('github.com');
        });
      });
    });

    describe('GoogleAuthProvider', function () {
      describe('constructor', function () {
        it('should throw an unsupported error', function () {
          (() => new firebase.auth.GoogleAuthProvider()).should.throw(
            '`new GoogleAuthProvider()` is not supported on the native Firebase SDKs.',
          );
        });
      });

      describe('credential', function () {
        it('should return a credential object', function () {
          const token = '123456';
          const secret = '654321';
          const credential = firebase.auth.GoogleAuthProvider.credential(token, secret);
          credential.providerId.should.equal('google.com');
          credential.token.should.equal(token);
          credential.secret.should.equal(secret);
        });
      });

      describe('PROVIDER_ID', function () {
        it('should return google.com', function () {
          firebase.auth.GoogleAuthProvider.PROVIDER_ID.should.equal('google.com');
        });
      });

      describe('credential extraction helpers', function () {
        it('should return null for native provider results and errors', function () {
          should.equal(firebase.auth.GoogleAuthProvider.credentialFromResult({}), null);
          should.equal(firebase.auth.GoogleAuthProvider.credentialFromError({}), null);
        });
      });
    });

    describe('OAuthProvider', function () {
      describe('credential', function () {
        it('should return a credential object', function () {
          const idToken = '123456';
          const accessToken = '654321';
          const provider = new firebase.auth.OAuthProvider('apple.com');
          const credential = provider.credential({ idToken, accessToken, rawNonce: 'nonce' });
          credential.providerId.should.equal('apple.com');
          credential.token.should.equal(idToken);
          credential.secret.should.equal('nonce');
          credential.idToken.should.equal(idToken);
          credential.accessToken.should.equal(accessToken);
          credential.rawNonce.should.equal('nonce');
          credential.toJSON().rawNonce.should.equal('nonce');
        });

        it('should return a credential object from json', function () {
          const idToken = '123456';
          const accessToken = '654321';
          const credential = firebase.auth.OAuthProvider.credentialFromJSON({
            providerId: 'apple.com',
            idToken,
            accessToken,
            nonce: 'nonce',
          });
          credential.providerId.should.equal('apple.com');
          credential.token.should.equal(idToken);
          credential.secret.should.equal('nonce');
          credential.idToken.should.equal(idToken);
          credential.accessToken.should.equal(accessToken);
          credential.rawNonce.should.equal('nonce');
        });

        it('should return a credential object from a json string', function () {
          const idToken = '123456';
          const accessToken = '654321';
          const credential = firebase.auth.OAuthProvider.credentialFromJSON(
            JSON.stringify({
              providerId: 'apple.com',
              idToken,
              accessToken,
              rawNonce: 'nonce',
            }),
          );
          credential.providerId.should.equal('apple.com');
          credential.token.should.equal(idToken);
          credential.secret.should.equal('nonce');
          credential.idToken.should.equal(idToken);
          credential.accessToken.should.equal(accessToken);
          credential.rawNonce.should.equal('nonce');
        });

        it('should map access-token-only json credentials to the secret bridge field', function () {
          const accessToken = '654321';
          const credential = firebase.auth.OAuthProvider.credentialFromJSON({
            providerId: 'oauth',
            accessToken,
          });
          credential.providerId.should.equal('oauth');
          credential.token.should.equal('');
          credential.secret.should.equal(accessToken);
          credential.accessToken.should.equal(accessToken);
        });

        it('should throw if json is missing a provider id', function () {
          (() =>
            firebase.auth.OAuthProvider.credentialFromJSON({
              idToken: '123456',
            })).should.throw(
            "firebase.auth.OAuthProvider.credentialFromJSON(*) expected 'providerId' to be a string value.",
          );
        });

        it('should throw if string json is malformed', function () {
          (() => firebase.auth.OAuthProvider.credentialFromJSON('{')).should.throw(
            "firebase.auth.OAuthProvider.credentialFromJSON(*) expected 'json' to be a valid JSON string.",
          );
        });

        it('should map access-token-only credentials to the secret bridge field', function () {
          const accessToken = '654321';
          const provider = new firebase.auth.OAuthProvider('oauth');
          const credential = provider.credential({ accessToken });
          credential.providerId.should.equal('oauth');
          credential.token.should.equal('');
          credential.secret.should.equal(accessToken);
          credential.accessToken.should.equal(accessToken);
        });
      });

      describe('PROVIDER_ID', function () {
        it('should return microsoft', function () {
          const provider = new firebase.auth.OAuthProvider('microsoft.com');
          provider.PROVIDER_ID.should.equal('microsoft.com');
        });
      });

      describe('provider object', function () {
        it('should return a credential object with scopes and custom parameters', function () {
          const provider = new firebase.auth.OAuthProvider('microsoft.com');
          provider.addScope('profile');
          provider.addScope('email');
          provider.setCustomParameters({
            prompt: 'consent',
          });

          provider.toObject().scopes.should.containEql('profile');
          provider.toObject().scopes.should.containEql('email');
          provider.toObject().customParameters.prompt.should.equal('consent');
        });
      });
    });

    describe('PhoneAuthProvider', function () {
      describe('credential', function () {
        it('should return a credential object', function () {
          const verificationId = '123456';
          const code = '654321';
          const credential = firebase.auth.PhoneAuthProvider.credential(verificationId, code);
          credential.providerId.should.equal('phone');
          credential.token.should.equal(verificationId);
          credential.secret.should.equal(code);
        });
      });

      describe('PROVIDER_ID', function () {
        it('should return phone', function () {
          firebase.auth.PhoneAuthProvider.PROVIDER_ID.should.equal('phone');
        });
      });
    });

    describe('TwitterAuthProvider', function () {
      describe('constructor', function () {
        it('should throw an unsupported error', function () {
          (() => new firebase.auth.TwitterAuthProvider()).should.throw(
            '`new TwitterAuthProvider()` is not supported on the native Firebase SDKs.',
          );
        });
      });

      describe('credential', function () {
        it('should return a credential object', function () {
          const token = '123456';
          const secret = '654321';
          const credential = firebase.auth.TwitterAuthProvider.credential(token, secret);
          credential.providerId.should.equal('twitter.com');
          credential.token.should.equal(token);
          credential.secret.should.equal(secret);
        });
      });

      describe('PROVIDER_ID', function () {
        it('should return twitter.com', function () {
          firebase.auth.TwitterAuthProvider.PROVIDER_ID.should.equal('twitter.com');
        });
      });
    });

    describe('OIDCAuthProvider', function () {
      describe('constructor', function () {
        it('should throw an unsupported error', function () {
          (() => new firebase.auth.OIDCAuthProvider()).should.throw(
            '`new OIDCAuthProvider()` is not supported on the native Firebase SDKs.',
          );
        });
      });

      describe('credential', function () {
        it('should return a credential object', function () {
          const token = '123456';
          const secret = '654321';
          const providerSuffix = 'sample-provider';
          const credential = firebase.auth.OIDCAuthProvider.credential(
            providerSuffix,
            token,
            secret,
          );
          credential.providerId.should.equal('oidc.' + providerSuffix);
          credential.token.should.equal(token);
          credential.secret.should.equal(secret);
        });
      });

      describe('PROVIDER_ID', function () {
        it('should return oidc.', function () {
          firebase.auth.OIDCAuthProvider.PROVIDER_ID.should.equal('oidc.');
        });
      });
    });
  });

  describe('modular', function () {
    beforeEach(async function () {
      const { getApp } = modular;
      const { signOut, getAuth } = authModular;

      const defaultApp = getApp();
      const defaultAuth = getAuth(defaultApp);

      if (defaultAuth.currentUser) {
        await signOut(defaultAuth);
        await Utils.sleep(50);
      }
    });

    describe('EmailAuthProvider', function () {
      describe('constructor', function () {
        it('should throw an unsupported error', function () {
          const { EmailAuthProvider } = authModular;

          (() => new EmailAuthProvider()).should.throw(
            '`new EmailAuthProvider()` is not supported on the native Firebase SDKs.',
          );
        });
      });

      describe('credential', function () {
        it('should return a credential object', function () {
          const { EmailAuthProvider } = authModular;

          const email = 'email@email.com';
          const password = 'password';
          const credential = EmailAuthProvider.credential(email, password);
          credential.providerId.should.equal('password');
          credential.signInMethod.should.equal('password');
          credential.token.should.equal(email);
          credential.secret.should.equal(password);
          credential.toJSON().email.should.equal(email);
          credential.toJSON().password.should.equal(password);
        });
      });

      describe('credentialWithLink', function () {
        it('should return a credential object', function () {
          const { EmailAuthProvider } = authModular;

          const email = 'email@email.com';
          const link = 'link';
          const credential = EmailAuthProvider.credentialWithLink(email, link);
          credential.providerId.should.equal('emailLink');
          credential.signInMethod.should.equal('emailLink');
          credential.token.should.equal(email);
          credential.secret.should.equal(link);
          credential.toJSON().email.should.equal(email);
          credential.toJSON().password.should.equal(link);
          should.equal(credential.toJSON().tenantId, null);
        });
      });

      describe('EMAIL_PASSWORD_SIGN_IN_METHOD', function () {
        it('should return password', function () {
          const { EmailAuthProvider } = authModular;

          EmailAuthProvider.EMAIL_PASSWORD_SIGN_IN_METHOD.should.equal('password');
        });
      });

      describe('EMAIL_LINK_SIGN_IN_METHOD', function () {
        it('should return emailLink', function () {
          const { EmailAuthProvider } = authModular;

          EmailAuthProvider.EMAIL_LINK_SIGN_IN_METHOD.should.equal('emailLink');
        });
      });

      describe('PROVIDER_ID', function () {
        it('should return password', function () {
          const { EmailAuthProvider } = authModular;

          EmailAuthProvider.PROVIDER_ID.should.equal('password');
        });
      });
    });

    describe('FacebookAuthProvider', function () {
      describe('constructor', function () {
        it('should throw an unsupported error', function () {
          const { FacebookAuthProvider } = authModular;

          (() => new FacebookAuthProvider()).should.throw(
            '`new FacebookAuthProvider()` is not supported on the native Firebase SDKs.',
          );
        });
      });

      describe('credential', function () {
        it('should return a credential object', function () {
          const { FacebookAuthProvider } = authModular;

          const token = '123456';
          const credential = FacebookAuthProvider.credential(token);
          credential.providerId.should.equal('facebook.com');
          credential.signInMethod.should.equal('facebook.com');
          credential.token.should.equal(token);
          credential.secret.should.equal('');
          credential.accessToken.should.equal(token);
          credential.toJSON().accessToken.should.equal(token);
        });
      });

      describe('credentialLimitedLogin', function () {
        it('should return a credential object', function () {
          const { FacebookAuthProvider } = authModular;

          const token = '123456';
          const nonce = '654321';
          const credential = FacebookAuthProvider.credential(token, nonce);
          credential.providerId.should.equal('facebook.com');
          credential.token.should.equal(token);
          credential.secret.should.equal(nonce);
          credential.rawNonce.should.equal(nonce);
          credential.toJSON().nonce.should.equal(nonce);
        });
      });

      describe('credential extraction helpers', function () {
        it('should return null for native provider results and errors', function () {
          const { FacebookAuthProvider } = authModular;

          should.equal(FacebookAuthProvider.credentialFromResult({}), null);
          should.equal(FacebookAuthProvider.credentialFromError({}), null);
        });
      });

      describe('PROVIDER_ID', function () {
        it('should return facebook.com', function () {
          const { FacebookAuthProvider } = authModular;

          FacebookAuthProvider.PROVIDER_ID.should.equal('facebook.com');
        });
      });

      describe('FACEBOOK_SIGN_IN_METHOD', function () {
        it('should return facebook.com', function () {
          const { FacebookAuthProvider } = authModular;

          FacebookAuthProvider.FACEBOOK_SIGN_IN_METHOD.should.equal('facebook.com');
        });
      });
    });

    describe('GithubAuthProvider', function () {
      describe('constructor', function () {
        it('should throw an unsupported error', function () {
          const { GithubAuthProvider } = authModular;

          (() => new GithubAuthProvider()).should.throw(
            '`new GithubAuthProvider()` is not supported on the native Firebase SDKs.',
          );
        });
      });

      describe('credential', function () {
        it('should return a credential object', function () {
          const { GithubAuthProvider } = authModular;

          const token = '123456';
          const credential = GithubAuthProvider.credential(token);
          credential.providerId.should.equal('github.com');
          credential.signInMethod.should.equal('github.com');
          credential.token.should.equal(token);
          credential.secret.should.equal('');
          credential.accessToken.should.equal(token);
          credential.toJSON().accessToken.should.equal(token);
        });
      });

      describe('credential extraction helpers', function () {
        it('should return null for native provider results and errors', function () {
          const { GithubAuthProvider } = authModular;

          should.equal(GithubAuthProvider.credentialFromResult({}), null);
          should.equal(GithubAuthProvider.credentialFromError({}), null);
        });
      });

      describe('GITHUB_SIGN_IN_METHOD', function () {
        it('should return github.com', function () {
          const { GithubAuthProvider } = authModular;

          GithubAuthProvider.GITHUB_SIGN_IN_METHOD.should.equal('github.com');
        });
      });

      describe('PROVIDER_ID', function () {
        it('should return github.com', function () {
          const { GithubAuthProvider } = authModular;

          GithubAuthProvider.PROVIDER_ID.should.equal('github.com');
        });
      });
    });

    describe('GoogleAuthProvider', function () {
      describe('constructor', function () {
        it('should throw an unsupported error', function () {
          const { GoogleAuthProvider } = authModular;

          (() => new GoogleAuthProvider()).should.throw(
            '`new GoogleAuthProvider()` is not supported on the native Firebase SDKs.',
          );
        });
      });

      describe('credential', function () {
        it('should return a credential object', function () {
          const { GoogleAuthProvider } = authModular;

          const token = '123456';
          const secret = '654321';
          const credential = GoogleAuthProvider.credential(token, secret);
          credential.providerId.should.equal('google.com');
          credential.signInMethod.should.equal('google.com');
          credential.token.should.equal(token);
          credential.secret.should.equal(secret);
          credential.idToken.should.equal(token);
          credential.accessToken.should.equal(secret);
          credential.toJSON().idToken.should.equal(token);
          credential.toJSON().accessToken.should.equal(secret);
        });

        it('should require at least one token', function () {
          const { GoogleAuthProvider } = authModular;

          (() => GoogleAuthProvider.credential(null, null)).should.throw(
            'At least one of ID token and access token must be non-null',
          );
        });
      });

      describe('GOOGLE_SIGN_IN_METHOD', function () {
        it('should return google.com', function () {
          const { GoogleAuthProvider } = authModular;

          GoogleAuthProvider.GOOGLE_SIGN_IN_METHOD.should.equal('google.com');
        });
      });

      describe('PROVIDER_ID', function () {
        it('should return google.com', function () {
          const { GoogleAuthProvider } = authModular;

          GoogleAuthProvider.PROVIDER_ID.should.equal('google.com');
        });
      });

      describe('credential extraction helpers', function () {
        it('should return null for native provider results and errors', function () {
          const { GoogleAuthProvider } = authModular;

          should.equal(GoogleAuthProvider.credentialFromResult({}), null);
          should.equal(GoogleAuthProvider.credentialFromError({}), null);
        });
      });
    });

    describe('OAuthProvider', function () {
      describe('credential', function () {
        it('should return a credential object', function () {
          const { OAuthProvider } = authModular;

          const idToken = '123456';
          const accessToken = '654321';
          const provider = new OAuthProvider('apple.com');
          const credential = provider.credential({ idToken, accessToken, rawNonce: 'nonce' });
          credential.providerId.should.equal('apple.com');
          credential.token.should.equal(idToken);
          credential.secret.should.equal('nonce');
          credential.idToken.should.equal(idToken);
          credential.accessToken.should.equal(accessToken);
          credential.rawNonce.should.equal('nonce');
          credential.toJSON().rawNonce.should.equal('nonce');
        });

        it('should return a credential object from json', function () {
          const { OAuthProvider } = authModular;

          const idToken = '123456';
          const accessToken = '654321';
          const credential = OAuthProvider.credentialFromJSON({
            providerId: 'apple.com',
            idToken,
            accessToken,
            nonce: 'nonce',
          });
          credential.providerId.should.equal('apple.com');
          credential.token.should.equal(idToken);
          credential.secret.should.equal('nonce');
          credential.idToken.should.equal(idToken);
          credential.accessToken.should.equal(accessToken);
          credential.rawNonce.should.equal('nonce');
        });

        it('should return a credential object from a json string', function () {
          const { OAuthProvider } = authModular;

          const idToken = '123456';
          const accessToken = '654321';
          const credential = OAuthProvider.credentialFromJSON(
            JSON.stringify({
              providerId: 'apple.com',
              idToken,
              accessToken,
              rawNonce: 'nonce',
            }),
          );
          credential.providerId.should.equal('apple.com');
          credential.token.should.equal(idToken);
          credential.secret.should.equal('nonce');
          credential.idToken.should.equal(idToken);
          credential.accessToken.should.equal(accessToken);
          credential.rawNonce.should.equal('nonce');
        });

        it('should map access-token-only json credentials to the secret bridge field', function () {
          const { OAuthProvider } = authModular;

          const accessToken = '654321';
          const credential = OAuthProvider.credentialFromJSON({
            providerId: 'oauth',
            accessToken,
          });
          credential.providerId.should.equal('oauth');
          credential.token.should.equal('');
          credential.secret.should.equal(accessToken);
          credential.accessToken.should.equal(accessToken);
        });

        it('should throw if json is missing a provider id', function () {
          const { OAuthProvider } = authModular;

          (() =>
            OAuthProvider.credentialFromJSON({
              idToken: '123456',
            })).should.throw(
            "firebase.auth.OAuthProvider.credentialFromJSON(*) expected 'providerId' to be a string value.",
          );
        });

        it('should throw if string json is malformed', function () {
          const { OAuthProvider } = authModular;

          (() => OAuthProvider.credentialFromJSON('{')).should.throw(
            "firebase.auth.OAuthProvider.credentialFromJSON(*) expected 'json' to be a valid JSON string.",
          );
        });

        it('should map access-token-only credentials to the secret bridge field', function () {
          const { OAuthProvider } = authModular;

          const accessToken = '654321';
          const provider = new OAuthProvider('oauth');
          const credential = provider.credential({ accessToken });
          credential.providerId.should.equal('oauth');
          credential.token.should.equal('');
          credential.secret.should.equal(accessToken);
          credential.accessToken.should.equal(accessToken);
        });
      });

      describe('PROVIDER_ID', function () {
        it('should return microsoft', function () {
          const { OAuthProvider } = authModular;
          const provider = new OAuthProvider('microsoft.com');
          provider.PROVIDER_ID.should.equal('microsoft.com');
        });
      });

      describe('provider object', function () {
        it('should return a credential object with scopes and custom parameters', function () {
          const { OAuthProvider } = authModular;
          const provider = new OAuthProvider('microsoft.com');
          provider.addScope('profile');
          provider.addScope('email');
          provider.setCustomParameters({
            prompt: 'consent',
          });
          provider.toObject().scopes.should.containEql('profile');
          provider.toObject().scopes.should.containEql('email');
          provider.toObject().customParameters.prompt.should.equal('consent');
        });
      });
    });

    describe('PhoneAuthProvider', function () {
      describe('credential', function () {
        it('should return a credential object', function () {
          const { PhoneAuthProvider } = authModular;

          const verificationId = '123456';
          const code = '654321';
          const credential = PhoneAuthProvider.credential(verificationId, code);
          credential.providerId.should.equal('phone');
          credential.signInMethod.should.equal('phone');
          credential.token.should.equal(verificationId);
          credential.secret.should.equal(code);
          credential.toJSON().verificationId.should.equal(verificationId);
          credential.toJSON().verificationCode.should.equal(code);
        });
      });

      describe('PHONE_SIGN_IN_METHOD', function () {
        it('should return phone', function () {
          const { PhoneAuthProvider } = authModular;

          PhoneAuthProvider.PHONE_SIGN_IN_METHOD.should.equal('phone');
        });
      });

      describe('PROVIDER_ID', function () {
        it('should return phone', function () {
          const { PhoneAuthProvider } = authModular;

          PhoneAuthProvider.PROVIDER_ID.should.equal('phone');
        });
      });
    });

    describe('TwitterAuthProvider', function () {
      describe('constructor', function () {
        it('should throw an unsupported error', function () {
          const { TwitterAuthProvider } = authModular;

          (() => new TwitterAuthProvider()).should.throw(
            '`new TwitterAuthProvider()` is not supported on the native Firebase SDKs.',
          );
        });
      });

      describe('credential', function () {
        it('should return a credential object', function () {
          const { TwitterAuthProvider } = authModular;

          const token = '123456';
          const secret = '654321';
          const credential = TwitterAuthProvider.credential(token, secret);
          credential.providerId.should.equal('twitter.com');
          credential.signInMethod.should.equal('twitter.com');
          credential.token.should.equal(token);
          credential.secret.should.equal(secret);
          credential.accessToken.should.equal(token);
          credential.toJSON().accessToken.should.equal(token);
          credential.toJSON().secret.should.equal(secret);
        });
      });

      describe('TWITTER_SIGN_IN_METHOD', function () {
        it('should return twitter.com', function () {
          const { TwitterAuthProvider } = authModular;

          TwitterAuthProvider.TWITTER_SIGN_IN_METHOD.should.equal('twitter.com');
        });
      });

      describe('PROVIDER_ID', function () {
        it('should return twitter.com', function () {
          const { TwitterAuthProvider } = authModular;

          TwitterAuthProvider.PROVIDER_ID.should.equal('twitter.com');
        });
      });
    });

    describe('OIDCAuthProvider', function () {
      describe('constructor', function () {
        it('should throw an unsupported error', function () {
          const { OIDCAuthProvider } = authModular;

          (() => new OIDCAuthProvider()).should.throw(
            '`new OIDCAuthProvider()` is not supported on the native Firebase SDKs.',
          );
        });
      });

      describe('credential', function () {
        it('should return a credential object', function () {
          const { OIDCAuthProvider } = authModular;

          const token = '123456';
          const secret = '654321';
          const providerSuffix = 'sample-provider';
          const credential = OIDCAuthProvider.credential(providerSuffix, token, secret);
          credential.providerId.should.equal('oidc.' + providerSuffix);
          credential.token.should.equal(token);
          credential.secret.should.equal(secret);
        });
      });

      describe('PROVIDER_ID', function () {
        it('should return oidc.', function () {
          const { OIDCAuthProvider } = authModular;
          OIDCAuthProvider.PROVIDER_ID.should.equal('oidc.');
        });
      });
    });
  });
});
