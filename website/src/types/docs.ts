export interface Advert {
  text: string;
  image: string;
  url: string;
}

export interface PageQuery {
  mdx: MdxQuery;
  next?: MdxNextPrevious;
  previous?: MdxNextPrevious;
  sidebar: {
    raw: string;
  };
}

export interface MdxQuery {
  body: string;
  frontmatter: MdxFrontmatter;
  excerpt?: string;
  tableOfContents: MdxTableOfContents;
  parent: ParentMdxFile;
}

export interface ParentMdxFile {
  relativePath: string;
}

export interface MdxNextPrevious {
  fields: MdxFields;
  frontmatter: MdxFrontmatter;
}

export interface MdxFields {
  slug: string;
}

export interface MdxFrontmatter {
  title?: string;
  description?: string;
  noindex?: boolean;
  icon?: string;
  tableOfContents: MdxTableOfContents;
}

export interface MdxTableOfContents {
  items?: MdxTableOfContentsItem[];
}

export interface MdxTableOfContentsItem {
  url: string;
  title: string;
  items?: MdxTableOfContentsItem[];
}
