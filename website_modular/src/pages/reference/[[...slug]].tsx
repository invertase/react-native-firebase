import React from 'react';
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import hljs from 'highlight.js';
import sanitizeHtml from 'sanitize-html';
import { packages, join, exists, readFile } from '../../utils/paths';

import { Layout } from '../../components/Layout';
import { TableOfContents, unify } from '../../utils/unify';
import { HTMLRender } from '../../components/html-render';
import { getDocument } from '../../utils/dom';

export default function Reference({ source, toc }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout sidebar={[]} toc={toc}>
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
  // sidebar: ISidebar;
  frontmatter: { [key: string]: string };
  toc: TableOfContents;
};

export const getStaticProps: GetStaticProps = async context => {
  const params = (context.params?.slug ?? []) as string[];
  const slug = params.join('/');

  const [module] = params;

  const modulePath = join(packages, module, 'modular', 'docs', 'modules.md');
  const filePath = join(packages, module, 'modular', 'docs', `${slug}.md`);

  const path = params.length === 1 ? modulePath : filePath;

  if (!exists(path)) {
    return {
      notFound: true,
    };
  }

  let file = readFile(path);

  // Converts any local URLs to remove the `.md` extension.
  file = file.replace(/(?<=\]\(\/)(.*)(\.md)/gm, `$1`);

  // Serialize the markdown content via MDX
  const { html, toc } = unify(file);

  const document = getDocument(`<body>${html}</body>`);

  document.querySelectorAll('h3 + p').forEach(node => {
    const pre = document.createElement('pre');
    const code = document.createElement('code');
    const textarea = document.createElement('textarea');

    const innerText = sanitizeHtml(node.innerHTML, {
      allowedTags: [], // remove all tags and return text content only
      allowedAttributes: {}, // remove all tags and return text content only
    });

    // Decode any HTML entity characters: https://stackoverflow.com/a/42182294/11760094
    textarea.innerHTML = innerText.replace('▸ ', '');

    code.innerHTML = hljs.highlight(textarea.value, { language: 'typescript' }).value;
    code.classList.add('language-typescript');
    code.classList.add('hljs');

    pre.appendChild(code);
    node.replaceWith(pre);
  });

  return {
    props: {
      source: document.body.innerHTML,
      toc,
    },
    revalidate: 60,
  };
};
