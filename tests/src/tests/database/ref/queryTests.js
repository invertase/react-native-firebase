import 'should-sinon';
import Promise from 'bluebird';

function queryTests({ describe, it, firebase, tryCatch }) {
  describe('ref query', () => {
    it('orderByChild().equalTo()', () => {
      return new Promise((resolve, reject) => {
        const successCb = tryCatch((snapshot) => {
          const webVal = snapshot.val();
          const ref = firebase.native.database().ref('tests/query');

          ref.orderByChild('search').equalTo('foo').once('value', tryCatch((snapshot) => {
            const nativeVal = snapshot.val();
            nativeVal.should.eql(webVal);
            resolve();
          }, reject), reject);
        }, reject);

        firebase.web.database().ref('tests/query').orderByChild('search').equalTo('foo').once('value', successCb, reject);
      });
    });
  });
}

export default queryTests;
