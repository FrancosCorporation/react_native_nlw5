import test from 'node:test';
import assert from 'node:assert/strict';
import {createRequire} from 'node:module';

const require = createRequire(import.meta.url);
const fromExpo = createRequire(require.resolve('@expo/config'));
const merge = fromExpo('deepmerge');

test('merging untrusted keys does not poison the result prototype', () => {
  const payload = JSON.parse('{"__proto__":{"polluted":true}}');
  const output = merge(Object.create(null), payload);
  assert.equal(output.polluted, undefined);
  assert.equal(Object.getPrototypeOf(output), Object.prototype);
  assert.equal({}.polluted, undefined);
  const nested = merge({}, JSON.parse('{"nested":{"__proto__":{"polluted":true}}}'));
  assert.equal(nested.nested.polluted, undefined);
  assert.equal({}.polluted, undefined);
});

test('maintains ordinary object and array merge semantics used by Expo', () => {
  const merged = merge({a:{x:1}, list:[1]}, {a:{y:2}, list:[2]});
  assert.deepEqual(merged, {a:{x:1,y:2}, list:[1,2]});
});
