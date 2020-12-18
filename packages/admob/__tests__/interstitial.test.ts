import { InterstitialAd } from '../lib';

describe('Admob Interstitial', function() {
  describe('createForAdRequest', function() {
    it('throws if adUnitId is invalid', function() {
      // @ts-ignore
      expect(() => InterstitialAd.createForAdRequest(123)).toThrowError(
        "'adUnitId' expected an string value",
      );
    });

    it('throws if requestOptions are invalid', function() {
      // @ts-ignore
      expect(() => InterstitialAd.createForAdRequest('123', 123)).toThrowError(
        "firebase.admob() InterstitialAd.createForAdRequest(_, *) 'options' expected an object value.",
      );
    });

    // has own tests
    it('returns a new instance', function() {
      const i = InterstitialAd.createForAdRequest('abc');
      expect(i.constructor.name).toEqual('InterstitialAd');
      expect(i.adUnitId).toEqual('abc');
      expect(i.loaded).toEqual(false);
    });

    describe('show', function() {
      it('throws if showing before loaded', function() {
        const i = InterstitialAd.createForAdRequest('abc');

        expect(() => i.show()).toThrowError(
          'The requested InterstitialAd has not loaded and could not be shown',
        );
      });
    });

    describe('onAdEvent', function() {
      it('throws if handler is not a function', function() {
        const i = InterstitialAd.createForAdRequest('abc');

        // @ts-ignore
        expect(() => i.onAdEvent('foo')).toThrowError("'handler' expected a function");
      });

      it('returns an unsubscriber function', function() {
        const i = InterstitialAd.createForAdRequest('abc');
        const unsub = i.onAdEvent(() => {});
        expect(unsub).toBeDefined();
        unsub();
      });
    });
  });
});
