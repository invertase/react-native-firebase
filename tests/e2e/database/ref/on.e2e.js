const { CONTENTS, setDatabaseContents } = TestHelpers.database;
const waitForValueAtRef = ref =>
  new Promise(resolve => {
    const unsub = ref.on('value', v => {
      if (!v) return;
      const nodeValue = v.val();
      unsub();
      resolve(nodeValue);
    });
  });

describe('database()', () => {
  before(() => setDatabaseContents());
  describe('ref().on("value")', () => {
    it('throws without second argument', () => {
      const ref = firebase.database().ref('tests/types/number');
      (() => ref.on('value')).should.throw(
        'Query.on failed: Function called with 1 argument. Expects at least 2.'
      );
    });
    it('returns a function', () => {
      const ref = firebase.database().ref('tests/types/number');
      const unsub = ref.on('value', () => {});
      unsub.should.be.Function();
    });
    it('resolves with the correct value', async () => {
      const ref = firebase.database().ref('tests/types/number');
      const nodeValue = await waitForValueAtRef(ref);
      nodeValue.should.be.Number();
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
  describe('ref().on("child_added")', () => {
    it('returns a function', () => {
      const ref = firebase.database().ref('tests/types/number');
      const unsub = ref.on('child_added', () => {});
      unsub.should.be.Function();
    });
  });
});
