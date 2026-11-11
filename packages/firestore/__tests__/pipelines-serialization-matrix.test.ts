import { describe, expect, it } from '@jest/globals';
import { getFirestore, Timestamp } from '../lib';
import {
  constant,
  field,
  greaterThan,
  parent,
  timestampDiff,
  timestampExtract,
} from '../lib/pipelines';
import type { ConstantExpression } from '../lib/pipelines/expressions';
import '../lib/pipelines';

/** Standalone firebase-js-sdk helpers that must not get fluent `.name()` chains. */
const STANDALONE_ONLY_EXPRESSIONS = ['timestampDiff', 'switchOn'] as const;

function selectExpr(db: any, expr: unknown) {
  return db.pipeline().collection('events').select(expr).serialize().stages[0].options.selections[0]
    .expr;
}

describe('pipelines serialization matrix', function () {
  describe('parent document path serialization', function () {
    const db: any = getFirestore();

    it('serializes string document paths as constant parent args', function () {
      expect(selectExpr(db, parent('users/alice/posts/post1').as('parentRef'))).toMatchObject({
        exprType: 'Function',
        name: 'parent',
        args: [{ exprType: 'Constant', value: 'users/alice/posts/post1' }],
      });
    });

    it('serializes constant-wrapped string document paths for parent args', function () {
      const wrapped = constant('users/alice/posts/post1') as ConstantExpression;
      expect(selectExpr(db, parent(wrapped).as('parentRef'))).toMatchObject({
        exprType: 'Function',
        name: 'parent',
        args: [{ exprType: 'Constant', value: 'users/alice/posts/post1' }],
      });
    });
    it('serializes DocumentReference document paths as path constant parent args', function () {
      const ref = db.doc('users/alice/posts/post1');
      expect(selectExpr(db, parent(ref).as('parentRef'))).toMatchObject({
        exprType: 'Function',
        name: 'parent',
        args: [{ exprType: 'Constant', value: { path: 'users/alice/posts/post1' } }],
      });
    });

    it('serializes constant-wrapped reference path maps for parent args', function () {
      const wrapped = constant({ path: 'users/alice/posts/post1' }) as ConstantExpression;
      expect(selectExpr(db, parent(wrapped).as('parentRef'))).toMatchObject({
        exprType: 'Function',
        name: 'parent',
        args: [{ exprType: 'Constant', value: { path: 'users/alice/posts/post1' } }],
      });
    });

    it('serializes lowerable field path expressions for parent args', function () {
      expect(selectExpr(db, parent(field('docPath')).as('parentRef'))).toMatchObject({
        exprType: 'Function',
        name: 'parent',
        args: [{ exprType: 'Field', path: 'docPath' }],
      });
    });
  });

  describe('standalone-only expression helpers', function () {
    it.each(STANDALONE_ONLY_EXPRESSIONS)('does not expose fluent %s on field()', function (name) {
      expect(typeof (field('x') as any)[name]).toBe('undefined');
    });
  });

  describe('timestampDiff global overload matrix', function () {
    const db: any = getFirestore();

    it('serializes (Expression, Expression, unit)', function () {
      expect(
        selectExpr(db, timestampDiff(field('endTime'), field('startTime'), 'day').as('daysApart')),
      ).toMatchObject({
        exprType: 'Function',
        name: 'timestampDiff',
        args: [
          { exprType: 'Field', path: 'endTime' },
          { exprType: 'Field', path: 'startTime' },
          { exprType: 'Constant', value: 'day' },
        ],
      });
    });

    it('serializes (Expression, string field, unit)', function () {
      expect(
        selectExpr(db, timestampDiff(field('endTime'), 'startTime', 'hour').as('hoursApart')),
      ).toMatchObject({
        exprType: 'Function',
        name: 'timestampDiff',
        args: [
          { exprType: 'Field', path: 'endTime' },
          { exprType: 'Field', path: 'startTime' },
          { exprType: 'Constant', value: 'hour' },
        ],
      });
    });

    it('serializes (string field, Expression, unit)', function () {
      expect(
        selectExpr(db, timestampDiff('endTime', field('startTime'), 'minute').as('minutesApart')),
      ).toMatchObject({
        exprType: 'Function',
        name: 'timestampDiff',
        args: [
          { exprType: 'Field', path: 'endTime' },
          { exprType: 'Field', path: 'startTime' },
          { exprType: 'Constant', value: 'minute' },
        ],
      });
    });

    it('serializes (string field, string field, unit)', function () {
      expect(
        selectExpr(db, timestampDiff('endTime', 'startTime', 'second').as('secondsApart')),
      ).toMatchObject({
        exprType: 'Function',
        name: 'timestampDiff',
        args: [
          { exprType: 'Field', path: 'endTime' },
          { exprType: 'Field', path: 'startTime' },
          { exprType: 'Constant', value: 'second' },
        ],
      });
    });
  });

  describe('timestampExtract global overload matrix', function () {
    const db: any = getFirestore();

    it('serializes (Expression, TimePart)', function () {
      expect(
        selectExpr(db, timestampExtract(field('eventTime'), 'year').as('eventYear')),
      ).toMatchObject({
        exprType: 'Function',
        name: 'timestampExtract',
        args: [
          { exprType: 'Field', path: 'eventTime' },
          { exprType: 'Constant', value: 'year' },
        ],
      });
    });

    it('serializes (Expression, Expression part)', function () {
      expect(
        selectExpr(db, timestampExtract(field('eventTime'), field('partColumn')).as('dynamicPart')),
      ).toMatchObject({
        exprType: 'Function',
        name: 'timestampExtract',
        args: [
          { exprType: 'Field', path: 'eventTime' },
          { exprType: 'Field', path: 'partColumn' },
        ],
      });
    });

    it('serializes (string field, TimePart)', function () {
      expect(selectExpr(db, timestampExtract('eventTime', 'month').as('eventMonth'))).toMatchObject(
        {
          exprType: 'Function',
          name: 'timestampExtract',
          args: [
            { exprType: 'Field', path: 'eventTime' },
            { exprType: 'Constant', value: 'month' },
          ],
        },
      );
    });

    it('serializes (string field, Expression part)', function () {
      expect(
        selectExpr(db, timestampExtract('eventTime', field('partColumn')).as('fieldDynamicPart')),
      ).toMatchObject({
        exprType: 'Function',
        name: 'timestampExtract',
        args: [
          { exprType: 'Field', path: 'eventTime' },
          { exprType: 'Field', path: 'partColumn' },
        ],
      });
    });

    it('serializes optional timezone as Constant', function () {
      expect(
        selectExpr(
          db,
          timestampExtract(field('eventTime'), 'day', 'America/New_York').as('eventDayNY'),
        ),
      ).toMatchObject({
        exprType: 'Function',
        name: 'timestampExtract',
        args: [
          { exprType: 'Field', path: 'eventTime' },
          { exprType: 'Constant', value: 'day' },
          { exprType: 'Constant', value: 'America/New_York' },
        ],
      });
    });

    it('serializes optional timezone Expression as Field', function () {
      expect(
        selectExpr(db, timestampExtract('eventTime', 'year', field('timezone')).as('eventYearTz')),
      ).toMatchObject({
        exprType: 'Function',
        name: 'timestampExtract',
        args: [
          { exprType: 'Field', path: 'eventTime' },
          { exprType: 'Constant', value: 'year' },
          { exprType: 'Field', path: 'timezone' },
        ],
      });
    });
  });

  describe('constant preferIntegers option', function () {
    const db: any = getFirestore();

    it('auto-tags integer literals when options are omitted', function () {
      expect(selectExpr(db, (constant(1) as ConstantExpression).as('one'))).toMatchObject({
        exprType: 'Constant',
        value: 1,
        integerLiteral: true,
      });
    });

    it('serializes integerLiteral when preferIntegers is true', function () {
      expect(
        selectExpr(
          db,
          (constant(1.5, { preferIntegers: true }) as ConstantExpression).as('onePointFive'),
        ),
      ).toMatchObject({
        exprType: 'Constant',
        value: 1.5,
        integerLiteral: true,
      });
    });

    it('omits integerLiteral when preferIntegers is false', function () {
      const serialized = selectExpr(
        db,
        (constant(1, { preferIntegers: false }) as ConstantExpression).as('one'),
      );
      expect(serialized).toMatchObject({
        exprType: 'Constant',
        value: 1,
      });
      expect(serialized).not.toHaveProperty('integerLiteral');
    });

    it('omits integerLiteral for non-integers when options are omitted', function () {
      const serialized = selectExpr(db, (constant(1.5) as ConstantExpression).as('onePointFive'));
      expect(serialized).toMatchObject({
        exprType: 'Constant',
        value: 1.5,
      });
      expect(serialized).not.toHaveProperty('integerLiteral');
    });
  });

  describe('Timestamp and Date constants', function () {
    const db: any = getFirestore();
    const ts = new Timestamp(1700000000, 123456000);
    const tsWire = { __kind: 'timestamp', seconds: 1700000000, nanoseconds: 123456000 };
    const date = new Date(1700000001789);
    const dateWire = { __kind: 'timestamp', seconds: 1700000001, nanoseconds: 789000000 };
    const typed = (value: unknown) => constant(value) as ConstantExpression;

    it('serializes constant(Timestamp) as a tagged timestamp', function () {
      expect(selectExpr(db, typed(ts).as('t'))).toEqual({
        __kind: 'expression',
        exprType: 'Constant',
        value: tsWire,
      });
    });

    it('serializes constant(Date) as a tagged timestamp', function () {
      expect(selectExpr(db, typed(date).as('d'))).toEqual({
        __kind: 'expression',
        exprType: 'Constant',
        value: dateWire,
      });
    });

    it('truncates Timestamp nanoseconds to microseconds', function () {
      expect(selectExpr(db, typed(new Timestamp(5, 123456789)).as('t')).value).toEqual({
        __kind: 'timestamp',
        seconds: 5,
        nanoseconds: 123456000,
      });
    });

    it('serializes a Timestamp from another copy of the package', function () {
      class ForeignTimestamp {
        constructor(
          readonly seconds: number,
          readonly nanoseconds: number,
        ) {}
        toMillis(): number {
          return this.seconds * 1000 + this.nanoseconds / 1e6;
        }
        toDate(): Date {
          return new Date(this.toMillis());
        }
      }
      expect(
        selectExpr(db, typed(new ForeignTimestamp(1700000000, 123456789)).as('t')).value,
      ).toEqual(tsWire);
    });

    it('leaves plain seconds/nanoseconds maps untagged', function () {
      expect(selectExpr(db, typed({ seconds: 1, nanoseconds: 2 }).as('m')).value).toEqual({
        seconds: 1,
        nanoseconds: 2,
      });
    });

    it('serializes pre-1970 Dates', function () {
      expect(selectExpr(db, typed(new Date(-1)).as('d')).value).toEqual({
        __kind: 'timestamp',
        seconds: -1,
        nanoseconds: 999000000,
      });
    });

    it('rejects invalid Dates with a clear error', function () {
      expect(() => selectExpr(db, typed(new Date(Number.NaN)).as('d'))).toThrow(
        'firebase.firestore().pipeline() expected a valid Date.',
      );
    });

    it('rejects out-of-range or non-integer timestamp parts', function () {
      const foreign = (seconds: number, nanoseconds: number) => ({
        seconds,
        nanoseconds,
        toMillis: () => seconds * 1000,
        toDate: () => new Date(seconds * 1000),
      });
      for (const [seconds, nanoseconds] of [
        [0, 1e9],
        [0, -1],
        [1.5, 0],
        [253402300800, 0],
        [-62135596801, 0],
      ] as const) {
        expect(() => selectExpr(db, typed(foreign(seconds, nanoseconds)).as('t'))).toThrow(
          'firebase.firestore().pipeline() expected a Timestamp with integer seconds between -62135596800 and 253402300799',
        );
      }
    });

    it('serialize() leaves user maps that only look tagged untouched (execute rejects them)', function () {
      const userMap = { __kind: 'timestamp', seconds: 'soon', nanoseconds: null };
      expect(selectExpr(db, typed(userMap).as('m')).value).toEqual(userMap);
    });

    it('serializes timestamps in rawStage params and options', function () {
      const stage = db
        .pipeline()
        .collection('events')
        .rawStage('custom', [ts, { at: date, list: [ts] }], { since: ts })
        .serialize().stages[0];
      expect(stage.options.params).toEqual([tsWire, { at: dateWire, list: [tsWire] }]);
      expect(stage.options.options).toEqual({ since: tsWire });
    });

    it('serializes timestamps nested in constant maps and arrays', function () {
      expect(
        selectExpr(db, typed({ at: ts, history: [date, { when: ts }] }).as('nested')).value,
      ).toEqual({ at: tsWire, history: [dateWire, { when: tsWire }] });
      expect(selectExpr(db, typed([ts, date]).as('list')).value).toEqual([tsWire, dateWire]);
    });

    it('serializes timestamps in where comparisons', function () {
      const condition = db
        .pipeline()
        .collection('events')
        .where(field('createdAt').equal(constant(ts)))
        .serialize().stages[0].options.condition;
      expect(condition).toMatchObject({
        name: 'equal',
        args: [
          { exprType: 'Field', path: 'createdAt' },
          { exprType: 'Constant', value: tsWire },
        ],
      });
    });

    it('serializes raw Timestamp and Date comparison operands', function () {
      const condition = db
        .pipeline()
        .collection('events')
        .where(greaterThan(field('createdAt'), date as any))
        .serialize().stages[0].options.condition;
      expect(condition.args[1]).toMatchObject({ exprType: 'Constant', value: dateWire });
    });

    it('serializes timestamps in addFields', function () {
      const fields = db
        .pipeline()
        .collection('events')
        .addFields(typed(ts).as('t'), typed(date).as('d'))
        .serialize().stages[0].options.fields;
      expect(fields[0].expr.value).toEqual(tsWire);
      expect(fields[1].expr.value).toEqual(dateWire);
    });
  });
});
