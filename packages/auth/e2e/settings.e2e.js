describe('auth() => Settings', () => {
  it('returns app verification disabled for testing', async () => {
    firebase.auth().settings.appVerificationDisabledForTesting = true;
    const settings = await firebase.auth().settings.appVerificationDisabledForTesting;
    settings.should.equal(true);
  });

  //   it('successfully sets auto retrive for phone number', async () => {
  //     firebase.auth().settings.appVerificationDisabledForTesting = true;
  //     const settings = await firebase.auth().settings.appVerificationDisabledForTesting;
  //     settings.should.equal(true);
  //   });
});
