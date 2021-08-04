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
import { graphql } from 'gatsby';
import { Divider, Scrollbar, TableOfContents } from '@invertase/ui';
import { Entity, PageContext, PageEntityQuery } from '../types/reference';
import { Page } from '../components/Page';
import { PreviousNext, PreviousOrNextType } from '../components/PreviousNext';
import {
  extractEntityFromModules,
  generateReferenceSidebarFromModules,
  generateTableOfContentsFromEntities,
  stringToColour,
} from './utils';
import { MdxRaw } from '../components/Mdx';
import { Tag } from '../components/Tag';
import { Properties } from '../reference/Properties';
import { Enum } from '../reference/Enum';
import { Methods } from '../reference/Methods';
import { Type } from '../reference/Type';
import { Link } from '../components/Link';
import { EditPencil } from '@invertase/ui/dist/icons';
import { Statics } from '../reference/Statics';

type Props = {
  location: Location;
  data: PageEntityQuery;
  pageContext: PageContext;
};

function EntityTemplate({ location, data, pageContext }: Props): JSX.Element | null {
  const { id, previous, next } = pageContext;
  const { module, allModule } = data;

  // Grab the entity from the module
  const entity = module.entities.find(e => e.id === id) as Entity;

  // Whether the current entity is the root one
  const isRootEntityPage = entity.name === module.module;

  if (!entity) {
    return null;
  }

  // Find the next/previous entities
  const previousEntity = extractEntityFromModules(allModule.nodes, previous);
  const nextEntity = extractEntityFromModules(allModule.nodes, next);

  const toc = (
    <>
      <div className="text-gray-500 uppercase tracking-wider font-bold text-base lg:text-xs tracking-wide">
        On this page
      </div>
      <Scrollbar className="overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 340px)' }}>
        <TableOfContents
          scrollspy
          renderLink={(url: string, text: string) => <Link to={url}>{text}</Link>}
          items={generateTableOfContentsFromEntities({
            members: entity.members || null,
            properties: entity.properties || null,
            methods: entity.methods || null,
            statics: isRootEntityPage ? module.statics : null,
          })}
        />
      </Scrollbar>
    </>
  );

  return (
    <Page
      location={location}
      title={entity.name}
      sidebar={{
        collapsible: true,
        items: generateReferenceSidebarFromModules(allModule.nodes),
      }}
      aside={toc}
    >
      <main>
        <div className="flex justify-end">
          <Link
            className="inline-flex items-center text-sm text-gray-500"
            to={entity.source}
            target="_blank"
          >
            <>
              <EditPencil size={14} className="text-gray-400 mr-2" />
              Edit Page
            </>
          </Link>
        </div>
        <div className="flex items-center">
          <h1 className="flex-1 text-5xl font-hairline truncate">{entity.name}</h1>

          {!!entity.kind ? (
            <div>
              <Tag background={stringToColour(entity.kind)} foreground="#fff">
                {entity.kind}
              </Tag>
            </div>
          ) : null}
        </div>
        {entity.description ? <MdxRaw raw={entity.description} /> : null}
        <PreviousNext
          previous={
            previousEntity
              ? ({
                  title: previousEntity.name,
                  slug: previousEntity.slug,
                } as PreviousOrNextType)
              : undefined
          }
          next={
            nextEntity
              ? ({
                  title: nextEntity.name,
                  slug: nextEntity.slug,
                } as PreviousOrNextType)
              : undefined
          }
        />
        {!!entity.mdx && entity.mdx.length != 1687 ? (
          <>
            <Divider />
            <MdxRaw raw={entity.mdx} />
          </>
        ) : null}
        {entity.type ? <Type type={entity.type} /> : null}
        {entity.members?.length ? <Enum members={entity.members} /> : null}
        {entity.properties?.length ? <Properties properties={entity.properties} /> : null}
        {entity.methods?.length ? <Methods methods={entity.methods} /> : null}
        {isRootEntityPage && !!module.statics?.length && (
          <Statics prefix={module.module} statics={module.statics} />
        )}
      </main>
    </Page>
  );
}

export const pageQuery = graphql`
  query ($id: String!) {
    module(entities: { elemMatch: { id: { eq: $id } } }) {
      module

      statics {
        kind
        name
        type
        description
        hash
        mdx
        source

        signatures {
          name
          description
          type
          parameters {
            type
            name
          }
        }
      }

      entities {
        id
        name
        description
        kind
        mdx
        source
        type

        # Enums
        members {
          defaultValue
          description
          excerpt
          kind
          mdx
          name
          source
        }

        properties {
          description
          mdx
          name
          inherited
          hash
          type
          source
          tags {
            param
            tag
            text
          }
        }

        methods {
          id
          name
          source

          signatures {
            id
            mdx
            name
            hash
            excerpt
            description
            type
            source

            parameters {
              description
              mdx
              name
              type
              optional
            }
          }
        }
      }
    }
    allModule {
      nodes {
        module
        moduleName
        id
        entities {
          id
          name
          description
          slug
        }
      }
    }
  }
`;

export default EntityTemplate;
