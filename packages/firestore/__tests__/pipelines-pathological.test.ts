import { describe, expect, it } from '@jest/globals';
import { firebase } from '../lib';
import {
  add,
  and,
  arrayGet,
  average,
  constant,
  countAll,
  equal,
  field,
  greaterThan,
  or,
  subcollection,
  sum,
} from '../lib/pipelines';
import '../lib/pipelines';
import { getIOSUnsupportedPipelineFunctions } from '../lib/pipelines/pipeline_support';
import { validateSerializedPipeline } from '../lib/pipelines/pipeline_validate';

/**
 * Pathological / stress coverage for the pipeline serialization + analysis layer.
 *
 * These guard the two latent defects found during the subcollection-subquery work:
 *  1. `getIOSUnsupportedPipelineFunctions` was O(2^depth) (it traversed `args`
 *     twice per nesting level), which hung iOS `execute()` before reaching native
 *     for a moderately deep `add(add(add(...)))` expression.
 *  2. The same function recursed, so very deep nesting risked a Hermes stack
 *     overflow. It is now an iterative work-list.
 *
 * They also probe parsing/serialization correctness for deeply nested subqueries
 * (the `PipelineValue` opaque-handling path) and a wide, mixed pipeline.
 */
describe('pipelines pathological / stress coverage', function () {
  const db: any = firebase.firestore();

  /** Build a plain serialized nested-function chain WITHOUT recursion. */
  function plainNestedFunctionPipeline(depth: number, innermost: Record<string, unknown>) {
    let expr: Record<string, unknown> = innermost;
    for (let i = 0; i < depth; i++) {
      expr = {
        __kind: 'expression',
        exprType: 'Function',
        name: 'add',
        args: [{ exprType: 'Field', path: 'x' }, expr],
      };
    }
    return {
      source: { source: 'collection', path: 'c' },
      stages: [{ stage: 'select', options: { selections: [{ expr, alias: 'y' }] } }],
    } as any;
  }

  describe('getIOSUnsupportedPipelineFunctions', function () {
    it('is fast and stack-safe for an extremely deep expression (no exponential blowup, no recursion overflow)', function () {
      const deep = plainNestedFunctionPipeline(20000, { exprType: 'Field', path: 'x' });
      const start = Date.now();
      const result = getIOSUnsupportedPipelineFunctions(deep);
      const elapsed = Date.now() - start;

      expect(result).toEqual([]);
      // Linear traversal of ~20k nodes must be well under a second. The old
      // O(2^depth) implementation could not finish even at depth ~30.
      expect(elapsed).toBeLessThan(1000);
    });

    it('returns an empty list for a null/undefined pipeline', function () {
      expect(getIOSUnsupportedPipelineFunctions(null)).toEqual([]);
      expect(getIOSUnsupportedPipelineFunctions(undefined)).toEqual([]);
    });

    it('still detects an unsupported function buried deep inside args', function () {
      const deep = plainNestedFunctionPipeline(5000, {
        __kind: 'expression',
        exprType: 'Function',
        name: 'arrayGet',
        args: [
          { exprType: 'Field', path: 'arr' },
          { exprType: 'Constant', value: 0 },
        ],
      });
      expect(getIOSUnsupportedPipelineFunctions(deep)).toContain('arrayGet');
    });

    it('detects unsupported functions nested inside a real scalar subquery', function () {
      const serialized = db
        .pipeline()
        .collection('restaurants')
        .addFields(
          subcollection('reviews')
            .select(arrayGet(field('tags'), 0).as('firstTag'))
            .toScalarExpression()
            .as('reviewSummary'),
        )
        .serialize();

      // arrayGet is unsupported on iOS even when it only appears inside a subquery.
      expect(getIOSUnsupportedPipelineFunctions(serialized)).toContain('arrayGet');
    });
  });

  describe('deep expression serialization correctness', function () {
    it('serializes a 64-deep add() chain to the correct nested structure', function () {
      const depth = 64;
      let expr: any = field('base');
      for (let i = 0; i < depth; i++) {
        expr = add(field('x'), expr);
      }

      const serialized = db.pipeline().collection('c').select(expr.as('y')).serialize();
      let node: any = serialized.stages[0].options.selections[0].expr;

      let seen = 0;
      while (node && node.exprType === 'Function' && node.name === 'add') {
        expect(node.args).toHaveLength(2);
        expect(node.args[0]).toMatchObject({ exprType: 'Field', path: 'x' });
        node = node.args[1];
        seen++;
      }

      expect(seen).toBe(depth);
      expect(node).toMatchObject({ exprType: 'Field', path: 'base' });
    });
  });

  describe('deeply nested subqueries (PipelineValue opaque path)', function () {
    it('serializes N levels of scalar subqueries and keeps each PipelineValue opaque + correct', function () {
      const levels = 8;
      // Innermost detached pipeline: aggregate over the deepest subcollection.
      let inner: any = subcollection('level-0').aggregate(countAll().as('c0'));
      for (let k = 1; k <= levels; k++) {
        inner = subcollection(`level-${k}`).addFields(inner.toScalarExpression().as(`sub${k}`));
      }

      const serialized = db
        .pipeline()
        .collection('root')
        .addFields(inner.toScalarExpression().as('top'))
        .serialize();

      // Walk the nested PipelineValue chain and assert depth + shape at each level.
      let fnExpr: any = serialized.stages[0].options.fields[0].expr;
      let depthSeen = 0;
      while (fnExpr && fnExpr.exprType === 'Function' && fnExpr.name === 'scalar') {
        expect(fnExpr.args).toHaveLength(1);
        const pipelineValue = fnExpr.args[0];
        expect(pipelineValue.exprType).toBe('PipelineValue');
        expect(pipelineValue.pipeline).toBeTruthy();
        expect(pipelineValue.pipeline.source.source).toBe('subcollection');

        depthSeen++;
        const stages = pipelineValue.pipeline.stages;
        const addFieldsStage = stages.find((s: any) => s.stage === 'addFields');
        if (!addFieldsStage) {
          // innermost pipeline is the aggregate-only one
          expect(stages.some((s: any) => s.stage === 'aggregate')).toBe(true);
          break;
        }
        fnExpr = addFieldsStage.options.fields[0].expr;
      }

      expect(depthSeen).toBe(levels + 1);
    });

    it('terminates serialization of deeply nested subqueries without hanging', function () {
      const levels = 50;
      let inner: any = subcollection('leaf').aggregate(countAll().as('c'));
      for (let k = 0; k < levels; k++) {
        inner = subcollection(`s${k}`).addFields(inner.toScalarExpression().as(`f${k}`));
      }

      const start = Date.now();
      const serialized = db
        .pipeline()
        .collection('root')
        .addFields(inner.toScalarExpression().as('top'))
        .serialize();
      const elapsed = Date.now() - start;

      expect(serialized.stages).toHaveLength(1);
      expect(elapsed).toBeLessThan(2000);
    });
  });

  describe('wide, mixed pathological pipeline', function () {
    it('serializes + validates a single pipeline that exercises many node kinds at once', function () {
      const serialized = db
        .pipeline()
        .collection('restaurants')
        .where(
          or(greaterThan(field('rating'), constant(3)), equal(field('featured'), constant(true))),
        )
        .addFields(
          subcollection('reviews')
            .where(
              and(
                greaterThan(field('stars'), constant(2)),
                equal(field('hidden'), constant(false)),
              ),
            )
            .aggregate(countAll().as('reviewCount'), average('stars').as('avgStars'))
            .toScalarExpression()
            .as('reviewSummary'),
          subcollection('photos').select('url').toArrayExpression().as('photoUrls'),
        )
        .aggregate(sum('reviewSummary.reviewCount').as('totalReviews'))
        .serialize();

      // Must be a structurally valid serialized pipeline.
      expect(() => validateSerializedPipeline(serialized)).not.toThrow();

      // None of the functions used here are iOS-unsupported.
      expect(getIOSUnsupportedPipelineFunctions(serialized)).toEqual([]);

      // Spot-check the scalar + array subqueries serialized as opaque PipelineValues.
      const addFields = serialized.stages.find((s: any) => s.stage === 'addFields');
      const scalarField = addFields.options.fields.find((f: any) => f.alias === 'reviewSummary');
      const arrayField = addFields.options.fields.find((f: any) => f.alias === 'photoUrls');

      expect(scalarField.expr).toMatchObject({ exprType: 'Function', name: 'scalar' });
      expect(scalarField.expr.args[0].exprType).toBe('PipelineValue');
      expect(arrayField.expr).toMatchObject({ exprType: 'Function', name: 'array' });
      expect(arrayField.expr.args[0].exprType).toBe('PipelineValue');
    });
  });
});
