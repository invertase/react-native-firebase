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
import { Divider, TableOfContents, Scrollbar, icons } from '@invertase/ui';

import { Page } from '../components/Page';
import { Mdx } from '../components/Mdx';
import { PageQuery } from '../types/docs';
import { Link } from '../components/Link';
import { PreviousNext, PreviousOrNextType } from '../components/PreviousNext';

const { EditPencil } = icons;

type Props = {
  location: Location;
  data: PageQuery;
};

function DocumentationTemplate({ location, data }: Props): JSX.Element {
  const { mdx, next, previous, sidebar } = data;

  const toc = (
    <>
      <div className="text-gray-500 uppercase tracking-wider font-bold text-base lg:text-xs tracking-wide">
        On this page
      </div>
      <Scrollbar className="overflow-y-auto pr-1" style={{ maxHeight: 'calc(100vh - 340px)' }}>
        <TableOfContents
          scrollspy
          renderLink={(url: string, text: string) => <Link to={url}>{text}</Link>}
          items={mdx.tableOfContents?.items || []}
        />
      </Scrollbar>
    </>
  );

  return (
    <Page
      location={location}
      title={mdx.frontmatter?.title || ''}
      description={mdx.frontmatter?.description || ''}
      sidebar={{
        collapsible: false,
        items: JSON.parse(sidebar.raw),
      }}
      aside={toc}
      noindex={mdx.frontmatter.noindex}
    >
      <main id="main">
        <div className="flex justify-end">
          <Link
            className="inline-flex items-center text-sm text-gray-600"
            to={`https://github.com/invertase/react-native-firebase/blob/main/docs/${mdx.parent.relativePath}`}
            target="_blank"
          >
            <>
              <EditPencil size={14} className="text-gray-500 mr-1" />
              Edit Page
            </>
          </Link>
        </div>
        <div className="mt-4 flex items-center">
          {mdx.frontmatter?.icon ? (
            <img src={mdx.frontmatter.icon} alt="Icon" className="h-10 mr-4" />
          ) : null}
          <h1 className="flex-1 text-5xl font-hairline">{mdx.frontmatter.title}</h1>
        </div>
        <p className="mt-6">{mdx.frontmatter.description}</p>
        <PreviousNext
          previous={
            previous
              ? ({
                  title: previous.frontmatter.title,
                  slug: previous.fields.slug,
                } as PreviousOrNextType)
              : undefined
          }
          next={
            next
              ? ({
                  title: next.frontmatter.title,
                  slug: next.fields.slug,
                } as PreviousOrNextType)
              : undefined
          }
        />
        <Divider />
        <Mdx body={mdx.body} />
      </main>
    </Page>
  );
}

export const pageQuery = graphql`
  query ($id: String!, $next: String!, $previous: String!) {
    mdx: mdx(id: { eq: $id }) {
      body
      frontmatter {
        title
        description
        icon
        noindex
      }
      excerpt
      tableOfContents
      headings {
        depth
        value
      }
      parent {
        ... on File {
          relativePath
        }
      }
    }
    next: mdx(fields: { slug: { eq: $next } }) {
      frontmatter {
        title
      }
      fields {
        slug
      }
    }
    previous: mdx(fields: { slug: { eq: $previous } }) {
      frontmatter {
        title
      }
      fields {
        slug
      }
    }
    sidebar(type: { eq: "documentation" }) {
      raw
    }
  }
`;

export default DocumentationTemplate;
