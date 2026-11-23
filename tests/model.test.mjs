import test from 'node:test';
import assert from 'node:assert/strict';
const { projectMileage } = await import('../model.mjs').catch(() => ({}));
test('projects exit mileage using the same ownership horizon', () => {
  assert.equal(typeof projectMileage, 'function', 'Mileage projection is not implemented');
  assert.equal(projectMileage(37400, 20000, 4), 117400);
  assert.equal(projectMileage(13838, 20000, 4), 93838);
});
const model = await import('../model.mjs');
test('computes depreciation from purchase, import and a manual resale interval', () => {
  assert.equal(typeof model.depreciation, 'function', 'Depreciation is not implemented');
  assert.deepEqual(model.depreciation(25784, 1000, 17000, 20000, 4), {low: 6784, high: 9784, monthlyLow: 6784 / 48, monthlyHigh: 9784 / 48});
  assert.equal(model.depreciation(null, 0, 17000, 20000, 4), null);
  assert.equal(model.depreciation(25784, 0, null, null, 4), null);
  assert.equal(model.depreciation(25784, -1, 17000, 20000, 4), null);
  assert.equal(model.depreciation(25784, 0, 20000, 17000, 4), null);
  assert.equal(model.depreciation(25784, 0, 17000, 20000, 0), null);
});
