const { CONTENTS, setDatabaseContents } = TestHelpers.database;

describe('database()', () => {
  beforeEach(() => setDatabaseContents());

  describe('issue_100', () => {
    describe('array-like values should', () => {
      it('return null in returned array at positions where a key is missing', async () => {
        const ref = firebase.database().ref('tests/issues/100');

        const snapshot = await ref.once('value');

        snapshot
          .val()
          .should.eql(
            jet.contextify([
              null,
              jet.contextify(CONTENTS.ISSUES[100][1]),
              jet.contextify(CONTENTS.ISSUES[100][2]),
              jet.contextify(CONTENTS.ISSUES[100][3]),
            ])
          );
      });
    });
  });

  describe('issue_108', () => {
    describe('filters using floats', () => {
      it('return correct results', async () => {
        const ref = firebase.database().ref('tests/issues/108');

        const snapshot = await ref
          .orderByChild('latitude')
          .startAt(34.00867000999119)
          .endAt(34.17462960866099)
          .once('value');

        const val = snapshot.val();

        val.foobar.should.eql(jet.contextify(CONTENTS.ISSUES[108].foobar));
        should.equal(Object.keys(val).length, 1);
      });

      it('return correct results when not using float values', async () => {
        const ref = firebase.database().ref('tests/issues/108');

        const snapshot = await ref
          .orderByChild('latitude')
          .equalTo(37)
          .once('value');

        const val = snapshot.val();

        val.notAFloat.should.eql(
          jet.contextify(CONTENTS.ISSUES[108].notAFloat)
        );

        should.equal(Object.keys(val).length, 1);
      });
    });
  });

  xdescribe('issue_171', () => {
    describe('non array-like values should', () => {
      it('return as objects', async () => {
        const ref = firebase.database().ref('tests/issues/171');
        const snapshot = await ref.once('value');

        snapshot.val().should.eql(jet.contextify(CONTENTS.ISSUES[171]));
      });
    });
  });

  describe('issue_489', () => {
    describe('long numbers should', () => {
      it('return as longs', async () => {
        const long1Ref = firebase.database().ref('tests/issues/489/long1');
        const long2Ref = firebase.database().ref('tests/issues/489/long2');
        const long2 = 1234567890123456;

        let snapshot = await long1Ref.once('value');
        snapshot.val().should.eql(CONTENTS.ISSUES[489].long1);

        await long2Ref.set(long2);
        snapshot = await long2Ref.once('value');
        snapshot.val().should.eql(long2);
      });
    });
  });

  describe('issue_521', () => {
    describe('orderByChild (numerical field) and limitToLast', () => {
      it('once() returns correct results', async () => {
        const ref = firebase.database().ref('tests/issues/521');

        const snapshot = await ref
          .orderByChild('number')
          .limitToLast(1)
          .once('value');

        const val = snapshot.val();

        val.key3.should.eql(jet.contextify(CONTENTS.ISSUES[521].key3));
        should.equal(Object.keys(val).length, 1);
      });

      it('on() returns correct initial results', async () => {
        const ref = firebase
          .database()
          .ref('tests/issues/521')
          .orderByChild('number')
          .limitToLast(2);

        const callback = sinon.spy();

        await new Promise(resolve => {
          ref.on('value', snapshot => {
            callback(snapshot.val());
            resolve();
          });
        });

        callback.should.be.calledWith({
          key2: CONTENTS.ISSUES[521].key2,
          key3: CONTENTS.ISSUES[521].key3,
        });

        callback.should.be.calledOnce();
      });

      it('on() returns correct subsequent results', async () => {
        const ref = firebase
          .database()
          .ref('tests/issues/521')
          .orderByChild('number')
          .limitToLast(2);

        const callback = sinon.spy();

        await new Promise(resolve => {
          ref.on('value', snapshot => {
            callback(snapshot.val());
            resolve();
          });
        });

        callback.should.be.calledWith({
          key2: CONTENTS.ISSUES[521].key2,
          key3: CONTENTS.ISSUES[521].key3,
        });

        callback.should.be.calledOnce();

        const newDataValue = {
          name: 'Item 4',
          number: 4,
          string: 'item4',
        };

        const newRef = firebase.database().ref('tests/issues/521/key4');

        await newRef.set(newDataValue);
        await sleep(5);

        callback.should.be.calledWith({
          key3: CONTENTS.ISSUES[521].key3,
          key4: newDataValue,
        });

        callback.should.be.calledTwice();
      });
    });

    describe('orderByChild (string field) and limitToLast', () => {
      it('once() returns correct results', async () => {
        const ref = firebase.database().ref('tests/issues/521');

        const snapshot = await ref
          .orderByChild('string')
          .limitToLast(1)
          .once('value');

        const val = snapshot.val();

        val.key3.should.eql(jet.contextify(CONTENTS.ISSUES[521].key3));
        should.equal(Object.keys(val).length, 1);
      });

      it('on() returns correct initial results', async () => {
        const ref = firebase
          .database()
          .ref('tests/issues/521')
          .orderByChild('string')
          .limitToLast(2);

        const callback = sinon.spy();

        await new Promise(resolve => {
          ref.on('value', snapshot => {
            callback(snapshot.val());
            resolve();
          });
        });

        callback.should.be.calledWith({
          key2: CONTENTS.ISSUES[521].key2,
          key3: CONTENTS.ISSUES[521].key3,
        });

        callback.should.be.calledOnce();
      });

      it('on() returns correct subsequent results', async () => {
        const ref = firebase
          .database()
          .ref('tests/issues/521')
          .orderByChild('string')
          .limitToLast(2);

        const callback = sinon.spy();

        await new Promise(resolve => {
          ref.on('value', snapshot => {
            callback(snapshot.val());
            resolve();
          });
        });

        callback.should.be.calledWith({
          key2: CONTENTS.ISSUES[521].key2,
          key3: CONTENTS.ISSUES[521].key3,
        });

        callback.should.be.calledOnce();

        const newDataValue = {
          name: 'Item 4',
          number: 4,
          string: 'item4',
        };

        const newRef = firebase.database().ref('tests/issues/521/key4');
        await newRef.set(newDataValue);
        await sleep(5);

        callback.should.be.calledWith({
          key3: CONTENTS.ISSUES[521].key3,
          key4: newDataValue,
        });

        callback.should.be.calledTwice();
      });
    });
  });

  describe('issue_679', () => {
    describe('path from snapshot reference', () => {
      xit('should match web SDK', async () => {
        const nativeRef = firebase.database().ref('tests/issues/679');
        const webRef = firebaseAdmin.database().ref('tests/issues/679');
        const nativeRef2 = firebase.database().ref('tests/issues/679/');
        const webRef2 = firebaseAdmin.database().ref('tests/issues/679/');

        webRef.toString().should.equal(nativeRef.toString());
        webRef2.toString().should.equal(nativeRef2.toString());
      });

      xit('should be correct when returned from native', async () => {
        const nativeRef = firebase.database().ref('tests/issues/679/');
        const webRef = firebaseAdmin.database().ref('tests/issues/679/');

        const nativeSnapshot = await nativeRef.once('value');
        const webSnapshot = await webRef.once('value');

        webSnapshot.ref.toString().should.equal(nativeSnapshot.ref.toString());
      });
    });
  });
});
