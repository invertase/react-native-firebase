import 'should-sinon';

function onTests({ describe, it, firebase, context }) {
  describe('ref().on()', () => {
    // Observed Web API Behaviour
    context('when no eventName is provided', () => {
      it('then raises an error', () => {
        const ref = firebase.native.database().ref('tests/types/number');

        (() => { ref.on(); }).should.throw('Error: Query on failed: Was called with 0 arguments. Expects at least 2');
      });
    });

    // Observed Web API Behaviour
    context('when no callback function is provided', () => {
      it('then raises an error', () => {
        const ref = firebase.native.database().ref('tests/types/number');

        (() => { ref.on('value'); }).should.throw('Query.on failed: Was called with 1 argument. Expects at least 2.');
      });
    });

    // Observed Web API Behaviour
    context('when an invalid eventName is provided', () => {
      it('then raises an error', () => {
        const ref = firebase.native.database().ref('tests/types/number');

        (() => { ref.on('invalid', () => {}); }).should.throw('Query.on failed: First argument must be a valid event type: "value", "child_added", "child_removed", "child_changed", or "child_moved".');
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

        (() => { ref.on('value', () => {}, null); }).should.throw('Query.on failed: third argument  must either be a cancel callback or a context object.');
      });
    });
  });
}

export default onTests;
