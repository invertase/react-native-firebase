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
import { Divider } from '@invertase/ui';
import { graphql } from 'gatsby';
import { PageScreencastQuery } from '../types/screencast';
import { PreviousNext, PreviousOrNextType } from '../components/PreviousNext';

type Props = {
  location: Location;
  data: PageScreencastQuery;
};

function ScreencastTemplate({ location, data }: Props): JSX.Element {
  const cast = data.screenCast;
  const { next, previous } = data;

  return (
    <Page
      location={location}
      title={cast.title}
      description={cast.description}
      sidebar={{
        collapsible: false,
        items: data.allScreenCast.nodes.map((cast, index) => [
          `${index + 1}) ${cast.title}`,
          cast.slug,
        ]),
      }}
    >
      <main>
        <div>
          <h1 className="flex-1 text-5xl font-hairline truncate">{cast.title}</h1>
          <p className="mt-6">{cast.description}</p>
          <div className="inline-flex flex-wrap space-x-2 mt-6 text-sm">
            {cast.tags?.map((tag: any) => (
              <div key={tag} className="px-2 py-1 rounded border">
                {tag}
              </div>
            ))}
          </div>
          <Divider />
          <div className="relative" style={{ paddingBottom: '56.25%', paddingTop: 25, height: 0 }}>
            <iframe
              src={`https://www.youtube-nocookie.com/embed/${data.screenCast.vid}?autoplay=1&modestbranding=1`}
              frameBorder="0"
              allow="accelerometer; autoplay; encrypted-media; gyroscope; picture-in-picture"
              allowFullScreen
              className="absolute inset-0 w-full h-full rounded-lg"
            />
          </div>
          <Divider />
          <PreviousNext
            previous={
              previous
                ? ({
                    title: previous.title,
                    slug: previous.slug,
                  } as PreviousOrNextType)
                : undefined
            }
            next={
              next
                ? ({
                    title: next.title,
                    slug: next.slug,
                  } as PreviousOrNextType)
                : undefined
            }
          />
        </div>
      </main>
    </Page>
  );
}

export const pageQuery = graphql`
  query ($id: String!, $next: String!, $previous: String!) {
    screenCast(id: { eq: $id }) {
      title
      description
      vid
      tags
      slug
    }
    allScreenCast {
      nodes {
        title
        description
        vid
        tags
        slug
      }
    }
    next: screenCast(slug: { eq: $next }) {
      title
      slug
    }
    previous: screenCast(slug: { eq: $previous }) {
      title
      slug
    }
  }
`;

export default ScreencastTemplate;
