/*
 * Copyright (c) 2016-present Invertase Limited & Contributors
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this library except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 *
 */

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
