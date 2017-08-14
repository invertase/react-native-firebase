import Promise from 'bluebird';

function onTests({ describe, it, firebase, tryCatch }) {
  describe('ref.transaction()', () => {
    it('increments a value on a ref', () => {
      return new Promise((resolve, reject) => {
        let valueBefore = 1;

        firebase.native.database()
          .ref('tests/transaction').transaction((currentData) => {
          if (currentData === null) {
            return valueBefore + 10;
          }
          valueBefore = currentData;
          return valueBefore + 10;
        }, tryCatch((error, committed, snapshot) => {
          if (error) {
            return reject(error);
          }

          if (!committed) {
            return reject(new Error('Transaction did not commit.'));
          }

          snapshot.val().should.equal(valueBefore + 10);

          return resolve();
        }, reject), true);
      });
    });

    it('aborts if undefined returned', () => {
      return new Promise((resolve, reject) => {
        firebase.native.database()
          .ref('tests/transaction').transaction(() => {
          return undefined;
        }, (error, committed) => {
          if (error) {
            return reject(error);
          }

          if (!committed) {
            return resolve();
          }

          return reject(new Error('Transaction did not abort commit.'));
        }, true);
      });
    });
  });
}

export default onTests;
