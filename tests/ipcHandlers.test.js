"use strict";
const assert = require("assert");
const test = require("node:test");
const { registerAccountIpcHandlers } = require("../src/ipc/ipcHandlers");

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
