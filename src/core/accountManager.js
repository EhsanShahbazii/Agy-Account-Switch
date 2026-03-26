"use strict";
const fs = require("fs");
const path = require("path");
const { exec } = require("child_process");
const paths = require("../utils/paths");
const KeychainHelper = require("./keychain");

class AccountManager {
    constructor() {
        this.manifestPath = paths.MANIFEST_PATH;
        this.accountsDir = paths.ACCOUNTS_DIR;
        this.initStorage();
    }

    initStorage() {
        if (!fs.existsSync(this.accountsDir)) {
            fs.mkdirSync(this.accountsDir, { recursive: true, mode: 0o700 });
        }
        if (!fs.existsSync(this.manifestPath)) {
            const initial = { activeAccountId: null, accounts: [] };
            fs.writeFileSync(this.manifestPath, JSON.stringify(initial, null, 2), { mode: 0o600 });
        }
    }

    readManifest() {
        try {
            return JSON.parse(fs.readFileSync(this.manifestPath, "utf-8"));
        } catch (e) {
            return { activeAccountId: null, accounts: [] };
        }
    }

    writeManifest(data) {
        fs.writeFileSync(this.manifestPath, JSON.stringify(data, null, 2), { mode: 0o600 });
    }

    async listAccounts() {
        const manifest = this.readManifest();
        const activeId = manifest.activeAccountId;
        return {
            activeAccountId: activeId,
            accounts: manifest.accounts.map(acc => ({
                ...acc,
                isActive: acc.id === activeId
            }))
        };
    }

    restartLanguageServer() {
        try {
            exec("pkill -f language_server", () => {});
        } catch (e) {}
    }

    async switchAccount(accountId) {
        if (!accountId) throw new Error("Account ID is required for switching");

        const manifest = this.readManifest();
        const target = manifest.accounts.find(a => a.id === accountId);
        if (!target) {
            const available = manifest.accounts.map(a => a.id).join(", ");
            throw new Error(`Account "${accountId}" not found. Available accounts: [${available}]`);
        }

        const tokenFile = path.join(this.accountsDir, `${accountId}.token`);
        if (!fs.existsSync(tokenFile)) {
            throw new Error(`Token file for account "${accountId}" is missing from ${tokenFile}`);
        }

        const tokenData = fs.readFileSync(tokenFile, "utf-8");

        KeychainHelper.setPassword(tokenData, paths.KEYCHAIN_SERVICE, paths.KEYCHAIN_ACCOUNT);
        try {
            fs.writeFileSync(paths.OAUTH_FILE, tokenData, { mode: 0o600 });
        } catch (e) {}

        manifest.activeAccountId = accountId;
        this.writeManifest(manifest);

        this.restartLanguageServer();
        return { success: true, activeAccountId: accountId };
    }
}

module.exports = AccountManager;
