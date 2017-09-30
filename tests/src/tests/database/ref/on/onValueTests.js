import sinon from 'sinon';
import 'should-sinon';
import Promise from 'bluebird';

import DatabaseContents from '../../../support/DatabaseContents';

function onTests({ describe, context, it, firebase, tryCatch }) {
  describe('ref().on(\'value\')', () => {
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

      // wait for the set to register internally, they're events
      // so not immediately available on the next event loop - only need to this do for tests
      await new Promise((resolve) => {
        setTimeout(() => resolve(), 15);
      });

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

        await new Promise((resolve) => {
          setTimeout(() => resolve(), 5);
        });

        // Assertions

        callback.should.be.calledWith(newDataValue);
        callback.should.be.calledTwice();

        // Tear down

        ref.off();
        return ref.set(currentDataValue);
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

      await new Promise((resolve) => {
        setTimeout(() => resolve(), 5);
      });
      // Assertions

      callback.should.be.calledWith({
        ...currentDataValue,
        foo2: newDataValue,
      });

      callback.should.be.calledTwice();

      // Tear down

      ref.off();
      return ref.set(currentDataValue);
    });

    it('calls callback when child of the ref is added', async () => {
      return new Promise((resolve, reject) => {
        const ref = firebase.native.database().ref('tests/types/array');
        const currentDataValue = DatabaseContents.DEFAULT.array;

        const callback = sinon.spy();
        const callbackAfterSet = sinon.spy();

        let newKey = '';
        let calledOnce = false;
        let calledTwice = false;
        ref.on('value', tryCatch((snapshot) => {
          if (!calledOnce) {
            callback(snapshot.val());
            callback.should.be.calledWith(currentDataValue);
            calledOnce = true;

            const newElementRef = ref.push();
            newKey = newElementRef.key;
            newElementRef.set(37);
          } else if (!calledTwice) {
            calledTwice = true;
            callbackAfterSet(snapshot.val());
            const arrayAsObject = currentDataValue.reduce((memo, element, index) => {
              // eslint-disable-next-line no-param-reassign
              memo[index] = element;
              return memo;
            }, {});

            // Assertions
            callbackAfterSet.should.be.calledWith({
              ...arrayAsObject,
              [newKey]: 37,
            });

            // Tear down
            ref.off(); // TODO
            ref.set(currentDataValue).then(() => resolve()).catch(() => reject());
          } // todo throw new Error('On listener called more than two times, expects no more than 2 calls');
        }, reject));
      });
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

      await new Promise((resolve) => {
        setTimeout(() => resolve(), 5);
      });
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

        await new Promise((resolve) => {
          setTimeout(() => resolve(), 5);
        });

        callbackA.should.be.calledWith(newDataValue);
        callbackB.should.be.calledWith(newDataValue);

        callbackA.should.be.calledTwice();
        callbackB.should.be.calledTwice();

        // Tear down

        ref.off();
        return Promise.resolve();
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

          const cbContext = {
            callCount: 0,
          };

          // Test

          await new Promise((resolve) => {
            ref.on('value', function (snapshot) {
              this.value = snapshot.val();
              this.callCount += 1;
              resolve();
            }, cbContext);
          });

          cbContext.value.should.eql(currentDataValue);
          cbContext.callCount.should.eql(1);

          const newDataValue = DatabaseContents.NEW[dataRef];
          await ref.set(newDataValue);

          await new Promise((resolve) => {
            setTimeout(() => resolve(), 5);
          });

          // Assertions

          cbContext.value.should.eql(newDataValue);
          cbContext.callCount.should.eql(2);

          // Tear down

          ref.off();
          return ref.set(currentDataValue);
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
              'Database: Client doesn\'t have permission to access the desired data. (database/permission-denied).',
            );

            error.code.should.eql('database/permission-denied');

            // test ref matches
            error.ref.path.should.eql(invalidRef.path);


            callback.should.not.be.called();

            invalidRef.off();
            resolve();
          }, reject));
        });
      });
    });
  });
}

export default onTests;
