/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

describe('firebase', function () {
  it('it should allow read the default app from native', function () {
    // app is created in tests app before all hook
    should.equal(firebase.app()._nativeInitialized, true);
    should.equal(firebase.app().name, '[DEFAULT]');
  });

  it('it should create js apps for natively initialized apps', function () {
    should.equal(firebase.app('secondaryFromNative')._nativeInitialized, true);
    should.equal(firebase.app('secondaryFromNative').name, 'secondaryFromNative');
  });

  it('natively initialized apps should have options available in js', function () {
    const platformAppConfig = FirebaseHelpers.app.config();
    should.equal(firebase.app().options.apiKey, platformAppConfig.apiKey);
    should.equal(firebase.app().options.appId, platformAppConfig.appId);
    should.equal(firebase.app().options.databaseURL, platformAppConfig.databaseURL);
    should.equal(firebase.app().options.messagingSenderId, platformAppConfig.messagingSenderId);
    should.equal(firebase.app().options.projectId, platformAppConfig.projectId);
    should.equal(firebase.app().options.storageBucket, platformAppConfig.storageBucket);
  });

  it('SDK_VERSION should return a string version', function () {
    firebase.SDK_VERSION.should.be.a.String();
  });

  it('apps should provide an array of apps', function () {
    should.equal(!!firebase.apps.length, true);
    should.equal(firebase.apps.includes(firebase.app('[DEFAULT]')), true);
    return Promise.resolve();
  });

  it('apps can get and set data collection', async function () {
    firebase.app().automaticDataCollectionEnabled = false;
    should.equal(firebase.app().automaticDataCollectionEnabled, false);
  });

  it('it should initialize dynamic apps', async function () {
    const name = `testscoreapp${FirebaseHelpers.id}`;
    const platformAppConfig = FirebaseHelpers.app.config();
    const newApp = await firebase.initializeApp(platformAppConfig, name);
    newApp.name.should.equal(name);
    newApp.toString().should.equal(name);
    newApp.options.apiKey.should.equal(platformAppConfig.apiKey);
    return newApp.delete();
  });

  it('should error if dynamic app initialization values are incorrect', async function () {
    try {
      await firebase.initializeApp({ appId: 'myid' }, 'myname');
      throw new Error('Should have rejected incorrect initializeApp input');
    } catch (e) {
      e.message.should.equal("Missing or invalid FirebaseOptions property 'apiKey'.");
    }
  });

  it('apps can be deleted, but only once', async function () {
    const name = `testscoreapp${FirebaseHelpers.id}`;
    const platformAppConfig = FirebaseHelpers.app.config();
    const newApp = await firebase.initializeApp(platformAppConfig, name);

    newApp.name.should.equal(name);
    newApp.toString().should.equal(name);
    newApp.options.apiKey.should.equal(platformAppConfig.apiKey);

    await newApp.delete();
    try {
      await newApp.delete();
    } catch (e) {
      e.message.should.equal(`Firebase App named '${name}' already deleted`);
    }
    try {
      firebase.app(name);
    } catch (e) {
      e.message.should.equal(
        `No Firebase App '${name}' has been created - call firebase.initializeApp()`,
      );
    }
  });

  it('prevents the default app from being deleted', async function () {
    try {
      await firebase.app().delete();
    } catch (e) {
      e.message.should.equal('Unable to delete the default native firebase app instance.');
    }
  });

  it('extendApp should provide additional functionality', function () {
    const extension = {};
    firebase.app().extendApp({
      extension,
    });
    firebase.app().extension.should.equal(extension);
  });
});
