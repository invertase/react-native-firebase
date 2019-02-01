describe('Utils -> NativeModules -> Constants', () => {
  xdescribe('.androidPlayServices', () => {
    it('should be an object', () => {
      const { androidPlayServices } = NativeModules.RNFBUtils;
      androidPlayServices.should.be.an.Object();
    });
  });

  xdescribe('.isFirebaseTestLab', () => {
    it('should be a boolean', () => {
      const { isFirebaseTestLab } = NativeModules.RNFBUtils;
      isFirebaseTestLab.should.be.a.Boolean();
      isFirebaseTestLab.should.equal(false);
    });
  });
});
