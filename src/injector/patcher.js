"use strict";
const { execSync } = require("child_process");
const fs = require("fs");
const paths = require("../utils/paths");
const logger = require("../utils/logger");

class Patcher {
    static backupAsar(asarPath = paths.ASAR_PATH, backupPath = paths.ASAR_BACKUP_PATH) {
        if (!fs.existsSync(backupPath)) {
            logger.info(`Creating clean backup at ${backupPath}...`);
            fs.copyFileSync(asarPath, backupPath);
            logger.success("Backup successfully created.");
        }
    }

    static unpackAsar(asarPath, destDir) {
        execSync(`npx @electron/asar extract "${asarPath}" "${destDir}"`, { stdio: "inherit" });
    }

    static repackAsar(srcDir, destAsar) {
        execSync(`npx @electron/asar pack "${srcDir}" "${destAsar}" --unpack "**/node_modules/chrome-devtools-mcp/**"`, {
            stdio: "inherit"
        });
    }

    static resignApp(appPath = paths.APP_PATH) {
        logger.info(`Re-signing ${appPath} with ad-hoc signature...`);
        execSync(`codesign --force --deep --sign - "${appPath}"`, { stdio: "inherit" });
        logger.success("App re-signed successfully.");
    }
}

module.exports = Patcher;
