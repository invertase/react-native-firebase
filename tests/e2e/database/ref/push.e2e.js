const { CONTENTS, setDatabaseContents } = TestHelpers.database;

describe('database()', () => {
  before(() => setDatabaseContents());

  describe('ref().push()', () => {
    it('returns a ref that can be used to set value later', async () => {
      const ref = firebase.database().ref('tests/types/array');

      let originalListValue;
      await ref.once('value', snapshot => {
        originalListValue = snapshot.val();
      });
      await sleep(5);

      originalListValue.should.eql(jet.contextify(CONTENTS.DEFAULT.array));

      const newItemRef = ref.push();
      const valueToAddToList = CONTENTS.NEW.number;
      await newItemRef.set(valueToAddToList);

      let newItemValue;
      await newItemRef.once('value', snapshot => {
        newItemValue = snapshot.val();
      });
      await sleep(5);

      newItemValue.should.eql(valueToAddToList);

      let newListValue;
      await ref.once('value', snapshot => {
        newListValue = snapshot.val();
      });
      await sleep(5);

      const originalListAsObject = {
        ...originalListValue,
        [newItemRef.key]: valueToAddToList,
      };

      newListValue.should.eql(jet.contextify(originalListAsObject));
    });

    it('allows setting value immediately', async () => {
      let snapshot;

      const ref = firebase.database().ref('tests/types/array');
      const valueToAddToList = CONTENTS.NEW.number;

      snapshot = await ref.once('value');
      const originalListValue = snapshot.val();
      const newItemRef = ref.push(valueToAddToList);

      snapshot = await newItemRef.once('value');
      const newItemValue = snapshot.val();
      newItemValue.should.eql(valueToAddToList);

      snapshot = await firebase
        .database()
        .ref('tests/types/array')
        .once('value');
      const newListValue = snapshot.val();

      const originalListAsObject = {
        ...originalListValue,
        [newItemRef.key]: valueToAddToList,
      };

      newListValue.should.eql(jet.contextify(originalListAsObject));
    });

    // https://github.com/invertase/react-native-firebase/issues/893
    it('correctly returns the reference', async () => {
      let result;
      const path = 'tests/types/array';
      const valueToAddToList = CONTENTS.NEW.number;
      const Reference = jet.require('src/modules/database/Reference');

      // 1
      const ref1 = firebase
        .database()
        .ref(path)
        .push();

      should.exist(ref1, 'ref1 did not return a Reference instance');
      ref1.key.should.be.a.String();
      ref1.should.be.instanceOf(Reference);
      result = await ref1.set(valueToAddToList);
      should.not.exist(result);

      // 2
      const ref2 = await firebase
        .database()
        .ref(path)
        .push(valueToAddToList);

      should.exist(ref2, 'ref2 did not return a Reference instance');
      ref2.key.should.be.a.String();
      ref2.should.be.instanceOf(Reference);

      // 3
      const ref3 = await firebase
        .database()
        .ref(path)
        .push();

      should.exist(ref3, 'ref3 did not return a Reference instance');
      ref3.key.should.be.a.String();
      ref3.should.be.instanceOf(Reference);

      result = await ref3.set(valueToAddToList);
      should.not.exist(result);
    });

    it('calls an onComplete callback', async () => {
      const callback = sinon.spy();
      const ref = firebase.database().ref('tests/types/array');

      const valueToAddToList = CONTENTS.NEW.number;
      const newItemRef = await ref.push(valueToAddToList, callback);

      callback.should.be.calledWith(null);
      newItemRef.parent.path.should.equal('tests/types/array');
    });
  });
});
