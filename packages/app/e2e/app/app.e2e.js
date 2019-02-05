describe('firebase', () => {
  it('it should allow read the default app from native', () => {
    // app is created in tests app before all hook
    should.equal(firebase.app()._nativeInitialized, true);
    should.equal(firebase.app().name, '[DEFAULT]');
  });

  it('it should create js apps for natively initialized apps', () => {
    should.equal(firebase.app('secondaryFromNative')._nativeInitialized, true);
    should.equal(firebase.app('secondaryFromNative').name, 'secondaryFromNative');
  });

  it('natively initialized apps should have options available in js', () => {
    const platformAppConfig = TestHelpers.core.config();
    should.equal(firebase.app().options.apiKey, platformAppConfig.apiKey);
    should.equal(firebase.app().options.appId, platformAppConfig.appId);
    should.equal(firebase.app().options.databaseURL, platformAppConfig.databaseURL);
    should.equal(firebase.app().options.messagingSenderId, platformAppConfig.messagingSenderId);
    should.equal(firebase.app().options.projectId, platformAppConfig.projectId);
    should.equal(firebase.app().options.storageBucket, platformAppConfig.storageBucket);
  });

  it('it should initialize dynamic apps', () => {
    const name = `testscoreapp${global.testRunId}`;
    const platformAppConfig = TestHelpers.core.config();
    return firebase.initializeApp(platformAppConfig, name).then(newApp => {
      newApp.name.should.equal(name);
      newApp.toString().should.equal(name);
      newApp.options.apiKey.should.equal(platformAppConfig.apiKey);
      return newApp.delete();
    });
  });

  it('SDK_VERSION should return a string version', () => {
    firebase.SDK_VERSION.should.be.a.String();
  });
});

describe('firebase -> X', () => {
  it('apps should provide an array of apps', () => {
    should.equal(!!firebase.apps.length, true);
    should.equal(firebase.apps.includes(firebase.app('[DEFAULT]')), true);
    return Promise.resolve();
  });

  it('can be deleted', async () => {
    const name = `testscoreapp${global.testRunId}`;
    const platformAppConfig = TestHelpers.core.config();
    const newApp = await firebase.initializeApp(platformAppConfig, name);

    newApp.name.should.equal(name);
    newApp.toString().should.equal(name);
    newApp.options.apiKey.should.equal(platformAppConfig.apiKey);

    await newApp.delete();

    (() => {
      firebase.app(name);
    }).should.throw(`No Firebase App '${name}' has been created - call firebase.initializeApp()`);
  });

  it('prevents the default app from being deleted', async () => {
    firebase
      .app()
      .delete()
      .should.be.rejectedWith('Unable to delete the default native firebase app instance.');
  });

  it('extendApp should provide additional functionality', () => {
    const extension = {};
    firebase.app().extendApp({
      extension,
    });
    firebase.app().extension.should.equal(extension);
  });
});
