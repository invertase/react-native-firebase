function configTests({ before, describe, it, firebase }) {
  // todo tests are buggy - shows success but doesn't actually run tests
  /* Remote config service values = {
   foo: true,
   foobar: 'barbaz',
   numvalue: 0,
   } */

  before(() => {
    firebase.native.config().enableDeveloperMode();
    firebase.native.config().setDefaults({
      foo: 'bar',
      bar: 'baz',
    });
  });

  describe('Config', () => {
    it('it should fetch and activate config', () => {
      return firebase.native.config().fetch(0)
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
      return firebase.native.config().getValues(['foo', 'bar', 'foobar', 'numvalue'])
        .then((result) => {
          result.should.be.a.Object();
          result.should.have.keys('foo', 'bar', 'foobar');
          const fooValue = result.foo.val();
          const barValue = result.bar.val();
          const foobarValue = result.foobar.val();
          const numvalueValue = result.numvalue.val();

          fooValue.should.be.equal(true);
          barValue.should.be.equal('baz');
          foobarValue.should.be.equal('barbaz');
          numvalueValue.should.be.equal(0);

          return Promise.resolve();
        });
    });

    it('it get all keys as an array', () => {
      return firebase.native.config().getKeysByPrefix()
        .then((result) => {
          result.should.be.Array();
          return Promise.resolve();
        });
    });
  });
}

export default configTests;
