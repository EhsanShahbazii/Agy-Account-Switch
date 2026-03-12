"use strict";
const assert = require("assert");
const test = require("node:test");
const KeychainHelper = require("../src/core/keychain");

test("KeychainHelper methods are callable and safe", () => {
    assert.strictEqual(typeof KeychainHelper.getPassword, "function");
    assert.strictEqual(typeof KeychainHelper.setPassword, "function");
    assert.strictEqual(typeof KeychainHelper.deletePassword, "function");

    // Non-existent key test returns null safely without throwing
    const res = KeychainHelper.getPassword("non-existent-service-12345", "test");
    assert.strictEqual(res, null);
});
