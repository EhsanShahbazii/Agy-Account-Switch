"use strict";

// Right side of item: actions (pencil/trash on hover) and checkmark (w-4 h-4) anchored at far right
function renderRightItemSlot(isActive, editBtn, deleteBtn, checkSvg) {
    return `
        <div class="flex items-center gap-1 shrink-0 ml-auto">
            <div class="items-center gap-0.5 hidden group-hover:flex">
                ${editBtn}
                ${deleteBtn}
            </div>
            <div class="w-4 h-4 flex items-center justify-center shrink-0">
                ${isActive ? `<span class="flex shrink-0 text-foreground">${checkSvg}</span>` : ''}
            </div>
        </div>
    `;
}

module.exports = { renderRightItemSlot };
