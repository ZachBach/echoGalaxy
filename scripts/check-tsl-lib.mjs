// check-tsl-lib — vendor gate, static half.
//
// 1) Self-containment: every import in src/tsl-lib must be relative and
//    resolve inside src/tsl-lib. The library is dependency-injected (nodes
//    receive the TSL namespace as a parameter) — it must import nothing,
//    not even three.
// 2) TSL surface: every `TSL.<member>` the library touches (including
//    destructuring) must exist in the installed three/tsl. Catches
//    upstream code that relies on APIs that moved between three versions.
import { readdirSync, readFileSync } from 'node:fs';
import { join, dirname, resolve, sep } from 'node:path';
import { fileURLToPath } from 'node:url';

const ROOT = dirname(dirname(fileURLToPath(import.meta.url)));
const LIB = join(ROOT, 'src', 'tsl-lib');

const files = [];
(function walk(dir) {
  for (const e of readdirSync(dir, { withFileTypes: true })) {
    const p = join(dir, e.name);
    if (e.isDirectory()) walk(p);
    else if (e.name.endsWith('.js')) files.push(p);
  }
})(LIB);

const problems = [];

const importRe =
  /(?:import|export)[^'"()]*from\s*['"]([^'"]+)['"]|import\s*\(\s*['"]([^'"]+)['"]/g;
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(importRe)) {
    const spec = m[1] ?? m[2];
    if (!spec.startsWith('.')) {
      problems.push(`${f}: bare import '${spec}' — library must stay dependency-injected`);
    } else if (!resolve(dirname(f), spec).startsWith(LIB + sep)) {
      problems.push(`${f}: import '${spec}' escapes src/tsl-lib`);
    }
  }
}

const used = new Set();
for (const f of files) {
  const src = readFileSync(f, 'utf8');
  for (const m of src.matchAll(/\bTSL\.([A-Za-z_$][\w$]*)/g)) used.add(m[1]);
  for (const m of src.matchAll(/\{([^{}]*)\}\s*=\s*TSL\b/g)) {
    for (const part of m[1].split(',')) {
      const name = part.split(':')[0].trim();
      if (name) used.add(name);
    }
  }
}

const tsl = await import('three/tsl');
const { REVISION } = await import('three/webgpu');
for (const n of [...used].sort()) {
  if (!(n in tsl)) problems.push(`TSL.${n} used by the library but missing from three/tsl r${REVISION}`);
}

if (problems.length) {
  console.error(`check-tsl-lib: ${problems.length} problem(s)`);
  for (const p of problems) console.error('  ' + p);
  process.exit(1);
}
console.log(
  `check-tsl-lib ok — ${files.length} files self-contained; ` +
  `${used.size} TSL members all present on r${REVISION}`,
);
