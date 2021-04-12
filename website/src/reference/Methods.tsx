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

import React, { ReactElement } from 'react';
import { Method, Parameter } from '../types/reference';
import { CodeBlock, Divider, HeadingLink } from '@invertase/ui';
import { EntityTable } from '../components/EntityTable';
import { MdxRaw } from '../components/Mdx';
import { SourceLink } from '../components/SourceLink';
import { TypeGenerator } from '../components/TypeGenerator';

function Reference({
  name,
  type,
  parameters,
}: {
  name: string;
  type: string;
  parameters: Parameter[];
}): JSX.Element {
  const out: ReactElement[] = [];

  parameters.forEach((parameter, i) => {
    out.push(
      <span key={`parameter-${parameter.name}`} className="parameter">
        {parameter.name}
      </span>,
    );
    if (parameter.optional) {
      out.push(<span key={`parameter-optional-${parameter.name}`}>?</span>);
    }
    out.push(<span key={`parameter-cursor-${parameter.name}`}>{': '}</span>);
    out.push(<TypeGenerator key={`parameter-type-${parameter.name}`} type={parameter.type} />);

    if (i + 1 < parameters.length) {
      out.push(<span key={`parameter-divider`}>{', '}</span>);
    }
  });

  return (
    <CodeBlock>
      <span>
        {name}({out}):{' '}
      </span>
      <TypeGenerator type={type} />
      <span>;</span>
    </CodeBlock>
  );
}

function Methods({ methods }: { methods: Method[] }): JSX.Element {
  return (
    <>
      <Divider />
      <HeadingLink id="methods" size="h3">
        Methods
      </HeadingLink>
      <EntityTable
        entities={methods.map(method => ({
          name: method.name,
          hash: method.name,
        }))}
      />
      {methods.map(method => (
        <div key={method.id}>
          <div className="flex items-end">
            <HeadingLink id={method.name} size="h4" className="flex-1">
              {method.name}
            </HeadingLink>
            <SourceLink source={method.source} />
          </div>
          {method.signatures?.map((signature, si) => {
            if (method.signatures?.length) {
              return (
                <>
                  {method.signatures.length > 1 && (
                    <div className="flex items-end">
                      <HeadingLink id={`${signature.hash}-${si + 1}`} size="h6" className="flex-1">
                        <span>Signature {si + 1}</span>
                      </HeadingLink>
                      <SourceLink source={signature.source} />
                    </div>
                  )}
                  <MdxRaw raw={signature.description} />
                  <Reference
                    name={signature.name}
                    type={signature.type}
                    parameters={signature.parameters}
                  />
                </>
              );
            }

            return null;
          })}
        </div>
      ))}
    </>
  );
}

export { Methods, Reference as MethodReference };
