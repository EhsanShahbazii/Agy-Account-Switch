"use strict";
const assert = require("assert");
const test = require("node:test");
const { registerAccountIpcHandlers, resolveOAuthCredentials } = require("../src/ipc/ipcHandlers");

test("registerAccountIpcHandlers registers all required IPC channels", () => {
    const registered = {};
    const mockIpcMain = {
        handle: (channel, fn) => {
            registered[channel] = fn;
        }
    };

    registerAccountIpcHandlers(mockIpcMain);

    assert.ok(registered["accounts:list"]);
    assert.ok(registered["accounts:switch"]);
    assert.ok(registered["accounts:add"]);
    assert.ok(registered["accounts:remove"]);
    assert.ok(registered["accounts:rename"]);
});

test("resolveOAuthCredentials dynamically resolves valid credentials from local installation", () => {
    const creds = resolveOAuthCredentials();
    assert.strictEqual(typeof creds.clientId, "string");
    assert.strictEqual(typeof creds.clientSecret, "string");
    assert.ok(creds.clientId.length > 0);
    assert.ok(creds.clientSecret.length > 0);
});
