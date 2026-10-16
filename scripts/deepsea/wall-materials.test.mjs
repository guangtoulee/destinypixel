import test from 'node:test';
import assert from 'node:assert/strict';
import { isOceanWall, isOceanGlass, materialForMuseumView } from './wall-materials.mjs';

test('mixed source primitives retain per-material wall classification', () => {
  const parent = { userData: { oceanMixedSource: true, oceanWall: true, oceanWallMaterialNames: ['SU_深海蓝结构展墙'] } };
  const mesh = { userData: {}, parent };
  const wall = { name: 'SU_深海蓝结构展墙' }, base = { name: '干灰场景基座' }, cover = { name: '深灰柜盖' };
  const white = {}, blue = {};
  assert.equal(isOceanWall(mesh, wall), true);
  assert.equal(isOceanWall(mesh, base), false);
  assert.equal(isOceanWall(mesh, cover), false);
  assert.deepEqual(materialForMuseumView(mesh, 'white', [wall, base, cover], white, blue), [blue, white, white]);
});

test('blue-wall view preserves actual glass, image screens and exhibit materials', () => {
  const glass = { name: '新增柜通透玻璃', transparent: true, opacity: .15 };
  const screen = { name: 'LED_曲面屏', map: {} }, ceramic = { name: '出水陶瓷釉' }, generic = { name: '中性展台' };
  const mesh = { material: [glass, screen, ceramic, generic] }, white = {}, blue = {};
  assert.equal(isOceanGlass(mesh), true);
  const result = materialForMuseumView(mesh, 'white', mesh.material, white, blue);
  assert.deepEqual(result, [glass, screen, ceramic, white]);
  assert.equal(materialForMuseumView(mesh, 'native', mesh.material, white, blue), mesh.material);
});

test('legacy explicit physical walls and glass extras continue to work', () => {
  const material = { name: '结构材质' };
  assert.equal(isOceanWall({ userData: { oceanRole: 'column' } }, material), true);
  assert.equal(isOceanGlass({ userData: { oceanGlass: true } }, material), true);
  assert.equal(isOceanWall({ name: '图文展板', userData: {} }, material), false);
});
