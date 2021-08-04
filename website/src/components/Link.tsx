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

import * as React from 'react';
import { Link as GatsbyLink } from 'gatsby';
import { LinkGetProps } from '@reach/router';
import { LocationContext } from '../context';

interface Props {
  children: string | React.ReactElement | React.ReactElement[];
  to: string;
  className?: string;
  target?: string;
  activeClass?: boolean;
  partiallyActiveClass?: boolean;
  onClick?: () => void;
}

const Link = ({
  children,
  to,
  target = '_self',
  className,
  activeClass = false,
  partiallyActiveClass = false,
  ...other
}: Props): JSX.Element => {
  function shouldHaveActiveClass({ isCurrent, isPartiallyCurrent }: LinkGetProps): {
    className?: string;
  } {
    if (activeClass && isCurrent) return { className: 'active' };
    if (partiallyActiveClass && isPartiallyCurrent) return { className: 'active' };
    return {};
  }

  const props = {
    className,
    target,
    rel: '',
  };

  // Handle auto targeting
  if (target === 'auto' && !Link.isInternal(to)) {
    props.target = '_blank';
  }

  // Open all new tab links with rel prop
  if (target === '_blank') {
    props.rel = 'noopener';
  }
  // Use Gatsby Link for internal links, and <a> for others
  if (Link.isInternal(to)) {
    const gatsbyLinkProps = {
      ...other,
      ...props,
      target: '_self',
      to,
    };

    if (gatsbyLinkProps.to.endsWith('/') && gatsbyLinkProps.to.length > 1) {
      gatsbyLinkProps.to = gatsbyLinkProps.to.slice(0, -1);
    }

    if (gatsbyLinkProps.to.startsWith('#')) {
      const location = React.useContext(LocationContext);
      gatsbyLinkProps.to = location.pathname + gatsbyLinkProps.to;
    }

    return (
      <GatsbyLink {...gatsbyLinkProps} getProps={shouldHaveActiveClass}>
        {children}
      </GatsbyLink>
    );
  }

  return (
    <a href={to} {...other} {...props}>
      {children}
    </a>
  );
};

Link.isInternal = (test: string): boolean => /^(?!([a-z][a-z0-9+\-.]*:)?\/\/)/.test(test); // test for uri not starting with valid scheme

export { Link };
