const { baseParams } = require('./dynamicLinks.e2e');

describe('dynamicLinks() dynamicLinkParams.otherPlatform', function () {
  it('throws if otherPlatform is not an object', function () {
    try {
      firebase.dynamicLinks().buildLink({
        ...baseParams,
        otherPlatform: 123,
      });
      return Promise.reject(new Error('Did not throw Error.'));
    } catch (e) {
      e.message.should.containEql("'dynamicLinksParams.otherPlatform' must be an object");
      return Promise.resolve();
    }
  });

  it('throws if otherPlatform.fallbackUrl is not a string', function () {
    try {
      firebase.dynamicLinks().buildLink({
        ...baseParams,
        otherPlatform: {
          fallbackUrl: 123,
        },
      });
      return Promise.reject(new Error('Did not throw Error.'));
    } catch (e) {
      e.message.should.containEql(
        "'dynamicLinksParams.otherPlatform.fallbackUrl' must be a string",
      );
      return Promise.resolve();
    }
  });
});
