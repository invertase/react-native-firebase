import { describe, expect, it } from '@jest/globals';
import { getFirestore } from '../lib';
import { constant, field, timestampDiff, timestampExtract } from '../lib/pipelines';
import type { ConstantExpression } from '../lib/pipelines/expressions';
import '../lib/pipelines';

/** Standalone firebase-js-sdk helpers that must not get fluent `.name()` chains. */
const STANDALONE_ONLY_EXPRESSIONS = ['timestampDiff', 'switchOn'] as const;

function selectExpr(db: any, expr: unknown) {
  return db.pipeline().collection('events').select(expr).serialize().stages[0].options.selections[0]
    .expr;
}

describe('pipelines serialization matrix', function () {
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
});
