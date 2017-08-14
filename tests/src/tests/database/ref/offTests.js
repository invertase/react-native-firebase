import should from 'should';
import sinon from 'sinon';

import DatabaseContents from '../../support/DatabaseContents';

function offTests({ describe, it, xcontext, context, firebase }) {
  describe('ref().off()', () => {
    it('doesn\'t unbind children callbacks', async () => {
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
      const resp = await parentRef.off();
      should(resp, undefined);

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
      await childRef.off();
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
          ref.on('child_added', () => {
            childAddedCallback();
            resolve();
          });
        });

        await new Promise((resolve) => {
          ref.on('value', () => {
            valueCallback();
            resolve();
          });
        });

        valueCallback.should.be.calledOnce();
        childAddedCallback.should.have.callCount(arrayLength);

        // Check childAddedCallback is really attached
        await ref.push(DatabaseContents.DEFAULT.number);
        valueCallback.should.be.callCount(2);
        childAddedCallback.should.be.callCount(arrayLength + 1);

        // Returns nothing
        const resp = await ref.off();
        should(resp, undefined);

        // Trigger both callbacks

        await ref.set(DatabaseContents.DEFAULT.array);
        await ref.push(DatabaseContents.DEFAULT.number);

        // Callbacks should have been unbound and not called again
        valueCallback.should.be.callCount(2);
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

      it('detaches all callbacks listening for that event', async () => {
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
        const resp = await ref.off('value');
        should(resp, undefined);

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

      it('detaches only that callback', async () => {
        // Setup
        let callbackA;
        let callbackB;
        const spyA = sinon.spy();
        const spyB = sinon.spy();

        const ref = firebase.native.database().ref('tests/types/string');

        // Attach the callback the first time
        await new Promise((resolve) => {
          callbackA = () => {
            spyA();
            resolve();
          };
          ref.on('value', callbackA);
        });

        // Attach the callback the second time
        await new Promise((resolve) => {
          callbackB = () => {
            spyB();
            resolve();
          };
          ref.on('value', callbackB);
        });

        spyA.should.be.calledOnce();
        spyB.should.be.calledOnce();

        // Detach callbackA, only
        const resp = await ref.off('value', callbackA);
        should(resp, undefined);

        // Trigger the event the callback is listening to
        await ref.set(DatabaseContents.NEW.string);

        // Add a delay to ensure that the .set() has had time to be registered
        await new Promise((resolve) => {
          setTimeout(() => {
            resolve();
          }, 1000);
        });

        // CallbackB should still be attached
        spyA.should.be.calledOnce();
        spyB.should.be.calledTwice();

        // Teardown
        should(ref.off('value', callbackB), undefined);
      });

      context('that has been added multiple times', () => {
        it('must be called as many times completely remove', async () => {
          // Setup

          const spyA = sinon.spy();
          let callbackA;

          const ref = firebase.native.database().ref('tests/types/string');

          // Attach the callback the first time
          await new Promise((resolve) => {
            callbackA = () => {
              spyA();
              resolve();
            };
            ref.on('value', callbackA);
          });

          // Attach the callback the second time
          ref.on('value', callbackA);

          // Add a delay to ensure that the .on() has had time to be registered
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 1000);
          });

          spyA.should.be.calledTwice();

          // Undo the first time the callback was attached
          const resp = await ref.off('value', callbackA);
          should(resp, undefined);

          // Trigger the event the callback is listening to
          await ref.set(DatabaseContents.DEFAULT.number);

          // Callback should have been called only once because one of the attachments
          // has been removed
          spyA.should.be.callCount(3);

          // Undo the second attachment
          const resp2 = await ref.off('value', callbackA);
          should(resp2, undefined);

          // Trigger the event the callback is listening to
          await ref.set(DatabaseContents.DEFAULT.number);

          // Callback should not have been called any more times
          spyA.should.be.callCount(3);
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
