import React from 'react';
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import Head from 'next/head';
import matter from 'gray-matter';
import yaml from 'js-yaml';

import { Layout } from '../components/Layout';
import type { ISidebar } from '../components/Sidebar';
import { Pre } from '../components/Pre';

import { root, listFiles, join, exists, readFile, sidebar } from '../utils/paths';
import { TableOfContents, unify } from '../utils/unify';
import { HTMLRender } from '../components/html-render';

export default function Slug({
  source,
  sidebar,
  frontmatter,
  toc,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  const { title, description } = frontmatter;

  return (
    <>
      <Head>
        <title>{title ? `${title} | React Native Firebase` : 'React Native Firebase'}</title>
        {!!description && <meta name="description" content={description} />}
      </Head>
      <Layout sidebar={sidebar} toc={toc}>
        {!!title && (
          <div className="pb-8 mb-8 border-b">
            <h2 className="inline-block text-4xl font-extrabold tracking-tight text-gray-900">
              {title}
            </h2>
            {!!description && <p className="mt-3 text-lg text-gray-500">{description}</p>}
          </div>
        )}
        <HTMLRender source={source} />
      </Layout>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Get all markdown files from the docs directory
  const paths = listFiles(root, ['**/*.md'])
    .map(path => {
      // Remove the full path and .md extension
      let slug = path.replace(root, '').replace('.md', '');

      // Remove any `index` paths
      if (slug.endsWith('/index')) {
        slug = slug.replace('/index', '');
      }

      return slug;
    })
    .filter(($, i) => $.length !== 0);

  return {
    paths,
    fallback: 'blocking',
  };
};

type PageProps = {
  source: string;
  sidebar: ISidebar;
  frontmatter: { [key: string]: string };
  toc: TableOfContents;
};

export const getStaticProps: GetStaticProps<PageProps> = async context => {
  const params = (context.params?.slug ?? []) as string[];
  const slug = `/${params.join('/')}`;

  let path: string;

  const fullPath = join(root, `${slug}.md`);
  const indexPath = join(root, slug, '/index.md');

  if (exists(fullPath)) {
    path = fullPath;
  } else if (exists(indexPath)) {
    path = indexPath;
  }

  if (!path) {
    return {
      notFound: true,
    };
  }

  // Get the file content
  const file = readFile(path);

  // Extract any frontmatter from the content
  const { content, data } = matter(file);

  // TODO Causes an error when building
  // Redirect the user if it exists in frontmatter
  // if (data.redirect) {
  //   return {
  //     redirect: {
  //       destination: data.redirect,
  //       permanent: false,
  //     },
  //   };
  // }

  // Serialize the markdown content via MDX
  const { html, toc } = unify(content);

  return {
    props: {
      frontmatter: data,
      source: html,
      sidebar: yaml.load(readFile(sidebar)) as ISidebar,
      toc,
    },
    revalidate: 60,
  };
};
