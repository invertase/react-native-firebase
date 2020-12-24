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

import React, { ReactElement, useState } from 'react';
import { ThemeProvider, Mask } from '@invertase/ui';
import Helmet from 'react-helmet';

import '../tailwind.css';
import '../styles.css';
import { Header } from './Header';
import { Sidebar } from './Sidebar';
import { Footer } from './Footer';
import { ToTop } from './ToTop';
import { LocationContext } from '../context';
import { Advert } from './Advert';

interface Props {
  title?: string;
  description?: string;
  noindex?: boolean;
  location: Location;
  children: ReactElement | ReactElement[];
  sidebar: {
    collapsible?: boolean;
    items: any;
  };
  aside?: ReactElement;
}

function Page({
  title,
  description,
  noindex,
  children,
  sidebar,
  aside,
  location,
}: Props): JSX.Element {
  const [showSidebar, setShowSidebar] = useState<boolean>(false);
  const meta: { [key: string]: string } = {
    title: title ? `${title} | React Native Firebase` : 'React Native Firebase',
    description:
      description ||
      'React Native Firebase is a collection of official React Native modules connecting you to Firebase services',
    favicon: '//static.invertase.io/assets/react-native-firebase-favicon.png',
    logo: '',
    image: '',
  };

  return (
    <>
      <Helmet>
        <title>{meta.title}</title>
        <meta name="description" content={meta.description} />
        <link rel="icon" type="image/png" href={meta.favicon} />
        <meta name="image" content={meta.image} />
        {noindex && <meta name="robots" content="noindex" />}

        {/* Twitter Card */}
        <meta name="twitter:card" content="summary" />
        <meta name="twitter:title" content={meta.title} />
        <meta name="twitter:description" content={meta.description} />

        {/* OG Card */}
        <meta name="og:title" content={meta.title} />
        <meta name="og:description" content={meta.description} />
        <meta name="og:image" content={meta.image} />
        {/* <meta name="og:url" content={route} /> */}
        <meta name="og:site_name" content="React Native Firebase" />
        <meta name="og:type" content="website" />
      </Helmet>
      <LocationContext.Provider value={location}>
        <ThemeProvider value="react-native-firebase">
          <ToTop />
          <Mask visible={showSidebar} onClose={() => setShowSidebar(false)}>
            <div className="pl-2 w-64 fixed top-0 left-0 bottom-0 z-50">
              <Sidebar collapsible={sidebar.collapsible} items={sidebar.items} className="w-full" />
            </div>
          </Mask>
          <div className="relative">
            <div className="mx-auto" style={{ maxWidth: '80rem' }}>
              <div className="flex">
                <Sidebar
                  collapsible={sidebar.collapsible}
                  items={sidebar.items}
                  className="lg:w-64 hidden lg:block"
                />
                <div className="flex-1">
                  <Header onMenuToggle={() => setShowSidebar(true)} />
                  <div className="grid grid-cols-12">
                    <section className="px-4 md:px-12 mb-16 col-span-12 md:col-span-10">
                      {children}
                    </section>
                    <div className="hidden md:block col-span-2">
                      <div className="sticky top-0">
                        <div className="absolute right-0 w-40 pr-1">
                          {aside}
                          <Advert />
                        </div>
                      </div>
                    </div>
                  </div>
                </div>
              </div>
            </div>
          </div>
          <Footer />
        </ThemeProvider>
      </LocationContext.Provider>
    </>
  );
}

export { Page };
