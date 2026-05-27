#!/usr/bin/env node
"use strict";

const AccountManager = require("../src/core/accountManager");
const logger = require("../src/utils/logger");

const args = process.argv.slice(2);
const command = args[0] || "list";

async function main() {
    const mgr = new AccountManager();

    switch (command) {
        case "list":
        case "ls": {
            const { accounts, activeAccountId } = await mgr.listAccounts();
            if (accounts.length === 0) {
                logger.info("No accounts configured yet. Open Antigravity to add an account.");
                return;
            }
            console.log("\nAvailable Accounts:");
            accounts.forEach(a => {
                const mark = a.isActive ? "\x1b[32m✔ (active)\x1b[0m" : " ";
                console.log(`  [${a.id}] ${a.label || a.name || a.email} <${a.email || ""}> ${mark}`);
            });
            console.log("");
            break;
        }
        case "current": {
            const { accounts } = await mgr.listAccounts();
            const active = accounts.find(a => a.isActive);
            if (active) {
                console.log(`Active: ${active.label || active.name || active.email} (${active.email})`);
            } else {
                console.log("No active account set.");
            }
            break;
        }
        case "switch": {
            const id = args[1];
            if (!id) {
                logger.error("Usage: agy-switch switch <accountId>");
                process.exit(1);
            }
            await mgr.switchAccount(id);
            logger.success(`Switched active account to: ${id}`);
            break;
        }
        default:
            console.log(`
Antigravity Account Switcher CLI

Usage:
  agy-switch list              List all configured accounts
  agy-switch current           Show currently active account
  agy-switch switch <id>       Switch to a specific account
`);
            break;
    }
}

main().catch(err => {
    logger.error(err.message);
    process.exit(1);
});
