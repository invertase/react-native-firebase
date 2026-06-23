import { describe, expect, it } from '@jest/globals';
import { firebase } from '../lib';
import { field, timestampDiff } from '../lib/pipelines';
import '../lib/pipelines';

/** Standalone firebase-js-sdk helpers that must not get fluent `.name()` chains. */
const STANDALONE_ONLY_EXPRESSIONS = ['timestampDiff', 'switchOn'] as const;

function selectExpr(db: any, expr: unknown) {
  return db.pipeline().collection('events').select(expr).serialize().stages[0].options
    .selections[0].expr;
}

describe('pipelines serialization matrix', function () {
  describe('standalone-only expression helpers', function () {
    it.each(STANDALONE_ONLY_EXPRESSIONS)('does not expose fluent %s on field()', function (name) {
      expect(typeof (field('x') as any)[name]).toBe('undefined');
    });
  });

  describe('timestampDiff global overload matrix', function () {
    const db: any = firebase.firestore();

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
});
