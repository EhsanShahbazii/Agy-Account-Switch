"use strict";
const AccountManager = require("../core/accountManager");

function registerAccountIpcHandlers(ipcMain) {
    const accountManager = new AccountManager();
    console.log("[IPC] Registering account management handlers...");
}

module.exports = { registerAccountIpcHandlers };
