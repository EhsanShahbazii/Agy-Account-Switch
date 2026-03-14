"use strict";
const fs = require("fs");
const path = require("path");
const paths = require("../utils/paths");
const KeychainHelper = require("./keychain");

class AccountManager {
    constructor() {
        this.manifestPath = paths.MANIFEST_PATH;
        this.accountsDir = paths.ACCOUNTS_DIR;
    }
}

module.exports = AccountManager;
