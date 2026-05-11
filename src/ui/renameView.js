"use strict";

function attachRenameKeyHandlers(input, onSave, onCancel) {
    input.addEventListener("keydown", (e) => {
        if (e.key === "Enter") {
            e.preventDefault();
            onSave();
        } else if (e.key === "Escape") {
            e.preventDefault();
            onCancel();
        }
    });
}

module.exports = { attachRenameKeyHandlers };
