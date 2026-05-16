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

    const avatarHtml = account.picture
        ? `<img src="${account.picture}" class="w-14 h-14 rounded-full object-cover shadow-sm mb-3.5" style="border: 2px solid ${isDark ? "#333" : "#eaeaea"};" alt="avatar" />`
        : `<div class="w-14 h-14 rounded-full flex items-center justify-center text-xl font-bold mb-3.5 shadow-sm" style="background-color: ${isDark ? "#262626" : "#eaeaea"}; color: ${fgColor};">${(account.label || account.email || "U")[0].toUpperCase()}</div>`;

    overlay.innerHTML = `
        <style>
            @keyframes agy-dot-pulse {
                0%, 100% { opacity: 0.2; transform: scale(0.85); }
                50% { opacity: 0.8; transform: scale(1.15); }
            }
            .agy-loader { display: flex; gap: 6px; margin-top: 14px; }
            .agy-loader div { width: 7px; height: 7px; border-radius: 50%; background-color: currentColor; opacity: 0.3; animation: agy-dot-pulse 1.4s infinite ease-in-out; }
            .agy-loader div:nth-child(1) { animation-delay: 0s; }
            .agy-loader div:nth-child(2) { animation-delay: 0.25s; }
            .agy-loader div:nth-child(3) { animation-delay: 0.5s; }
        </style>
        ${avatarHtml}
        <div class="text-sm font-semibold">${account.label || account.name || "Gemini Account"}</div>
        <div class="text-xs opacity-60 mt-0.5">${account.email || ""}</div>
        <div class="agy-loader">
            <div></div><div></div><div></div>
        </div>
        <div class="text-[12px] opacity-60 mt-2.5 tracking-wide font-normal">Switching account...</div>
    `;

    return overlay;
}

module.exports = { createSwitchingOverlay };
