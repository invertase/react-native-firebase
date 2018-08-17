describe('Core', () => {
  describe('Firebase', () => {
    it('it should create js apps for natively initialized apps', () => {
      should.equal(firebase.app()._nativeInitialized, true);
      return Promise.resolve();
    });

    it('natively initialized apps should have options available in js', () => {
      const platformAppConfig = TestHelpers.core.config();
      should.equal(firebase.app().options.apiKey, platformAppConfig.apiKey);
      should.equal(firebase.app().options.appId, platformAppConfig.appId);
      should.equal(
        firebase.app().options.databaseURL,
        platformAppConfig.databaseURL
      );
      should.equal(
        firebase.app().options.messagingSenderId,
        platformAppConfig.messagingSenderId
      );
      should.equal(
        firebase.app().options.projectId,
        platformAppConfig.projectId
      );
      should.equal(
        firebase.app().options.storageBucket,
        platformAppConfig.storageBucket
      );
      return Promise.resolve();
    });

    it('it should resolve onReady for natively initialized apps', () =>
      firebase.app().onReady());

    it('it should initialize dynamic apps', () => {
      const name = `testscoreapp${global.testRunId}`;
      const platformAppConfig = TestHelpers.core.config();
      return firebase
        .initializeApp(platformAppConfig, name)
        .onReady()
        .then(newApp => {
          newApp.name.should.equal(name.toUpperCase());
          newApp.toString().should.equal(name.toUpperCase());
          newApp.options.apiKey.should.equal(platformAppConfig.apiKey);
          // TODO add back in when android sdk support for deleting apps becomes available
          // return newApp.delete();
          return Promise.resolve();
        });
    });

    it('SDK_VERSION should return a string version', () => {
      firebase.SDK_VERSION.should.be.a.String();
    });
  });

  describe('App', () => {
    it('apps should provide an array of apps', () => {
      should.equal(!!firebase.apps.length, true);
      should.equal(firebase.apps.includes(firebase.app('[DEFAULT]')), true);
      return Promise.resolve();
    });

    it('delete is unsupported', () => {
      (() => {
        firebase.app().delete();
      }).should.throw(
        'app.delete() is unsupported by the native Firebase SDKs.'
      );
    });

    it('extendApp should error if an object is not supplied', () => {
      (() => {
        firebase.app().extendApp('string');
      }).should.throw(
        "Missing required argument of type 'Object' for method 'extendApp()'."
      );
    });

    it('extendApp should error if a protected property is supplied', () => {
      (() => {
        firebase.app().extendApp({
          database: {},
        });
      }).should.throw(
        "Property 'database' is protected and can not be overridden by extendApp."
      );
    });

    it('extendApp should provide additional functionality', () => {
      const extension = {};
      firebase.app().extendApp({
        extension,
      });
      firebase.app().extension.should.equal(extension);
    });
  });
});
