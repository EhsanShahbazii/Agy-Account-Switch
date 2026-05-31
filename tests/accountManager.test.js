"use strict";
const assert = require("assert");
const test = require("node:test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const AccountManager = require("../src/core/accountManager");

test("AccountManager CRUD operations", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agy-crud-test-"));
    const accountsDir = path.join(tmpDir, "accounts");
    const manifestPath = path.join(accountsDir, "manifest.json");
    
    const mgr = new AccountManager({
        accountsDir,
        manifestPath,
        jetskiTokenPath: path.join(tmpDir, "oauth-token"),
        googleAccountsPath: path.join(tmpDir, "google_accounts.json")
    });

    // Populate mock accounts into manifest
    const manifest = {
        "acc-1": {
            id: "acc-1",
            label: "Primary",
            email: "test1@example.com",
            name: "User One"
        },
        "acc-2": {
            id: "acc-2",
            label: "Secondary",
            email: "test2@example.com",
            name: "User Two"
        }
    };
    mgr.saveManifest(manifest);

    // List: should include mock accounts
    const list = await mgr.listAccounts();
    assert.ok(list.accounts.length >= 2);
    assert.ok(list.accounts.some(a => a.id === "acc-1"));
    assert.ok(list.accounts.some(a => a.id === "acc-2"));

    // Rename
    const renameRes = await mgr.renameAccount("acc-2", "Work Pro");
    assert.strictEqual(renameRes.success, true);
    assert.strictEqual(renameRes.newLabel, "Work Pro");

    const updated = await mgr.listAccounts();
    const renamed = updated.accounts.find(a => a.id === "acc-2");
    assert.strictEqual(renamed.label, "Work Pro");

    // Remove
    const countBefore = updated.accounts.length;
    const removeRes = await mgr.removeAccount("acc-2");
    assert.strictEqual(removeRes.success, true);

    const afterRemove = await mgr.listAccounts();
    assert.strictEqual(afterRemove.accounts.length, countBefore - 1);
    assert.ok(!afterRemove.accounts.some(a => a.id === "acc-2"));

    fs.rmSync(tmpDir, { recursive: true, force: true });
});
