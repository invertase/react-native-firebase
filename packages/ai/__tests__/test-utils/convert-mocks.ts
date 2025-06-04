/**
 * @license
 * Copyright 2024 Google LLC
 *
 * Licensed under the Apache License, Version 2.0 (the "License");
 * you may not use this file except in compliance with the License.
 * You may obtain a copy of the License at
 *
 *   http://www.apache.org/licenses/LICENSE-2.0
 *
 * Unless required by applicable law or agreed to in writing, software
 * distributed under the License is distributed on an "AS IS" BASIS,
 * WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
 * See the License for the specific language governing permissions and
 * limitations under the License.
 */

// eslint-disable-next-line @typescript-eslint/no-require-imports
const fs = require('fs');
// eslint-disable-next-line @typescript-eslint/no-require-imports
const { join } = require('path');

function findMockResponseDir(backend: string): string {
  const directories = fs
    .readdirSync(__dirname, { withFileTypes: true })
    .filter(
      (dirent: any) => dirent.isDirectory() && dirent.name.startsWith('vertexai-sdk-test-data'),
    )
    .map((dirent: any) => dirent.name);

  if (directories.length === 0) {
    throw new Error('No directory starting with "vertexai-sdk-test-data*" found.');
  }

  if (directories.length > 1) {
    throw new Error('Multiple directories starting with "vertexai-sdk-test-data*" found');
  }

  return join(__dirname, directories[0], 'mock-responses', backend);
}

async function main(): Promise<void> {
  const backendNames = ['googleai', 'vertexai'];
  const lookup: Record<string, Record<string, string>> = {};

  for (const backend of backendNames) {
    const mockResponseDir = findMockResponseDir(backend);
    const list = fs.readdirSync(mockResponseDir);
    lookup[backend] = {};
    const backendLookup = lookup[backend];
    for (const fileName of list) {
      const fullText = fs.readFileSync(join(mockResponseDir, fileName), 'utf-8');
      backendLookup[fileName] = fullText;
    }
  }
  let fileText = `// Generated from mocks text files.`;

  fileText += '\n\n';
  fileText += `export const mocksLookup: Record<string, string> = ${JSON.stringify(
    lookup,
    null,
    2,
  )}`;
  fileText += ';\n';
  fs.writeFileSync(join(__dirname, 'mocks-lookup.ts'), fileText, 'utf-8');
}

main().catch(e => {
  console.error(e);
  process.exit(1);
});
