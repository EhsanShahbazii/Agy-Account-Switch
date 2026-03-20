"use strict";
const assert = require("assert");
const test = require("node:test");
const TokenHelper = require("../src/core/tokenHelper");

test("TokenHelper decodes valid JWT payload", () => {
    const payload = { email: "test@example.com", name: "Test User", picture: "https://avatar.com/p.jpg" };
    const encodedPayload = Buffer.from(JSON.stringify(payload)).toString("base64");
    const fakeJwt = `header.${encodedPayload}.signature`;

    const info = TokenHelper.extractAccountInfo(fakeJwt);
    assert.strictEqual(info.email, "test@example.com");
    assert.strictEqual(info.name, "Test User");
});

test("TokenHelper gracefully returns null on invalid input", () => {
    assert.strictEqual(TokenHelper.extractAccountInfo("invalid-token"), null);
    assert.strictEqual(TokenHelper.extractAccountInfo(null), null);
});
