const { CONTENTS, setDatabaseContents } = TestHelpers.database;

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
      unsub();
    });
    it('resolves with the correct value and key', async () => {
      const ref = firebase.database().ref('tests/types/number');
      const nodeValue = await new Promise(resolve => {
        const unsub = ref.on('value', v => {
          if (!v) return;
          const nodeValue = v.val();
          unsub();
          nodeValue.should.be.Number();
          v.key.should.be.String();
          v.key.should.equal('number');
          resolve();
        });
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
  describe('ref().on("child_added")', () => {
    it('returns a function', () => {
      const ref = firebase.database().ref('tests/types/number');
      const unsub = ref.on('child_added', () => {});
      unsub.should.be.Function();
      unsub();
    });
  });
  describe('ref().on("child_removed")', () => {
    it('returns a function', () => {
      const ref = firebase.database().ref('tests/types/number');
      const unsub = ref.on('child_removed', () => {});
      unsub.should.be.Function();
      unsub();
    });
  });
  describe('ref().on("child_moved")', () => {
    it('returns a function', () => {
      const ref = firebase.database().ref('tests/types/number');
      const unsub = ref.on('child_moved', () => {});
      unsub.should.be.Function();
      unsub();
    });
  });
  describe('ref().on("child_changed")', () => {
    it('returns a function', () => {
      const ref = firebase.database().ref('tests/types/number');
      const unsub = ref.on('child_changed', () => {});
      unsub.should.be.Function();
      unsub();
    });
  });
  describe('ref().on("INVALID_EVENT_NAME")', () => {
    it('throws', () => {
      const ref = firebase.database().ref('tests/types/number');
      (() => {
        const unsub = ref.on('INVALID_EVENT_NAME', () => {});
      }).should.throw(
        'Query.on failed: First argument must be a valid string event type: "value, child_added, child_removed, child_changed, child_moved"'
      );
    });
  });
});
