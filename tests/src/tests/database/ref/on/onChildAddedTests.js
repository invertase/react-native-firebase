import 'should-sinon';
import Promise from 'bluebird';

export default function onChildAddedTests({ describe, beforeEach, afterEach, it, firebase }) {
  describe('ref().on(\'child_added\')', () => {
    describe('the snapshot', () => {
      let ref;
      let childRef;
      let childVal;
      beforeEach(async () => {
        ref = firebase.native.database().ref('tests/types/object');

        await new Promise((resolve) => {
          ref.on('child_added', (snapshot) => {
            childRef = snapshot.ref;
            childVal = snapshot.val();
            resolve();
          });
        });
      });

      afterEach(() => {
        ref.off();
      });

      // https://github.com/invertase/react-native-firebase/issues/221
      it('has a key that identifies the child', () => {
        (childRef.key).should.equal('foo');
      });

      it('has the value of the child', () => {
        (childVal).should.equal('bar');
      });
    });
  });
}
