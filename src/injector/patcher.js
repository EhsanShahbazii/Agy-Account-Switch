"use strict";
const { execSync } = require("child_process");
const fs = require("fs");
const paths = require("../utils/paths");
const logger = require("../utils/logger");

class Patcher {
    static unpackAsar(asarPath, destDir) {
        logger.info(`Unpacking ${asarPath} to ${destDir}...`);
        execSync(`npx @electron/asar extract "${asarPath}" "${destDir}"`, { stdio: "inherit" });
    }
}

module.exports = Patcher;
