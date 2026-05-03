"use strict";

// Match Antigravity native menu classes:
// bg-card text-foreground rounded-lg border border-border shadow-md
function getDropdownContainerClasses() {
    return "fixed bg-card text-foreground rounded-lg border border-border shadow-md outline-none no-focus-ring min-w-64 max-w-80 !w-max p-1 flex flex-col gap-px scrollbar-none animate-slideIn z-[999999]";
}

module.exports = { getDropdownContainerClasses };
