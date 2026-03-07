"use strict";
const assert = require("assert");
const test = require("node:test");
const paths = require("../src/utils/paths");

test("paths module exports required paths", () => {
    assert.ok(paths.APP_PATH.includes("Antigravity.app"));
    assert.ok(paths.ASAR_PATH.endsWith("app.asar"));
    assert.ok(paths.ASAR_BACKUP_PATH.endsWith("app.asar.backup"));
    assert.strictEqual(paths.KEYCHAIN_SERVICE, "gemini");
    assert.strictEqual(paths.KEYCHAIN_ACCOUNT, "antigravity");
});
