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
import { Link } from './Link';

function Footer(): JSX.Element {
  return (
    <footer className="relative z-10 bg-gray-900 text-white font-hairline py-24">
      <div className="mx-auto grid grid-cols-3 gap-4" style={{ maxWidth: 800 }}>
        <div>
          <Heading>GitHub</Heading>
          <List
            items={[
              ['Repository', 'https://github.com/invertase/react-native-firebase'],
              ['License', 'https://github.com/invertase/react-native-firebase/blob/main/LICENSE'],
              ['Pull Requests', 'https://github.com/invertase/react-native-firebase/pulls'],
              [
                'Contributors',
                'https://github.com/invertase/react-native-firebase/graphs/contributors',
              ],
            ]}
          />
        </div>
        <div>
          <Heading>Find us on</Heading>
          <List
            items={[
              ['Twitter', 'https://twitter.com/rnfirebase'],
              ['NPM', 'https://npmjs.com/package/react-native-firebase'],
              ['Discord', 'https://invertase.link/discord'],
              [
                'Stack Overflow',
                'https://stackoverflow.com/questions/tagged/react-native-firebase',
              ],
            ]}
          />
        </div>
        <div>
          <Heading>Invertase</Heading>
          <List
            items={[
              ['Open Source Software', 'https://invertase.io/oss'],
              ['GitHub', 'https://github.com/invertase'],
              ['Facebook', 'https://www.facebook.com/invertase.io'],
              ['Twitter', 'https://twitter.com/invertaseio'],
              ['React Native Market', 'https://react-native.market/'],
              ['Notifee', 'https://notifee.app'],
            ]}
          />
        </div>
      </div>
      <div className="mx-auto flex flex-col items-center text-center mt-20">
        <img
          src="https://static.invertase.io/assets/invertase-white.png"
          alt="Invertase Logo"
          className="w-8 h-8 mb-4"
        />
        <span className="mb-2">Invertase Limited</span>
        <span className="text-xs">&copy; 2015-{new Date().getFullYear()}</span>
      </div>
      <div className="max-w-4xl mx-auto text-center text-xs mt-8">
        <p>
          Copyright © 2017-2020 Invertase Limited. Except as otherwise noted, the content of this
          page is licensed under the{' '}
          <Link to="http://creativecommons.org/licenses/by/3.0/">
            Creative Commons Attribution 3.0 License
          </Link>
          , and code samples are licensed under the Apache 2.0 License. Some partial documentation,
          under the Creative Commons Attribution 3.0 License, may have been sourced from{' '}
          <Link to="https://firebase.google.com/docs">Firebase</Link>.
        </p>
        <p className="mt-4">
          All product names, logos, and brands are property of their respective owners. All company,
          product and service names used in this website are for identification purposes only. Use
          of these names, logos, and brands does not imply endorsement.
        </p>
      </div>
    </footer>
  );
}

function Heading({ children }: { children: string }) {
  return <div className="font-semibold mb-6">{children}</div>;
}

function List({ items }: { items: [string, string][] }) {
  return (
    <ul>
      {items.map(i => (
        <li className="mb-2" key={i[0]}>
          <Link to={i[1]} className="text-sm hover:underline">
            {i[0]}
          </Link>
        </li>
      ))}
    </ul>
  );
}

export { Footer };
