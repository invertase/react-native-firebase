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

let InterstitialAd;

describe('admob() InterstitialAd', () => {
  before(() => {
    InterstitialAd = jet.require('packages/admob/lib/ads/InterstitialAd');
  });

  describe('createForAdRequest', () => {
    it('throws if adUnitId is invalid', () => {
      try {
        InterstitialAd.createForAdRequest(123);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'adUnitId' expected an string value");
        return Promise.resolve();
      }
    });

    // has own tests
    it('throws if requestOptions are invalid', () => {
      try {
        InterstitialAd.createForAdRequest('123', 123);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        return Promise.resolve();
      }
    });

    // has own tests
    it('returns a new instance', () => {
      const i = InterstitialAd.createForAdRequest('abc');
      i.constructor.name.should.eql('InterstitialAd');
      i.adUnitId.should.eql('abc');
      i.loaded.should.eql(false);
    });

    it('loads with requestOptions', async () => {
      const spy = sinon.spy();

      const i = InterstitialAd.createForAdRequest(firebase.admob.TestIds.INTERSTITIAL, {
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
      await Utils.spyToBeCalledOnceAsync(spy);
      i.loaded.should.eql(true);

      spy.getCall(0).args[0].should.eql('loaded');
    });
  });

  describe('show', () => {
    it('throws if showing before loaded', () => {
      const i = InterstitialAd.createForAdRequest('abc');

      try {
        i.show();
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql(
          'The requested InterstitialAd has not loaded and could not be shown',
        );
        return Promise.resolve();
      }
    });
  });

  describe('onAdEvent', () => {
    it('throws if handler is not a function', () => {
      const i = InterstitialAd.createForAdRequest('abc');

      try {
        i.onAdEvent('foo');
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        e.message.should.containEql("'handler' expected a function");
        return Promise.resolve();
      }
    });

    it('returns an unsubscriber function', () => {
      const i = InterstitialAd.createForAdRequest('abc');
      const unsub = i.onAdEvent(() => {});
      unsub.should.be.Function();
      unsub();
    });

    it('unsubscribe should prevent events', async () => {
      const spy = sinon.spy();
      const i = InterstitialAd.createForAdRequest('abc');
      const unsub = i.onAdEvent(spy);
      unsub();
      i.load();
      await Utils.sleep(2000);
      spy.callCount.should.be.eql(0);
    });

    it('loads with a valid ad unit id', async () => {
      const spy = sinon.spy();

      const i = InterstitialAd.createForAdRequest(firebase.admob.TestIds.INTERSTITIAL);

      i.onAdEvent(spy);
      i.load();
      await Utils.spyToBeCalledOnceAsync(spy);
      i.loaded.should.eql(true);

      spy.getCall(0).args[0].should.eql('loaded');
    });

    it('errors with an invalid ad unit id', async () => {
      const spy = sinon.spy();

      const i = InterstitialAd.createForAdRequest('123');

      i.onAdEvent(spy);
      i.load();
      await Utils.spyToBeCalledOnceAsync(spy);

      spy.getCall(0).args[0].should.eql('error');
      const e = spy.getCall(0).args[1];
      e.code.should.containEql('admob/'); // android/ios different errors
    });
  });
});
