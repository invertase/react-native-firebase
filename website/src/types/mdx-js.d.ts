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

declare module '@mdx-js/react' {
  import * as React from 'react';
  type ComponentType =
    | 'p'
    | 'h1'
    | 'h2'
    | 'h3'
    | 'h4'
    | 'h5'
    | 'h6'
    | 'thematicBreak'
    | 'blockquote'
    | 'ul'
    | 'ol'
    | 'li'
    | 'table'
    | 'tr'
    | 'td'
    | 'pre'
    | 'code'
    | 'em'
    | 'strong'
    | 'delete'
    | 'inlineCode'
    | 'hr'
    | 'a'
    | 'img';

  export type Components = {
    [key in ComponentType]?: React.ComponentType<{ children: React.ReactNode }>;
  };

  export interface MDXProviderProps {
    children: React.ReactNode;
    components: Components;
  }

  export type mdx = any;

  export class MDXProvider extends React.Component<MDXProviderProps> {}
}
