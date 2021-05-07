import React from 'react';
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { MDXRemote, MDXRemoteSerializeResult } from 'next-mdx-remote';
import matter from 'gray-matter';
import yaml from 'js-yaml';

import { Layout } from '../components/Layout';
import type { ISidebar } from '../components/Sidebar';
import { Pre } from '../components/Pre';

import { root, listFiles, join, exists, readFile, sidebar } from '../utils/paths';
import { serialize } from '../utils/mdx';

export default function Slug({
  source,
  sidebar,
  frontmatter,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout sidebar={sidebar} title={frontmatter.title} description={frontmatter.description}>
      <MDXRemote
        {...source}
        components={{
          pre: Pre,
        }}
      />
    </Layout>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  // Get all markdown files from the docs directory
  const paths = listFiles(root, ['**/*.md']).map(path => {
    // Remove the full path and .md extension
    let slug = path.replace(root, '').replace('.md', '');

    // Remove any `index` paths
    if (slug.endsWith('/index')) {
      slug = slug.replace('/index', '');
    }

    return slug;
  });

  return {
    paths,
    fallback: 'blocking',
  };
};

type PageProps = {
  source: MDXRemoteSerializeResult;
  sidebar: ISidebar;
  frontmatter: { [key: string]: string };
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

  // Redirect the user if it exists in frontmatter
  if (data.redirect) {
    return {
      redirect: {
        destination: data.redirect,
        permanent: false,
      },
    };
  }

  // Serialize the markdown content via MDX
  const source = await serialize(content);

  return {
    props: {
      frontmatter: data,
      source,
      sidebar: yaml.load(readFile(sidebar)) as ISidebar,
    },
    revalidate: 60,
  };
};
