"use strict";

function positionDropdown(dropdown, anchorBtn) {
    const rect = anchorBtn.getBoundingClientRect();
    dropdown.style.bottom = `${window.innerHeight - rect.top + 6}px`;
    dropdown.style.top = "auto";
    let left = rect.left;
    if (left + 280 > window.innerWidth - 10) {
        left = window.innerWidth - 290;
    }
    dropdown.style.left = `${Math.max(10, left)}px`;
}

module.exports = { positionDropdown };
