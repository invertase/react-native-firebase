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

import React from 'react';
import { graphql, useStaticQuery } from 'gatsby';

import { ExposedType } from '../types/reference';
import { Link } from './Link';

interface Props {
  type: string | ExposedType;
}

const EXTERNAL_TYPES: { [key: string]: string } = {
  Error: 'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Error',
  Promise:
    'https://developer.mozilla.org/en-US/docs/Web/JavaScript/Reference/Global_Objects/Promise',
};

function TypeGenerator({ type }: Props): JSX.Element {
  const { allEntity } = useStaticQuery(graphql`
    query EntityQuery {
      allEntity {
        nodes {
          id
          name
          slug
        }
      }
    }
  `);

  // Extract all entities so we can reference them
  const entityMap: { [id: string]: string } = {};
  allEntity.nodes.forEach(({ id, slug }: any) => {
    entityMap[id] = slug;
  });

  let exposed = type as ExposedType;
  if (typeof type === 'string') {
    exposed = JSON.parse(type) as ExposedType;
  }

  const out = [];

  // string
  if (exposed.type === 'intrinsic') {
    out.push(
      <span key={`intrinsic-${exposed.name}`} className="type">
        {exposed.name}
      </span>,
    );
  }

  // foo: "bar"
  if (exposed.type === 'stringLiteral') {
    out.push(
      <span key={`intrinsic-${exposed.name}`} className="type">
        &quot;{exposed.value}&quot;
      </span>,
    );
  }

  // string | boolean
  if (exposed.type === 'union') {
    exposed.types?.forEach((type, i) => {
      out.push(<TypeGenerator type={type} />);

      if (i + 1 !== exposed.types?.length) {
        out.push(<span key={`union-divider-${i}`}>{' | '}</span>);
      }
    });
  }

  // UserMetadata
  if (exposed.type === 'reference') {
    // External links (Promise, Error)
    if (exposed.name && EXTERNAL_TYPES[exposed.name]) {
      out.push(
        <span key={`reference-${exposed.name}`}>
          <Link to={EXTERNAL_TYPES[exposed.name]} target="_blank" className="reference">
            {exposed.name}
          </Link>
        </span>,
      );
    }
    // Internal link references
    else if (exposed.name && exposed.id && entityMap[exposed.id]) {
      out.push(
        <span key={`reference-${exposed.name}-${exposed.id}`} className="reference">
          <Link to={entityMap[exposed.id]} className="reference">
            {exposed.name}
          </Link>
        </span>,
      );
    }
    // Unlinkable references
    else {
      out.push(
        <span key={`reference-${exposed.name}`} className="reference">
          {exposed.name}
        </span>,
      );
    }
  }

  // UserInfo[]
  if (exposed.type === 'array') {
    if (exposed.elementType) {
      out.push(<TypeGenerator type={exposed.elementType} />);
      out.push(<span key={`array-brackets`}>[]</span>);
    }
  }

  // { [param1: something, param2: somethingElse]
  if (exposed.type === 'reflection' && exposed.declaration?.indexSignature) {
    out.push(<span key={`reflection-index-open`}>{'{ '}</span>);

    const indexSignatureLength = exposed.declaration.indexSignature.length;
    exposed.declaration.indexSignature.forEach((indexSignature, isi) => {
      out.push(<span key={`reflection-index-open-${isi}`}>{'['}</span>);

      indexSignature.parameters.forEach((parameter, pi) => {
        out.push(<span key={`reflection-index-param-${pi}`}>{parameter.name}</span>);
        out.push(<span key={`reflection-index-divider-${pi}`}>{': '}</span>);
        out.push(<TypeGenerator type={parameter.type} />);

        if (pi + 1 < indexSignature.parameters.length) {
          out.push(<span key={`reflection-index-divider-${pi}`}>{', '}</span>);
        }
      });

      out.push(<span key={`reflection-index-close-${isi}`}>{']'}</span>);
      out.push(<span key={`reflection-index-divider-${isi}`}>{': '}</span>);
      out.push(<TypeGenerator type={indexSignature.type} />);

      if (isi + 1 < indexSignatureLength) {
        out.push(<span key={`reflection-index-divider-params-${isi}`}>{', '}</span>);
      }
    });

    out.push(<span key={`reflection-index-open`}>{' }'}</span>);
  }

  // (param1: something, param2: something) => Something
  if (exposed.type === 'reflection' && exposed.declaration?.signatures) {
    exposed.declaration.signatures.forEach((signature, si) => {
      if (signature.name === '__call') {
        out.push(
          <span className="foo" key={`reflection-signature-${si}`}>
            {'('}
          </span>,
        );

        if (signature.parameters) {
          signature.parameters.forEach((parameter, pi) => {
            out.push(<span key={`reflection-signature-index-param-${pi}`}>{parameter.name}</span>);
            out.push(<span key={`reflection-signature-index-divider-${pi}`}>{': '}</span>);
            out.push(<TypeGenerator type={parameter.type} />);

            if (pi + 1 < signature.parameters.length) {
              out.push(<span key={`reflection-signature-index-divider-${pi}`}>{', '}</span>);
            }
          });
        }

        out.push(<span key={`reflection-signature-${si}`}>{')'}</span>);
        out.push(<span key={`reflection-signature-function-callable`}>{' => '}</span>);
      }

      out.push(<TypeGenerator type={signature.type} />);
    });
  }

  if (exposed.type === 'reflection' && exposed.declaration?.children) {
    out.push(<span key={`reflection-children-open`}>{'{ '}</span>);
    const reflectionChildrenLength = exposed.declaration?.children.length;
    exposed.declaration?.children.forEach((signature, si) => {
      out.push(
        <span key={`reflection-children-variable-${signature.name}`} className="type">
          {signature.name}
        </span>,
      );

      if (signature.optional) {
        out.push(<span key={`reflection-children-variable-optional-${signature.name}`}>?</span>);
      }
      out.push(<span key={`reflection-children-variable-cursor-${signature.name}`}>{': '}</span>);
      out.push(<TypeGenerator type={signature.type} />);

      if (si + 1 < reflectionChildrenLength) {
        out.push(<span key={`reflection-children-divider-params-${si}`}>{', '}</span>);
      }
    });

    out.push(<span key={`reflection-children-close`}>{' }'}</span>);
  }

  // Something<string>
  if (exposed.typeArguments) {
    const numOfArguments = exposed.typeArguments.length;
    out.push(<span key="argument-open">{'<'}</span>);
    exposed.typeArguments.forEach((argument, ai) => {
      out.push(<TypeGenerator key={`argument-${ai}`} type={argument} />);

      if (ai + 1 < numOfArguments) {
        out.push(<span key={`argument-divider-${ai}`}>{', '}</span>);
      }
    });
    out.push(<span key="argument-close">{'>'}</span>);
  }

  return <>{out}</>;
}

export { TypeGenerator };
