import React from 'react';
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import sanitizeHtml from 'sanitize-html';
import { packages, join, exists, readFile, modulesPath, icons } from '../../utils/paths';

import { Layout } from '../../components/Layout';
import { TableOfContents, unify } from '../../utils/unify';
import { HTMLRender } from '../../components/html-render';
import { getDocument, getModuleTypes } from '../../utils/dom';
import { ISidebar, ISidebarItem } from '../../components/Sidebar';

export default function Reference({
  source,
  sidebar,
  toc,
}: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout sidebar={sidebar} toc={toc}>
      <HTMLRender source={source} />
    </Layout>
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

  // Path to the module root file
  const modulePath = modulesPath(module);
  console.log(params, slug);
  // Path to the slug file
  const filePath = join(packages, module, 'modular', 'docs', `${slug}.md`);

  // Get the path based on the params
  const path = params.length === 1 ? modulePath : filePath;
  console.log(path);
  // File must exist.. otherwise 404
  if (!exists(path)) {
    return {
      notFound: true,
    };
  }

  // Get the file
  let file = readFile(path);

  // Replace any local URLs to remove the `.md` extension.
  file = file.replace(/(?<=\]\(\/)(.*)(\.md)/gm, `$1`);

  // Serialize the markdown content via MDX
  const { html, toc } = unify(file);

  // Get the document from the converted markdown
  const document = getDocument(html);

  document.querySelectorAll('p').forEach(node => {
    const html = node.innerHTML;

    if (
      html.startsWith('\\+') ||
      html.startsWith('▸') ||
      html.startsWith('Ƭ') ||
      html.startsWith('▪') ||
      html.startsWith('•')
    ) {
      const pre = document.createElement('pre');
      const code = document.createElement('code');

      code.innerHTML = sanitizeHtml(node.innerHTML, {
        allowedTags: [], // remove all tags and return text content only
        allowedAttributes: {}, // remove all tags and return text content only
      });
      pre.appendChild(code);
      node.replaceWith(pre);
    }
  });

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
      frontmatter: {},
      source: document.body.innerHTML,
      toc,
    },
    revalidate: 60,
  };
};
