"use strict";
const assert = require("assert");
const test = require("node:test");
const { BUTTON_STYLES } = require("../src/ui/components");

test("UI constants and button styles are valid Tailwind strings", () => {
    assert.ok(BUTTON_STYLES.primarySecondary.includes("bg-secondary"));
    assert.ok(BUTTON_STYLES.cancel.includes("text-muted-foreground"));
    assert.ok(BUTTON_STYLES.fullWidthButton.includes("w-full"));
});
