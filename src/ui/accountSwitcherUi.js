"use strict";

function initAccountSwitcherUi() {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    function createSwitcherButton(row, modelWrapper) {
        if (row.querySelector("#agy-account-switcher-wrapper")) return;

        const wrapper = document.createElement("div");
        wrapper.id = "agy-account-switcher-wrapper";
        wrapper.className = "min-w-0 no-focus-agent-input flex items-center";

        const btn = document.createElement("button");
        btn.type = "button";
        btn.id = "agy-account-switcher-trigger";
        btn.setAttribute("aria-label", "Switch Gemini Account");
        btn.className = "flex min-w-0 max-w-full cursor-pointer items-center h-7 gap-1.5 rounded-lg pr-1.5 pl-2 text-xs outline-none hover:bg-secondary transition-colors";
        btn.innerHTML = `<span class="text-xs font-medium">Account</span>`;

        wrapper.appendChild(btn);
        modelWrapper.after(wrapper);
    }

    function scanAndMount() {
        const modelBtn = document.querySelector('[data-testid="model-selector-trigger"]');
        if (!modelBtn) return;
        const modelWrapper = modelBtn.closest(".no-focus-agent-input") || modelBtn.parentElement;
        const row = modelWrapper?.parentElement;
        if (!row) return;
        createSwitcherButton(row, modelWrapper);
    }

    const observer = new MutationObserver(() => scanAndMount());
    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    }
}

module.exports = { initAccountSwitcherUi };
