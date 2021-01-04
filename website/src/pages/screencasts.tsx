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
import { Link } from '../components/Link';
import { Divider } from '@invertase/ui';
import { graphql, useStaticQuery } from 'gatsby';

type Props = {
  location: Location;
};

function ScreenCasts({ location }: Props): JSX.Element {
  const { screencasts } = useStaticQuery(graphql`
    {
      screencasts: allScreenCast {
        nodes {
          id
          vid
          slug
          title
          description
          tags
        }
      }
    }
  `);

  return (
    <Page
      location={location}
      title="Screencasts"
      description="Watch & learn with screencasts covering React Native Firebase"
      sidebar={{
        collapsible: false,
        items: screencasts.nodes.map((cast: any, index: number) => [
          `${index + 1}) ${cast.title}`,
          cast.slug,
        ]),
      }}
    >
      <main id="main">
        <h1 className="flex-1 text-5xl font-hairline">Screencasts</h1>
        <p className="mt-6">
          Learn more about building React Native applications with React Native Firebase.
        </p>
        <Divider />
        <div className="grid lg:grid-cols-2 grid-cols-1 gap-8">
          {screencasts.nodes.map((cast: any) => (
            <Link
              to={cast.slug}
              key={cast.slug}
              className="border-transparent hover:border-transparent"
            >
              <div
                key={cast.id}
                className="border rounded-lg shadow-lg hover:shadow-xl transition-shadow duration-150 overflow-hidden"
                style={{ minHeight: '395px' }}
              >
                <div>
                  <img
                    src={`//img.youtube.com/vi/${cast.vid}/hqdefault.jpg`}
                    alt={cast.title}
                    className="h-full md:h-48 shadow object-cover w-full"
                  />
                </div>
                <div className="p-4">
                  <h2 className="font-bold">{cast.title}</h2>
                  <p className="mt-4 text-sm">{cast.description}</p>
                  <div className="inline-flex flex-wrap space-x-1 mt-4 text-xs">
                    {cast.tags?.map((tag: any) => (
                      <div key={tag} className="px-2 py-1 rounded border">
                        {tag}
                      </div>
                    ))}
                  </div>
                </div>
              </div>
            </Link>
          ))}
        </div>
      </main>
    </Page>
  );
}

export default ScreenCasts;
