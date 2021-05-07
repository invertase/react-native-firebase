import React from 'react';
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import marked from 'marked';
import { packages, join, exists, readFile } from '../../utils/paths';
import { serialize } from '../../utils/mdx';

import { Layout } from '../../components/Layout';

export default function Reference({ source }: InferGetStaticPropsType<typeof getStaticProps>) {
  return (
    <Layout sidebar={[]}>
      <div dangerouslySetInnerHTML={{ __html: source }} />
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

  const source = marked(file);

  return {
    props: {
      source,
    },
    revalidate: 60,
  };
};
