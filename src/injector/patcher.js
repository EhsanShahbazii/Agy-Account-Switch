"use strict";
const fs = require("fs");
const path = require("path");
const os = require("os");
const { execSync } = require("child_process");
const paths = require("../utils/paths");
const logger = require("../utils/logger");

function safeCopy(src, dest) {
    try {
        fs.copyFileSync(src, dest);
    } catch (err) {
        try {
            fs.writeFileSync(dest, fs.readFileSync(src));
        } catch (e2) {
            execSync(`cp -f "${src}" "${dest}"`, { stdio: "pipe" });
        }
    }
}

class Patcher {
    static backupAsar(asarPath = paths.ASAR_PATH, backupPath = paths.ASAR_BACKUP_PATH) {
        try {
            execSync(`xattr -cr "${paths.APP_PATH}" 2>/dev/null || true`, { stdio: "ignore" });
        } catch (e) {}

        if (!fs.existsSync(backupPath) || fs.statSync(backupPath).size === 0) {
            logger.info(`Creating clean backup at ${backupPath}...`);
            safeCopy(asarPath, backupPath);
            logger.success(`Backup saved to ${backupPath}`);
        } else {
            logger.info("Existing backup preserved.");
        }
        Patcher.ensureUnpackedBackup(asarPath, backupPath);
    }

    static ensureUnpackedBackup(asarPath = paths.ASAR_PATH, backupPath = paths.ASAR_BACKUP_PATH) {
        const unpackedDir = asarPath + ".unpacked";
        const backupUnpackedDir = backupPath + ".unpacked";
        if (fs.existsSync(unpackedDir) && !fs.existsSync(backupUnpackedDir)) {
            try {
                fs.symlinkSync(path.basename(unpackedDir), backupUnpackedDir);
            } catch (e) {
                try {
                    fs.cpSync(unpackedDir, backupUnpackedDir, { recursive: true });
                } catch (err) {}
            }
        }
    }

    static run() {
        logger.step(1, 5, "Verifying paths and prerequisites...");
        if (!fs.existsSync(paths.APP_PATH)) {
            throw new Error(`Antigravity.app not found at ${paths.APP_PATH}`);
        }
        if (!fs.existsSync(paths.ASAR_PATH)) {
            throw new Error(`app.asar not found at ${paths.ASAR_PATH}`);
        }

        logger.step(2, 5, "Creating backup of app.asar...");
        Patcher.backupAsar(paths.ASAR_PATH, paths.ASAR_BACKUP_PATH);

        const tempExtractDir = fs.mkdtempSync(path.join(os.tmpdir(), "agy-patch-"));
        logger.step(3, 5, `Extracting ASAR to temporary workspace...`);
        execSync(`npx @electron/asar extract "${paths.ASAR_BACKUP_PATH}" "${tempExtractDir}"`, { stdio: "pipe" });

        logger.step(4, 5, "Injecting Account Switcher components...");

        // Copy accountManager to both dist/ and dist/core/ to ensure all require paths resolve
        const managerSrc = path.join(__dirname, "../core/accountManager.js");
        const managerDest = path.join(tempExtractDir, "dist/accountManager.js");
        fs.copyFileSync(managerSrc, managerDest);

        const coreDir = path.join(tempExtractDir, "dist/core");
        if (!fs.existsSync(coreDir)) fs.mkdirSync(coreDir, { recursive: true });
        fs.copyFileSync(managerSrc, path.join(coreDir, "accountManager.js"));

        // Copy ipcHandlers
        const ipcSrc = path.join(__dirname, "../ipc/ipcHandlers.js");
        const ipcDest = path.join(tempExtractDir, "dist/accountIpcHandlers.js");
        fs.copyFileSync(ipcSrc, ipcDest);

        // Patch main.js
        const mainJsPath = path.join(tempExtractDir, "dist/main.js");
        let mainContent = fs.readFileSync(mainJsPath, "utf-8");
        if (!mainContent.includes("accountIpcHandlers")) {
            mainContent += `\n\ntry { const { registerAccountIpcHandlers } = require("./accountIpcHandlers"); registerAccountIpcHandlers(electron_1.ipcMain); } catch (e) { console.error("[AccountSwitcher] IPC registration failed:", e); }\n`;
            fs.writeFileSync(mainJsPath, mainContent, "utf-8");
        }

        // Patch preload.js
        const preloadPath = path.join(tempExtractDir, "dist/preload.js");
        let preloadContent = fs.readFileSync(preloadPath, "utf-8");
        const uiSrcPath = path.join(__dirname, "../ui/accountSwitcherUi.js");
        const uiContent = fs.readFileSync(uiSrcPath, "utf-8");

        if (!preloadContent.includes("initAccountSwitcherUi")) {
            preloadContent += `\n\n${uiContent}\n\ntry { initAccountSwitcherUi(); } catch (e) { console.error("[AccountSwitcher] UI init failed:", e); }\n`;
            fs.writeFileSync(preloadPath, preloadContent, "utf-8");
        }

        logger.step(5, 5, "Repacking ASAR and applying patch...");
        const newAsar = path.join(os.tmpdir(), "app_patched.asar");
        execSync(`npx @electron/asar pack "${tempExtractDir}" "${newAsar}" --unpack "**/node_modules/chrome-devtools-mcp/**"`, {
            stdio: "pipe"
        });

        // Atomic replacement via temporary file to avoid partial writes or EPERM
        const tempDest = paths.ASAR_PATH + ".tmp." + Date.now();
        safeCopy(newAsar, tempDest);
        try {
            fs.renameSync(tempDest, paths.ASAR_PATH);
        } catch (renameErr) {
            execSync(`mv -f "${tempDest}" "${paths.ASAR_PATH}"`, { stdio: "pipe" });
        }

        const newUnpacked = newAsar + ".unpacked";
        const destUnpacked = paths.ASAR_PATH + ".unpacked";
        if (fs.existsSync(newUnpacked)) {
            if (!fs.existsSync(destUnpacked)) {
                fs.mkdirSync(destUnpacked, { recursive: true });
            }
            fs.cpSync(newUnpacked, destUnpacked, { recursive: true });
            fs.rmSync(newUnpacked, { recursive: true, force: true });
        }

        // Re-sign only outer app bundle preserving entitlements and runtime flags (NO --deep to preserve Helper JIT)
        try {
            execSync(`codesign --force --sign - --preserve-metadata=identifier,entitlements,flags,runtime "${paths.APP_PATH}"`, { stdio: "ignore" });
        } catch (e) {}

        // Remove Gatekeeper quarantine and provenance flags
        try {
            execSync(`xattr -cr "${paths.APP_PATH}" 2>/dev/null || true`, { stdio: "ignore" });
        } catch (e) {}

        // Clean up
        fs.rmSync(tempExtractDir, { recursive: true, force: true });
        if (fs.existsSync(newAsar)) fs.unlinkSync(newAsar);

        logger.success("Patch applied successfully!");
    }
}

if (require.main === module) {
    try {
        Patcher.run();
    } catch (err) {
        logger.error(err.message);
        process.exit(1);
    }
}

module.exports = Patcher;
