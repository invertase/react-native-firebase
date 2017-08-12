import sinon from 'sinon';
import 'should-sinon';
import Promise from 'bluebird';

import DatabaseContents from '../../../support/DatabaseContents';

function onTests({ fdescribe, context, it, firebase, tryCatch }) {
  fdescribe('ref().on(\'value\')', () => {
    // Documented Web API Behaviour
    it('returns the success callback', () => {
      // Setup

      const successCallback = sinon.spy();
      const ref = firebase.native.database().ref('tests/types/array');

      // Assertions

      ref.on('value', successCallback).should.eql(successCallback);

      // Tear down

      ref.off();
    });

    // Documented Web API Behaviour
    it('calls callback with null if there is no data at ref', async () => {
      // Setup
      const ref = firebase.native.database().ref('tests/types/invalid');

      const callback = sinon.spy();

      // Test

      await new Promise((resolve) => {
        ref.on('value', (snapshot) => {
          callback(snapshot.val());
          resolve();
        });
      });

      // Assertions

      callback.should.be.calledWith(null);

      await ref.set(1);

      callback.should.be.calledWith(1);

      // Teardown
      ref.off();
      await ref.set(null);
    });

    // Documented Web API Behaviour
    it('calls callback with the initial data and then when value changes', () => {
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
        callback.should.be.calledTwice();

        // Tear down

        ref.off();
        await ref.set(currentDataValue);
      });
    });

    it('calls callback when children of the ref change', async () => {
      const ref = firebase.native.database().ref('tests/types/object');
      const currentDataValue = DatabaseContents.DEFAULT.object;

      const callback = sinon.spy();

      // Test

      await new Promise((resolve) => {
        ref.on('value', (snapshot) => {
          callback(snapshot.val());
          resolve();
        });
      });

      callback.should.be.calledWith(currentDataValue);

      const newDataValue = DatabaseContents.NEW.string;
      const childRef = firebase.native.database().ref('tests/types/object/foo2');
      await childRef.set(newDataValue);

      // Assertions

      callback.should.be.calledWith({
        ...currentDataValue,
        foo2: newDataValue,
      });

      callback.should.be.calledTwice();

      // Tear down

      ref.off();
      await ref.set(currentDataValue);
    });

    it('calls callback when child of the ref is added', async () => {
      const ref = firebase.native.database().ref('tests/types/array');
      const currentDataValue = DatabaseContents.DEFAULT.array;

      const callback = sinon.spy();

      // Test

      await new Promise((resolve) => {
        ref.on('value', (snapshot) => {
          callback(snapshot.val());
          resolve();
        });
      });

      callback.should.be.calledWith(currentDataValue);

      const newElementRef = await ref.push(37);

      const arrayAsObject = currentDataValue.reduce((memo, element, index) => {
        memo[index] = element;
        return memo;
      }, {});

      // Assertions
      callback.should.be.calledWith({
        ...arrayAsObject,
        [newElementRef.key]: 37,
      });
      callback.should.be.calledTwice();

      // Tear down

      ref.off();
      await ref.set(currentDataValue);
    });

    it('doesn\'t call callback when the ref is updated with the same value', async () => {
      const ref = firebase.native.database().ref('tests/types/object');
      const currentDataValue = DatabaseContents.DEFAULT.object;

      const callback = sinon.spy();

      // Test

      await new Promise((resolve) => {
        ref.on('value', (snapshot) => {
          callback(snapshot.val());
          resolve();
        });
      });

      callback.should.be.calledWith(currentDataValue);

      await ref.set(currentDataValue);

      // Assertions

      callback.should.be.calledOnce(); // Callback is not called again

      // Tear down

      ref.off();
    });

    // Documented Web API Behaviour
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
        callbackA.should.be.calledOnce();

        callbackB.should.be.calledWith(currentDataValue);
        callbackB.should.be.calledOnce();

        const newDataValue = DatabaseContents.NEW[dataRef];
        await ref.set(newDataValue);

        callbackA.should.be.calledWith(newDataValue);
        callbackB.should.be.calledWith(newDataValue);

        callbackA.should.be.calledTwice();
        callbackB.should.be.calledTwice();

        // Tear down

        ref.off();
      });
    });

    context('when no failure callback is provided', () => {
      it('then does not call the callback for a ref to un-permitted location', () => {
        const invalidRef = firebase.native.database().ref('nope');

        const callback = sinon.spy();

        invalidRef.on('value', callback);

        /**
         * As we are testing that a callback is "never" called, we just wait for
         * a reasonable time before giving up.
         */
        return new Promise((resolve) => {
          setTimeout(() => {
            callback.should.not.be.called();
            invalidRef.off();
            resolve();
          }, 1000);
        });
      });

      // Documented Web API Behaviour
      it('then calls callback bound to the specified context with the initial data and then when value changes', () => {
        return Promise.each(Object.keys(DatabaseContents.DEFAULT), async (dataRef) => {
          // Setup

          const ref = firebase.native.database().ref(`tests/types/${dataRef}`);
          const currentDataValue = DatabaseContents.DEFAULT[dataRef];

          const context = {
            callCount: 0,
          };

          // Test

          await new Promise((resolve) => {
            ref.on('value', function(snapshot) {
              this.value = snapshot.val();
              this.callCount += 1;
              resolve();
            }, context);
          });

          context.value.should.eql(currentDataValue);
          context.callCount.should.eql(1);

          const newDataValue = DatabaseContents.NEW[dataRef];
          await ref.set(newDataValue);

          // Assertions

          context.value.should.eql(newDataValue);
          context.callCount.should.eql(2);

          // Tear down

          ref.off();
          await ref.set(currentDataValue);
        });
      });

    });

    // Observed Web API Behaviour
    context('when a failure callback is provided', () => {
      it('then calls only the failure callback for a ref to un-permitted location', () => {
        const invalidRef = firebase.native.database().ref('nope');

        const callback = sinon.spy();

        return new Promise((resolve, reject) => {
          invalidRef.on('value', callback, tryCatch((error) => {
            error.message.should.eql(
              'permission_denied at /nope: Client doesn\'t have permission to access the desired data.'
            );
            error.name.should.eql('Error');

            callback.should.not.be.called();

            invalidRef.off();
            resolve();
          }, reject));
        });
      });

      // Documented Web API Behaviour
      it('then calls callback bound to the specified context with the initial data and then when value changes', () => {
        return Promise.each(Object.keys(DatabaseContents.DEFAULT), async (dataRef) => {
          // Setup

          const ref = firebase.native.database().ref(`tests/types/${dataRef}`);
          const currentDataValue = DatabaseContents.DEFAULT[dataRef];

          const context = {
            callCount: 0,
          };

          const failureCallback = sinon.spy();

          // Test

          await new Promise((resolve) => {
            ref.on('value', function(snapshot) {
              this.value = snapshot.val();
              this.callCount += 1;
              resolve();
            }, failureCallback, context);
          });

          failureCallback.should.not.be.called();
          context.value.should.eql(currentDataValue);
          context.callCount.should.eql(1);

          const newDataValue = DatabaseContents.NEW[dataRef];
          await ref.set(newDataValue);

          // Assertions

          context.value.should.eql(newDataValue);
          context.callCount.should.eql(2);

          // Tear down

          ref.off();
          await ref.set(currentDataValue);
        });
      })
    });
  });
}

export default onTests;
