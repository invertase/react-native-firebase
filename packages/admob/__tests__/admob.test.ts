import { firebase, FirebaseAdMobTypes } from '../lib';

describe('Admob', () => {
  describe('namespace', () => {
    it('accessible from firebase.app()', () => {
      const app = firebase.app();
      expect(app.admob).toBeDefined();
      expect(app.admob().app).toEqual(app);
    });
  });

  describe('setRequestConfiguration()', () => {
    it('throws if config is not an object', () => {
      // @ts-ignore
      expect(() => firebase.admob().setRequestConfiguration('123')).toThrowError(
        "firebase.admob().setRequestConfiguration(*) 'requestConfiguration' expected an object value",
      );
    });

    describe('maxAdContentRating', () => {
      it('throws if maxAdContentRating is invalid', () => {
        expect(() =>
          firebase.admob().setRequestConfiguration({
            maxAdContentRating: 'Y' as FirebaseAdMobTypes.MaxAdContentRating[keyof FirebaseAdMobTypes.MaxAdContentRating],
          }),
        ).toThrowError(
          "firebase.admob().setRequestConfiguration(*) 'requestConfiguration.maxAdContentRating' expected on of MaxAdContentRating.G, MaxAdContentRating.PG, MaxAdContentRating.T or MaxAdContentRating.MA",
        );
      });
    });

    describe('tagForChildDirectedTreatment', () => {
      it('throws if tagForChildDirectedTreatment not a boolean', () => {
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

    describe('tagForUnderAgeOfConsent', () => {
      it('throws if tagForUnderAgeOfConsent not a boolean', () => {
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
