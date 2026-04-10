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

    ipcMain.handle("accounts:add", async (_event, label, tokenStr) => {
        return await accountManager.addAccount(label, tokenStr);
    });

    ipcMain.handle("accounts:remove", async (_event, accountId) => {
        return await accountManager.removeAccount(accountId);
    });

    ipcMain.handle("accounts:rename", async (_event, accountId, newLabel) => {
        return await accountManager.renameAccount(accountId, newLabel);
    });
}

module.exports = { registerAccountIpcHandlers };
