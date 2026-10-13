import { build } from 'esbuild';
import path from 'node:path';
import { readFile, writeFile, copyFile } from 'node:fs/promises';
const output = 'public/ocean/assets/viewer.js';
await build({ entryPoints: [path.resolve('scripts/ocean/viewer.js')], bundle: true, outfile: output, format: 'iife', minify: true, target: ['es2022'], legalComments: 'linked', sourcemap: false });
// Whitespace in bundled GLSL template literals is cosmetic; normalize it for clean diffs.
const normalized = (await readFile(output, 'utf8')).split('\n').map(line => line.trimEnd().replace(/^ +\t/, '\t')).join('\n');
await writeFile(output, normalized);
await copyFile('node_modules/three/LICENSE', 'public/ocean/assets/THREE-LICENSE.txt');
