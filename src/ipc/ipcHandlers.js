"use strict";
const AccountManager = require("../core/accountManager");

function registerAccountIpcHandlers(ipcMain) {
    const accountManager = new AccountManager();

    ipcMain.handle("accounts:list", async () => {
        return await accountManager.listAccounts();
    });

    ipcMain.handle("accounts:switch", async (_event, accountId) => {
        return await accountManager.switchAccount(accountId);
    });
}

module.exports = { registerAccountIpcHandlers };
