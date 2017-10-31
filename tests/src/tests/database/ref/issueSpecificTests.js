import should from 'should';
import sinon from 'sinon';
import 'should-sinon';
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

  describe('issue_489', () => {
    context('long numbers should', () => {
      it('return as longs', async () => {
        // Setup

        const long1Ref = firebase.native.database().ref('tests/issues/489/long1');
        const long2Ref = firebase.native.database().ref('tests/issues/489/long2');
        const long2 = 1234567890123456;

        // Test

        let snapshot = await long1Ref.once('value');
        snapshot.val().should.eql(DatabaseContents.ISSUES[489].long1);


        await long2Ref.set(long2);
        snapshot = await long2Ref.once('value');
        snapshot.val().should.eql(long2);

        return Promise.resolve();
      });
    });
  });

  describe('issue_521', () => {
    context('orderByChild (numerical field) and limitToLast', () => {
      it('once() returns correct results', async () => {
        // Setup

        const ref = firebase.native.database().ref('tests/issues/521');
        // Test

        return ref
          .orderByChild('number')
          .limitToLast(1)
          .once('value')
          .then((snapshot) => {
            const val = snapshot.val();
            // Assertion
            val.key3.should.eql(DatabaseContents.ISSUES[521].key3);
            should.equal(Object.keys(val).length, 1);

            return Promise.resolve();
          });
      });

      it('on() returns correct initial results', async () => {
        // Setup

        const ref = firebase.native.database().ref('tests/issues/521').orderByChild('number').limitToLast(2);
        const callback = sinon.spy();

        // Test

        await new Promise((resolve) => {
          ref.on('value', (snapshot) => {
            callback(snapshot.val());
            resolve();
          });
        });

        callback.should.be.calledWith({
          key2: DatabaseContents.ISSUES[521].key2,
          key3: DatabaseContents.ISSUES[521].key3,
        });
        callback.should.be.calledOnce();

        return Promise.resolve();
      });

      it('on() returns correct subsequent results', async () => {
        // Setup

        const ref = firebase.native.database().ref('tests/issues/521').orderByChild('number').limitToLast(2);
        const callback = sinon.spy();

        // Test

        await new Promise((resolve) => {
          ref.on('value', (snapshot) => {
            callback(snapshot.val());
            resolve();
          });
        });

        callback.should.be.calledWith({
          key2: DatabaseContents.ISSUES[521].key2,
          key3: DatabaseContents.ISSUES[521].key3,
        });
        callback.should.be.calledOnce();

        const newDataValue = {
          name: 'Item 4',
          number: 4,
          string: 'item4',
        };
        const newRef = firebase.native.database().ref('tests/issues/521/key4');
        await newRef.set(newDataValue);

        await new Promise((resolve) => {
          setTimeout(() => resolve(), 5);
        });

        // Assertions

        callback.should.be.calledWith({
          key3: DatabaseContents.ISSUES[521].key3,
          key4: newDataValue,
        });
        callback.should.be.calledTwice();

        return Promise.resolve();
      });
    });

    context('orderByChild (string field) and limitToLast', () => {
      it('once() returns correct results', async () => {
        // Setup

        const ref = firebase.native.database().ref('tests/issues/521');
        // Test

        return ref
          .orderByChild('string')
          .limitToLast(1)
          .once('value')
          .then((snapshot) => {
            const val = snapshot.val();
            // Assertion
            val.key3.should.eql(DatabaseContents.ISSUES[521].key3);
            should.equal(Object.keys(val).length, 1);

            return Promise.resolve();
          });
      });

      it('on() returns correct initial results', async () => {
        // Setup

        const ref = firebase.native.database().ref('tests/issues/521').orderByChild('string').limitToLast(2);
        const callback = sinon.spy();

        // Test

        await new Promise((resolve) => {
          ref.on('value', (snapshot) => {
            callback(snapshot.val());
            resolve();
          });
        });

        callback.should.be.calledWith({
          key2: DatabaseContents.ISSUES[521].key2,
          key3: DatabaseContents.ISSUES[521].key3,
        });
        callback.should.be.calledOnce();

        return Promise.resolve();
      });

      it('on() returns correct subsequent results', async () => {
        // Setup

        const ref = firebase.native.database().ref('tests/issues/521').orderByChild('string').limitToLast(2);
        const callback = sinon.spy();

        // Test

        await new Promise((resolve) => {
          ref.on('value', (snapshot) => {
            callback(snapshot.val());
            resolve();
          });
        });

        callback.should.be.calledWith({
          key2: DatabaseContents.ISSUES[521].key2,
          key3: DatabaseContents.ISSUES[521].key3,
        });
        callback.should.be.calledOnce();

        const newDataValue = {
          name: 'Item 4',
          number: 4,
          string: 'item4',
        };
        const newRef = firebase.native.database().ref('tests/issues/521/key4');
        await newRef.set(newDataValue);

        await new Promise((resolve) => {
          setTimeout(() => resolve(), 5);
        });

        // Assertions

        callback.should.be.calledWith({
          key3: DatabaseContents.ISSUES[521].key3,
          key4: newDataValue,
        });
        callback.should.be.calledTwice();

        return Promise.resolve();
      });
    });
  });
}

export default issueTests;
