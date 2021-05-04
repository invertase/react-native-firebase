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
import { Divider, HeadingLink } from '@invertase/ui';
import { Static } from '../types/reference';
import { EntityTable } from '../components/EntityTable';
import { MdxRaw } from '../components/Mdx';
import { SourceLink } from '../components/SourceLink';
import { MethodReference } from './Methods';
import { ReferenceProperty } from './Properties';

function Statics({ prefix, statics }: { prefix: string; statics: Static[] }): JSX.Element {
  return (
    <>
      <Divider />
      <HeadingLink id="statics" size="h3">
        Statics
      </HeadingLink>
      <EntityTable
        entities={statics.map(stat => ({
          name: stat.name,
          hash: stat.hash,
        }))}
      />
      {statics.map(stat => (
        <div key={stat.id}>
          <div className="flex items-end">
            <HeadingLink id={stat.hash} size="h4" className="flex-1">
              {stat.name}
            </HeadingLink>
            <SourceLink source={stat.source} />
          </div>
          <MdxRaw raw={stat.description} />
          {stat.kind === 'property' && (
            <ReferenceProperty name={`${prefix}.${stat.name}`} type={stat.type} />
          )}
          {stat.kind === 'method' && stat.signatures && (
            <>
              {stat.signatures?.map((signature, si) => {
                if (stat.signatures?.length) {
                  return (
                    <>
                      {stat.signatures.length > 1 && (
                        <div className="flex items-end">
                          <HeadingLink
                            id={`${signature.hash}-${si + 1}`}
                            size="h6"
                            className="flex-1"
                          >
                            <span>Signature {si + 1}</span>
                          </HeadingLink>
                          <SourceLink source={signature.source} />
                        </div>
                      )}
                      <MdxRaw raw={signature.description} />
                      <MethodReference
                        name={`${prefix}.${signature.name}`}
                        type={signature.type}
                        parameters={signature.parameters}
                      />
                    </>
                  );
                }

                return null;
              })}
            </>
          )}
        </div>
      ))}
    </>
  );
}

export { Statics };
