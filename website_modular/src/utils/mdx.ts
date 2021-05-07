import { serialize as mdxSerialize } from 'next-mdx-remote/serialize';

const rehypeSlug = require('rehype-slug');
const rehypeAccessibleEmojis = require('rehype-accessible-emojis').rehypeAccessibleEmojis;

const remarkUnwrapImages = require('remark-unwrap-images');

export async function serialize(markdown: string) {
  return mdxSerialize(markdown, {
    mdxOptions: {
      rehypePlugins: [rehypeSlug, rehypeAccessibleEmojis],
      remarkPlugins: [remarkUnwrapImages],
    },
  });
}
