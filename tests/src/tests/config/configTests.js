function configTests({ tryCatch, before, fdescribe, it, firebase }) {

  /* Remote config service values = {
   foo: true,
   foobar: 'barbaz',
   } */

  before(() => {
    firebase.native.config().enableDeveloperMode();
    firebase.native.config().setDefaults({
      foo: 'bar',
      bar: 'baz',
    });
  });

  fdescribe('Config', () => {
    it('it should fetch and activate config', () => {
      return firebase.native.config().fetch()
        .then(() => {
          return firebase.native.config().activateFetched();
        })
        .then((activated) => {
          activated.should.be.a.Boolean();
          return Promise.resolve();
        });
    });

    it('it should get a single value by key', () => {
      return firebase.native.config().getValue('foo')
        .then((snapshot) => {
          snapshot.should.be.a.Object();
          snapshot.source.should.be.a.String();
          snapshot.val.should.be.a.Function();

          const value = snapshot.val();
          value.should.be.equalOneOf('bar', true);
          return Promise.resolve();
        });
    });

    it('it should get multiple values by an array of keys', () => {
      return firebase.native.config().getValues(['foo', 'bar', 'foobar'])
        .then((result) => {
          result.should.be.a.Object();
          result.should.have.keys('foo', 'bar', 'foobar');
          const fooValue = result.foo.val();
          const barValue = result.bar.val();
          const foobarValue = result.foobar.val();

          fooValue.should.be.equal(true);
          barValue.should.be.equal('baz');
          foobarValue.should.be.equal('barbaz');

          return Promise.resolve();
        });
    });
  });
}

export default configTests;
