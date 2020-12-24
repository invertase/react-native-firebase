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
import { Advert as AdvertType } from '../types/docs';
import { Link } from './Link';

function getRandomAdvert(adverts: AdvertType[]): AdvertType {
  return adverts[Math.floor(Math.random() * adverts.length)];
}

function Advert(): JSX.Element {
  const { allAdvert } = useStaticQuery(graphql`
    query AdvertQuery {
      allAdvert {
        nodes {
          url
          text
          image
        }
      }
    }
  `);

  const adverts = allAdvert.nodes as AdvertType[];
  const advert = getRandomAdvert(adverts);

  return (
    <div className="mt-8">
      <Link target="auto" to={advert.url} className="block">
        <img
          src={advert.image}
          alt="Advert Image"
          className="object-cover h-32 rounded-lg shadow hover:shadow-lg transition-shadow duration-300"
        />
        <p
          dangerouslySetInnerHTML={{ __html: advert.text }}
          className="mt-3 text-gray-600 text-xs"
        />
        <p className="mt-2 text-sm text-gray-800 font-medium hover:underline cursor-pointer">
          Learn More &raquo;
        </p>
      </Link>
    </div>
  );
}

export { Advert };
