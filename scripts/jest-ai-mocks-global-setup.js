// Copyright (c) 2016-present Invertase Limited & Contributors
//
// Licensed under the Apache License, Version 2.0 (the "License");
// you may not use this library except in compliance with the License.
// You may obtain a copy of the License at
//
//   http://www.apache.org/licenses/LICENSE-2.0
//
// Unless required by applicable law or agreed to in writing, software
// distributed under the License is distributed on an "AS IS" BASIS,
// WITHOUT WARRANTIES OR CONDITIONS OF ANY KIND, either express or implied.
// See the License for the specific language governing permissions and
// limitations under the License.

const { execSync } = require('child_process');
const fs = require('fs');
const path = require('path');

function getArgvTestPathPatterns() {
  const patterns = [];
  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--testPathPatterns=')) {
      const value = arg.slice('--testPathPatterns='.length);
      if (value) {
        patterns.push(...value.split(','));
      }
      continue;
    }

    if (arg === '--testPathPatterns') {
      i += 1;
      while (i < argv.length && !argv[i].startsWith('-')) {
        patterns.push(argv[i]);
        i += 1;
      }
      i -= 1;
      continue;
    }

    if (arg.startsWith('--testPathPattern=')) {
      patterns.push(arg.slice('--testPathPattern='.length));
      continue;
    }

    if (arg === '--testPathPattern') {
      i += 1;
      if (argv[i]) {
        patterns.push(argv[i]);
      }
    }
  }

  return patterns;
}

function getArgvTestPathIgnorePatterns() {
  const patterns = [];
  const argv = process.argv.slice(2);

  for (let i = 0; i < argv.length; i++) {
    const arg = argv[i];
    if (arg.startsWith('--testPathIgnorePatterns=')) {
      const value = arg.slice('--testPathIgnorePatterns='.length);
      if (value) {
        patterns.push(...value.split(','));
      }
      continue;
    }

    if (arg === '--testPathIgnorePatterns') {
      i += 1;
      while (i < argv.length && !argv[i].startsWith('-')) {
        patterns.push(argv[i]);
        i += 1;
      }
      i -= 1;
    }
  }

  return patterns;
}

function walkTestFiles(dir, acc = []) {
  if (!fs.existsSync(dir)) {
    return acc;
  }

  for (const entry of fs.readdirSync(dir, { withFileTypes: true })) {
    const fullPath = path.join(dir, entry.name);
    if (entry.isDirectory()) {
      walkTestFiles(fullPath, acc);
    } else if (/\.test\.(ts|tsx|js|jsx)$/.test(entry.name)) {
      acc.push(fullPath.replace(/\\/g, '/'));
    }
  }

  return acc;
}

function getAiTestFiles(rootDir) {
  return walkTestFiles(path.join(rootDir, 'packages/ai/__tests__'));
}

function matchesPattern(filePath, pattern) {
  if (!pattern) {
    return true;
  }

  if (typeof pattern !== 'string') {
    return false;
  }

  try {
    return new RegExp(pattern).test(filePath);
  } catch {
    return filePath.includes(pattern);
  }
}

function isIgnored(filePath, ignorePatterns) {
  return ignorePatterns.some(pattern => matchesPattern(filePath, pattern));
}

function normalizePathArg(arg) {
  return arg.replace(/^\.\//, '').replace(/\\/g, '/');
}

function getTestPathPatterns(globalConfig) {
  const patterns = [];
  const configured = globalConfig.testPathPatterns;

  if (configured) {
    if (typeof configured === 'string') {
      patterns.push(configured);
    } else if (Array.isArray(configured)) {
      patterns.push(...configured.filter(Boolean));
    } else if (Array.isArray(configured.patterns)) {
      patterns.push(...configured.patterns.filter(Boolean));
    }
  }

  if (globalConfig.testPathPattern) {
    patterns.push(globalConfig.testPathPattern);
  }

  patterns.push(...getArgvTestPathPatterns());

  return patterns.filter(Boolean);
}

function wouldRunAnyAiTest(globalConfig) {
  const rootDir = globalConfig.rootDir || process.cwd();
  const aiTests = getAiTestFiles(rootDir);
  if (aiTests.length === 0) {
    return false;
  }

  const ignorePatterns = [
    ...(globalConfig.testPathIgnorePatterns || []),
    ...getArgvTestPathIgnorePatterns(),
  ];

  const testPathPatterns = getTestPathPatterns(globalConfig);

  const jestOptionValueFlags = new Set([
    '--config',
    '-c',
    '--testPathPattern',
    '--testPathIgnorePatterns',
    '--testPathIgnorePattern',
    '--testMatch',
    '--testPathPatterns',
    '--runTestsByPath',
    '--selectProjects',
    '--testNamePattern',
    '-t',
  ]);

  const positionalArgs = process.argv
    .slice(2)
    .filter((arg, index, arr) => {
      if (arg.startsWith('-')) {
        return false;
      }
      const prev = arr[index - 1];
      if (prev && jestOptionValueFlags.has(prev)) {
        return false;
      }
      return true;
    })
    .map(normalizePathArg);

  let candidates = aiTests;

  if (positionalArgs.length > 0) {
    candidates = aiTests.filter(filePath =>
      positionalArgs.some(
        arg => matchesPattern(filePath, arg) || filePath.includes(arg) || arg.includes(filePath),
      ),
    );
  } else if (testPathPatterns.length > 0) {
    candidates = aiTests.filter(filePath =>
      testPathPatterns.some(pattern => matchesPattern(filePath, pattern)),
    );
  }

  candidates = candidates.filter(filePath => !isIgnored(filePath, ignorePatterns));

  return candidates.length > 0;
}

function shouldFetchAiMocks(globalConfig) {
  return wouldRunAnyAiTest(globalConfig);
}

module.exports = async globalConfig => {
  if (!shouldFetchAiMocks(globalConfig)) {
    return;
  }

  execSync('yarn ts-node ./scripts/fetch_ai_mock_responses.ts', { stdio: 'inherit' });
  execSync('yarn ts-node ./packages/ai/__tests__/test-utils/convert-mocks.ts', {
    stdio: 'inherit',
  });
};
