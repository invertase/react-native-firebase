export default function addTests({ tryCatch, describe, it, firebase }) {
  describe('Snapshot', () => {
    it('should provide a functioning val() method', () => {
      return new Promise((resolve, reject) => {
        const successCb = tryCatch((snapshot) => {
          snapshot.val.should.be.a.Function();
          snapshot.val().should.eql([
            0, 1, 2, 3, 4, 5, 6, 7, 8, 9,
          ]);
          resolve();
        }, reject);

        firebase.native.database().ref('tests/types/array').once('value', successCb, reject);
      });
    });

    it('should provide a functioning child() method', () => {
      return new Promise((resolve, reject) => {
        const successCb = tryCatch((snapshot) => {
          snapshot.child('0').val.should.be.a.Function();
          snapshot.child('0').val().should.equal(0);
          snapshot.child('0').key.should.be.a.String();
          snapshot.child('0').key.should.equal('0');
          resolve();
        }, reject);

        firebase.native.database().ref('tests/types/array').once('value', successCb, reject);
      });
    });

    it('should provide a functioning hasChild() method', () => {
      return new Promise((resolve, reject) => {
        const successCb = tryCatch((snapshot) => {
          snapshot.hasChild.should.be.a.Function();
          snapshot.hasChild('foo').should.equal(true);
          snapshot.hasChild('baz').should.equal(false);
          resolve();
        }, reject);

        firebase.native.database().ref('tests/types/object').once('value', successCb, reject);
      });
    });

    it('should provide a functioning hasChildren() method', () => {
      return new Promise((resolve, reject) => {
        const successCb = tryCatch((snapshot) => {
          snapshot.hasChildren.should.be.a.Function();
          snapshot.hasChildren().should.equal(true);
          snapshot.child('foo').hasChildren().should.equal(false);
          resolve();
        }, reject);

        firebase.native.database().ref('tests/types/object').once('value', successCb, reject);
      });
    });

    it('should provide a functioning exists() method', () => {
      return new Promise((resolve, reject) => {
        const successCb = tryCatch((snapshot) => {
          snapshot.exists.should.be.a.Function();
          snapshot.exists().should.equal(false);
          resolve();
        }, reject);

        firebase.native.database().ref('tests/types/object/baz/daz').once('value', successCb, reject);
      });
    });

    it('should provide a functioning getPriority() method', () => {
      return new Promise((resolve, reject) => {
        const successCb = tryCatch((snapshot) => {
          snapshot.getPriority.should.be.a.Function();
          snapshot.getPriority().should.equal(666);
          snapshot.val().should.eql({ foo: 'bar' });
          resolve();
        }, reject);

        const ref = firebase.native.database().ref('tests/priority');
        ref.once('value', successCb, reject);
      });
    });

    it('should provide a functioning forEach() method', () => {
      // TODO this doesn't really test that the key order returned is in correct order
      return new Promise((resolve, reject) => {
        const successCb = tryCatch((snapshot) => {
          let total = 0;
          snapshot.forEach.should.be.a.Function();
          snapshot.forEach((childSnapshot) => {
            const val = childSnapshot.val();
            total = total + val;
            return val === 3; // stop iteration after key 3
          });

          total.should.equal(6); // 0 + 1 + 2 + 3 = 6
          resolve();
        }, reject);

        firebase.native.database().ref('tests/types/array').once('value', successCb, reject);
      });
    });

    it('should provide a key property', () => {
      return new Promise((resolve, reject) => {
        const successCb = tryCatch((snapshot) => {
          snapshot.key.should.be.a.String();
          snapshot.key.should.equal('array');
          resolve();
        }, reject);

        firebase.native.database().ref('tests/types/array').once('value', successCb, reject);
      });
    });
  });

}
