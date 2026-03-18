"use strict";
const assert = require("assert");
const test = require("node:test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const AccountManager = require("../src/core/accountManager");

test("AccountManager initializes storage and lists accounts", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agy-test-"));
    const mgr = new AccountManager();
    mgr.accountsDir = path.join(tmpDir, "accounts");
    mgr.manifestPath = path.join(mgr.accountsDir, "manifest.json");
    mgr.initStorage();

    assert.ok(fs.existsSync(mgr.manifestPath));
    const list = await mgr.listAccounts();
    assert.strictEqual(Array.isArray(list.accounts), true);
    assert.strictEqual(list.accounts.length, 0);

    fs.rmSync(tmpDir, { recursive: true, force: true });
});
