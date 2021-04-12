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

import React, { CSSProperties, ReactElement, useState } from 'react';
import cx from 'classnames';
import styled from '@emotion/styled';
import { Scrollbar, icons } from '@invertase/ui';
import { Match } from '@reach/router';

import { Link } from './Link';
import { css } from '@emotion/core';
import { useLocation } from '../hooks';

const { Education, EditCopy, Link: LinkIcon, ChevronLeft, VideoCamera } = icons;

const Aside = styled.aside`
  &:before {
    content: '';
    position: absolute;
    top: 0;
    right: 0;
    width: 999em;
    height: 100%;
    background: -webkit-gradient(linear, left bottom, left top, from(#fff), to(#f5f5fa));
    background: linear-gradient(0deg, #fff, #f5f5fa);
  }
`;

// [title, url/children, icon/exact]
type Item = [string, string | Item, string | boolean];

interface Props {
  items: Item[];
  collapsible?: boolean;
  className?: string;
  innerClassName?: string;
  style?: CSSProperties;
}

function Sidebar({
  items,
  collapsible,
  className,
  innerClassName,
  style = {},
}: Props): JSX.Element {
  return (
    <>
      <Aside className={cx('relative pl-1', className)}>
        <Scrollbar
          id="sidebar"
          width={2}
          className={cx('sticky overflow-y-auto overflow-x-hidden pb-16', innerClassName)}
          style={{ height: '100vh', top: 0, ...style }}
        >
          <Link
            to="/"
            className="flex items-center h-20 border-b opacity-75 hover:opacity-100 transition-opacity duration-100"
          >
            <img
              src="//static.invertase.io/assets/React-Native-Firebase.svg"
              alt="Logo"
              className="w-8 h-8 mr-2"
            />
            <span className="uppercase text-sm text-primary tracking-wide">
              React Native Firebase
            </span>
          </Link>
          <nav className="pr-2 mt-4">
            <ul>
              <li>
                <Heading to="/" icon={<Education />}>
                  Documentation
                </Heading>
              </li>
              <li>
                <Heading to="/reference" icon={<EditCopy />}>
                  Reference API
                </Heading>
              </li>
              <li className="mb-4">
                <Heading to="/screencasts" icon={<VideoCamera />}>
                  Screencasts
                </Heading>
              </li>
              {items.map(([title, items, icon]) => {
                if (typeof items === 'string') {
                  return <ListItem to={items}>{title}</ListItem>;
                }

                if (Array.isArray(items)) {
                  const itemArray = items as Item[];
                  return (
                    <Group
                      collapsible={collapsible}
                      title={title}
                      icon={icon as string}
                      items={itemArray.map(item => ({
                        to: item[1] as string,
                        text: item[0] as string,
                        exact: !!item[2] as boolean,
                      }))}
                    />
                  );
                }

                return null;
              })}
            </ul>
          </nav>
        </Scrollbar>
      </Aside>
    </>
  );
}

function Heading({ to, icon, children }: { to: string; icon: ReactElement; children: string }) {
  return (
    <Link to={to} className="flex items-center mt-1 hover:bg-gray-200 rounded px-2 py-1">
      <span className="mr-3">{React.cloneElement(icon, { size: 18 })}</span>
      <span className="font-semibold">{children}</span>
    </Link>
  );
}

function ListItem({
  to,
  match,
  children,
  className,
}: {
  to: string;
  match?: string;
  children: string;
  className?: string;
}) {
  const isInternal = Link.isInternal(to);

  return (
    <li className={cx('mt-1', className)}>
      <Match path={match || to}>
        {({ match }) => (
          <Link
            to={to}
            target={isInternal ? '_self' : '_blank'}
            className={cx('flex items-center rounded px-2 py-1 text-sm', {
              'bg-gray-300': match,
              'hover:bg-gray-200': !match,
            })}
          >
            <span className="flex-1 truncate">{children}</span>
            {isInternal ? <span /> : <LinkIcon className="text-gray-500" size={16} />}
          </Link>
        )}
      </Match>
    </li>
  );
}

type GroupProps = {
  title: string;
  icon: string;
  collapsible?: boolean;
  items: {
    to: string;
    text: string;
    exact: boolean;
  }[];
};

const GroupList = styled.ul<{
  collapsible?: boolean;
  collapsed?: boolean;
  height?: number;
}>`
  overflow: hidden;

  ${props =>
    props.collapsible && props.collapsed
      ? css`
          max-height: 0;
        `
      : css`
          max-height: ${props.height};
        `}
`;

const Chevron = styled.span<{ collapsed: boolean }>`
  transition: transform 0.3s;
  ${props =>
    props.collapsed
      ? css`
          transform: rotate(-90deg);
        `
      : css`
          transform: rotate(90deg);
        `}
`;

function Group({ title, collapsible, icon, items }: GroupProps) {
  const location = useLocation();

  // When rendered, check if the current page is one in the items list so we can
  // open it by default
  const isPageInItems = items.find(i => i.to === location.pathname);
  const [collapsed, setCollapsed] = useState<boolean>(!isPageInItems);

  return (
    <li className="mt-5">
      <span
        className={cx('flex items-center font-semibold', {
          'cursor-pointer': collapsible,
        })}
        onClick={() => {
          if (collapsible) setCollapsed($ => !$);
        }}
      >
        <span className="flex-1 flex items-center">
          <img src={icon} alt={title} className="w-5 mr-2" />
          {title}
        </span>
        {collapsible ? (
          <Chevron
            collapsed={collapsed}
            className="text-xl text-gray-500 w-6 h-6 flex items-center justify-center"
          >
            <ChevronLeft className="text-gray-600" size={16} />
          </Chevron>
        ) : (
          <span />
        )}
      </span>
      <GroupList
        collapsible={collapsible}
        collapsed={collapsed}
        height={items.length * 33}
        className="text-sm text-gray-700 mt-2 ml-5"
      >
        {items.map(({ to, text, exact }) => (
          <ListItem to={to} key={to} match={exact ? undefined : `${to}/*`}>
            {text}
          </ListItem>
        ))}
      </GroupList>
    </li>
  );
}

export { Sidebar };
