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

        // stinky test fix - it's all async now so it's not returned within same event loop
        await new Promise((resolve) => {
          setTimeout(() => resolve(), 15);
        });

        valueCallback.should.be.calledTwice();
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
        it('throws an exception', () => {
          const ref = firebase.native.database().ref('tests/types/array');
          (() => ref.off('invalid')).should.throw('Query.off failed: First argument must be a valid string event type: "value, child_added, child_removed, child_changed, child_moved"');
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
        it('must be called as many times to completely remove', async () => {
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
            }, 15);
          });

          spyA.should.be.calledTwice();

          // Undo the first time the callback was attached
          const resp = await ref.off('value', callbackA);
          should(resp, undefined);

          // Trigger the event the callback is listening to
          await ref.set(DatabaseContents.DEFAULT.number);

          // Add a delay to ensure that the .set() has had time to be registered
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 15);
          });

          // Callback should have been called only once because one of the attachments
          // has been removed
          spyA.should.be.calledThrice();

          // Undo the second attachment
          const resp2 = await ref.off('value', callbackA);
          should(resp2, undefined);

          // Trigger the event the callback is listening to
          await ref.set(DatabaseContents.DEFAULT.number);

          // Add a delay to ensure that the .set() has had time to be registered
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 15);
          });

          // Callback should not have been called any more times
          spyA.should.be.calledThrice();
        });
      });
    });

    context('when 2 different child_added callbacks on the same path', () => {
      context('that has been added and removed in the same order', () => {
        it('must be completely removed', async () => {
          // Setup

          const spyA = sinon.spy();
          let callbackA;

          const spyB = sinon.spy();
          let callbackB;

          const ref = firebase.native.database().ref('tests/types/array');
          const arrayLength = DatabaseContents.DEFAULT.array.length;
          // Attach callbackA
          await new Promise((resolve) => {
            callbackA = () => {
              spyA();
              resolve();
            };
            ref.on('child_added', callbackA);
          });

          // Attach callbackB
          await new Promise((resolve) => {
            callbackB = () => {
              spyB();
              resolve();
            };
            ref.on('child_added', callbackB);
          });

          // Add a delay to ensure that the .on() has had time to be registered
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 15);
          });

          spyA.should.have.callCount(arrayLength);
          spyB.should.have.callCount(arrayLength);

          // Undo the first callback
          const resp = await ref.off('child_added', callbackA);
          should(resp, undefined);

          // Trigger the event the callback is listening to
          await ref.push(DatabaseContents.DEFAULT.number);

          // Add a delay to ensure that the .set() has had time to be registered
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 15);
          });

          // CallbackA should have been called zero more times its attachment
          // has been removed, and callBackB only one more time becuase it's still attached
          spyA.should.have.callCount(arrayLength);
          spyB.should.have.callCount(arrayLength + 1);

          // Undo the second attachment
          const resp2 = await ref.off('child_added', callbackB);
          should(resp2, undefined);

          // Trigger the event the callback is listening to
          await ref.push(DatabaseContents.DEFAULT.number);

          // Add a delay to ensure that the .set() has had time to be registered
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 15);
          });

          // Both Callbacks should not have been called any more times
          spyA.should.have.callCount(arrayLength);
          spyB.should.have.callCount(arrayLength + 1);
        });
      });

      // ******This test is failed*******
      context('that has been added and removed in reverse order', () => {
        it('must be completely removed', async () => {
          // Setup

          const spyA = sinon.spy();
          let callbackA;

          const spyB = sinon.spy();
          let callbackB;

          const ref = firebase.native.database().ref('tests/types/array');
          const arrayLength = DatabaseContents.DEFAULT.array.length;
          // Attach callbackA
          await new Promise((resolve) => {
            callbackA = () => {
              spyA();
              resolve();
            };
            ref.on('child_added', callbackA);
          });

          // Attach callbackB
          await new Promise((resolve) => {
            callbackB = () => {
              spyB();
              resolve();
            };
            ref.on('child_added', callbackB);
          });

          // Add a delay to ensure that the .on() has had time to be registered
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 15);
          });

          spyA.should.have.callCount(arrayLength);
          spyB.should.have.callCount(arrayLength);

          // Undo the second callback
          const resp = await ref.off('child_added', callbackB);
          should(resp, undefined);

          // Trigger the event the callback is listening to
          await ref.push(DatabaseContents.DEFAULT.number);

          // Add a delay to ensure that the .set() has had time to be registered
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 15);
          });

          // CallbackB should have been called zero more times its attachment
          // has been removed, and callBackA only one more time becuase it's still attached
          spyA.should.have.callCount(arrayLength + 1);
          spyB.should.have.callCount(arrayLength);

          // Undo the second attachment
          const resp2 = await ref.off('child_added', callbackA);
          should(resp2, undefined);

          // Trigger the event the callback is listening to
          await ref.push(DatabaseContents.DEFAULT.number);

          // Add a delay to ensure that the .set() has had time to be registered
          await new Promise((resolve) => {
            setTimeout(() => {
              resolve();
            }, 15);
          });

          // Both Callbacks should not have been called any more times
          spyA.should.have.callCount(arrayLength + 1);
          spyB.should.have.callCount(arrayLength);
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
