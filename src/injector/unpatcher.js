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
        fs.copyFileSync(backupPath, asarPath);
        logger.info("Re-signing restored application...");
        execSync(`codesign --force --deep --sign - "${paths.APP_PATH}"`, { stdio: "inherit" });
        logger.success("Original Antigravity application restored successfully!");
    }
}

module.exports = Unpatcher;
