"use strict";
const path = require("path");
const os = require("os");

const HOME = os.homedir();
const APP_PATH = "/Applications/Antigravity.app";
const ASAR_PATH = path.join(APP_PATH, "Contents/Resources/app.asar");
const ASAR_BACKUP_PATH = path.join(APP_PATH, "Contents/Resources/app.asar.backup");

const GEMINI_DIR = path.join(HOME, ".gemini");
const ACCOUNTS_DIR = path.join(GEMINI_DIR, "accounts");
const MANIFEST_PATH = path.join(ACCOUNTS_DIR, "manifest.json");

const OAUTH_FILE = path.join(GEMINI_DIR, "jetski-standalone-oauth-token");
const GOOGLE_ACCOUNTS_FILE = path.join(GEMINI_DIR, "google_accounts.json");

const KEYCHAIN_SERVICE = "gemini";
const KEYCHAIN_ACCOUNT = "antigravity";

module.exports = {
    HOME,
    APP_PATH,
    ASAR_PATH,
    ASAR_BACKUP_PATH,
    GEMINI_DIR,
    ACCOUNTS_DIR,
    MANIFEST_PATH,
    OAUTH_FILE,
    GOOGLE_ACCOUNTS_FILE,
    KEYCHAIN_SERVICE,
    KEYCHAIN_ACCOUNT
};
