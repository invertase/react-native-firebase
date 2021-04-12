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
import { Algolia, icons } from '@invertase/ui';
import { Global, css } from '@emotion/core';
import { Link } from './Link';

const { GitHub, Twitter, Menu, Search } = icons;

interface Props {
  onMenuToggle: () => void;
}

function Header({ onMenuToggle }: Props): JSX.Element {
  return (
    <header className="h-32 pl-6 pr-6 lg:pl-12 flex bg-white flex items-center">
      <div className="flex items-center flex-1">
        <div className="lg:hidden mr-6 flex justify-center">
          <button onClick={() => onMenuToggle()}>
            <Menu size={26} className="text-black" />
          </button>
        </div>
        <SearchBar />
      </div>
      <div>
        <ul className="flex ml-6">
          <li>
            <Link
              to="https://github.com/invertase/react-native-firebase"
              target="_blank"
              className="inline-flex ml-4"
            >
              <GitHub
                size={26}
                className="text-black opacity-75 hover:opacity-100 transition-opacity duration-100"
              />
            </Link>
          </li>
          <li>
            <Link to="https://twitter.com/rnfirebase" target="_blank" className="inline-flex ml-4">
              <Twitter
                size={26}
                className="text-blue-400 opacity-75 hover:opacity-100 transition-opacity duration-100"
              />
            </Link>
          </li>
        </ul>
      </div>
    </header>
  );
}

function SearchBar() {
  return (
    <>
      <Global
        styles={css`
          .algolia-autocomplete {
            width: 100%;
            left: 0;
          }
          .ds-dropdown-menu {
            width: 100%;
          }
        `}
      />
      <Algolia
        apiKey="5fa6b47f5273a87e8462fe90a47b31fd"
        indexName="react-native-firebase"
        id="algolia-search"
      >
        <div className="relative flex items-center w-full">
          <Search size={16} className="absolute z-40 text-gray-500" />
          <input
            id="algolia-search"
            type="text"
            className="w-full border-b outline-none pl-8 pr-2 py-2"
            placeholder="Search..."
          />
        </div>
      </Algolia>
    </>
  );
}

export { Header };
