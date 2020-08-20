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

export interface PageContext {
  id: string;
  next: string;
  previous: string;
}

export interface PageReferenceQuery {
  allModule: {
    nodes: Module[];
  };
}

export interface PageEntityQuery {
  module: {
    module: string; // name
    statics: Static[];
    entities: Entity[];
  };
  allModule: {
    nodes: Module[];
  };
}

export interface Module {
  id: string;
  module: string;
  moduleName: string;
  description: string;
  mdx: string;
  entities: Entity[];
}

export interface Static extends Property, Method {
  kind: string;
}

export interface Entity {
  id: string;
  kind?: string;
  name: string;
  mdx?: string;
  slug: string;
  description: string;
  source: string;
  type: string; // JSON string

  properties?: Property[];
  members?: EnumMember[];
  methods?: Method[];
}

interface ReferenceType {
  id: string;
  name: string;
  hash: string;
  description: string;
  excerpt: string;
  mdx: string;
  tags: Tag[];
  inherited: string;
  type: string; // JSON string
  optional?: boolean;
  private?: boolean;
}

interface Tag {
  param?: string;
  tag: string;
  text: string;
}

export interface Property extends ReferenceType {
  source: string;
}

export interface EnumMember extends ReferenceType {
  defaultValue: string;
  source: string;
}

export interface Method {
  id: string;
  name: string;
  source: string;
  signatures?: Signature[];
}

export interface Signature extends ReferenceType {
  source: string;
  parameters: Parameter[];
}

export type Parameter = ReferenceType;

type TypeScriptType =
  | 'intersection'
  | 'reference'
  | 'union'
  | 'intrinsic'
  | 'array'
  | 'reflection'
  | 'stringLiteral';

export interface ExposedType {
  type: TypeScriptType;
  id?: number;
  name?: string;
  types?: ExposedType[];
  typeArguments?: ExposedType[];
  elementType?: ExposedType;
  declaration?: {
    indexSignature?: Signature[];
    signatures?: Signature[];
    children?: Signature[];
  };
  value?: string;
}
