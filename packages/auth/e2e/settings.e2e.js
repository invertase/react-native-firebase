describe('auth() => Settings', () => {
  xit('returns app verification disabled for testing', async () => {
    firebase.auth().settings.appVerificationDisabledForTesting = true;
    await Utils.sleep(500);
    const settings = await firebase.auth().settings.appVerificationDisabledForTesting;
    settings.should.equal(true);
  });

  xit('successfully sets auto retrive for phone number', async () => {
    firebase.auth().settings.appVerificationDisabledForTesting = true;
    const settings = await firebase.auth().settings.appVerificationDisabledForTesting;
    settings.should.equal(true);
  });
});
