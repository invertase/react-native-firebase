import { firebase } from '../lib';

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
      try {
        // @ts-ignore
        firebase.admob().setRequestConfiguration('123');
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        expect(e.message).toEqual(
          "firebase.admob().setRequestConfiguration(*) 'requestConfiguration' expected an object value",
        );
        return Promise.resolve();
      }
    });

    describe('maxAdContentRating', () => {
      it('throws if maxAdContentRating is invalid', () => {
        try {
          firebase.admob().setRequestConfiguration({
            maxAdContentRating: 'Y',
          });
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          expect(e.message).toEqual(
            "firebase.admob().setRequestConfiguration(*) 'requestConfiguration.maxAdContentRating' expected on of MaxAdContentRating.G, MaxAdContentRating.PG, MaxAdContentRating.T or MaxAdContentRating.MA",
          );
          return Promise.resolve();
        }
      });
    });

    describe('tagForChildDirectedTreatment', () => {
      it('throws if tagForChildDirectedTreatment not a boolean', () => {
        try {
          firebase.admob().setRequestConfiguration({
            // @ts-ignore
            tagForChildDirectedTreatment: 'true',
          });
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          expect(e.message).toEqual(
            "firebase.admob().setRequestConfiguration(*) 'requestConfiguration.tagForChildDirectedTreatment' expected a boolean value",
          );
          return Promise.resolve();
        }
      });
    });

    describe('tagForUnderAgeOfConsent', () => {
      it('throws if tagForUnderAgeOfConsent not a boolean', () => {
        try {
          firebase.admob().setRequestConfiguration({
            // @ts-ignore
            tagForUnderAgeOfConsent: 'false',
          });
          return Promise.reject(new Error('Did not throw Error.'));
        } catch (e) {
          expect(e.message).toEqual(
            "firebase.admob().setRequestConfiguration(*) 'requestConfiguration.tagForUnderAgeOfConsent' expected a boolean value",
          );
          return Promise.resolve();
        }
      });
    });
  });
});
