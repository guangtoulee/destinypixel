import test from 'node:test';
import assert from 'node:assert/strict';
import { isOceanWall, materialForMuseumView } from './wall-materials.mjs';

test('wall tags inherited by primitive children; graphic panels and floors are unaffected', () => {
  const wall = { userData: { oceanWall: true } };
  assert.equal(isOceanWall({ userData: {}, parent: wall }), true);
  assert.equal(isOceanWall({ userData: { oceanRole: 'column' } }), true);
  assert.equal(isOceanWall({ name: '墙面图文板', userData: {} }), false);
  assert.equal(isOceanWall({ userData: { collection: '01_地坪_无水纹投影' } }), false);
});

test('blue walls stay blue in white mode and native materials restore exactly', () => {
  const original = [{ map: 'approved-graphic' }, { color: 'navy' }];
  const white = {}, blue = {}, wall = { userData: { oceanRole: 'wall' } }, object = { userData: {} };
  assert.equal(materialForMuseumView(wall, 'white', original, white, blue), blue);
  assert.equal(materialForMuseumView(object, 'white', original, white, blue), white);
  assert.equal(materialForMuseumView(wall, 'native', original, white, blue), original);
  assert.equal(materialForMuseumView(object, 'native', original, white, blue), original);
});
