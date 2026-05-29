"use strict";
Object.defineProperty(exports, "__esModule", { value: true });
exports.initAccountSwitcherUi = initAccountSwitcherUi;

function initAccountSwitcherUi() {
    if (typeof window === "undefined" || typeof document === "undefined") return;

    const ipcRenderer = typeof electron_1 !== "undefined" ? electron_1.ipcRenderer : require("electron").ipcRenderer;
    let currentAccountsData = null;
    let activeDropdown = null;

    async function loadAccounts() {
        try {
            currentAccountsData = await ipcRenderer.invoke("accounts:list");
            return currentAccountsData;
        } catch (e) {
            console.error("[AccountSwitcher] Failed to list accounts:", e);
            return null;
        }
    }

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

        const activeAcc = currentAccountsData?.accounts?.find(a => a.isActive) || currentAccountsData?.accounts?.[0];
        const labelText = activeAcc ? (activeAcc.label || activeAcc.email || "Account") : "Account";

        btn.innerHTML = renderButtonContent(activeAcc, labelText, false);

        btn.addEventListener("click", (e) => {
            e.stopPropagation();
            e.preventDefault();
            toggleDropdown(btn);
        });

        wrapper.appendChild(btn);
        modelWrapper.after(wrapper);
    }

    function renderButtonContent(activeAcc, labelText, isOpen) {
        let avatarHtml = "";
        if (activeAcc && activeAcc.picture) {
            avatarHtml = `<img src="${activeAcc.picture}" class="w-4 h-4 rounded-full object-cover shrink-0" alt="avatar" />`;
        } else {
            avatarHtml = `<svg xmlns="http://www.w3.org/2000/svg" width="13" height="13" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-secondary-foreground shrink-0 opacity-80"><path d="M19 21v-2a4 4 0 0 0-4-4H9a4 4 0 0 0-4 4v2"/><circle cx="12" cy="7" r="4"/></svg>`;
        }

        return `
            ${avatarHtml}
            <span class="min-w-0 select-none overflow-hidden text-ellipsis whitespace-nowrap text-xs text-secondary-foreground font-medium">${escapeHtml(labelText)}</span>
            <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 -960 960 960" fill="currentColor" class="text-secondary-foreground shrink-0 opacity-70 transition-transform duration-150 ${isOpen ? "rotate-180" : ""}">
                <path d="M480-345 240-585l56-56 184 184 184-184 56 56-240 240Z"/>
            </svg>
        `;
    }

    function toggleDropdown(anchorBtn) {
        if (activeDropdown) {
            closeDropdown();
            return;
        }
        renderDropdown(anchorBtn);
    }

    function closeDropdown() {
        if (activeDropdown) {
            activeDropdown.remove();
            activeDropdown = null;
            updateTriggerLabel(false);
        }
    }

    async function renderDropdown(anchorBtn) {
        closeDropdown();
        await loadAccounts();
        updateTriggerLabel(true);

        const dropdown = document.createElement("div");
        dropdown.id = "agy-account-switcher-dropdown";
        dropdown.className = "fixed bg-card text-foreground rounded-lg border border-border shadow-md outline-none no-focus-ring min-w-64 max-w-80 !w-max p-1 flex flex-col gap-px scrollbar-none animate-slideIn z-[999999]";

        showListView(dropdown, anchorBtn);

        document.body.appendChild(dropdown);
        positionDropdown(dropdown, anchorBtn);

        activeDropdown = dropdown;
    }

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

    function showSwitchingOverlay(account) {
        closeDropdown();
        const existing = document.querySelector("#agy-switching-overlay");
        if (existing) existing.remove();

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
            <div class="text-sm font-semibold">${escapeHtml(account.label || account.name || "Gemini Account")}</div>
            <div class="text-xs opacity-60 mt-0.5">${escapeHtml(account.email || "")}</div>
            <div class="agy-loader">
                <div></div><div></div><div></div>
            </div>
            <div class="text-[12px] opacity-60 mt-2.5 tracking-wide font-normal">Switching account...</div>
        `;
        document.body.appendChild(overlay);
    }

    function showListView(dropdown, anchorBtn) {
        const accounts = currentAccountsData?.accounts || [];

        let accountsListHtml = "";
        if (accounts.length === 0) {
            accountsListHtml = `<div class="px-3 py-2 text-xs text-muted-foreground text-center">No accounts saved yet</div>`;
        } else {
            accountsListHtml = accounts.map(acc => {
                const isActive = acc.isActive;
                const avatar = acc.picture
                    ? `<img src="${acc.picture}" class="w-5 h-5 rounded-full object-cover shrink-0" alt="avatar" />`
                    : `<div class="w-5 h-5 rounded-full bg-secondary text-secondary-foreground flex items-center justify-center text-[10px] font-semibold shrink-0">${(acc.label || acc.email || "U")[0].toUpperCase()}</div>`;

                const editBtn = `
                    <button type="button" class="agy-edit-btn p-1 hover:bg-background/80 rounded transition-colors text-muted-foreground hover:text-foreground shrink-0 cursor-pointer" title="Rename account" data-edit-id="${escapeHtml(acc.id)}" data-current-name="${escapeHtml(acc.label || acc.name || acc.email)}">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round"><path d="M11 4H4a2 2 0 0 0-2 2v14a2 2 0 0 0 2 2h14a2 2 0 0 0 2-2v-7"/><path d="M18.5 2.5a2.121 2.121 0 0 1 3 3L12 15l-4 1 1-4 9.5-9.5z"/></svg>
                    </button>
                `;

                const deleteBtn = !isActive
                    ? `
                    <button type="button" class="agy-remove-btn p-1 hover:bg-destructive/15 hover:text-destructive rounded transition-colors text-muted-foreground shrink-0 cursor-pointer" title="Remove account" data-remove-id="${escapeHtml(acc.id)}">
                        <svg width="12" height="12" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><polyline points="3 6 5 6 21 6"></polyline><path d="M19 6v14a2 2 0 0 1-2 2H7a2 2 0 0 1-2-2V6m3 0V4a2 2 0 0 1 2-2h4a2 2 0 0 1 2 2v2"></path></svg>
                    </button>
                    `
                    : "";

                return `
                    <div class="w-full px-2 py-1 text-left text-[13px] cursor-pointer outline-none no-focus-ring transition-colors select-none flex items-center gap-1.5 rounded-md hover:bg-secondary focus:bg-secondary focus:text-foreground group justify-between ${isActive ? "text-foreground font-medium" : "text-secondary-foreground"}" data-account-id="${escapeHtml(acc.id)}">
                        <div class="flex items-center gap-2 min-w-0 flex-1 truncate">
                            ${avatar}
                            <div class="flex flex-col min-w-0 flex-1">
                                <span class="truncate text-xs ${isActive ? "font-medium text-foreground" : "text-secondary-foreground"}">${escapeHtml(acc.label || acc.name || acc.email)}</span>
                                <span class="truncate text-[10px] text-muted-foreground leading-tight">${escapeHtml(acc.email)}</span>
                            </div>
                        </div>
                        <div class="flex items-center gap-1 shrink-0 ml-auto">
                            <div class="items-center gap-0.5 hidden group-hover:flex">
                                ${editBtn}
                                ${deleteBtn}
                            </div>
                            <div class="w-4 h-4 flex items-center justify-center shrink-0">
                                ${isActive ? `
                                <span class="flex shrink-0 text-foreground">
                                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 -960 960 960" fill="currentColor"><path d="M382-253.85L168.62-467.23L211.38-510L382-339.38L748.62-706l42.77,42.77L382-253.85Z"></path></svg>
                                </span>
                                ` : ''}
                            </div>
                        </div>
                    </div>
                `;
            }).join("");
        }

        dropdown.innerHTML = `
            <div class="px-2 py-1 text-xs text-muted-foreground font-medium select-none">Account</div>
            <div class="flex flex-col gap-px max-h-60 overflow-y-auto" id="agy-accounts-list-container">
                ${accountsListHtml}
            </div>
            <div data-orientation="horizontal" role="separator" aria-orientation="horizontal" class="h-px bg-border my-1 -mx-1"></div>
            <div id="agy-add-account-btn" class="w-full px-2 py-1 text-left text-[13px] cursor-pointer outline-none no-focus-ring transition-colors select-none flex items-center gap-1.5 rounded-md hover:bg-secondary focus:bg-secondary focus:text-foreground group text-secondary-foreground justify-between">
                <div class="flex items-center gap-2 min-w-0 flex-1">
                    <svg xmlns="http://www.w3.org/2000/svg" width="15" height="15" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2" stroke-linecap="round" stroke-linejoin="round" class="text-secondary-foreground shrink-0"><path d="M16 21v-2a4 4 0 0 0-4-4H5a4 4 0 0 0-4 4v2"/><circle cx="8.5" cy="7" r="4"/><line x1="20" y1="8" x2="20" y2="14"/><line x1="23" y1="11" x2="17" y2="11"/></svg>
                    <span class="text-xs">Add Account</span>
                </div>
                <div class="w-4 h-4 flex items-center justify-center shrink-0 opacity-50">
                    <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 -960 960 960" fill="currentColor"><path d="M517.85-480l-184-184L376-706.15L602.15-480L376-253.85L333.85-296l184-184Z"></path></svg>
                </div>
            </div>
        `;

        dropdown.querySelectorAll("[data-account-id]").forEach(item => {
            item.addEventListener("click", async (e) => {
                if (e.target.closest(".agy-remove-btn") || e.target.closest(".agy-edit-btn")) return;
                const accId = item.getAttribute("data-account-id");
                const targetAccount = accounts.find(a => a.id === accId);
                if (accId && targetAccount) {
                    showSwitchingOverlay(targetAccount);
                    try {
                        await ipcRenderer.invoke("accounts:switch", accId);
                    } catch (err) {
                        alert("Failed to switch account: " + err.message);
                        const ov = document.querySelector("#agy-switching-overlay");
                        if (ov) ov.remove();
                    }
                }
            });
        });

        dropdown.querySelectorAll(".agy-edit-btn").forEach(btn => {
            btn.addEventListener("click", (e) => {
                e.stopPropagation();
                const accId = btn.getAttribute("data-edit-id");
                const currentName = btn.getAttribute("data-current-name");
                showRenameView(dropdown, anchorBtn, accId, currentName);
            });
        });

        dropdown.querySelectorAll(".agy-remove-btn").forEach(btn => {
            btn.addEventListener("click", async (e) => {
                e.stopPropagation();
                const removeId = btn.getAttribute("data-remove-id");
                if (confirm(`Remove account "${removeId}"?`)) {
                    await ipcRenderer.invoke("accounts:remove", removeId);
                    await loadAccounts();
                    showListView(dropdown, anchorBtn);
                    updateTriggerLabel(true);
                }
            });
        });

        const addBtn = dropdown.querySelector("#agy-add-account-btn");
        addBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            showAddView(dropdown, anchorBtn);
        });
    }

    function showRenameView(dropdown, anchorBtn, accountId, currentName) {
        dropdown.innerHTML = `
            <div id="agy-back-btn" class="flex items-center gap-1.5 px-2 py-1 cursor-pointer text-muted-foreground hover:text-foreground text-xs font-medium mb-1 transition-colors select-none rounded-md hover:bg-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 -960 960 960" fill="currentColor"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/></svg>
                <span>Back to accounts</span>
            </div>
            <div class="px-2 pb-2 flex flex-col gap-2.5">
                <div class="text-xs font-medium text-foreground">Rename Account</div>
                <input id="agy-rename-input" type="text" value="${escapeHtml(currentName)}" placeholder="Account Name" class="w-full px-2.5 py-1.5 text-xs rounded-md border border-border bg-background text-foreground outline-none focus:border-foreground/50 transition-colors" />
                <div class="flex items-center justify-end gap-1.5 pt-0.5">
                    <button type="button" id="agy-cancel-rename-btn" class="px-2.5 py-1 text-xs rounded-md hover:bg-secondary text-muted-foreground transition-colors cursor-pointer">Cancel</button>
                    <button type="button" id="agy-confirm-rename-btn" class="py-1 px-3 text-xs font-medium rounded-md bg-secondary hover:bg-secondary/80 text-foreground flex items-center justify-center transition-colors cursor-pointer border border-border/40 shadow-sm">Save</button>
                </div>
            </div>
        `;

        const backBtn = dropdown.querySelector("#agy-back-btn");
        const cancelBtn = dropdown.querySelector("#agy-cancel-rename-btn");
        const saveBtn = dropdown.querySelector("#agy-confirm-rename-btn");
        const input = dropdown.querySelector("#agy-rename-input");

        input.focus();
        input.select();

        const goBack = () => showListView(dropdown, anchorBtn);
        backBtn.addEventListener("click", (e) => { e.stopPropagation(); goBack(); });
        cancelBtn.addEventListener("click", (e) => { e.stopPropagation(); goBack(); });

        const handleSave = async (e) => {
            if (e) e.stopPropagation();
            const newName = input.value.trim();
            if (!newName) return;
            saveBtn.disabled = true;
            saveBtn.innerText = "Saving...";
            try {
                await ipcRenderer.invoke("accounts:rename", accountId, newName);
                await loadAccounts();
                showListView(dropdown, anchorBtn);
                updateTriggerLabel(true);
            } catch (err) {
                alert("Failed to rename: " + err.message);
                saveBtn.disabled = false;
                saveBtn.innerText = "Save";
            }
        };

        saveBtn.addEventListener("click", handleSave);
        input.addEventListener("keydown", (e) => {
            if (e.key === "Enter") handleSave(e);
            if (e.key === "Escape") goBack();
        });
    }

    function showAddView(dropdown, anchorBtn) {
        dropdown.innerHTML = `
            <div id="agy-back-btn" class="flex items-center gap-1.5 px-2 py-1 cursor-pointer text-muted-foreground hover:text-foreground text-xs font-medium mb-1 transition-colors select-none rounded-md hover:bg-secondary">
                <svg xmlns="http://www.w3.org/2000/svg" width="14" height="14" viewBox="0 -960 960 960" fill="currentColor"><path d="m313-440 224 224-57 56-320-320 320-320 57 56-224 224h487v80H313Z"/></svg>
                <span>Back to accounts</span>
            </div>
            <div class="px-2 pb-2 flex flex-col gap-2.5">
                <input id="agy-new-acc-label" type="text" placeholder="Account Name (e.g. Work, Secondary)" class="w-full px-2.5 py-1.5 text-xs rounded-md border border-border bg-background text-foreground outline-none focus:border-foreground/50 placeholder:text-muted-foreground transition-colors" />
                <button type="button" id="agy-confirm-add-btn" class="w-full py-1.5 px-3 text-xs font-medium rounded-md bg-secondary hover:bg-secondary/80 text-foreground flex items-center justify-center gap-2 transition-colors cursor-pointer border border-border/40 shadow-sm">
                    <svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg>
                    <span>Sign in with Google</span>
                </button>
            </div>
        `;

        const backBtn = dropdown.querySelector("#agy-back-btn");
        const confirmAddBtn = dropdown.querySelector("#agy-confirm-add-btn");
        const newAccInput = dropdown.querySelector("#agy-new-acc-label");

        newAccInput.focus();

        backBtn.addEventListener("click", (e) => {
            e.stopPropagation();
            showListView(dropdown, anchorBtn);
        });

        confirmAddBtn.addEventListener("click", async (e) => {
            e.stopPropagation();
            const label = newAccInput.value.trim() || "Gemini Account";
            confirmAddBtn.disabled = true;
            confirmAddBtn.innerText = "Opening login...";
            try {
                await ipcRenderer.invoke("accounts:add", label);
                closeDropdown();
            } catch (err) {
                alert("Failed to initiate login: " + err.message);
                confirmAddBtn.disabled = false;
                confirmAddBtn.innerHTML = `<svg width="14" height="14" viewBox="0 0 24 24" fill="none" stroke="currentColor" stroke-width="2"><path d="M15 3h4a2 2 0 0 1 2 2v14a2 2 0 0 1-2 2h-4"/><polyline points="10 17 15 12 10 7"/><line x1="15" y1="12" x2="3" y2="12"/></svg><span>Sign in with Google</span>`;
            }
        });
    }

    function updateTriggerLabel(isOpen) {
        const btn = document.querySelector("#agy-account-switcher-trigger");
        if (!btn || !currentAccountsData) return;
        const activeAcc = currentAccountsData?.accounts?.find(a => a.isActive) || currentAccountsData?.accounts?.[0];
        const labelText = activeAcc ? (activeAcc.label || activeAcc.email || "Account") : "Account";
        btn.innerHTML = renderButtonContent(activeAcc, labelText, isOpen ?? (activeDropdown !== null));
    }

    function escapeHtml(str) {
        if (!str) return "";
        return String(str)
            .replace(/&/g, "&amp;")
            .replace(/</g, "&lt;")
            .replace(/>/g, "&gt;")
            .replace(/"/g, "&quot;")
            .replace(/\x27/g, "&#39;");
    }

    document.addEventListener("click", (e) => {
        if (activeDropdown && !activeDropdown.contains(e.target) && !e.target.closest("#agy-account-switcher-trigger")) {
            closeDropdown();
        }
    });

    function scanAndMount() {
        const modelBtn = document.querySelector('[data-testid="model-selector-trigger"]');
        if (!modelBtn) return;
        const modelWrapper = modelBtn.closest(".no-focus-agent-input") || modelBtn.parentElement;
        const row = modelWrapper?.parentElement;
        if (!row) return;

        createSwitcherButton(row, modelWrapper);
    }

    loadAccounts().then(() => {
        scanAndMount();
        updateTriggerLabel(false);
    });

    const observer = new MutationObserver(() => {
        scanAndMount();
    });

    if (document.body) {
        observer.observe(document.body, { childList: true, subtree: true });
    } else {
        window.addEventListener("DOMContentLoaded", () => {
            observer.observe(document.body, { childList: true, subtree: true });
            scanAndMount();
            updateTriggerLabel(false);
        });
    }
}
