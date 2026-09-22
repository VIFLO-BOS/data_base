const { test } = require('node:test');
const assert = require('node:assert/strict');
const { uniqueBy } = require('../shared-utils/dist');
const { registerSchema } = require('../shared-validation/dist');
const { getRolePermissions, hasPermission } = require('../shared-rbac/dist');
test('public password validation rejects weak passwords', () => {
  const data = { email: 'user@example.com', firstName: 'Ada', lastName: 'Test' };
  assert.equal(registerSchema.safeParse({ ...data, password: 'weakpass' }).success, false);
  assert.equal(registerSchema.safeParse({ ...data, password: 'StrongPass1' }).success, true);
});
test('tasker permissions do not grant admin writes', () => {
  assert.equal(hasPermission(getRolePermissions('tasker'), 'users:create'), false);
  assert.equal(hasPermission(getRolePermissions('super_admin'), 'users:create'), true);
});
test('uniqueBy preserves first occurrence and order', () => {
  assert.deepEqual(uniqueBy([{ id: 2, value: 'first' }, { id: 2, value: 'last' }, { id: 1 }], 'id'), [{ id: 2, value: 'first' }, { id: 1 }]);
});
