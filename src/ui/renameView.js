"use strict";

function renderRenameView(currentName) {
    return `
        <div id="agy-back-btn" class="flex items-center gap-1.5 px-2 py-1 cursor-pointer text-muted-foreground hover:text-foreground text-xs font-medium mb-1 transition-colors select-none rounded-md hover:bg-secondary">
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 -960 960 960" fill="currentColor"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/></svg>
            <span>Back to accounts</span>
        </div>
        <div class="px-2 pb-2 flex flex-col gap-2.5">
            <div class="text-xs font-medium text-foreground">Rename Account</div>
            <input id="agy-rename-input" type="text" value="${currentName}" placeholder="Account Name" class="w-full px-2.5 py-1.5 text-xs rounded-md border border-border bg-background text-foreground outline-none focus:border-foreground/50 transition-colors" />
            <div class="flex items-center justify-end gap-1.5 pt-0.5">
                <button type="button" id="agy-cancel-rename-btn" class="px-2.5 py-1 text-xs rounded-md hover:bg-secondary text-muted-foreground transition-colors cursor-pointer">Cancel</button>
                <button type="button" id="agy-confirm-rename-btn" class="py-1 px-3 text-xs font-medium rounded-md bg-secondary hover:bg-secondary/80 text-foreground flex items-center justify-center transition-colors cursor-pointer border border-border/40 shadow-sm">Save</button>
            </div>
        </div>
    `;
}

module.exports = { renderRenameView };
