import { describe, expect, it } from '@jest/globals';

import {
  aggregateFieldEqual,
  aggregateQuerySnapshotEqual,
  collection,
  count,
  getFirestore,
  query,
  sum,
  where,
} from '../lib';
import { AggregateField, AggregateQuerySnapshot } from '../lib/FirestoreAggregate';

describe('aggregate equality helpers', function () {
  const db = getFirestore();
  const coll = collection(db, 'aggregate-equal-test');
  const queryA = query(coll, where('author', '==', 'authorA'));
  const queryB = query(coll, where('author', '==', 'authorA'));
  const queryC = query(coll, where('author', '==', 'authorB'));

  describe('aggregateFieldEqual()', function () {
    it('returns true for matching aggregate fields', function () {
      expect(aggregateFieldEqual(count(), count())).toBe(true);
      expect(aggregateFieldEqual(sum('age'), sum('age'))).toBe(true);
    });

    it('returns false for different aggregate types or field paths', function () {
      expect(aggregateFieldEqual(count(), sum('age'))).toBe(false);
      expect(aggregateFieldEqual(sum('age'), sum('score'))).toBe(false);
      expect(aggregateFieldEqual(count(), {} as AggregateField<number>)).toBe(false);
    });
  });

  describe('aggregateQuerySnapshotEqual()', function () {
    it('returns true when queries and count data match', function () {
      const left = new AggregateQuerySnapshot(queryA, { count: 2 }, true);
      const right = new AggregateQuerySnapshot(queryA, { count: 2 }, true);
      const equivalentQuery = new AggregateQuerySnapshot(queryB, { count: 2 }, true);

      expect(aggregateQuerySnapshotEqual(left, right)).toBe(true);
      expect(aggregateQuerySnapshotEqual(left, equivalentQuery)).toBe(true);
    });

    it('returns false when aggregate data differs', function () {
      const left = new AggregateQuerySnapshot(queryA, { count: 2 }, true);
      const right = new AggregateQuerySnapshot(queryA, { count: 3 }, true);

      expect(aggregateQuerySnapshotEqual(left, right)).toBe(false);
    });

    it('returns false when underlying queries differ', function () {
      const left = new AggregateQuerySnapshot(queryA, { count: 2 }, true);
      const right = new AggregateQuerySnapshot(queryC, { count: 2 }, true);

      expect(aggregateQuerySnapshotEqual(left, right)).toBe(false);
    });

    it('compares aggregate spec data from getAggregateFromServer snapshots', function () {
      const left = new AggregateQuerySnapshot(
        queryA,
        { totalAge: 100, avgAge: 50, count: 2 },
        false,
      );
      const right = new AggregateQuerySnapshot(
        queryA,
        { totalAge: 100, avgAge: 50, count: 2 },
        false,
      );
      const different = new AggregateQuerySnapshot(
        queryA,
        { totalAge: 100, avgAge: null, count: 2 },
        false,
      );

      expect(aggregateQuerySnapshotEqual(left, right)).toBe(true);
      expect(aggregateQuerySnapshotEqual(left, different)).toBe(false);
    });

    it('returns false for non-AggregateQuerySnapshot arguments', function () {
      const snapshot = new AggregateQuerySnapshot(queryA, { count: 2 }, true);

      expect(aggregateQuerySnapshotEqual(snapshot, {} as AggregateQuerySnapshot)).toBe(false);
      expect(aggregateQuerySnapshotEqual({} as AggregateQuerySnapshot, snapshot)).toBe(false);
    });
  });
});
