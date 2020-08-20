import React from 'react';
import { graphql, useStaticQuery } from 'gatsby';
import { Advert as AdvertType } from '../types/docs';
import { Link } from './Link';

function getRandomAdvert(adverts: AdvertType[]) {
  return adverts[Math.floor(Math.random() * adverts.length)];
}

function Advert() {
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
