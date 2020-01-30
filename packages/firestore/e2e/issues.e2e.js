/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

describe('firestore()', () => {
  describe('issue2854', () => {
    before(async () => {
      await Promise.all([
        firebase
          .firestore()
          .doc('issue2854/wbXwyLJheRfYXXWlY46j')
          .set({ index: 2, number: 2 }),
        firebase
          .firestore()
          .doc('issue2854/kGC5cYPN1nKnZCcAb9oQ')
          .set({ index: 6, number: 2 }),
        firebase
          .firestore()
          .doc('issue2854/8Ek8iWCDQPPJ5s2n8PiQ')
          .set({ index: 4, number: 2 }),
        firebase
          .firestore()
          .doc('issue2854/mr7MdAygvuheF6AUtWma')
          .set({ index: 1, number: 1 }),
        firebase
          .firestore()
          .doc('issue2854/RCO5SvNn4fdoE49OKrIV')
          .set({ index: 3, number: 1 }),
        firebase
          .firestore()
          .doc('issue2854/CvVG7VP1hXTtcfdUaeNl')
          .set({ index: 5, number: 1 }),
      ]);
    });

    it('returns all results', async () => {
      const db = firebase.firestore();
      const ref = db.collection('issue2854').orderBy('number', 'desc');
      const allResultsSnapshot = await ref.get();
      allResultsSnapshot.forEach((doc, i) => {
        if (i === 0) {
          doc.id.should.equal('wbXwyLJheRfYXXWlY46j');
        }
        if (i === 1) {
          doc.id.should.equal('kGC5cYPN1nKnZCcAb9oQ');
        }
        if (i === 2) {
          doc.id.should.equal('8Ek8iWCDQPPJ5s2n8PiQ');
        }
        if (i === 3) {
          doc.id.should.equal('mr7MdAygvuheF6AUtWma');
        }
        if (i === 4) {
          doc.id.should.equal('RCO5SvNn4fdoE49OKrIV');
        }
        if (i === 5) {
          doc.id.should.equal('CvVG7VP1hXTtcfdUaeNl');
        }
      });
    });

    it('returns first page', async () => {
      const db = firebase.firestore();
      const ref = db.collection('issue2854').orderBy('number', 'desc');
      const firstPageSnapshot = await ref.limit(2).get();
      should.equal(firstPageSnapshot.docs.length, 2);
      firstPageSnapshot.forEach((doc, i) => {
        if (i === 0) {
          doc.id.should.equal('wbXwyLJheRfYXXWlY46j');
        }
        if (i === 1) {
          doc.id.should.equal('kGC5cYPN1nKnZCcAb9oQ');
        }
      });
    });

    it('returns second page', async () => {
      const db = firebase.firestore();
      const ref = db.collection('issue2854').orderBy('number', 'desc');
      const firstPageSnapshot = await ref.limit(2).get();
      let lastDocument;
      firstPageSnapshot.forEach(doc => {
        lastDocument = doc;
      });

      const secondPageSnapshot = await ref
        .startAfter(lastDocument)
        .limit(2)
        .get();
      should.equal(secondPageSnapshot.docs.length, 2);
      secondPageSnapshot.forEach((doc, i) => {
        if (i === 0) {
          doc.id.should.equal('8Ek8iWCDQPPJ5s2n8PiQ');
        }
        if (i === 1) {
          doc.id.should.equal('mr7MdAygvuheF6AUtWma');
        }
      });
    });
  });
});
