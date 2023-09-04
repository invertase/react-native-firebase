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

describe('crashlytics()', function () {
  describe('v8 compatibility', function () {
    // Run locally only - flakey on CI
    xdescribe('crash()', function () {
      it('crashes the app', async function () {
        jet.context._BEFORE_CRASH_ = 1;
        firebase.crashlytics().crash();
        await Utils.sleep(1500);
        await device.launchApp({ newInstance: false });
        await Utils.sleep(1500);
        should.equal(jet.context._BEFORE_CRASH_, undefined);
      });
    });

    describe('log()', function () {
      it('accepts any value', async function () {
        firebase.crashlytics().log('invertase');
        firebase.crashlytics().log(1337);
        firebase.crashlytics().log(null);
        firebase.crashlytics().log(true);
        firebase.crashlytics().log({});
        firebase.crashlytics().log([]);
        firebase.crashlytics().log(() => {});
      });
    });

    describe('setUserId()', function () {
      it('accepts string values', async function () {
        await firebase.crashlytics().setUserId('invertase');
      });

      it('rejects none string values', async function () {
        try {
          await firebase.crashlytics().setUserId(666.1337);
          return Promise.reject(new Error('Did not throw.'));
        } catch (e) {
          e.message.should.containEql('must be a string');
        }
      });
    });

    describe('setAttribute()', function () {
      it('accepts string values', async function () {
        await firebase.crashlytics().setAttribute('invertase', '1337');
      });

      it('rejects none string values', async function () {
        try {
          await firebase.crashlytics().setAttribute('invertase', 33.3333);
          return Promise.reject(new Error('Did not throw.'));
        } catch (e) {
          e.message.should.containEql('must be a string');
        }
      });

      it('errors if attribute name is not a string', async function () {
        try {
          await firebase.crashlytics().setAttribute(1337, 'invertase');
          return Promise.reject(new Error('Did not throw.'));
        } catch (e) {
          e.message.should.containEql('must be a string');
        }
      });
    });

    describe('setAttributes()', function () {
      it('errors if arg is not an object', async function () {
        try {
          await firebase.crashlytics().setAttributes(1337);
          return Promise.reject(new Error('Did not throw.'));
        } catch (e) {
          e.message.should.containEql('must be an object');
        }
      });

      it('accepts string values', async function () {
        await firebase.crashlytics().setAttributes({ invertase: '1337' });
      });
    });

    describe('recordError()', function () {
      it('warns if not an error', async function () {
        const orig = jet.context.console.warn;
        let logged = false;
        jet.context.console.warn = msg => {
          msg.should.containEql('expects an instance of Error');
          logged = true;
          jet.context.console.warn = orig;
        };

        firebase.crashlytics().recordError(1337);
        should.equal(logged, true);
      });

      it('accepts Error values', async function () {
        firebase.crashlytics().recordError(new Error("I'm a teapot!"));
        // TODO verify stack obj
      });

      it('accepts optional jsErrorName', async function () {
        firebase
          .crashlytics()
          .recordError(
            new Error("I'm a teapot!"),
            'This message will display in crashlytics dashboard',
          );
        // TODO verify stack obj
      });
    });

    describe('sendUnsentReports()', function () {
      it("sends unsent reports to the crashlytic's server", function () {
        firebase.crashlytics().sendUnsentReports();
      });
    });

    describe('checkForUnsentReports()', function () {
      it('errors if automatic crash report collection is enabled', async function () {
        await firebase.crashlytics().setCrashlyticsCollectionEnabled(true);
        try {
          await firebase.crashlytics().checkForUnsentReports();
          return Promise.reject('Error did not throw');
        } catch (e) {
          e.message.should.containEql("has been set to 'true', all reports are automatically sent");
        }
      });
      it("checks device cache for unsent crashlytic's reports", async function () {
        await firebase.crashlytics().setCrashlyticsCollectionEnabled(false);
        const anyUnsentReports = await firebase.crashlytics().checkForUnsentReports();

        should(anyUnsentReports).equal(false);
      });
    });

    describe('deleteUnsentReports()', function () {
      it('deletes unsent crashlytics reports', async function () {
        await firebase.crashlytics().deleteUnsentReports();
      });
    });

    describe('didCrashOnPreviousExecution()', function () {
      // TODO: worked on Detox v17, fails after transition to v18. Why?
      xit('checks if app crached on previous execution', async function () {
        const didCrash = await firebase.crashlytics().didCrashOnPreviousExecution();

        should(didCrash).equal(false);
      });
    });

    describe('setCrashlyticsCollectionEnabled()', function () {
      it('false', async function () {
        await firebase.crashlytics().setCrashlyticsCollectionEnabled(false);
        should.equal(firebase.crashlytics().isCrashlyticsCollectionEnabled, false);
      });

      it('true', async function () {
        await firebase.crashlytics().setCrashlyticsCollectionEnabled(true);
        should.equal(firebase.crashlytics().isCrashlyticsCollectionEnabled, true);
      });

      it('errors if not boolean', async function () {
        try {
          await firebase.crashlytics().setCrashlyticsCollectionEnabled(1337);
          return Promise.reject(new Error('Did not throw.'));
        } catch (e) {
          e.message.should.containEql('must be a boolean');
        }
      });
    });
  });

  describe('modular', function () {
    // Run locally only - flakey on CI
    xdescribe('crash()', function () {
      it('crashes the app', async function () {
        const { getCrashlytics, crash } = crashlyticsModular;
        const crashlytics = getCrashlytics();
        jet.context._BEFORE_CRASH_ = 1;
        crash(crashlytics);
        await Utils.sleep(1500);
        await device.launchApp({ newInstance: false });
        await Utils.sleep(1500);
        should.equal(jet.context._BEFORE_CRASH_, undefined);
      });
    });

    describe('log()', function () {
      it('accepts any value', async function () {
        const { getCrashlytics, log } = crashlyticsModular;
        const crashlytics = getCrashlytics();
        log(crashlytics, 'invertase');
        log(crashlytics, 1337);
        log(crashlytics, null);
        log(crashlytics, true);
        log(crashlytics, {});
        log(crashlytics, []);
        log(crashlytics, () => {});
      });
    });

    describe('setUserId()', function () {
      it('accepts string values', async function () {
        const { getCrashlytics, setUserId } = crashlyticsModular;
        await setUserId(getCrashlytics(), 'invertase');
      });

      it('rejects none string values', async function () {
        const { getCrashlytics, setUserId } = crashlyticsModular;
        try {
          await setUserId(getCrashlytics(), 666.1337);
          return Promise.reject(new Error('Did not throw.'));
        } catch (e) {
          e.message.should.containEql('must be a string');
        }
      });
    });

    describe('setAttribute()', function () {
      it('accepts string values', async function () {
        const { getCrashlytics, setAttribute } = crashlyticsModular;
        await setAttribute(getCrashlytics(), 'invertase', '1337');
      });

      it('rejects none string values', async function () {
        const { getCrashlytics, setAttribute } = crashlyticsModular;
        try {
          await setAttribute(getCrashlytics(), 'invertase', 33.3333);
          return Promise.reject(new Error('Did not throw.'));
        } catch (e) {
          e.message.should.containEql('must be a string');
        }
      });

      it('errors if attribute name is not a string', async function () {
        const { getCrashlytics, setAttribute } = crashlyticsModular;
        try {
          await setAttribute(getCrashlytics(), 1337, 'invertase');
          return Promise.reject(new Error('Did not throw.'));
        } catch (e) {
          e.message.should.containEql('must be a string');
        }
      });
    });

    describe('setAttributes()', function () {
      it('errors if arg is not an object', async function () {
        const { getCrashlytics, setAttributes } = crashlyticsModular;
        try {
          await setAttributes(getCrashlytics(), 1337);
          return Promise.reject(new Error('Did not throw.'));
        } catch (e) {
          e.message.should.containEql('must be an object');
        }
      });

      it('accepts string values', async function () {
        await firebase.crashlytics().setAttributes({ invertase: '1337' });
      });
    });

    describe('recordError()', function () {
      it('warns if not an error', async function () {
        const { getCrashlytics, recordError } = crashlyticsModular;
        const orig = jet.context.console.warn;
        let logged = false;
        jet.context.console.warn = msg => {
          msg.should.containEql('expects an instance of Error');
          logged = true;
          jet.context.console.warn = orig;
        };

        recordError(getCrashlytics(), 1337);
        should.equal(logged, true);
      });

      it('accepts Error values', async function () {
        const { getCrashlytics, recordError } = crashlyticsModular;
        recordError(getCrashlytics(), new Error("I'm a teapot!"));
        // TODO verify stack obj
      });

      it('accepts optional jsErrorName', async function () {
        const { getCrashlytics, recordError } = crashlyticsModular;
        recordError(
          getCrashlytics(),
          new Error("I'm a teapot!"),
          'This message will display in crashlytics dashboard',
        );
        // TODO verify stack obj
      });
    });

    describe('sendUnsentReports()', function () {
      it("sends unsent reports to the crashlytic's server", function () {
        const { getCrashlytics, sendUnsentReports } = crashlyticsModular;
        sendUnsentReports(getCrashlytics());
      });
    });

    describe('checkForUnsentReports()', function () {
      it('errors if automatic crash report collection is enabled', async function () {
        const { getCrashlytics, setCrashlyticsCollectionEnabled, checkForUnsentReports } =
          crashlyticsModular;
        const crashlytics = getCrashlytics();
        await setCrashlyticsCollectionEnabled(crashlytics, true);
        try {
          await checkForUnsentReports(crashlytics);
          return Promise.reject('Error did not throw');
        } catch (e) {
          e.message.should.containEql("has been set to 'true', all reports are automatically sent");
        }
      });
      it("checks device cache for unsent crashlytic's reports", async function () {
        const { getCrashlytics, setCrashlyticsCollectionEnabled, checkForUnsentReports } =
          crashlyticsModular;
        const crashlytics = getCrashlytics();
        await setCrashlyticsCollectionEnabled(crashlytics, false);
        const anyUnsentReports = await checkForUnsentReports(crashlytics);

        should(anyUnsentReports).equal(false);
      });
    });

    describe('deleteUnsentReports()', function () {
      it('deletes unsent crashlytics reports', async function () {
        const { getCrashlytics, deleteUnsentReports } = crashlyticsModular;
        await deleteUnsentReports(getCrashlytics());
      });
    });

    describe('didCrashOnPreviousExecution()', function () {
      // TODO: worked on Detox v17, fails after transition to v18. Why?
      xit('checks if app crached on previous execution', async function () {
        const { getCrashlytics, didCrashOnPreviousExecution } = crashlyticsModular;
        const didCrash = await didCrashOnPreviousExecution(getCrashlytics());

        should(didCrash).equal(false);
      });
    });

    describe('setCrashlyticsCollectionEnabled()', function () {
      it('false', async function () {
        const { getCrashlytics, setCrashlyticsCollectionEnabled, isCrashlyticsCollectionEnabled } =
          crashlyticsModular;
        const crashlytics = getCrashlytics();
        await setCrashlyticsCollectionEnabled(crashlytics, false);
        should.equal(isCrashlyticsCollectionEnabled(crashlytics), false);
      });

      it('true', async function () {
        const { getCrashlytics, setCrashlyticsCollectionEnabled, isCrashlyticsCollectionEnabled } =
          crashlyticsModular;
        const crashlytics = getCrashlytics();
        await setCrashlyticsCollectionEnabled(crashlytics, true);
        should.equal(isCrashlyticsCollectionEnabled(crashlytics), true);
      });

      it('errors if not boolean', async function () {
        const { getCrashlytics, setCrashlyticsCollectionEnabled } = crashlyticsModular;
        try {
          await setCrashlyticsCollectionEnabled(getCrashlytics(), 1337);
          return Promise.reject(new Error('Did not throw.'));
        } catch (e) {
          e.message.should.containEql('must be a boolean');
        }
      });
    });
  });
});
