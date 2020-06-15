describe('auth() => Settings', () => {
  before(() => {
    isIOS = Platform.OS === 'ios';
  });

  it('returns app verification disabled for testing', async () => {
    if (isIOS) {
      firebase.auth().settings.appVerificationDisabledForTesting = true;
      await Utils.sleep(500);
      const settings = await firebase.auth().settings.appVerificationDisabledForTesting;
      settings.should.equal(true);
    }
  });

  it('successfully sets auto retrive for phone number', async () => {
    if (isIOS) {
      firebase.auth().settings.appVerificationDisabledForTesting = true;
      const settings = await firebase.auth().settings.appVerificationDisabledForTesting;
      settings.should.equal(true);
    }
  });
});
