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
import { Page } from '../components/Page';
import { PageReferenceQuery } from '../types/reference';
import { Divider, HeadingLink, Scrollbar, TableOfContents } from '@invertase/ui';
import { graphql } from 'gatsby';
import { MdxRaw } from '../components/Mdx';
import { generateReferenceSidebarFromModules, stringToColour } from './utils';
import { Link } from '../components/Link';
import { Tag } from '../components/Tag';

type Props = {
  location: Location;
  data: PageReferenceQuery;
};

function ReferenceTemplate({ location, data }: Props): JSX.Element {
  const { allModule } = data;

  const toc = (
    <>
      <div className="mt-4 text-gray-500 uppercase tracking-wider font-bold text-base lg:text-xs tracking-wide">
        Modules
      </div>
      <Scrollbar className="overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 340px)' }}>
        <TableOfContents
          scrollspy
          renderLink={(url: string, text: string) => <Link to={url}>{text}</Link>}
          items={allModule.nodes.map(({ module }) => ({
            url: `#${module}`,
            title: module,
          }))}
        />
      </Scrollbar>
    </>
  );

  return (
    <Page
      location={location}
      title="Reference API"
      description={'React Native Firebase Reference API'}
      sidebar={{
        collapsible: true,
        items: generateReferenceSidebarFromModules(allModule.nodes),
      }}
      aside={toc}
    >
      <main>
        <h1 className="flex-1 text-5xl font-hairline">Reference API</h1>
        <p className="mt-6">
          Page containing the full index of all React Native Firebase reference API types. All
          reference pages are automatically generated from the TypeScript ambient declaration files
          found in the GitHub repository.
        </p>
        <p className="mt-6">
          All contributions to help improve the TypeScript implementation of the library are
          welcome!
        </p>
        <Divider />
        {allModule.nodes.map(module => (
          <>
            <HeadingLink id={module.module} size="h3">
              {module.module}
            </HeadingLink>
            <table className="mt-6">
              <thead>
                <tr>
                  <th>API</th>
                  <th>Type</th>
                  <th>Description</th>
                </tr>
              </thead>
              <tbody>
                {module.entities.map(entity => (
                  <tr key={entity.id}>
                    <td>
                      <Link to={entity.slug}>
                        <code>{entity.name}</code>
                      </Link>
                    </td>
                    <td>
                      {!!entity.kind ? (
                        <Tag size="sm" background={stringToColour(entity.kind)} foreground="#fff">
                          {entity.kind}
                        </Tag>
                      ) : null}
                    </td>
                    <td>{!!entity.description ? <MdxRaw raw={entity.description} /> : null}</td>
                  </tr>
                ))}
              </tbody>
            </table>
          </>
        ))}
      </main>
    </Page>
  );
}

export const pageQuery = graphql`
  query {
    allModule {
      nodes {
        module
        moduleName
        mdx
        entities {
          id
          name
          kind
          description
          slug
        }
      }
    }
  }
`;

export default ReferenceTemplate;
