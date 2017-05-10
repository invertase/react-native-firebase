import DatabaseContents from '../../support/DatabaseContents';

function childTests({ fdescribe, it, context, firebase }) {
  fdescribe('issue_100', () => {
    context('returned snapshot should match web API', () => {
      it('returns correct child ref', async () => {
        // Setup

        const ref = firebase.native.database().ref('tests/issues/100');

        // Test

        return ref.once('value').then((snapshot) => {
          // Assertion
          console.warn(JSON.stringify(snapshot.val()));

          snapshot.val().should.eql([null, DatabaseContents.ISSUES[100][1], DatabaseContents.ISSUES[100][2], DatabaseContents.ISSUES[100][3]]);
        });
      });
    });
  });
}

export default childTests;
