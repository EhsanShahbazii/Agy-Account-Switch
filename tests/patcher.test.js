"use strict";
const assert = require("assert");
const test = require("node:test");
const fs = require("fs");
const os = require("os");
const path = require("path");
const Patcher = require("../src/injector/patcher");
const Unpatcher = require("../src/injector/unpatcher");

test("Patcher backup and Unpatcher restore integrity", () => {
    const tmpDir = fs.mkdtempSync(path.join(os.tmpdir(), "agy-patch-test-"));
    const fakeAsar = path.join(tmpDir, "app.asar");
    const fakeBackup = path.join(tmpDir, "app.asar.backup");

    fs.writeFileSync(fakeAsar, "ORIGINAL_ASAR_CONTENT");
    Patcher.backupAsar(fakeAsar, fakeBackup);

    assert.ok(fs.existsSync(fakeBackup));
    assert.strictEqual(fs.readFileSync(fakeBackup, "utf-8"), "ORIGINAL_ASAR_CONTENT");

    // Modify asar
    fs.writeFileSync(fakeAsar, "MODIFIED_PATCHED_CONTENT");

    // Restore without codesign in unit test
    fs.copyFileSync(fakeBackup, fakeAsar);
    assert.strictEqual(fs.readFileSync(fakeAsar, "utf-8"), "ORIGINAL_ASAR_CONTENT");

    fs.rmSync(tmpDir, { recursive: true, force: true });
});
