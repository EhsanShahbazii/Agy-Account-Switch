"use strict";
const fs = require("fs");
const path = require("path");
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

    async switchAccount(accountId) {
        const manifest = this.readManifest();
        const target = manifest.accounts.find(a => a.id === accountId);
        if (!target) {
            throw new Error(`Account not found: ${accountId}`);
        }

        const tokenFile = path.join(this.accountsDir, `${accountId}.token`);
        if (!fs.existsSync(tokenFile)) {
            throw new Error(`Token file missing for account: ${accountId}`);
        }

        const tokenData = fs.readFileSync(tokenFile, "utf-8");

        // Write to Keychain
        KeychainHelper.setPassword(tokenData, paths.KEYCHAIN_SERVICE, paths.KEYCHAIN_ACCOUNT);

        // Write to ~/.gemini/jetski-standalone-oauth-token
        fs.writeFileSync(paths.OAUTH_FILE, tokenData, { mode: 0o600 });

        // Update manifest
        manifest.activeAccountId = accountId;
        this.writeManifest(manifest);

        return { success: true, activeAccountId: accountId };
    }
}

module.exports = AccountManager;
