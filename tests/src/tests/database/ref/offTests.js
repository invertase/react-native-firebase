import should from 'should';
import sinon from 'sinon';

import DatabaseContents from '../../support/DatabaseContents';

function offTests({ describe, it, xit, xcontext, context, firebase }) {

  describe('ref().off()', () => {
    xit('doesn\'t unbind children callbacks', async () => {
      // Setup

      const parentCallback = sinon.spy();
      const childCallback = sinon.spy();

      const parentRef = firebase.native.database().ref('tests/types');
      const childRef = firebase.native.database().ref('tests/types/string');

      await new Promise((resolve) => {
        parentRef.on('value', () => {
          parentCallback();
          resolve();
        });
      });

      await new Promise((resolve) => {
        childRef.on('value', () => {
          childCallback();
          resolve();
        });
      });

      parentCallback.should.be.calledOnce();
      childCallback.should.be.calledOnce();

      // Returns nothing
      should(parentRef.off(), undefined);

      // Trigger event parent callback is listening to
      await parentRef.set(DatabaseContents.DEFAULT);

      // parent and child callbacks should not have been called any more
      parentCallback.should.be.calledOnce();
      childCallback.should.be.calledOnce();

      // Trigger event child callback is listening to
      await childRef.set(DatabaseContents.DEFAULT.string);

      // child callback should still be listening
      childCallback.should.be.calledOnce();

      // Teardown
      childRef.off();
    });

    context('when passed no arguments', () => {
      context('and there are no callbacks bound', () => {
        it('does nothing', () => {
          const ref = firebase.native.database().ref('tests/types/array');

          should(ref.off(), undefined);
        });
      });

      it('stops all callbacks listening for all changes', async () => {
        // Setup

        const valueCallback = sinon.spy();
        const childAddedCallback = sinon.spy();

        const ref = firebase.native.database().ref('tests/types/array');
        const arrayLength = DatabaseContents.DEFAULT.array.length;

        await new Promise((resolve) => {
          ref.on('value', () => {
            valueCallback();
            resolve();
          });
        });

        await new Promise((resolve) => {
          ref.on('child_added', () => {
            childAddedCallback();
            resolve();
          });
        });

        valueCallback.should.be.calledOnce();
        childAddedCallback.should.have.callCount(arrayLength);

        // Check childAddedCallback is really attached
        await ref.push(DatabaseContents.DEFAULT.number);
        childAddedCallback.should.be.callCount(arrayLength + 1);

        // Returns nothing
        should(ref.off(), undefined);

        // Trigger both callbacks

        await ref.set(DatabaseContents.DEFAULT.array);
        await ref.push(DatabaseContents.DEFAULT.number);

        // Callbacks should have been unbound and not called again
        valueCallback.should.be.calledOnce();
        childAddedCallback.should.be.callCount(arrayLength + 1);
      });
    });

    context('when passed an event type', () => {
      context('and there are no callbacks bound', () => {
        it('does nothing', () => {
          const ref = firebase.native.database().ref('tests/types/array');

          should(ref.off('value'), undefined);
        });
      });

      context('that is invalid', () => {
        it('does nothing', () => {
          const ref = firebase.native.database().ref('tests/types/array');

          should(ref.off('invalid'), undefined);
        });
      });

      xit('detaches all callbacks listening for that event', async () => {
        // Setup

        const callbackA = sinon.spy();
        const callbackB = sinon.spy();

        const ref = firebase.native.database().ref('tests/types/string');

        await new Promise((resolve) => {
          ref.on('value', () => {
            callbackA();
            resolve();
          });
        });

        await new Promise((resolve) => {
          ref.on('value', () => {
            callbackB();
            resolve();
          });
        });

        callbackA.should.be.calledOnce();
        callbackB.should.be.calledOnce();

        // Returns nothing
        should(ref.off('value'), undefined);

        // Assertions

        await ref.set(DatabaseContents.DEFAULT.string);

        // Callbacks should have been unbound and not called again
        callbackA.should.be.calledOnce();
        callbackB.should.be.calledOnce();
      });
    });

    context('when passed a particular callback', () => {
      context('and there are no callbacks bound', () => {
        it('does nothing', () => {
          const ref = firebase.native.database().ref('tests/types/array');

          should(ref.off('value', sinon.spy()), undefined);
        });
      });

      xit('detaches only that callback', async () => {
        // Setup

        const callbackA = sinon.spy();
        const callbackB = sinon.spy();

        const ref = firebase.native.database().ref('tests/types/string');

        // Attach the callback the first time
        await new Promise((resolve) => {
          ref.on('value', () => {
            callbackA();
            resolve();
          });
        });

        // Attach the callback the second time
        await new Promise((resolve) => {
          ref.on('value', () => {
            callbackB();
            resolve();
          });
        });

        callbackA.should.be.calledOnce();
        callbackB.should.be.calledOnce();

        // Detach callbackA, only
        should(ref.off('value', callbackA), undefined);

        // Trigger the event the callback is listening to
        await ref.set(DatabaseContents.DEFAULT.string);

        // CallbackB should still be attached
        callbackA.should.be.calledOnce();
        callbackB.should.be.calledTwice();

        // Teardown
        should(ref.off('value', callbackB), undefined);
      });

      context('that has been added multiple times', () => {
        xit('must be called as many times completely remove', async () => {
          // Setup

          const callbackA = sinon.spy();

          const ref = firebase.native.database().ref('tests/types/string');

          // Attach the callback the first time
          await new Promise((resolve) => {
            ref.on('value', () => {
              callbackA();
              resolve();
            });
          });

          // Attach the callback the second time
          await new Promise((resolve) => {
            ref.on('value', () => {
              callbackA();
              resolve();
            });
          });

          callbackA.should.be.calledTwice();

          // Undo the first time the callback was attached
          should(ref.off(), undefined);

          // Trigger the event the callback is listening to
          await ref.set(DatabaseContents.DEFAULT.number);

          // Callback should have been called only once because one of the attachments
          // has been removed
          callbackA.should.be.calledThrice();

          // Undo the second attachment
          should(ref.off(), undefined);

          // Trigger the event the callback is listening to
          await ref.set(DatabaseContents.DEFAULT.number);

          // Callback should not have been called any more times
          callbackA.should.be.calledThrice();
        });
      });
    });

    xcontext('when a context', () => {
      /**
       * @todo Add tests for when a context is passed. Not sure what the intended
       * behaviour is as the documentation is unclear, but assumption is that as the
       * context is not required to unbind a listener, it's used as a filter parameter
       * so in order for off() to remove a callback, the callback must have been bound
       * with the same event type, callback function and context.
       *
       * Needs to be tested against web implementation, if possible.
       */

    });
  });
}

export default offTests;
