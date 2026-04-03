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
        } else {
            logger.info(`Backup already exists at ${backupPath}`);
        }
    }

    static unpackAsar(asarPath, destDir) {
        logger.info(`Unpacking ${asarPath} to ${destDir}...`);
        execSync(`npx @electron/asar extract "${asarPath}" "${destDir}"`, { stdio: "inherit" });
    }
}

module.exports = Patcher;
