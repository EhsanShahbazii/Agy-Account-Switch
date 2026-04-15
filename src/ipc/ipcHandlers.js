"use strict";
const http = require("http");
const { shell } = require("electron");
const AccountManager = require("../core/accountManager");

function registerAccountIpcHandlers(ipcMain) {
    const accountManager = new AccountManager();

    ipcMain.handle("accounts:list", async () => {
        return await accountManager.listAccounts();
    });

    ipcMain.handle("accounts:switch", async (_event, accountId) => {
        return await accountManager.switchAccount(accountId);
    });

    ipcMain.handle("accounts:add", async (_event, label) => {
        return new Promise((resolve, reject) => {
            const server = http.createServer(async (req, res) => {
                res.writeHead(200, { "Content-Type": "text/html" });
                res.end("<h3>Authentication complete. You can close this window.</h3>");
                server.close();
                resolve({ success: true });
            });

            server.on("error", (err) => {
                server.close();
                reject(err);
            });

            server.listen(0, "127.0.0.1", () => {
                const port = server.address().port;
                const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?redirect_uri=http://127.0.0.1:${port}`;
                if (shell) shell.openExternal(authUrl);
            });
        });
    });

    ipcMain.handle("accounts:remove", async (_event, accountId) => {
        return await accountManager.removeAccount(accountId);
    });

    ipcMain.handle("accounts:rename", async (_event, accountId, newLabel) => {
        return await accountManager.renameAccount(accountId, newLabel);
    });
}

module.exports = { registerAccountIpcHandlers };
