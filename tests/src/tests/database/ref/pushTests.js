import sinon from 'sinon';
import 'should-sinon';

import DatabaseContents from '../../support/DatabaseContents';

function pushTests({ fdescribe, it, firebase }) {
  fdescribe('ref().push()', () => {
    it('returns a ref that can be used to set value later', async () => {
      // Setup

      const ref = firebase.native.database().ref('tests/types/array');

      let originalListValue;

      await ref.once('value', (snapshot) => {
        originalListValue = snapshot.val();
      });

      originalListValue.should.eql(DatabaseContents.DEFAULT.array);

      // Test

      const newItemRef = ref.push();

      const valueToAddToList = DatabaseContents.NEW.number;
      await newItemRef.set(valueToAddToList);

      let newItemValue,
        newListValue;

      // Assertion

      await newItemRef.once('value', (snapshot) => {
        newItemValue = snapshot.val();
      });

      newItemValue.should.eql(valueToAddToList);

      await ref.once('value', (snapshot) => {
        newListValue = snapshot.val();
      });

      const originalListAsObject = originalListValue.reduce((memo, value, index) => {
        memo[index] = value;
        return memo;
      }, {});

      originalListAsObject[newItemRef.key] = valueToAddToList;

      newListValue.should.eql(originalListAsObject);
    });

    it('allows setting value immediately', async () => {
      // Setup

      const ref = firebase.native.database().ref('tests/types/array');

      let originalListValue;

      await ref.once('value', (snapshot) => {
        originalListValue = snapshot.val();
      });

      // Test

      const valueToAddToList = DatabaseContents.NEW.number;
      const newItemRef = await ref.push(valueToAddToList);

      let newItemValue,
        newListValue;

      // Assertion

      await newItemRef.once('value', (snapshot) => {
        newItemValue = snapshot.val();
      });

      newItemValue.should.eql(valueToAddToList);

      await ref.once('value', (snapshot) => {
        newListValue = snapshot.val();
      });

      const originalListAsObject = originalListValue.reduce((memo, value, index) => {
        memo[index] = value;
        return memo;
      }, {});

      originalListAsObject[newItemRef.key] = valueToAddToList;

      newListValue.should.eql(originalListAsObject);
    });

    it('calls an onComplete callback', async () => {
      // Setup

      const callback = sinon.spy();

      const ref = firebase.native.database().ref('tests/types/array');

      // Test

      const valueToAddToList = DatabaseContents.NEW.number;
      await ref.push(valueToAddToList, callback);

      // Assertion

      callback.should.be.calledWith(null);
    });
  })
}

export default pushTests;
