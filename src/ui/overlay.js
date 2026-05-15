"use strict";

function createSwitchingOverlay(account) {
    const isDark = document.documentElement.classList.contains("dark") || 
                   document.documentElement.style.colorScheme === "dark" ||
                   (window.matchMedia && window.matchMedia("(prefers-color-scheme: dark)").matches);
    const bgColor = isDark ? "#131313" : "#FAFAFA";
    const fgColor = isDark ? "#FAFAFA" : "#1f1f1f";

    const overlay = document.createElement("div");
    overlay.id = "agy-switching-overlay";
    overlay.className = "fixed inset-0 z-[99999999] flex flex-col items-center justify-center select-none";
    overlay.style.backgroundColor = bgColor;
    overlay.style.color = fgColor;
    overlay.style.opacity = "1";
    overlay.style.backdropFilter = "none";
    overlay.style.webkitBackdropFilter = "none";
    overlay.style.isolation = "isolate";

    return overlay;
}

module.exports = { createSwitchingOverlay };
