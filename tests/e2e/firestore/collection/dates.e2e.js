const { TEST_COLLECTION_NAME_DYNAMIC } = TestHelpers.firestore;

/**
 *
 * @returns {Array}
 */
function documents() {
  const out = [
    {
      index: -1,
      indexStr: '-1',
      // https://github.com/invertase/react-native-firebase/issues/1552
      timestamp: null,
    },
  ];

  for (let i = 0; i < 12; i++) {
    const date = new jet.context.window.Date(2017, i, i + 1, i, i * 3, i * 4);
    out.push({
      index: i,
      indexStr: i.toString(),
      timestamp: date,
    });
  }

  for (let i = 0; i < 12; i++) {
    const date = new jet.context.window.Date(2018, i, i + 1, i, i * 3, i * 4);
    out.push({
      index: i + 12,
      indexStr: (i + 12).toString(),
      timestamp: date,
    });
  }

  for (let i = 0; i < 12; i++) {
    const date = new jet.context.window.Date(
      new Date().getFullYear(),
      i,
      i + 1,
      i,
      i * 3,
      i * 4
    );

    out.push({
      index: i + 24,
      indexStr: (i + 24).toString(),
      timestamp: date,
    });
  }

  out.push({
    index: 1337,
    indexStr: '1337',
    // https://github.com/invertase/react-native-firebase/issues/1552
    timestamp: null,
  });

  return out;
}

describe('firestore()', () => {
  xdescribe('CollectionReference', () => {
    before(async () => {
      const firestore = firebaseAdmin.firestore();
      const collection = firestore.collection(TEST_COLLECTION_NAME_DYNAMIC);

      const docsToAdd = documents();
      const batch = firestore.batch();
      const docsToDelete = (await collection.get()).docs;

      if (docsToDelete.length) {
        for (let i = 0, len = docsToDelete.length; i < len; i++) {
          const { ref } = docsToDelete[i];
          batch.delete(ref);
        }
      }

      for (let i = 0; i < docsToAdd.length; i++) {
        batch.set(collection.doc(), docsToAdd[i]);
      }

      return batch.commit();
    });

    describe('where() -> Date Filters', () => {
      it('==', async () => {
        // index4 - 2017-05-05T03:12:16.000Z
        const date2017 = new jet.context.window.Date(2017, 4, 5, 4, 12, 16);

        const snapshot = await firebase
          .firestore()
          .collection(TEST_COLLECTION_NAME_DYNAMIC)
          .where('timestamp', '==', date2017)
          .get();

        const { docs } = snapshot;

        should.equal(snapshot.size, 1);

        for (let i = 0; i < docs.length; i++) {
          const { index, indexStr, timestamp } = docs[i].data();
          should.equal(timestamp.getTime() === date2017.getTime(), true);
          should.equal(i + 4, index);
          indexStr.should.equal(`${i + 4}`);
        }
      });

      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------

      it('>=', async () => {
        // index4 - 2017-05-05T03:12:16.000Z
        const date2017 = new jet.context.window.Date(2017, 4, 5, 4, 12, 16);

        const snapshot = await firebase
          .firestore()
          .collection(TEST_COLLECTION_NAME_DYNAMIC)
          .where('timestamp', '>=', date2017)
          .orderBy('timestamp')
          .get();

        const { docs } = snapshot;

        // 3 years (36 months), skipping 4 months, 36 - 4 = 32;
        should.equal(snapshot.size, 32);

        for (let i = 0; i < docs.length; i++) {
          const { index, indexStr, timestamp } = docs[i].data();
          // validate first snapshot date - it should be exactly the same date
          if (i === 0)
            should.equal(timestamp.getTime() === date2017.getTime(), true);

          should.equal(timestamp.getTime() >= date2017.getTime(), true);
          should.equal(i + 4, index);
          indexStr.should.equal(`${i + 4}`);
        }
      });

      it('<=', async () => {
        // index4 - 2017-05-05T03:12:16.000Z
        const date2017 = new jet.context.window.Date(2017, 4, 5, 4, 12, 16);

        const snapshot = await firebase
          .firestore()
          .collection(TEST_COLLECTION_NAME_DYNAMIC)
          .where('timestamp', '<=', date2017)
          .orderBy('timestamp')
          .get();

        const { docs } = snapshot;

        should.equal(snapshot.size, 5);

        for (let i = 0; i < docs.length; i++) {
          const { index, indexStr, timestamp } = docs[i].data();
          // validate last snapshot date - it should be exactly the same date
          if (docs.length - 1 === i) {
            should.equal(timestamp.getTime() === date2017.getTime(), true);
          }

          should.equal(timestamp.getTime() <= date2017.getTime(), true);
          should.equal(i, index);
          indexStr.should.equal(`${i}`);
        }
      });

      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------

      it('>= & <=', async () => {
        // index4 - 2017-05-05T03:12:16.000Z
        const date2017 = new jet.context.window.Date(2017, 4, 5, 4, 12, 16);
        // index4 - 2018-05-05T03:12:16.000Z
        const date2018 = new jet.context.window.Date(2018, 4, 5, 4, 12, 16);

        const snapshot = await firebase
          .firestore()
          .collection(TEST_COLLECTION_NAME_DYNAMIC)
          .where('timestamp', '>=', date2017)
          .where('timestamp', '<=', date2018)
          .orderBy('timestamp')
          .get();

        const { docs } = snapshot;

        should.equal(snapshot.size, 13);

        for (let i = 0; i < docs.length; i++) {
          const { index, indexStr, timestamp } = docs[i].data();
          // validate first snapshot date - it should be exactly the same as date2017
          if (i === 0)
            should.equal(timestamp.getTime() === date2017.getTime(), true);
          // validate last snapshot date - it should be exactly the same as date2018
          if (i === docs.length - 1)
            should.equal(timestamp.getTime() === date2018.getTime(), true);

          should.equal(timestamp.getTime() >= date2017.getTime(), true);
          should.equal(timestamp.getTime() <= date2018.getTime(), true);
          should.equal(i + 4, index);
          indexStr.should.equal(`${i + 4}`);
        }
      });

      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------

      it('>', async () => {
        // index4 - 2017-05-05T03:12:16.000Z
        const date2017 = new jet.context.window.Date(2017, 4, 5, 4, 12, 16);

        const snapshot = await firebase
          .firestore()
          .collection(TEST_COLLECTION_NAME_DYNAMIC)
          .where('timestamp', '>', date2017)
          .orderBy('timestamp')
          .get();

        const { docs } = snapshot;

        // 3 years (36 months), skipping 4 months, 36 - 4 = 32;
        should.equal(snapshot.size, 31); // minus one as not including equality on date filter

        for (let i = 0; i < docs.length; i++) {
          const { index, indexStr, timestamp } = docs[i].data();
          // validate first snapshot date - it should NOT be exactly the same date
          if (i === 0)
            should.equal(timestamp.getTime() !== date2017.getTime(), true);

          should.equal(timestamp.getTime() > date2017.getTime(), true);
          should.equal(i + 5, index);
          indexStr.should.equal(`${i + 5}`);
        }
      });

      it('<', async () => {
        // index4 - 2017-05-05T03:12:16.000Z
        const date2017 = new jet.context.window.Date(2017, 4, 5, 4, 12, 16);

        const snapshot = await firebase
          .firestore()
          .collection(TEST_COLLECTION_NAME_DYNAMIC)
          .where('timestamp', '<', date2017)
          .orderBy('timestamp')
          .get();

        const { docs } = snapshot;

        should.equal(snapshot.size, 4); // minus one as not including equality on date filter

        for (let i = 0; i < docs.length; i++) {
          const { index, indexStr, timestamp } = docs[i].data();
          // validate first snapshot date - it should NOT be exactly the same date
          if (i === 0)
            should.equal(timestamp.getTime() !== date2017.getTime(), true);

          should.equal(timestamp.getTime() < date2017.getTime(), true);
          should.equal(i, index);
          indexStr.should.equal(`${i}`);
        }
      });

      it('> & <', async () => {
        // index4 - 2017-05-05T03:12:16.000Z
        const date2017 = new jet.context.window.Date(2017, 4, 5, 4, 12, 16);
        // index4 - 2018-05-05T03:12:16.000Z
        const date2018 = new jet.context.window.Date(2018, 4, 5, 4, 12, 16);

        const snapshot = await firebase
          .firestore()
          .collection(TEST_COLLECTION_NAME_DYNAMIC)
          .where('timestamp', '>', date2017)
          .where('timestamp', '<', date2018)
          .orderBy('timestamp')
          .get();

        const { docs } = snapshot;

        should.equal(snapshot.size, 11); // minus two as not including equality on date filters

        for (let i = 0; i < docs.length; i++) {
          const { index, indexStr, timestamp } = docs[i].data();
          // validate first snapshot date - it should NOT be exactly the same as date2017
          if (i === 0)
            should.equal(timestamp.getTime() !== date2017.getTime(), true);
          // validate last snapshot date - it should NOT be exactly the same as date2018
          if (i === docs.length - 1)
            should.equal(timestamp.getTime() !== date2018.getTime(), true);

          should.equal(timestamp.getTime() > date2017.getTime(), true);
          should.equal(timestamp.getTime() < date2018.getTime(), true);
          should.equal(i + 5, index);
          indexStr.should.equal(`${i + 5}`);
        }
      });

      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------
      // ------------------------------------------------------------

      it('> & <=', async () => {
        // index4 - 2017-05-05T03:12:16.000Z
        const date2017 = new jet.context.window.Date(2017, 4, 5, 4, 12, 16);
        // index4 - 2018-05-05T03:12:16.000Z
        const date2018 = new jet.context.window.Date(2018, 4, 5, 4, 12, 16);

        const snapshot = await firebase
          .firestore()
          .collection(TEST_COLLECTION_NAME_DYNAMIC)
          .where('timestamp', '>', date2017)
          .where('timestamp', '<=', date2018)
          .orderBy('timestamp')
          .get();

        const { docs } = snapshot;

        should.equal(snapshot.size, 12); // minus one as not including equality on date2017 filter

        for (let i = 0; i < docs.length; i++) {
          const { index, indexStr, timestamp } = docs[i].data();
          // validate first snapshot date - it should NOT be exactly the same as date2017
          if (i === 0)
            should.equal(timestamp.getTime() !== date2017.getTime(), true);
          // validate last snapshot date - it should be exactly the same as date2018
          if (i === docs.length - 1)
            should.equal(timestamp.getTime() === date2018.getTime(), true);

          should.equal(timestamp.getTime() > date2017.getTime(), true);
          should.equal(timestamp.getTime() <= date2018.getTime(), true);
          should.equal(i + 5, index);
          indexStr.should.equal(`${i + 5}`);
        }
      });

      it('>= & <', async () => {
        // index4 - 2017-05-05T03:12:16.000Z
        const date2017 = new jet.context.window.Date(2017, 4, 5, 4, 12, 16);
        // index4 - 2018-05-05T03:12:16.000Z
        const date2018 = new jet.context.window.Date(2018, 4, 5, 4, 12, 16);

        const snapshot = await firebase
          .firestore()
          .collection(TEST_COLLECTION_NAME_DYNAMIC)
          .where('timestamp', '>=', date2017)
          .where('timestamp', '<', date2018)
          .orderBy('timestamp')
          .get();

        const { docs } = snapshot;

        should.equal(snapshot.size, 12); // minus one as not including equality on date2018 filters

        for (let i = 0; i < docs.length; i++) {
          const { index, indexStr, timestamp } = docs[i].data();
          // validate first snapshot date - it should be exactly the same as date2017
          if (i === 0)
            should.equal(timestamp.getTime() === date2017.getTime(), true);
          // validate last snapshot date - it should NOT be exactly the same as date2018
          if (i === docs.length - 1)
            should.equal(timestamp.getTime() !== date2018.getTime(), true);

          should.equal(timestamp.getTime() >= date2017.getTime(), true);
          should.equal(timestamp.getTime() < date2018.getTime(), true);
          should.equal(i + 4, index);
          indexStr.should.equal(`${i + 4}`);
        }
      });
    });
  });
});
