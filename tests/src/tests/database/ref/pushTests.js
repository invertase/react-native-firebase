import sinon from 'sinon';
import 'should-sinon';

import DatabaseContents from '../../support/DatabaseContents';

function pushTests({ describe, it, firebase }) {
  describe('ref().push()', () => {
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
      let newItemRef;
      let newItemValue;
      let newListValue;
      let originalListValue;
      const ref = firebase.native.database().ref('tests/types/array');
      const valueToAddToList = DatabaseContents.NEW.number;

      return ref.once('value')
        .then((snapshot) => {
          originalListValue = snapshot.val();
          newItemRef = ref.push(valueToAddToList);
          return newItemRef;
        })
        .then((val) => {
            // val should be void
          return newItemRef.once('value');
        })
        .then((snapshot) => {
          newItemValue = snapshot.val();
          newItemValue.should.eql(valueToAddToList);
          return firebase.native.database().ref('tests/types/array').once('value');
        })
        .then((snapshot) => {
          newListValue = snapshot.val();
          const originalListAsObject = originalListValue.reduce((memo, value, index) => {
            memo[index] = value;
            return memo;
          }, {});

          originalListAsObject[newItemRef.key] = valueToAddToList;
          newListValue.should.eql(originalListAsObject);
        });


      // try {
        // Setup

        // const ref = firebase.native.database().ref('tests/types/array');
        //
        //
        // await ref.once('value', (snapshot) => {
        //   originalListValue = snapshot.val();
        // });

        // Test
        // debugger;
        // const valueToAddToList = DatabaseContents.NEW.number;
        // const newItemRef = await ref.push(valueToAddToList);

        // let newItemValue;

        // Assertion
        // debugger;
        // await newItemRef.once('value', (snapshot) => {
        //   newItemValue = snapshot.val();
        // });

      //   debugger;
      //   newItemValue.should.eql(valueToAddToList);
      //   debugger;
      //
      //
      //   // this one is hanging
      //   console.log('barr')
      //   const finalOnceSnap = await ref.once('value');
      //   const newListValue = finalOnceSnap.val();
      //
      //   debugger;
      //   const originalListAsObject = originalListValue.reduce((memo, value, index) => {
      //     memo[index] = value;
      //     return memo;
      //   }, {});
      //
      //   originalListAsObject[newItemRef.key] = valueToAddToList;
      //
      //   newListValue.should.eql(originalListAsObject);
      // } catch (e) {
      //   console.log(e);
      //   debugger;
      //   // just checking by chance there's an error being silently swallowed somewhere
      // }
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
  });
}

export default pushTests;
