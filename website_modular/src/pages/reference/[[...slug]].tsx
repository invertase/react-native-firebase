import React from 'react';
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { packages, join, exists, readFile, modulesPath, icons } from '../../utils/paths';

import { Layout } from '../../components/Layout';
import { TableOfContents, unify } from '../../utils/unify';
import { HTMLRender } from '../../components/html-render';
import {
  getDocument,
  getModuleTypes,
  highlightDefinitions,
  ModuleTypes,
  sanitizeDefinitions,
} from '../../utils/dom';
import { ISidebar, ISidebarItem } from '../../components/Sidebar';
import Head from 'next/head';

export default function Reference({
  source,
  sidebar,
  toc,
  frontmatter,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <>
      <Head>
        <title>{frontmatter.title}</title>
      </Head>
      <Layout sidebar={sidebar} toc={toc}>
        <HTMLRender source={source} />
      </Layout>
    </>
  );
}

export const getStaticPaths: GetStaticPaths = async () => {
  return {
    paths: [],
    fallback: 'blocking',
  };
};

type PageProps = {
  source: string;
  sidebar: ISidebar;
  frontmatter: { [key: string]: string };
  toc: TableOfContents;
};

const modules = {
  // app: 'App',
  storage: 'Storage',
};

export const getStaticProps: GetStaticProps<PageProps> = async context => {
  const params = (context.params?.slug ?? []) as string[];

  const [module, ...segments] = params;

  const slug = segments.join('/');

  // Check the module is enabled
  if (!modules[module]) {
    return {
      notFound: true,
    };
  }

  // Get the path based on the params
  const path =
    params.length === 1
      ? modulesPath(module)
      : join(packages, module, 'modular', 'docs', `${slug}.md`);

  // File must exist.. otherwise 404
  if (!exists(path)) {
    return {
      notFound: true,
    };
  }

  // Generate a types dictionary for all modules.
  let types: ModuleTypes = {};
  Object.keys(modules).forEach(key => {
    const file = readFile(modulesPath(key));
    const { html } = unify(file);

    types = {
      ...types,
      ...getModuleTypes(getDocument(html)),
    };
  });

  // Get the file
  let file = readFile(path);

  // Replace any local URLs to remove the `.md` extension.
  file = file.replace(/(?<=\]\(\/)(.*)(\.md)/gm, `$1`);

  // Serialize the markdown content via MDX
  const { html, toc } = unify(file);

  // Get the document from the converted markdown
  const document = getDocument(html);

  // Sanitize the generated definitions
  sanitizeDefinitions(document);

  highlightDefinitions(document, types);

  const sidebar: ISidebar = Object.entries(modules).map(([key, value]) => {
    const file = readFile(modulesPath(key));
    const { html } = unify(file);
    const types = getModuleTypes(getDocument(html));

    const children: ISidebar = [['Overview', `/reference/${key}`, null]];

    Object.entries(types).forEach(([type, href]) => {
      children.push([type, href, null]);
    });

    return [value, children, icons[key] || null] as ISidebarItem;
  });

  return {
    props: {
      sidebar,
      frontmatter: {
        title:
          document.getElementsByTagName('h1')[0]?.innerHTML ??
          `${modules[module]} | React Native Firebase`,
      },
      source: document.body.innerHTML,
      toc,
    },
    revalidate: 60,
  };
};
