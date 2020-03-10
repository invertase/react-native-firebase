describe('firestore()', () => {
  describe('Timestamp', () => {
    describe('now', () => {
      it('returns a new Timestamp instance', async () => {
        const nowDate = Date.now();
        const timestamp = firebase.firestore.Timestamp.now();
        timestamp.should.be.instanceOf(firebase.firestore.Timestamp);
        const asDate = timestamp.toDate().getTime();
        should.equal(nowDate <= asDate, true);
      });
    });

    describe('fromMillis', () => {
      it('returns a new Timestamp instance', async () => {
        const nowDate = Date.now();
        const timestamp = firebase.firestore.Timestamp.fromMillis(nowDate);
        timestamp.should.be.instanceOf(firebase.firestore.Timestamp);
        const asDate = timestamp.toDate().getTime();
        should.equal(nowDate === asDate, true);
      });
    });

    describe('fromDate', () => {
      it('returns a new Timestamp instance', async () => {
        const nowDate = new Date();
        const timestamp = firebase.firestore.Timestamp.fromDate(nowDate);
        timestamp.should.be.instanceOf(firebase.firestore.Timestamp);
        const asDate = timestamp.toMillis();
        should.equal(nowDate.getTime() === asDate, true);
      });
    });

    describe('isEqual', () => {
      it('returns true if two timestamps are equal', async () => {
        const nowDate = new Date();
        const timestamp1 = firebase.firestore.Timestamp.fromDate(nowDate);
        const timestamp2 = firebase.firestore.Timestamp.fromDate(nowDate);
        should.equal(timestamp1.isEqual(timestamp2), true);
      });

      it('returns false if two timestamps are not equal', async () => {
        const nowDate = new Date();
        const timestamp1 = firebase.firestore.Timestamp.fromDate(nowDate);
        const timestamp2 = firebase.firestore.Timestamp.fromMillis(
          Date.now() + 5000
        );
        should.equal(timestamp1.isEqual(timestamp2), false);
      });
    });

    describe('toString', () => {
      it('returns a string', async () => {
        const nowDate = new Date();
        const timestamp1 = firebase.firestore.Timestamp.fromDate(nowDate);
        timestamp1.toString().should.be.a.String();
      });
    });
  });
});
