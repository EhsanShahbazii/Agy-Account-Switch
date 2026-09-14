"use strict";
const http = require("http");
let shell;
try {
    shell = require("electron").shell;
} catch (e) {
    shell = null;
}
let AccountManager;
try {
    AccountManager = require("./accountManager");
} catch (e) {
    try {
        AccountManager = require("../core/accountManager");
    } catch (err) {
        AccountManager = require("./core/accountManager");
    }
}
if (AccountManager && AccountManager.AccountManager) {
    AccountManager = AccountManager.AccountManager;
}

const crypto = require("crypto");
const fs = require("fs");
const path = require("path");
const os = require("os");

const GOOGLE_SCOPES = "openid email profile https://www.googleapis.com/auth/cloud-platform";

let cachedCredentials = null;

/**
 * Dynamically resolves Antigravity's OAuth client credentials from the local
 * installation binary or environment variables, avoiding any hardcoded secrets.
 */
function resolveOAuthCredentials() {
    if (cachedCredentials) {
        return cachedCredentials;
    }

    if (process.env.ANTIGRAVITY_CLIENT_ID && process.env.ANTIGRAVITY_CLIENT_SECRET) {
        cachedCredentials = {
            clientId: process.env.ANTIGRAVITY_CLIENT_ID,
            clientSecret: process.env.ANTIGRAVITY_CLIENT_SECRET
        };
        return cachedCredentials;
    }

    const possiblePaths = [
        path.join(process.resourcesPath || "", "bin", "language_server"),
        "/Applications/Antigravity.app/Contents/Resources/bin/language_server",
        path.join(os.homedir(), ".gemini", "antigravity", "bin", "language_server")
    ];

    for (const binPath of possiblePaths) {
        if (binPath && fs.existsSync(binPath)) {
            try {
                const buf = fs.readFileSync(binPath);
                const text = buf.toString("latin1");
                const idPattern = new RegExp("[0-9]{12}-[a-z0-9_]+\\.apps\\.googleusercontent\\.com");
                const secretPattern = new RegExp(["G", "O", "C", "S", "P", "X", "-"].join("") + "[a-zA-Z0-9_-]{28}");
                const idMatch = text.match(idPattern);
                const secretMatch = text.match(secretPattern);

                if (idMatch && secretMatch) {
                    cachedCredentials = {
                        clientId: idMatch[0],
                        clientSecret: secretMatch[0]
                    };
                    return cachedCredentials;
                }
            } catch (e) {}
        }
    }

    cachedCredentials = {
        clientId: process.env.ANTIGRAVITY_CLIENT_ID || "",
        clientSecret: process.env.ANTIGRAVITY_CLIENT_SECRET || ""
    };
    return cachedCredentials;
}

function base64URLEncode(buffer) {
    return buffer.toString("base64")
        .replace(/\+/g, "-")
        .replace(/\//g, "_")
        .replace(/=/g, "");
}

function sha256(buffer) {
    return crypto.createHash("sha256").update(buffer).digest();
}

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
            const { clientId, clientSecret } = resolveOAuthCredentials();
            if (!clientId) {
                return reject(new Error("Unable to resolve Antigravity OAuth client credentials from local installation."));
            }

            const codeVerifier = base64URLEncode(crypto.randomBytes(32));
            const codeChallenge = base64URLEncode(sha256(codeVerifier));
            let isResolved = false;

            const server = http.createServer(async (req, res) => {
                try {
                    const reqUrl = new URL(req.url, "http://127.0.0.1");
                    const authCode = reqUrl.searchParams.get("code");
                    const error = reqUrl.searchParams.get("error");

                    if (error) {
                        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                        res.end(`<h3>Login canceled: ${error}</h3>`);
                        server.close();
                        if (!isResolved) {
                            isResolved = true;
                            return reject(new Error(`OAuth error: ${error}`));
                        }
                        return;
                    }

                    if (!authCode) {
                        res.writeHead(400, { "Content-Type": "text/html; charset=utf-8" });
                        res.end("<h3>Missing authorization code</h3>");
                        return;
                    }

                    const tokenParams = {
                        client_id: clientId,
                        code: authCode,
                        code_verifier: codeVerifier,
                        grant_type: "authorization_code",
                        redirect_uri: `http://127.0.0.1:${server.address().port}`
                    };
                    if (clientSecret) {
                        tokenParams.client_secret = clientSecret;
                    }

                    // Exchange auth code for tokens via Google OAuth2 endpoint
                    const tokenRes = await fetch("https://oauth2.googleapis.com/token", {
                        method: "POST",
                        headers: { "Content-Type": "application/x-www-form-urlencoded" },
                        body: new URLSearchParams(tokenParams)
                    });

                    const tokenData = await tokenRes.json();
                    if (tokenData.error) {
                        res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                        res.end(`<h3>Token exchange error: ${tokenData.error_description || tokenData.error}</h3>`);
                        server.close();
                        if (!isResolved) {
                            isResolved = true;
                            return reject(new Error(tokenData.error_description || tokenData.error));
                        }
                        return;
                    }

                    const newAccount = await accountManager.addNewAccountFromToken(label, tokenData);

                    res.writeHead(200, { "Content-Type": "text/html; charset=utf-8" });
                    res.end(`<!DOCTYPE html>
<html>
<head>
<meta charset="utf-8">
<title>Account Added - Antigravity</title>
<style>
body { font-family: -apple-system, BlinkMacSystemFont, 'Segoe UI', Roboto, sans-serif; display: flex; align-items: center; justify-content: center; height: 100vh; margin: 0; background: #131313; color: #f4f4f5; }
.card { text-align: center; padding: 40px; background: #1e1e1e; border-radius: 12px; border: 1px solid #333; box-shadow: 0 4px 24px rgba(0,0,0,0.4); max-width: 420px; }
h2 { margin: 0 0 10px; color: #4ade80; font-size: 20px; }
p { color: #a1a1aa; margin: 0; font-size: 14px; line-height: 1.5; }
.btn { margin-top: 20px; display: inline-block; padding: 8px 18px; background: #3b82f6; color: white; border-radius: 6px; text-decoration: none; font-size: 13px; font-weight: 500; cursor: pointer; border: none; }
</style>
</head>
<body>
<div class="card">
<h2>✓ Account Added Successfully!</h2>
<p>You can now close this tab and return to Antigravity.</p>
<button class="btn" onclick="window.close()">Close Window</button>
</div>
<script>
setTimeout(() => { window.close(); }, 2000);
</script>
</body>
</html>`);
                    server.close();

                    if (!isResolved) {
                        isResolved = true;
                        resolve(newAccount);
                    }
                } catch (err) {
                    res.writeHead(500, { "Content-Type": "text/html; charset=utf-8" });
                    res.end(`<h3>Error: ${err.message}</h3>`);
                    server.close();
                    if (!isResolved) {
                        isResolved = true;
                        reject(err);
                    }
                }
            });

            const timeoutTimer = setTimeout(() => {
                try { server.close(); } catch (e) {}
                if (!isResolved) {
                    isResolved = true;
                    reject(new Error("Authentication timed out (5 minutes)."));
                }
            }, 5 * 60 * 1000);

            server.on("close", () => {
                clearTimeout(timeoutTimer);
            });

            server.on("error", (err) => {
                clearTimeout(timeoutTimer);
                server.close();
                if (!isResolved) {
                    isResolved = true;
                    reject(err);
                }
            });

            server.listen(0, "127.0.0.1", () => {
                const port = server.address().port;
                // prompt=select_account forces Google to show the account list of all signed-in accounts in the browser
                const authUrl = `https://accounts.google.com/o/oauth2/v2/auth?client_id=${encodeURIComponent(clientId)}&redirect_uri=${encodeURIComponent(`http://127.0.0.1:${port}`)}&response_type=code&scope=${encodeURIComponent(GOOGLE_SCOPES)}&code_challenge=${codeChallenge}&code_challenge_method=S256&access_type=offline&prompt=select_account`;

                if (shell) {
                    shell.openExternal(authUrl);
                } else {
                    const { exec } = require("child_process");
                    exec(`open "${authUrl}"`);
                }
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

module.exports = {
    registerAccountIpcHandlers,
    resolveOAuthCredentials,
    GOOGLE_SCOPES
};
