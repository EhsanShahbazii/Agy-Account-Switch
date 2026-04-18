"use strict";

function initAccountSwitcherUi() {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    function scanAndMount() {
        const modelBtn = document.querySelector('[data-testid="model-selector-trigger"]');
        if (!modelBtn) return;
        const modelWrapper = modelBtn.closest(".no-focus-agent-input") || modelBtn.parentElement;
        const row = modelWrapper?.parentElement;
        if (!row) return;
        console.log("[AccountSwitcher] Model row detected, ready to mount switcher.");
    }

    const observer = new MutationObserver(() => scanAndMount());
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    }
}

module.exports = { initAccountSwitcherUi };
