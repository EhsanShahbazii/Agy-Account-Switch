"use strict";

function initAccountSwitcherUi() {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    let activeDropdown = null;

    function closeDropdown() {
        if (activeDropdown) {
            activeDropdown.remove();
            activeDropdown = null;
        }
    }

    document.addEventListener("click", (e) => {
        if (activeDropdown && !activeDropdown.contains(e.target) && !e.target.closest("#agy-account-switcher-trigger")) {
            closeDropdown();
        }
    });

    function renderDropdown(anchorBtn) {
        if (activeDropdown) { closeDropdown(); return; }
        const dropdown = document.createElement("div");
        dropdown.id = "agy-account-switcher-dropdown";
        dropdown.className = "fixed bg-card text-foreground rounded-xl border border-border shadow-xl min-w-[260px] p-2 z-[999999]";
        dropdown.innerHTML = `
            <div class="px-2 py-1 text-xs text-muted-foreground font-medium">Account</div>
            <div class="py-1">
                <div class="px-2 py-1.5 flex items-center gap-2 hover:bg-secondary rounded cursor-pointer">
                    <span class="text-xs font-medium">Main Account</span>
                </div>
            </div>
        `;
        document.body.appendChild(dropdown);
        activeDropdown = dropdown;
    }

    function createSwitcherButton(row, modelWrapper) {
        if (row.querySelector("#agy-account-switcher-wrapper")) return;
        const wrapper = document.createElement("div");
        wrapper.id = "agy-account-switcher-wrapper";
        wrapper.className = "min-w-0 no-focus-agent-input flex items-center";

        const btn = document.createElement("button");
        btn.type = "button";
        btn.id = "agy-account-switcher-trigger";
        btn.className = "flex min-w-0 max-w-full cursor-pointer items-center h-7 gap-1.5 rounded-lg pr-1.5 pl-2 text-xs outline-none hover:bg-secondary transition-colors";
        btn.innerHTML = `<span class="text-xs font-medium">Account</span>`;
        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            renderDropdown(btn);
        });

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
