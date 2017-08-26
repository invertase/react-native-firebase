import should from 'should';
import DatabaseContents from '../../support/DatabaseContents';

function issueTests({ describe, it, context, firebase }) {
  describe('issue_100', () => {
    context('array-like values should', () => {
      it('return null in returned array at positions where a key is missing', async () => {
        // Setup

        const ref = firebase.native.database().ref('tests/issues/100');

        // Test

        return ref.once('value').then((snapshot) => {
          snapshot.val().should.eql([null, DatabaseContents.ISSUES[100][1], DatabaseContents.ISSUES[100][2], DatabaseContents.ISSUES[100][3]]);
        });
      });
    });
  });

  describe('issue_108', () => {
    context('filters using floats', () => {
      it('return correct results', async () => {
        // Setup

        const ref = firebase.native.database().ref('tests/issues/108');
        // Test

        return ref
          .orderByChild('latitude')
          .startAt(34.00867000999119)
          .endAt(34.17462960866099)
          .once('value')
          .then((snapshot) => {
            const val = snapshot.val();
            // Assertion
            val.foobar.should.eql(DatabaseContents.ISSUES[108].foobar);
            should.equal(Object.keys(val).length, 1);

            return Promise.resolve();
          });
      });

      it('return correct results when not using float values', async () => {
        // Setup

        const ref = firebase.native.database().ref('tests/issues/108');

        // Test

        return ref
          .orderByChild('latitude')
          .equalTo(37)
          .once('value')
          .then((snapshot) => {
            const val = snapshot.val();

            // Assertion

            val.notAFloat.should.eql(DatabaseContents.ISSUES[108].notAFloat);
            should.equal(Object.keys(val).length, 1);

            return Promise.resolve();
          });
      });
    });
  });

  describe('issue_171', () => {
    context('non array-like values should', () => {
      it('return as objects', async () => {
        // Setup

        const ref = firebase.native.database().ref('tests/issues/171');

        // Test

        return ref.once('value').then((snapshot) => {
          snapshot.val().should.eql(DatabaseContents.ISSUES[171]);
        });
      });
    });
  });
}

export default issueTests;
