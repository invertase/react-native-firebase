import sinon from 'sinon';
import 'should-sinon';

import DatabaseContents from '../../support/DatabaseContents';

function onceTests({ describe, firebase, it, tryCatch }) {
  describe('ref().once()', () => {
    it('returns a promise', () => {
      // Setup

      const ref = firebase.native.database().ref('tests/types/number');

      // Test

      const returnValue = ref.once('value');

      // Assertion

      returnValue.should.be.Promise();
    });

    it('resolves with the correct value', async () => {
      await Promise.map(Object.keys(DatabaseContents.DEFAULT), (dataRef) => {
        // Setup

        const dataTypeValue = DatabaseContents.DEFAULT[dataRef];
        const ref = firebase.native.database().ref(`tests/types/${dataRef}`);

        // Test

        return ref.once('value').then((snapshot) => {
          // Assertion

          snapshot.val().should.eql(dataTypeValue);
        });
      });
    });

    it('is NOT called when the value is changed', async () => {
      // Setup

      const callback = sinon.spy();
      const ref = firebase.native.database().ref('tests/types/number');

      // Test

      ref.once('value').then(callback);

      await ref.set(DatabaseContents.NEW.number);

      // Assertion
      callback.should.be.calledOnce();
    });

    it('errors if permission denied', () => {
      return new Promise((resolve, reject) => {
        const successCb = tryCatch(() => {
          // Assertion

          reject(new Error('No permission denied error'));
        }, reject);

        const failureCb = tryCatch((error) => {
          // Assertion
          error.code.includes('database/permission-denied').should.be.true();
          resolve();
        }, reject);

        // Setup

        const reference = firebase.native.database().ref('nope');

        // Test
        reference.once('value', successCb, failureCb);
      });
    });
  });
}

export default onceTests;
