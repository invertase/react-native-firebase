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

/* eslint-disable react/display-name */
import React, { ReactElement } from 'react';
import cx from 'classnames';
import { MDXRenderer } from 'gatsby-plugin-mdx';
import { mdx, MDXProvider } from '@mdx-js/react';
import { HeadingLink, ImageZoom, CodeBlock, Youtube } from '@invertase/ui';

import { BlockQuote } from './BlockQuote';
import { Link } from './Link';

type Props = {
  body: string;
};

const text = 'leading-loose';

const components = {
  // Headings
  h1: ({ id, children }: any) => (
    <HeadingLink id={id || ''} size="h1" as="h2">
      {children}
    </HeadingLink>
  ),
  h2: ({ id, children }: any) => (
    <HeadingLink id={id || ''} size="h2" as="h3">
      {children}
    </HeadingLink>
  ),
  h3: ({ id, children }: any) => (
    <HeadingLink id={id || ''} size="h3" as="h4">
      {children}
    </HeadingLink>
  ),
  h4: ({ id, children }: any) => (
    <HeadingLink id={id || ''} size="h4" as="h5">
      {children}
    </HeadingLink>
  ),
  h5: ({ id, children }: any) => (
    <HeadingLink id={id || ''} size="h5" as="h6">
      {children}
    </HeadingLink>
  ),
  h6: ({ id, children }: any) => (
    <HeadingLink id={id || ''} size="h6">
      {children}
    </HeadingLink>
  ),

  // Text
  p: ({ children }: any) => {
    return <p className={cx('my-4', text)}>{children}</p>;
  },

  // Code
  pre: ({ className, children }: any) => <CodeBlock className={className}>{children}</CodeBlock>,
  code: ({ className, ...props }: any) => {
    return <code {...props} className={className || 'language-text'} />;
  },

  // Lists
  ul: (props: any) => <ul {...props} className="list-disc list-inside pl-4" />,
  ol: (props: any) => <ul {...props} className="list-decimal list-inside pl-4" />,
  li: (props: any) => <li {...props} className={cx('mb-2', text)} />,

  // Table
  table: (props: any) => (
    <table
      {...props}
      className="overflow-x-auto border-collapse"
      style={{ width: 'list-content' }}
    />
  ),

  // Meta
  img: ({ src, alt }: any) => {
    let _alt = alt;
    let hide = false;
    if (_alt?.startsWith('hide:')) {
      hide = true;
      _alt = alt.replace('hide:');
    }

    return (
      <figure className="block my-6 text-center">
        <ImageZoom src={src} alt={_alt} />
        {!!alt && !hide && <figcaption className="mt-4 text-xs">{_alt}</figcaption>}
      </figure>
    );
  },
  a: ({ href, children }: any) => (
    <Link to={href} target="auto">
      {children}
    </Link>
  ),
  blockquote: ({ children }: any) => <BlockQuote>{children}</BlockQuote>,

  Youtube: ({ id }: any) => (
    <div>
      <Youtube id={id} />
    </div>
  ),
};

function Provider({ children }: { children: ReactElement }): JSX.Element {
  return <MDXProvider components={components}>{children}</MDXProvider>;
}

function Mdx({ body }: Props): JSX.Element {
  return (
    <Provider>
      <MDXRenderer>{body}</MDXRenderer>
    </Provider>
  );
}

function MdxRaw({ raw }: { raw: string }): JSX.Element {
  let fn;
  try {
    fn = new Function('React', 'mdx', `${raw}; return React.createElement(MDXContent)`);
  } catch (e) {
    throw e;
  }

  // @ts-ignore
  const element = fn(React, mdx);
  return <Provider>{element}</Provider>;
}

export { Mdx, MdxRaw };
