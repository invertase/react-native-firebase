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

import React from 'react';

function BlockQuote({ children }: any): JSX.Element {
  return (
    <blockquote className="my-8 bg-blue-500 text-white rounded shadow-lg p-4 shadow-lg border-b-4 border-blue-900">
      {children}
    </blockquote>
  );
}

export { BlockQuote };
