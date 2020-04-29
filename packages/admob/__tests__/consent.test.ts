import admob, { AdsConsent, firebase } from '../lib';

describe('Admob AdsConsent', () => {
  describe('requestInfoUpdate', () => {
    it('throws if publisherIds is not an array', () => {
      try {
        // @ts-ignore
        AdsConsent.requestInfoUpdate('pub-123');
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        expect(e.message).toEqual(
          "firebase.admob.AdsConsent.requestInfoUpdate(*) 'publisherIds' expected an array of string values.",
        );
        return Promise.resolve();
      }
    });

    it('throws if publisherIds is empty array', () => {
      try {
        AdsConsent.requestInfoUpdate([]);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        expect(e.message).toEqual(
          "firebase.admob.AdsConsent.requestInfoUpdate(*) 'publisherIds' list of publisher IDs cannot be empty.",
        );
        return Promise.resolve();
      }
    });

    it('throws if publisherIds contains non-string values', () => {
      try {
        // @ts-ignore
        AdsConsent.requestInfoUpdate(['foo', 123]);
        return Promise.reject(new Error('Did not throw Error.'));
      } catch (e) {
        expect(e.message).toEqual(
          "firebase.admob.AdsConsent.requestInfoUpdate(*) 'publisherIds[1]' expected a string value.",
        );
        return Promise.resolve();
      }
    });
  });
});
