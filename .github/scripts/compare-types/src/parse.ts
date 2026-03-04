/**
 * Uses ts-morph to parse .d.ts files and extract export shapes.
 * We use getTypeNode()?.getText() throughout to read the type text as-written
 * in the source file, so unresolved external imports (e.g. @firebase/app) are
 * not a problem — they simply appear as their short name strings.
 */

import fs from 'fs';
import {
  Project,
  Node,
  type ExportedDeclarations,
  type SourceFile,
} from 'ts-morph';
import type {
  ExportEntry,
  ExportShape,
  InterfaceMember,
  FunctionShape,
  InterfaceShape,
  TypeAliasShape,
  VariableShape,
} from './types';

// ---------------------------------------------------------------------------
// Normalization helpers
// ---------------------------------------------------------------------------

/**
 * Normalizes type text so that formatting-only differences (multi-line vs
 * single-line, whitespace around punctuation, trailing commas) do not affect
 * comparison. Types that are semantically identical should compare equal.
 */
function normalizeType(s: string): string {
  return (
    s
      .trim()
      // Collapse all whitespace (including newlines) to a single space
      .replace(/\s+/g, ' ')
      // Strip a leading pipe that TypeScript emits when a union type is
      // written with a leading `|` on each line (e.g. `| 'a' | 'b'` → `'a' | 'b'`)
      .replace(/^\| /, '')
      // Remove spaces adjacent to brackets/parens/commas/colons so that
      // `( k: infer I, )` and `(k: infer I)` normalize to the same string
      .replace(/\s*\(\s*/g, '(')
      .replace(/\s*\)\s*/g, ')')
      .replace(/\s*\[\s*/g, '[')
      .replace(/\s*\]\s*/g, ']')
      .replace(/\s*<\s*/g, '<')
      .replace(/\s*>\s*/g, '>')
      .replace(/\s*,\s*/g, ',')
      .replace(/\s*:\s*/g, ':')
      .replace(/\s*\{\s*/g, '{')
      .replace(/\s*\}\s*/g, '}')
      // Remove trailing comma before ) or ] (formatting-only)
      .replace(/,\s*\)/g, ')')
      .replace(/,\s*\]/g, ']')
      // Remove leading comma after ( or [ (formatting-only)
      .replace(/\(\s*,/g, '(')
      .replace(/\[\s*,/g, '[')
  );
}

// ---------------------------------------------------------------------------
// Shape extraction
// ---------------------------------------------------------------------------

function extractFunctionShape(
  decl: Parameters<typeof Node.isFunctionDeclaration>[0] & {
    getParameters: () => { getTypeNode: () => { getText: () => string } | undefined; isRestParameter: () => boolean }[];
    getReturnTypeNode: () => { getText: () => string } | undefined;
  },
): FunctionShape {
  const params = (decl as any).getParameters().map((p: any) => {
    const typeNode = p.getTypeNode();
    const typeText = typeNode ? normalizeType(typeNode.getText()) : 'any';
    return p.isRestParameter() ? `...${typeText}` : typeText;
  });
  const returnType = normalizeType(
    (decl as any).getReturnTypeNode()?.getText() ?? 'void',
  );
  return { kind: 'function', params, returnType };
}

function extractInterfaceShape(decl: any): InterfaceShape {
  const members: InterfaceMember[] = [];
  for (const member of decl.getMembers()) {
    if (Node.isPropertySignature(member)) {
      const typeNode = member.getTypeNode();
      members.push({
        name: member.getName(),
        type: normalizeType(typeNode?.getText() ?? 'any'),
        optional: member.hasQuestionToken(),
      });
    } else if (Node.isMethodSignature(member)) {
      // Render method signature as a function type string for comparison
      const methodParams = member
        .getParameters()
        .map((p: any) => normalizeType(p.getTypeNode()?.getText() ?? 'any'));
      const retType = normalizeType(
        member.getReturnTypeNode()?.getText() ?? 'void',
      );
      members.push({
        name: member.getName(),
        type: `(${methodParams.join(', ')}) => ${retType}`,
        optional: member.hasQuestionToken(),
      });
    }
    // Index signatures and call signatures are skipped intentionally —
    // they're structural constraints, not named members we want to compare.
  }
  return { kind: 'interface', members };
}

function extractTypeAliasShape(decl: any): TypeAliasShape {
  const type = normalizeType(decl.getTypeNode()?.getText() ?? 'unknown');
  return { kind: 'typeAlias', type };
}

function extractVariableShape(decl: any): VariableShape {
  const type = normalizeType(decl.getTypeNode()?.getText() ?? 'any');
  return { kind: 'variable', type };
}

function extractShape(
  declarations: ReadonlyArray<ExportedDeclarations>,
): ExportShape | null {
  for (const decl of declarations) {
    if (Node.isFunctionDeclaration(decl)) {
      return extractFunctionShape(decl as any);
    }
    if (Node.isInterfaceDeclaration(decl)) {
      return extractInterfaceShape(decl);
    }
    if (Node.isTypeAliasDeclaration(decl)) {
      return extractTypeAliasShape(decl);
    }
    if (Node.isVariableDeclaration(decl)) {
      return extractVariableShape(decl);
    }
  }
  return null;
}

// ---------------------------------------------------------------------------
// Project helpers
// ---------------------------------------------------------------------------

function createProject(): Project {
  return new Project({
    skipAddingFilesFromTsConfig: true,
    compilerOptions: {
      // Don't error on declaration files from libraries we can't resolve.
      skipLibCheck: true,
      // Allow JS files (won't be added, but prevents config errors).
      allowJs: true,
    },
  });
}

function collectExportsFromSourceFile(
  sf: SourceFile,
  into: Map<string, ExportEntry>,
): void {
  for (const [name, decls] of sf.getExportedDeclarations()) {
    if (into.has(name)) continue; // first file wins (no overwriting)
    const shape = extractShape(decls);
    if (shape) {
      into.set(name, { name, shape });
    }
  }
}

// ---------------------------------------------------------------------------
// Public API
// ---------------------------------------------------------------------------

/**
 * Parses a single self-contained .d.ts file (e.g. the firebase-js-sdk snapshot)
 * and returns a map of export name → ExportEntry.
 */
export function parseSingleFile(filePath: string): Map<string, ExportEntry> {
  if (!fs.existsSync(filePath)) {
    throw new Error(`Type file not found: ${filePath}`);
  }
  const project = createProject();
  project.addSourceFileAtPath(filePath);
  const sf = project.getSourceFileOrThrow(filePath);
  const result = new Map<string, ExportEntry>();
  collectExportsFromSourceFile(sf, result);
  return result;
}

/**
 * Parses multiple .d.ts files that together form a package's modular API.
 * Files are processed in order; when the same name appears in more than one
 * file the first occurrence wins.
 *
 * Pass `additionalFiles` for any support files (statics, internal types, etc.)
 * that are needed to resolve re-exports — they are added to the project so
 * ts-morph can follow the re-export chain, but their exports are NOT added to
 * the result map directly.
 */
export function parseModularFiles(
  primaryFiles: string[],
  additionalFiles: string[] = [],
): Map<string, ExportEntry> {
  const project = createProject();

  const allPaths = [...primaryFiles, ...additionalFiles];
  for (const f of allPaths) {
    if (fs.existsSync(f)) {
      project.addSourceFileAtPath(f);
    }
  }

  const result = new Map<string, ExportEntry>();

  for (const filePath of primaryFiles) {
    const sf = project.getSourceFile(filePath);
    if (!sf) {
      throw new Error(
        `Could not load source file: ${filePath}\n` +
          `Make sure the package has been built (yarn build:all:build).`,
      );
    }
    collectExportsFromSourceFile(sf, result);
  }

  return result;
}
