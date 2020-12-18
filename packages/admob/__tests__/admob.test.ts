import { firebase, FirebaseAdMobTypes } from '../lib';

describe('Admob', function() {
  describe('namespace', function() {
    it('accessible from firebase.app()', function() {
      const app = firebase.app();
      expect(app.admob).toBeDefined();
      expect(app.admob().app).toEqual(app);
    });
  });

  describe('setRequestConfiguration()', function() {
    it('throws if config is not an object', function() {
      // @ts-ignore
      expect(() => firebase.admob().setRequestConfiguration('123')).toThrowError(
        "firebase.admob().setRequestConfiguration(*) 'requestConfiguration' expected an object value",
      );
    });

    describe('maxAdContentRating', function() {
      it('throws if maxAdContentRating is invalid', function() {
        expect(() =>
          firebase.admob().setRequestConfiguration({
            maxAdContentRating: 'Y' as FirebaseAdMobTypes.MaxAdContentRating[keyof FirebaseAdMobTypes.MaxAdContentRating],
          }),
        ).toThrowError(
          "firebase.admob().setRequestConfiguration(*) 'requestConfiguration.maxAdContentRating' expected on of MaxAdContentRating.G, MaxAdContentRating.PG, MaxAdContentRating.T or MaxAdContentRating.MA",
        );
      });
    });

    describe('tagForChildDirectedTreatment', function() {
      it('throws if tagForChildDirectedTreatment not a boolean', function() {
        expect(() =>
          firebase.admob().setRequestConfiguration({
            // @ts-ignore
            tagForChildDirectedTreatment: 'true',
          }),
        ).toThrowError(
          "firebase.admob().setRequestConfiguration(*) 'requestConfiguration.tagForChildDirectedTreatment' expected a boolean value",
        );
      });
    });

    describe('tagForUnderAgeOfConsent', function() {
      it('throws if tagForUnderAgeOfConsent not a boolean', function() {
        expect(() =>
          firebase.admob().setRequestConfiguration({
            // @ts-ignore
            tagForUnderAgeOfConsent: 'false',
          }),
        ).toThrowError(
          "firebase.admob().setRequestConfiguration(*) 'requestConfiguration.tagForUnderAgeOfConsent' expected a boolean value",
        );
      });
    });
  });
});
