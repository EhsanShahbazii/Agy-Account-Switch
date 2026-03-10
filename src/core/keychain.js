"use strict";
const { execSync } = require("child_process");
const { KEYCHAIN_SERVICE, KEYCHAIN_ACCOUNT } = require("../utils/paths");

class KeychainHelper {
    static getPassword(service = KEYCHAIN_SERVICE, account = KEYCHAIN_ACCOUNT) {
        try {
            const out = execSync(`security find-generic-password -s "${service}" -a "${account}" -w`, {
                encoding: "utf-8",
                stdio: ["ignore", "pipe", "ignore"]
            });
            return out.trim();
        } catch (e) {
            return null;
        }
    }

    static setPassword(password, service = KEYCHAIN_SERVICE, account = KEYCHAIN_ACCOUNT) {
        try {
            execSync(`security add-generic-password -U -s "${service}" -a "${account}" -w "${password.replace(/"/g, '\\"')}"`, {
                stdio: "ignore"
            });
            return true;
        } catch (e) {
            return false;
        }
    }
}

module.exports = KeychainHelper;
