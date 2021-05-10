import React from 'react';
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import { packages, join, exists, readFile } from '../../utils/paths';

import { Layout } from '../../components/Layout';
import { TableOfContents, unify } from '../../utils/unify';
import { HTMLRender } from '../../components/html-render';

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

  return {
    props: {
      source: html,
      toc,
    },
    revalidate: 60,
  };
};
