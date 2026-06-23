import { describe, expect, it } from '@jest/globals';
import { firebase } from '../lib';
import { field, switchOn, equal, constant } from '../lib/pipelines';
import '../lib/pipelines';
import {
  EXPRESSION_METHOD_NAMES,
  assertCoversAllExpressionMethods,
  buildFluentParityCases,
} from './pipelines-fluent-serialization-cases';

function selectSelection(db: any, expr: unknown) {
  return db.pipeline().collection('events').select(expr).serialize().stages[0].options
    .selections[0];
}

function normalizeSelection(selection: Record<string, unknown>) {
  if (selection.expr) {
    return stripRuntimeKeys(selection.expr);
  }
  if (selection.aggregate) {
    return stripRuntimeKeys(selection.aggregate);
  }
  return stripRuntimeKeys(selection);
}

function stripRuntimeKeys(expr: unknown): unknown {
  if (Array.isArray(expr)) {
    return expr.map(stripRuntimeKeys);
  }
  if (!expr || typeof expr !== 'object') {
    return expr;
  }
  const { __kind, selectable, ...rest } = expr as Record<string, unknown>;
  const cleaned: Record<string, unknown> = {};
  for (const [key, value] of Object.entries(rest)) {
    cleaned[key] = stripRuntimeKeys(value);
  }
  return cleaned;
}

describe('pipelines fluent serialization parity', function () {
  const db: any = firebase.firestore();
  const cases = buildFluentParityCases();

  it('defines parity cases for every EXPRESSION_METHOD_NAMES entry', function () {
    assertCoversAllExpressionMethods(cases);
    expect(cases.length).toBe(EXPRESSION_METHOD_NAMES.length);
  });

  it.each(cases.map(entry => [entry.method, entry.category, entry] as const))(
    'serializes %s (%s) global helper the same as fluent method',
    function (_method, category, entry) {
      expect(entry.category).toBe(category);
      const globalSelection = selectSelection(db, (entry.global() as any).as(`${entry.method}Global`));
      const fluentSelection = selectSelection(db, (entry.fluent() as any).as(`${entry.method}Fluent`));

      expect(normalizeSelection(globalSelection)).toEqual(normalizeSelection(fluentSelection));
    },
  );

  it('does not expose standalone-only helpers on field()', function () {
    for (const name of ['timestampDiff', 'switchOn'] as const) {
      expect(typeof (field('x') as any)[name]).toBe('undefined');
    }
  });

  it('serializes switchOn only as a global helper', function () {
    const globalSelection = selectSelection(
      db,
      switchOn(
        equal(field('status'), constant(1)),
        constant('Active'),
        constant('Unknown'),
      ).as('statusLabel'),
    );

    expect(normalizeSelection(globalSelection)).toMatchObject({
      exprType: 'Function',
      name: 'switchOn',
    });
    expect(typeof (field('status') as any).switchOn).toBe('undefined');
    expect(typeof (field('status') as any).timestampDiff).toBe('undefined');
  });
});
