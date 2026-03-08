"use strict";

const colors = {
    reset: "\x1b[0m",
    bright: "\x1b[1m",
    dim: "\x1b[2m",
    cyan: "\x1b[36m",
    green: "\x1b[32m",
    yellow: "\x1b[33m",
    red: "\x1b[31m",
    magenta: "\x1b[35m"
};

const logger = {
    info: (msg, ...args) => console.log(`${colors.cyan}[INFO]${colors.reset} ${msg}`, ...args),
    success: (msg, ...args) => console.log(`${colors.green}[SUCCESS]${colors.reset} ${msg}`, ...args),
    warn: (msg, ...args) => console.warn(`${colors.yellow}[WARN]${colors.reset} ${msg}`, ...args),
    error: (msg, ...args) => console.error(`${colors.red}[ERROR]${colors.reset} ${msg}`, ...args),
    step: (step, total, msg) => console.log(`${colors.magenta}[${step}/${total}]${colors.reset} ${colors.bright}${msg}${colors.reset}`)
};

module.exports = logger;
