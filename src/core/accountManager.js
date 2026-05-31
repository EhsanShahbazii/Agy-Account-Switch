"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.AccountManager = void 0;

const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");
let BrowserWindow;
try { BrowserWindow = require("electron").BrowserWindow; } catch (e) {}

const ACCOUNTS_DIR = path.join(os.homedir(), ".gemini", "accounts");
const MANIFEST_PATH = path.join(ACCOUNTS_DIR, "manifest.json");
const JETSKI_TOKEN_PATH = path.join(os.homedir(), ".gemini", "jetski-standalone-oauth-token");
const GOOGLE_ACCOUNTS_PATH = path.join(os.homedir(), ".gemini", "google_accounts.json");

class AccountManager {
    constructor(options = {}) {
        this.accountsDir = options.accountsDir || ACCOUNTS_DIR;
        this.manifestPath = options.manifestPath || path.join(this.accountsDir, "manifest.json");
        this.jetskiTokenPath = options.jetskiTokenPath || JETSKI_TOKEN_PATH;
        this.googleAccountsPath = options.googleAccountsPath || GOOGLE_ACCOUNTS_PATH;
        this.ensureDirectories();
    }

    initStorage() {
        this.ensureDirectories();
        if (!fs.existsSync(this.manifestPath)) {
            this.writeManifest({ activeAccountId: null, accounts: [] });
        }
    }

    ensureDirectories() {
        try {
            if (!fs.existsSync(this.accountsDir)) {
                fs.mkdirSync(this.accountsDir, { recursive: true, mode: 0o700 });
            }
        } catch (e) {
            console.error("[AccountManager] Failed to ensure accounts directory:", e);
        }
    }

    getKeychainToken() {
        try {
            const out = execSync("security find-generic-password -s gemini -a antigravity -w", {
                encoding: "utf-8",
                stdio: ["ignore", "pipe", "ignore"],
            }).trim();
            return out || null;
        } catch (e) {
            return null;
        }
    }

    setKeychainToken(tokenStr) {
        try {
            execSync(`security add-generic-password -U -s gemini -a antigravity -w '${tokenStr.replace(/'/g, "'\\''")}'`, {
                stdio: "ignore",
            });
            return true;
        } catch (e) {
            console.error("[AccountManager] Failed to set keychain token:", e);
            return false;
        }
    }

    deleteKeychainToken() {
        try {
            execSync("security delete-generic-password -s gemini -a antigravity", {
                stdio: "ignore",
            });
            return true;
        } catch (e) {
            return false;
        }
    }

    decodeTokenString(tokenStr) {
        if (!tokenStr) return null;
        try {
            let b64 = tokenStr.trim();
            if (b64.startsWith("go-keyring-base64:")) {
                b64 = b64.substring("go-keyring-base64:".length);
            }
            const jsonStr = Buffer.from(b64, "base64").toString("utf-8");
            return JSON.parse(jsonStr);
        } catch (e) {
            console.error("[AccountManager] Failed to decode token string:", e);
            return null;
        }
    }

    async fetchGoogleUserInfo(accessToken) {
        if (!accessToken) return null;
        try {
            const res = await fetch("https://www.googleapis.com/oauth2/v3/userinfo", {
                headers: { Authorization: `Bearer ${accessToken}` },
                signal: AbortSignal.timeout(4000),
            });
            if (res.ok) {
                return await res.json();
            }
        } catch (e) {
            // Ignore fetch errors
        }
        return null;
    }

    getManifest() {
        try {
            if (fs.existsSync(this.manifestPath)) {
                const data = fs.readFileSync(this.manifestPath, "utf-8");
                return JSON.parse(data);
            }
        } catch (e) {
            console.error("[AccountManager] Failed to read manifest:", e);
        }
        return {};
    }

    saveManifest(manifest) {
        try {
            this.ensureDirectories();
            fs.writeFileSync(this.manifestPath, JSON.stringify(manifest, null, 2), "utf-8");
            return true;
        } catch (e) {
            console.error("[AccountManager] Failed to write manifest:", e);
            return false;
        }
    }

    async syncCurrentAccount() {
        const currentKeychain = this.getKeychainToken();
        if (!currentKeychain) return null;

        const decoded = this.decodeTokenString(currentKeychain);
        if (!decoded || !decoded.token || !decoded.token.access_token) {
            return null;
        }

        const manifest = this.getManifest();
        const entries = Object.entries(manifest);

        const currentRefresh = decoded?.token?.refresh_token;
        for (const [id, acc] of entries) {
            if (acc.token_file && fs.existsSync(acc.token_file)) {
                try {
                    const savedToken = fs.readFileSync(acc.token_file, "utf-8").trim();
                    if (savedToken === currentKeychain) {
                        return id;
                    }
                    const savedDec = this.decodeTokenString(savedToken);
                    if (currentRefresh && savedDec?.token?.refresh_token === currentRefresh) {
                        fs.writeFileSync(acc.token_file, currentKeychain, { encoding: "utf-8", mode: 0o600 });
                        acc.last_used = new Date().toISOString();
                        this.saveManifest(manifest);
                        return id;
                    }
                } catch (e) {}
            }
        }

        const userInfo = await this.fetchGoogleUserInfo(decoded.token.access_token);
        const email = userInfo?.email || "active-account@gemini.pro";
        const name = userInfo?.name || email.split("@")[0];
        const picture = userInfo?.picture || "";

        const safeId = email.replace(/[^a-zA-Z0-9_-]/g, "_");
        const tokenFile = path.join(this.accountsDir, `${safeId}.token`);

        try {
            fs.writeFileSync(tokenFile, currentKeychain, { encoding: "utf-8", mode: 0o600 });
        } catch (e) {}

        manifest[safeId] = {
            id: safeId,
            label: name,
            email: email,
            name: name,
            picture: picture,
            token_file: tokenFile,
            saved_at: new Date().toISOString(),
            last_used: new Date().toISOString(),
        };

        this.saveManifest(manifest);
        return safeId;
    }

    async listAccounts() {
        const activeId = await this.syncCurrentAccount();
        const manifest = this.getManifest();

        const accounts = Object.entries(manifest).map(([id, acc]) => {
            return {
                id: id,
                label: acc.label || acc.name || id,
                email: acc.email || "",
                name: acc.name || "",
                picture: acc.picture || "",
                isActive: id === activeId,
                lastUsed: acc.last_used || acc.saved_at || "",
            };
        });

        accounts.sort((a, b) => {
            if (a.isActive) return -1;
            if (b.isActive) return 1;
            return (b.lastUsed || "").localeCompare(a.lastUsed || "");
        });

        return {
            activeId,
            accounts,
        };
    }

    async switchAccount(accountId) {
        const manifest = this.getManifest();
        const target = manifest[accountId];
        if (!target) {
            throw new Error(`Account "${accountId}" not found`);
        }

        let tokenStr = "";
        if (target.token_file && fs.existsSync(target.token_file)) {
            tokenStr = fs.readFileSync(target.token_file, "utf-8").trim();
        } else if (target.token) {
            tokenStr = target.token;
        }

        if (!tokenStr) {
            throw new Error(`No token available for account "${accountId}"`);
        }

        this.setKeychainToken(tokenStr);

        try {
            const decoded = this.decodeTokenString(tokenStr);
            if (decoded) {
                fs.writeFileSync(JETSKI_TOKEN_PATH, JSON.stringify(decoded), { encoding: "utf-8", mode: 0o600 });
            }
        } catch (e) {
            console.error("[AccountManager] Failed to write jetski token file:", e);
        }

        try {
            if (target.email) {
                let googleAccs = { active: target.email, old: [] };
                if (fs.existsSync(GOOGLE_ACCOUNTS_PATH)) {
                    try {
                        const existing = JSON.parse(fs.readFileSync(GOOGLE_ACCOUNTS_PATH, "utf-8"));
                        const olds = new Set(existing.old || []);
                        if (existing.active && existing.active !== target.email) {
                            olds.add(existing.active);
                        }
                        googleAccs.old = Array.from(olds);
                    } catch (e) {}
                }
                fs.writeFileSync(GOOGLE_ACCOUNTS_PATH, JSON.stringify(googleAccs, null, 2), "utf-8");
            }
        } catch (e) {}

        target.last_used = new Date().toISOString();
        this.saveManifest(manifest);

        this.restartLanguageServerAndReload();

        return { success: true, activeId: accountId };
    }

    async addAccount(label, tokenStr) {
        await this.syncCurrentAccount();

        if (tokenStr && tokenStr.trim()) {
            const trimmed = tokenStr.trim();
            const decoded = this.decodeTokenString(trimmed);
            const userInfo = decoded?.token?.access_token
                ? await this.fetchGoogleUserInfo(decoded.token.access_token)
                : null;

            const email = userInfo?.email || `${label.toLowerCase().replace(/\s+/g, "")}@gemini.pro`;
            const name = userInfo?.name || label;
            const picture = userInfo?.picture || "";

            const safeId = `${label.toLowerCase().replace(/[^a-zA-Z0-9_-]/g, "_")}_${Date.now()}`;
            const tokenFile = path.join(this.accountsDir, `${safeId}.token`);

            fs.writeFileSync(tokenFile, trimmed, { encoding: "utf-8", mode: 0o600 });

            const manifest = this.getManifest();
            manifest[safeId] = {
                id: safeId,
                label: label || name,
                email: email,
                name: name,
                picture: picture,
                token_file: tokenFile,
                saved_at: new Date().toISOString(),
                last_used: new Date().toISOString(),
            };
            this.saveManifest(manifest);

            await this.switchAccount(safeId);
            return { success: true, accountId: safeId };
        } else {
            this.deleteKeychainToken();
            try {
                if (fs.existsSync(JETSKI_TOKEN_PATH)) {
                    fs.unlinkSync(JETSKI_TOKEN_PATH);
                }
            } catch (e) {}

            this.restartLanguageServerAndReload();
            return { success: true, loginRequired: true };
        }
    }

    
    async renameAccount(accountId, newLabel) {
        if (!newLabel || !newLabel.trim()) {
            return { success: false, error: "Account name cannot be empty" };
        }
        const manifest = this.getManifest();
        const target = manifest[accountId];
        if (!target) {
            return { success: false, error: "Account not found" };
        }

        target.label = newLabel.trim();
        target.name = newLabel.trim();
        this.saveManifest(manifest);
        return { success: true, newLabel: target.label };
    }

    async removeAccount(accountId) {
        const manifest = this.getManifest();
        const target = manifest[accountId];
        if (!target) {
            return { success: false, error: "Account not found" };
        }

        const currentActive = this.getKeychainToken();
        if (target.token_file && fs.existsSync(target.token_file)) {
            try {
                const saved = fs.readFileSync(target.token_file, "utf-8").trim();
                if (saved === currentActive) {
                    return { success: false, error: "Cannot remove the currently active account. Switch to another account first." };
                }
                fs.unlinkSync(target.token_file);
            } catch (e) {}
        }

        delete manifest[accountId];
        this.saveManifest(manifest);
        return { success: true };
    }

    restartLanguageServerAndReload() {
        try {
            const { getLsProcess } = require("./languageServer");
            const proc = getLsProcess();
            if (proc && !proc.killed) {
                proc.kill("SIGTERM");
            }
        } catch (e) {
            console.error("[AccountManager] Failed to terminate LS process:", e);
        }

        setTimeout(() => {
            const wins = BrowserWindow.getAllWindows();
            for (const win of wins) {
                if (!win.isDestroyed()) {
                    win.webContents.reload();
                }
            }
        }, 800);
    }
}

exports.AccountManager = AccountManager;

module.exports = AccountManager;
module.exports.AccountManager = AccountManager;
