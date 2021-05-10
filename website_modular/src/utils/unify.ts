import unified from 'unified';

// Remark plugins
import toRemark from 'remark-parse';
import remarkGfm from 'remark-gfm';
import remarkUnwrapImages from 'remark-unwrap-images';

// Rehype plugins
import toRehype from 'remark-rehype';
import toHtml from 'rehype-stringify';
import rehypeSlugs from 'rehype-slug';
import { rehypeAccessibleEmojis } from 'rehype-accessible-emojis';
import withToc, { Toc } from '@stefanprobst/rehype-extract-toc';
import toPrism from '@mapbox/rehype-prism';

const processor = unified()
  // Convert the raw markdown into remark format
  .use(toRemark)
  // Support GitHub flavored markdown
  .use(remarkGfm)
  // Prevent images from being wrapped in `p` tags
  .use(remarkUnwrapImages)
  // Convert remark content into rehype format
  .use(toRehype)
  // Attach `id` fields to headings
  .use(rehypeSlugs)
  // Return a table of contents with the file
  .use(withToc)
  // Make any emojis accessible
  .use(rehypeAccessibleEmojis)
  // Converts code blocks into PrismJS formatting
  .use(toPrism)
  // Convert rehype to a HTML string
  .use(toHtml);

export type TableOfContents = Toc;

export function unify(markdown: string) {
  const file = processor.processSync(markdown);
  const data = file.data as any;

  return {
    html: file.contents.toString(),
    toc: (data?.toc || []) as Toc,
  };
}
