import { describe, expect, it } from '@jest/globals';
import { firebase } from '../lib';
import {
  conditional,
  constant,
  field,
  switchOn,
  timestampAdd,
  timestampSubtract,
  timestampTruncate,
  mapGet,
  mapSet,
  stringReplaceOne,
  stringReplaceAll,
  regexMatch,
  equal,
  ifNull,
} from '../lib/pipelines';
import '../lib/pipelines';

function selectExpr(db: any, expr: unknown) {
  return db.pipeline().collection('events').select(expr).serialize().stages[0].options
    .selections[0].expr;
}

describe('pipelines fluent serialization parity', function () {
  const db: any = firebase.firestore();

  it('serializes conditional as global helper and fluent method', function () {
    const globalExpr = selectExpr(
      db,
      conditional(
        field('value').greaterThan(0),
        constant('positive'),
        constant('non-positive'),
      ).as('bucket'),
    );
    const fluentExpr = selectExpr(
      db,
      (field('value').greaterThan(0) as any)
        .conditional(constant('positive'), constant('non-positive'))
        .as('fluentBucket'),
    );

    expect(globalExpr).toMatchObject({ exprType: 'Function', name: 'conditional' });
    expect(fluentExpr).toMatchObject({ exprType: 'Function', name: 'conditional' });
    expect(fluentExpr.args).toHaveLength(3);
    expect(fluentExpr.args[1]).toMatchObject({ exprType: 'Constant', value: 'positive' });
    expect(fluentExpr.args[2]).toMatchObject({ exprType: 'Constant', value: 'non-positive' });
  });

  it('serializes timestampAdd as global helper and fluent method', function () {
    const expected = {
      exprType: 'Function',
      name: 'timestampAdd',
      args: [
        { exprType: 'Field', path: 'eventTime' },
        { exprType: 'Constant', value: 'day' },
        { exprType: 'Constant', value: 1 },
      ],
    };
    const globalExpr = selectExpr(
      db,
      timestampAdd(field('eventTime'), 'day', 1).as('nextDay'),
    );
    const fluentExpr = selectExpr(
      db,
      (field('eventTime') as any).timestampAdd('day', 1).as('fluentNextDay'),
    );

    expect(globalExpr).toMatchObject(expected);
    expect(fluentExpr).toMatchObject(expected);
  });

  it('serializes timestampSubtract as global helper and fluent method', function () {
    const expected = {
      exprType: 'Function',
      name: 'timestampSubtract',
      args: [
        { exprType: 'Field', path: 'eventTime' },
        { exprType: 'Constant', value: 'hour' },
        { exprType: 'Constant', value: 1 },
      ],
    };
    const globalExpr = selectExpr(
      db,
      timestampSubtract(field('eventTime'), 'hour', 1).as('prevHour'),
    );
    const fluentExpr = selectExpr(
      db,
      (field('eventTime') as any).timestampSubtract('hour', 1).as('fluentPrevHour'),
    );

    expect(globalExpr).toMatchObject(expected);
    expect(fluentExpr).toMatchObject(expected);
  });

  it('serializes timestampTruncate as global helper and fluent method', function () {
    const expected = {
      exprType: 'Function',
      name: 'timestampTruncate',
      args: [
        { exprType: 'Field', path: 'eventTime' },
        { exprType: 'Constant', value: 'day' },
      ],
    };
    const globalExpr = selectExpr(
      db,
      timestampTruncate(field('eventTime'), 'day').as('dayBucket'),
    );
    const fluentExpr = selectExpr(
      db,
      (field('eventTime') as any).timestampTruncate('day').as('fluentDayBucket'),
    );

    expect(globalExpr).toMatchObject(expected);
    expect(fluentExpr).toMatchObject(expected);
  });

  it('serializes mapGet as global helper and fluent method', function () {
    const expected = {
      exprType: 'Function',
      name: 'mapGet',
      args: [
        { exprType: 'Field', path: 'metadata' },
        { exprType: 'Constant', value: 'theme' },
      ],
    };
    const globalExpr = selectExpr(db, mapGet(field('metadata'), 'theme').as('theme'));
    const fluentExpr = selectExpr(db, (field('metadata') as any).mapGet('theme').as('fluentTheme'));

    expect(globalExpr).toMatchObject(expected);
    expect(fluentExpr).toMatchObject(expected);
  });

  it('serializes mapSet as global helper and fluent method', function () {
    const expected = {
      exprType: 'Function',
      name: 'mapSet',
      args: [
        { exprType: 'Field', path: 'metadata' },
        { exprType: 'Constant', value: 'theme' },
        { exprType: 'Constant', value: 'dark' },
      ],
    };
    const globalExpr = selectExpr(
      db,
      mapSet(field('metadata'), 'theme', 'dark').as('metadataWithTheme'),
    );
    const fluentExpr = selectExpr(
      db,
      (field('metadata') as any).mapSet('theme', 'dark').as('fluentMetadataWithTheme'),
    );

    expect(globalExpr).toMatchObject(expected);
    expect(fluentExpr).toMatchObject(expected);
  });

  it('serializes stringReplaceOne as global helper and fluent method', function () {
    const expected = {
      exprType: 'Function',
      name: 'stringReplaceOne',
      args: [
        { exprType: 'Field', path: 'label' },
        { exprType: 'Constant', value: 'a' },
        { exprType: 'Constant', value: 'b' },
      ],
    };
    const globalExpr = selectExpr(
      db,
      stringReplaceOne(field('label'), 'a', 'b').as('replaced'),
    );
    const fluentExpr = selectExpr(
      db,
      (field('label') as any).stringReplaceOne('a', 'b').as('fluentReplaced'),
    );

    expect(globalExpr).toMatchObject(expected);
    expect(fluentExpr).toMatchObject(expected);
  });

  it('serializes stringReplaceAll as global helper and fluent method', function () {
    const expected = {
      exprType: 'Function',
      name: 'stringReplaceAll',
      args: [
        { exprType: 'Field', path: 'label' },
        { exprType: 'Constant', value: 'a' },
        { exprType: 'Constant', value: 'b' },
      ],
    };
    const globalExpr = selectExpr(
      db,
      stringReplaceAll(field('label'), 'a', 'b').as('replacedAll'),
    );
    const fluentExpr = selectExpr(
      db,
      (field('label') as any).stringReplaceAll('a', 'b').as('fluentReplacedAll'),
    );

    expect(globalExpr).toMatchObject(expected);
    expect(fluentExpr).toMatchObject(expected);
  });

  it('serializes regexMatch as global helper and fluent method', function () {
    const expected = {
      exprType: 'Function',
      name: 'regexMatch',
      args: [
        { exprType: 'Field', path: 'code' },
        { exprType: 'Constant', value: '^[A-Z]{3}$' },
      ],
    };
    const globalExpr = selectExpr(db, regexMatch(field('code'), '^[A-Z]{3}$').as('codeMatch'));
    const fluentExpr = selectExpr(
      db,
      (field('code') as any).regexMatch('^[A-Z]{3}$').as('fluentCodeMatch'),
    );

    expect(globalExpr).toMatchObject(expected);
    expect(fluentExpr).toMatchObject(expected);
  });

  it('serializes ifNull as global mixed overload and fluent method', function () {
    const expected = {
      exprType: 'Function',
      name: 'ifNull',
      args: [
        { exprType: 'Field', path: 'displayName' },
        { exprType: 'Constant', value: 'Anonymous' },
      ],
    };
    const globalExpr = selectExpr(db, ifNull(field('displayName'), 'Anonymous').as('name'));
    const fluentExpr = selectExpr(
      db,
      (field('displayName') as any).ifNull('Anonymous').as('fluentName'),
    );

    expect(globalExpr).toMatchObject(expected);
    expect(fluentExpr).toMatchObject(expected);
  });

  it('serializes switchOn only as a global helper', function () {
    const globalExpr = selectExpr(
      db,
      switchOn(
        equal(field('status'), constant(1)),
        constant('Active'),
        constant('Unknown'),
      ).as('statusLabel'),
    );

    expect(globalExpr).toMatchObject({ exprType: 'Function', name: 'switchOn' });
    expect(typeof (field('status') as any).switchOn).toBe('undefined');
  });
});
