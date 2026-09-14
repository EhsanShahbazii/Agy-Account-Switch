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
        try {
            fs.copyFileSync(backupPath, tmpDest);
        } catch (e) {
            try {
                fs.writeFileSync(tmpDest, fs.readFileSync(backupPath));
            } catch (e2) {
                execSync(`cp -f "${backupPath}" "${tmpDest}"`, { stdio: "pipe" });
            }
        }
        try {
            fs.renameSync(tmpDest, asarPath);
        } catch (renameErr) {
            execSync(`mv -f "${tmpDest}" "${asarPath}"`, { stdio: "pipe" });
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
