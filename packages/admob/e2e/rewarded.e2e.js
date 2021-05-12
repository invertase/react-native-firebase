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

let RewardedAd;

describe('admob() RewardedAd', function () {
  before(function () {
    RewardedAd = jet.require('packages/admob/lib/ads/RewardedAd');
  });

  describe('createForAdRequest', function () {
    it('throws if adUnitId is invalid', function () {
      // Ads on Android in CI load a webview and a bunch of other things so slowly the app ANRs.
      if (device.getPlatform() === 'android' && global.isCI == true) {
        return;
      }

      try {
        RewardedAd.createForAdRequest(123);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'adUnitId' expected an string value");
        return Promise.resolve();
      }
    });

    // has own tests
    it('throws if requestOptions are invalid', function () {
      // Ads on Android in CI load a webview and a bunch of other things so slowly the app ANRs.
      if (device.getPlatform() === 'android' && global.isCI == true) {
        return;
      }

      try {
        RewardedAd.createForAdRequest('123', 123);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        return Promise.resolve();
      }
    });

    it('returns a new instance', function () {
      // Ads on Android in CI load a webview and a bunch of other things so slowly the app ANRs.
      if (device.getPlatform() === 'android' && global.isCI == true) {
        return;
      }

      const i = RewardedAd.createForAdRequest('abc');
      i.constructor.name.should.eql('RewardedAd');
      i.adUnitId.should.eql('abc');
      i.loaded.should.eql(false);
    });

    it('loads with requestOptions', async function () {
      // Ads on Android in CI load a webview and a bunch of other things so slowly the app ANRs.
      if (device.getPlatform() === 'android' && global.isCI == true) {
        return;
      }

      if (device.getPlatform() === 'ios') {
        // Flaky on local iOS
        return;
      }
      const spy = sinon.spy();

      const i = RewardedAd.createForAdRequest(firebase.admob.TestIds.REWARDED, {
        requestNonPersonalizedAdsOnly: true,
        networkExtras: {
          foo: 'bar',
        },
        keywords: ['foo', 'bar'],
        testDevices: ['abc', 'EMULATOR'],
        contentUrl: 'https://invertase.io',
        location: [0, 0],
        locationAccuracy: 10,
        requestAgent: 'CoolAds',
      });

      i.onAdEvent(spy);
      i.load();
      await Utils.spyToBeCalledOnceAsync(spy, 30000);
      i.loaded.should.eql(true);

      spy.getCall(0).args[0].should.eql('rewarded_loaded');
    });
  });

  describe('show', function () {
    it('throws if showing before loaded', function () {
      // Ads on Android in CI load a webview and a bunch of other things so slowly the app ANRs.
      if (device.getPlatform() === 'android' && global.isCI == true) {
        return;
      }

      const i = RewardedAd.createForAdRequest('abc');

      try {
        i.show();
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          'The requested RewardedAd has not loaded and could not be shown',
        );
        return Promise.resolve();
      }
    });
  });

  describe('onAdEvent', function () {
    it('throws if handler is not a function', function () {
      // Ads on Android in CI load a webview and a bunch of other things so slowly the app ANRs.
      if (device.getPlatform() === 'android' && global.isCI == true) {
        return;
      }

      const i = RewardedAd.createForAdRequest('abc');

      try {
        i.onAdEvent('foo');
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'handler' expected a function");
        return Promise.resolve();
      }
    });

    it('returns an unsubscriber function', function () {
      // Ads on Android in CI load a webview and a bunch of other things so slowly the app ANRs.
      if (device.getPlatform() === 'android' && global.isCI == true) {
        return;
      }

      const i = RewardedAd.createForAdRequest('abc');
      const unsub = i.onAdEvent(() => {});
      unsub.should.be.Function();
      unsub();
    });

    it('unsubscribe should prevent events', async function () {
      // Ads on Android in CI load a webview and a bunch of other things so slowly the app ANRs.
      if (device.getPlatform() === 'android' && global.isCI == true) {
        return;
      }

      if (device.getPlatform() === 'ios') {
        // Flaky on local iOS
        return;
      }
      const spy = sinon.spy();
      const i = RewardedAd.createForAdRequest('abc');
      const unsub = i.onAdEvent(spy);
      unsub();
      i.load();
      await Utils.sleep(2000);
      spy.callCount.should.be.eql(0);
    });

    it('loads with a valid ad unit id', async function () {
      // Ads on Android in CI load a webview and a bunch of other things so slowly the app ANRs.
      if (device.getPlatform() === 'android' && global.isCI == true) {
        return;
      }

      if (device.getPlatform() === 'ios') {
        // Flaky on local iOS
        return;
      }
      const spy = sinon.spy();

      const i = RewardedAd.createForAdRequest(firebase.admob.TestIds.REWARDED);

      i.onAdEvent(spy);
      i.load();
      await Utils.spyToBeCalledOnceAsync(spy, 20000);
      i.loaded.should.eql(true);

      spy.getCall(0).args[0].should.eql('rewarded_loaded');
      const e = spy.getCall(0).args[1];
      should.equal(e, null);

      const d = spy.getCall(0).args[2];
      d.type.should.be.String();
      d.amount.should.be.Number();
    });

    it('errors with an invalid ad unit id', async function () {
      // Ads on Android in CI load a webview and a bunch of other things so slowly the app ANRs.
      if (device.getPlatform() === 'android' && global.isCI == true) {
        return;
      }

      const spy = sinon.spy();

      const i = RewardedAd.createForAdRequest('123');

      i.onAdEvent(spy);
      i.load();
      await Utils.spyToBeCalledOnceAsync(spy, 20000);

      spy.getCall(0).args[0].should.eql('error');
      const e = spy.getCall(0).args[1];
      e.code.should.containEql('admob/'); // android/ios different errors
    });
  });
});
