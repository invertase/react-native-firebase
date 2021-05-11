import React from 'react';
import { GetStaticPaths, GetStaticProps, InferGetStaticPropsType } from 'next';
import Head from 'next/head';

export default function Screencasts() {
  return <div></div>;
}

type Screencast = {
  slug: string;
  vid: string;
  title: string;
  description: string;
  tags: string[];
};

type PageProps = {
  screencasts: Screencast[];
};

export const getStaticProps: GetStaticProps<PageProps> = async context => {
  return {
    props: {
      screencasts: [],
    },
    revalidate: 60,
  };
};
