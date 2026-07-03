import { describe, expect, it } from '@jest/globals';
import {
  validateExecuteOptions,
  validatePipelineExecuteRequest,
  validateSerializedPipeline,
} from '../lib/pipelines/pipeline_validate';

/** Minimal valid serialized pipeline: a collection source with one select stage. */
function validPipeline() {
  return {
    source: { source: 'collection', path: 'restaurants' },
    stages: [{ stage: 'select', options: { selections: [{ alias: 'x', expr: {} }] } }],
  };
}

function pipelineWithStage(stage: unknown) {
  return { source: { source: 'collection', path: 'c' }, stages: [stage] };
}

describe('validateSerializedPipeline — failure branches', function () {
  it('rejects non-object pipelines and non-array stages', function () {
    expect(() => validateSerializedPipeline(null)).toThrow(
      'pipelineExecute() expected pipeline to be an object.',
    );
    expect(() => validateSerializedPipeline({ source: { source: 'database' } })).toThrow(
      'pipelineExecute() expected pipeline.stages to be an array.',
    );
  });

  describe('source validation', function () {
    it('rejects a non-object source', function () {
      expect(() => validateSerializedPipeline({ source: 'nope', stages: [] })).toThrow(
        'pipelineExecute() expected pipeline.source to be an object.',
      );
    });

    it('validates collection / collectionGroup / subcollection paths', function () {
      expect(() =>
        validateSerializedPipeline({ source: { source: 'collection' }, stages: [] }),
      ).toThrow('pipelineExecute() expected pipeline.source.path to be a non-empty string.');
      expect(() =>
        validateSerializedPipeline({ source: { source: 'collectionGroup' }, stages: [] }),
      ).toThrow(
        'pipelineExecute() expected pipeline.source.collectionId to be a non-empty string.',
      );
      expect(() =>
        validateSerializedPipeline({ source: { source: 'subcollection' }, stages: [] }),
      ).toThrow('pipelineExecute() expected pipeline.source.path to be a non-empty string.');
    });

    it('accepts database / documents / collectionGroup / subcollection valid forms', function () {
      expect(() =>
        validateSerializedPipeline({ source: { source: 'database' }, stages: [] }),
      ).not.toThrow();
      expect(() =>
        validateSerializedPipeline({
          source: { source: 'documents', documents: ['a/b'] },
          stages: [],
        }),
      ).not.toThrow();
      expect(() =>
        validateSerializedPipeline({
          source: { source: 'collectionGroup', collectionId: 'reviews' },
          stages: [],
        }),
      ).not.toThrow();
    });

    it('validates documents source array contents', function () {
      expect(() =>
        validateSerializedPipeline({
          source: { source: 'documents', documents: [] },
          stages: [],
        }),
      ).toThrow(
        'pipelineExecute() expected pipeline.source.documents to contain at least one value.',
      );
      expect(() =>
        validateSerializedPipeline({
          source: { source: 'documents', documents: ['a/b', ''] },
          stages: [],
        }),
      ).toThrow(
        'pipelineExecute() expected pipeline.source.documents to contain only non-empty strings.',
      );
      expect(() =>
        validateSerializedPipeline({
          source: { source: 'documents', documents: 'not-an-array' },
          stages: [],
        }),
      ).toThrow(
        'pipelineExecute() expected pipeline.source.documents to contain at least one value.',
      );
    });

    it('validates the query source shape', function () {
      const base: any = {
        source: 'query',
        path: 'c',
        queryType: 'collection',
        filters: [],
        orders: [],
        options: {},
      };
      expect(() =>
        validateSerializedPipeline({ source: { ...base, path: '' }, stages: [] }),
      ).toThrow('pipelineExecute() expected pipeline.source.path to be a non-empty string.');
      expect(() =>
        validateSerializedPipeline({ source: { ...base, queryType: '' }, stages: [] }),
      ).toThrow('pipelineExecute() expected pipeline.source.queryType to be a non-empty string.');
      expect(() =>
        validateSerializedPipeline({ source: { ...base, filters: 'no' }, stages: [] }),
      ).toThrow('pipelineExecute() expected pipeline.source.filters to be an array.');
      expect(() =>
        validateSerializedPipeline({ source: { ...base, orders: 'no' }, stages: [] }),
      ).toThrow('pipelineExecute() expected pipeline.source.orders to be an array.');
      expect(() =>
        validateSerializedPipeline({ source: { ...base, options: 'no' }, stages: [] }),
      ).toThrow('pipelineExecute() expected pipeline.source.options to be an object.');
      expect(() => validateSerializedPipeline({ source: base, stages: [] })).not.toThrow();
    });

    it('rejects an unknown source type', function () {
      expect(() =>
        validateSerializedPipeline({ source: { source: 'galaxy' }, stages: [] }),
      ).toThrow('pipelineExecute() received an unknown source type.');
    });
  });

  describe('stage validation', function () {
    it('rejects malformed stages', function () {
      expect(() => validateSerializedPipeline(pipelineWithStage('nope'))).toThrow(
        'to include stage and options.',
      );
      expect(() => validateSerializedPipeline(pipelineWithStage({ stage: 'select' }))).toThrow(
        'to include stage and options.',
      );
    });

    it('requires non-empty arrays for collection-ish stages', function () {
      const cases: Array<[string, string]> = [
        ['select', 'selections'],
        ['addFields', 'fields'],
        ['removeFields', 'fields'],
        ['sort', 'orderings'],
        ['aggregate', 'accumulators'],
        ['distinct', 'groups'],
      ];
      for (const [stage, key] of cases) {
        expect(() =>
          validateSerializedPipeline(pipelineWithStage({ stage, options: { [key]: [] } })),
        ).toThrow(`stage.options.${key} to contain at least one value.`);
      }
      expect(() =>
        validateSerializedPipeline(
          pipelineWithStage({ stage: 'select', options: { selections: 'not-an-array' } }),
        ),
      ).toThrow('stage.options.selections to contain at least one value.');
    });

    it('validates the sample stage', function () {
      expect(() =>
        validateSerializedPipeline(pipelineWithStage({ stage: 'sample', options: {} })),
      ).toThrow('pipelineExecute() expected sample stage to include documents or percentage.');
      expect(() =>
        validateSerializedPipeline(
          pipelineWithStage({ stage: 'sample', options: { documents: 5 } }),
        ),
      ).not.toThrow();
      expect(() =>
        validateSerializedPipeline(
          pipelineWithStage({ stage: 'sample', options: { percentage: 0.5 } }),
        ),
      ).not.toThrow();
    });

    it('validates and recurses into the union stage', function () {
      expect(() =>
        validateSerializedPipeline(pipelineWithStage({ stage: 'union', options: { other: {} } })),
      ).toThrow(
        'pipelineExecute() expected stage.options.other to be a serialized pipeline object.',
      );

      expect(() =>
        validateSerializedPipeline(
          pipelineWithStage({
            stage: 'union',
            options: { other: { stages: [] } },
          }),
        ),
      ).toThrow(
        'pipelineExecute() expected stage.options.other to be a serialized pipeline object.',
      );

      expect(() =>
        validateSerializedPipeline(
          pipelineWithStage({
            stage: 'union',
            options: { other: { source: { source: 'database' }, stages: 'not-an-array' } },
          }),
        ),
      ).toThrow(
        'pipelineExecute() expected stage.options.other to be a serialized pipeline object.',
      );

      // Valid union recurses into the nested pipeline (and surfaces nested errors).
      expect(() =>
        validateSerializedPipeline(
          pipelineWithStage({
            stage: 'union',
            options: { other: { source: { source: 'collection' }, stages: [] } },
          }),
        ),
      ).toThrow('.other.source.path to be a non-empty string.');

      expect(() =>
        validateSerializedPipeline(
          pipelineWithStage({
            stage: 'union',
            options: { other: { source: { source: 'database' }, stages: [] } },
          }),
        ),
      ).not.toThrow();
    });

    it('uses nested field paths when validating under a custom root or union child', function () {
      expect(() =>
        validateSerializedPipeline(
          pipelineWithStage({ stage: 'select', options: { selections: [] } }),
          'nested',
        ),
      ).toThrow('nested.stages[0].options.selections to contain at least one value.');

      expect(() =>
        validateSerializedPipeline(
          pipelineWithStage({
            stage: 'union',
            options: {
              other: {
                source: { source: 'database' },
                stages: [{ stage: 'select', options: { selections: [] } }],
              },
            },
          }),
        ),
      ).toThrow('stage.options.other.stages[0].options.selections to contain at least one value.');
    });

    it('accepts option-less stages and rejects unknown stages', function () {
      for (const stage of [
        'where',
        'limit',
        'offset',
        'findNearest',
        'replaceWith',
        'unnest',
        'rawStage',
      ]) {
        expect(() =>
          validateSerializedPipeline(pipelineWithStage({ stage, options: {} })),
        ).not.toThrow();
      }
      expect(() =>
        validateSerializedPipeline(pipelineWithStage({ stage: 'teleport', options: {} })),
      ).toThrow('pipelineExecute() received an unknown stage: teleport.');
    });

    it('accepts the valid (non-empty) form of every array-backed stage', function () {
      const valid: Array<[string, Record<string, unknown>]> = [
        ['removeFields', { fields: ['a'] }],
        ['distinct', { groups: ['a'] }],
        ['sort', { orderings: [{}] }],
        ['aggregate', { accumulators: [{}] }],
        ['addFields', { fields: [{}] }],
      ];
      for (const [stage, options] of valid) {
        expect(() =>
          validateSerializedPipeline(pipelineWithStage({ stage, options })),
        ).not.toThrow();
      }
    });

    it('accepts a valid subcollection source', function () {
      expect(() =>
        validateSerializedPipeline({
          source: { source: 'subcollection', path: 'reviews' },
          stages: [],
        }),
      ).not.toThrow();
    });

    it('accepts a fully valid pipeline', function () {
      expect(() => validateSerializedPipeline(validPipeline())).not.toThrow();
    });
  });
});

describe('validateExecuteOptions', function () {
  it('returns undefined for undefined options', function () {
    expect(validateExecuteOptions(undefined)).toBeUndefined();
  });

  it('rejects non-object options', function () {
    expect(() => validateExecuteOptions('nope')).toThrow(
      'pipelineExecute() expected options to be an object.',
    );
  });

  it('rejects unsupported indexMode values and the recommended sentinel', function () {
    expect(() => validateExecuteOptions({ indexMode: 'fast' })).toThrow(
      'pipelineExecute() expected options.indexMode to equal "recommended".',
    );
    expect(() => validateExecuteOptions({ indexMode: 'recommended' })).toThrow(
      'does not support options.indexMode',
    );
  });

  it('rejects rawOptions (wrong type and unsupported)', function () {
    expect(() => validateExecuteOptions({ rawOptions: 'nope' })).toThrow(
      'pipelineExecute() expected options.rawOptions to be an object.',
    );
    expect(() => validateExecuteOptions({ rawOptions: { a: 1 } })).toThrow(
      'does not support options.rawOptions',
    );
  });

  it('returns empty options unchanged', function () {
    const options = {};
    expect(validateExecuteOptions(options)).toBe(options);
  });
});

describe('validatePipelineExecuteRequest', function () {
  it('returns the validated pipeline and options', function () {
    const pipeline = validPipeline();
    const result = validatePipelineExecuteRequest(pipeline, undefined);
    expect(result.pipeline).toBe(pipeline);
    expect(result.options).toBeUndefined();
  });

  it('throws when the pipeline is invalid', function () {
    expect(() => validatePipelineExecuteRequest({ source: 'no', stages: [] }, undefined)).toThrow(
      'pipelineExecute() expected pipeline.source to be an object.',
    );
  });

  it('throws when options are invalid', function () {
    expect(() => validatePipelineExecuteRequest(validPipeline(), { indexMode: 'fast' })).toThrow(
      'pipelineExecute() expected options.indexMode to equal "recommended".',
    );
  });
});
