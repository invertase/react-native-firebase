export default function addTests({ before, fdescribe, describe, it, firebase }) {

  before(() => {
    firebase.native.admob().initialize('ca-app-pub-3940256099942544~3347511713');
  });

  describe('AdMob', () => {
    it('should return static variables', () => {
      return new Promise((resolve) => {
        const statics = firebase.native.admob;

        statics.should.have.property('Banner').and.be.a.Function();
        statics.should.have.property('NativeExpress').and.be.a.Function();
        statics.should.have.property('AdRequest').and.be.a.Function();
        statics.should.have.property('VideoOptions').and.be.a.Function();
        resolve();
      });
    });

    it('should return instance methods', () => {
      return new Promise((resolve) => {
        const admob = firebase.native.admob();

        admob.should.have.property('initialize').and.be.a.Function();
        admob.should.have.property('openDebugMenu').and.be.a.Function();
        admob.should.have.property('interstitial').and.be.a.Function();
        admob.should.have.property('rewarded').and.be.a.Function();
        resolve();
      });
    });
  });

  describe('AdRequest', () => {

    it('should return AdRequest methods', () => {
      return new Promise((resolve) => {
        const request = new firebase.native.admob.AdRequest();

        request.should.have.property('build').and.be.a.Function();
        request.should.have.property('addTestDevice').and.be.a.Function();
        request.should.have.property('addKeyword').and.be.a.Function();
        request.should.have.property('setBirthday').and.be.a.Function();
        request.should.have.property('setContentUrl').and.be.a.Function();
        request.should.have.property('setGender').and.be.a.Function();
        request.should.have.property('setLocation').and.be.a.Function();
        request.should.have.property('setRequestAgent').and.be.a.Function();
        request.should.have.property('setIsDesignedForFamilies').and.be.a.Function();
        request.should.have.property('tagForChildDirectedTreatment').and.be.a.Function();
        resolve();
      });
    });

    it('should build an empty request', () => {
      return new Promise((resolve) => {
        const request = new firebase.native.admob.AdRequest();
        const build = request.build();

        build.should.have.property('keywords').and.be.a.Array();
        build.should.have.property('testDevices').and.be.a.Array();
        resolve();
      });
    });

    it('should build a full request', () => {
      return new Promise((resolve) => {
        const request = new firebase.native.admob.AdRequest();

        request
          .addTestDevice()
          .addTestDevice('foobar')
          .addKeyword('foo')
          .addKeyword('bar')
          // .setBirthday() // TODO
          .setContentUrl('http://google.com')
          .setGender('female')
          // .setLocation() // TODO
          .setRequestAgent('foobar')
          .setIsDesignedForFamilies(true)
          .tagForChildDirectedTreatment(true);

        const build = request.build();

        build.should.have.property('keywords').and.be.a.Array();
        build.should.have.property('testDevices').and.be.a.Array();
        build.keywords.should.containEql('foo');
        build.keywords.should.containEql('bar');
        build.testDevices.should.containEql('foobar');
        build.should.have.property('contentUrl').and.be.a.equal('http://google.com');
        build.should.have.property('gender').and.be.a.equal('female');
        build.should.have.property('requestAgent').and.be.a.equal('foobar');
        build.should.have.property('isDesignedForFamilies').and.be.a.equal(true);
        build.should.have.property('tagForChildDirectedTreatment').and.be.a.equal(true);
        resolve();
      });
    });
  });

  describe('VideoOptions', () => {
    it('should return VideoOptions methods', () => {
      return new Promise((resolve) => {
        const options = new firebase.native.admob.VideoOptions();

        options.should.have.property('build').and.be.a.Function();
        options.should.have.property('setStartMuted').and.be.a.Function();
        resolve();
      });
    });

    it('should build an empty request', () => {
      return new Promise((resolve) => {
        const options = new firebase.native.admob.VideoOptions();
        const build = options.build();

        build.should.have.property('startMuted').and.be.a.equal(true);
        resolve();
      });
    });

    it('should build all options', () => {
      return new Promise((resolve) => {
        const options = new firebase.native.admob.VideoOptions();

        options.setStartMuted(false);

        const build = options.build();

        build.should.have.property('startMuted').and.be.a.equal(false);
        resolve();
      });
    });

  });
  describe('Interstitial', () => {
    it('should return a new instance with methods', () => {
      return new Promise((resolve) => {
        const advert = firebase.native.admob().interstitial('ca-app-pub-3940256099942544/1033173712');

        advert.should.have.property('loadAd').and.be.a.Function();
        advert.should.have.property('isLoaded').and.be.a.Function();
        advert.should.have.property('show').and.be.a.Function();
        advert.should.have.property('on').and.be.a.Function();
        resolve();
      });
    });
  });

  describe('Rewarded', () => {
    it('should return a new instance with methods', () => {
      return new Promise((resolve) => {
        const advert = firebase.native.admob().rewarded('ca-app-pub-3940256099942544/1033173712');

        advert.should.have.property('loadAd').and.be.a.Function();
        advert.should.have.property('isLoaded').and.be.a.Function();
        advert.should.have.property('show').and.be.a.Function();
        advert.should.have.property('on').and.be.a.Function();
        resolve();
      });
    });

  });
}
