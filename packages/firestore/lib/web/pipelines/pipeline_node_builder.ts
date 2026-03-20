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

import * as firebaseFirestorePipelines from '@react-native-firebase/app/dist/module/internal/web/firebaseFirestorePipelines';
import type {
  AggregateFunction,
  AliasedAggregate,
  AliasedExpression,
  Expression,
  Ordering,
  Pipeline as WebSdkPipeline,
  PipelineSource as WebSdkPipelineSource,
} from '@react-native-firebase/app/dist/module/internal/web/firebaseFirestorePipelines';

export type WebPipelineInstance = WebSdkPipeline & Record<string, unknown>;
export type WebPipelineSource = WebSdkPipelineSource<WebPipelineInstance> & Record<string, unknown>;

type PipelineHelperFn = (...args: unknown[]) => unknown;
type AliasedValue = { as: (name: string) => unknown };

const WEB_PIPELINE_HELPER_ALIASES: Record<string, string> = {
  lower: 'toLower',
  upper: 'toUpper',
};

function isRecord(value: unknown): value is Record<string, unknown> {
  return value !== null && typeof value === 'object' && !Array.isArray(value);
}

function getPipelineHelper(name: string): PipelineHelperFn {
  const helperModule = firebaseFirestorePipelines as Record<string, unknown>;
  const helper = helperModule[name] ?? helperModule[WEB_PIPELINE_HELPER_ALIASES[name] ?? ''];
  if (typeof helper !== 'function') {
    throw new Error(
      `pipelineExecute() cannot rebuild "${name}" because the web helper is missing.`,
    );
  }
  return helper as PipelineHelperFn;
}

function isExpressionNode(value: Record<string, unknown>): boolean {
  return (
    value.__kind === 'expression' ||
    value.exprType === 'Field' ||
    value.exprType === 'Constant' ||
    value.exprType === 'Function'
  );
}

function reviveHelperInputValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(reviveHelperInputValue);
  }

  if (!isRecord(value)) {
    return value;
  }

  if (
    isFlatAliasedFieldNode(value) ||
    isAliasedExpressionNode(value) ||
    isAliasedAggregateNode(value)
  ) {
    return revivePipelineValue(value);
  }

  if (isExpressionNode(value)) {
    if (value.exprType === 'Constant' || Object.prototype.hasOwnProperty.call(value, 'value')) {
      return reviveHelperInputValue(value.value);
    }

    return reviveExpressionNode(value);
  }

  if (value.__kind === 'aggregate' || value.__kind === 'ordering') {
    return revivePipelineValue(value);
  }

  const revived: Record<string, unknown> = {};
  for (const [key, entry] of Object.entries(value)) {
    revived[key] = reviveHelperInputValue(entry);
  }
  return revived;
}

function reviveExpressionNode(node: Record<string, unknown>): Expression {
  if (node.exprType === 'Field' || typeof node.path === 'string') {
    return getPipelineHelper('field')(node.path) as Expression;
  }

  if (node.exprType === 'Constant' || Object.prototype.hasOwnProperty.call(node, 'value')) {
    return getPipelineHelper('constant')(revivePipelineValue(node.value)) as Expression;
  }

  if (typeof node.name === 'string') {
    const args = Array.isArray(node.args) ? node.args : [];

    if (node.name === 'array') {
      return getPipelineHelper(node.name)(args.map(reviveHelperInputValue)) as Expression;
    }

    if (node.name === 'conditional') {
      return getPipelineHelper(node.name)(...args.map(revivePipelineValue)) as Expression;
    }

    const revivedArgs = args.map(reviveHelperInputValue);
    return getPipelineHelper(node.name)(...revivedArgs) as Expression;
  }

  throw new Error('pipelineExecute() failed to rebuild a serialized expression node for web SDK.');
}

function reviveAggregateNode(node: Record<string, unknown>): AggregateFunction {
  if (typeof node.kind !== 'string') {
    throw new Error('pipelineExecute() failed to rebuild aggregate node: missing aggregate kind.');
  }

  const args = Array.isArray(node.args) ? node.args.map(reviveHelperInputValue) : [];
  return getPipelineHelper(node.kind)(...args) as AggregateFunction;
}

function reviveOrderingNode(node: Record<string, unknown>): Ordering {
  if (!Object.prototype.hasOwnProperty.call(node, 'expr')) {
    throw new Error('pipelineExecute() failed to rebuild ordering node: missing expr.');
  }

  const direction = node.direction === 'descending' ? 'descending' : 'ascending';
  return getPipelineHelper(direction)(revivePipelineValue(node.expr)) as Ordering;
}

function reviveAliasedNode(
  node: Record<string, unknown>,
  nodeKey: 'expr' | 'aggregate',
): AliasedExpression | AliasedAggregate {
  const alias = typeof node.alias === 'string' ? node.alias : undefined;
  if (!alias) {
    throw new Error(`pipelineExecute() failed to rebuild aliased node: missing ${nodeKey} alias.`);
  }

  const value = revivePipelineValue(node[nodeKey]);
  if (!value || (typeof value !== 'object' && typeof value !== 'function') || !('as' in value)) {
    throw new Error(`pipelineExecute() failed to rebuild aliased ${nodeKey}: invalid value.`);
  }

  return (value as AliasedValue).as(alias) as AliasedExpression | AliasedAggregate;
}

function isFlatAliasedFieldNode(value: Record<string, unknown>): boolean {
  const alias = value.alias ?? value.as;
  return (
    typeof value.path === 'string' &&
    value.path.length > 0 &&
    typeof alias === 'string' &&
    alias.length > 0
  );
}

function isAliasedExpressionNode(value: Record<string, unknown>): boolean {
  const alias = value.alias ?? value.as;
  return (
    typeof alias === 'string' &&
    alias.length > 0 &&
    Object.prototype.hasOwnProperty.call(value, 'expr')
  );
}

function isAliasedAggregateNode(value: Record<string, unknown>): boolean {
  return (
    typeof value.alias === 'string' &&
    value.alias.length > 0 &&
    Object.prototype.hasOwnProperty.call(value, 'aggregate')
  );
}

export function revivePipelineValue(value: unknown): unknown {
  if (Array.isArray(value)) {
    return value.map(revivePipelineValue);
  }

  if (!isRecord(value)) {
    return value;
  }

  if (isFlatAliasedFieldNode(value)) {
    const alias = (value.alias ?? value.as) as string;
    const field = getPipelineHelper('field')(value.path) as Expression & Partial<AliasedValue>;
    const asFn = field.as;
    if (typeof asFn !== 'function') {
      throw new Error('pipelineExecute() failed to rebuild flat aliased field for web SDK.');
    }
    return asFn.call(field, alias);
  }

  if (isAliasedExpressionNode(value)) {
    const alias = (value.alias ?? value.as) as string;
    const expr = revivePipelineValue(value.expr) as Expression & Partial<AliasedValue>;
    const asFn = expr.as;
    if (typeof asFn !== 'function') {
      throw new Error('pipelineExecute() failed to rebuild aliased expression for web SDK.');
    }
    return asFn.call(expr, alias);
  }

  if (isAliasedAggregateNode(value)) {
    const aggregate = revivePipelineValue(value.aggregate) as AggregateFunction &
      Partial<AliasedValue>;
    const asFn = aggregate.as;
    if (typeof asFn !== 'function') {
      throw new Error('pipelineExecute() failed to rebuild aliased aggregate for web SDK.');
    }
    return asFn.call(aggregate, value.alias as string);
  }

  switch (value.__kind) {
    case 'expression':
      return reviveExpressionNode(value);
    case 'aggregate':
      return reviveAggregateNode(value);
    case 'ordering':
      return reviveOrderingNode(value);
    case 'aliasedExpression':
      return reviveAliasedNode(value, 'expr');
    case 'aliasedAggregate':
      return reviveAliasedNode(value, 'aggregate');
    default: {
      const revived: Record<string, unknown> = {};
      for (const [key, entry] of Object.entries(value)) {
        revived[key] = revivePipelineValue(entry);
      }
      return revived;
    }
  }
}
