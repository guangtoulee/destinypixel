import { build } from 'esbuild';
import path from 'node:path';
import { readFile, writeFile, copyFile } from 'node:fs/promises';
for (const entry of ['viewer', 'slice']) {
  const output = `public/ocean/deepsea/assets/${entry}.js`;
  await build({ entryPoints: [path.resolve(`scripts/deepsea/${entry}.js`)], bundle: true, outfile: output, format: 'iife', minify: true, target: ['es2022'], legalComments: 'linked', sourcemap: false });
  // Whitespace in bundled GLSL template literals is cosmetic; normalize it for clean diffs.
  const normalized = (await readFile(output, 'utf8')).split('\n').map(line => line.trimEnd().replace(/^ +\t/, '\t')).join('\n');
  await writeFile(output, normalized);
}
await copyFile('node_modules/three/LICENSE', 'public/ocean/deepsea/assets/THREE-LICENSE.txt');
