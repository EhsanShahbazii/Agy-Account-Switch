"use strict";
const assert = require("assert");
const test = require("node:test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const AccountManager = require("../src/core/accountManager");

test("AccountManager CRUD operations", async () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agy-crud-test-"));
    const mgr = new AccountManager();
    mgr.accountsDir = path.join(tmpDir, "accounts");
    mgr.manifestPath = path.join(mgr.accountsDir, "manifest.json");
    mgr.initStorage();

    // Create a mock account in manifest
    const manifest = mgr.readManifest();
    manifest.accounts.push({
        id: "acc-1",
        label: "Primary",
        email: "test1@example.com"
    });
    manifest.accounts.push({
        id: "acc-2",
        label: "Secondary",
        email: "test2@example.com"
    });
    manifest.activeAccountId = "acc-1";
    mgr.writeManifest(manifest);

    // List
    const list = await mgr.listAccounts();
    assert.strictEqual(list.accounts.length, 2);
    assert.strictEqual(list.accounts[0].isActive, true);

    // Rename
    await mgr.renameAccount("acc-2", "Work Pro");
    const updated = await mgr.listAccounts();
    const renamed = updated.accounts.find(a => a.id === "acc-2");
    assert.strictEqual(renamed.label, "Work Pro");

    // Remove inactive
    await mgr.removeAccount("acc-2");
    const afterRemove = await mgr.listAccounts();
    assert.strictEqual(afterRemove.accounts.length, 1);

    // Guard: removing active account should throw
    await assert.rejects(async () => {
        await mgr.removeAccount("acc-1");
    }, /Cannot remove the active account/);

    fs.rmSync(tmpDir, { recursive: true, force: true });
});
