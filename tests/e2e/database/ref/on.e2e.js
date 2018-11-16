const { CONTENTS, setDatabaseContents } = TestHelpers.database;
const delay = ms => new Promise(resolve => setTimeout(resolve, ms));

describe('database()', () => {
  before(() => setDatabaseContents());
  describe('ref().on()', () => {
    it('throws without second argument', () => {
      const ref = firebase.database().ref('tests/types/number');
      try {
        const returnValue = ref.on('value');
        return Promise.reject(new Error('No missing argument error'));
      } catch (err) {
        return Promise.resolve();
      }
    });
    it('returns a function', () => {
      const ref = firebase.database().ref('tests/types/number');
      const returnValue = ref.on('value', () => {});
      returnValue.should.be.Function();
    });
    it('resolves with the correct value', async () => {
      const ref = firebase.database().ref('tests/types/number');
      const unsub = ref.on('value', v => {
        if (!v) return;
        const nodeValue = v.val();
        nodeValue.should.be.Number();
        unsub();
      });
    });

    it('is called again when the value changes', async () => {
      const callback = sinon.spy();
      const ref = firebase.database().ref('tests/types/number');
      const unsub = ref.on('value', callback);
      // To know how long to wait
      await ref.once('value');
      callback.should.be.calledOnce();
      await ref.set(CONTENTS.NEW.number);
      // To know how long to wait
      await ref.once('value');
      callback.should.be.calledTwice();
      unsub();
    });
  });
});
