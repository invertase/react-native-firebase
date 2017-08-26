import 'should-sinon';

function onTests({ describe, it, firebase, context }) {
  describe('ref().on()', () => {
    // Observed Web API Behaviour
    context('when no eventName is provided', () => {
      it('then raises an error', () => {
        const ref = firebase.native.database().ref('tests/types/number');

        (() => { ref.on(); }).should.throw('Query.on failed: Function called with 0 arguments. Expects at least 2.');
      });
    });

    // Observed Web API Behaviour
    context('when no callback function is provided', () => {
      it('then raises an error', () => {
        const ref = firebase.native.database().ref('tests/types/number');

        (() => { ref.on('value'); }).should.throw('Query.on failed: Function called with 1 argument. Expects at least 2.');
      });
    });

    // Observed Web API Behaviour
    context('when an invalid eventName is provided', () => {
      it('then raises an error', () => {
        const ref = firebase.native.database().ref('tests/types/number');

        (() => { ref.on('invalid', () => {}); }).should.throw('Query.on failed: First argument must be a valid string event type: "value, child_added, child_removed, child_changed, child_moved"');
      });
    });

    // Observed Web API Behaviour
    context('when an invalid success callback function is provided', () => {
      it('then raises an error', () => {
        const ref = firebase.native.database().ref('tests/types/number');

        (() => { ref.on('value', 1); }).should.throw('Query.on failed: Second argument must be a valid function.');
      });
    });

    // Observed Web API Behaviour
    context('when an invalid failure callback function is provided', () => {
      it('then raises an error', () => {
        const ref = firebase.native.database().ref('tests/types/number');

        (() => { ref.on('value', () => {}, 'foo'); }).should.throw('Query.on failed: Function called with 3 arguments, but third optional argument `cancelCallbackOrContext` was not a function.');
      });
    });
  });
}

export default onTests;
