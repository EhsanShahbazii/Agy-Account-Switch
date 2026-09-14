"use strict";
const fs = require("fs");
const { execSync } = require("child_process");
const paths = require("../utils/paths");
const logger = require("../utils/logger");

class Unpatcher {
    static restore(backupPath = paths.ASAR_BACKUP_PATH, asarPath = paths.ASAR_PATH) {
        if (!fs.existsSync(backupPath)) {
            throw new Error(`Backup file not found at ${backupPath}`);
        }
        logger.info(`Restoring original app.asar from ${backupPath}...`);

        const tmpDest = asarPath + ".tmp." + Date.now();
        let copied = false;
        try {
            fs.copyFileSync(backupPath, tmpDest);
            copied = true;
        } catch (e) {}
        if (!copied) {
            try {
                fs.writeFileSync(tmpDest, fs.readFileSync(backupPath));
                copied = true;
            } catch (e2) {}
        }
        if (!copied) {
            try {
                execSync(`cp -f "${backupPath}" "${tmpDest}"`, { stdio: "pipe" });
                copied = true;
            } catch (e3) {
                try {
                    execSync(`sudo cp -f "${backupPath}" "${tmpDest}"`, { stdio: "inherit" });
                    copied = true;
                } catch (e4) {
                    throw e3;
                }
            }
        }
        try {
            fs.renameSync(tmpDest, asarPath);
        } catch (renameErr) {
            try {
                execSync(`mv -f "${tmpDest}" "${asarPath}"`, { stdio: "pipe" });
            } catch (mvErr) {
                execSync(`sudo mv -f "${tmpDest}" "${asarPath}"`, { stdio: "inherit" });
            }
        }

        try {
            execSync(`xattr -cr "${paths.APP_PATH}" 2>/dev/null || true`, { stdio: "ignore" });
        } catch (e) {}

        logger.success("Original Antigravity application restored successfully!");
    }
}

if (require.main === module) {
    try {
        Unpatcher.restore();
    } catch (err) {
        logger.error(err.message);
        process.exit(1);
    }
}

module.exports = Unpatcher;
