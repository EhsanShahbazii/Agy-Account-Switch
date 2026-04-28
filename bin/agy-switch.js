#!/usr/bin/env node
"use strict";

const AccountManager = require("../src/core/accountManager");
const logger = require("../src/utils/logger");

const args = process.argv.slice(2);
const command = args[0] || "list";

async function main() {
    const mgr = new AccountManager();
    if (command === "list") {
        const { accounts } = await mgr.listAccounts();
        console.log("\nAntigravity Accounts:");
        accounts.forEach(a => {
            const mark = a.isActive ? "* " : "  ";
            console.log(`${mark}${a.label || a.email} (${a.email || "no-email"})`);
        });
        console.log("");
    } else if (command === "switch") {
        const id = args[1];
        if (!id) {
            logger.error("Usage: agy-switch switch <accountId>");
            process.exit(1);
        }
        await mgr.switchAccount(id);
        logger.success(`Switched active account to: ${id}`);
    } else {
        console.log("Usage: agy-switch [list|switch <id>]");
    }
}

main().catch(err => {
    logger.error(err.message);
    process.exit(1);
});
