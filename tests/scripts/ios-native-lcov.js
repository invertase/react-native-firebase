/*
 * Shared iOS native LCOV helpers: rewrite SF: to repo-relative packages/** and merge
 * unit + e2e reports so both count toward coverage/ios-native/lcov.info.
 *
 * See okf-bundle/testing/coverage-design.md.
 */
const fs = require('fs');
const path = require('path');

function normalizeSourcePath(sourcePath) {
  const normalized = sourcePath.replace(/\\/g, '/');

  const packagesIdx = normalized.indexOf('/packages/');
  if (packagesIdx >= 0) {
    return normalized.slice(packagesIdx + 1);
  }

  const rnfbMatch = normalized.match(/@react-native-firebase\/([^/]+)\/(.+)$/);
  if (rnfbMatch) {
    return `packages/${rnfbMatch[1]}/${rnfbMatch[2]}`;
  }

  const testsIdx = normalized.indexOf('/tests/');
  if (testsIdx >= 0) {
    return normalized.slice(testsIdx + 1);
  }

  return normalized.replace(/^\.\//, '');
}

function parseLcov(content) {
  const records = new Map();
  let current = null;

  const ensure = file => {
    if (!records.has(file)) {
      records.set(file, {
        file,
        functions: [],
        lines: new Map(),
        branches: [],
        extras: [],
      });
    }
    return records.get(file);
  };

  for (const raw of content.split(/\r?\n/)) {
    if (raw.startsWith('SF:')) {
      current = ensure(normalizeSourcePath(raw.slice(3)));
    } else if (raw === 'end_of_record') {
      current = null;
    } else if (!current) {
      continue;
    } else if (raw.startsWith('DA:')) {
      const [lineStr, hitsStr] = raw.slice(3).split(',');
      const line = Number(lineStr);
      const hits = Number(hitsStr);
      current.lines.set(line, Math.max(current.lines.get(line) || 0, hits));
    } else if (raw.startsWith('LF:') || raw.startsWith('LH:')) {
      // recomputed on serialize
    } else if (raw.startsWith('FN:') || raw.startsWith('FNDA:')) {
      current.functions.push(raw);
    } else if (raw.startsWith('BRDA:') || raw.startsWith('BRF:') || raw.startsWith('BRH:')) {
      current.branches.push(raw);
    } else if (raw.length > 0) {
      current.extras.push(raw);
    }
  }

  return records;
}

function serializeLcov(records) {
  const chunks = [];
  for (const record of records.values()) {
    if (record.file.includes('UnitTests/')) {
      continue;
    }
    chunks.push(`SF:${record.file}`);
    for (const extra of record.extras) {
      chunks.push(extra);
    }
    for (const fn of record.functions) {
      chunks.push(fn);
    }
    const lineNumbers = [...record.lines.keys()].sort((a, b) => a - b);
    for (const line of lineNumbers) {
      chunks.push(`DA:${line},${record.lines.get(line)}`);
    }
    chunks.push(`LF:${lineNumbers.length}`);
    chunks.push(`LH:${lineNumbers.filter(line => record.lines.get(line) > 0).length}`);
    for (const branch of record.branches) {
      chunks.push(branch);
    }
    chunks.push('end_of_record');
  }
  return `${chunks.join('\n')}\n`;
}

function mergeLcovContents(...contents) {
  const merged = new Map();
  for (const content of contents) {
    if (!content || !content.trim()) {
      continue;
    }
    for (const [file, record] of parseLcov(content)) {
      if (!merged.has(file)) {
        merged.set(file, {
          file,
          functions: [...record.functions],
          lines: new Map(record.lines),
          branches: [...record.branches],
          extras: [...record.extras],
        });
        continue;
      }
      const dest = merged.get(file);
      for (const [line, hits] of record.lines) {
        dest.lines.set(line, Math.max(dest.lines.get(line) || 0, hits));
      }
      dest.functions.push(...record.functions);
      dest.branches.push(...record.branches);
    }
  }
  return serializeLcov(merged);
}

function rewriteLcovContent(content) {
  return serializeLcov(parseLcov(content));
}

function mergeLcovFiles(outputPath, inputPaths) {
  const contents = inputPaths
    .filter(filePath => fs.existsSync(filePath))
    .map(filePath => fs.readFileSync(filePath, 'utf8'));
  if (contents.length === 0) {
    return { merged: false, sourceFiles: 0 };
  }
  const merged = mergeLcovContents(...contents);
  fs.mkdirSync(path.dirname(outputPath), { recursive: true });
  fs.writeFileSync(outputPath, merged);
  const sourceFiles = (merged.match(/^SF:/gm) || []).length;
  return { merged: true, sourceFiles };
}

module.exports = {
  mergeLcovContents,
  mergeLcovFiles,
  normalizeSourcePath,
  parseLcov,
  rewriteLcovContent,
  serializeLcov,
};
