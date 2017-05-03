import sinon from 'sinon';
import 'should-sinon';
import Promise from 'bluebird';

import DatabaseContents from '../../support/DatabaseContents';

function onTests({ describe, it, firebase, tryCatch }) {
  describe('ref().on()', () => {
    it('calls callback when value changes', () => {
      return Promise.each(Object.keys(DatabaseContents.DEFAULT), async (dataRef) => {
        // Setup

        const ref = firebase.native.database().ref(`tests/types/${dataRef}`);
        const currentDataValue = DatabaseContents.DEFAULT[dataRef];

        const callback = sinon.spy();

        // Test

        await new Promise((resolve) => {
          ref.on('value', (snapshot) => {
            callback(snapshot.val());
            resolve();
          });
        });

        callback.should.be.calledWith(currentDataValue);

        const newDataValue = DatabaseContents.NEW[dataRef];
        await ref.set(newDataValue);

        // Assertions

        callback.should.be.calledWith(newDataValue);

        // Tear down

        ref.off();
      });
    });

    it('allows binding multiple callbacks to the same ref', () => {
      return Promise.each(Object.keys(DatabaseContents.DEFAULT), async (dataRef) => {
        // Setup

        const ref = firebase.native.database().ref(`tests/types/${dataRef}`);
        const currentDataValue = DatabaseContents.DEFAULT[dataRef];

        const callbackA = sinon.spy();
        const callbackB = sinon.spy();

        // Test

        await new Promise((resolve) => {
          ref.on('value', (snapshot) => {
            callbackA(snapshot.val());
            resolve();
          });
        });

        await new Promise((resolve) => {
          ref.on('value', (snapshot) => {
            callbackB(snapshot.val());
            resolve();
          });
        });

        callbackA.should.be.calledWith(currentDataValue);
        callbackB.should.be.calledWith(currentDataValue);

        // Tear down

        ref.off();
      });
    });

    it('calls callback with current values', () => {
      return Promise.each(Object.keys(DatabaseContents.DEFAULT), (dataRef) => {
        // Setup

        const dataTypeValue = DatabaseContents.DEFAULT[dataRef];
        const ref = firebase.native.database().ref(`tests/types/${dataRef}`);

        // Test

        return ref.on('value', (snapshot) => {
          // Assertion

          snapshot.val().should.eql(dataTypeValue);

          // Tear down

          ref.off();
        });
      });
    });

    it('errors if permission denied', () => {
      return new Promise((resolve, reject) => {
        const successCb = tryCatch(() => {
          // Assertion

          reject(new Error('No permission denied error'));
        }, reject);

        const failureCb = tryCatch((error) => {
          // Assertion

          error.message.includes('permission_denied').should.be.true();
          resolve();
        }, reject);

        // Setup

        const invalidRef = firebase.native.database().ref('nope');

        // Test

        invalidRef.on('value', successCb, failureCb);
      });
    });
  });
}

export default onTests;
