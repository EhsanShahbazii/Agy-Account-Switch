"use strict";
const assert = require("assert");
const test = require("node:test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const AccountManager = require("../src/core/accountManager");

test("AccountManager switchAccount validates account existence", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agy-test-"));
    const mgr = new AccountManager();
    mgr.accountsDir = path.join(tmpDir, "accounts");
    mgr.manifestPath = path.join(mgr.accountsDir, "manifest.json");
    mgr.initStorage();

    await assert.rejects(async () => {
        await mgr.switchAccount("non-existent-id");
    }, /not found/);

    fs.rmSync(tmpDir, { recursive: true, force: true });
});
