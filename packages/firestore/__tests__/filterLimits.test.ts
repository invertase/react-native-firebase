import { describe, expect, it } from '@jest/globals';

import { and, collection, Filter, getFirestore, or, query, where } from '../lib';

const COLLECTION = 'filter-limits';

function values(length: number): number[] {
  return Array.from({ length }, (_, i) => i + 1);
}

function filters(length: number) {
  return Array.from({ length }, (_, i) => Filter(`field${i}`, '==', i));
}

function constraints(length: number) {
  return Array.from({ length }, (_, i) => where(`field${i}`, '==', i));
}

function ref() {
  return collection(getFirestore(), COLLECTION);
}

function namespacedRef(): any {
  return (getFirestore() as any).collection(COLLECTION);
}

describe('Firestore filter limits', function () {
  describe.each(['in', 'array-contains-any'] as const)("'%s' value array", function (op) {
    const message = `'${op}' filters support a maximum of 30 elements in the value array.`;

    it('allows 11 and 30 values and rejects 31 (modular where)', function () {
      expect(() => query(ref(), where('foo', op, values(11)))).not.toThrow();
      expect(() => query(ref(), where('foo', op, values(30)))).not.toThrow();
      expect(() => query(ref(), where('foo', op, values(31)))).toThrow(
        `firebase.firestore().collection().where(_, _, *) 'value' is invalid. ${message}`,
      );
    });

    it('allows 11 and 30 values and rejects 31 (namespaced where)', function () {
      expect(() => namespacedRef().where('foo', op, values(11))).not.toThrow();
      expect(() => namespacedRef().where('foo', op, values(30))).not.toThrow();
      expect(() => namespacedRef().where('foo', op, values(31))).toThrow(message);
    });

    it('allows 11 and 30 values and rejects 31 (modular and())', function () {
      const build = (n: number) =>
        query(ref(), and(where('foo', op, values(n)), where('bar', '==', 1)));
      expect(() => build(11)).not.toThrow();
      expect(() => build(30)).not.toThrow();
      expect(() => build(31)).toThrow(
        `third argument of Filter(*,_ , _) 'value' is invalid. ${message}`,
      );
    });

    it('allows 11 and 29 values and rejects 31 (modular or())', function () {
      const build = (n: number) =>
        query(ref(), or(where('foo', op, values(n)), where('bar', '==', 1)));
      expect(() => build(11)).not.toThrow();
      expect(() => build(29)).not.toThrow();
      expect(() => build(31)).toThrow(message);
    });

    it('rejects 31 values nested in or(and())', function () {
      expect(() =>
        query(
          ref(),
          or(and(where('foo', op, values(31)), where('bar', '==', 1)), where('baz', '==', 2)),
        ),
      ).toThrow(message);
    });

    it('allows 30 values and rejects 31 (Filter.and via where)', function () {
      const build = (n: number) =>
        namespacedRef().where(Filter.and(Filter('foo', op, values(n)), Filter('bar', '==', 1)));
      expect(() => build(30)).not.toThrow();
      expect(() => build(31)).toThrow(message);
    });

    it('allows 29 values and rejects 31 (Filter.or via where)', function () {
      const build = (n: number) =>
        namespacedRef().where(Filter.or(Filter('foo', op, values(n)), Filter('bar', '==', 1)));
      expect(() => build(29)).not.toThrow();
      expect(() => build(31)).toThrow(message);
    });
  });

  describe("'not-in' value array", function () {
    const message = "'not-in' filters support a maximum of 10 elements in the value array.";

    it('allows 10 values and rejects 11 (modular where)', function () {
      expect(() => query(ref(), where('foo', 'not-in', values(10)))).not.toThrow();
      expect(() => query(ref(), where('foo', 'not-in', values(11)))).toThrow(
        `firebase.firestore().collection().where(_, _, *) 'value' is invalid. ${message}`,
      );
    });

    it('allows 10 values and rejects 11 (namespaced where)', function () {
      expect(() => namespacedRef().where('foo', 'not-in', values(10))).not.toThrow();
      expect(() => namespacedRef().where('foo', 'not-in', values(11))).toThrow(message);
    });

    it('allows 10 values and rejects 11 (modular where(Filter))', function () {
      expect(() => query(ref(), (where as any)(Filter('foo', 'not-in', values(10))))).not.toThrow();
      expect(() => query(ref(), (where as any)(Filter('foo', 'not-in', values(11))))).toThrow(
        message,
      );
    });

    it('allows 10 values and rejects 11 (modular and())', function () {
      const build = (n: number) =>
        query(ref(), and(where('foo', 'not-in', values(n)), where('bar', '==', 1)));
      expect(() => build(10)).not.toThrow();
      expect(() => build(11)).toThrow(
        `third argument of Filter(*,_ , _) 'value' is invalid. ${message}`,
      );
    });

    it('rejects 11 values nested in or(and())', function () {
      expect(() =>
        query(
          ref(),
          or(and(where('foo', 'not-in', values(11)), where('bar', '==', 1)), where('baz', '==', 2)),
        ),
      ).toThrow(message);
    });
  });

  describe('composite filter count', function () {
    const message = (n: number) => `Expected 1-30 instances of Filter, but got ${n} Filters`;

    it.each([
      ['Filter.and', Filter.and],
      ['Filter.or', Filter.or],
    ] as const)('%s allows 11 and 30 filters and rejects 31 and 0', function (_name, fn) {
      expect(() => fn(...filters(11))).not.toThrow();
      expect(() => fn(...filters(30))).not.toThrow();
      expect(() => fn(...filters(31))).toThrow(message(31));
      expect(() => fn()).toThrow(message(0));
    });

    it.each([
      ['and', and],
      ['or', or],
    ] as const)('modular %s() allows 11 and 30 constraints and rejects 31', function (_name, fn) {
      expect(() => query(ref(), fn(...constraints(11)))).not.toThrow();
      expect(() => query(ref(), fn(...constraints(30)))).not.toThrow();
      expect(() => query(ref(), fn(...constraints(31)))).toThrow(message(31));
    });
  });
});
